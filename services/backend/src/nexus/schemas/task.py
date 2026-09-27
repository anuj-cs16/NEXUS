"""Pydantic schemas for Task DTOs (request/response contracts)."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class TaskCreate(BaseModel):
    """Schema for creating a new engineering task."""

    goal: str = Field(..., min_length=1, max_length=10000, description="Natural language task description")
    model: str | None = Field(default=None, description="LLM model to use (defaults to configured model)")


class TaskResponse(BaseModel):
    """Schema for task response."""

    id: str
    project_id: str
    goal: str
    status: str
    branch_name: str | None = None
    model: str | None = None
    debug_retries: int = 0
    summary: str | None = None
    error: str | None = None
    step_count: int = 0
    created_at: datetime
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class TaskListResponse(BaseModel):
    """Schema for paginated task list response."""

    tasks: list[TaskResponse]
    total: int


class TaskStepResponse(BaseModel):
    """Schema for task step response."""

    id: str
    task_id: str
    agent_type: str
    step_order: int
    status: str
    input_summary: str | None = None
    output: str | None = None
    error: str | None = None
    tokens_used: int = 0
    created_at: datetime

    model_config = {"from_attributes": True}


class ToolExecutionResponse(BaseModel):
    """Schema for tool execution response."""

    id: str
    step_id: str
    tool_name: str
    risk_level: str
    status: str
    input_params: str | None = None
    output: str | None = None
    duration_ms: int | None = None
    approval_id: str | None = None
    error: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class TaskDetailResponse(BaseModel):
    """Schema for task with full step and tool execution details."""

    task: TaskResponse
    steps: list[TaskStepResponse] = []
