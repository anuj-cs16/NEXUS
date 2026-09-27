"""NEXUS Approval Service — human-in-the-loop decision engine.

Per Human Approval Engine (Backend Architecture §16):
Handles approval creation, decision resolution (approved/rejected/modified),
and task unblocking.
"""

from __future__ import annotations

import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from nexus.core.event_bus import event_bus
from nexus.core.events import EventEnvelope, EventType
from nexus.core.exceptions import ConflictError, NotFoundError, ValidationError
from nexus.models.approval import Approval
from nexus.models.task import Task
from nexus.schemas.approval import ApprovalDecision, ApprovalResponse

logger = structlog.get_logger(__name__)


class ApprovalService:
    """Application service for managing human approval requests."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create_approval_request(
        self,
        task_id: str,
        *,
        agent_type: str,
        tool_name: str,
        risk_level: str,
        description: str,
        affected_resources: str | None = None,
    ) -> Approval:
        """Create a new pending approval record."""
        approval = Approval(
            task_id=task_id,
            agent_type=agent_type,
            tool_name=tool_name,
            risk_level=risk_level,
            description=description,
            affected_resources=affected_resources,
            status="pending",
        )
        self.session.add(approval)
        await self.session.flush()

        logger.info("approval.created", approval_id=approval.id, task_id=task_id, tool=tool_name)

        await event_bus.publish(
            EventEnvelope(
                event_type=EventType.APPROVAL_REQUIRED,
                task_id=task_id,
                agent_id=agent_type,
                payload={
                    "approval_id": approval.id,
                    "tool": tool_name,
                    "risk_level": risk_level,
                    "description": description,
                },
            )
        )

        return approval

    async def list_pending_approvals(self, task_id: str | None = None) -> list[ApprovalResponse]:
        """List all pending approval requests."""
        query = select(Approval).where(Approval.status == "pending")
        if task_id:
            query = query.where(Approval.task_id == task_id)

        result = await self.session.execute(query.order_by(Approval.created_at.asc()))
        approvals = result.scalars().all()
        return [self._to_response(a) for a in approvals]

    async def resolve_approval(
        self,
        approval_id: str,
        decision: ApprovalDecision,
    ) -> ApprovalResponse:
        """Resolve a pending approval with approved, rejected, or modified status."""
        result = await self.session.execute(
            select(Approval).where(Approval.id == approval_id)
        )
        approval = result.scalar_one_or_none()
        if not approval:
            raise NotFoundError(f"Approval request '{approval_id}' not found", approval_id=approval_id)

        if approval.status != "pending":
            raise ConflictError(
                f"Approval '{approval_id}' has already been resolved with status '{approval.status}'",
                approval_id=approval_id,
                status=approval.status,
            )

        res_status = decision.resolution_status
        approval.status = res_status
        approval.resolution_reason = decision.reason
        approval.modified_params = decision.modified_params
        await self.session.flush()

        logger.info(
            "approval.resolved",
            approval_id=approval.id,
            status=res_status,
            reason=decision.reason,
        )

        await event_bus.publish(
            EventEnvelope(
                event_type=EventType.APPROVAL_RESOLVED,
                task_id=approval.task_id,
                payload={
                    "approval_id": approval.id,
                    "status": res_status,
                    "reason": decision.reason,
                },
            )
        )

        return self._to_response(approval)

    @staticmethod
    def _to_response(approval: Approval) -> ApprovalResponse:
        return ApprovalResponse(
            id=approval.id,
            task_id=approval.task_id,
            agent_type=approval.agent_type,
            tool_name=approval.tool_name,
            risk_level=approval.risk_level,
            description=approval.description,
            affected_resources=approval.affected_resources,
            status=approval.status,
            resolution_reason=approval.resolution_reason,
            created_at=approval.created_at,
            updated_at=approval.updated_at,
        )
