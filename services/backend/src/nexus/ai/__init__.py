"""NEXUS AI package — Model provider abstraction and local LLM integrations."""

from nexus.ai.ollama_adapter import OllamaAdapter
from nexus.ai.provider import ChatMessage, ModelInfo, ModelProvider, StreamChunk

__all__ = [
    "ChatMessage",
    "ModelInfo",
    "ModelProvider",
    "OllamaAdapter",
    "StreamChunk",
]
