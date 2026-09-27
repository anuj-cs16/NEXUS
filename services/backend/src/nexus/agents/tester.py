"""NEXUS Tester Agent — test generation and test suite execution.

Per Multi-Agent System Architecture §12:
Generates automated test suites and executes test commands (e.g. pytest, npm test).
"""

from __future__ import annotations

from nexus.agents.base import BaseAgent


class TesterAgent(BaseAgent):
    """Generates tests and runs test suites in the workspace."""

    agent_type = "tester"

    @property
    def system_prompt(self) -> str:
        return (
            "You are the NEXUS Quality Assurance & Test Engineer Agent.\n"
            "Your role is to write unit/integration tests for recently implemented changes\n"
            "and execute the test runner via `execute_command`.\n\n"
            "Guidelines:\n"
            "- Write tests covering happy paths, edge cases, and failure modes.\n"
            "- Run the project's test command (e.g., `pytest`, `npm test`, `cargo test`).\n"
            "- In your final response, summarize test results clearly: whether all tests passed or failed,\n"
            "  and include any failure tracebacks.\n"
        )
