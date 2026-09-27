"""NEXUS Tool Registry — centralized tool management and access control.

Per Agent Architecture §12 & Domain Architecture §14:
Enforces role-based tool permission boundaries and maps agent roles to allowed tools.
"""

from __future__ import annotations

from typing import Any

import structlog

from nexus.core.exceptions import NotFoundError, PermissionDeniedError
from nexus.tools.base import BaseTool, ToolRiskLevel
from nexus.tools.bash_tools import ExecuteCommandTool
from nexus.tools.file_tools import ListDirTool, PatchFileTool, ReadFileTool, WriteFileTool
from nexus.tools.git_tools import GitCommitTool, GitCreateBranchTool, GitDiffTool, GitStatusTool
from nexus.tools.search_tools import FileGlobTool, GrepSearchTool

logger = structlog.get_logger(__name__)


# Role-based tool access permissions (Backend Architecture §12)
AGENT_TOOL_PERMISSIONS: dict[str, set[str]] = {
    "planner": {
        "read_file",
        "list_dir",
        "grep_search",
        "file_glob",
        "git_status",
    },
    "developer": {
        "read_file",
        "write_file",
        "patch_file",
        "list_dir",
        "grep_search",
        "file_glob",
        "git_status",
        "git_diff",
        "git_commit",
        "git_create_branch",
    },
    "tester": {
        "read_file",
        "write_file",
        "list_dir",
        "grep_search",
        "file_glob",
        "execute_command",
    },
    "debugger": {
        "read_file",
        "patch_file",
        "write_file",
        "grep_search",
        "file_glob",
        "execute_command",
        "git_diff",
    },
    "security": {
        "read_file",
        "grep_search",
        "file_glob",
        "git_diff",
    },
    "reviewer": {
        "read_file",
        "git_diff",
        "git_status",
        "grep_search",
        "file_glob",
    },
}


class ToolRegistry:
    """Registry of all executable agent tools with permission enforcement."""

    def __init__(self) -> None:
        self._tools: dict[str, BaseTool] = {}
        self._register_default_tools()

    def _register_default_tools(self) -> None:
        """Register all default built-in tools."""
        defaults: list[BaseTool] = [
            ReadFileTool(),
            WriteFileTool(),
            PatchFileTool(),
            ListDirTool(),
            GrepSearchTool(),
            FileGlobTool(),
            ExecuteCommandTool(),
            GitStatusTool(),
            GitDiffTool(),
            GitCommitTool(),
            GitCreateBranchTool(),
        ]
        for tool in defaults:
            self.register(tool)

    def register(self, tool: BaseTool) -> None:
        """Register a new tool instance."""
        self._tools[tool.name] = tool
        logger.debug("tool_registry.registered", tool_name=tool.name, risk_level=tool.risk_level.value)

    def get(self, name: str) -> BaseTool:
        """Fetch a tool by name or raise NotFoundError."""
        tool = self._tools.get(name)
        if not tool:
            raise NotFoundError(f"Tool '{name}' is not registered in ToolRegistry", tool_name=name)
        return tool

    def list_tools(self) -> list[BaseTool]:
        """Return all registered tools."""
        return list(self._tools.values())

    def get_tools_for_agent(self, agent_type: str) -> list[BaseTool]:
        """Return all tools permitted for a specific agent type."""
        allowed_names = AGENT_TOOL_PERMISSIONS.get(agent_type.lower(), set())
        return [tool for name, tool in self._tools.items() if name in allowed_names]

    def validate_agent_permission(self, agent_type: str, tool_name: str) -> BaseTool:
        """Verify that an agent is allowed to invoke the given tool.

        Raises:
            NotFoundError: If tool does not exist.
            PermissionDeniedError: If agent is not permitted to use tool.
        """
        tool = self.get(tool_name)
        allowed = AGENT_TOOL_PERMISSIONS.get(agent_type.lower(), set())
        if tool_name not in allowed:
            raise PermissionDeniedError(
                f"Agent '{agent_type}' is not authorized to invoke tool '{tool_name}'",
                agent_type=agent_type,
                tool_name=tool_name,
            )
        return tool

    def requires_approval(self, tool: BaseTool) -> bool:
        """Determine if a tool execution requires human approval before running."""
        return tool.risk_level in {ToolRiskLevel.HIGH, ToolRiskLevel.CRITICAL}


# Global tool registry singleton
tool_registry = ToolRegistry()
