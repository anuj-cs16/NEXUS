# NEXUS — Notifications, Events & Real-Time Synchronization Architecture
**Document Version:** 1.0.0  
**Status:** Approved Real-Time & Event Architecture Baseline  
**Classification:** Core System Specification  
**Primary Sources of Truth:** `NEXUS_PRD.md` (v1.0.0), `NEXUS_TECH_STACK.md` (v1.0.0), `NEXUS_DESIGN_DOC.md` (v1.0.0), `NEXUS_BACKEND_ARCHITECTURE.md` (v1.0.0), `NEXUS_TASK_LIFECYCLE_AND_ORCHESTRATION_ARCHITECTURE.md` (v1.0.0), `NEXUS_SECURITY_ARCHITECTURE.md` (v1.0.0), `NEXUS_OBSERVABILITY_ARCHITECTURE.md` (v1.0.0)

---

## 1. Executive Summary

NEXUS is an autonomous, **local-first AI Software Engineering Command Center** that orchestrates specialized AI agents directly on developer workstations. Unlike consumer conversational chatbots that stream unstructured Markdown text, NEXUS coordinates multi-step architectural planning, file modifications, Docker sandboxed execution, terminal multiplexing, dynamic test suites, automated Git operations, and human-in-the-loop security approvals.

To deliver an instantaneous, rock-solid user experience across both the **Tauri Desktop Command Center** and the **Android Companion Application**, NEXUS requires a deterministic, highly resilient **Notifications, Events & Real-Time Synchronization Architecture**.

This specification defines the complete real-time event lifecycle:
1. **Strictly Typed Event Envelope:** A versioned, serializable data contract (`EventEnvelope`) with monotonic sequence numbers, trace IDs, and pre-persistence secret redaction.
2. **Dual-Tier Event Taxonomy:** Clear separation between **Durable Business Events** (state transitions, approvals, tool outcomes, security findings, test completions) persisted in SQLite/PostgreSQL WAL and **Ephemeral Telemetry** (terminal stdout/stderr chunks, token generation deltas, system resource telemetry) that can be throttled, coalesced, or dropped under backpressure.
3. **Primary Transport & Fallback:** Bi-directional, full-duplex WebSocket connections for sub-millisecond local desktop interaction and remote Android companion streaming, backed by Server-Sent Events (SSE) and HTTP snapshot replay for degraded network conditions.
4. **Snapshot + Incremental Delta Synchronization:** Clients reconnect seamlessly after network disconnects, device sleep, or backend restarts using a monotonic resume cursor (`last_event_seq`), requesting missing deltas from the ring buffer or falling back to a full state snapshot.
5. **Human-in-the-Loop Approval Governance:** Fail-safe, auditable approval workflows where approval requests are durably persisted with unique cryptographic request IDs, broadcast simultaneously to desktop and mobile, and resolved idempotently. A missing notification or disconnected client is **never** interpreted as approval.
6. **Air-Gapped Local-First Privacy:** Zero mandatory external cloud dependencies. Notifications, event dispatching, and synchronization function 100% offline within the local workstation and private LAN/Tailscale mesh.

---

## 2. Scope & Non-Goals

### 2.1 In-Scope
* **Event Pipeline:** Ingestion, schema validation, persistence, dispatching, filtering, and subscription management.
* **Real-Time Transports:** WebSocket protocol specification, SSE fallback, heartbeat mechanisms, and connection lifecycle.
* **Synchronization & Replay:** Monotonic sequence indexing, ring-buffer replay, gap detection, duplicate suppression, and snapshot recovery.
* **Multi-Client State Alignment:** Tauri desktop UI (React 19 / CodeMirror / xterm.js) and Android companion (Jetpack Compose) state convergence.
* **Notification System:** Priority tiering (Critical, High, Medium, Low), multi-channel delivery (Desktop OS notification, UI toast, Android push via UnifiedPush/FCM, audio chime), user preference matrices, and quiet hours.
* **Approval Synchronization:** Dual-device approval broadcast, race-condition resolution, cancellation propagation, and audit logging.
* **Backpressure & Coalescing:** High-frequency log batching, token delta throttling, slow subscriber protection, and queue overflow policies.
* **Offline & Partition Tolerance:** Local buffering, disconnected operation, and reconnect reconciliation.
* **Security & Privacy:** Workspace/project tenancy isolation, ECDSA/JWT token authorization, secret redaction, and lock-screen privacy.

### 2.2 Non-Goals
* **Global Multi-User Real-Time Collaborative Editing:** NEXUS is a local-first single-developer command center (with multi-device personal companion pairing); it does not implement operational transformation (OT) or CRDTs for multi-developer simultaneous text editing in MVP/V1.
* **External Cloud Message Broker Dependency:** NEXUS will not require external managed brokers (e.g., AWS SQS, Google Cloud Pub/Sub, Kafka) for local execution.
* **Unbounded Ephemeral Streaming Persistence:** High-volume terminal character streams are not permanently stored row-by-row in the relational database; they are buffered in ephemeral chunked storage and written to raw log files.

---

## 3. Codebase Reconciliation & Baseline

### 3.1 Existing Codebase Artifacts
The NEXUS repository contains existing event and streaming foundations that this architecture extends without duplication:

1. **`services/backend/src/nexus/core/events.py`:** Defines the core `EventType` enum and the baseline `EventEnvelope` model.
2. **`services/backend/src/nexus/core/event_bus.py`:** Implements the in-memory `EventBus` singleton supporting topic subscriptions, wildcard handlers, and subscriber queues.
3. **`services/backend/src/nexus/api/endpoints/stream.py`:** Implements `/ws/tasks/{task_id}` for WebSocket streaming and `/events/tasks/{task_id}` for SSE streaming.
4. **`services/backend/src/nexus/api/endpoints/approvals.py`:** Implements approval decision endpoints (`POST /api/v1/approvals/{approval_id}/decision`).
5. **`services/backend/src/nexus/core/exceptions.py`:** Defines the core error hierarchy including `NexusError`, `SecurityException`, and `TaskExecutionError`.

### 3.2 Architectural Enhancements Over Baseline
The existing implementation provides basic in-memory pub/sub and task-scoped streaming. This architecture upgrades the system to an enterprise-grade real-time infrastructure:

| Feature Dimension | Existing Baseline (`core/events.py`, `stream.py`) | Proposed Architecture Specification |
| :--- | :--- | :--- |
| **Event Ordering** | Unordered UUIDs (`evt_<hex>`), no sequence tracking | Monotonic 64-bit integer sequence ID (`seq_id`) per task + global monotonic index |
| **Event Durability** | Transient in-memory queue (`asyncio.Queue(maxsize=1000)`) | Dual-tier: WAL-backed `task_events` relational table + ring-buffer memory cache |
| **Reconnection & Replay** | No replay support; client starts fresh upon reconnect | Monotonic cursor replay (`GET /api/v1/tasks/{id}/events?since_seq=X`) + snapshot fallback |
| **Multiplexed Subscriptions**| Single task per connection (`/ws/tasks/{task_id}`) | Global event multiplexer (`/ws/v1/events`) supporting multi-task and system filtering |
| **Backpressure Control** | Silent drop on queue full (`logger.warning("queue_full")`) | Adaptive token-bucket rate limiting, log chunk coalescing, and slow-client disconnect |
| **Mobile Companion Sync** | Generic SSE endpoint | Authenticated ECDSA companion stream, push notification gateway, and stale detection |
| **Approval Lifecycle** | Basic approve/reject endpoint | Durable approval state machine, multi-device broadcast, atomic race protection, auto-expiry |
| **Secret Redaction** | Codebase-level redaction in logging only | Pipeline-level pre-persistence and pre-broadcast AST/regex secret scrubbers |

---

## 4. Assumptions & Unresolved Decisions

### 4.1 Confirmed Architectural Decisions
1. **Local-First Authority:** The local desktop backend (`services/backend`) is the single source of truth for all task execution, repository state, and authorization. The Android companion is a synchronized satellite client.
2. **Primary Protocol:** WebSocket is the primary real-time transport for both desktop and mobile clients. SSE serves as an automatic fallback when WebSockets are blocked by corporate proxies or restricted networks.
3. **Strict In-Order Guarantee per Task:** Events within a specific task context MUST be delivered and processed in strict monotonic sequence order.
4. **Fail-Safe Approval Policy:** Disconnection, timeout, or lost notifications NEVER result in default approval. The system halts in `WAITING_APPROVAL` until an explicit cryptographic approval payload is received.
5. **Privacy Gate:** Zero event data or notifications are routed through third-party cloud relays in `local_only_mode`.

### 4.2 Unresolved Decisions (TBD — Requires Approval)

```
+-----------------------------------------------------------------------------------+
| TBD-SYNC-01: Mobile Push Delivery Architecture in Air-Gapped Mode                |
| Status: OPEN — REQUIRES APPROVAL                                                  |
| Options:                                                                          |
|   A) UnifiedPush / ntfy self-hosted on workstation LAN (Default Recommended)       |
|   B) High-frequency background WebSocket keep-alive with Android Foreground Svc  |
|   C) Firebase Cloud Messaging (FCM) relay (Requires external cloud relay)        |
| Target Resolution: Prior to Android Companion V1 Release                         |
+-----------------------------------------------------------------------------------+
| TBD-SYNC-02: Ephemeral Log Chunk Storage Strategy                                 |
| Status: OPEN — REQUIRES APPROVAL                                                  |
| Options:                                                                          |
|   A) Append-only raw `.log` files on disk indexed by byte offset (Recommended)     |
|   B) Dedicated SQLite virtual table (FTS5 / binary blob chunking)                 |
| Target Resolution: Phase 2 Real-Time Desktop Implementation                       |
+-----------------------------------------------------------------------------------+
```

---

## 5. Event Lifecycle Architecture

```mermaid
flowchart TD
    subgraph EventSources["1. Event Sources"]
        TaskEngine["Task Lifecycle Engine"]
        AgentRunner["Agent DAG Orchestrator"]
        ToolRuntime["Tool Execution Sandbox"]
        SecurityEngine["Security & Policy Gate"]
        TestRunner["Dynamic Test Runner"]
    end

    subgraph ValidationPipeline["2. Ingestion & Validation Pipeline"]
        SchemaValidator["Pydantic v2 Schema Validator"]
        ScopeAttacher["Workspace & Auth Scope Attacher"]
        SecretRedactor["Pre-Persistence Secret Scrubber"]
    end

    subgraph DurabilityRouter["3. Durability Router"]
        Classifier{"Event Classification"}
        DurableStore[("SQLite / PostgreSQL\nWAL TaskEvent Table")]
        RingBuffer[("In-Memory Circular\nReplay Buffer (10k events)")]
        RawLogStore[("Append-Only\nLog File Store")]
    end

    subgraph RealTimeDispatcher["4. Real-Time Event Dispatcher (EventBus)"]
        EventBusEngine["Async Topic Dispatcher"]
        BackpressureManager["Backpressure & Coalescing Engine"]
        TaskQueue["Task Queues"]
        GlobalQueue["Global Event Queues"]
    end

    subgraph DeliveryTransport["5. Transport & Synchronization Layer"]
        DesktopWS["Desktop WebSocket / IPC"]
        MobileWS["Android WebSocket / TLS"]
        SSEFallback["SSE Fallback Stream"]
        PushGateway["Notification & Push Gateway"]
    end

    subgraph Clients["6. Synchronized Clients"]
        TauriUI["Tauri Desktop UI\n(React 19 / xterm / CodeMirror)"]
        AndroidApp["Android Companion\n(Jetpack Compose)"]
        OSNotifier["OS System Notifications"]
    end

    EventSources --> SchemaValidator
    SchemaValidator --> ScopeAttacher
    ScopeAttacher --> SecretRedactor
    SecretRedactor --> Classifier

    Classifier -->|Durable Business Event| DurableStore
    Classifier -->|Ephemeral Telemetry| RawLogStore
    DurableStore --> RingBuffer
    RawLogStore --> RingBuffer

    RingBuffer --> EventBusEngine
    EventBusEngine --> BackpressureManager
    BackpressureManager --> TaskQueue
    BackpressureManager --> GlobalQueue

    TaskQueue --> DesktopWS
    TaskQueue --> MobileWS
    TaskQueue --> SSEFallback
    GlobalQueue --> PushGateway

    DesktopWS --> TauriUI
    MobileWS --> AndroidApp
    PushGateway --> OSNotifier
    PushGateway --> AndroidApp
```

### 5.1 Step-by-Step Lifecycle Description
1. **Event Production:** An executing agent, tool runner, or state machine produces an event payload.
2. **Schema & Integrity Validation:** The event is validated against the versioned `EventEnvelope` schema. Malformed events are logged and dropped before propagation.
3. **Scope & Tracing Injection:** The pipeline attaches `workspace_id`, `project_id`, `task_id`, `trace_id`, and a monotonically increasing `seq_id`.
4. **Secret Scrubbing:** The payload passes through the `SecretRedactor` (detecting API keys, Bearer tokens, private keys, and environment variables).
5. **Durability Routing:**
   - **Durable Events** (Status changes, approvals, diff patches, test results) are synchronously committed to the database WAL.
   - **Ephemeral Events** (Terminal chunks, token deltas) bypass relational table insertion and are written to memory buffers and append-only disk files.
6. **In-Memory Ring Buffer Insertion:** All events enter a per-task circular ring buffer (10,000 events) for instant replay upon client reconnection.
7. **Real-Time Distribution:** The `EventBus` broadcasts the event to active WebSocket, SSE, and Push subscriber queues.
8. **Client Checkpoint Acknowledgment:** Connected clients receive events, update local state, and acknowledge the latest received `seq_id`.

---

## 6. Event Contract & Schema Specification

All events across backend services, desktop UI, and mobile clients adhere to the strictly typed `EventEnvelope` specification.

### 6.1 Versioned JSON Schema (`v1.0.0`)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "NexusEventEnvelope",
  "type": "object",
  "required": [
    "schema_version",
    "event_id",
    "seq_id",
    "timestamp",
    "event_type",
    "category",
    "durability",
    "source",
    "payload"
  ],
  "properties": {
    "schema_version": { "type": "string", "enum": ["1.0.0"] },
    "event_id": { "type": "string", "pattern": "^evt_[0-9a-fA-F]{20}$" },
    "seq_id": { "type": "integer", "minimum": 1 },
    "timestamp": { "type": "string", "format": "date-time" },
    "workspace_id": { "type": "string" },
    "project_id": { "type": "string" },
    "task_id": { "type": ["string", "null"] },
    "agent_id": { "type": ["string", "null"] },
    "tool_call_id": { "type": ["string", "null"] },
    "correlation_id": { "type": "string" },
    "trace_id": { "type": "string" },
    "event_type": { "type": "string" },
    "category": {
      "type": "string",
      "enum": ["task", "agent", "tool", "approval", "test", "repo", "system", "telemetry"]
    },
    "durability": {
      "type": "string",
      "enum": ["durable", "ephemeral"]
    },
    "sensitivity": {
      "type": "string",
      "enum": ["public", "internal", "restricted", "confidential"],
      "default": "internal"
    },
    "source": {
      "type": "object",
      "required": ["component", "host"],
      "properties": {
        "component": { "type": "string" },
        "host": { "type": "string" },
        "pid": { "type": "integer" }
      }
    },
    "payload": { "type": "object" }
  },
  "additionalProperties": false
}
```

### 6.2 Python Pydantic Model (`services/backend/src/nexus/core/events.py`)

```python
"""NEXUS Event Envelope — Enhanced Enterprise Specification v1.0.0."""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Literal
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field


class EventCategory(str, Enum):
    """Event classification domains."""
    TASK = "task"
    AGENT = "agent"
    TOOL = "tool"
    APPROVAL = "approval"
    TEST = "test"
    REPO = "repo"
    SYSTEM = "system"
    TELEMETRY = "telemetry"


class EventDurability(str, Enum):
    """Persistence durability guarantees."""
    DURABLE = "durable"      # Persisted to DB WAL; guaranteed delivery & replay
    EPHEMERAL = "ephemeral"  # Memory ring-buffer only; coalesced/dropped under load


class EventSensitivity(str, Enum):
    """Information security classification."""
    PUBLIC = "public"
    INTERNAL = "internal"
    RESTRICTED = "restricted"
    CONFIDENTIAL = "confidential"


class EventSource(BaseModel):
    """Originating runtime component."""
    component: str = Field(..., description="E.g., orchestrator, sandbox, model_router")
    host: str = Field(default="localhost", description="Originating node hostname")
    pid: int | None = Field(default=None, description="Process identifier")


class EventType(str, Enum):
    """Comprehensive taxonomy of all NEXUS system events."""

    # 1. Task Lifecycle
    TASK_CREATED = "task.created"
    TASK_QUEUED = "task.queued"
    TASK_STARTED = "task.started"
    TASK_PAUSED = "task.paused"
    TASK_RESUMED = "task.resumed"
    TASK_WAITING_APPROVAL = "task.waiting_approval"
    TASK_COMPLETED = "task.completed"
    TASK_FAILED = "task.failed"
    TASK_CANCELLED = "task.cancelled"

    # 2. Planning & Strategy
    PLAN_GENERATED = "plan.generated"
    PLAN_UPDATED = "plan.updated"
    PLAN_STEP_STARTED = "plan.step_started"
    PLAN_STEP_COMPLETED = "plan.step_completed"
    PLAN_STEP_FAILED = "plan.step_failed"

    # 3. Agent Lifecycle & Activity
    AGENT_STARTED = "agent.started"
    AGENT_THOUGHT = "agent.thought"
    AGENT_TOKEN_DELTA = "agent.token_delta"
    AGENT_STEP_COMPLETED = "agent.step_completed"
    AGENT_TIMED_OUT = "agent.timed_out"
    AGENT_FAILED = "agent.failed"

    # 4. Tool Execution
    TOOL_INVOKED = "tool.invoked"
    TOOL_OUTPUT_CHUNK = "tool.output_chunk"
    TOOL_COMPLETED = "tool.completed"
    TOOL_FAILED = "tool.failed"
    TOOL_REJECTED = "tool.rejected"

    # 5. Security & Human Approvals
    APPROVAL_REQUESTED = "approval.requested"
    APPROVAL_GRANTED = "approval.granted"
    APPROVAL_DENIED = "approval.denied"
    APPROVAL_EXPIRED = "approval.expired"
    APPROVAL_CANCELLED = "approval.cancelled"
    SECURITY_FINDING = "security.finding_detected"

    # 6. Testing & Quality Assurance
    TEST_STARTED = "test.started"
    TEST_OUTPUT_CHUNK = "test.output_chunk"
    TEST_PASSED = "test.passed"
    TEST_FAILED = "test.failed"
    TEST_SUITE_COMPLETED = "test.suite_completed"

    # 7. Repository & Git State
    REPO_DIRTY_DETECTED = "repo.dirty_detected"
    REPO_CHECKPOINT_CREATED = "repo.checkpoint_created"
    REPO_CHECKPOINT_RESTORED = "repo.checkpoint_restored"
    REPO_COMMIT_CREATED = "repo.commit_created"
    REPO_CONFLICT_DETECTED = "repo.conflict_detected"

    # 8. System & Recovery
    SYSTEM_RECOVERING = "system.recovering"
    SYSTEM_RECOVERY_COMPLETED = "system.recovery_completed"
    SYSTEM_RESOURCE_PRESSURE = "system.resource_pressure"
    SYSTEM_PROVIDER_FAILOVER = "system.provider_failover"


class EventEnvelope(BaseModel):
    """Standardized, immutable JSON event envelope for all NEXUS communications."""
    model_config = ConfigDict(frozen=True, extra="forbid")

    schema_version: str = Field(default="1.0.0", description="Event contract schema version")
    event_id: str = Field(
        default_factory=lambda: f"evt_{uuid4().hex[:20]}",
        description="Globally unique event ID",
    )
    seq_id: int = Field(
        ...,
        description="Monotonically increasing sequence number per task/session",
    )
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        description="ISO 8601 UTC timestamp with millisecond precision",
    )
    workspace_id: str = Field(..., description="Workspace boundary identifier")
    project_id: str = Field(..., description="Project boundary identifier")
    task_id: str | None = Field(default=None, description="Target task identifier")
    agent_id: str | None = Field(default=None, description="Active agent persona")
    tool_call_id: str | None = Field(default=None, description="Active tool invocation ID")
    correlation_id: str = Field(
        default_factory=lambda: f"corr_{uuid4().hex[:16]}",
        description="Request correlation ID for end-to-end tracing",
    )
    trace_id: str = Field(
        default_factory=lambda: f"trc_{uuid4().hex[:16]}",
        description="OpenTelemetry compatible trace identifier",
    )
    event_type: EventType = Field(..., description="Typed event name")
    category: EventCategory = Field(..., description="Domain category")
    durability: EventDurability = Field(default=EventDurability.DURABLE, description="Durability level")
    sensitivity: EventSensitivity = Field(default=EventSensitivity.INTERNAL, description="Security level")
    source: EventSource = Field(default_factory=lambda: EventSource(component="orchestrator", host="localhost"))
    payload: dict[str, Any] = Field(default_factory=dict, description="Structured event payload")
```

---

## 7. Event Taxonomy & Category Matrix

The table below defines the complete event taxonomy, durability guarantees, default urgency, retention rules, and targeted subscribers.

| Event Category | Event Type (`event_type`) | Durability | Urgency | Retention Period | Target Subscribers | Payload Contents |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Task** | `task.created` | Durable | Low | Indefinite | Desktop, Mobile, DB | Title, description, prompt, creator |
| **Task** | `task.started` | Durable | Medium | Indefinite | Desktop, Mobile, DB | Initial plan summary, assigned agents |
| **Task** | `task.waiting_approval` | Durable | **Critical** | Indefinite | Desktop, Mobile, Push | `approval_id`, risk level, action spec |
| **Task** | `task.completed` | Durable | **High** | Indefinite | Desktop, Mobile, Push | Duration, files modified, token cost |
| **Task** | `task.failed` | Durable | **Critical** | Indefinite | Desktop, Mobile, Push | Error code, stack trace, failure point |
| **Task** | `task.cancelled` | Durable | Medium | Indefinite | Desktop, Mobile, DB | Cancellation reason, rollback status |
| **Plan** | `plan.generated` | Durable | Medium | Indefinite | Desktop, Mobile, DB | DAG node structure, estimated steps |
| **Plan** | `plan.step_completed` | Durable | Low | Indefinite | Desktop, Mobile, DB | Step index, duration, status |
| **Agent** | `agent.started` | Durable | Low | 30 Days | Desktop, Mobile | Agent persona, initial context size |
| **Agent** | `agent.thought` | Ephemeral | Low | 7 Days | Desktop, Mobile | Reasoning scratchpad, plan evaluation |
| **Agent** | `agent.token_delta` | Ephemeral | Trace | Transient (0d)| Desktop (Stream) | Partial token chunk, finish reason |
| **Tool** | `tool.invoked` | Durable | Medium | Indefinite | Desktop, Mobile, DB | Tool name, parameters (redacted) |
| **Tool** | `tool.output_chunk` | Ephemeral | Trace | Transient (0d)| Desktop (xterm.js)| Stdout/stderr chunk, byte stream |
| **Tool** | `tool.completed` | Durable | Low | Indefinite | Desktop, Mobile, DB | Exit code, duration, diff summary |
| **Tool** | `tool.failed` | Durable | High | Indefinite | Desktop, Mobile, DB | Exit code, error message, retry count |
| **Approval** | `approval.requested` | Durable | **Critical** | Indefinite | Desktop, Mobile, Push | Action diff, risk tier, timeout_ms |
| **Approval** | `approval.granted` | Durable | High | Indefinite | Desktop, Mobile, DB | Approver ID, client signature |
| **Approval** | `approval.denied` | Durable | High | Indefinite | Desktop, Mobile, DB | Reason for denial, feedback to agent |
| **Test** | `test.started` | Durable | Low | 30 Days | Desktop, Mobile | Test framework, discovered test count |
| **Test** | `test.passed` | Durable | Low | 30 Days | Desktop, Mobile | Passed test count, execution time |
| **Test** | `test.failed` | Durable | **High** | Indefinite | Desktop, Mobile, DB | Failure trace, failing assertion, file |
| **Repo** | `repo.checkpoint_created`| Durable | Medium | Indefinite | Desktop, DB | Git commit hash, tree OID, ref name |
| **System** | `system.resource_pressure`| Durable | High | 14 Days | Desktop, Mobile, Log | CPU/RAM/VRAM percentage, throttled ops |
| **System** | `system.recovering` | Durable | High | 30 Days | Desktop, Mobile, DB | Recovery phase, rollback target |

---

## 8. Real-Time Transport Strategy

### 8.1 Transport Comparison Matrix

| Evaluation Dimension | WebSocket (`/ws/v1/...`) | Server-Sent Events (`/events/...`) | HTTP Polling (`/api/v1/...`) | Desktop Tauri IPC | Mobile Push (UnifiedPush/FCM) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Role in NEXUS** | **Primary Transport** | **Fallback Transport** | **Recovery Transport** | **Sub-Process Transport** | **Alerting Gateway** |
| **Directionality** | Full Duplex (Bi-directional) | Unidirectional (Server->Client) | Request / Response | Bi-directional (IPC Ring) | Unidirectional (Push) |
| **Latency** | Sub-millisecond (<1ms local) | 2ms - 10ms | 100ms - 5000ms (Poll gap) | Microseconds (<100µs) | 500ms - 3000ms |
| **Overhead per Event** | 2-6 bytes frame header | ~50 bytes HTTP framing | Full HTTP header overhead | In-memory zero-copy | Push payload envelope |
| **Reconnection Support** | Client heartbeat + resume seq | Built-in browser `Last-Event-ID` | Stateless | N/A (Internal OS Process) | OS system managed |
| **Android Compatibility** | Excellent (OkHttp / Ktor) | Good (HttpEngine / OkHttp) | Universal | N/A | Native Android OS Service |
| **Air-Gap Compliance** | 100% Offline (Localhost / LAN) | 100% Offline | 100% Offline | 100% Offline | 100% Offline (UnifiedPush) |
| **Recommended Usage** | Live streaming, approvals, logs | Corporate proxy fallback | Initial snapshot & gap sync | Tauri Frontend <-> Backend | Background wakeups & alerts |

### 8.2 Transport Decision & Standardized Endpoints
1. **Primary Command Center Stream (`WebSocket`):**
   - **Path:** `ws://127.0.0.1:50051/ws/v1/events` (Desktop) or `wss://<host>:50051/ws/v1/events` (LAN/Tailscale).
   - **Capabilities:** Multiplexes all task updates, terminal output, approvals, and bidirectional commands (cancel, pause, approve, reject).
2. **Task-Specific Focused Stream (`WebSocket`):**
   - **Path:** `/ws/v1/tasks/{task_id}`.
   - **Capabilities:** Dedicated pipe filtered exclusively to the active task, optimizing memory and rendering bandwidth.
3. **HTTP Streaming Fallback (`SSE`):**
   - **Path:** `GET /api/v1/tasks/{task_id}/events/stream`.
   - **Headers:** `Accept: text/event-stream`, `Last-Event-ID: <seq_id>`.
4. **Snapshot & Replay Endpoints (`HTTP REST`):**
   - **Path:** `GET /api/v1/tasks/{task_id}/events?since_seq=<seq_id>&limit=500`.
   - **Path:** `GET /api/v1/tasks/{task_id}/snapshot` (Complete consolidated state tree).

---

## 9. Delivery Semantics, Guarantees & Ordering

### 9.1 Delivery Guarantees
NEXUS enforces precise, deterministic delivery semantics based on event durability:

```
+-----------------------------------------------------------------------------------+
| 1. DURABLE BUSINESS EVENTS (Task, Plan, Approval, Tool Complete, Test, Recovery)   |
|    - Guarantee: AT-LEAST-ONCE Delivery with Idempotent Processing                 |
|    - Ordering: Strict Monotonic Sequence Order (seq_id = 1, 2, 3...) per Task     |
|    - Durability: Synchronous Database WAL Write before Network Dispatch           |
|    - Recovery: Guaranteed replay from WAL for any valid seq_id                     |
+-----------------------------------------------------------------------------------+
| 2. EPHEMERAL TELEMETRY (Terminal stdout/stderr chunks, Token deltas, CPU metrics) |
|    - Guarantee: AT-MOST-ONCE Delivery (Best-Effort)                               |
|    - Ordering: Monotonic Sequence Order within Ring Buffer Window                 |
|    - Durability: In-Memory Ring Buffer (10k items) & Raw Log Files                |
|    - Coalescing: Intermediate token chunks and progress updates may be coalesced  |
+-----------------------------------------------------------------------------------+
```

### 9.2 Monotonic Sequence Ordering Architecture
Every task maintains an atomic 64-bit integer counter initialized at `0` upon task creation:
* When an event is staged, `seq_id = atomic_increment(task_seq_counter)`.
* Events are committed to the `task_events` table indexed by `(task_id, seq_id)`.
* Clients maintain a local tracking variable: `client_last_seq_id`.
* If a client receives an event with `seq_id > client_last_seq_id + 1`, a **Gap Detected** state is triggered, initiating an immediate catch-up query.

### 9.3 Client-Side Idempotency & Deduplication
To guarantee safe processing under at-least-once delivery, clients implement deterministic deduplication:
```
function processIncomingEvent(event: EventEnvelope): void {
    if (event.seq_id <= this.lastProcessedSeqId) {
        logger.debug("Duplicate event ignored", { event_id: event.event_id, seq_id: event.seq_id });
        return; // Deduplicate
    }
    
    if (event.seq_id > this.lastProcessedSeqId + 1) {
        this.triggerGapRecovery(this.lastProcessedSeqId, event.seq_id);
        return; // Queue out-of-order event and fetch missing range
    }
    
    // Apply event to local Redux/Zustand state store
    this.applyEventToStore(event);
    this.lastProcessedSeqId = event.seq_id;
    this.persistLocalCursor(event.task_id, event.seq_id);
}
```

---

## 10. Reconnection, Gap Detection & Missed-Event Recovery

### 10.1 Reconnection Protocol & Backoff
When a WebSocket connection drops (due to network disruption, workstation sleep, or app backgrounding), clients execute an **Exponential Backoff with Full Jitter** reconnection strategy:

$$\text{Delay} = \min\left(\text{MaxDelay}, \text{BaseDelay} \times 2^{\text{retryCount}}\right) \times \text{Uniform}(0.8, 1.2)$$

* **Base Delay:** 500ms
* **Max Delay:** 15,000ms (Desktop), 30,000ms (Mobile)
* **Max Direct Replay Limit:** 1,000 events

```mermaid
sequenceDiagram
    autonumber
    participant Client as Client (Desktop / Android)
    participant WS as WebSocket Gateway (/ws/v1/events)
    participant Replay as Replay Engine (Memory Ring / DB)
    participant State as Task State Store

    Note over Client,WS: Network Interruption / Sleep Disconnect
    Client->>WS: Connect: wss://host:50051/ws/v1/events?since_seq=42
    WS->>WS: Authenticate Token / ECDSA Signature
    WS->>Replay: Query Missed Events (task_id, since_seq=42)
    
    alt Missed Events in Buffer (Gap <= 1000 events)
        Replay-->>WS: Stream Events [43..58]
        WS-->>Client: Message Envelope [seq_id=43..58]
        Client->>Client: Apply Deltas in Monotonic Order
        WS-->>Client: Real-Time Stream Resumed (seq_id=59+)
    else Gap Exceeds Buffer OR Expired Cursor
        Replay-->>WS: Error: CURSOR_EXPIRED (Head seq_id=1500)
        WS-->>Client: Command: SYNC_SNAPSHOT_REQUIRED (head_seq=1500)
        Client->>State: GET /api/v1/tasks/{id}/snapshot
        State-->>Client: Full Snapshot JSON (State at seq_id=1500)
        Client->>Client: Rehydrate Complete Local State Tree
        Client->>WS: Subscribed at seq_id=1500
        WS-->>Client: Real-Time Stream Resumed (seq_id=1501+)
    end
```

### 10.2 Snapshot State Structure (`TaskSnapshot`)
If a client has been disconnected for days or missed thousands of log events, downloading thousands of raw deltas is inefficient. The server generates a consolidated **Task State Snapshot**:
```json
{
  "task_id": "tsk_01J8X9M1P4L2K9R8T3",
  "snapshot_seq_id": 1500,
  "timestamp": "2026-10-03T09:45:00.000Z",
  "status": "RUNNING",
  "active_agent": "DEVELOPER",
  "current_plan": {
    "plan_id": "pln_01",
    "total_steps": 5,
    "completed_steps": 3,
    "steps": [ ... ]
  },
  "pending_approval": null,
  "files_modified": ["services/backend/src/nexus/core/events.py"],
  "test_summary": {
    "total": 45,
    "passed": 45,
    "failed": 0
  },
  "resource_usage": {
    "tokens_consumed": 12450,
    "execution_duration_sec": 42.5
  }
}
```

---

## 11. Desktop Synchronization Architecture

### 11.1 Tauri Local Sub-Process & State Alignment
The Tauri desktop application runs in two primary processes:
1. **Core Rust Process (Tauri Shell):** Coordinates native windowing, tray icons, OS notifications, and spawns the local Python backend (`nexus-backend`).
2. **Webview UI Process (React 19 / Next.js):** Renders the command center UI, editor tabs, interactive DAG, terminal emulators, and approval modals.

```mermaid
flowchart LR
    subgraph TauriApp["Tauri Desktop Application"]
        subgraph Webview["Webview UI (React 19)"]
            Zustand["Zustand State Store"]
            xterm["xterm.js Terminal"]
            DiffView["CodeMirror 6 Diff View"]
            ModalManager["Approval Modal Gate"]
        end
        
        subgraph RustCore["Tauri Core (Rust)"]
            NativeNotify["Native OS Notifications\n(Windows Toast / macOS NC)"]
            TrayManager["System Tray Icon & Badges"]
            PTYBridge["PTY Multiplexer"]
        end
    end

    subgraph BackendProcess["Python Backend (FastAPI / Uvicorn)"]
        EventBusSub["EventBus & WebSocket Server"]
        TaskEngineCore["Task State Machine"]
    end

    BackendProcess <-->|WebSocket: ws://127.0.0.1:50051/ws/v1/events| Webview
    BackendProcess <-->|Localhost HTTP / IPC| RustCore
    Webview --> Zustand
    Webview --> xterm
    Webview --> DiffView
    Webview --> ModalManager
    RustCore --> NativeNotify
    RustCore --> TrayManager
```

### 11.2 UI Rendering & Re-render Prevention
* **Selective Subscriptions:** Components subscribe exclusively to slice domains (e.g., `useApprovalStore` only re-renders on `approval.*` events; `useTerminalStore` only consumes `tool.output_chunk` for the active tab).
* **Virtualization:** Log outputs in `xterm.js` and terminal panels are rendered using chunked ring buffers (up to 50,000 lines) without triggering React Virtual DOM diffing.

---

## 12. Android Companion Synchronization Architecture

The Android Companion is a remote satellite interface designed for monitoring, plan review, log inspection, and human-in-the-loop approvals.

```mermaid
flowchart TD
    subgraph AndroidApp["Android Companion App (Jetpack Compose)"]
        AuthModule["ECDSA Device Authenticator"]
        SyncManager["Sync & State Manager"]
        RoomDB[("Local Room Database\nCached Tasks & Snapshots")]
        ComposeUI["Compose UI Screens\n(Tasks, Approvals, Live Log)"]
        BackgroundWorker["Android WorkManager\n& Foreground Service"]
    end

    subgraph NetworkLayer["Encrypted Network Transport"]
        LAN_TLS["Local LAN TLS / mTLS"]
        Tailscale["Tailscale / WireGuard Mesh"]
        PushService["UnifiedPush / Push Gateway"]
    end

    subgraph WorkstationBackend["Workstation Backend Engine"]
        WSServer["WebSocket Server\n(/ws/v1/events)"]
        APIGateway["REST API Gateway\n(/api/v1/...)"]
        PushDispatcher["Notification Dispatcher"]
    end

    AuthModule -->|Handshake & JWT Pairing| APIGateway
    SyncManager -->|WebSocket Session| WSServer
    SyncManager -->|Snapshot Catch-Up| APIGateway
    SyncManager <--> RoomDB
    RoomDB --> ComposeUI
    PushService --> BackgroundWorker
    BackgroundWorker -->|Wake & Reconnect| SyncManager
    PushDispatcher --> PushService

    WSServer -.-> LAN_TLS -.-> SyncManager
    WSServer -.-> Tailscale -.-> SyncManager
```

### 12.1 Mobile Connection Lifecycle & Background Suspension
1. **Active Foreground State:** Maintains a full-duplex WebSocket connection. Streams live plan step completions, agent thought summaries, and test runs.
2. **Background / Screen-Off State:**
   - Android OS suspends background sockets to conserve battery.
   - The backend detects socket closure and routes urgent events (`approval.requested`, `task.completed`, `task.failed`) through the **Push Gateway**.
3. **Push Notification Wakeup:**
   - The push payload contains: `{ "task_id": "...", "approval_id": "...", "type": "approval.requested", "risk": "HIGH" }`.
   - Tapping the notification launches the app with a **Deep Link** (`nexus://tasks/{task_id}/approvals/{approval_id}`).
4. **Resumption & Catch-up:**
   - The app reconnects its WebSocket passing `since_seq=<last_seq_in_room_db>`.
   - The server streams missing deltas, synchronizing local Room DB before presenting the approval screen.

---

## 13. Notification Classification, Urgency & User Preferences

### 13.1 Notification Priority Matrix

| Class ID | Notification Class | Urgency | Default Desktop Behavior | Default Android Behavior | Sound / Haptics | User Configurable? | Requires Ack? |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **NOTIF-01** | **Critical Failure** | Critical | Banner + OS Toast + Red Tray | High-Priority Push + Sound | Urgent Chime / Double Buzz | No (Always Enabled) | Yes |
| **NOTIF-02** | **Approval Required**| Critical | Modal Popup + OS Toast + Yellow Tray| High-Priority Push + Alert | Action Tone / Long Pulse | No (Always Enabled) | **Yes (Vote)**|
| **NOTIF-03** | **Task Completed** | High | Toast + Green Tray | Standard Push | Completion Chime / Pulse | Yes | No |
| **NOTIF-04** | **Task Failed** | High | Toast + Red Tray | Standard Push | Error Beep / Pulse | Yes | No |
| **NOTIF-05** | **Task Paused** | Medium | Toast | Low-Priority Push | Silent | Yes | No |
| **NOTIF-06** | **Recovery Complete**| Medium | Toast | Low-Priority Push | Silent | Yes | No |
| **NOTIF-07** | **Agent Warning** | Low | UI Badge only | Silent / In-App Only | Silent | Yes | No |
| **NOTIF-08** | **Progress Info** | Trace | Ephemeral Status Bar | In-App Only | Silent | Yes | No |

### 13.2 Notification Preference Schema (`NotificationPreferences`)
```json
{
  "user_id": "usr_default",
  "quiet_hours_enabled": true,
  "quiet_hours_start": "22:00",
  "quiet_hours_end": "08:00",
  "channels": {
    "desktop_os_toasts": true,
    "desktop_audio_cues": true,
    "mobile_push_enabled": true,
    "mobile_lockscreen_previews": "REDACTED_TITLE_ONLY"
  },
  "thresholds": {
    "min_push_urgency": "HIGH",
    "suppress_progress_pushes": true,
    "allow_critical_during_quiet_hours": true
  }
}
```

---

## 14. Approval Event Reliability & Dual-Device Race Governance

Human-in-the-loop approvals are mission-critical security barriers. They must execute with absolute cryptographic reliability, zero race conditions, and complete auditability.

```mermaid
sequenceDiagram
    autonumber
    participant Agent as Agent / Tool Engine
    participant Gate as Approval Security Engine
    participant DB as SQLite WAL Store
    participant Desk as Desktop UI
    participant Mob as Android Companion

    Agent->>Gate: Request Tool Execution (Risk: HIGH / Tier 4)
    Gate->>DB: INSERT INTO approvals (id, status='PENDING', expires_at=T+300s)
    Gate->>DB: INSERT INTO task_events (event_type='approval.requested')
    Gate-->>Desk: Broadcast Event: approval.requested (approval_id=app_101)
    Gate-->>Mob: Broadcast / Push: approval.requested (approval_id=app_101)
    
    Note over Desk,Mob: Both devices display approval modal simultaneously

    alt User Approves on Android Companion First
        Mob->>Gate: POST /api/v1/approvals/app_101/decision {decision: 'APPROVE', client: 'mobile'}
        Gate->>DB: BEGIN IMMEDIATE TRANSACTION
        Gate->>DB: SELECT status FROM approvals WHERE id='app_101' FOR UPDATE
        Note over Gate,DB: Status is 'PENDING' -> Update to 'APPROVED'
        Gate->>DB: UPDATE approvals SET status='APPROVED', resolved_by='mobile'
        Gate->>DB: COMMIT TRANSACTION
        Gate-->>Mob: 200 OK (Decision Recorded)
        Gate-->>Desk: Broadcast Event: approval.granted (approval_id=app_101, by='mobile')
        Desk->>Desk: Dismiss Modal -> Update UI to "Approved on Mobile"
        Gate-->>Agent: Resume Execution with Approved Authorization Token
    else Desktop Submits Late (Race Condition)
        Desk->>Gate: POST /api/v1/approvals/app_101/decision {decision: 'REJECT', client: 'desktop'}
        Gate->>DB: BEGIN IMMEDIATE TRANSACTION
        Gate->>DB: SELECT status FROM approvals WHERE id='app_101'
        Note over Gate,DB: Status is already 'APPROVED' (Immutable Terminal State)
        Gate->>DB: ROLLBACK
        Gate-->>Desk: 409 Conflict: {error: "APPROVAL_ALREADY_RESOLVED", current_status: "APPROVED"}
        Desk->>Desk: Sync UI with Server Truth
    end
```

### 14.1 Immutable Approval Guarantees
1. **Single Resolution Rule:** Once an approval transitions out of `PENDING` into `APPROVED`, `REJECTED`, `EXPIRED`, or `CANCELLED`, its state is cryptographically immutable.
2. **Atomic Transaction Lock:** Resolution executes inside a SQLite `IMMEDIATE` transaction (or PostgreSQL `SELECT ... FOR UPDATE`), preventing dual-device race condition conflicts.
3. **No Timeout Approval:** If `expires_at` is reached without a response, the backend triggers an automatic `approval.expired` event and transitions the task to `PAUSED` or `FAILED`.
4. **Audit Trail:** Every decision record stores `resolved_by`, `client_ip`, `client_device_fingerprint`, and the exact HMAC/ECDSA signature of the approval payload.

---

## 15. Backpressure, Event Coalescing & Rate Governance

High-volume terminal execution (e.g., `npm install`, full test suites compiling thousands of lines) can produce hundreds of log chunks per second. To prevent memory exhaustion, WebSocket frame saturation, or UI freezes, NEXUS enforces multi-tiered backpressure.

```mermaid
flowchart TD
    subgraph RawSources["Raw Event Producers"]
        CompilerLog["Compiler / Sandbox Stdout (1000 chunks/sec)"]
        TokenGen["LLM Token Stream (100 tokens/sec)"]
        TaskEvents["State Changes (1-5 events/sec)"]
    end

    subgraph BackpressureEngine["Backpressure & Coalescing Engine"]
        Classifier{"Classify Event"}
        DurablePipe["Durable Bypass Pipe (Zero Dropping)"]
        LogBuffer["Sliding Window Log Chunk Aggregator (50ms window)"]
        TokenThrottle["Token Delta Throttle (30ms batcher)"]
        QueueMonitor{"Subscriber Queue Depth Check"}
        SlowClientDrop["Slow Subscriber Handler (Drop Ephemeral Chunks)"]
    end

    subgraph OutputQueues["Subscriber Output Queues"]
        ClientQueue["WebSocket Client Queue (maxsize=1000)"]
    end

    CompilerLog --> Classifier
    TokenGen --> Classifier
    TaskEvents --> Classifier

    Classifier -->|Durable Event| DurablePipe --> ClientQueue
    Classifier -->|Tool Chunk| LogBuffer
    Classifier -->|Token Chunk| TokenThrottle

    LogBuffer -->|Combined 50ms Batch| QueueMonitor
    TokenThrottle -->|Combined 30ms Batch| QueueMonitor

    QueueMonitor -->|Queue < 80% Full| ClientQueue
    QueueMonitor -->|Queue >= 80% Full| SlowClientDrop
    SlowClientDrop -->|Coalesce & Drop Chunks| ClientQueue
```

### 15.1 Coalescing Algorithms
* **Sliding Window Log Batching:** Stdout/stderr chunks emitted within a 50ms window are concatenated into a single UTF-8 text chunk before WebSocket framing.
* **Token Delta Merging:** Partial LLM tokens emitted within 30ms are merged into a single `agent.token_delta` payload.
* **Ephemeral Drop on Slow Subscribers:** If a client's outbound queue exceeds 800 items (80% of `maxsize=1000`), the engine drops incoming `tool.output_chunk` and `agent.thought` events for that specific connection while logging an in-stream notification: `[Events coalesced due to client backpressure]`. **Durable events are never dropped.**

---

## 16. Offline & Local-First Operation

NEXUS operates primarily as a local-first application on the developer's workstation.

### 16.1 Local Event Persistence & Buffering
* All durable events are written directly to the local SQLite database (`nexus.db`) in WAL mode.
* The system requires **zero internet connection** for task execution, event streaming to the local Tauri UI, tool running, local Ollama inference, and SQLite persistence.

### 16.2 Mobile Disconnection Handling
* If the workstation goes offline or the Android companion moves outside the local Wi-Fi / Tailscale network:
  1. The mobile companion stores pending local actions (e.g., task creation requests) in its local Room DB marked `status='PENDING_SYNC'`.
  2. Upon network reconnection, the mobile client performs a two-way synchronization: uploading pending task requests and downloading task events starting from its local `last_synced_seq_id`.
* **Clock Skew Mitigation:** All event ordering relies on the backend-assigned monotonic integer `seq_id`. Client system clocks are used solely for localized UI display; time differences never corrupt event ordering or state consistency.

---

## 17. Security, Privacy & Access Control

### 17.1 Workspace & Project Tenancy Isolation
1. **Subscription Scoping:** Every WebSocket subscription handshake requires authentication and explicit workspace scoping. A client cannot subscribe to `/ws/v1/tasks/{task_id}` unless the client token possesses read permissions for the project containing that `task_id`.
2. **Access Control Tokens:**
   - **Desktop UI:** Local session token generated at backend boot, stored in secure memory.
   - **Android Companion:** ECDSA key-pair pairing established via QR code scan during initial setup; requests are signed with short-lived JWT tokens (1 hour) refreshed via mutual TLS.

### 17.2 Pre-Persistence & Pre-Broadcast Secret Redaction
Before any event is committed to the database or broadcast over WebSockets, the payload is processed by the `SecretRedactor`:
* **Patterns Scrubbed:** API keys (`sk-[a-zA-Z0-9]{32,}`, `ghp_[a-zA-Z0-9]{36}`), AWS access keys (`AKIA[0-9A-Z]{16}`), private keys (`-----BEGIN PRIVATE KEY-----`), and generic environment tokens (`Bearer .*`).
* **Replacement:** Redacted values are replaced with `[REDACTED:SECRET_TYPE]`.

### 17.3 Mobile Lock-Screen Privacy Controls
Per user preferences, push notifications on mobile devices are stripped of source code snippets, proprietary project paths, or diff details:
* *Default Preview:* `[NEXUS] Approval Required: Review Shell Command Execution (Task: tsk_01J8X9...)`
* *Strict Privacy Mode:* `[NEXUS] 1 New Action Requires Your Approval`

---

## 18. Persistence, Data Model & Retention

### 18.1 Database Entity Schemas (SQLite / PostgreSQL)

```sql
-- 1. Master Task Events Table (Durable Event Log)
CREATE TABLE IF NOT EXISTS task_events (
    event_id VARCHAR(32) PRIMARY KEY,
    seq_id BIGINT NOT NULL,
    task_id VARCHAR(32) NOT NULL,
    workspace_id VARCHAR(32) NOT NULL,
    project_id VARCHAR(32) NOT NULL,
    agent_id VARCHAR(32),
    tool_call_id VARCHAR(32),
    correlation_id VARCHAR(32) NOT NULL,
    trace_id VARCHAR(32) NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    category VARCHAR(32) NOT NULL,
    durability VARCHAR(16) NOT NULL,
    sensitivity VARCHAR(16) NOT NULL,
    source_component VARCHAR(64) NOT NULL,
    payload JSON NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_task_seq UNIQUE (task_id, seq_id)
);

CREATE INDEX IF NOT EXISTS idx_task_events_lookup 
ON task_events (task_id, seq_id ASC);

CREATE INDEX IF NOT EXISTS idx_task_events_type 
ON task_events (event_type, created_at DESC);

-- 2. Human Approvals Table
CREATE TABLE IF NOT EXISTS approvals (
    approval_id VARCHAR(32) PRIMARY KEY,
    task_id VARCHAR(32) NOT NULL,
    workspace_id VARCHAR(32) NOT NULL,
    tool_name VARCHAR(64) NOT NULL,
    risk_level VARCHAR(16) NOT NULL,
    action_summary TEXT NOT NULL,
    action_payload JSON NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, EXPIRED, CANCELLED
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by VARCHAR(64),
    resolution_client VARCHAR(32),
    resolution_reason TEXT,
    signature VARCHAR(128)
);

CREATE INDEX IF NOT EXISTS idx_approvals_status 
ON approvals (status, task_id);

-- 3. Client Synchronization Cursors Table
CREATE TABLE IF NOT EXISTS client_sync_cursors (
    client_id VARCHAR(64) NOT NULL,
    task_id VARCHAR(32) NOT NULL,
    last_seq_id BIGINT NOT NULL,
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (client_id, task_id)
);

-- 4. Notification History & Delivery Table
CREATE TABLE IF NOT EXISTS notifications (
    notification_id VARCHAR(32) PRIMARY KEY,
    user_id VARCHAR(32) NOT NULL,
    task_id VARCHAR(32),
    class_id VARCHAR(32) NOT NULL,
    urgency VARCHAR(16) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    payload JSON,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMP WITH TIME ZONE
);
```

### 18.2 Retention, Archival & Pruning Lifecycle
1. **Durable Task Events:** Retained indefinitely for the lifetime of the active project to preserve full task auditability. Pruned only upon explicit project archival or deletion.
2. **Ephemeral Ring Buffers:** In-memory circular queues maintain the last 10,000 events per task, clearing automatically upon task completion or server shutdown.
3. **Notification History:** Retained for 90 days; notifications marked as read and older than 30 days are purged weekly by an automatic background maintenance worker.

---

## 19. Complete Architecture Diagrams

### 19.1 End-to-End Real-Time System Topology

```mermaid
graph TB
    subgraph DesktopMachine["Workstation (Host OS)"]
        subgraph Backend["NEXUS Core Backend (FastAPI / Python)"]
            TaskEngine["Task State Engine"]
            EventBusCore["EventBus (In-Memory Pub/Sub)"]
            Redactor["Secret Redactor"]
            DB[(SQLite WAL DB)]
            RingBuf[("Ring Buffer (10k)")]
            WS_Server["WebSocket Server\n(:50051)"]
            SSE_Server["SSE Fallback Engine"]
            PushDistributor["Push Distributor"]
        end

        subgraph TauriApp["Tauri Desktop Shell"]
            TauriCore["Tauri Rust Core"]
            WebviewUI["Webview Frontend\n(React 19 / Zustand)"]
        end
    end

    subgraph MobileDevice["Android Companion (Satellite Client)"]
        AndroidUI["Jetpack Compose UI"]
        MobileRoomDB[(Room Local DB)]
        AndroidSync["Sync Manager"]
        WorkManager["WorkManager Push Receiver"]
    end

    TaskEngine --> Redactor
    Redactor --> DB
    Redactor --> RingBuf
    RingBuf --> EventBusCore
    EventBusCore --> WS_Server
    EventBusCore --> SSE_Server
    EventBusCore --> PushDistributor

    WS_Server <-->|WebSocket: /ws/v1/events| WebviewUI
    WebviewUI <-->|Tauri IPC| TauriCore
    
    WS_Server <-->|TLS WebSocket| AndroidSync
    PushDistributor -.->|Push Message| WorkManager
    WorkManager --> AndroidSync
    AndroidSync <--> MobileRoomDB
    MobileRoomDB --> AndroidUI
```

### 19.2 Event Production, Persistence & Real-Time Broadcast Sequence

```mermaid
sequenceDiagram
    autonumber
    participant Producer as Agent / Tool Execution
    participant Redactor as Secret Redactor
    participant DB as SQLite WAL
    participant Ring as Ring Buffer Cache
    participant Bus as EventBus Dispatcher
    participant Clients as Connected WS Clients

    Producer->>Redactor: emit(event_type, payload)
    Redactor->>Redactor: Scrub secrets (API keys, tokens, paths)
    Redactor->>Redactor: Assign atomic seq_id & timestamp
    
    par Persist & Buffer
        Redactor->>DB: INSERT INTO task_events (durable event)
    and
        Redactor->>Ring: Push to Circular Ring Buffer
    end
    
    Redactor->>Bus: publish(EventEnvelope)
    Bus->>Bus: Match Subscriptions & Filters
    Bus->>Clients: Send WebSocket Frame (JSON EventEnvelope)
    Clients-->>Bus: ACK seq_id
```

### 19.3 Multi-Device Notification Routing & Quiet-Hours Decision Tree

```mermaid
flowchart TD
    Start([Event Produced]) --> Classify{Notification Class?}
    
    Classify -->|Critical: Failure / Approval| HighPri[High-Priority Routing]
    Classify -->|High: Completed / Failed| MedPri[Standard Routing]
    Classify -->|Low / Trace: Progress / Thought| LowPri[In-App Stream Only]
    
    LowPri --> DesktopOnly[Display in Active Desktop UI Only]
    
    HighPri --> CheckQuiet1{Quiet Hours Active?}
    MedPri --> CheckQuiet2{Quiet Hours Active?}
    
    CheckQuiet1 -->|Yes| OverrideQuiet[Bypass Quiet Hours: Alert Immediately]
    CheckQuiet1 -->|No| AlertAll[Alert All Configured Channels]
    
    CheckQuiet2 -->|Yes| SuppressMobile[Deliver to Desktop Toast; Suppress Mobile Push]
    CheckQuiet2 -->|No| AlertAll
    
    OverrideQuiet --> Dispatch[Dispatch OS Toast + Mobile Push + Audio Chime]
    AlertAll --> Dispatch
```

---

## 20. Observability, Metrics & Structured Logging

The real-time and event synchronization subsystem exposes structured Prometheus metrics and OpenTelemetry trace spans.

### 20.1 Core Telemetry Metrics

| Metric Name | Type | Labels | Description |
| :--- | :--- | :--- | :--- |
| `nexus_events_produced_total` | Counter | `category`, `event_type`, `durability` | Total number of events generated |
| `nexus_events_persisted_total` | Counter | `category`, `status` | Total events committed to WAL |
| `nexus_event_persistence_latency_seconds` | Histogram | `operation` | Time taken to commit event to SQLite/PostgreSQL |
| `nexus_realtime_connections_active` | Gauge | `transport`, `client_type` | Current active WebSocket/SSE connections |
| `nexus_realtime_broadcast_latency_seconds`| Histogram | `transport` | Dispatch latency from EventBus to socket write |
| `nexus_realtime_replays_total` | Counter | `task_id`, `status` | Number of replay requests processed |
| `nexus_realtime_gap_recoveries_total` | Counter | `client_type` | Number of client sequence gap recoveries |
| `nexus_realtime_backpressure_drops_total` | Counter | `event_type`, `client_id` | Number of ephemeral events dropped due to backpressure|
| `nexus_approvals_pending_gauge` | Gauge | `workspace_id`, `risk_level` | Current number of unresolved approval requests |

### 20.2 Structured Event Log Sample
```json
{
  "timestamp": "2026-10-03T09:46:12.105Z",
  "level": "INFO",
  "logger": "nexus.realtime.dispatcher",
  "event": "event_broadcast_complete",
  "event_id": "evt_9a8b7c6d5e4f3a2b1c0d",
  "seq_id": 482,
  "task_id": "tsk_01J8X9M1P4L2K9R8T3",
  "event_type": "tool.completed",
  "subscribers_count": 2,
  "dispatch_duration_ms": 0.42,
  "trace_id": "trc_f8e7d6c5b4a39281"
}
```

---

## 21. Failure Modes & Recovery Matrix

| Failure ID | Failure Mode | Root Cause | Impact | Detection Mechanism | Automated Recovery Action | User-Facing Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **FAIL-EVT-01**| Database Write Lock Contention | High-concurrency SQLite write during tool spike | Event persistence delay | Timeout on SQLite transaction (>2.0s) | Retry with exponential backoff (max 3 retries); buffer in memory | UI displays "Syncing..." spinner |
| **FAIL-EVT-02**| WebSocket Frame Delivery Failure | Abrupt client disconnect / laptop sleep | Stale socket queue | Broken pipe / `WebSocketDisconnect` | Unregister socket queue; buffer events in ring buffer for reconnect | Desktop shows "Reconnecting..." badge |
| **FAIL-EVT-03**| Sequence Gap Detected by Client | Packet drop or out-of-order frame arrival | Client UI out of sync | `event.seq_id > client_last_seq + 1` | Client halts stream consumption & calls `GET /events?since_seq=X` | Brief pause in live log rendering |
| **FAIL-EVT-04**| Ring Buffer Cursor Expired | Client disconnected longer than ring buffer retention | Cannot replay incremental deltas | Backend returns `410 Gone / CURSOR_EXPIRED` | Client fetches full `GET /tasks/{id}/snapshot` & rehydrates | Full screen state refresh |
| **FAIL-EVT-05**| Dual-Device Approval Collision | User clicks Approve on phone & Reject on PC simultaneously | Conflicting approval actions | Atomic DB lock detects second submission | First submission wins; second client receives `409 Conflict` & updates UI | "Action already resolved on Mobile" |
| **FAIL-EVT-06**| Slow Subscriber Buffer Overflow | Unresponsive webview / mobile main-thread lock | Outbound queue exceeds limit (`maxsize=1000`) | `asyncio.QueueFull` on socket queue | Drop ephemeral chunks (`tool.output_chunk`); keep durable events intact | "Output stream throttled" indicator |
| **FAIL-EVT-07**| Push Gateway Offline / Failed | Local UnifiedPush server unreachable | Mobile push alert fails | HTTP 503 from Push Gateway | Fallback to high-frequency polling on mobile next wake; log warning | Push alert missed; in-app notification intact |
| **FAIL-EVT-08**| Malformed Event Schema | Buggy plugin or third-party tool output | Serialization crash | Pydantic validation error | Drop malformed payload; emit `system.event_validation_failed` error | "Internal Event Error" in Diagnostics |

---

## 22. Testing, Quality Assurance & Acceptance Criteria

### 22.1 Test Suites & Verification Scope

```
1. Schema & Contract Tests (services/backend/tests/unit/events/)
   ├── test_event_envelope_schema_validation.py (100% field compliance)
   ├── test_secret_redaction_pipeline.py (API key, token, private key scrub)
   └── test_monotonic_sequence_generation.py (Atomic counter under concurrency)

2. Transport & Delivery Tests (services/backend/tests/integration/realtime/)
   ├── test_websocket_task_streaming.py (Full-duplex frame delivery)
   ├── test_sse_fallback_streaming.py (SSE event-stream compliance)
   ├── test_reconnection_and_replay.py (Replay from seq_id 42 -> 100)
   └── test_snapshot_rehydration.py (Snapshot retrieval on expired cursor)

3. Concurrency & Safety Tests (services/backend/tests/integration/approvals/)
   ├── test_dual_device_approval_race.py (Simultaneous mobile/desktop resolution)
   ├── test_approval_timeout_expiration.py (Task pauses upon expiration)
   └── test_slow_subscriber_backpressure.py (Ephemeral dropping without durable loss)

4. Mobile Companion E2E Tests (apps/companion/tests/)
   ├── test_mobile_session_reconnect.py (Room DB delta synchronization)
   └── test_deep_link_approval_launch.py (Push notification launch to approval view)
```

### 22.2 Measurable Acceptance Criteria (Quality Gates)
* **Local Delivery Latency:** 99th percentile event broadcast latency $\le 5\text{ms}$ on local workstation.
* **Sequence Integrity:** 0% sequence gaps or out-of-order event applications across 10,000 generated test events.
* **Secret Leak Prevention:** Zero raw API keys or passwords present in persisted `task_events` or WebSocket frames across 500 adversarial red-team fuzzing payloads.
* **Approval Race Integrity:** 100% of simultaneous dual-approval attempts resolve cleanly with exactly 1 winner and 0 corrupted states.
* **Backpressure Resilience:** Zero memory exhaustion or application crashes when flooded with 5,000 log chunks per second.

---

## 23. Phased Implementation Roadmap

```
+-----------------------------------------------------------------------------------+
| PHASE 1: Durable Event Engine & Envelope Baseline                                 |
| Target Duration: Week 1                                                           |
| Dependencies: Existing Backend Database Infrastructure                            |
| Deliverables:                                                                     |
|   - Implement enhanced EventEnvelope with seq_id and metadata                      |
|   - Create task_events, approvals, and cursors database tables & Alembic migration |
|   - Integrate SecretRedactor into event ingestion pipeline                        |
|   - Implement atomic task sequence counter                                        |
| Definition of Done: 100% Unit test pass for schema, redaction, and persistence.   |
+-----------------------------------------------------------------------------------+
| PHASE 2: Desktop Real-Time Multiplexer & Replay Engine                            |
| Target Duration: Week 2                                                           |
| Dependencies: Phase 1 Completed                                                   |
| Deliverables:                                                                     |
|   - Implement /ws/v1/events global & task WebSocket endpoints                     |
|   - Implement in-memory 10k event circular ring buffer                            |
|   - Implement incremental event replay & snapshot recovery REST endpoints        |
|   - Integrate Zustand event-store in React desktop UI                             |
| Definition of Done: Live task monitoring & seamless disconnect catch-up verified.|
+-----------------------------------------------------------------------------------+
| PHASE 3: Approval Governance & Multi-Device Race Protection                        |
| Target Duration: Week 3                                                           |
| Dependencies: Phase 2 Completed                                                   |
| Deliverables:                                                                     |
|   - Implement durable approvals state machine with atomic SQLite transactions     |
|   - Build dual-device broadcast & auto-dismissal logic                            |
|   - Implement approval timeout & auto-expiry task handler                         |
|   - Create approval UI modals in Desktop and Mobile companion                     |
| Definition of Done: Race-condition test suite achieves 100% pass rate.           |
+-----------------------------------------------------------------------------------+
| PHASE 4: Mobile Synchronization & Push Gateway Integration                        |
| Target Duration: Week 4                                                           |
| Dependencies: Phase 3 Completed                                                   |
| Deliverables:                                                                     |
|   - Implement Android SyncManager with local Room DB delta cache                  |
|   - Integrate UnifiedPush / local push distributor                               |
|   - Build deep-link notification handler for Jetpack Compose UI                   |
|   - Implement mobile lock-screen privacy filters                                  |
| Definition of Done: Android companion successfully completes remote approval flow.|
+-----------------------------------------------------------------------------------+
| PHASE 5: Backpressure, Coalescing & Observability Hardening                       |
| Target Duration: Week 5                                                           |
| Dependencies: Phase 4 Completed                                                   |
| Deliverables:                                                                     |
|   - Implement sliding-window log chunk coalescing (50ms)                          |
|   - Implement token delta throttling (30ms)                                       |
|   - Add slow-subscriber detection & ephemeral frame dropping                      |
|   - Expose Prometheus metrics for real-time throughput and latency                |
| Definition of Done: Stress test with 5,000 chunks/sec passes without memory leak.  |
+-----------------------------------------------------------------------------------+
```

---

## 24. Risks & Mitigations

| Risk ID | Risk Description | Severity | Likelihood | Mitigation Strategy | Verification Method |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **R-SYNC-01** | High log volume freezes desktop UI | High | Medium | Enforce 50ms batch coalescing and xterm.js non-virtualized ring buffer | Synthetic 10k lines/sec log flood test |
| **R-SYNC-02** | Stale approval granted after task timeout | Critical | Low | Check `expires_at` inside atomic DB lock; reject expired approvals with 410 | Boundary timestamp expiration test |
| **R-SYNC-03** | Android app displays desynchronized state | High | Medium | Force snapshot sync whenever sequence gap exceeds ring buffer limit | Network disconnect & buffer overflow test |
| **R-SYNC-04** | API secret leaked over WebSocket | Critical | Low | Mandatory AST/regex `SecretRedactor` before database write or network emit | Adversarial security redaction test suite |
| **R-SYNC-05** | Excessive memory usage in ring buffer | Medium | Medium | Hard cap circular ring buffer to 10,000 events per task; purge on complete | Long-running task memory profiling |

---

## 25. References to Related Documents

* `NEXUS_PRD.md` — Section 14 (Real-time Task Monitoring & Mobile Companion Requirements).
* `NEXUS_TECH_STACK.md` — Section 28 (Event-Driven Bus & WebSocket Specification).
* `NEXUS_BACKEND_ARCHITECTURE.md` — Section 15 (Real-Time Streaming Engine & EventBus).
* `NEXUS_TASK_LIFECYCLE_AND_ORCHESTRATION_ARCHITECTURE.md` — Section 4 (State Machine & Event Triggers).
* `NEXUS_SECURITY_ARCHITECTURE.md` — Section 5 (Approval Gates & Credential Protection).
* `NEXUS_OBSERVABILITY_ARCHITECTURE.md` — Section 4 (Structured Logging & Telemetry Envelopes).
* `NEXUS_ANDROID_COMPANION_UI_UX_SPEC.md` — Section 6 (Mobile Remote Approval & Synchronization).

---

## 26. Consistency Verification

### 26.1 No Duplicate Systems Introduced
* **Event Bus:** Extends the existing `EventBus` singleton in `services/backend/src/nexus/core/event_bus.py`.
* **Event Schema:** Extends `EventEnvelope` and `EventType` in `services/backend/src/nexus/core/events.py` while preserving backward compatibility.
* **Streaming Endpoints:** Preserves `/ws/tasks/{task_id}` and `/events/tasks/{task_id}` in `stream.py`, adding versioned routes (`/ws/v1/events`).
* **Database Models:** Aligns with existing SQLAlchemy ORM base and Alembic migration conventions.

---

## 27. Next Logical Architecture Document

The recommended next document in the NEXUS master architecture series is:

**`docs/NEXUS_AGENT_ORCHESTRATION_AND_DAG_ARCHITECTURE.md`**

**Rationale:**  
With the **Real-Time Synchronization & Notification Architecture** and **AI Model Runtime Architecture** now fully defined, the critical remaining core system to specify is the **Custom Async DAG Orchestrator**. This document will specify how multi-agent workflows (Planner, Developer, Tester, Debugger, Security, Reviewer) are dynamically planned, sequenced, executed, paused for approvals, self-healed, and checkpointed, providing the complete algorithmic engine that produces the events defined in this document.

---

*End of Notifications, Events & Real-Time Synchronization Architecture Document — v1.0.0*
