"""NEXUS API v1 Router — aggregates all endpoint modules."""

from fastapi import APIRouter

from nexus.api.endpoints.health import router as health_router
from nexus.api.endpoints.projects import router as projects_router

api_router = APIRouter()

api_router.include_router(health_router, prefix="/health", tags=["Health"])
api_router.include_router(projects_router, prefix="/projects", tags=["Projects"])
