"""Health check endpoints.

Provides system health status for desktop frontend and mobile companion.
"""

import platform
import sys
from datetime import datetime, timezone

from fastapi import APIRouter
from pydantic import BaseModel

from nexus.config import settings

from nexus.ai.ollama_adapter import OllamaAdapter

router = APIRouter()


class HealthResponse(BaseModel):
    """Health check response schema."""

    status: str
    version: str
    timestamp: str
    python_version: str
    platform: str
    ollama_url: str
    ollama_status: str
    debug: bool


@router.get("", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Return backend health status.

    Used by:
    - Tauri desktop shell to verify backend is alive
    - Mobile companion to verify desktop reachability
    """
    ollama = OllamaAdapter()
    is_connected = await ollama.check_health()

    return HealthResponse(
        status="ok",
        version=settings.VERSION,
        timestamp=datetime.now(timezone.utc).isoformat(),
        python_version=sys.version,
        platform=platform.system(),
        ollama_url=settings.OLLAMA_BASE_URL,
        ollama_status="connected" if is_connected else "disconnected",
        debug=settings.DEBUG,
    )
