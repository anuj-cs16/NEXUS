"""NEXUS Project Service — workspace lifecycle management.

Per Application Service Layer (Backend Architecture §9):
Validates workspace paths, initializes DB records, and manages
project CRUD operations.
"""

from __future__ import annotations

from pathlib import Path

import structlog
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from nexus.core.exceptions import ConflictError, NotFoundError, ValidationError
from nexus.models.project import Project
from nexus.models.task import Task
from nexus.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate

logger = structlog.get_logger(__name__)


class ProjectService:
    """Application service for project workspace management."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create_project(self, data: ProjectCreate) -> ProjectResponse:
        """Register a new project workspace.

        Validates:
        - Path exists on the filesystem
        - Path is not already registered
        """
        # Validate path exists
        project_path = Path(data.path).resolve()
        if not project_path.exists():
            raise ValidationError(
                f"Project path does not exist: {data.path}",
                path=str(project_path),
            )
        if not project_path.is_dir():
            raise ValidationError(
                f"Project path is not a directory: {data.path}",
                path=str(project_path),
            )

        # Check for duplicate path
        existing = await self.session.execute(
            select(Project).where(Project.root_path == str(project_path))
        )
        if existing.scalar_one_or_none() is not None:
            raise ConflictError(
                f"Project already registered at path: {project_path}",
                path=str(project_path),
            )

        # Detect language/framework from common config files
        language, framework = self._detect_project_type(project_path)

        # Create project record
        project = Project(
            name=data.name,
            root_path=str(project_path),
            description=data.description,
            language=language,
            framework=framework,
        )
        self.session.add(project)
        await self.session.flush()

        logger.info(
            "project.created",
            project_id=project.id,
            name=project.name,
            path=project.root_path,
            language=language,
            framework=framework,
        )

        return self._to_response(project, task_count=0)

    async def list_projects(self) -> list[ProjectResponse]:
        """List all registered projects with task counts."""
        result = await self.session.execute(
            select(Project).order_by(Project.created_at.desc())
        )
        projects = result.scalars().all()

        responses = []
        for project in projects:
            count_result = await self.session.execute(
                select(func.count()).select_from(Task).where(Task.project_id == project.id)
            )
            task_count = count_result.scalar() or 0
            responses.append(self._to_response(project, task_count=task_count))

        return responses

    async def get_project(self, project_id: str) -> ProjectResponse:
        """Get a single project by ID."""
        project = await self._get_or_404(project_id)
        count_result = await self.session.execute(
            select(func.count()).select_from(Task).where(Task.project_id == project.id)
        )
        task_count = count_result.scalar() or 0
        return self._to_response(project, task_count=task_count)

    async def update_project(self, project_id: str, data: ProjectUpdate) -> ProjectResponse:
        """Update project metadata."""
        project = await self._get_or_404(project_id)

        if data.name is not None:
            project.name = data.name
        if data.description is not None:
            project.description = data.description
        if data.status is not None:
            project.status = data.status

        await self.session.flush()
        logger.info("project.updated", project_id=project.id)

        count_result = await self.session.execute(
            select(func.count()).select_from(Task).where(Task.project_id == project.id)
        )
        task_count = count_result.scalar() or 0
        return self._to_response(project, task_count=task_count)

    async def delete_project(self, project_id: str) -> None:
        """Delete a project and all associated data."""
        project = await self._get_or_404(project_id)
        await self.session.delete(project)
        await self.session.flush()
        logger.info("project.deleted", project_id=project_id)

    async def _get_or_404(self, project_id: str) -> Project:
        """Fetch a project or raise NotFoundError."""
        result = await self.session.execute(
            select(Project).where(Project.id == project_id)
        )
        project = result.scalar_one_or_none()
        if project is None:
            raise NotFoundError(f"Project '{project_id}' not found", project_id=project_id)
        return project

    @staticmethod
    def _detect_project_type(path: Path) -> tuple[str | None, str | None]:
        """Detect primary language and framework from project files."""
        language = None
        framework = None

        if (path / "pyproject.toml").exists() or (path / "setup.py").exists():
            language = "python"
            if (path / "pyproject.toml").exists():
                try:
                    content = (path / "pyproject.toml").read_text(encoding="utf-8")
                    if "fastapi" in content.lower():
                        framework = "FastAPI"
                    elif "django" in content.lower():
                        framework = "Django"
                    elif "flask" in content.lower():
                        framework = "Flask"
                except OSError:
                    pass

        elif (path / "package.json").exists():
            language = "typescript"
            try:
                content = (path / "package.json").read_text(encoding="utf-8")
                if '"next"' in content:
                    framework = "Next.js"
                elif '"react"' in content:
                    framework = "React"
                elif '"vue"' in content:
                    framework = "Vue"
                elif '"svelte"' in content or '"@sveltejs"' in content:
                    framework = "Svelte"
            except OSError:
                pass

        elif (path / "Cargo.toml").exists():
            language = "rust"
        elif (path / "go.mod").exists():
            language = "go"
        elif (path / "pom.xml").exists() or (path / "build.gradle").exists():
            language = "java"

        return language, framework

    @staticmethod
    def _to_response(project: Project, *, task_count: int = 0) -> ProjectResponse:
        """Convert a Project model to a ProjectResponse schema."""
        return ProjectResponse(
            id=project.id,
            name=project.name,
            path=project.root_path,
            description=project.description,
            status=project.status,
            language=project.language,
            framework=project.framework,
            task_count=task_count,
            created_at=project.created_at,
            updated_at=project.updated_at,
        )
