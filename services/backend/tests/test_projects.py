"""Tests for Project endpoints and lifecycle."""

import tempfile
import pytest
from httpx import ASGITransport, AsyncClient

from nexus.main import app
from nexus.models.base import init_db


@pytest.fixture(autouse=True)
async def setup_db():
    await init_db()


@pytest.mark.asyncio
async def test_create_and_get_project() -> None:
    """Creating a project should return 201 and persist it."""
    with tempfile.TemporaryDirectory() as tmpdir:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            create_resp = await client.post(
                "/api/v1/projects",
                json={"name": "Test Project", "path": tmpdir, "description": "A test project"},
            )
            assert create_resp.status_code == 201
            project_data = create_resp.json()
            project_id = project_data["id"]
            assert project_data["name"] == "Test Project"
            assert project_id.startswith("prj_")

            # Get project
            get_resp = await client.get(f"/api/v1/projects/{project_id}")
            assert get_resp.status_code == 200
            assert get_resp.json()["id"] == project_id

            # List projects
            list_resp = await client.get("/api/v1/projects")
            assert list_resp.status_code == 200
            data = list_resp.json()
            assert any(p["id"] == project_id for p in data["projects"])
