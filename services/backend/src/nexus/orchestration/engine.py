"""NEXUS Orchestration Engine — DAG workflow execution for multi-agent tasks.

Per DAG Orchestration Engine (Backend Architecture §13):
Executes the sequential agent workflow:
PLANNING -> EXECUTING -> TESTING -> [DEBUGGING] -> SECURITY_CHECK -> REVIEWING -> COMPLETED
"""

from __future__ import annotations

import asyncio
from pathlib import Path
from typing import Any

import structlog
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from nexus.agents.debugger import DebuggerAgent
from nexus.agents.developer import DeveloperAgent
from nexus.agents.planner import PlannerAgent
from nexus.agents.reviewer import ReviewerAgent
from nexus.agents.security import SecurityAgent
from nexus.agents.tester import TesterAgent
from nexus.ai.provider import ModelProvider
from nexus.core.event_bus import event_bus
from nexus.core.events import EventEnvelope, EventType
from nexus.models.base import async_session_factory
from nexus.models.task import Task, TaskStep
from nexus.orchestration.context import AgentContext
from nexus.orchestration.state import TaskExecutionState
from nexus.services.task_service import TaskService
from nexus.tools.registry import ToolRegistry

logger = structlog.get_logger(__name__)


class OrchestrationEngine:
    """Async engine for driving multi-agent task execution pipelines."""

    def __init__(
        self,
        session_factory: async_sessionmaker[AsyncSession] | None = None,
        provider: ModelProvider | None = None,
        registry: ToolRegistry | None = None,
    ) -> None:
        self.session_factory = session_factory or async_session_factory
        self.provider = provider
        self.registry = registry

        # Initialize agent pool
        self.planner = PlannerAgent(provider=self.provider, registry=self.registry)
        self.developer = DeveloperAgent(provider=self.provider, registry=self.registry)
        self.tester = TesterAgent(provider=self.provider, registry=self.registry)
        self.debugger = DebuggerAgent(provider=self.provider, registry=self.registry)
        self.security = SecurityAgent(provider=self.provider, registry=self.registry)
        self.reviewer = ReviewerAgent(provider=self.provider, registry=self.registry)

    async def run_task(
        self,
        task_id: str,
        project_id: str,
        workspace_path: str | Path,
        goal: str,
        *,
        model: str | None = None,
    ) -> TaskExecutionState:
        """Run the end-to-end multi-agent pipeline for a task."""
        ws_path = Path(workspace_path).resolve()
        state = TaskExecutionState(
            task_id=task_id,
            project_id=project_id,
            current_status="queued",
        )

        logger.info("orchestrator.pipeline_started", task_id=task_id, goal=goal[:100])

        context = AgentContext(
            task_id=task_id,
            project_id=project_id,
            workspace_path=ws_path,
            goal=goal,
            model=model,
        )

        try:
            # 1. Start pipeline & Transition to analyzing/planning
            await self._update_task_status(task_id, "analyzing")
            await self._update_task_status(task_id, "planning")
            state.active_agent = "planner"

            # Execute Planner
            plan_res = await self.planner.execute(context)
            await self._record_step(task_id, "planner", 1, plan_res.output, plan_res.error, plan_res.tokens_used)
            if not plan_res.success:
                raise RuntimeError(f"Planner failed: {plan_res.error}")
            state.plan = plan_res.output
            context.plan = plan_res.output

            # 2. Transition to executing
            await self._update_task_status(task_id, "executing")
            state.active_agent = "developer"

            # Execute Developer
            dev_res = await self.developer.execute(context)
            await self._record_step(task_id, "developer", 2, dev_res.output, dev_res.error, dev_res.tokens_used)
            if not dev_res.success:
                raise RuntimeError(f"Developer failed: {dev_res.error}")

            # 3. Transition to testing
            await self._update_task_status(task_id, "testing")
            state.active_agent = "tester"

            # Execute Tester
            test_res = await self.tester.execute(context)
            await self._record_step(task_id, "tester", 3, test_res.output, test_res.error, test_res.tokens_used)
            state.test_results = test_res.output
            context.test_results = test_res.output

            # 4. Debug loop if tests failed and retries available
            is_test_failing = "FAILED" in (test_res.output or "").upper() or "ERROR" in (test_res.output or "").upper()
            step_order = 4

            while is_test_failing and state.debug_retries < state.max_debug_retries:
                state.debug_retries += 1
                logger.info("orchestrator.debugging_cycle", retry=state.debug_retries, task_id=task_id)

                await self._update_task_status(task_id, "debugging")
                state.active_agent = "debugger"

                debug_res = await self.debugger.execute(context)
                await self._record_step(task_id, "debugger", step_order, debug_res.output, debug_res.error, debug_res.tokens_used)
                step_order += 1

                # Re-test
                await self._update_task_status(task_id, "testing")
                state.active_agent = "tester"
                test_res = await self.tester.execute(context)
                await self._record_step(task_id, "tester", step_order, test_res.output, test_res.error, test_res.tokens_used)
                step_order += 1

                state.test_results = test_res.output
                context.test_results = test_res.output
                is_test_failing = "FAILED" in (test_res.output or "").upper()

            # 5. Security audit
            await self._update_task_status(task_id, "security_check")
            state.active_agent = "security"

            sec_res = await self.security.execute(context)
            await self._record_step(task_id, "security", step_order, sec_res.output, sec_res.error, sec_res.tokens_used)
            step_order += 1
            state.security_report = sec_res.output
            context.security_report = sec_res.output

            # 6. Final Review
            await self._update_task_status(task_id, "reviewing")
            state.active_agent = "reviewer"

            rev_res = await self.reviewer.execute(context)
            await self._record_step(task_id, "reviewer", step_order, rev_res.output, rev_res.error, rev_res.tokens_used)
            state.review_summary = rev_res.output

            # 7. Complete Task
            await self._update_task_status(task_id, "completed", summary=rev_res.output)
            state.current_status = "completed"
            state.active_agent = None

            logger.info("orchestrator.pipeline_completed", task_id=task_id)

        except Exception as e:
            logger.exception("orchestrator.pipeline_failed", task_id=task_id)
            state.current_status = "failed"
            await self._update_task_status(task_id, "failed", error=str(e))

        return state

    async def _update_task_status(
        self,
        task_id: str,
        status: str,
        *,
        summary: str | None = None,
        error: str | None = None,
    ) -> None:
        """Update task record status in database."""
        async with self.session_factory() as session:
            service = TaskService(session)
            try:
                task = await service._get_or_404(task_id)
                task.status = status
                if summary:
                    task.summary = summary
                if error:
                    task.error = error
                await session.commit()
            except Exception:
                await session.rollback()
                logger.warning("orchestrator.status_update_failed", task_id=task_id, status=status)

    async def _record_step(
        self,
        task_id: str,
        agent_type: str,
        step_order: int,
        output: str,
        error: str | None,
        tokens: int,
    ) -> None:
        """Record step completion in database."""
        async with self.session_factory() as session:
            try:
                step = TaskStep(
                    task_id=task_id,
                    agent_type=agent_type,
                    step_order=step_order,
                    status="completed" if not error else "failed",
                    output=output,
                    error=error,
                    tokens_used=tokens,
                )
                session.add(step)
                await session.commit()
            except Exception:
                await session.rollback()
                logger.warning("orchestrator.step_record_failed", task_id=task_id, step=agent_type)
