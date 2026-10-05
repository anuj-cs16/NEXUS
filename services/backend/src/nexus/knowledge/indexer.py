"""NEXUS Repository Indexer — incremental file indexing with hash-based change detection.

Per Agent Memory & Retrieval Architecture (§6, §7, §13):
The knowledge ingestion engine converts raw code and documentation into
structured, searchable retrieval units. Indexing is yielding, incremental,
and resource-capped.

Pipeline:
1. File Discovery & Ignore Filter
2. Security Boundary & Path Check
3. Detect MIME & File Type
4. Compute File SHA-256 Hash
5. Route to Structure Parser (Tree-Sitter / Markdown / Config)
6. Structure-Aware Chunking
7. Secret & Sensitive Data Redaction
8. Generate Dense Vector Embeddings
9. Parallel Commit: SQLite FTS5 + ChromaDB
10. Update Index Manifest
"""

from __future__ import annotations

import asyncio
import hashlib
import os
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import structlog
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from nexus.knowledge.chunker import CodeChunk, chunk_file, detect_language
from nexus.knowledge.fts_store import (
    create_fts_table,
    delete_document_fts,
    index_chunks_fts,
)
from nexus.knowledge.vector_store import VectorStore
from nexus.models.knowledge import IndexedChunk, IndexedDocument

logger = structlog.get_logger(__name__)

# ------------------------------------------------------------------
# Ignore rules (per Architecture §7.1)
# ------------------------------------------------------------------

# Mandatory directory exclusions
IGNORED_DIRS: set[str] = {
    ".git", ".svn", ".hg",
    ".nexus",
    "node_modules", "target", "dist", "build", "bin", "obj", "out",
    "venv", ".venv", "env", "__pycache__",
    ".next", ".turbo", ".cache",
    ".pytest_cache", ".mypy_cache", ".ruff_cache",
    "coverage", ".coverage",
}

# Mandatory file exclusions (indexed as metadata-only summaries)
IGNORED_FILES: set[str] = {
    "package-lock.json", "pnpm-lock.yaml", "yarn.lock",
    "Cargo.lock", "poetry.lock", "uv.lock",
}

# Supported code/text extensions
INDEXABLE_EXTENSIONS: set[str] = {
    ".py", ".pyi", ".ts", ".tsx", ".js", ".jsx",
    ".rs", ".go",
    ".md", ".mdx",
    ".json", ".yaml", ".yml", ".toml",
    ".html", ".css", ".scss",
    ".sql", ".sh", ".bash", ".ps1",
    ".dockerfile", ".env.example",
    ".txt", ".cfg", ".ini",
}

# File size ceiling (2 MB)
MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024

# Secret patterns to redact before indexing
SECRET_PATTERNS = [
    re.compile(r'(?i)(api[_-]?key|secret|token|password|passwd|credential)\s*[=:]\s*["\']?[\w\-\.]+["\']?'),
    re.compile(r'(?i)bearer\s+[\w\-\.]+'),
    re.compile(r'(?i)(aws|azure|gcp|github|gitlab)[\w_]*[=:]\s*["\']?[\w\-\.]+["\']?'),
    re.compile(r'-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----'),
]


@dataclass
class IndexingStats:
    """Statistics from an indexing run."""

    files_discovered: int = 0
    files_skipped_unchanged: int = 0
    files_indexed: int = 0
    files_deleted: int = 0
    files_errored: int = 0
    chunks_created: int = 0
    chunks_embedded: int = 0
    total_tokens: int = 0
    duration_ms: int = 0


class RepositoryIndexer:
    """Incremental repository indexer with SHA-256 change detection.

    Scans a project's repository, identifies changed/new/deleted files,
    parses them into structure-aware chunks, and commits to both the
    lexical (FTS5) and vector (ChromaDB) stores.
    """

    def __init__(
        self,
        vector_store: VectorStore,
        batch_size: int = 20,
        yield_interval_ms: int = 50,
    ) -> None:
        self._vector_store = vector_store
        self._batch_size = batch_size
        self._yield_interval_ms = yield_interval_ms

    async def index_project(
        self,
        session: AsyncSession,
        project_id: str,
        root_path: str | Path,
        force_rebuild: bool = False,
    ) -> IndexingStats:
        """Index or re-index a project's repository.

        Args:
            session: SQLAlchemy async session.
            project_id: Project ID for scope isolation.
            root_path: Absolute path to the project root directory.
            force_rebuild: If True, re-index all files regardless of hash.

        Returns:
            IndexingStats with detailed metrics.
        """
        import time

        start_time = time.perf_counter()
        stats = IndexingStats()
        root = Path(root_path).resolve()

        if not root.exists() or not root.is_dir():
            logger.error("indexer.root_not_found", path=str(root))
            return stats

        # Ensure FTS5 table exists
        await create_fts_table(session)

        # Load existing index manifest
        existing_docs = await self._load_existing_docs(session, project_id)

        # Discover files
        discovered_files = self._discover_files(root)
        stats.files_discovered = len(discovered_files)

        # Detect deleted files
        current_paths = {str(f.relative_to(root)) for f in discovered_files}
        deleted_paths = set(existing_docs.keys()) - current_paths
        for del_path in deleted_paths:
            await self._delete_document(session, project_id, del_path)
            stats.files_deleted += 1

        # Process files in batches
        batch: list[Path] = []
        for file_path in discovered_files:
            batch.append(file_path)

            if len(batch) >= self._batch_size:
                batch_stats = await self._process_batch(
                    session, project_id, root, batch, existing_docs, force_rebuild
                )
                self._merge_stats(stats, batch_stats)
                batch = []

                # Yield CPU time (per Architecture §16)
                await asyncio.sleep(self._yield_interval_ms / 1000.0)

        # Process remaining files
        if batch:
            batch_stats = await self._process_batch(
                session, project_id, root, batch, existing_docs, force_rebuild
            )
            self._merge_stats(stats, batch_stats)

        stats.duration_ms = int((time.perf_counter() - start_time) * 1000)

        logger.info(
            "indexer.project_indexed",
            project_id=project_id,
            files_indexed=stats.files_indexed,
            files_skipped=stats.files_skipped_unchanged,
            files_deleted=stats.files_deleted,
            chunks_created=stats.chunks_created,
            chunks_embedded=stats.chunks_embedded,
            duration_ms=stats.duration_ms,
        )

        return stats

    def _discover_files(self, root: Path) -> list[Path]:
        """Walk the repository and discover indexable files."""
        discovered: list[Path] = []

        for dirpath, dirnames, filenames in os.walk(root):
            # Filter out ignored directories (modifies in-place)
            dirnames[:] = [
                d for d in dirnames
                if d not in IGNORED_DIRS and not d.startswith(".")
            ]

            for filename in filenames:
                if filename in IGNORED_FILES:
                    continue

                file_path = Path(dirpath) / filename
                ext = file_path.suffix.lower()

                # Check extension
                if ext not in INDEXABLE_EXTENSIONS:
                    # Check for extensionless files like Dockerfile
                    if filename.lower() not in {"dockerfile", "makefile", "cmakelists.txt"}:
                        continue

                # Check file size
                try:
                    size = file_path.stat().st_size
                    if size > MAX_FILE_SIZE_BYTES or size == 0:
                        continue
                except OSError:
                    continue

                discovered.append(file_path)

        return discovered

    async def _load_existing_docs(
        self,
        session: AsyncSession,
        project_id: str,
    ) -> dict[str, IndexedDocument]:
        """Load existing indexed documents for a project."""
        result = await session.execute(
            select(IndexedDocument).where(IndexedDocument.project_id == project_id)
        )
        docs = result.scalars().all()
        return {doc.file_path: doc for doc in docs}

    async def _process_batch(
        self,
        session: AsyncSession,
        project_id: str,
        root: Path,
        files: list[Path],
        existing_docs: dict[str, IndexedDocument],
        force_rebuild: bool,
    ) -> IndexingStats:
        """Process a batch of files for indexing."""
        stats = IndexingStats()

        for file_path in files:
            try:
                rel_path = str(file_path.relative_to(root))

                # Compute file hash
                content = file_path.read_text(encoding="utf-8", errors="ignore")
                file_hash = hashlib.sha256(content.encode("utf-8")).hexdigest()
                file_size = len(content.encode("utf-8"))

                # Check if file has changed
                existing = existing_docs.get(rel_path)
                if not force_rebuild and existing and existing.content_sha256 == file_hash:
                    stats.files_skipped_unchanged += 1
                    continue

                # Delete old chunks if re-indexing
                if existing:
                    await self._delete_document(session, project_id, rel_path)

                # Redact secrets before indexing
                redacted_content = self._redact_secrets(content)

                # Parse into chunks
                chunks = chunk_file(file_path, redacted_content)
                if not chunks:
                    stats.files_errored += 1
                    continue

                # Create IndexedDocument
                language = detect_language(file_path)
                doc = IndexedDocument(
                    project_id=project_id,
                    file_path=rel_path,
                    language=language,
                    content_sha256=file_hash,
                    file_size_bytes=file_size,
                    chunk_count=len(chunks),
                )
                session.add(doc)
                await session.flush()  # Get the doc ID

                # Create IndexedChunk records and FTS entries
                fts_entries: list[dict[str, Any]] = []
                vector_ids: list[str] = []
                vector_contents: list[str] = []
                vector_metadatas: list[dict[str, Any]] = []

                for chunk in chunks:
                    db_chunk = IndexedChunk(
                        document_id=doc.id,
                        project_id=project_id,
                        content=chunk.content,
                        chunk_type=chunk.chunk_type.value,
                        symbol_name=chunk.symbol_name,
                        language=chunk.language,
                        file_path=rel_path,
                        start_line=chunk.start_line,
                        end_line=chunk.end_line,
                        token_count=chunk.token_count,
                        content_sha256=chunk.content_sha256,
                    )
                    session.add(db_chunk)
                    await session.flush()

                    # Prepare FTS5 entry
                    fts_entries.append({
                        "chunk_id": db_chunk.id,
                        "project_id": project_id,
                        "file_path": rel_path,
                        "symbol_name": chunk.symbol_name or "",
                        "content": chunk.content,
                    })

                    # Prepare vector entry
                    vector_ids.append(db_chunk.id)
                    vector_contents.append(chunk.content)
                    vector_metadatas.append({
                        "file_path": rel_path,
                        "symbol_name": chunk.symbol_name or "",
                        "chunk_type": chunk.chunk_type.value,
                        "start_line": chunk.start_line,
                        "end_line": chunk.end_line,
                    })

                    stats.chunks_created += 1
                    stats.total_tokens += chunk.token_count

                # Commit FTS5 entries
                await index_chunks_fts(session, fts_entries)

                # Commit vector embeddings (async, non-blocking)
                embedded = await self._vector_store.add_chunks(
                    project_id, vector_ids, vector_contents, vector_metadatas
                )
                stats.chunks_embedded += embedded

                stats.files_indexed += 1

            except Exception as e:
                logger.warning(
                    "indexer.file_error",
                    file=str(file_path),
                    error=str(e),
                )
                stats.files_errored += 1

        await session.commit()
        return stats

    async def _delete_document(
        self,
        session: AsyncSession,
        project_id: str,
        file_path: str,
    ) -> None:
        """Delete a document and all its chunks from all stores."""
        # Delete from SQLAlchemy models
        await session.execute(
            delete(IndexedChunk).where(
                IndexedChunk.project_id == project_id,
                IndexedChunk.file_path == file_path,
            )
        )
        await session.execute(
            delete(IndexedDocument).where(
                IndexedDocument.project_id == project_id,
                IndexedDocument.file_path == file_path,
            )
        )

        # Delete from FTS5
        await delete_document_fts(session, project_id, file_path)

        # Delete from vector store
        await self._vector_store.delete_document(project_id, file_path)

    def _redact_secrets(self, content: str) -> str:
        """Redact potential secrets from content before indexing.

        Per Architecture §15.2: Regex redaction filters strip API keys,
        private certificates, and passwords before commit to any store.
        """
        redacted = content
        for pattern in SECRET_PATTERNS:
            redacted = pattern.sub("[REDACTED]", redacted)
        return redacted

    @staticmethod
    def _merge_stats(target: IndexingStats, source: IndexingStats) -> None:
        """Merge batch stats into cumulative stats."""
        target.files_indexed += source.files_indexed
        target.files_skipped_unchanged += source.files_skipped_unchanged
        target.files_errored += source.files_errored
        target.chunks_created += source.chunks_created
        target.chunks_embedded += source.chunks_embedded
        target.total_tokens += source.total_tokens
