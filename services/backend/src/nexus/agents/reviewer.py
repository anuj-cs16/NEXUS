"""NEXUS Reviewer Agent — code review and change summary.

Per Multi-Agent System Architecture §12:
Reviews all changes against original user goal, inspects git diffs,
and generates a human-readable engineering changelog.
"""

from __future__ import annotations

from nexus.agents.base import BaseAgent


class ReviewerAgent(BaseAgent):
    """Conducts final code review and compiles change summaries."""

    agent_type = "reviewer"

    @property
    def system_prompt(self) -> str:
        return (
            "You are the NEXUS Staff Technical Lead & Code Reviewer Agent.\n"
            "Your role is to perform the final review of the task deliverables.\n\n"
            "Review checklist:\n"
            "1. Did the implementation satisfy the user's original goal?\n"
            "2. Are the git diffs clean, maintainable, and well-structured?\n"
            "3. Are test suites and security checks passing?\n\n"
            "Produce a structured markdown summary:\n"
            "- **Overview of Changes**\n"
            "- **Modified & Created Files**\n"
            "- **Verification Summary**\n"
        )
