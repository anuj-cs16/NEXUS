"""NEXUS Hybrid Retriever — Reciprocal Rank Fusion (RRF) search.

Per Agent Memory & Retrieval Architecture (§10):
Combines lexical (SQLite FTS5 BM25) and semantic (ChromaDB dense vector) search
results using Reciprocal Rank Fusion to achieve high retrieval precision on
technical source code.

RRF Formula: RRF(d) = Σ 1/(k + rank_m(d)) for m ∈ {FTS5, Vector}
Where k = 60 is the standard smoothing constant.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from nexus.knowledge.fts_store import search_fts
from nexus.knowledge.vector_store import VectorStore

logger = structlog.get_logger(__name__)

# RRF smoothing constant (standard value from Cormack et al.)
RRF_K = 60


@dataclass
class RetrievalResult:
    """A single retrieval result with provenance and ranking metadata."""

    chunk_id: str
    content: str
    file_path: str
    symbol_name: str | None = None
    start_line: int = 0
    end_line: int = 0
    rrf_score: float = 0.0
    lexical_rank: int | None = None
    vector_rank: int | None = None
    source: str = "hybrid"  # "lexical", "vector", or "hybrid"
    metadata: dict[str, Any] = field(default_factory=dict)


class HybridRetriever:
    """Hybrid retrieval engine combining lexical and semantic search with RRF.

    Executes parallel searches against SQLite FTS5 (lexical/keyword) and
    ChromaDB (dense vector/semantic), then merges results using Reciprocal
    Rank Fusion for optimal retrieval precision on codebases.
    """

    def __init__(self, vector_store: VectorStore) -> None:
        self._vector_store = vector_store

    async def search(
        self,
        session: AsyncSession,
        project_id: str,
        query: str,
        top_k: int = 25,
        lexical_weight: float = 1.0,
        vector_weight: float = 1.0,
    ) -> list[RetrievalResult]:
        """Execute hybrid search with Reciprocal Rank Fusion.

        Args:
            session: SQLAlchemy async session for FTS5 queries.
            project_id: Project scope (mandatory isolation).
            query: Natural language or keyword search query.
            top_k: Maximum final results after fusion.
            lexical_weight: Multiplier for FTS5 RRF scores (default 1.0).
            vector_weight: Multiplier for vector RRF scores (default 1.0).

        Returns:
            Fused, deduplicated, and ranked list of RetrievalResult objects.
        """
        # Execute parallel searches
        lexical_hits = await self._search_lexical(session, project_id, query, top_k)
        vector_hits = await self._search_vector(project_id, query, top_k)

        logger.debug(
            "retrieval.search_completed",
            project_id=project_id,
            lexical_hits=len(lexical_hits),
            vector_hits=len(vector_hits),
        )

        # If only one source has results, use it directly
        if not lexical_hits and not vector_hits:
            return []
        if not vector_hits:
            return lexical_hits[:top_k]
        if not lexical_hits:
            return vector_hits[:top_k]

        # Merge with RRF
        fused = self._reciprocal_rank_fusion(
            lexical_hits, vector_hits, lexical_weight, vector_weight
        )

        # Deduplicate by chunk_id
        seen: set[str] = set()
        deduplicated = []
        for result in fused:
            if result.chunk_id not in seen:
                seen.add(result.chunk_id)
                deduplicated.append(result)

        return deduplicated[:top_k]

    async def _search_lexical(
        self,
        session: AsyncSession,
        project_id: str,
        query: str,
        top_k: int,
    ) -> list[RetrievalResult]:
        """Execute FTS5 BM25 lexical search."""
        try:
            hits = await search_fts(session, project_id, query, top_k)
        except Exception as e:
            logger.warning("retrieval.fts_search_failed", error=str(e))
            return []

        results = []
        for rank, hit in enumerate(hits):
            results.append(RetrievalResult(
                chunk_id=hit["chunk_id"],
                content=hit["content"],
                file_path=hit["file_path"],
                symbol_name=hit.get("symbol_name"),
                rrf_score=0.0,  # Will be computed during fusion
                lexical_rank=rank + 1,
                source="lexical",
                metadata={"bm25_score": hit.get("bm25_score", 0.0)},
            ))

        return results

    async def _search_vector(
        self,
        project_id: str,
        query: str,
        top_k: int,
    ) -> list[RetrievalResult]:
        """Execute ChromaDB dense vector semantic search."""
        if self._vector_store.is_noop:
            return []

        try:
            hits = await self._vector_store.search(project_id, query, top_k)
        except Exception as e:
            logger.warning("retrieval.vector_search_failed", error=str(e))
            return []

        results = []
        for rank, hit in enumerate(hits):
            metadata = hit.get("metadata", {})
            results.append(RetrievalResult(
                chunk_id=hit["chunk_id"],
                content=hit.get("content", ""),
                file_path=metadata.get("file_path", ""),
                symbol_name=metadata.get("symbol_name"),
                start_line=metadata.get("start_line", 0),
                end_line=metadata.get("end_line", 0),
                rrf_score=0.0,  # Will be computed during fusion
                vector_rank=rank + 1,
                source="vector",
                metadata={"distance": hit.get("distance", 1.0)},
            ))

        return results

    def _reciprocal_rank_fusion(
        self,
        lexical_results: list[RetrievalResult],
        vector_results: list[RetrievalResult],
        lexical_weight: float,
        vector_weight: float,
    ) -> list[RetrievalResult]:
        """Merge results using Reciprocal Rank Fusion.

        RRF(d) = Σ weight_m / (k + rank_m(d))
        """
        # Build score map by chunk_id
        scores: dict[str, float] = {}
        result_map: dict[str, RetrievalResult] = {}

        # Score lexical results
        for rank, result in enumerate(lexical_results, start=1):
            rrf_score = lexical_weight / (RRF_K + rank)
            scores[result.chunk_id] = scores.get(result.chunk_id, 0.0) + rrf_score

            if result.chunk_id not in result_map:
                result_map[result.chunk_id] = RetrievalResult(
                    chunk_id=result.chunk_id,
                    content=result.content,
                    file_path=result.file_path,
                    symbol_name=result.symbol_name,
                    start_line=result.start_line,
                    end_line=result.end_line,
                    lexical_rank=rank,
                    source="hybrid",
                    metadata=result.metadata,
                )
            else:
                result_map[result.chunk_id].lexical_rank = rank

        # Score vector results
        for rank, result in enumerate(vector_results, start=1):
            rrf_score = vector_weight / (RRF_K + rank)
            scores[result.chunk_id] = scores.get(result.chunk_id, 0.0) + rrf_score

            if result.chunk_id not in result_map:
                result_map[result.chunk_id] = RetrievalResult(
                    chunk_id=result.chunk_id,
                    content=result.content,
                    file_path=result.file_path,
                    symbol_name=result.symbol_name,
                    start_line=result.start_line,
                    end_line=result.end_line,
                    vector_rank=rank,
                    source="hybrid",
                    metadata=result.metadata,
                )
            else:
                result_map[result.chunk_id].vector_rank = rank

        # Assign final RRF scores
        for chunk_id, score in scores.items():
            result_map[chunk_id].rrf_score = score

            # Determine source attribution
            r = result_map[chunk_id]
            if r.lexical_rank is not None and r.vector_rank is not None:
                r.source = "hybrid"
            elif r.lexical_rank is not None:
                r.source = "lexical"
            else:
                r.source = "vector"

        # Sort by RRF score descending
        fused = sorted(result_map.values(), key=lambda r: r.rrf_score, reverse=True)
        return fused
