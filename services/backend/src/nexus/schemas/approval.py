"""Pydantic schemas for Approval DTOs."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class ApprovalResponse(BaseModel):
    """Schema for approval response."""

    id: str
    task_id: str
    agent_type: str
    tool_name: str
    risk_level: str
    description: str
    affected_resources: str | None = None
    status: str
    resolution_reason: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ApprovalResolve(BaseModel):
    """Schema for resolving an approval request."""

    decision: str | None = Field(
        default=None,
        pattern=r"^(approved|rejected|modified)$",
        description="Resolution decision: approved, rejected, or modified",
    )
    status: str | None = Field(
        default=None,
        pattern=r"^(approved|rejected|modified)$",
        description="Alternative name for decision",
    )
    reason: str = Field(default="", max_length=1000, description="Rationale for the decision")
    modified_params: str | None = Field(
        default=None, description="Modified tool parameters (JSON) if decision is 'modified'"
    )

    @property
    def resolution_status(self) -> str:
        return self.decision or self.status or "approved"


ApprovalDecision = ApprovalResolve


class ApprovalListResponse(BaseModel):
    """Schema for approval list response."""

    approvals: list[ApprovalResponse]
    total: int
