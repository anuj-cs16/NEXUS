# NEXUS — Master Design System & Component Library

**Document Version:** 1.0.0  
**Status:** Approved Production Design Standard  
**Classification:** Universal UI/UX Design System, Design Tokens & Component Library Specification  
**Target Environments:** Desktop Workstation (1920×1080, 1440×900, 1280×800) & Android Companion (Responsive / Adaptive)  
**Primary Sources of Truth:**
- `docs/PRD.md` (v1.0.0)
- `docs/NEXUS_TECH_STACK.md` (v1.0.0)
- `docs/NEXUS_DESIGN_DOC.md` (v1.0.0)
- `docs/NEXUS_BACKEND_ARCHITECTURE.md` (v1.0.0)
- `docs/NEXUS_SECURITY_ARCHITECTURE.md` (v1.0.0)

---

## 1. Executive Summary & Design Reference

NEXUS is an autonomous, **local-first AI Software Engineering Command Center**. Unlike conventional chatbot interfaces or generic SaaS admin dashboards, NEXUS is designed as a **Futuristic Cyber Operations Workstation**. It provides high-density telemetry, transparent multi-agent execution timelines, hardware resource monitoring, and deterministic tool controls.

```
+---------------------------------------------------------------------------------------------------+
|                            NEXUS CYBER WORKSTATION VISUAL PHILOSOPHY                              |
+---------------------------------------------------------------------------------------------------+
|  Deep Midnight Navy (#050B18)  |  Electric Cyan (#52E5FF)       |  Multi-Agent Violet (#9B7CFF)   |
|  Dense Information Panels     |  Connected Glowing DAG Nodes   |  Monospace Telemetry Metadata   |
|  Illuminated Thin Borders     |  Dynamic Concentric AI Core    |  Subtle Glassmorphic Layering   |
+---------------------------------------------------------------------------------------------------+
```

### 1.1 Core Brand Personality
- **Futuristic & Technical:** Communicates deep computation, real-time telemetry, and advanced machine intelligence.
- **Precision-Oriented:** Emphasizes pixel-perfect alignments, monospace numerical metrics, and exact status badges.
- **Intelligent & Adaptive:** Visual components morph state fluidly in response to AI reasoning (Idle, Thinking, Executing, Awaiting Approval, Success, Error).
- **Zero Decorative Noise:** Every line, glow, node, and gauge corresponds to verifiable, functional data (no decorative fake hex strings or non-functional graphs).

---

## 2. Design System Foundations

### 2.1 Color Tokens

The NEXUS color system utilizes a dark-first midnight navy hierarchy combined with high-contrast electric cyan and violet accents.

```
Surface Layering Scale:
[#050B18 (Background)] -> [#0A1225 (Secondary)] -> [#111C35 (Panel)] -> [#172544 (Elevated)] -> [#1B2D52 (Border)]
```

#### A. Master Color Palette Table

| Token Name | Hex Value | RGB / HSL | CSS Variable | Semantic Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `color-bg-primary` | `#050B18` | `rgb(5, 11, 24)` | `--nexus-bg-primary` | Main application background, canvas canvas, deep workspace |
| `color-bg-secondary` | `#0A1225` | `rgb(10, 18, 37)` | `--nexus-bg-secondary` | Sidebar background, secondary containers, header base |
| `color-bg-panel` | `#111C35` | `rgb(17, 28, 53)` | `--nexus-bg-panel` | Primary card background, tool widgets, telemetry panels |
| `color-bg-elevated` | `#172544` | `rgb(23, 37, 68)` | `--nexus-bg-elevated` | Active item highlight, hover states, modal overlay surface |
| `color-border-default` | `#1B2D52` | `rgb(27, 45, 82)` | `--nexus-border` | Default panel and card borders |
| `color-border-hover` | `rgba(82, 229, 255, 0.4)`| `rgba(82, 229, 255, 0.4)`| `--nexus-border-hover` | Hovered card border with subtle cyan glow |
| `color-cyan-primary` | `#52E5FF` | `rgb(82, 229, 255)` | `--nexus-cyan` | Active tasks, developer agent, primary interactive glow |
| `color-blue-electric` | `#398BFF` | `rgb(57, 139, 255)` | `--nexus-blue` | Data links, secondary CTA buttons, review agent |
| `color-violet-accent` | `#9B7CFF` | `rgb(155, 124, 255)` | `--nexus-violet` | Planner agent, automations, memory palace |
| `color-purple-soft` | `#C4A2FF` | `rgb(196, 162, 255)` | `--nexus-purple-soft`| Memory embeddings, secondary agent tags |
| `color-text-primary` | `#EAF4FF` | `rgb(234, 244, 255)`| `--nexus-text-primary` | Primary headlines, code diffs, prominent labels |
| `color-text-secondary`| `#8FA6C8` | `rgb(143, 166, 200)`| `--nexus-text-secondary` | Descriptions, metadata, secondary panel text |
| `color-text-muted` | `#647A9B` | `rgb(100, 122, 155)`| `--nexus-text-muted` | Timestamp labels, unselected tabs, table headers |
| `color-status-success`| `#45E6B0` | `rgb(69, 230, 176)` | `--nexus-success` | Tests passing, tool execution success, online status |
| `color-status-warning`| `#FFC76A` | `rgb(255, 199, 106)`| `--nexus-warning` | Pending approval, high-risk gate, low resource alert |
| `color-status-error` | `#FF647C` | `rgb(255, 100, 124)`| `--nexus-error` | Pytest failure, tool sandbox exception, critical incident |

#### B. Transparency & Glow Variants
- **Cyan Glow Standard:** `box-shadow: 0 0 15px rgba(82, 229, 255, 0.25);`
- **Cyan Glow Intense:** `box-shadow: 0 0 25px rgba(82, 229, 255, 0.45);`
- **Violet Glow Standard:** `box-shadow: 0 0 15px rgba(155, 124, 255, 0.25);`
- **Warning Amber Glow:** `box-shadow: 0 0 15px rgba(255, 199, 106, 0.20);`
- **Error Red Glow:** `box-shadow: 0 0 15px rgba(255, 100, 124, 0.25);`

---

### 2.2 Typography Scale

The typographic system combines a clean sans-serif for UI labels with high-legibility monospace fonts for AST data, logs, and telemetry.

#### A. Font Families
- **Primary Interface Font (`--font-sans`):** `Inter`, `Geist`, `-apple-system`, `sans-serif`
- **Technical Monospace Font (`--font-mono`):** `JetBrains Mono`, `Fira Code`, `ui-monospace`, `monospace`

#### B. Typographic Hierarchy Table

| Style Role | Font Family | Size | Weight | Line Height | Letter Spacing | Use Cases |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Title** | Sans-Serif | 24px (1.5rem) | 900 (Black) | 1.2 | -0.02em | Onboarding Hero, Success Screens |
| **Screen Title** | Sans-Serif | 18px (1.125rem) | 800 (Extra Bold)| 1.25 | -0.01em | Top Screen Header, Module Detail |
| **Section Header** | Monospace | 12px (0.75rem) | 700 (Bold) | 1.4 | +0.08em (Uppercase)| Panel Headers, Metric Grouping |
| **Card Title** | Sans-Serif | 14px (0.875rem) | 700 (Bold) | 1.3 | 0em | Task Card Header, Module Title |
| **Body Standard** | Sans-Serif | 12px (0.75rem) | 400 (Regular) | 1.5 | 0em | Descriptions, Explanations |
| **Monospace Standard**| Monospace | 11px (0.6875rem)| 500 (Medium) | 1.4 | 0em | File Paths, Shell Logs, JSON Tree |
| **Technical Label** | Monospace | 10px (0.625rem) | 700 (Bold) | 1.2 | +0.05em (Uppercase)| Status Badges, Timestamps, Ports |
| **Micro Metric** | Monospace | 9px (0.5625rem) | 600 (Semi-Bold)| 1.1 | +0.02em | Memory offsets, Hash IDs, Tool PIDs |

---

### 2.3 Spacing & Information Density

To accommodate multi-panel telemetry without feeling cluttered, NEXUS uses a base-4 spatial scale.

```
Scale: 4px (1) -> 8px (2) -> 12px (3) -> 16px (4) -> 20px (5) -> 24px (6) -> 32px (8)
```

| Spacing Token | Value | Applied To |
| :--- | :--- | :--- |
| `space-1` | 4px | Inner badge padding, icon-to-label gaps, ring offsets |
| `space-2` | 8px | Button inline gaps, input padding vertical, grid mini-gaps |
| `space-3` | 12px | Standard card padding, list item gaps, panel padding (compact) |
| `space-4` | 16px | Standard panel padding, modal margins, header padding |
| `space-5` | 20px | Large panel padding, workspace gutters |
| `space-6` | 24px | Screen outer margins, main section dividers |
| `space-8` | 32px | Modal dialog container padding, hero banner spacing |

---

### 2.4 Corner Radius Hierarchy

| Radius Token | Value | Applied Component Types |
| :--- | :--- | :--- |
| `radius-xs` | 4px | Status pills, mini badges, code line indicators, scrollbar thumbs |
| `radius-sm` | 6px | Buttons, inputs, dropdown items, segmented controls |
| `radius-md` | 8px | Action cards, execution timeline nodes, table containers |
| `radius-lg` | 12px | Standard technical panels (`.cyber-panel`), tool widgets |
| `radius-xl` | 16px | Modal dialogs, HUD quick overlay, hero status containers |
| `radius-full` | 9999px | Concentric core rings, status ping dots, avatar nodes |

---

## 3. Core Layout Components

### 3.1 Master Application Shell Layout

The NEXUS desktop application is structured into a resilient 4-zone responsive command frame.

```
+---------------------------------------------------------------------------------------------------+
|  GLOBAL HEADER (56px) - [Logo] [Command Console / Search] [Telemetry Strip] [Clock] [User]        |
+-------------------+-------------------------------------------------------+-----------------------+
|  SIDEBAR (256px)  |  MAIN WORKSPACE CANVAS (Responsive / Scrollable)      |  OPTIONAL OPS PANEL   |
|  - Command & Ops  |                                                       |  (320px)              |
|  - AI Modules     |  - Screen 01: 3-Panel Cyber Operations Center         |  - Live Activity Log  |
|  - Workspace      |  - Screen 06: Task Execution Matrix                   |  - Pending Approvals  |
|  - Security       |  - Screen 08: Automation Canvas                       |  - Tool Sandboxes     |
+-------------------+-------------------------------------------------------+-----------------------+
|  STATUS FOOTER (28px) - [Node: Workstation #01] [LLM: Qwen2.5-Coder] [mTLS: 14ms] [Epoch: 12]     |
+---------------------------------------------------------------------------------------------------+
```

#### A. Component Anatomy: Application Shell
```tsx
<div className="flex h-screen w-screen bg-[#050B18] text-[#EAF4FF] overflow-hidden select-none cyber-grid-bg">
  <AppSidebar currentScreen={activeScreen} onNavigate={navigate} />
  <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
    <GlobalHeader onOpenPalette={openPalette} activeModel="qwen2.5-coder:7b" />
    <main className="flex-1 overflow-y-auto min-w-0 relative">
      {/* Active Screen Rendered Here */}
    </main>
    <StatusFooter workstation="WORKSTATION #01" status="ONLINE" />
  </div>
</div>
```

---

### 3.2 Navigation Components

#### A. Sidebar Navigation Item
- **Default State:** Transparent background, `#8FA6C8` text, `#1B2D52` transparent border.
- **Hover State:** `#111C35` background, `#EAF4FF` text, `#1B2D52` subtle border.
- **Active / Selected State:** `#111C35` background, `#52E5FF` text, `border: 1px solid rgba(82, 229, 255, 0.6)`, `box-shadow: 0 0 10px rgba(82, 229, 255, 0.15)`.

---

## 4. Command Center Components

### 4.1 NEXUS Neural Core Visualization

The conventional circular AI orb is replaced with a **Concentric Neural Execution Visualization** representing active agent states.

```
       . - ~ ~ ~ - .             [Outer Ring: 112px] - Pulse Ring Animation
   . '   . - ~ - .   ' .         [Radar Sweep: 96px] - Rotating Dashed Border
 .  . '   /     \   ' .  .       [Neural Core: 64px] - Glowing Rounded Square
 : :     |  CPU  |     : :       [State Response]:
 .  . '   \     /   ' .  .         - Idle: Slow Cyan Ambient Glow
   . '   ' - ~ - '   ' .           - Thinking: Violet Spin (9B7CFF)
       ' - ~ ~ ~ - '               - Executing: Rapid Cyan Pulse (52E5FF)
                                   - Awaiting Approval: Amber Glow (FFC76A)
                                   - Error: Red Warning Pulse (FF647C)
```

#### Core States Specification Table

| State Name | Outer Ring Animation | Core Icon & Behavior | Primary Glow Color | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Idle** | Slow 4s ambient pulse | `Cpu` static icon | `rgba(82, 229, 255, 0.15)` | System listening on EventBus; no active tasks |
| **Thinking** | Radar dashed sweep | `Sparkles` spinning | `rgba(155, 124, 255, 0.40)`| AST parsing, context indexing, prompt reasoning |
| **Executing** | Dual counter-rotating rings | `Activity` bouncing | `rgba(82, 229, 255, 0.50)` | Active tool invocation, sandbox file patching, pytest |
| **Awaiting Approval**| Flashing amber ring | `AlertTriangle` pulse| `rgba(255, 199, 106, 0.45)`| High-risk tool gated behind human decision |
| **Success** | Radial cyan wave expansion | `CheckCircle2` glow | `rgba(69, 230, 176, 0.50)` | Task step completed and validated |
| **Error** | Rapid red vibration | `ShieldAlert` solid | `rgba(255, 100, 124, 0.50)`| Sandbox failure or permission violation |

---

### 4.2 Connected Execution Timeline Node

The primary visualization on the central command canvas is the 6-stage connected DAG timeline:

```
[01 COMMAND] ────► [02 CONTEXT] ────► [03 AGENT SELECT] ────► [04 TOOL EXEC] ────► [05 VALIDATION] ────► [06 RESULT]
```

#### Node Structure & Tokens
- **Container:** `padding: 10px 12px`, `border-radius: 8px`, `border: 1px solid #1B2D52`.
- **Active Node Highlight:** `background: #172544`, `border-color: #52E5FF`, `box-shadow: 0 0 12px rgba(82, 229, 255, 0.25)`.
- **Directional Arrow / Link:** `#1B2D52` line with glowing animated cyan pulse indicator moving along the active execution path.

---

## 5. AI Agent Components

NEXUS orchestrates 6 specialized AI agents. Each agent possesses a distinct functional color accent and badge identifier.

### 5.1 Multi-Agent Specialization Matrix

| Agent Name | Semantic Role | Badge Color Token | Primary Assigned Tools | Permission Tier |
| :--- | :--- | :--- | :--- | :--- |
| **PlannerAgent** | Architecture & DAG Planning | `#9B7CFF` (Violet) | `read_file`, `list_dir`, `grep_search` | Read-Only (Tier 1) |
| **DeveloperAgent** | Code Generation & Patching | `#52E5FF` (Cyan) | `patch_file`, `write_to_file` | Workspace Write (Tier 2) |
| **TesterAgent** | Automated Test Execution | `#45E6B0` (Emerald) | `execute_command` (sandbox pytest) | Sandbox Exec (Tier 3) |
| **DebuggerAgent** | Root Cause Diagnosis | `#FF647C` (Coral Red) | `read_file`, `grep_search`, `patch_file`| Workspace Write (Tier 2) |
| **SecurityAgent** | Threat & Boundary Audit | `#FFC76A` (Amber) | `audit_check`, `policy_verify` | Audit Read (Tier 1) |
| **ReviewerAgent** | Diff Synthesis & PR Prep | `#398BFF` (Blue) | `git_status`, `git_diff`, `git_commit` | Git Control (Tier 4) |

#### Agent Card Component Anatomy
```tsx
<div className="cyber-panel p-3.5 bg-[#0A1225] border border-[#1B2D52] hover:border-[#52E5FF]/50 space-y-2">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className="h-7 w-7 rounded bg-[#111C35] border border-[#52E5FF]/40 flex items-center justify-center font-mono text-xs text-[#52E5FF] font-bold">
        DEV
      </div>
      <div>
        <div className="text-xs font-mono font-bold text-[#EAF4FF]">DeveloperAgent</div>
        <div className="text-[10px] text-[#647A9B] font-mono">AST Code Synthesizer</div>
      </div>
    </div>
    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-[#52E5FF]/10 text-[#52E5FF] border border-[#52E5FF]/40 animate-pulse">
      ACTIVE (840ms)
    </span>
  </div>
  <div className="text-[11px] text-[#8FA6C8] font-mono leading-tight">
    Executing patch on <code className="text-[#52E5FF]">services/backend/task_service.py</code>
  </div>
</div>
```

---

## 6. Task & Workflow Components

### 6.1 Task Status & Progress Bar

```
Status: [EXECUTING (42%)]
[====================----------------------------] (Gradient: #398BFF to #52E5FF)
```

- **Queued:** Outline border `#1B2D52`, Text `#8FA6C8`, Progress 0%.
- **Running / Active:** Glowing cyan border `#52E5FF`, Animated gradient progress bar.
- **Awaiting Approval:** Amber border `#FFC76A`, Pulsing review button.
- **Completed:** Emerald border `#45E6B0`, Solid green progress bar 100%.
- **Failed:** Red border `#FF647C`, Error message indicator with retry button.

---

## 7. Input and Control Components

### 7.1 Form & Control Tokens

```
+---------------------------------------------------------------------------------------------------+
|  [Default Input: #050B18 bg | #1B2D52 border | #8FA6C8 placeholder]                              |
|  [Focus State:   #050B18 bg | #52E5FF border | box-shadow: 0 0 10px rgba(82,229,255,0.25)]         |
|  [Error State:   #050B18 bg | #FF647C border | box-shadow: 0 0 10px rgba(255,100,124,0.25)]        |
+---------------------------------------------------------------------------------------------------+
```

#### A. Command Input Area
- **Height:** 44px (single line) / 96px (multiline)
- **Background:** `#0A1225` with inner shadow
- **Border:** `1px solid #1B2D52` (Expands to `1px solid #52E5FF` on focus)
- **Typography:** `JetBrains Mono`, 12px, `#EAF4FF`

#### B. Cyber Toggle Switch
- **Track (Off):** 36px width, 20px height, `#111C35` background, `#1B2D52` border.
- **Track (On):** `#050B18` background, `border: 1px solid #52E5FF`, `box-shadow: 0 0 8px rgba(82, 229, 255, 0.3)`.
- **Thumb:** 14px circle, `#52E5FF` when active, `#647A9B` when inactive.

---

## 8. Modals, Drawers & Overlays

All floating dialogs utilize a unified glassmorphic backdrop with dark navy elevation.

```
Backdrop: rgba(5, 11, 24, 0.85) + backdrop-filter: blur(8px)
Modal Container: #0A1225 background, 2px solid #52E5FF border, box-shadow: 0 0 30px rgba(82, 229, 255, 0.20)
```

### 8.1 Modal Types
1. **Command Palette (`Ctrl+K`):** Quick launcher for tools, files, screens, and terminal actions.
2. **Permission Modal (`Screen 23`):** High-risk sandbox execution consent dialog.
3. **AI Confirmation Modal (`Screen 24`):** Step-by-step workflow approval with affected file previews.
4. **Desktop HUD Overlay (`Screen 31`):** Floating transparent widget for active background task monitoring.
5. **Toast Notification (`Screen 32`):** Non-blocking bottom-right telemetry updates with auto-dismiss timer.

---

## 9. Data Visualization & Telemetry Charts

Telemetry charts adhere strictly to minimal, readable cyber aesthetics without heavy visual clutter.

```
+---------------------------------------------------------------------------------------------------+
|  CPU CORE TELEMETRY GAUGE                                                                         |
|  14.2% [██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 16 Cores Nominal                      |
|                                                                                                   |
|  RAM ALLOCATION GAUGE                                                                             |
|  4.2 GB / 32 GB [████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 13% Committed                |
|                                                                                                   |
|  GPU VRAM ALLOCATION GAUGE                                                                        |
|  8.4 GB / 24 GB [██████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] RTX 4090 (Qwen2.5)            |
+---------------------------------------------------------------------------------------------------+
```

- **Bar Gauge Height:** 6px
- **Fill Gradient:** `#398BFF` to `#52E5FF` with subtle neon cap.
- **Track Color:** `#050B18` with `#1B2D52` hairline border.

---

## 10. Micro-Interactions & Motion Specifications

All animations are calibrated to feel immediate, technical, and unobtrusive.

```
Timing Standard:
- Instant UI Feedback: 100ms (ease-out)
- Modal & Drawer Expansion: 200ms (cubic-bezier(0.16, 1, 0.3, 1))
- Concentric Radar Sweep: 6000ms (linear infinite)
- Pulse Glow: 2500ms (ease-in-out infinite)
```

### 10.1 Accessibility & Reduced Motion
If `@media (prefers-reduced-motion: reduce)` is detected:
- Continuous radar rotations and pulsing rings are disabled.
- Statuses remain indicated through solid, high-contrast color badges and static icons.

---

## 11. Responsive Breakpoints & Multi-Screen Tokens

| Breakpoint Name | Target Resolution | Layout Behavior |
| :--- | :--- | :--- |
| **Desktop Ultra (XL)** | $\ge 1920 \times 1080$ | 3-Column Layout: Left (3 Cols) + Center (6 Cols) + Right (3 Cols). Full telemetry expanded. |
| **Desktop Standard (LG)**| $1440 \times 900$ | 3-Column Layout: Compact widgets, collapsible logs drawer, fixed sidebar. |
| **Desktop Compact (MD)** | $1280 \times 800$ | 2-Column Layout: Center timeline expands; right operations panel shifts into tabbed drawer. |
| **Android Node (SM)** | Mobile Companion | 1-Column Responsive Stream: Stacked cards, bottom navigation, remote approval controls. |

---

## 12. Component Library Specification & Deliverables Summary

### Deliverable A — Foundations
- Comprehensive design tokens defined in `src/app/globals.css` covering colors, typography, spacing, radii, borders, and glows.

### Deliverable B — Core Layout & Navigation
- `AppSidebar.tsx`, `GlobalHeader.tsx`, `StatusFooter.tsx`, and `.cyber-panel` container components.

### Deliverable C — NEXUS Command Components
- `Screen01Home.tsx` featuring the 3-panel command workstation, Concentric Neural Core, and 6-stage execution timeline.

### Deliverable D — Interaction States & Feedback
- Complete state coverage: Default, Hover, Focus, Active, Executing, Awaiting Approval, Success, Error, and Disabled.

### Deliverable E — Multi-Screen Layout Templates
- All 34 screens implemented and wired to the Master Page Controller (`src/app/page.tsx`).

### Deliverable F — Component Documentation
- This specification (`docs/NEXUS_DESIGN_SYSTEM.md`) serves as the permanent single source of truth for all NEXUS UI/UX implementation.
