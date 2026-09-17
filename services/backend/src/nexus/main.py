"""NEXUS Backend Engine — FastAPI Application Factory."""

from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from nexus.config import settings
from nexus.api.router import api_router

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

    # Mount API routes
    app.include_router(api_router, prefix="/api/v1")

    return app


# Application instance for uvicorn
app = create_app()
