"""Project management endpoints — real database-backed CRUD.

Per NEXUS Tech Stack §27: /api/v1/projects — GET / POST / PATCH / DELETE
"""

from __future__ import annotations

from fastapi import APIRouter

from nexus.api.dependencies import DbSession
from nexus.schemas.project import (
    ProjectCreate,
    ProjectListResponse,
    ProjectResponse,
    ProjectUpdate,
)
from nexus.services.project_service import ProjectService

router = APIRouter()


@router.get("", response_model=ProjectListResponse)
async def list_projects(session: DbSession) -> ProjectListResponse:
    """List all registered project workspaces."""
    service = ProjectService(session)
    projects = await service.list_projects()
    return ProjectListResponse(projects=projects, total=len(projects))


@router.post("", response_model=ProjectResponse, status_code=201)
async def create_project(project: ProjectCreate, session: DbSession) -> ProjectResponse:
    """Register a new project workspace.

    Validates the project path exists and initializes workspace metadata.
    Auto-detects primary language and framework.
    """
    service = ProjectService(session)
    return await service.create_project(project)


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str, session: DbSession) -> ProjectResponse:
    """Get details for a specific project."""
    service = ProjectService(session)
    return await service.get_project(project_id)


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str, data: ProjectUpdate, session: DbSession
) -> ProjectResponse:
    """Update project metadata (name, description, status)."""
    service = ProjectService(session)
    return await service.update_project(project_id, data)


@router.delete("/{project_id}", status_code=204)
async def delete_project(project_id: str, session: DbSession) -> None:
    """Delete a project and all associated tasks."""
    service = ProjectService(session)
    await service.delete_project(project_id)
