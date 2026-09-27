"""NEXUS Base Agent — abstract LLM reasoning loop with tool dispatch.

Per Multi-Agent System Architecture (Backend Architecture §11 & §12):
Each agent operates on a specialized system prompt, bounded tool permissions,
and an autonomous ReAct loop (Reason -> Act -> Observe).
"""

from __future__ import annotations

import json
import re
from abc import ABC, abstractmethod
from typing import Any

import structlog

from nexus.ai.ollama_adapter import OllamaAdapter
from nexus.ai.provider import ChatMessage, ModelProvider
from nexus.core.event_bus import event_bus
from nexus.core.events import EventEnvelope, EventType
from nexus.orchestration.context import AgentContext, AgentStepResult
from nexus.tools.base import BaseTool
from nexus.tools.registry import ToolRegistry, tool_registry

logger = structlog.get_logger(__name__)


class BaseAgent(ABC):
    """Abstract base agent with tool execution and LLM reasoning loop."""

    agent_type: str = "base"
    max_iterations: int = 10

    def __init__(
        self,
        provider: ModelProvider | None = None,
        registry: ToolRegistry | None = None,
    ) -> None:
        self.provider = provider or OllamaAdapter()
        self.registry = registry or tool_registry

    @property
    @abstractmethod
    def system_prompt(self) -> str:
        """Base system prompt defining the agent's persona and instructions."""
        ...

    def get_allowed_tools(self) -> list[BaseTool]:
        """Return the list of tools permitted for this agent."""
        return self.registry.get_tools_for_agent(self.agent_type)

    def format_tools_description(self) -> str:
        """Format allowed tools into a description block for the LLM prompt."""
        tools = self.get_allowed_tools()
        if not tools:
            return "No tools available."

        lines = ["Available tools:"]
        for tool in tools:
            schema_json = json.dumps(tool.parameters_schema)
            lines.append(f"- **{tool.name}**: {tool.description}\n  Parameters: {schema_json}")
        return "\n".join(lines)

    def build_system_message(self, context: AgentContext) -> str:
        """Assemble the complete system message including workspace context and tools."""
        tools_desc = self.format_tools_description()
        return (
            f"{self.system_prompt}\n\n"
            f"### Workspace Root\n`{context.workspace_path}`\n\n"
            f"### Tool Protocol\n"
            f"{tools_desc}\n\n"
            f"To invoke a tool, respond with a JSON code block:\n"
            f"```json\n"
            f'{{\n  "action": "tool_name",\n  "params": {{ ... }}\n}}\n'
            f"```\n"
            f"When finished with your task, respond with your final summary or findings (no tool call block).\n"
        )

    async def execute(self, context: AgentContext) -> AgentStepResult:
        """Run the agent's autonomous reasoning and tool execution loop."""
        logger.info("agent.started", agent_type=self.agent_type, task_id=context.task_id)

        await event_bus.publish(
            EventEnvelope(
                event_type=EventType.AGENT_STARTED,
                task_id=context.task_id,
                agent_id=self.agent_type,
                payload={"goal": context.goal},
            )
        )

        system_msg = self.build_system_message(context)
        messages: list[ChatMessage] = [
            ChatMessage(role="system", content=system_msg),
            ChatMessage(role="user", content=f"Task Goal: {context.goal}"),
        ]

        if context.plan:
            messages.append(ChatMessage(role="user", content=f"Implementation Plan:\n{context.plan}"))
        if context.test_results:
            messages.append(ChatMessage(role="user", content=f"Test Results:\n{context.test_results}"))

        tool_calls_count = 0
        total_tokens = 0
        final_output = ""

        for iteration in range(self.max_iterations):
            logger.debug("agent.iteration", agent_type=self.agent_type, iteration=iteration)

            try:
                response = await self.provider.chat(
                    messages,
                    model=context.model,
                    temperature=0.2,
                )
            except Exception as e:
                logger.exception("agent.llm_error", agent_type=self.agent_type)
                return AgentStepResult(
                    agent_type=self.agent_type,
                    success=False,
                    output="",
                    error=f"LLM generation failed: {e}",
                    tool_calls_count=tool_calls_count,
                    tokens_used=total_tokens,
                )

            # Emit thought event
            await event_bus.publish(
                EventEnvelope(
                    event_type=EventType.AGENT_THOUGHT,
                    task_id=context.task_id,
                    agent_id=self.agent_type,
                    payload={"thought": response[:300], "iteration": iteration},
                )
            )

            # Check for tool call
            tool_call = self._extract_tool_call(response)
            if not tool_call:
                # Agent provided final answer
                final_output = response
                break

            action_name = tool_call.get("action")
            params = tool_call.get("params", {})

            if not action_name:
                messages.append(ChatMessage(role="assistant", content=response))
                messages.append(ChatMessage(role="user", content="Error: No tool 'action' specified in JSON block."))
                continue

            tool_calls_count += 1
            logger.info("agent.tool_invoked", agent_type=self.agent_type, tool=action_name)

            await event_bus.publish(
                EventEnvelope(
                    event_type=EventType.TOOL_INVOKED,
                    task_id=context.task_id,
                    agent_id=self.agent_type,
                    payload={"tool": action_name, "params": params},
                )
            )

            # Execute tool
            try:
                tool = self.registry.validate_agent_permission(self.agent_type, action_name)
                tool_result = await tool.execute(context.workspace_path, **params)

                await event_bus.publish(
                    EventEnvelope(
                        event_type=EventType.TOOL_COMPLETED if tool_result.success else EventType.TOOL_ERROR,
                        task_id=context.task_id,
                        agent_id=self.agent_type,
                        payload={
                            "tool": action_name,
                            "success": tool_result.success,
                            "duration_ms": tool_result.duration_ms,
                            "error": tool_result.error,
                        },
                    )
                )

                obs = tool_result.output if tool_result.success else f"Tool Error: {tool_result.error}"
            except Exception as e:
                obs = f"Execution Exception: {e}"

            messages.append(ChatMessage(role="assistant", content=response))
            messages.append(ChatMessage(role="user", content=f"Observation from {action_name}:\n{obs}"))

        if not final_output and messages:
            final_output = messages[-1].content

        logger.info("agent.completed", agent_type=self.agent_type, task_id=context.task_id)

        await event_bus.publish(
            EventEnvelope(
                event_type=EventType.AGENT_STEP_COMPLETED,
                task_id=context.task_id,
                agent_id=self.agent_type,
                payload={"output_length": len(final_output)},
            )
        )

        return AgentStepResult(
            agent_type=self.agent_type,
            success=True,
            output=final_output,
            tool_calls_count=tool_calls_count,
            tokens_used=total_tokens,
        )

    @staticmethod
    def _extract_tool_call(text: str) -> dict[str, Any] | None:
        """Extract a JSON tool invocation object from markdown code blocks or text."""
        # Find json block
        match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
        if match:
            try:
                data = json.loads(match.group(1))
                if isinstance(data, dict) and ("action" in data or "tool" in data):
                    if "tool" in data and "action" not in data:
                        data["action"] = data.pop("tool")
                    return data
            except json.JSONDecodeError:
                pass

        # Fallback: scan for any raw JSON object with action/tool key
        match = re.search(r"\{\s*\"(?:action|tool)\"\s*:\s*\"[^\"]+\".*?\}", text, re.DOTALL)
        if match:
            try:
                data = json.loads(match.group(0))
                if isinstance(data, dict):
                    if "tool" in data and "action" not in data:
                        data["action"] = data.pop("tool")
                    return data
            except json.JSONDecodeError:
                pass

        return None
