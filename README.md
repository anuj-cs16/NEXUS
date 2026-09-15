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
* **Backend:** Python 3.12 + FastAPI + Async DAG Orchestrator
* **Local Inference:** Ollama (`qwen2.5-coder:14b` / `llama3.3`) + FastEmbed (ONNX)
* **Database & Vectors:** SQLite 3.45 (WAL Mode) + `sqlite-vec`
* **Sandbox:** Docker Engine (rootless, `--network none`)
* **Code Review:** CodeRabbit AI + Gitleaks Secret Scanner

---

## 📄 License

MIT License.
