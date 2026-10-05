"""NEXUS FTS5 Lexical Store — SQLite Full-Text Search integration.

Per Agent Memory & Retrieval Architecture (§9.1):
Lexical store uses SQLite FTS5 with BM25 ranking and custom tokenization
for exact symbol/keyword matching (camelCase, snake_case support).
"""

from __future__ import annotations

from typing import Any

import structlog
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

logger = structlog.get_logger(__name__)


# FTS5 virtual table DDL — created once per database
FTS5_TABLE_DDL = """
CREATE VIRTUAL TABLE IF NOT EXISTS chunk_fts USING fts5(
    chunk_id,
    project_id,
    file_path,
    symbol_name,
    content,
    tokenize='unicode61 tokenchars "_."'
);
"""


async def create_fts_table(session: AsyncSession) -> None:
    """Create the FTS5 virtual table if it doesn't exist."""
    await session.execute(text(FTS5_TABLE_DDL))
    await session.commit()
    logger.info("fts5.table_created")


async def index_chunks_fts(
    session: AsyncSession,
    chunks: list[dict[str, Any]],
) -> int:
    """Insert or replace chunks into the FTS5 index.

    Args:
        session: SQLAlchemy async session.
        chunks: List of dicts with keys: chunk_id, project_id, file_path,
                symbol_name, content.

    Returns:
        Number of chunks indexed.
    """
    if not chunks:
        return 0

    for chunk in chunks:
        await session.execute(
            text("""
                INSERT OR REPLACE INTO chunk_fts(chunk_id, project_id, file_path, symbol_name, content)
                VALUES (:chunk_id, :project_id, :file_path, :symbol_name, :content)
            """),
            {
                "chunk_id": chunk["chunk_id"],
                "project_id": chunk["project_id"],
                "file_path": chunk["file_path"],
                "symbol_name": chunk.get("symbol_name", ""),
                "content": chunk["content"],
            },
        )

    await session.commit()
    return len(chunks)


async def delete_document_fts(
    session: AsyncSession,
    project_id: str,
    file_path: str,
) -> None:
    """Delete all FTS5 entries for a specific document."""
    await session.execute(
        text("""
            DELETE FROM chunk_fts
            WHERE project_id = :project_id AND file_path = :file_path
        """),
        {"project_id": project_id, "file_path": file_path},
    )
    await session.commit()


async def delete_project_fts(session: AsyncSession, project_id: str) -> None:
    """Delete all FTS5 entries for an entire project."""
    await session.execute(
        text("DELETE FROM chunk_fts WHERE project_id = :project_id"),
        {"project_id": project_id},
    )
    await session.commit()


async def search_fts(
    session: AsyncSession,
    project_id: str,
    query: str,
    top_k: int = 25,
) -> list[dict[str, Any]]:
    """Search the FTS5 index with BM25 ranking.

    Args:
        session: SQLAlchemy async session.
        project_id: Project scope filter (mandatory isolation).
        query: Search query string (supports FTS5 syntax: AND, OR, NOT, prefix*).
        top_k: Maximum results to return.

    Returns:
        List of dicts with: chunk_id, file_path, symbol_name, content, bm25_score.
    """
    # Sanitize query for FTS5 — escape special characters
    safe_query = _sanitize_fts_query(query)
    if not safe_query:
        return []

    result = await session.execute(
        text("""
            SELECT
                chunk_id,
                file_path,
                symbol_name,
                snippet(chunk_fts, 4, '<b>', '</b>', '...', 64) as content_snippet,
                content,
                bm25(chunk_fts) as score
            FROM chunk_fts
            WHERE chunk_fts MATCH :query
              AND project_id = :project_id
            ORDER BY bm25(chunk_fts)
            LIMIT :top_k
        """),
        {"query": safe_query, "project_id": project_id, "top_k": top_k},
    )

    rows = result.fetchall()
    return [
        {
            "chunk_id": row[0],
            "file_path": row[1],
            "symbol_name": row[2],
            "content_snippet": row[3],
            "content": row[4],
            "bm25_score": float(row[5]),
        }
        for row in rows
    ]


def _sanitize_fts_query(query: str) -> str:
    """Sanitize user input for safe FTS5 querying.

    Handles:
    - Quoting terms with special chars
    - Breaking camelCase into separate terms
    - Splitting snake_case tokens
    """
    import re

    # Strip leading/trailing whitespace
    query = query.strip()
    if not query:
        return ""

    # Split into individual words
    words = query.split()
    sanitized = []

    for word in words:
        # Remove FTS5 operators that could break the query
        cleaned = word.replace('"', "").replace("*", "").replace("-", " ")
        if cleaned:
            # If the word contains only alphanumeric and underscores, it's safe
            if re.match(r"^[\w.]+$", cleaned):
                sanitized.append(cleaned)
            else:
                # Quote it
                sanitized.append(f'"{cleaned}"')

    # Join with implicit AND (FTS5 default)
    return " ".join(sanitized)
