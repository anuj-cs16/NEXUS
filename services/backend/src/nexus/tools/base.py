"""NEXUS Tool System — Base Tool ABC and execution contracts.

Per Domain Architecture (Backend Architecture §14):
All agent actions (reading files, writing code, executing tests, running shell commands)
are modeled as typed tools with explicit risk classification and workspace sandboxing.
"""

from __future__ import annotations

import time
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from typing import Any

from nexus.core.security import assert_path_within_workspace


class ToolRiskLevel(str, Enum):
    """Risk tier for tool executions."""

    READ_ONLY = "read_only"  # No state change (e.g. read_file, grep)
    LOW = "low"              # Safe workspace modification (e.g. create test file)
    MEDIUM = "medium"        # Modifies existing code (e.g. patch_file)
    HIGH = "high"            # External side effects (e.g. bash execution, install package)
    CRITICAL = "critical"    # Irreversible operations (e.g. rm -rf, git push --force)


@dataclass
class ToolResult:
    """Standardized result of a tool execution."""

    success: bool
    output: str
    error: str | None = None
    duration_ms: int = 0
    metadata: dict[str, Any] = field(default_factory=dict)


class BaseTool(ABC):
    """Abstract base class for all NEXUS agent tools."""

    name: str = ""
    description: str = ""
    risk_level: ToolRiskLevel = ToolRiskLevel.LOW
    timeout_seconds: float = 30.0

    @property
    @abstractmethod
    def parameters_schema(self) -> dict[str, Any]:
        """JSON Schema dictionary describing the tool's input parameters."""
        ...

    def validate_path(self, target_path: str | Path, workspace_path: str | Path) -> Path:
        """Enforce path jail constraint — target must remain within workspace root.

        Raises:
            PathTraversalError: If path escapes the workspace root.
        """
        return assert_path_within_workspace(target_path, workspace_path)

    @abstractmethod
    async def _run(self, workspace_path: Path, **kwargs: Any) -> ToolResult:
        """Internal execution logic to be implemented by each tool."""
        ...

    async def execute(self, workspace_path: str | Path, **kwargs: Any) -> ToolResult:
        """Execute the tool with timing, sandboxing, and error normalization."""
        ws = Path(workspace_path).resolve()
        start = time.perf_counter()
        try:
            result = await self._run(ws, **kwargs)
            result.duration_ms = int((time.perf_counter() - start) * 1000)
            return result
        except Exception as e:
            duration = int((time.perf_counter() - start) * 1000)
            return ToolResult(
                success=False,
                output="",
                error=f"{type(e).__name__}: {e}",
                duration_ms=duration,
            )

    def to_schema(self) -> dict[str, Any]:
        """Return the function calling schema for LLM tool binding."""
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": self.parameters_schema,
            },
        }
