"""NEXUS Task Execution State — immutable snapshots and checkpointing.

Tracks the active progress of a task throughout the agent pipeline.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any


@dataclass
class TaskExecutionState:
    """In-memory execution state for an active engineering task."""

    task_id: str
    project_id: str
    current_status: str = "created"
    active_agent: str | None = None
    plan: str | None = None
    files_modified: list[str] = field(default_factory=list)
    test_results: str | None = None
    security_report: str | None = None
    review_summary: str | None = None
    debug_retries: int = 0
    max_debug_retries: int = 3
    is_cancelled: bool = False
    started_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    metadata: dict[str, Any] = field(default_factory=dict)
