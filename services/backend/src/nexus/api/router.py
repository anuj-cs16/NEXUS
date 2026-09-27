"""NEXUS API v1 Router — aggregates all endpoint modules."""

from fastapi import APIRouter

from nexus.api.endpoints.approvals import router as approvals_router
from nexus.api.endpoints.health import router as health_router
from nexus.api.endpoints.models import router as models_router
from nexus.api.endpoints.projects import router as projects_router
from nexus.api.endpoints.stream import router as stream_router
from nexus.api.endpoints.tasks import router as tasks_router

api_router = APIRouter()

api_router.include_router(health_router, prefix="/health", tags=["Health"])
api_router.include_router(models_router, prefix="/models", tags=["Models"])
api_router.include_router(projects_router, prefix="/projects", tags=["Projects"])
api_router.include_router(
    tasks_router,
    prefix="/projects/{project_id}/tasks",
    tags=["Tasks"],
)
api_router.include_router(approvals_router, prefix="/approvals", tags=["Approvals"])
api_router.include_router(stream_router, prefix="/stream", tags=["Streaming"])
