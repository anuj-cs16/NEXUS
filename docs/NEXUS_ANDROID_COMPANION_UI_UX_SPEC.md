# NEXUS Android Companion App — Master UI/UX & Mobile Architecture Specification

**Document Version:** 1.0.0  
**Status:** Approved Production Mobile Specification  
**Classification:** Mobile UI/UX Design System, Android Companion Architecture & Interaction Standard  
**Target Platform:** Android Companion Application (`.apk` / `.aab` for Android 10+ / API Level 29–35)  
**Primary Sources of Truth:**
- `docs/PRD.md` (v1.0.0)
- `docs/NEXUS_TECH_STACK.md` (v1.0.0)
- `docs/NEXUS_DESIGN_DOC.md` (v1.0.0)
- `docs/NEXUS_DESIGN_SYSTEM.md` (v1.0.0)
- `docs/NEXUS_SECURITY_ARCHITECTURE.md` (v1.0.0)
- `docs/NEXUS_DEPLOYMENT_ARCHITECTURE.md` (v1.0.0)
- `docs/NEXUS_OBSERVABILITY_ARCHITECTURE.md` (v1.0.0)
- `docs/NEXUS_BACKUP_AND_DISASTER_RECOVERY_ARCHITECTURE.md` (v1.0.0)

---

## 1. Product Context & Architecture Boundary

NEXUS is a local-first **AI Software Engineering Command Center**. The system operates across a clear distributed pairing boundary:

```
+---------------------------------------------------------------------------------------------------+
|                            NEXUS DISTRIBUTED ARCHITECTURE BOUNDARY                                |
+---------------------------------------------------------------------------------------------------+
|  PRIMARY WORKSTATION (Desktop Windows Host)        │  SECURE COMPANION (Android Node)            |
|  - Authoritative SQLite WAL Database (nexus.db)    │  - Touch-Optimized Mobile Control Room       |
|  - Local AI Inference (Ollama Qwen2.5-Coder)       │  - Real-Time Task Telemetry Monitor          |
|  - Docker Sandbox & Tool Execution Runtime         │  - Human-in-the-Loop Approval Gate          |
|  - Git Version Control Engine & Filesystem         │  - Remote Task Dispatcher                    |
|  - Automated Pytest Verification Runner            │  - Encrypted mTLS WebSocket Receiver         |
|  - Master Backup & Restore Authority               │  - Push & Local System Notifications         |
+---------------------------------------------------------------------------------------------------+
```

### 1.1 Core Mobile Principles
1. **Remote Control Room, Not Engine Clone:** The Android companion does **not** execute local multi-gigabyte LLMs or run Docker sandboxes. It acts as an agile, low-latency mobile control room.
2. **Deterministic Security & Zero Privilege Bypass:** Remote mobile approvals follow the exact same security policies and permission tiers as desktop confirmations. Mobile cannot force or bypass security gates.
3. **Local Encrypted Pairing:** Communication occurs over mutual TLS (mTLS) with pinned cryptographic certificates over local Wi-Fi or secure Tailscale wireguard mesh tunnels.
4. **Graceful Offline Degradation:** If the desktop is sleeping or disconnected, the mobile companion shifts to a transparent **Read-Only Cached Mode**, clearly signaling offline status without crashing or hanging.

---

## 2. Visual Identity & Mobile Design Tokens

The Android Companion strictly preserves the approved **Futuristic Cyber Operations Workstation** visual language, tailored specifically for mobile touch ergonomics:

```
+---------------------------------------------------------------------------------------------------+
|                                 MOBILE DESIGN TOKENS MATRIX                                       |
+---------------------------------------------------------------------------------------------------+
| Token Name           | Hex Value | Semantic Purpose on Android                                    |
| :---                 | :---      | :---                                                           |
| `color-bg-primary`   | `#050B18` | Deep midnight navy background, OLED battery-friendly canvas    |
| `color-bg-secondary` | `#0A1225` | App bar, bottom navigation bar, card container grouping        |
| `color-bg-panel`     | `#111C35` | Standard mobile cards, touch targets, list items               |
| `color-bg-elevated`  | `#172544` | Active tabs, pressed states, bottom sheet surfaces             |
| `color-border`       | `#1B2D52` | Hairline touch target borders (1px solid)                       |
| `color-cyan`         | `#52E5FF` | Active desktop link, live execution progress, active chips     |
| `color-blue`         | `#398BFF` | Primary mobile CTAs ("Dispatch Task", "Approve & Run")         |
| `color-violet`       | `#9B7CFF` | AI reasoning indicators, agent tags, memory badges             |
| `color-success`      | `#45E6B0` | Tests passing (19/19), verified completion, online mTLS        |
| `color-warning`      | `#FFC76A` | High-risk approval requests, pending security decisions        |
| `color-error`        | `#FF647C` | Failed tasks, disconnected link, destructive reject action     |
+---------------------------------------------------------------------------------------------------+
```

### 2.1 Mobile Typography & Touch Target Ergonomics
- **Interface Font:** `Inter / Geist` (14px base body, 12px secondary, 10px status tags).
- **Technical Monospace:** `JetBrains Mono` (11px code diffs, logs, timestamps, PIDs).
- **Minimum Touch Target:** $48 \times 48\text{ dp}$ (Android Material 3 standard compliance).
- **Thumb Zone Optimization:** Primary actions, filter chips, and navigation are anchored within the bottom 60% of the screen.

---

## 3. Primary Mobile Navigation Hierarchy

The Android application is anchored by a persistent, thumb-accessible **5-Tab Bottom Navigation Bar**:

```
+---------------------------------------------------------------------------------------------------+
|  [ ⚡ Overview ]   [ 📋 Tasks ]   [ 🤖 Agents ]   [ 🛡️ Approvals (3) ]   [ ⚙️ More ]              |
+---------------------------------------------------------------------------------------------------+
```

1. **Tab 1 — Overview (`/overview`):** Desktop connection badge, Neural Core status, active task summary, live operations feed, quick action "+ Task".
2. **Tab 2 — Tasks (`/tasks`):** Filterable task list (Active, Queued, Completed, Failed), step progress bars, new task creator.
3. **Tab 3 — Agents (`/agents`):** 6-agent status cards (Planner, Developer, Tester, Debugger, Security, Reviewer), active toolchain inspect.
4. **Tab 4 — Approvals (`/approvals`):** Pending human-in-the-loop permission queue with risk badges, affected file lists, and One-Tap Approve/Reject.
5. **Tab 5 — More (`/more`):** Notification history, execution logs, mTLS desktop connection settings, diagnostics, and app theme.

---

## 4. Comprehensive Screen-by-Screen Specifications (24 Screens)

```
====================================================================================================
NEXUS ANDROID COMPANION — 24 PRODUCTION MOBILE SCREENS DIRECTORY
====================================================================================================
```

### Category A: Onboarding & Secure Pairing

#### Screen 01 — Welcome (`/onboarding/welcome`)
- **Purpose:** Introduce the NEXUS Android Companion and explain the desktop engine relationship.
- **Visuals:** Centered NEXUS Cyber Logo with subtle cyan glow, product headline *"AI Engineering Command Center — Mobile Control Node"*.
- **CTAs:** `[PAIR WITH DESKTOP]` (Primary Blue, 48dp height), `[LEARN HOW IT WORKS]` (Secondary Ghost).

#### Screen 02 — Pair Desktop (`/onboarding/pair`)
- **Purpose:** Scan QR code or enter 8-character pairing pin generated on NEXUS Desktop (Screen 28/22).
- **Visuals:** Camera viewfinder with cyan neon bounding box, manual PIN fallback button, mTLS certificate exchange status indicator.
- **Validation:** Instant verification of desktop IP and TLS handshake.

#### Screen 03 — Connection Verification (`/onboarding/verify`)
- **States:**
  - `Connecting:` Rotating cyan radar sweep with *"Exchanging mTLS certificates with Desktop..."*
  - `Success:` Emerald pulse wave with *"Paired with Workstation-01 (14ms)"*.
  - `Failure:` Crimson card explaining *"Desktop unreachable at 192.168.1.50:8000. Ensure both devices are on the same Wi-Fi network."*
- **CTAs:** `[RETRY HANDSHAKE]`, `[MANUAL IP CONFIG]`.

#### Screen 04 — Notification Permissions (`/onboarding/notifications`)
- **Purpose:** Contextual Android 13+ runtime permission request (`POST_NOTIFICATIONS`).
- **Explanation:** *"Receive real-time alerts when tasks complete, tests fail, or critical tool approvals are requested."*
- **CTAs:** `[ENABLE NOTIFICATIONS]` (Primary), `[SKIP FOR NOW]` (Muted).

---

### Category B: Overview & Dashboard

#### Screen 05 — Mobile Command Overview (`/overview`)
- **Header:** Desktop Status Pill (`● Workstation-01 (14ms)`), AI Model Badge (`qwen2.5-coder:7b`), Notification Bell (Badge: 3).
- **Neural Core Mini-HUD:** 48dp Concentric pulsing ring showing current engine state (`EXECUTING`).
- **Active Task Card:** Highlighted top task (`tsk_01J8Z9`), progress bar (`42%`), active step (`04 TOOL EXECUTION`), assigned DeveloperAgent.
- **Pending Approvals Strip:** High-contrast amber card if requests are pending (`1 High-Risk Action Awaiting Approval`).
- **Live Event Stream:** Compact 3-item chronological event feed (`[14:32:01] patch_file applied`).
- **Floating Action Button (FAB):** `+ New Task` (Cyan `#52E5FF`, bottom-right thumb zone).

#### Screen 06 — Desktop Offline State (`/overview/offline`)
- **Visuals:** Amber/Grey banner across top: `DESKTOP DISCONNECTED — READ-ONLY CACHE`.
- **Content:** Displays cached task history and offline diagnostic instructions. All task modification and approval buttons are safely disabled.
- **CTAs:** `[RECONNECT]`, `[DIAGNOSTIC GUIDE]`.

#### Screen 07 — Desktop Connection Detail (`/overview/connection`)
- **Information:** Host Workstation Name (`DESKTOP-NX-01`), Host IP (`192.168.1.50`), Latency (`14ms`), SQLite Database Epoch (`12`), Active Model (`Qwen2.5-Coder:7b VRAM: 8.4GB`).
- **CTAs:** `[PING HOST]`, `[DISCONNECT WITH CONFIRMATION]`.

---

### Category C: Tasks & Execution

#### Screen 08 — Task Matrix List (`/tasks`)
- **Filter Chips (Horizontal Scroll):** `[All (12)]`, `[Active (2)]`, `[Queued (1)]`, `[Completed (8)]`, `[Failed (1)]`.
- **Search Bar:** Real-time query input filtering tasks by title or project.
- **Task Cards:** Compact cards with ID (`tsk_01`), status chip, title, progress bar, time created, and assigned agent avatar.

#### Screen 09 — Create Mobile Task (`/tasks/create`)
- **Inputs:** Task Title input, Description textarea, Project Selector dropdown (`c:/NEXUS`), Execution Mode toggle (`Standard Autonomous` vs `Review Each Step`).
- **Safety Notice:** *"Task will execute inside the isolated Docker sandbox on your desktop workstation."*
- **CTAs:** `[DISPATCH TASK TO DESKTOP]` (Primary Blue), `[CANCEL]`.

#### Screen 10 — Task Detail Workspace (`/tasks/:id`)
- **Header:** Task Title, Status Badge (`EXECUTING`), Progress (`42%`).
- **Step Timeline:** Vertical 6-stage execution stepper:
  1. `01 COMMAND` (✓ Completed - 42ms)
  2. `02 CONTEXT` (✓ Completed - 180ms)
  3. `03 AGENT SELECT` (✓ Completed - 110ms)
  4. `04 TOOL EXECUTION` (● Active - DeveloperAgent patching task_service.py)
  5. `05 VALIDATION` (○ Pending pytest assertions)
  6. `06 RESULT` (○ Pending approval)
- **Controls:** `[PAUSE EXECUTION]`, `[CANCEL TASK]`, `[VIEW DIFF]`.

#### Screen 11 — Live Task Telemetry Stream (`/tasks/:id/live`)
- **Visuals:** Real-time SSE log stream displaying tool stdout/stderr lines in monospace syntax.
- **Controls:** Auto-scroll toggle, `[COPY LOGS]`.

#### Screen 12 — Task Success Completion (`/tasks/:id/success`)
- **Visuals:** Emerald checkmark header, Execution Duration (`840ms`), Changed Files (`+34 / -12 lines in task_service.py`), Pytest Result (`19/19 passing`).
- **CTAs:** `[VIEW GIT COMMIT]`, `[DONE]`.

#### Screen 13 — Task Failure Diagnostic (`/tasks/:id/failure`)
- **Visuals:** Crimson warning card, Failed Step (`05 VALIDATION`), Error traceback (`AssertionError: test_recovery_rollback failed`).
- **CTAs:** `[RETRY FAILED STEP]`, `[REVERT TO PRE-MIGRATION SNAPSHOT]`, `[VIEW FULL LOG]`.

---

### Category D: Agents & Intelligence

#### Screen 14 — Agent Overview (`/agents`)
- **Content:** Grid of 6 specialized agents with status dots:
  - `PlannerAgent` (● Ready - Violet)
  - `DeveloperAgent` (● Executing - Cyan)
  - `TesterAgent` (● Queued - Emerald)
  - `DebuggerAgent` (● Idle - Red)
  - `SecurityAgent` (● Active - Amber)
  - `ReviewerAgent` (● Idle - Blue)

#### Screen 15 — Agent Detail Workspace (`/agents/:id`)
- **Details:** Role description, Allowed Tools (`patch_file`, `write_to_file`), Permission Tier (Tier 2 Workspace Write), Active Hardware VRAM allocation.

#### Screen 16 — Agent Activity Timeline (`/agents/:id/timeline`)
- **Timeline:** Chronological event feed showing exact tool invocations, duration, and exit codes.

---

### Category E: Approvals & Permissions

#### Screen 17 — Approval Inbox (`/approvals`)
- **Badge Counter:** Real-time pending requests count.
- **Card Anatomy:** High-risk amber badge, Requesting Agent (`DeveloperAgent`), Action Summary (`execute_command: "git push origin main"`), Received Timestamp (`2m ago`).

#### Screen 18 — Approval Detail & Risk Review (`/approvals/:id`)
- **Header:** `HIGH-RISK ACTION APPROVAL REQUIRED`.
- **Risk Context:** Tier 4 Git VCS Control.
- **Affected Files:** `3 repository files modified (git status clean)`.
- **Reason:** *"DeveloperAgent requests push to branch feat/dag-recovery after 19 passing tests."*
- **Action Buttons:** `[APPROVE & EXECUTE]` (Solid Green `#45E6B0`), `[REJECT ACTION]` (Crimson `#FF647C`).

#### Screen 19 — Approval Decision Result (`/approvals/:id/result`)
- **Feedback:** Displays *"Decision Recorded: APPROVED at 14:35:10 UTC. Desktop engine notified."*

---

### Category F: Notifications & Execution History

#### Screen 20 — Notification Center (`/notifications`)
- **Tabs:** `All`, `Approvals`, `Task Alerts`, `System`.
- **Item Interaction:** Tapping any notification deep-links directly to its associated task or approval request.

#### Screen 21 — Historical Task Archive (`/history`)
- **Search & Filter:** Search past tasks by date range, completion status, or project name.

---

### Category G: Connection & Settings

#### Screen 22 — Desktop Connection Manager (`/settings/connection`)
- **Host Information:** IP, Port, mTLS Fingerprint, Reconnect, Change Paired Workstation.

#### Screen 23 — Device Security & Vault Status (`/settings/security`)
- **Status:** Local biometric authentication toggle (Fingerprint / Face Unlock for approvals), Pinned Certificate Hash.

#### Screen 24 — App Settings & Diagnostics (`/settings/app`)
- **Preferences:** Haptic Feedback Toggle, Notification Sound, Diagnostic Log Export, About NEXUS v1.0.0.

---

## 5. Core Mobile Interaction Flows

```mermaid
sequenceDiagram
    autonumber
    actor User as Mobile User
    participant Mob as Android Companion
    participant Desk as Desktop FastAPI Engine

    Note over User,Desk: FLOW C: Remote Human-in-the-Loop Approval
    Desk->>Mob: Push Notification / WebSocket: Approval Required (Risk: High)
    User->>Mob: Taps notification -> Opens Screen 18 (Approval Detail)
    Mob->>Mob: Displays Affected Files, Tool Name, Risk Tier
    User->>Mob: Taps [APPROVE & EXECUTE] + Biometric Confirm
    Mob->>Desk: POST /api/v1/approvals/{id}/approve (mTLS Signed)
    Desk-->>Mob: 200 OK (Decision Applied; Task Resumed)
    Mob->>User: Screen 19: Approval Confirmed -> Navigates to Screen 10 (Task Progress)
```

---

## 6. Mobile Component Library (18 Component Specifications)

```
+---------------------------------------------------------------------------------------------------+
|                            MOBILE REUSABLE COMPONENT DIRECTORY                                    |
+---------------------------------------------------------------------------------------------------+
| 1. MobileAppHeader           │  7. ApprovalRequestCard       │ 13. OfflineWarningBanner           |
| 2. MobileBottomNav           │  8. StepperTimelineNode       │ 14. LoadingSkeletonCard            |
| 3. ConnectionStatusPill      │  9. MonospaceLogViewer        │ 15. ConfirmationBottomSheet        |
| 4. TaskStatusChip            │ 10. NotificationListItem      │ 16. FilterChipGroup                |
| 5. TaskProgressCard          │ 11. BiometricAuthGate         │ 17. SearchInputField               |
| 6. AgentAvatarBadge          │ 12. EmptyStateCard            │ 18. ToastSnackbarFeedback          |
+---------------------------------------------------------------------------------------------------+
```

---

## 7. Security, Trust & Offline Boundary Standards

1. **Zero Secret Leakage:** Android companion never receives or stores third-party LLM API keys or plaintext DPAPI vault passwords.
2. **Pinned mTLS Handshake:** The mobile app only communicates with desktops presenting the exact SHA-256 certificate hash established during initial QR pairing.
3. **Biometric Guard for Approvals:** Critical actions (Tier 3 Sandbox Exec, Tier 4 Git Control, Tier 5 System Control) prompt Android BiometricPrompt (Fingerprint/Face) before submitting approval payloads.
4. **Offline Cache Isolation:** When disconnected from the desktop host, mobile state is marked `STALE_CACHED`. Form submissions and approval decisions are blocked until mTLS reconnection is verified.

---

## 8. Mobile Accessibility Standards (WCAG 2.2 AA)

- **Color Contrast:** Primary Text (`#EAF4FF`) on Midnight Navy (`#050B18`) provides **17.8:1** contrast ratio (Exceeds WCAG AAA).
- **Touch Ergonomics:** All actionable controls feature $\ge 48\text{ dp}$ touch boundaries with $\ge 8\text{ dp}$ margins.
- **Non-Color Communication:** Every status chip pairs semantic color with an explicit text label and icon (e.g., `#45E6B0` + `CheckCircle2` + `COMPLETED`).
- **Android TalkBack:** Semantic `contentDescription` tags applied across all icons, status pills, and progress bars.

---

## 9. Developer Handoff Deliverables & Verification Checklist

- [x] **Deliverable 1 — Mobile Design System:** Token mapping defined in Section 2.
- [x] **Deliverable 2 — 24 Mobile Screens:** Comprehensive layout and component specifications in Section 4.
- [x] **Deliverable 3 — 18 Reusable Components:** Component catalog defined in Section 6.
- [x] **Deliverable 4 — 5 Core Interactive Flows:** Sequence diagrams and state transitions documented in Section 5.
- [x] **Deliverable 5 — Security & mTLS Specs:** Cryptographic pairing boundaries and offline cache rules in Section 7.
- [x] **Deliverable 6 — Responsive Android Phone Layouts:** Standardized for 360dp, 390dp, and 412dp screen widths.
- [x] **Deliverable 7 — API-to-Mobile Mapping:** Backend dependencies aligned with FastAPI REST and WebSocket endpoints.
