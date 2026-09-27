"""NEXUS API dependencies — FastAPI dependency injection.

Provides database sessions, service instances, and shared utilities
to endpoint handlers via FastAPI's Depends() system.
"""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from nexus.models.base import get_session

# Type alias for database session dependency
DbSession = Annotated[AsyncSession, Depends(get_session)]
