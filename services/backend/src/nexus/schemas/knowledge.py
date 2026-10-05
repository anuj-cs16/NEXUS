"""Pydantic schemas for the NEXUS Knowledge and Retrieval system."""

from pydantic import BaseModel, Field


class KnowledgeIndexRequest(BaseModel):
    """Request to trigger repository indexing."""

    force_reindex: bool = Field(
        default=False,
        description="If True, reindexes all files regardless of SHA-256 hash changes.",
    )


class KnowledgeIndexResponse(BaseModel):
    """Result of a repository indexing run."""

    project_id: str
    files_scanned: int
    files_indexed: int
    files_skipped: int
    chunks_created: int
    elapsed_seconds: float
    errors: list[str] = Field(default_factory=list)


class KnowledgeSearchResultItem(BaseModel):
    """A single retrieved chunk with relevance scoring and provenance metadata."""

    chunk_id: str
    file_path: str
    start_line: int
    end_line: int
    content: str
    score: float
    chunk_type: str
    language: str
    symbol_name: str | None = None


class KnowledgeSearchResponse(BaseModel):
    """Response containing hybrid search results."""

    project_id: str
    query: str
    results: list[KnowledgeSearchResultItem]
    total_results: int


class KnowledgeStatsResponse(BaseModel):
    """Knowledge store diagnostic and status metrics."""

    project_id: str
    total_files: int
    total_chunks: int
    fts_enabled: bool
    vector_enabled: bool
    embedding_provider: str
