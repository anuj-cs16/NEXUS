"""NEXUS File Tools — read, write, patch, and list directory.

Enforces workspace sandboxing on all filesystem operations.
"""

from __future__ import annotations

import difflib
from pathlib import Path
from typing import Any

from nexus.tools.base import BaseTool, ToolResult, ToolRiskLevel


class ReadFileTool(BaseTool):
    """Read the contents of a file within the workspace."""

    name = "read_file"
    description = "Read the text contents of a file within the project workspace."
    risk_level = ToolRiskLevel.READ_ONLY

    @property
    def parameters_schema(self) -> dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "file_path": {
                    "type": "string",
                    "description": "Relative path to the file to read",
                },
                "start_line": {
                    "type": "integer",
                    "description": "Optional 1-indexed start line number",
                },
                "end_line": {
                    "type": "integer",
                    "description": "Optional 1-indexed end line number",
                },
            },
            "required": ["file_path"],
        }

    async def _run(
        self,
        workspace_path: Path,
        *,
        file_path: str,
        start_line: int | None = None,
        end_line: int | None = None,
        **kwargs: Any,
    ) -> ToolResult:
        full_path = self.validate_path(file_path, workspace_path)
        if not full_path.exists():
            return ToolResult(
                success=False,
                output="",
                error=f"File not found: {file_path}",
            )
        if not full_path.is_file():
            return ToolResult(
                success=False,
                output="",
                error=f"Path is not a file: {file_path}",
            )

        try:
            content = full_path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            return ToolResult(
                success=False,
                output="",
                error=f"File {file_path} is binary or cannot be decoded as UTF-8",
            )

        lines = content.splitlines(keepends=True)
        total_lines = len(lines)

        if start_line is not None or end_line is not None:
            s = max(1, start_line or 1)
            e = min(total_lines, end_line or total_lines)
            selected_lines = lines[s - 1 : e]
            output = "".join(f"{s + i}: {line}" for i, line in enumerate(selected_lines))
        else:
            output = content

        return ToolResult(
            success=True,
            output=output,
            metadata={"total_lines": total_lines, "file_path": file_path},
        )


class WriteFileTool(BaseTool):
    """Write or overwrite a file within the workspace."""

    name = "write_file"
    description = "Create or overwrite a file with full contents in the workspace."
    risk_level = ToolRiskLevel.LOW

    @property
    def parameters_schema(self) -> dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "file_path": {
                    "type": "string",
                    "description": "Relative path to the file to create or overwrite",
                },
                "content": {
                    "type": "string",
                    "description": "Full text content to write",
                },
            },
            "required": ["file_path", "content"],
        }

    async def _run(
        self,
        workspace_path: Path,
        *,
        file_path: str,
        content: str,
        **kwargs: Any,
    ) -> ToolResult:
        full_path = self.validate_path(file_path, workspace_path)
        full_path.parent.mkdir(parents=True, exist_ok=True)

        is_new = not full_path.exists()
        full_path.write_text(content, encoding="utf-8")

        return ToolResult(
            success=True,
            output=f"Successfully {'created' if is_new else 'updated'} {file_path} ({len(content)} bytes)",
            metadata={"is_new": is_new, "file_path": file_path, "bytes": len(content)},
        )


class PatchFileTool(BaseTool):
    """Apply a precise text replacement to an existing file."""

    name = "patch_file"
    description = "Replace a specific target text snippet in a file with new content."
    risk_level = ToolRiskLevel.MEDIUM

    @property
    def parameters_schema(self) -> dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "file_path": {
                    "type": "string",
                    "description": "Relative path to the file to patch",
                },
                "target_content": {
                    "type": "string",
                    "description": "Exact text to find and replace",
                },
                "replacement_content": {
                    "type": "string",
                    "description": "New text to insert in place of target_content",
                },
            },
            "required": ["file_path", "target_content", "replacement_content"],
        }

    async def _run(
        self,
        workspace_path: Path,
        *,
        file_path: str,
        target_content: str,
        replacement_content: str,
        **kwargs: Any,
    ) -> ToolResult:
        full_path = self.validate_path(file_path, workspace_path)
        if not full_path.exists():
            return ToolResult(
                success=False,
                output="",
                error=f"File not found: {file_path}",
            )

        current_text = full_path.read_text(encoding="utf-8")
        if target_content not in current_text:
            return ToolResult(
                success=False,
                output="",
                error=f"Target content not found in {file_path}",
            )

        occurrences = current_text.count(target_content)
        if occurrences > 1:
            return ToolResult(
                success=False,
                output="",
                error=f"Target content occurs {occurrences} times in {file_path}. Please provide a more unique snippet.",
            )

        new_text = current_text.replace(target_content, replacement_content, 1)
        full_path.write_text(new_text, encoding="utf-8")

        diff = "".join(
            difflib.unified_diff(
                current_text.splitlines(keepends=True),
                new_text.splitlines(keepends=True),
                fromfile=f"a/{file_path}",
                tofile=f"b/{file_path}",
            )
        )

        return ToolResult(
            success=True,
            output=diff or f"Patched {file_path} successfully",
            metadata={"file_path": file_path, "diff": diff},
        )


class ListDirTool(BaseTool):
    """List contents of a directory in the workspace."""

    name = "list_dir"
    description = "List files and subdirectories within a directory in the workspace."
    risk_level = ToolRiskLevel.READ_ONLY

    @property
    def parameters_schema(self) -> dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "dir_path": {
                    "type": "string",
                    "description": "Relative path to the directory (default: root '.')",
                },
            },
        }

    async def _run(
        self,
        workspace_path: Path,
        *,
        dir_path: str = ".",
        **kwargs: Any,
    ) -> ToolResult:
        target_dir = self.validate_path(dir_path, workspace_path)
        if not target_dir.exists():
            return ToolResult(
                success=False,
                output="",
                error=f"Directory not found: {dir_path}",
            )
        if not target_dir.is_dir():
            return ToolResult(
                success=False,
                output="",
                error=f"Path is not a directory: {dir_path}",
            )

        entries = []
        for child in sorted(target_dir.iterdir()):
            kind = "DIR " if child.is_dir() else "FILE"
            size = f"{child.stat().st_size} B" if child.is_file() else ""
            entries.append(f"{kind}  {child.name:30} {size}")

        return ToolResult(
            success=True,
            output="\n".join(entries) if entries else "(empty directory)",
            metadata={"count": len(entries)},
        )
