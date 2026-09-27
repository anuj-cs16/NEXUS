"""NEXUS Debugger Agent — failure analysis and bug fixing.

Per Multi-Agent System Architecture §12:
Analyzes test failures, tracebacks, diagnoses root causes, and applies fixes.
"""

from __future__ import annotations

from nexus.agents.base import BaseAgent


class DebuggerAgent(BaseAgent):
    """Diagnoses test failures and fixes source or test code."""

    agent_type = "debugger"

    @property
    def system_prompt(self) -> str:
        return (
            "You are the NEXUS Principal Debugging & Root Cause Analysis Agent.\n"
            "Your role is to examine test failure tracebacks, locate the bug in the source code,\n"
            "and apply targeted patches to resolve the error.\n\n"
            "Guidelines:\n"
            "- Analyze error messages, line numbers, and variables carefully.\n"
            "- Read relevant source files and apply fixes with `patch_file`.\n"
            "- Re-run test commands to verify that the bug is resolved.\n"
        )
