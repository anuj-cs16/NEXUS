"""Model management and AI connectivity endpoints."""

from __future__ import annotations

from fastapi import APIRouter

from nexus.ai.ollama_adapter import OllamaAdapter
from nexus.config import settings
from nexus.schemas.model import ModelItemResponse, ModelListResponse, ModelStatusResponse

router = APIRouter()


@router.get("", response_model=ModelListResponse)
async def list_models() -> ModelListResponse:
    """List available local models from Ollama."""
    adapter = OllamaAdapter()
    is_healthy = await adapter.check_health()

    models: list[ModelItemResponse] = []
    if is_healthy:
        try:
            model_infos = await adapter.list_models()
            models = [
                ModelItemResponse(
                    name=m.name,
                    size_bytes=m.size_bytes,
                    modified_at=m.modified_at,
                    family=m.family,
                    parameter_size=m.parameter_size,
                    quantization_level=m.quantization_level,
                )
                for m in model_infos
            ]
        except Exception:
            pass

    return ModelListResponse(
        models=models,
        default_model=settings.OLLAMA_MODEL,
        ollama_connected=is_healthy,
        total=len(models),
    )


@router.get("/status", response_model=ModelStatusResponse)
async def get_model_status() -> ModelStatusResponse:
    """Check connectivity to Ollama server."""
    adapter = OllamaAdapter()
    is_healthy = await adapter.check_health()

    return ModelStatusResponse(
        ollama_connected=is_healthy,
        ollama_url=settings.OLLAMA_BASE_URL,
        default_model=settings.OLLAMA_MODEL,
    )
