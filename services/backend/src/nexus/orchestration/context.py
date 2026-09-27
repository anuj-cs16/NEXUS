"""NEXUS Agent Context and Execution Results.

Provides structured context (workspace path, task goal, history, plan, diffs)
to agents during pipeline execution.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


@dataclass
class AgentContext:
    """Context passed to an agent when executing a step in the pipeline."""

    task_id: str
    project_id: str
    workspace_path: Path
    goal: str
    model: str | None = None
    plan: str | None = None
    test_results: str | None = None
    security_report: str | None = None
    review_summary: str | None = None
    step_history: list[dict[str, Any]] = field(default_factory=list)
    custom_instructions: str | None = None


@dataclass
class AgentStepResult:
    """Result returned by an agent after completing its pipeline step."""

    agent_type: str
    success: bool
    output: str
    tool_calls_count: int = 0
    tokens_used: int = 0
    error: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)
