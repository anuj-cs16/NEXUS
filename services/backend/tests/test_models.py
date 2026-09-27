"""Tests for AI models endpoint."""

import pytest
from httpx import ASGITransport, AsyncClient

from nexus.main import app


@pytest.mark.asyncio
async def test_get_models_endpoint() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/models")
        assert response.status_code == 200
        data = response.json()
        assert "models" in data
        assert "default_model" in data
        assert "ollama_connected" in data


@pytest.mark.asyncio
async def test_get_model_status_endpoint() -> None:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/models/status")
        assert response.status_code == 200
        data = response.json()
        assert "ollama_connected" in data
        assert "ollama_url" in data
