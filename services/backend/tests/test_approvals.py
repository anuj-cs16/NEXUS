"""Tests for Approval Service and endpoints."""

import tempfile
import pytest
from httpx import ASGITransport, AsyncClient

from nexus.main import app
from nexus.models.base import init_db
from nexus.services.approval_service import ApprovalService
from nexus.models.base import async_session_factory


@pytest.fixture(autouse=True)
async def setup_db():
    await init_db()


@pytest.mark.asyncio
async def test_approval_creation_and_resolution() -> None:
    with tempfile.TemporaryDirectory() as tmpdir:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # 1. Create project & task
            p_res = await client.post("/api/v1/projects", json={"name": "Approval Project", "path": tmpdir})
            project_id = p_res.json()["id"]

            t_res = await client.post(f"/api/v1/projects/{project_id}/tasks", json={"goal": "Test approval"})
            task_id = t_res.json()["id"]

            # 2. Create approval via service
            async with async_session_factory() as session:
                service = ApprovalService(session)
                approval = await service.create_approval_request(
                    task_id=task_id,
                    agent_type="developer",
                    tool_name="execute_command",
                    risk_level="high",
                    description="Run dangerous rm -rf / command",
                )
                approval_id = approval.id
                await session.commit()

            # 3. List approvals via API
            list_res = await client.get("/api/v1/approvals")
            assert list_res.status_code == 200
            data = list_res.json()
            assert any(a["id"] == approval_id for a in data["approvals"])

            # 4. Resolve approval
            resolve_res = await client.post(
                f"/api/v1/approvals/{approval_id}/resolve",
                json={"status": "approved", "reason": "User approved execution"},
            )
            assert resolve_res.status_code == 200
            assert resolve_res.json()["status"] == "approved"
            assert resolve_res.json()["resolution_reason"] == "User approved execution"
