"""NEXUS Task Service — task lifecycle orchestration.

Per Application Service Layer (Backend Architecture §9 & §13):
Manages task state machine transitions, enforces invariants,
and dispatches to the DAG orchestrator.
"""

from __future__ import annotations

import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from nexus.core.events import EventEnvelope, EventType
from nexus.core.event_bus import event_bus
from nexus.core.exceptions import NotFoundError, TaskStateError, ValidationError
from nexus.models.project import Project
from nexus.models.task import VALID_TASK_TRANSITIONS, Task, TaskStep
from nexus.schemas.task import TaskCreate, TaskDetailResponse, TaskListResponse, TaskResponse, TaskStepResponse

logger = structlog.get_logger(__name__)


class TaskService:
    """Application service for engineering task lifecycle."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create_task(self, project_id: str, data: TaskCreate) -> TaskResponse:
        """Create a new engineering task for a project.

        Validates:
        - Project exists
        - Project is in 'active' status
        """
        # Validate project exists
        result = await self.session.execute(
            select(Project).where(Project.id == project_id)
        )
        project = result.scalar_one_or_none()
        if project is None:
            raise NotFoundError(f"Project '{project_id}' not found", project_id=project_id)

        if project.status != "active":
            raise ValidationError(
                f"Cannot create task for {project.status} project",
                project_id=project_id,
                project_status=project.status,
            )

        # Create task
        task = Task(
            project_id=project_id,
            goal=data.goal,
            model=data.model,
            status="created",
        )
        self.session.add(task)
        await self.session.flush()

        logger.info(
            "task.created",
            task_id=task.id,
            project_id=project_id,
            goal=data.goal[:100],
        )

        # Emit task created event
        await event_bus.publish(
            EventEnvelope(
                event_type=EventType.TASK_CREATED,
                task_id=task.id,
                payload={"project_id": project_id, "goal": data.goal},
            )
        )

        return self._to_response(task)

    async def list_tasks(self, project_id: str) -> TaskListResponse:
        """List all tasks for a project."""
        result = await self.session.execute(
            select(Task)
            .where(Task.project_id == project_id)
            .order_by(Task.created_at.desc())
        )
        tasks = result.scalars().all()

        return TaskListResponse(
            tasks=[self._to_response(t) for t in tasks],
            total=len(tasks),
        )

    async def get_task(self, task_id: str) -> TaskResponse:
        """Get a single task by ID."""
        task = await self._get_or_404(task_id)
        return self._to_response(task)

    async def get_task_detail(self, task_id: str) -> TaskDetailResponse:
        """Get full task details including steps and tool executions."""
        task = await self._get_or_404(task_id)

        steps = []
        for step in task.steps:
            steps.append(
                TaskStepResponse(
                    id=step.id,
                    task_id=step.task_id,
                    agent_type=step.agent_type,
                    step_order=step.step_order,
                    status=step.status,
                    input_summary=step.input_summary,
                    output=step.output,
                    error=step.error,
                    tokens_used=step.tokens_used,
                    created_at=step.created_at,
                )
            )

        return TaskDetailResponse(
            task=self._to_response(task),
            steps=steps,
        )

    async def transition_task(self, task_id: str, new_status: str) -> TaskResponse:
        """Transition a task to a new status.

        Enforces the state machine invariants from Backend Architecture §13.

        Raises:
            TaskStateError: If the transition is invalid.
        """
        task = await self._get_or_404(task_id)

        # Validate transition
        allowed = VALID_TASK_TRANSITIONS.get(task.status, set())
        if new_status not in allowed:
            raise TaskStateError(
                f"Cannot transition task from '{task.status}' to '{new_status}'",
                task_id=task_id,
                current_status=task.status,
                requested_status=new_status,
                allowed_transitions=list(allowed),
            )

        old_status = task.status
        task.status = new_status
        await self.session.flush()

        logger.info(
            "task.transition",
            task_id=task_id,
            from_status=old_status,
            to_status=new_status,
        )

        # Emit appropriate event
        event_type_map = {
            "queued": EventType.TASK_STARTED,
            "completed": EventType.TASK_COMPLETED,
            "failed": EventType.TASK_FAILED,
        }
        if new_status in event_type_map:
            await event_bus.publish(
                EventEnvelope(
                    event_type=event_type_map[new_status],
                    task_id=task_id,
                    payload={"from_status": old_status, "to_status": new_status},
                )
            )

        return self._to_response(task)

    async def cancel_task(self, task_id: str) -> TaskResponse:
        """Cancel a running or pending task."""
        task = await self._get_or_404(task_id)

        terminal_states = {"completed", "failed", "cancelled"}
        if task.status in terminal_states:
            raise TaskStateError(
                f"Cannot cancel task in terminal state '{task.status}'",
                task_id=task_id,
                current_status=task.status,
            )

        task.status = "cancelled"
        await self.session.flush()

        logger.info("task.cancelled", task_id=task_id)

        return self._to_response(task)

    async def add_step(
        self,
        task_id: str,
        agent_type: str,
        *,
        step_order: int | None = None,
    ) -> TaskStep:
        """Add a new step to a task (used by orchestrator)."""
        task = await self._get_or_404(task_id)

        if step_order is None:
            step_order = len(task.steps)

        step = TaskStep(
            task_id=task_id,
            agent_type=agent_type,
            step_order=step_order,
            status="pending",
        )
        self.session.add(step)
        await self.session.flush()

        return step

    async def _get_or_404(self, task_id: str) -> Task:
        """Fetch a task or raise NotFoundError."""
        result = await self.session.execute(
            select(Task).where(Task.id == task_id)
        )
        task = result.scalar_one_or_none()
        if task is None:
            raise NotFoundError(f"Task '{task_id}' not found", task_id=task_id)
        return task

    @staticmethod
    def _to_response(task: Task, *, step_count: int = 0) -> TaskResponse:
        """Convert a Task model to a TaskResponse schema."""
        actual_count = step_count
        if "steps" in task.__dict__ and task.__dict__["steps"] is not None:
            actual_count = len(task.__dict__["steps"])
        return TaskResponse(
            id=task.id,
            project_id=task.project_id,
            goal=task.goal,
            status=task.status,
            branch_name=task.branch_name,
            model=task.model,
            debug_retries=task.debug_retries,
            summary=task.summary,
            error=task.error,
            step_count=actual_count,
            created_at=task.created_at,
            updated_at=task.updated_at,
        )
