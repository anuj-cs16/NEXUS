# NEXUS — Autonomous Local-First AI Software Engineer

NEXUS is an autonomous, **local-first AI Software Engineer** designed to operate as an integrated digital peer on developer workstations. Unlike traditional autocomplete tools or stateless chatbots, NEXUS plans, edits, builds, sandboxes, tests, secures, and reviews codebases while executing strictly within user-defined security envelopes.

---

## 🚀 Key Highlights

* **Local-First & Private:** All AI inference, embeddings, AST parsing, and indexing execute locally on your machine by default with zero telemetry leakage. Optional cloud LLM adapters (e.g. Anthropic, OpenAI) require explicit user configuration and opt-in.
* **Full Engineering Lifecycle:** From requirement analysis and planning to test execution, Docker sandboxing, Git commits, and code review.
* **Modern Desktop & Mobile:** Powered by a lightweight Tauri v2 shell on desktop with an accompanying Android companion app for remote approvals.
* **Model-Agnostic:** Seamless integration with local Ollama models (Qwen 2.5 Coder, Llama 3.3, DeepSeek) and OpenAI-compatible endpoints.

---

## 📚 Core Architecture & Documentation

All architectural specifications are documented in the [`docs/`](./docs) directory:

1. [Product Requirements Document (PRD)](./docs/NEXUS_PRD.md)
2. [Desktop & Web Design Document](./docs/NEXUS_DESIGN_DOC.md)
3. [Technology Stack & Architecture Document](./docs/NEXUS_TECH_STACK.md)

---

## 🛠️ Technology Stack Summary

* **Desktop Shell:** Tauri v2 (Rust)
* **Frontend:** Next.js 15 (Static Export) + React 19 + Tailwind CSS + shadcn/ui + CodeMirror 6 + xterm.js
* **Backend:** Python 3.12+ + FastAPI + Async DAG Orchestrator
* **Local Inference:** Ollama (`qwen2.5-coder:14b` / `llama3.3`) + FastEmbed (ONNX)
* **Database & Vectors:** SQLite 3.45 (WAL Mode) + `sqlite-vec`
* **Sandbox:** Docker Engine (rootless, `--network none`)
* **Code Review:** CodeRabbit AI + Gitleaks Secret Scanner
* **Monorepo:** pnpm workspaces + Turborepo

---

## 📂 Project Structure

```
nexus/
├── apps/
│   └── desktop/             # Tauri Shell + Next.js UI
├── services/
│   └── backend/             # Python 3.12 FastAPI Engine
├── packages/
│   ├── shared-types/        # TypeScript types mirroring backend Pydantic schemas
│   ├── ui/                  # Shared React component primitives (shadcn/ui)
│   └── config/              # Shared Tailwind & ESLint configurations
├── docker/                  # Default sandbox Dockerfiles
├── tests/                   # End-to-end and SWE evaluation suites
└── docs/                    # Architecture, PRD, and Design specs
```

---

## 🚧 Development Setup

### Prerequisites

* **Node.js** ≥ 22.x LTS
* **pnpm** ≥ 9.x (`npm install -g pnpm`)
* **Python** ≥ 3.12
* **uv** (Python package manager: `pip install uv`)
* **Rust** stable (`rustup default stable`) — for Tauri compilation
* **Docker Desktop** v26+ with WSL2 backend
* **Ollama** v0.4+ with `qwen2.5-coder:14b` installed

### Quick Start

```bash
# 1. Install JavaScript dependencies
pnpm install

# 2. Install Python dependencies
cd services/backend
uv sync
cd ../..

# 3. Start the backend (in one terminal)
cd services/backend
uv run uvicorn nexus.main:app --reload --host 127.0.0.1 --port 8000

# 4. Start the frontend (in another terminal)
pnpm --filter @nexus/desktop dev

# 5. (Optional) Launch Tauri desktop app
cd apps/desktop
pnpm tauri dev
```

### Backend API Documentation

When running in debug mode, FastAPI auto-generates API docs:
* **Swagger UI:** http://127.0.0.1:8000/docs
* **ReDoc:** http://127.0.0.1:8000/redoc

### Running Tests

```bash
# Backend tests
cd services/backend
uv run pytest tests/ -v

# Frontend type checking
pnpm typecheck
```

---

## 📄 License

MIT License.
