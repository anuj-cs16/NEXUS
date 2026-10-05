"""NEXUS Embedding Adapter — local-first embedding generation.

Per Agent Memory & Retrieval Architecture (§9):
- Default: nomic-embed-text via Ollama or all-MiniLM-L6-v2 via fastembed.
- Fallback: If both are unavailable, embedding is disabled and retrieval
  degrades gracefully to 100% lexical SQLite FTS5 search.
"""

from __future__ import annotations

import asyncio
from abc import ABC, abstractmethod
from typing import Any

import structlog

logger = structlog.get_logger(__name__)


class EmbeddingAdapter(ABC):
    """Abstract base class for embedding providers."""

    model_name: str = ""
    dimensions: int = 768

    @abstractmethod
    async def embed(self, texts: list[str]) -> list[list[float]]:
        """Generate dense vector embeddings for a batch of texts.

        Args:
            texts: List of text strings to embed.

        Returns:
            List of float vectors, one per input text.
        """
        ...

    @abstractmethod
    async def embed_query(self, query: str) -> list[float]:
        """Generate embedding for a single search query.

        Args:
            query: The search query string.

        Returns:
            A single float vector.
        """
        ...

    async def is_available(self) -> bool:
        """Check if the embedding provider is currently accessible."""
        try:
            result = await self.embed(["health check"])
            return len(result) == 1 and len(result[0]) == self.dimensions
        except Exception:
            return False


class OllamaEmbeddingAdapter(EmbeddingAdapter):
    """Generate embeddings via local Ollama daemon (/api/embeddings).

    Uses nomic-embed-text:v1.5 (768 dimensions) by default.
    """

    def __init__(
        self,
        base_url: str = "http://127.0.0.1:11434",
        model: str = "nomic-embed-text:v1.5",
        dimensions: int = 768,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.model_name = model
        self.dimensions = dimensions

    async def embed(self, texts: list[str]) -> list[list[float]]:
        """Embed multiple texts via Ollama, one at a time (Ollama doesn't batch)."""
        import httpx

        results = []
        async with httpx.AsyncClient(timeout=60.0) as client:
            for text in texts:
                response = await client.post(
                    f"{self.base_url}/api/embeddings",
                    json={"model": self.model_name, "prompt": text},
                )
                response.raise_for_status()
                data = response.json()
                results.append(data["embedding"])

        return results

    async def embed_query(self, query: str) -> list[float]:
        """Embed a single query."""
        results = await self.embed([query])
        return results[0]

    async def is_available(self) -> bool:
        """Check if Ollama is running and the model is available."""
        import httpx

        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                # Check Ollama is up
                resp = await client.get(f"{self.base_url}/api/tags")
                if resp.status_code != 200:
                    return False
                # Check model exists
                models = resp.json().get("models", [])
                model_names = [m.get("name", "") for m in models]
                return any(self.model_name in name for name in model_names)
        except Exception:
            return False


class FastEmbedAdapter(EmbeddingAdapter):
    """Generate embeddings via fastembed (ONNX CPU-accelerated).

    Uses all-MiniLM-L6-v2 (384 dimensions) by default — lightweight fallback.
    """

    def __init__(
        self,
        model: str = "BAAI/bge-small-en-v1.5",
        dimensions: int = 384,
    ) -> None:
        self.model_name = model
        self.dimensions = dimensions
        self._model: Any = None

    def _get_model(self) -> Any:
        """Lazy-load the fastembed model."""
        if self._model is None:
            try:
                from fastembed import TextEmbedding

                self._model = TextEmbedding(model_name=self.model_name)
            except ImportError:
                raise RuntimeError(
                    "fastembed is not installed. Install with: pip install fastembed"
                )
        return self._model

    async def embed(self, texts: list[str]) -> list[list[float]]:
        """Embed texts using fastembed (runs in thread to avoid blocking)."""
        model = self._get_model()

        def _sync_embed() -> list[list[float]]:
            embeddings = list(model.embed(texts))
            return [emb.tolist() for emb in embeddings]

        return await asyncio.to_thread(_sync_embed)

    async def embed_query(self, query: str) -> list[float]:
        """Embed a single search query."""
        results = await self.embed([query])
        return results[0]

    async def is_available(self) -> bool:
        """Check if fastembed is importable."""
        try:
            self._get_model()
            return True
        except Exception:
            return False


class NoopEmbeddingAdapter(EmbeddingAdapter):
    """Null adapter when no embedding provider is available.

    Returns empty vectors — signals the retrieval layer to skip vector search
    and use 100% lexical FTS5 fallback.
    """

    model_name = "noop"
    dimensions = 0

    async def embed(self, texts: list[str]) -> list[list[float]]:
        return [[] for _ in texts]

    async def embed_query(self, query: str) -> list[float]:
        return []

    async def is_available(self) -> bool:
        return True


async def get_embedding_adapter(
    ollama_url: str = "http://127.0.0.1:11434",
    ollama_model: str = "nomic-embed-text:v1.5",
) -> EmbeddingAdapter:
    """Auto-detect and return the best available embedding adapter.

    Priority:
      1. Ollama (nomic-embed-text) — highest quality, GPU-accelerated if available
      2. FastEmbed (BGE-small) — CPU fallback, lightweight
      3. Noop — no embeddings, 100% lexical search fallback

    Returns:
        The best available EmbeddingAdapter instance.
    """
    # Try Ollama first
    ollama = OllamaEmbeddingAdapter(base_url=ollama_url, model=ollama_model)
    if await ollama.is_available():
        logger.info("embedding.provider_selected", provider="ollama", model=ollama_model)
        return ollama

    # Try FastEmbed fallback
    try:
        fastembed = FastEmbedAdapter()
        if await fastembed.is_available():
            logger.info(
                "embedding.provider_selected",
                provider="fastembed",
                model=fastembed.model_name,
            )
            return fastembed
    except Exception:
        pass

    # Last resort: no embeddings
    logger.warning(
        "embedding.no_provider_available",
        message="No embedding provider found. Vector search disabled; using 100% lexical FTS5.",
    )
    return NoopEmbeddingAdapter()
