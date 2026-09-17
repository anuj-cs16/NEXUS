"""Common Pydantic schemas shared across the NEXUS backend.

These DTOs form the contract between frontend and backend.
TypeScript types in packages/shared-types/ mirror these schemas.
"""

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class TaskStatus(str, Enum):
    """Task lifecycle states (per NEXUS Tech Stack §19)."""

    PENDING = "pending"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    RECOVERY_REQUIRED = "recovery_required"


class RiskLevel(str, Enum):
    """Risk assessment levels for human-in-the-loop decisions."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AgentType(str, Enum):
    """NEXUS agent types (per PRD §12)."""

    PLANNER = "planner"
    DEVELOPER = "developer"
    TESTER = "tester"
    DEBUGGER = "debugger"
    SECURITY = "security"
    REVIEWER = "reviewer"


class ApiResponse(BaseModel):
    """Standard API response wrapper."""

    success: bool = True
    message: str = ""
    data: dict | None = None  # type: ignore[type-arg]


class PaginationParams(BaseModel):
    """Pagination query parameters."""

    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)


class TimestampMixin(BaseModel):
    """Mixin providing created/updated timestamps."""

    created_at: datetime
    updated_at: datetime | None = None
