"""Tests for AI provider and Ollama adapter."""

import json
from unittest.mock import AsyncMock, patch
import httpx
import pytest

from nexus.ai.ollama_adapter import OllamaAdapter
from nexus.ai.provider import ChatMessage


@pytest.mark.asyncio
async def test_ollama_check_health_disconnected() -> None:
    adapter = OllamaAdapter(base_url="http://127.0.0.1:99999")
    is_healthy = await adapter.check_health()
    assert is_healthy is False


@pytest.mark.asyncio
async def test_ollama_chat_payload_formatting() -> None:
    adapter = OllamaAdapter(default_model="codellama:7b")
    messages = [
        ChatMessage(role="system", content="You are an expert coder."),
        ChatMessage(role="user", content="Write hello world in python."),
    ]
    payload = adapter._build_payload(messages, model="codellama:7b", temperature=0.5, max_tokens=100, stop=["\n\n"], stream=False)

    assert payload["model"] == "codellama:7b"
    assert len(payload["messages"]) == 2
    assert payload["options"]["temperature"] == 0.5
    assert payload["options"]["num_predict"] == 100
    assert payload["options"]["stop"] == ["\n\n"]
    assert payload["stream"] is False


@pytest.mark.asyncio
async def test_ollama_chat_mocked_response() -> None:
    adapter = OllamaAdapter()
    messages = [ChatMessage(role="user", content="Hi")]

    mock_resp = httpx.Response(
        status_code=200,
        json={"message": {"content": "Hello! How can I help with your code today?"}},
        request=httpx.Request("POST", "http://127.0.0.1:11434/api/chat"),
    )

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_resp
        response = await adapter.chat(messages)
        assert response == "Hello! How can I help with your code today?"
