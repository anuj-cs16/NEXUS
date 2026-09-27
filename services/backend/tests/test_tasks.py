"""Tests for Task endpoints and lifecycle state transitions."""

import tempfile
import pytest
from httpx import ASGITransport, AsyncClient

from nexus.main import app
from nexus.models.base import init_db


@pytest.fixture(autouse=True)
async def setup_db():
    await init_db()


@pytest.mark.asyncio
async def test_task_lifecycle_endpoints() -> None:
    """Test creating, fetching, and cancelling tasks."""
    with tempfile.TemporaryDirectory() as tmpdir:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # Create project
            p_resp = await client.post(
                "/api/v1/projects",
                json={"name": "Task Test Project", "path": tmpdir},
            )
            assert p_resp.status_code == 201
            project_id = p_resp.json()["id"]

            # Create task
            t_resp = await client.post(
                f"/api/v1/projects/{project_id}/tasks",
                json={
                    "goal": "Implement a fibonacci function in math.py",
                },
            )
            assert t_resp.status_code == 201
            task_data = t_resp.json()
            task_id = task_data["id"]
            assert task_id.startswith("tsk_")
            assert task_data["status"] == "created"

            # Fetch task
            get_t = await client.get(f"/api/v1/projects/{project_id}/tasks/{task_id}")
            assert get_t.status_code == 200
            assert get_t.json()["id"] == task_id

            # List tasks
            list_t = await client.get(f"/api/v1/projects/{project_id}/tasks")
            assert list_t.status_code == 200
            assert any(t["id"] == task_id for t in list_t.json()["tasks"])

            # Cancel task
            cancel_resp = await client.post(
                f"/api/v1/projects/{project_id}/tasks/{task_id}/cancel",
            )
            assert cancel_resp.status_code == 200
            assert cancel_resp.json()["status"] == "cancelled"
