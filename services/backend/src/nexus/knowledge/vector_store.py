"""NEXUS Vector Store — ChromaDB integration for dense semantic search.

Per Agent Memory & Retrieval Architecture (§9):
Embedded ChromaDB stores dense vector embeddings (HNSW cosine index)
for semantic retrieval. Falls back gracefully to 100% lexical FTS5
when embeddings are unavailable.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

import structlog

from nexus.knowledge.embeddings import EmbeddingAdapter, NoopEmbeddingAdapter

logger = structlog.get_logger(__name__)


class VectorStore:
    """Embedded ChromaDB vector store for dense semantic search.

    Manages project-isolated vector collections with cosine similarity search.
    If ChromaDB is not installed or embedding is noop, operations are no-ops.
    """

    def __init__(
        self,
        persist_dir: str | Path = ".nexus/vectors",
        embedding_adapter: EmbeddingAdapter | None = None,
    ) -> None:
        self.persist_dir = str(persist_dir)
        self._embedding = embedding_adapter
        self._client: Any = None
        self._available: bool | None = None

    @property
    def is_noop(self) -> bool:
        """Check if vector store is in noop mode (no real embeddings)."""
        return isinstance(self._embedding, NoopEmbeddingAdapter) or self._embedding is None

    def _get_client(self) -> Any:
        """Lazy-initialize ChromaDB client."""
        if self._client is None:
            try:
                import chromadb
                from chromadb.config import Settings

                self._client = chromadb.Client(
                    Settings(
                        chroma_db_impl="duckdb+parquet",
                        persist_directory=self.persist_dir,
                        anonymized_telemetry=False,
                    )
                )
                self._available = True
            except ImportError:
                logger.warning("vectorstore.chromadb_not_installed")
                self._available = False
            except Exception as e:
                # Fallback: try simpler initialization for newer ChromaDB versions
                try:
                    import chromadb

                    self._client = chromadb.PersistentClient(path=self.persist_dir)
                    self._available = True
                except Exception:
                    logger.warning("vectorstore.init_failed", error=str(e))
                    self._available = False
        return self._client

    def _get_collection(self, project_id: str) -> Any:
        """Get or create a ChromaDB collection for a project."""
        client = self._get_client()
        if client is None:
            return None

        collection_name = f"nexus_{project_id.replace('-', '_')}"
        # ChromaDB collection names must be 3-63 chars
        if len(collection_name) > 63:
            collection_name = collection_name[:63]

        return client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"},
        )

    async def add_chunks(
        self,
        project_id: str,
        chunk_ids: list[str],
        contents: list[str],
        metadatas: list[dict[str, Any]],
    ) -> int:
        """Add or update chunk embeddings in the vector store.

        Args:
            project_id: Project scope.
            chunk_ids: Unique chunk identifiers.
            contents: Text content for each chunk.
            metadatas: Metadata dicts for each chunk.

        Returns:
            Number of chunks added/updated.
        """
        if self.is_noop or not chunk_ids:
            return 0

        collection = self._get_collection(project_id)
        if collection is None:
            return 0

        try:
            # Generate embeddings
            embeddings = await self._embedding.embed(contents)  # type: ignore[union-attr]

            # Upsert into ChromaDB
            collection.upsert(
                ids=chunk_ids,
                embeddings=embeddings,
                documents=contents,
                metadatas=metadatas,
            )

            logger.debug(
                "vectorstore.chunks_added",
                project_id=project_id,
                count=len(chunk_ids),
            )
            return len(chunk_ids)

        except Exception as e:
            logger.error("vectorstore.add_failed", error=str(e))
            return 0

    async def search(
        self,
        project_id: str,
        query: str,
        top_k: int = 25,
    ) -> list[dict[str, Any]]:
        """Search for semantically similar chunks.

        Args:
            project_id: Project scope.
            query: Natural language search query.
            top_k: Maximum results to return.

        Returns:
            List of dicts with: chunk_id, content, distance, metadata.
        """
        if self.is_noop:
            return []

        collection = self._get_collection(project_id)
        if collection is None:
            return []

        try:
            # Generate query embedding
            query_embedding = await self._embedding.embed_query(query)  # type: ignore[union-attr]

            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=min(top_k, collection.count() or top_k),
                include=["documents", "distances", "metadatas"],
            )

            hits = []
            if results and results.get("ids") and results["ids"][0]:
                for i, chunk_id in enumerate(results["ids"][0]):
                    hits.append({
                        "chunk_id": chunk_id,
                        "content": results["documents"][0][i] if results.get("documents") else "",
                        "distance": results["distances"][0][i] if results.get("distances") else 1.0,
                        "metadata": results["metadatas"][0][i] if results.get("metadatas") else {},
                    })

            return hits

        except Exception as e:
            logger.error("vectorstore.search_failed", error=str(e))
            return []

    async def delete_document(self, project_id: str, file_path: str) -> None:
        """Delete all vectors for a specific file in a project."""
        collection = self._get_collection(project_id)
        if collection is None:
            return

        try:
            collection.delete(
                where={"file_path": file_path},
            )
        except Exception as e:
            logger.warning("vectorstore.delete_document_failed", error=str(e))

    async def delete_project(self, project_id: str) -> None:
        """Delete the entire vector collection for a project."""
        client = self._get_client()
        if client is None:
            return

        collection_name = f"nexus_{project_id.replace('-', '_')}"
        if len(collection_name) > 63:
            collection_name = collection_name[:63]

        try:
            client.delete_collection(name=collection_name)
            logger.info("vectorstore.project_deleted", project_id=project_id)
        except Exception as e:
            logger.warning("vectorstore.delete_project_failed", error=str(e))

    async def get_collection_count(self, project_id: str) -> int:
        """Get the number of vectors in a project's collection."""
        collection = self._get_collection(project_id)
        if collection is None:
            return 0
        try:
            return collection.count()
        except Exception:
            return 0
