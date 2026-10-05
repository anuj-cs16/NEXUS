"""NEXUS Knowledge Models — IndexedDocument, IndexedChunk, and MemoryItem.

Per Agent Memory & Retrieval Architecture (§4, §8, §21):
- IndexedDocument: Tracks indexed files with SHA-256 hashes for incremental scanning.
- IndexedChunk: Stores structure-aware AST chunks with symbol metadata.
- MemoryItem: Durable project knowledge requiring human approval.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from nexus.models.base import Base, PrefixedIdMixin, TimestampMixin, _generate_prefixed_id

if TYPE_CHECKING:
    from nexus.models.project import Project


class IndexedDocument(PrefixedIdMixin, TimestampMixin, Base):
    """A file that has been indexed for knowledge retrieval.

    Tracks file content hashes to enable incremental indexing —
    only re-parse files whose SHA-256 has changed since last index.
    """

    __tablename__ = "indexed_documents"

    project_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    file_path: Mapped[str] = mapped_column(String(1024), nullable=False)
    language: Mapped[str | None] = mapped_column(String(50), nullable=True)
    content_sha256: Mapped[str] = mapped_column(String(64), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    chunk_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    last_indexed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    chunks: Mapped[list[IndexedChunk]] = relationship(
        "IndexedChunk",
        back_populates="document",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __init__(self, **kwargs: object) -> None:
        if "id" not in kwargs:
            kwargs["id"] = _generate_prefixed_id("doc")
        super().__init__(**kwargs)

    def __repr__(self) -> str:
        return f"<IndexedDocument id={self.id!r} path={self.file_path!r}>"


class IndexedChunk(PrefixedIdMixin, TimestampMixin, Base):
    """A structure-aware chunk extracted from an IndexedDocument.

    Each chunk represents a semantic AST unit (function, class, method, import block)
    rather than an arbitrary character slice, preserving code semantics for retrieval.
    """

    __tablename__ = "indexed_chunks"

    document_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("indexed_documents.id", ondelete="CASCADE"), nullable=False,
        index=True,
    )
    project_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # Chunk content and metadata
    content: Mapped[str] = mapped_column(Text, nullable=False)
    chunk_type: Mapped[str] = mapped_column(
        String(50), nullable=False, default="RAW_TEXT"
    )  # FUNCTION, CLASS, METHOD, IMPORT, MODULE_DOCSTRING, RAW_TEXT, CONFIG
    symbol_name: Mapped[str | None] = mapped_column(String(500), nullable=True)
    language: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # Source location
    file_path: Mapped[str] = mapped_column(String(1024), nullable=False)
    start_line: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    end_line: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    token_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Hash for deduplication
    content_sha256: Mapped[str] = mapped_column(String(64), nullable=False)

    # Relationships
    document: Mapped[IndexedDocument] = relationship(
        "IndexedDocument", back_populates="chunks"
    )

    def __init__(self, **kwargs: object) -> None:
        if "id" not in kwargs:
            kwargs["id"] = _generate_prefixed_id("chk")
        super().__init__(**kwargs)

    def __repr__(self) -> str:
        return (
            f"<IndexedChunk id={self.id!r} type={self.chunk_type!r} "
            f"symbol={self.symbol_name!r}>"
        )


class MemoryItem(PrefixedIdMixin, TimestampMixin, Base):
    """A durable project knowledge item requiring human approval.

    Per Memory Architecture §12: Speculative agent inferences are never silently
    promoted to permanent memory. Durable knowledge requires explicit human sign-off.
    """

    __tablename__ = "memory_items"

    project_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )

    title: Mapped[str] = mapped_column(String(500), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)

    # Category: ARCHITECTURE_DECISION, CODING_CONVENTION, PREFERENCE, OPERATIONAL_SPEC
    category: Mapped[str] = mapped_column(
        String(50), nullable=False, default="ARCHITECTURE_DECISION"
    )

    # Status: PENDING_APPROVAL, APPROVED, REJECTED
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="PENDING_APPROVAL")

    # Origin provenance
    source_agent: Mapped[str | None] = mapped_column(String(50), nullable=True)
    source_task_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    target_modules: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )  # JSON array of module paths

    approved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    approved_by: Mapped[str | None] = mapped_column(String(100), nullable=True)

    def __init__(self, **kwargs: object) -> None:
        if "id" not in kwargs:
            kwargs["id"] = _generate_prefixed_id("mem")
        super().__init__(**kwargs)

    def __repr__(self) -> str:
        return f"<MemoryItem id={self.id!r} title={self.title!r} status={self.status!r}>"
