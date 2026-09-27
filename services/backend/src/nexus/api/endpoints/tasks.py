"""Task management endpoints — engineering task lifecycle.

Per NEXUS Tech Stack §27: /api/v1/projects/{project_id}/tasks
"""

from __future__ import annotations

from fastapi import APIRouter

from nexus.api.dependencies import DbSession
from nexus.schemas.task import (
    TaskCreate,
    TaskDetailResponse,
    TaskListResponse,
    TaskResponse,
)
from nexus.services.task_service import TaskService

router = APIRouter()


@router.get("", response_model=TaskListResponse)
async def list_tasks(project_id: str, session: DbSession) -> TaskListResponse:
    """List all tasks for a project."""
    service = TaskService(session)
    return await service.list_tasks(project_id)


@router.post("", response_model=TaskResponse, status_code=201)
async def create_task(
    project_id: str, task: TaskCreate, session: DbSession
) -> TaskResponse:
    """Create a new engineering task.

    Submits a natural language goal for the NEXUS agent pipeline.
    """
    service = TaskService(session)
    return await service.create_task(project_id, task)


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(task_id: str, session: DbSession) -> TaskResponse:
    """Get task summary by ID."""
    service = TaskService(session)
    return await service.get_task(task_id)


@router.get("/{task_id}/detail", response_model=TaskDetailResponse)
async def get_task_detail(task_id: str, session: DbSession) -> TaskDetailResponse:
    """Get full task details including steps and tool executions."""
    service = TaskService(session)
    return await service.get_task_detail(task_id)


@router.post("/{task_id}/run", response_model=TaskResponse)
async def run_task(
    project_id: str,
    task_id: str,
    session: DbSession,
) -> TaskResponse:
    """Launch the multi-agent pipeline for a task."""
    import asyncio
    from nexus.orchestration.engine import OrchestrationEngine
    from nexus.services.project_service import ProjectService

    task_service = TaskService(session)
    project_service = ProjectService(session)

    task = await task_service.get_task(task_id)
    project = await project_service.get_project(project_id)

    # Launch in background
    engine = OrchestrationEngine()
    asyncio.create_task(
        engine.run_task(
            task_id=task.id,
            project_id=project.id,
            workspace_path=project.path,
            goal=task.goal,
            model=task.model,
        )
    )

    return task


@router.post("/{task_id}/cancel", response_model=TaskResponse)
async def cancel_task(task_id: str, session: DbSession) -> TaskResponse:
    """Cancel a running or pending task."""
    service = TaskService(session)
    return await service.cancel_task(task_id)
