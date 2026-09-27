"""NEXUS Database — SQLAlchemy async engine, base model, and common mixins.

Uses SQLite 3.45+ in WAL mode for MVP (per NEXUS Tech Stack §17).
Migration path to PostgreSQL 16 + pgvector in V1.
"""

from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import DateTime, String, event, text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

from nexus.config import settings

# Async engine with SQLite WAL mode
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    connect_args={"check_same_thread": False},  # Required for SQLite async
)

# Session factory
async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


def _generate_prefixed_id(prefix: str) -> str:
    """Generate a prefixed UUID for human-readable entity IDs."""
    return f"{prefix}_{uuid4().hex[:12]}"


class Base(DeclarativeBase):
    """SQLAlchemy declarative base for all NEXUS models."""

    pass


class TimestampMixin:
    """Mixin providing created_at / updated_at columns."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        default=None,
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=True,
    )


class PrefixedIdMixin:
    """Mixin providing a prefixed string primary key (e.g., prj_abc123)."""

    id: Mapped[str] = mapped_column(
        String(50),
        primary_key=True,
        nullable=False,
    )


async def get_session() -> AsyncSession:  # type: ignore[misc]
    """FastAPI dependency for database session injection."""
    async with async_session_factory() as session:
        try:
            yield session  # type: ignore[misc]
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def init_db() -> None:
    """Initialize the database: create tables and enable WAL mode."""
    async with engine.begin() as conn:
        # Enable WAL mode for SQLite (better concurrent read performance)
        await conn.execute(text("PRAGMA journal_mode=WAL"))
        await conn.execute(text("PRAGMA foreign_keys=ON"))
        await conn.execute(text("PRAGMA busy_timeout=5000"))

        # Import all models to ensure they're registered with Base.metadata
        import nexus.models.approval  # noqa: F401
        import nexus.models.audit  # noqa: F401
        import nexus.models.project  # noqa: F401
        import nexus.models.task  # noqa: F401

        await conn.run_sync(Base.metadata.create_all)


# Enable WAL mode on every new SQLite connection
@event.listens_for(engine.sync_engine, "connect")
def _set_sqlite_pragma(dbapi_connection, connection_record):  # type: ignore[no-untyped-def]
    """Set SQLite pragmas on each new connection."""
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.execute("PRAGMA busy_timeout=5000")
    cursor.close()
