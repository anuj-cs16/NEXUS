"""Pydantic schemas for Project DTOs (request/response contracts)."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class ProjectCreate(BaseModel):
    """Schema for creating a new project registration."""

    name: str = Field(..., min_length=1, max_length=255, description="Project display name")
    path: str = Field(..., min_length=1, description="Absolute filesystem path to project root")
    description: str = Field(default="", max_length=1000)


class ProjectUpdate(BaseModel):
    """Schema for updating project metadata."""

    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=1000)
    status: str | None = Field(default=None, pattern=r"^(active|archived)$")


class ProjectResponse(BaseModel):
    """Schema for project response."""

    id: str
    name: str
    path: str
    description: str
    status: str
    language: str | None = None
    framework: str | None = None
    task_count: int = 0
    created_at: datetime
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class ProjectListResponse(BaseModel):
    """Schema for paginated project list response."""

    projects: list[ProjectResponse]
    total: int
