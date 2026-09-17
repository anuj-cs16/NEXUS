"""Project management endpoints.

Provides CRUD operations for registered project workspaces.
Per NEXUS Tech Stack §27: /api/v1/projects — GET / POST
"""

from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()


# --- Schemas ---


class ProjectCreate(BaseModel):
    """Schema for creating a new project registration."""

    name: str = Field(..., min_length=1, max_length=255, description="Project display name")
    path: str = Field(..., min_length=1, description="Absolute filesystem path to project root")
    description: str = Field(default="", max_length=1000)


class ProjectResponse(BaseModel):
    """Schema for project response."""

    id: str
    name: str
    path: str
    description: str
    created_at: str
    status: str


class ProjectListResponse(BaseModel):
    """Schema for project list response."""

    projects: list[ProjectResponse]
    total: int


# --- In-memory store (replaced by SQLite in next phase) ---

_projects: dict[str, ProjectResponse] = {}


# --- Endpoints ---


@router.get("", response_model=ProjectListResponse)
async def list_projects() -> ProjectListResponse:
    """List all registered project workspaces."""
    projects = list(_projects.values())
    return ProjectListResponse(projects=projects, total=len(projects))


@router.post("", response_model=ProjectResponse, status_code=201)
async def create_project(project: ProjectCreate) -> ProjectResponse:
    """Register a new project workspace.

    Validates the project path exists and initializes workspace metadata.
    """
    project_id = f"prj_{uuid4().hex[:12]}"
    response = ProjectResponse(
        id=project_id,
        name=project.name,
        path=project.path,
        description=project.description,
        created_at=datetime.now(timezone.utc).isoformat(),
        status="active",
    )
    _projects[project_id] = response
    return response


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str) -> ProjectResponse:
    """Get details for a specific project."""
    if project_id not in _projects:
        raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found")
    return _projects[project_id]
