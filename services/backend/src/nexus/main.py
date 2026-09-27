"""NEXUS Backend Engine — FastAPI Application Factory."""

from __future__ import annotations

from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

import structlog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from nexus.config import settings
from nexus.api.router import api_router
from nexus.core.exceptions import NexusError
from nexus.models.base import init_db

logger = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Application startup and shutdown lifecycle."""
    logger.info(
        "nexus.startup",
        version=settings.VERSION,
        debug=settings.DEBUG,
        host=settings.HOST,
        port=settings.PORT,
    )

    # Initialize database (create tables, enable WAL)
    await init_db()
    logger.info("nexus.database_initialized")

    yield

    logger.info("nexus.shutdown")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title="NEXUS Backend Engine",
        description="Autonomous Local-First AI Software Engineer — Backend API",
        version=settings.VERSION,
        docs_url="/docs" if settings.DEBUG else None,
        redoc_url="/redoc" if settings.DEBUG else None,
        lifespan=lifespan,
    )

    # CORS — restricted to local Tauri app in production
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Global exception handler for NexusError hierarchy
    @app.exception_handler(NexusError)
    async def nexus_error_handler(request: Request, exc: NexusError) -> JSONResponse:
        """Convert NexusError exceptions to standardized JSON error responses."""
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": {
                    "code": exc.error_code,
                    "message": exc.message,
                    "details": exc.details if exc.details else None,
                    "retryable": exc.retryable,
                }
            },
        )

    # Mount API routes
    app.include_router(api_router, prefix="/api/v1")

    return app


# Application instance for uvicorn
app = create_app()
