"""NEXUS Audit model — immutable security and activity audit logs.

Per Security Architecture: all privileged operations, tool executions,
and state transitions are logged as immutable audit records.
"""

from __future__ import annotations

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from nexus.models.base import Base, PrefixedIdMixin, TimestampMixin, _generate_prefixed_id


class AuditLog(PrefixedIdMixin, TimestampMixin, Base):
    """Immutable audit log entry.

    Records security-relevant events: auth attempts, tool executions,
    state transitions, approval decisions, and error conditions.
    """

    __tablename__ = "audit_logs"

    # Category: auth, tool, task, approval, security, system
    category: Mapped[str] = mapped_column(String(30), nullable=False, index=True)

    # Action performed (e.g., "tool.execute", "task.transition", "auth.login")
    action: Mapped[str] = mapped_column(String(100), nullable=False, index=True)

    # Actor: "system", "user", or agent identifier
    actor: Mapped[str] = mapped_column(String(100), default="system", nullable=False)

    # Associated entity ID (project_id, task_id, etc.)
    entity_id: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)

    # Entity type (e.g., "project", "task", "tool_execution")
    entity_type: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # Human-readable summary
    summary: Mapped[str] = mapped_column(Text, nullable=False)

    # Structured details (JSON string)
    details: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Risk level of the action
    risk_level: Mapped[str | None] = mapped_column(String(20), nullable=True)

    # Outcome: success, failure, denied, timeout
    outcome: Mapped[str] = mapped_column(String(20), default="success", nullable=False)

    # Correlation ID for request tracing
    correlation_id: Mapped[str | None] = mapped_column(String(100), nullable=True)

    def __init__(self, **kwargs: object) -> None:
        if "id" not in kwargs:
            kwargs["id"] = _generate_prefixed_id("aud")
        super().__init__(**kwargs)

    def __repr__(self) -> str:
        return f"<AuditLog id={self.id!r} category={self.category!r} action={self.action!r}>"
