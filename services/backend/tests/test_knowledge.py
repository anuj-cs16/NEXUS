"""Tests for NEXUS Knowledge System — Chunker, Embeddings, FTS5, Vector, RRF Retrieval, Context Assembler, Indexer, and API endpoints."""

import os
import tempfile
from pathlib import Path

import pytest
from httpx import ASGITransport, AsyncClient

from nexus.knowledge.chunker import (
    ChunkType,
    chunk_file,
    detect_language,
    redact_secrets,
)
from nexus.knowledge.context import ContextAssembler, TokenBudget
from nexus.knowledge.embeddings import NoopEmbeddingAdapter, get_embedding_adapter
from nexus.knowledge.fts_store import (
    create_fts_table,
    delete_document_fts,
    index_chunks_fts,
    search_fts,
)
from nexus.knowledge.indexer import RepositoryIndexer
from nexus.knowledge.retrieval import HybridRetriever
from nexus.knowledge.vector_store import VectorStore
from nexus.main import app
from nexus.models.base import async_session_factory, init_db


@pytest.fixture(autouse=True)
async def setup_db():
    await init_db()


def test_detect_language() -> None:
    """Test file language detection from extension and filename."""
    assert detect_language(Path("main.py")) == "python"
    assert detect_language(Path("app.tsx")) == "typescript"
    assert detect_language(Path("index.js")) == "javascript"
    assert detect_language(Path("lib.rs")) == "rust"
    assert detect_language(Path("README.md")) == "markdown"
    assert detect_language(Path("config.toml")) == "toml"
    assert detect_language(Path("Dockerfile")) == "dockerfile"
    assert detect_language(Path("unknown.xyz")) is None


def test_redact_secrets() -> None:
    """Test secret pattern redaction."""
    raw = "const API_KEY = 'sk-1234567890abcdef1234567890abcdef';"
    redacted = redact_secrets(raw)
    assert "sk-1234567890" not in redacted
    assert "[REDACTED]" in redacted


def test_chunk_python_file() -> None:
    """Test Python AST structure-aware chunking."""
    code = '''"""Module docstring."""

import os

class DataProcessor:
    """Processes datasets."""

    def __init__(self, name: str):
        self.name = name

    def execute(self) -> bool:
        return True


def helper_func(x: int) -> int:
    """A standalone helper function."""
    return x * 2
'''
    chunks = chunk_file("src/processor.py", code)
    assert len(chunks) >= 2

    # Verify class/function symbols are detected
    symbols = {c.symbol_name for c in chunks if c.symbol_name}
    assert "DataProcessor" in symbols or "DataProcessor.execute" in symbols or "helper_func" in symbols
    assert all(c.file_path == "src/processor.py" for c in chunks)
    assert all(c.language == "python" for c in chunks)


def test_chunk_markdown_file() -> None:
    """Test Markdown header-based chunking."""
    doc = """# Project Overview

NEXUS is an autonomous multi-agent developer system.

## Architecture

The architecture consists of a backend and frontend.

### Retrieval Engine

Retrieval uses hybrid RRF fusion.
"""
    chunks = chunk_file("docs/overview.md", doc)
    assert len(chunks) >= 2
    assert any("Project Overview" in c.symbol_name for c in chunks if c.symbol_name)
    assert all(c.chunk_type == ChunkType.HEADING_SECTION for c in chunks)


@pytest.mark.asyncio
async def test_noop_embedding_adapter() -> None:
    """Test NoopEmbeddingAdapter behaviors."""
    adapter = NoopEmbeddingAdapter()
    assert adapter.dimension == 0
    assert await adapter.embed_query("test query") == []
    assert await adapter.embed(["text 1", "text 2"]) == [[], []]



@pytest.mark.asyncio
async def test_fts_lifecycle_and_search() -> None:
    """Test SQLite FTS5 table initialization, chunk indexing, search, and cleanup."""
    async with async_session_factory() as session:
        await create_fts_table(session)

        chunks_data = [
            {
                "chunk_id": "chk_1",
                "file_path": "services/auth.py",
                "start_line": 1,
                "end_line": 20,
                "content": "def authenticate_user(token: str) -> bool: return verify_jwt(token)",
                "symbol_name": "authenticate_user",
                "chunk_type": "code",
                "language": "python",
                "token_count": 15,
            },
            {
                "chunk_id": "chk_2",
                "file_path": "services/billing.py",
                "start_line": 1,
                "end_line": 30,
                "content": "def calculate_invoice(user_id: str, amount: float) -> dict: return {'id': user_id, 'amount': amount}",
                "symbol_name": "calculate_invoice",
                "chunk_type": "code",
                "language": "python",
                "token_count": 22,
            },
        ]

        await index_chunks_fts(
            session=session,
            project_id="prj_test_123",
            file_path="services/auth.py",
            chunks=chunks_data[:1],
        )
        await index_chunks_fts(
            session=session,
            project_id="prj_test_123",
            file_path="services/billing.py",
            chunks=chunks_data[1:],
        )
        await session.commit()

        # Search for authenticate
        results = await search_fts(session, project_id="prj_test_123", query="authenticate_user", top_k=5)
        assert len(results) >= 1
        assert results[0]["chunk_id"] == "chk_1"
        assert results[0]["symbol_name"] == "authenticate_user"

        # Search for invoice
        results_invoice = await search_fts(session, project_id="prj_test_123", query="calculate_invoice", top_k=5)
        assert len(results_invoice) >= 1
        assert results_invoice[0]["chunk_id"] == "chk_2"

        # Delete document from FTS
        await delete_document_fts(session, project_id="prj_test_123", file_path="services/auth.py")
        await session.commit()


        # Verify search no longer finds deleted document
        results_after = await search_fts(session, project_id="prj_test_123", query="authenticate_user", top_k=5)
        assert len(results_after) == 0


@pytest.mark.asyncio
async def test_hybrid_retriever_fallback() -> None:
    """Test HybridRetriever with NoopEmbedding fallback to pure FTS5 results."""
    vector_store = VectorStore(embedding_adapter=NoopEmbeddingAdapter())
    retriever = HybridRetriever(vector_store=vector_store)

    async with async_session_factory() as session:
        await create_fts_table(session)
        chunks_data = [
            {
                "chunk_id": "chk_hybrid_1",
                "file_path": "nexus/core.py",
                "start_line": 1,
                "end_line": 10,
                "content": "class OrchestratorEngine: def run_loop(self): pass",
                "symbol_name": "OrchestratorEngine",
                "chunk_type": "code",
                "language": "python",
                "token_count": 12,
            }
        ]
        await index_chunks_fts(
            session=session,
            project_id="prj_hybrid_test",
            file_path="nexus/core.py",
            chunks=chunks_data,
        )
        await session.commit()

        results = await retriever.search(
            session=session,
            project_id="prj_hybrid_test",
            query="OrchestratorEngine",
            top_k=5,
        )
        assert len(results) >= 1
        assert results[0].chunk_id == "chk_hybrid_1"
        assert results[0].rrf_score > 0.0


def test_context_assembler() -> None:
    """Test ContextAssembler budget allocation and prompt packing."""
    budget = TokenBudget.for_32k()
    assembler = ContextAssembler(budget=budget)

    system_prompt = "You are an autonomous software developer."
    task_goal = "Implement a new database migration utility."
    target_files = [
        {"path": "models.py", "content": "class UserModel: pass"}
    ]
    rag_chunks = [
        {"file_path": "db.py", "content": "def connect_db(): pass", "start_line": 1, "end_line": 10}
    ]

    context = assembler.assemble(
        system_prompt=system_prompt,
        task_goal=task_goal,
        target_files=target_files,
        rag_chunks=rag_chunks,
    )

    assert "<nexus_system>" in context.prompt
    assert "<nexus_goal>" in context.prompt
    assert "<nexus_target_files>" in context.prompt
    assert "<nexus_rag_context>" in context.prompt
    assert context.total_tokens > 0
    assert context.total_tokens <= budget.total_limit


@pytest.mark.asyncio
async def test_repository_indexer_and_api() -> None:
    """Test full repository indexer execution and knowledge API endpoints."""
    with tempfile.TemporaryDirectory() as tmpdir:
        tmp_path = Path(tmpdir)

        # Create sample files
        (tmp_path / "main.py").write_text(
            'def entrypoint():\n    """App entrypoint"""\n    print("Hello NEXUS")\n',
            encoding="utf-8",
        )
        (tmp_path / "README.md").write_text(
            "# Temporary Repo\nDocumentation for test project.\n",
            encoding="utf-8",
        )

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # 1. Create project
            create_resp = await client.post(
                "/api/v1/projects",
                json={"name": "Knowledge Test Project", "path": str(tmp_path), "description": "Indexer test"},
            )
            assert create_resp.status_code == 201
            project_id = create_resp.json()["id"]

            # 2. Trigger indexing
            index_resp = await client.post(
                f"/api/v1/projects/{project_id}/knowledge/index",
                json={"force_reindex": True},
            )
            assert index_resp.status_code == 200
            index_data = index_resp.json()
            assert index_data["project_id"] == project_id
            assert index_data["files_scanned"] >= 2
            assert index_data["files_indexed"] >= 2
            assert index_data["chunks_created"] >= 2

            # 3. Query knowledge stats
            stats_resp = await client.get(f"/api/v1/projects/{project_id}/knowledge/stats")
            assert stats_resp.status_code == 200
            stats_data = stats_resp.json()
            assert stats_data["total_files"] >= 2
            assert stats_data["total_chunks"] >= 2
            assert stats_data["fts_enabled"] is True

            # 4. Search knowledge
            search_resp = await client.get(
                f"/api/v1/projects/{project_id}/knowledge/search",
                params={"q": "entrypoint"},
            )
            assert search_resp.status_code == 200
            search_data = search_resp.json()
            assert search_data["total_results"] >= 1
            assert any("entrypoint" in r["content"] for r in search_data["results"])
