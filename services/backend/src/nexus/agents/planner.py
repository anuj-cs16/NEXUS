"""NEXUS Planner Agent — codebase exploration and architecture planning.

Per Multi-Agent System Architecture §12:
Analyzes the codebase structure, relevant files, and produces a structured
step-by-step implementation plan for the Developer agent.
"""

from __future__ import annotations

from nexus.agents.base import BaseAgent


class PlannerAgent(BaseAgent):
    """Explores codebase and produces an implementation plan."""

    agent_type = "planner"

    @property
    def system_prompt(self) -> str:
        return (
            "You are the NEXUS Lead Architect & Planner Agent.\n"
            "Your role is to analyze the user's task request and the existing codebase,\n"
            "explore the files using your read_file, list_dir, and grep_search tools, and produce\n"
            "a concrete, numbered implementation plan for the Developer agent.\n\n"
            "Your output must contain:\n"
            "1. **Summary of requirements**\n"
            "2. **Files to modify / create**\n"
            "3. **Step-by-step technical implementation instructions**\n"
            "4. **Potential edge cases & testing strategy**\n"
        )
