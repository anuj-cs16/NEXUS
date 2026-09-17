"""NEXUS Database — SQLAlchemy async engine and base model.

Uses SQLite 3.45+ in WAL mode for MVP (per NEXUS Tech Stack §17).
Migration path to PostgreSQL 16 + pgvector in V1.
"""

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

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


class Base(DeclarativeBase):
    """SQLAlchemy declarative base for all NEXUS models."""

    pass


async def get_session() -> AsyncSession:  # type: ignore[misc]
    """FastAPI dependency for database session injection."""
    async with async_session_factory() as session:
        try:
            yield session  # type: ignore[misc]
            await session.commit()
        except Exception:
            await session.rollback()
            raise
