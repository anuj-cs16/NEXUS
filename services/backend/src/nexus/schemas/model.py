"""Pydantic schemas for AI Model DTOs."""

from __future__ import annotations

from pydantic import BaseModel, Field


class ModelItemResponse(BaseModel):
    """Information on a single available model."""

    name: str
    size_bytes: int = 0
    modified_at: str = ""
    family: str = ""
    parameter_size: str = ""
    quantization_level: str = ""


class ModelListResponse(BaseModel):
    """Response containing available models and system status."""

    models: list[ModelItemResponse] = Field(default_factory=list)
    default_model: str
    ollama_connected: bool
    total: int = 0


class ModelStatusResponse(BaseModel):
    """Health / connectivity status for AI providers."""

    ollama_connected: bool
    ollama_url: str
    default_model: str
