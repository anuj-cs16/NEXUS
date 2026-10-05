"""NEXUS Context Assembler — Token budget packing for agent prompts.

Per Agent Memory & Retrieval Architecture (§11):
Enforces strict token ceilings to ensure agent prompts never exceed model
context windows or dilute reasoning attention.

Token allocation (32K context cap):
- System Prompt & Role:    2,000 tokens  (6.25%)   P0
- Task Goal:               1,500 tokens  (4.68%)   P0
- Active Target Files:    14,000 tokens  (43.75%)  P1
- RAG Code Chunks:         8,000 tokens  (25.00%)  P2
- Project Memory:          3,500 tokens  (10.94%)  P2
- Task History:            3,000 tokens  (9.38%)   P3
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

import structlog

from nexus.knowledge.retrieval import RetrievalResult

logger = structlog.get_logger(__name__)

# Token budget defaults (per architecture spec §11)
DEFAULT_BUDGETS = {
    "system_prompt": 2_000,
    "task_goal": 1_500,
    "target_files": 14_000,
    "rag_chunks": 8_000,
    "project_memory": 3_500,
    "task_history": 3_000,
}

TOTAL_CONTEXT_CAP = 32_000


@dataclass
class TokenBudget:
    """Configurable token budget allocation for context assembly."""

    system_prompt: int = 2_000
    task_goal: int = 1_500
    target_files: int = 14_000
    rag_chunks: int = 8_000
    project_memory: int = 3_500
    task_history: int = 3_000
    total_limit: int = 32_000

    def to_dict(self) -> dict[str, int]:
        return {
            "system_prompt": self.system_prompt,
            "task_goal": self.task_goal,
            "target_files": self.target_files,
            "rag_chunks": self.rag_chunks,
            "project_memory": self.project_memory,
            "task_history": self.task_history,
        }

    @classmethod
    def for_16k(cls) -> TokenBudget:
        return cls(
            system_prompt=1_000,
            task_goal=1_000,
            target_files=7_000,
            rag_chunks=4_000,
            project_memory=1_500,
            task_history=1_500,
            total_limit=16_000,
        )

    @classmethod
    def for_32k(cls) -> TokenBudget:
        return cls()

    @classmethod
    def for_64k(cls) -> TokenBudget:
        return cls(
            system_prompt=4_000,
            task_goal=3_000,
            target_files=28_000,
            rag_chunks=16_000,
            project_memory=7_000,
            task_history=6_000,
            total_limit=64_000,
        )


@dataclass
class ContextSection:
    """A section of the assembled agent context."""

    name: str
    content: str
    token_count: int
    priority: int  # P0 = highest, P3 = lowest
    source_chunks: list[str] = field(default_factory=list)  # chunk_ids for provenance


@dataclass
class AssembledContext:
    """Fully assembled agent context with token accounting."""

    sections: list[ContextSection]
    total_tokens: int
    budget_remaining: int
    truncated_sections: list[str]  # Names of sections that were truncated
    rag_chunk_count: int = 0
    memory_item_count: int = 0

    @property
    def prompt(self) -> str:
        """Render all sections into a formatted XML-tagged agent prompt string."""
        parts: list[str] = []
        for s in self.sections:
            if s.name == "system_prompt":
                parts.append(f"<nexus_system>\n{s.content}\n</nexus_system>")
            elif s.name == "task_goal":
                parts.append(f"<nexus_goal>\n{s.content}\n</nexus_goal>")
            elif s.name == "target_files":
                parts.append(f"<nexus_target_files>\n{s.content}\n</nexus_target_files>")
            elif s.name == "rag_chunks":
                parts.append(f"<nexus_rag_context>\n{s.content}\n</nexus_rag_context>")
            elif s.name == "project_memory":
                parts.append(f"<nexus_memory>\n{s.content}\n</nexus_memory>")
            elif s.name == "task_history":
                parts.append(f"<nexus_history>\n{s.content}\n</nexus_history>")
            else:
                parts.append(f"<{s.name}>\n{s.content}\n</{s.name}>")
        return "\n\n".join(parts)



def estimate_tokens(text: str) -> int:
    """Estimate token count for text content.

    Approximation: ~4 characters per token for code/English text.
    This is intentionally conservative to avoid context overflow.
    """
    return max(1, len(text) // 4)


class ContextAssembler:
    """Assemble agent context within strict token budgets.

    Packs retrieved RAG chunks, project memory, and task context into
    a structured prompt section, respecting per-tier token limits.
    """

    def __init__(
        self,
        budget: TokenBudget | dict[str, int] | None = None,
        budgets: dict[str, int] | None = None,
        total_cap: int = TOTAL_CONTEXT_CAP,
    ) -> None:
        if isinstance(budget, TokenBudget):
            self._budgets = budget.to_dict()
            self._total_cap = budget.total_limit
        elif isinstance(budget, dict):
            self._budgets = budget
            self._total_cap = total_cap
        elif budgets is not None:
            self._budgets = budgets
            self._total_cap = total_cap
        else:
            self._budgets = DEFAULT_BUDGETS.copy()
            self._total_cap = total_cap

    def assemble(
        self,
        *,
        system_prompt: str = "",
        task_goal: str = "",
        target_files: list[dict[str, str]] | None = None,
        rag_results: list[RetrievalResult] | None = None,
        rag_chunks: list[dict[str, Any]] | list[RetrievalResult] | None = None,
        memory_items: list[dict[str, str]] | None = None,
        task_history: list[str] | None = None,
    ) -> AssembledContext:
        """Assemble a complete agent context within token budgets.

        Args:
            system_prompt: Agent role persona and system instructions.
            task_goal: Current task description and goal.
            target_files: List of {"path": ..., "content": ...} for active files.
            rag_results: Retrieved code chunks from hybrid search.
            rag_chunks: Alternative name/format for retrieved chunks.
            memory_items: Durable project memory items.
            task_history: Previous task step summaries.

        Returns:
            AssembledContext with packed sections and token accounting.
        """
        sections: list[ContextSection] = []
        truncated: list[str] = []
        total_used = 0

        # Unify rag_results and rag_chunks
        combined_rag: list[RetrievalResult] = []
        if rag_results:
            combined_rag.extend(rag_results)
        if rag_chunks:
            for item in rag_chunks:
                if isinstance(item, RetrievalResult):
                    combined_rag.append(item)
                elif isinstance(item, dict):
                    combined_rag.append(
                        RetrievalResult(
                            chunk_id=item.get("chunk_id", "chk_unknown"),
                            content=item.get("content", ""),
                            file_path=item.get("file_path", item.get("path", "unknown")),
                            symbol_name=item.get("symbol_name"),
                            start_line=item.get("start_line", 0),
                            end_line=item.get("end_line", 0),
                            rrf_score=item.get("score", item.get("rrf_score", 1.0)),
                            source=item.get("source", "rag"),
                        )
                    )

        # P0: System prompt (mandatory)
        if system_prompt:
            budget = self._budgets.get("system_prompt", 2000)
            tokens = estimate_tokens(system_prompt)
            if tokens > budget:
                system_prompt = self._truncate_to_budget(system_prompt, budget)
                truncated.append("system_prompt")
                tokens = budget
            sections.append(ContextSection(
                name="system_prompt",
                content=system_prompt,
                token_count=tokens,
                priority=0,
            ))
            total_used += tokens

        # P0: Task goal (mandatory)
        if task_goal:
            budget = self._budgets.get("task_goal", 1500)
            tokens = estimate_tokens(task_goal)
            if tokens > budget:
                task_goal = self._truncate_to_budget(task_goal, budget)
                truncated.append("task_goal")
                tokens = budget
            sections.append(ContextSection(
                name="task_goal",
                content=task_goal,
                token_count=tokens,
                priority=0,
            ))
            total_used += tokens

        # P1: Active target source files
        if target_files:
            budget = self._budgets.get("target_files", 14000)
            file_content, file_tokens, file_chunk_ids = self._pack_files(
                target_files, budget
            )
            if file_tokens > budget:
                truncated.append("target_files")
                file_tokens = budget
            sections.append(ContextSection(
                name="target_files",
                content=file_content,
                token_count=file_tokens,
                priority=1,
                source_chunks=file_chunk_ids,
            ))
            total_used += file_tokens

        # P2: RAG retrieved code chunks
        rag_count = 0
        if combined_rag:
            budget = self._budgets.get("rag_chunks", 8000)
            # If target_files used less than budget, give overflow to RAG
            target_used = next(
                (s.token_count for s in sections if s.name == "target_files"), 0
            )
            target_savings = max(0, self._budgets.get("target_files", 14000) - target_used)
            effective_budget = budget + target_savings

            rag_content, rag_tokens, rag_chunk_ids = self._pack_rag_chunks(
                combined_rag, effective_budget
            )
            rag_count = len(rag_chunk_ids)
            if rag_tokens > effective_budget:
                truncated.append("rag_chunks")
                rag_tokens = effective_budget
            sections.append(ContextSection(
                name="rag_chunks",
                content=rag_content,
                token_count=rag_tokens,
                priority=2,
                source_chunks=rag_chunk_ids,
            ))
            total_used += rag_tokens

        # P2: Project memory & conventions
        mem_count = 0
        if memory_items:
            budget = self._budgets["project_memory"]
            mem_content, mem_tokens = self._pack_memory(memory_items, budget)
            mem_count = len(memory_items)
            if mem_tokens > budget:
                truncated.append("project_memory")
                mem_tokens = budget
            sections.append(ContextSection(
                name="project_memory",
                content=mem_content,
                token_count=mem_tokens,
                priority=2,
            ))
            total_used += mem_tokens

        # P3: Task history (truncates oldest first)
        if task_history:
            budget = self._budgets["task_history"]
            remaining = self._total_cap - total_used
            effective_budget = min(budget, remaining)
            if effective_budget > 0:
                history_content, history_tokens = self._pack_history(
                    task_history, effective_budget
                )
                if history_tokens > effective_budget:
                    truncated.append("task_history")
                    history_tokens = effective_budget
                sections.append(ContextSection(
                    name="task_history",
                    content=history_content,
                    token_count=history_tokens,
                    priority=3,
                ))
                total_used += history_tokens

        logger.debug(
            "context.assembled",
            total_tokens=total_used,
            sections=len(sections),
            rag_chunks=rag_count,
            memory_items=mem_count,
            truncated=truncated,
        )

        return AssembledContext(
            sections=sections,
            total_tokens=total_used,
            budget_remaining=self._total_cap - total_used,
            truncated_sections=truncated,
            rag_chunk_count=rag_count,
            memory_item_count=mem_count,
        )

    def _truncate_to_budget(self, text: str, budget: int) -> str:
        """Truncate text to fit within token budget."""
        max_chars = budget * 4  # ~4 chars/token
        if len(text) <= max_chars:
            return text
        return text[:max_chars] + "\n... [TRUNCATED]"

    def _pack_files(
        self,
        files: list[dict[str, str]],
        budget: int,
    ) -> tuple[str, int, list[str]]:
        """Pack target files into context within budget."""
        parts: list[str] = []
        chunk_ids: list[str] = []
        total_tokens = 0

        for f in files:
            path = f.get("path", "unknown")
            content = f.get("content", "")
            section = f"--- File: {path} ---\n{content}\n"
            tokens = estimate_tokens(section)

            if total_tokens + tokens > budget:
                # Truncate remaining file content
                remaining_budget = budget - total_tokens
                if remaining_budget > 100:  # Only include if meaningful
                    section = self._truncate_to_budget(section, remaining_budget)
                    tokens = remaining_budget
                else:
                    break

            parts.append(section)
            chunk_ids.append(path)
            total_tokens += tokens

        return "\n".join(parts), total_tokens, chunk_ids

    def _pack_rag_chunks(
        self,
        results: list[RetrievalResult],
        budget: int,
    ) -> tuple[str, int, list[str]]:
        """Pack RAG chunks into context, ordered by RRF score."""
        parts: list[str] = []
        chunk_ids: list[str] = []
        total_tokens = 0

        # Results should already be sorted by RRF score
        for result in results:
            # Format with provenance citation
            header = f"[{result.file_path}"
            if result.symbol_name:
                header += f" :: {result.symbol_name}"
            if result.start_line:
                header += f" L{result.start_line}-{result.end_line}"
            header += f" | {result.source}]"

            section = f"<retrieved_context id=\"{result.chunk_id}\" source=\"{result.file_path}\">\n{header}\n{result.content}\n</retrieved_context>"
            tokens = estimate_tokens(section)

            if total_tokens + tokens > budget:
                break

            parts.append(section)
            chunk_ids.append(result.chunk_id)
            total_tokens += tokens

        return "\n\n".join(parts), total_tokens, chunk_ids

    def _pack_memory(
        self,
        items: list[dict[str, str]],
        budget: int,
    ) -> tuple[str, int]:
        """Pack project memory items into context."""
        parts: list[str] = []
        total_tokens = 0

        for item in items:
            title = item.get("title", "Untitled")
            content = item.get("content", "")
            category = item.get("category", "GENERAL")
            section = f"[Memory: {category}] {title}\n{content}"
            tokens = estimate_tokens(section)

            if total_tokens + tokens > budget:
                break

            parts.append(section)
            total_tokens += tokens

        return "\n\n".join(parts), total_tokens

    def _pack_history(
        self,
        history: list[str],
        budget: int,
    ) -> tuple[str, int]:
        """Pack task history, truncating oldest entries first."""
        parts: list[str] = []
        total_tokens = 0

        # Process newest first, then reverse
        for entry in reversed(history):
            tokens = estimate_tokens(entry)
            if total_tokens + tokens > budget:
                break
            parts.append(entry)
            total_tokens += tokens

        parts.reverse()  # Chronological order
        return "\n".join(parts), total_tokens
