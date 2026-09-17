"""NEXUS configuration management via Pydantic Settings."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings with environment variable loading.

    Hierarchy (per NEXUS Tech Stack §41):
      1. Environment variables (highest priority)
      2. .env file
      3. Default values
    """

    # Application
    APP_NAME: str = "NEXUS"
    VERSION: str = "0.1.0"
    DEBUG: bool = True

    # Server
    HOST: str = "127.0.0.1"
    PORT: int = 8000

    # CORS — local Tauri webview origins
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "tauri://localhost",
        "https://tauri.localhost",
    ]

    # Database (SQLite WAL mode for MVP)
    DATABASE_URL: str = "sqlite+aiosqlite:///./nexus.db"

    # Ollama
    OLLAMA_BASE_URL: str = "http://127.0.0.1:11434"
    OLLAMA_DEFAULT_MODEL: str = "qwen2.5-coder:14b"

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"

    model_config = {
        "env_prefix": "NEXUS_",
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
    }


settings = Settings()
