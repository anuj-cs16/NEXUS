"""Tests for NEXUS Agents and Orchestration Engine."""

import tempfile
from collections.abc import AsyncIterator
from pathlib import Path
import pytest

from nexus.ai.provider import ChatMessage, ModelInfo, ModelProvider, StreamChunk
from nexus.models.base import init_db
from nexus.orchestration.context import AgentContext
from nexus.orchestration.engine import OrchestrationEngine
from nexus.agents.planner import PlannerAgent
from nexus.agents.developer import DeveloperAgent


class MockModelProvider(ModelProvider):
    """Deterministic model provider for fast unit tests."""

    def __init__(self, responses: list[str] | None = None) -> None:
        self.responses = responses or [
            '```json\n{"action": "write_file", "params": {"file_path": "math.py", "content": "def add(a, b):\\n    return a + b\\n"}}\n```',
            "I have written the file math.py with the requested function.",
        ]
        self._call_idx = 0

    async def check_health(self) -> bool:
        return True

    async def list_models(self) -> list[ModelInfo]:
        return [ModelInfo(name="mock-model")]

    async def chat(self, messages: list[ChatMessage], **kwargs) -> str:
        if self._call_idx < len(self.responses):
            resp = self.responses[self._call_idx]
            self._call_idx += 1
            return resp
        return "Task completed successfully."

    async def chat_stream(self, messages: list[ChatMessage], **kwargs) -> AsyncIterator[StreamChunk]:
        yield StreamChunk(content="done", is_done=True)


@pytest.fixture(autouse=True)
async def setup_db():
    await init_db()


@pytest.mark.asyncio
async def test_agent_tool_invocation_loop() -> None:
    with tempfile.TemporaryDirectory() as tmpdir:
        ws = Path(tmpdir)
        provider = MockModelProvider()
        agent = DeveloperAgent(provider=provider)

        context = AgentContext(
            task_id="tsk_test123",
            project_id="prj_test123",
            workspace_path=ws,
            goal="Create math.py with add function",
        )

        result = await agent.execute(context)
        assert result.success is True
        assert result.tool_calls_count == 1
        assert (ws / "math.py").exists()
        assert "def add" in (ws / "math.py").read_text()


@pytest.mark.asyncio
async def test_orchestration_engine_pipeline() -> None:
    with tempfile.TemporaryDirectory() as tmpdir:
        ws = Path(tmpdir)
        provider = MockModelProvider(
            responses=[
                "1. Create math.py\n2. Add test\n3. Review",  # Planner
                "I implemented the math functions.",           # Developer
                "All tests passed: 5 passed in 0.1s",           # Tester
                "Status: PASSED - No vulnerabilities detected.", # Security
                "Review complete: clean implementation.",      # Reviewer
            ]
        )
        engine = OrchestrationEngine(provider=provider)

        # Create project and task in DB first
        from httpx import ASGITransport, AsyncClient
        from nexus.main import app

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            p_resp = await client.post("/api/v1/projects", json={"name": "Pipeline Project", "path": tmpdir})
            project_id = p_resp.json()["id"]

            t_resp = await client.post(f"/api/v1/projects/{project_id}/tasks", json={"goal": "Build math lib"})
            task_id = t_resp.json()["id"]

        state = await engine.run_task(
            task_id=task_id,
            project_id=project_id,
            workspace_path=ws,
            goal="Build math lib",
        )

        assert state.current_status == "completed"
        assert state.plan is not None
        assert state.review_summary is not None
