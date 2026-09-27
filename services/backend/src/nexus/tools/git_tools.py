"""NEXUS Git Tools — status, diff, branch, and commit management.

Per Version Control Engine (Backend Architecture §20):
All task workspaces can be isolated on Git branches with commit tracking.
"""

from __future__ import annotations

import asyncio
from pathlib import Path
from typing import Any

from nexus.tools.base import BaseTool, ToolResult, ToolRiskLevel


async def _run_git_cmd(workspace_path: Path, *args: str) -> tuple[int, str, str]:
    """Helper to run a git command in the workspace."""
    cmd = ["git", *args]
    process = await asyncio.create_subprocess_exec(
        *cmd,
        cwd=str(workspace_path),
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await process.communicate()
    return (
        process.returncode or 0,
        stdout.decode("utf-8", errors="replace"),
        stderr.decode("utf-8", errors="replace"),
    )


class GitStatusTool(BaseTool):
    """Check working tree status in the git repository."""

    name = "git_status"
    description = "Show the working tree status (modified, staged, untracked files)."
    risk_level = ToolRiskLevel.READ_ONLY

    @property
    def parameters_schema(self) -> dict[str, Any]:
        return {"type": "object", "properties": {}}

    async def _run(self, workspace_path: Path, **kwargs: Any) -> ToolResult:
        code, out, err = await _run_git_cmd(workspace_path, "status", "--short")
        if code != 0:
            return ToolResult(
                success=False,
                output="",
                error=f"git status failed: {err.strip()}",
            )
        return ToolResult(
            success=True,
            output=out.strip() or "Working tree clean, no changes.",
        )


class GitDiffTool(BaseTool):
    """View git diff for unstaged or staged changes."""

    name = "git_diff"
    description = "View git diff for working tree or staged changes."
    risk_level = ToolRiskLevel.READ_ONLY

    @property
    def parameters_schema(self) -> dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "staged": {
                    "type": "boolean",
                    "description": "Show staged diff if true, unstaged if false (default: false)",
                },
                "file_path": {
                    "type": "string",
                    "description": "Optional specific file to diff",
                },
            },
        }

    async def _run(
        self,
        workspace_path: Path,
        *,
        staged: bool = False,
        file_path: str | None = None,
        **kwargs: Any,
    ) -> ToolResult:
        args = ["diff"]
        if staged:
            args.append("--staged")
        if file_path:
            args.extend(["--", file_path])

        code, out, err = await _run_git_cmd(workspace_path, *args)
        if code != 0:
            return ToolResult(
                success=False,
                output="",
                error=f"git diff failed: {err.strip()}",
            )
        return ToolResult(
            success=True,
            output=out.strip() or "No differences found.",
        )


class GitCommitTool(BaseTool):
    """Stage all changes and create a git commit."""

    name = "git_commit"
    description = "Stage all modified files and create a git commit with a message."
    risk_level = ToolRiskLevel.LOW

    @property
    def parameters_schema(self) -> dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "message": {
                    "type": "string",
                    "description": "Commit message describing the changes",
                },
            },
            "required": ["message"],
        }

    async def _run(
        self,
        workspace_path: Path,
        *,
        message: str,
        **kwargs: Any,
    ) -> ToolResult:
        # Add all
        code, out, err = await _run_git_cmd(workspace_path, "add", "-A")
        if code != 0:
            return ToolResult(
                success=False,
                output="",
                error=f"git add failed: {err.strip()}",
            )

        # Commit
        code, out, err = await _run_git_cmd(workspace_path, "commit", "-m", message)
        if code != 0:
            return ToolResult(
                success=False,
                output="",
                error=f"git commit failed: {err.strip() or out.strip()}",
            )
        return ToolResult(
            success=True,
            output=out.strip(),
        )


class GitCreateBranchTool(BaseTool):
    """Create and checkout a new git branch for a task."""

    name = "git_create_branch"
    description = "Create and checkout a new branch (e.g. nexus/tsk_123-feature)."
    risk_level = ToolRiskLevel.LOW

    @property
    def parameters_schema(self) -> dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "branch_name": {
                    "type": "string",
                    "description": "Name of the new branch to create and switch to",
                },
            },
            "required": ["branch_name"],
        }

    async def _run(
        self,
        workspace_path: Path,
        *,
        branch_name: str,
        **kwargs: Any,
    ) -> ToolResult:
        code, out, err = await _run_git_cmd(workspace_path, "checkout", "-b", branch_name)
        if code != 0:
            return ToolResult(
                success=False,
                output="",
                error=f"git checkout -b failed: {err.strip()}",
            )
        return ToolResult(
            success=True,
            output=f"Switched to a new branch '{branch_name}'",
        )
