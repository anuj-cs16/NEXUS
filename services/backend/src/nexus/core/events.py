"""NEXUS Event Envelope — standardized event system.

All internal communications follow a strictly typed JSON Event Envelope
(per NEXUS Tech Stack §28).
"""

from datetime import datetime, timezone
from enum import Enum
from uuid import uuid4

from pydantic import BaseModel, Field


class EventType(str, Enum):
    """Core event types for the NEXUS event bus."""

    # Task lifecycle
    TASK_CREATED = "task.created"
    TASK_STARTED = "task.started"
    TASK_COMPLETED = "task.completed"
    TASK_FAILED = "task.failed"

    # Agent lifecycle
    AGENT_STARTED = "agent.started"
    AGENT_THOUGHT = "agent.thought"
    AGENT_STEP_COMPLETED = "agent.step_completed"

    # Tool execution
    TOOL_INVOKED = "tool.invoked"
    TOOL_COMPLETED = "tool.completed"
    TOOL_ERROR = "tool.error"

    # Test lifecycle
    TEST_STARTED = "test.started"
    TEST_PASSED = "test.passed"
    TEST_FAILED = "test.failed"

    # Security & approvals
    SECURITY_FINDING = "security.finding_detected"
    APPROVAL_REQUIRED = "approval.required"
    APPROVAL_RESOLVED = "approval.resolved"


class EventEnvelope(BaseModel):
    """Standardized JSON event envelope for all NEXUS internal events.

    Example:
        {
            "event_id": "evt_01J8X9N2W7K5P8Q3R4T9V0",
            "timestamp": "2026-09-15T10:15:30.125Z",
            "task_id": "tsk_01J8X9M1P4L2K9R8T3",
            "agent_id": "agent_code_modifier",
            "event_type": "tool.completed",
            "correlation_id": "corr_01J8X9M1XYZ",
            "payload": { ... }
        }
    """

    event_id: str = Field(
        default_factory=lambda: f"evt_{uuid4().hex[:20]}",
        description="Unique event identifier",
    )
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        description="ISO 8601 UTC timestamp",
    )
    task_id: str | None = Field(default=None, description="Associated task identifier")
    agent_id: str | None = Field(default=None, description="Originating agent identifier")
    event_type: EventType = Field(..., description="Structured event type")
    correlation_id: str | None = Field(
        default=None, description="Correlation ID for request tracing"
    )
    payload: dict = Field(  # type: ignore[type-arg]
        default_factory=dict, description="Event-specific payload data"
    )
