# NEXUS Backend Engine

Python 3.12+ FastAPI backend for the NEXUS AI Software Engineer.

## Development

```bash
# Install dependencies
uv sync

# Run development server
uv run uvicorn nexus.main:app --reload --host 127.0.0.1 --port 8000

# Run tests
uv run pytest tests/ -v
```
