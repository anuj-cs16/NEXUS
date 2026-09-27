"""NEXUS Ollama Adapter — implementation of ModelProvider for local Ollama.

Communicates with Ollama's HTTP REST API (default http://127.0.0.1:11434).
Supports streaming NDJSON completions, model listing, and connection checks.
"""

from __future__ import annotations

import json
from collections.abc import AsyncIterator
from typing import Any

import httpx
import structlog

from nexus.ai.provider import ChatMessage, ModelInfo, ModelProvider, StreamChunk
from nexus.config import settings
from nexus.core.exceptions import LLMConnectionError, LLMResponseError

logger = structlog.get_logger(__name__)


class OllamaAdapter(ModelProvider):
    """Ollama local AI model provider adapter."""

    def __init__(
        self,
        base_url: str | None = None,
        default_model: str | None = None,
        timeout_seconds: float = 120.0,
    ) -> None:
        self.base_url = (base_url or settings.OLLAMA_BASE_URL).rstrip("/")
        self.default_model = default_model or settings.OLLAMA_MODEL
        self.timeout = timeout_seconds

    async def check_health(self) -> bool:
        """Check if Ollama server is running and reachable."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.base_url}/api/version")
                return response.status_code == 200
        except (httpx.ConnectError, httpx.TimeoutException, OSError):
            return False

    async def list_models(self) -> list[ModelInfo]:
        """List all models currently installed in Ollama."""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.base_url}/api/tags")
                if response.status_code != 200:
                    raise LLMResponseError(
                        f"Ollama returned HTTP {response.status_code} on model list",
                        provider="ollama",
                        status_code=response.status_code,
                    )
                data = response.json()
                models = []
                for m in data.get("models", []):
                    details = m.get("details", {})
                    models.append(
                        ModelInfo(
                            name=m.get("name", ""),
                            size_bytes=m.get("size", 0),
                            modified_at=m.get("modified_at", ""),
                            family=details.get("family", ""),
                            parameter_size=details.get("parameter_size", ""),
                            quantization_level=details.get("quantization_level", ""),
                        )
                    )
                return models
        except httpx.ConnectError as e:
            raise LLMConnectionError(
                f"Failed to connect to Ollama at {self.base_url}: {e}",
                provider="ollama",
                url=self.base_url,
            ) from e

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
        target_model = model or self.default_model
        payload = self._build_payload(
            messages,
            model=target_model,
            temperature=temperature,
            max_tokens=max_tokens,
            stop=stop,
            stream=False,
        )

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/api/chat",
                    json=payload,
                )
                if response.status_code != 200:
                    raise LLMResponseError(
                        f"Ollama chat failed with HTTP {response.status_code}: {response.text}",
                        provider="ollama",
                        status_code=response.status_code,
                    )
                data = response.json()
                return data.get("message", {}).get("content", "")
        except httpx.ConnectError as e:
            raise LLMConnectionError(
                f"Failed to connect to Ollama at {self.base_url}: {e}",
                provider="ollama",
                url=self.base_url,
            ) from e

    async def chat_stream(
        self,
        messages: list[ChatMessage],
        *,
        model: str | None = None,
        temperature: float = 0.2,
        max_tokens: int | None = None,
        stop: list[str] | None = None,
    ) -> AsyncIterator[StreamChunk]:
        """Stream chat tokens from Ollama via NDJSON."""
        target_model = model or self.default_model
        payload = self._build_payload(
            messages,
            model=target_model,
            temperature=temperature,
            max_tokens=max_tokens,
            stop=stop,
            stream=True,
        )

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                async with client.stream(
                    "POST",
                    f"{self.base_url}/api/chat",
                    json=payload,
                ) as response:
                    if response.status_code != 200:
                        raise LLMResponseError(
                            f"Ollama stream failed with HTTP {response.status_code}",
                            provider="ollama",
                            status_code=response.status_code,
                        )
                    async for line in response.aiter_lines():
                        if not line.strip():
                            continue
                        try:
                            chunk_data = json.loads(line)
                        except json.JSONDecodeError:
                            continue

                        content = chunk_data.get("message", {}).get("content", "")
                        done = chunk_data.get("done", False)
                        eval_count = chunk_data.get("eval_count", 0)

                        yield StreamChunk(
                            content=content,
                            is_done=done,
                            tokens_used=eval_count,
                            model=target_model,
                        )
        except httpx.ConnectError as e:
            raise LLMConnectionError(
                f"Failed to connect to Ollama at {self.base_url}: {e}",
                provider="ollama",
                url=self.base_url,
            ) from e

    def _build_payload(
        self,
        messages: list[ChatMessage],
        *,
        model: str,
        temperature: float,
        max_tokens: int | None,
        stop: list[str] | None,
        stream: bool,
    ) -> dict[str, Any]:
        """Format request payload according to Ollama API specs."""
        options: dict[str, Any] = {"temperature": temperature}
        if max_tokens:
            options["num_predict"] = max_tokens
        if stop:
            options["stop"] = stop

        return {
            "model": model,
            "messages": [{"role": m.role, "content": m.content} for m in messages],
            "stream": stream,
            "options": options,
        }
