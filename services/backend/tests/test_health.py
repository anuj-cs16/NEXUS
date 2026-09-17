"""Tests for the NEXUS health check endpoint."""

import pytest
from httpx import ASGITransport, AsyncClient

from nexus.main import app


@pytest.mark.asyncio
async def test_health_check_returns_ok() -> None:
    """Health endpoint should return status ok with version info."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/health")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["version"] == "0.1.0"
    assert "python_version" in data
    assert "timestamp" in data


@pytest.mark.asyncio
async def test_health_check_contains_ollama_url() -> None:
    """Health response should include the configured Ollama URL."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/health")

    data = response.json()
    assert "ollama_url" in data
    assert "127.0.0.1" in data["ollama_url"]
