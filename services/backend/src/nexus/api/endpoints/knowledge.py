"""NEXUS Knowledge endpoints — Indexing, RRF Hybrid Search & Diagnostics.

Per Agent Memory & Retrieval Architecture (§6, §10, §13):
Provides REST endpoints for triggering incremental indexing, executing
hybrid semantic/lexical queries, and viewing index telemetry.
"""

from __future__ import annotations

import time
from fastapi import APIRouter, Query
from sqlalchemy import func, select

from nexus.api.dependencies import DbSession
from nexus.knowledge.embeddings import get_embedding_adapter
from nexus.knowledge.indexer import RepositoryIndexer
from nexus.knowledge.retrieval import HybridRetriever
from nexus.knowledge.vector_store import VectorStore
from nexus.models.knowledge import IndexedChunk, IndexedDocument
from nexus.schemas.knowledge import (
    KnowledgeIndexRequest,
    KnowledgeIndexResponse,
    KnowledgeSearchResponse,
    KnowledgeSearchResultItem,
    KnowledgeStatsResponse,
)
from nexus.services.project_service import ProjectService

router = APIRouter()

# Shared vector store & indexer instances
_embedding_adapter = get_embedding_adapter()
_vector_store = VectorStore(embedding_adapter=_embedding_adapter)
_indexer = RepositoryIndexer(vector_store=_vector_store)
_retriever = HybridRetriever(vector_store=_vector_store)


@router.post("/index", response_model=KnowledgeIndexResponse)
async def index_project_repository(
    project_id: str,
    data: KnowledgeIndexRequest,
    session: DbSession,
) -> KnowledgeIndexResponse:
    """Trigger incremental repository indexing for a project workspace."""
    project_service = ProjectService(session)
    project = await project_service.get_project(project_id)

    start_time = time.perf_counter()
    stats = await _indexer.index_project(
        session=session,
        project_id=project_id,
        root_path=project.path,
        force_rebuild=data.force_reindex,
    )
    elapsed = time.perf_counter() - start_time

    return KnowledgeIndexResponse(
        project_id=project_id,
        files_scanned=stats.files_discovered,
        files_indexed=stats.files_indexed,
        files_skipped=stats.files_skipped_unchanged,
        chunks_created=stats.chunks_created,
        elapsed_seconds=round(elapsed, 3),
        errors=[],
    )


@router.get("/search", response_model=KnowledgeSearchResponse)
async def search_project_knowledge(
    project_id: str,
    session: DbSession,
    q: str = Query(..., description="Natural language search query or symbol"),
    top_k: int = Query(10, ge=1, le=50, description="Max number of ranked results"),
) -> KnowledgeSearchResponse:
    """Execute hybrid (BM25 + ChromaDB) search with Reciprocal Rank Fusion."""
    project_service = ProjectService(session)
    await project_service.get_project(project_id)

    results = await _retriever.search(
        session=session,
        project_id=project_id,
        query=q,
        top_k=top_k,
    )

    items = [
        KnowledgeSearchResultItem(
            chunk_id=r.chunk_id,
            file_path=r.file_path,
            start_line=r.start_line,
            end_line=r.end_line,
            content=r.content,
            score=round(r.rrf_score, 4),
            chunk_type=r.metadata.get("chunk_type", "code"),
            language=r.metadata.get("language", "text"),
            symbol_name=r.symbol_name,
        )
        for r in results
    ]

    return KnowledgeSearchResponse(
        project_id=project_id,
        query=q,
        results=items,
        total_results=len(items),
    )


@router.get("/stats", response_model=KnowledgeStatsResponse)
async def get_knowledge_stats(
    project_id: str,
    session: DbSession,
) -> KnowledgeStatsResponse:
    """Get indexing status, file/chunk count, and retrieval engine status."""
    project_service = ProjectService(session)
    await project_service.get_project(project_id)

    file_count_res = await session.execute(
        select(func.count(IndexedDocument.id)).where(
            IndexedDocument.project_id == project_id
        )
    )
    total_files = file_count_res.scalar() or 0

    chunk_count_res = await session.execute(
        select(func.count(IndexedChunk.id)).where(
            IndexedChunk.project_id == project_id
        )
    )
    total_chunks = chunk_count_res.scalar() or 0

    return KnowledgeStatsResponse(
        project_id=project_id,
        total_files=total_files,
        total_chunks=total_chunks,
        fts_enabled=True,
        vector_enabled=not _vector_store.is_noop,
        embedding_provider=_embedding_adapter.model_name,
    )
