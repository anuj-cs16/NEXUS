"""NEXUS Search Tools — grep and file glob pattern matching."""

from __future__ import annotations

import fnmatch
import os
import re
from pathlib import Path
from typing import Any

from nexus.tools.base import BaseTool, ToolResult, ToolRiskLevel


class GrepSearchTool(BaseTool):
    """Search for a regex or substring across workspace files."""

    name = "grep_search"
    description = "Search for a regex pattern or string across files in the workspace."
    risk_level = ToolRiskLevel.READ_ONLY

    @property
    def parameters_schema(self) -> dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "pattern": {
                    "type": "string",
                    "description": "Regex pattern or literal string to search for",
                },
                "path": {
                    "type": "string",
                    "description": "Subdirectory to search within (default: root '.')",
                },
                "case_sensitive": {
                    "type": "boolean",
                    "description": "Whether the search is case-sensitive (default: true)",
                },
                "max_results": {
                    "type": "integer",
                    "description": "Maximum number of matched lines to return (default: 50)",
                },
            },
            "required": ["pattern"],
        }

    async def _run(
        self,
        workspace_path: Path,
        *,
        pattern: str,
        path: str = ".",
        case_sensitive: bool = True,
        max_results: int = 50,
        **kwargs: Any,
    ) -> ToolResult:
        search_dir = self.validate_path(path, workspace_path)
        if not search_dir.exists():
            return ToolResult(
                success=False,
                output="",
                error=f"Search path does not exist: {path}",
            )

        flags = 0 if case_sensitive else re.IGNORECASE
        try:
            regex = re.compile(pattern, flags)
        except re.error as e:
            return ToolResult(
                success=False,
                output="",
                error=f"Invalid regular expression: {e}",
            )

        matches: list[str] = []
        ignored_dirs = {".git", ".venv", "node_modules", "__pycache__", ".next", "dist", "build"}

        for root, dirs, files in os.walk(search_dir):
            dirs[:] = [d for d in dirs if d not in ignored_dirs]
            for file in files:
                file_path = Path(root) / file
                rel_path = file_path.relative_to(workspace_path)

                try:
                    text = file_path.read_text(encoding="utf-8", errors="ignore")
                except OSError:
                    continue

                for line_idx, line in enumerate(text.splitlines(), start=1):
                    if regex.search(line):
                        matches.append(f"{rel_path}:{line_idx}: {line.strip()}")
                        if len(matches) >= max_results:
                            break
                if len(matches) >= max_results:
                    break
            if len(matches) >= max_results:
                break

        output = "\n".join(matches) if matches else "No matches found."
        return ToolResult(
            success=True,
            output=output,
            metadata={"match_count": len(matches)},
        )


class FileGlobTool(BaseTool):
    """Find files matching a glob pattern."""

    name = "file_glob"
    description = "Find files matching a wildcard glob pattern in the workspace."
    risk_level = ToolRiskLevel.READ_ONLY

    @property
    def parameters_schema(self) -> dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "pattern": {
                    "type": "string",
                    "description": "Glob pattern (e.g. '**/*.py', 'src/**/*.ts')",
                },
                "max_results": {
                    "type": "integer",
                    "description": "Max matching files to return (default: 100)",
                },
            },
            "required": ["pattern"],
        }

    async def _run(
        self,
        workspace_path: Path,
        *,
        pattern: str,
        max_results: int = 100,
        **kwargs: Any,
    ) -> ToolResult:
        matches = []
        ignored = {".git", ".venv", "node_modules", "__pycache__", ".next", "dist", "build"}

        for p in workspace_path.glob(pattern):
            # Check if any part is ignored
            if any(part in ignored for part in p.parts):
                continue
            if p.is_file():
                matches.append(str(p.relative_to(workspace_path)))
                if len(matches) >= max_results:
                    break

        output = "\n".join(matches) if matches else "No matching files found."
        return ToolResult(
            success=True,
            output=output,
            metadata={"match_count": len(matches)},
        )
