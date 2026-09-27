"""NEXUS Approval model — human-in-the-loop decision records.

Per Human Approval Engine (Backend Architecture §16):
HIGH_RISK and CRITICAL tool executions require explicit user approval
before proceeding.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from nexus.models.base import Base, PrefixedIdMixin, TimestampMixin, _generate_prefixed_id

if TYPE_CHECKING:
    from nexus.models.task import Task


class Approval(PrefixedIdMixin, TimestampMixin, Base):
    """A human-in-the-loop approval request.

    Created when an agent attempts to execute a HIGH_RISK or CRITICAL tool.
    The task pauses until the user approves, rejects, or the timeout expires.
    """

    __tablename__ = "approvals"

    # Associated task
    task_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False
    )

    # Agent that requested the approval
    agent_type: Mapped[str] = mapped_column(String(30), nullable=False)

    # Tool being requested
    tool_name: Mapped[str] = mapped_column(String(100), nullable=False)

    # Risk level: high, critical
    risk_level: Mapped[str] = mapped_column(String(20), nullable=False)

    # Human-readable description of what the tool will do
    description: Mapped[str] = mapped_column(Text, nullable=False)

    # Resources affected (e.g., file paths, commands)
    affected_resources: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Status: pending, approved, rejected, timeout, modified
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)

    # User's rationale for approval/rejection
    resolution_reason: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Modified parameters (if user chose to modify before approving)
    modified_params: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    task: Mapped[Task] = relationship("Task", back_populates="approvals")

    def __init__(self, **kwargs: object) -> None:
        if "id" not in kwargs:
            kwargs["id"] = _generate_prefixed_id("apr")
        super().__init__(**kwargs)

    def __repr__(self) -> str:
        return f"<Approval id={self.id!r} tool={self.tool_name!r} status={self.status!r}>"
