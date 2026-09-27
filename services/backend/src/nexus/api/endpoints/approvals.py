"""Approval management endpoints — human-in-the-loop decisions."""

from __future__ import annotations

from fastapi import APIRouter

from nexus.api.dependencies import DbSession
from nexus.schemas.approval import ApprovalDecision, ApprovalListResponse, ApprovalResponse
from nexus.services.approval_service import ApprovalService

router = APIRouter()


@router.get("", response_model=ApprovalListResponse)
async def list_pending_approvals(session: DbSession) -> ApprovalListResponse:
    """List all pending approval requests."""
    service = ApprovalService(session)
    approvals = await service.list_pending_approvals()
    return ApprovalListResponse(approvals=approvals, total=len(approvals))


@router.post("/{approval_id}/resolve", response_model=ApprovalResponse)
async def resolve_approval(
    approval_id: str,
    decision: ApprovalDecision,
    session: DbSession,
) -> ApprovalResponse:
    """Resolve a pending approval request (approve, reject, modify)."""
    service = ApprovalService(session)
    return await service.resolve_approval(approval_id, decision)
