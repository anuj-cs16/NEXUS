"""NEXUS AI Model Provider — abstract interface for LLM backends.

Defines the contract for local (Ollama) and future remote (Claude, OpenAI) model providers.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from collections.abc import AsyncIterator
from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class ChatMessage:
    """A single chat message in an LLM conversation."""

    role: str  # "system", "user", "assistant", "tool"
    content: str
    tool_calls: list[dict[str, Any]] = field(default_factory=list)


@dataclass(frozen=True)
class StreamChunk:
    """A streamed chunk of token generation."""

    content: str
    is_done: bool = False
    tokens_used: int = 0
    model: str = ""


@dataclass(frozen=True)
class ModelInfo:
    """Information about an available LLM model."""

    name: str
    size_bytes: int = 0
    modified_at: str = ""
    family: str = ""
    parameter_size: str = ""
    quantization_level: str = ""


class ModelProvider(ABC):
    """Abstract interface for LLM backends."""

    @abstractmethod
    async def check_health(self) -> bool:
        """Check if the model provider backend is reachable."""
        ...

    @abstractmethod
    async def list_models(self) -> list[ModelInfo]:
        """List all available models in the provider."""
        ...

    @abstractmethod
    async def chat(
        self,
        messages: list[ChatMessage],
        *,
        model: str | None = None,
        temperature: float = 0.2,
        max_tokens: int | None = None,
        stop: list[str] | None = None,
    ) -> str:
        """Generate a non-streaming chat completion."""
        ...

    @abstractmethod
    async def chat_stream(
        self,
        messages: list[ChatMessage],
        *,
        model: str | None = None,
        temperature: float = 0.2,
        max_tokens: int | None = None,
        stop: list[str] | None = None,
    ) -> AsyncIterator[StreamChunk]:
        """Stream chat completion tokens."""
        ...
