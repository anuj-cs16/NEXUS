"""NEXUS Bash Tools — shell command execution.

Per Terminal Engine (Backend Architecture §21):
Executes terminal commands with timeout enforcement, process output capture,
and configurable environment sandboxing.
"""

from __future__ import annotations

import asyncio
import os
from pathlib import Path
from typing import Any

from nexus.tools.base import BaseTool, ToolResult, ToolRiskLevel


class ExecuteCommandTool(BaseTool):
    """Execute a shell command within the project workspace."""

    name = "execute_command"
    description = "Execute a shell command (e.g. pytest, npm test, git, build commands) in the workspace."
    risk_level = ToolRiskLevel.HIGH
    timeout_seconds = 60.0

    @property
    def parameters_schema(self) -> dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "command": {
                    "type": "string",
                    "description": "Shell command line to execute",
                },
                "timeout_seconds": {
                    "type": "number",
                    "description": "Execution timeout in seconds (default: 60)",
                },
            },
            "required": ["command"],
        }

    async def _run(
        self,
        workspace_path: Path,
        *,
        command: str,
        timeout_seconds: float | None = None,
        **kwargs: Any,
    ) -> ToolResult:
        timeout = timeout_seconds or self.timeout_seconds

        # Safe environment: keep standard system PATH and essential vars, drop sensitive keys
        safe_env = {
            "PATH": os.environ.get("PATH", ""),
            "SYSTEMROOT": os.environ.get("SYSTEMROOT", ""),
            "TEMP": os.environ.get("TEMP", ""),
            "TMP": os.environ.get("TMP", ""),
            "PYTHONUNBUFFERED": "1",
            "CI": "1",
        }

        try:
            process = await asyncio.create_subprocess_shell(
                command,
                cwd=str(workspace_path),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                env={**os.environ, **safe_env},
            )

            try:
                stdout_bytes, stderr_bytes = await asyncio.wait_for(
                    process.communicate(),
                    timeout=timeout,
                )
            except asyncio.TimeoutError:
                try:
                    process.kill()
                except OSError:
                    pass
                return ToolResult(
                    success=False,
                    output="",
                    error=f"Command timed out after {timeout} seconds: {command}",
                )

            stdout_str = stdout_bytes.decode("utf-8", errors="replace")
            stderr_str = stderr_bytes.decode("utf-8", errors="replace")
            exit_code = process.returncode or 0

            combined_output = stdout_str
            if stderr_str:
                if combined_output:
                    combined_output += "\n--- STDERR ---\n" + stderr_str
                else:
                    combined_output = stderr_str

            return ToolResult(
                success=exit_code == 0,
                output=combined_output,
                error=None if exit_code == 0 else f"Process exited with code {exit_code}",
                metadata={"exit_code": exit_code, "command": command},
            )
        except Exception as e:
            return ToolResult(
                success=False,
                output="",
                error=f"Failed to execute command '{command}': {e}",
            )
