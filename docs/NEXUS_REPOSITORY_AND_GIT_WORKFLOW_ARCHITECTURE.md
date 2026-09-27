# NEXUS — Repository, Code Change & Git Workflow Architecture

**Document Version:** 1.0.0  
**Status:** Approved Production Architecture Baseline  
**Classification:** Core System Reliability, Version Control Governance & Workspace Security  
**Target Systems:** NEXUS Desktop (Windows x64 Native / Tauri + FastAPI Engine) & NEXUS Mobile Companion (Android Node)  
**Primary Sources of Truth:**
- `docs/PRD.md` (v1.0.0)
- `docs/NEXUS_TECH_STACK.md` (v1.0.0)
- `docs/NEXUS_BACKEND_ARCHITECTURE.md` (v1.0.0)
- `docs/NEXUS_SECURITY_ARCHITECTURE.md` (v1.0.0)
- `docs/NEXUS_TASK_LIFECYCLE_AND_ORCHESTRATION_ARCHITECTURE.md` (v1.0.0)
- `docs/NEXUS_API_GATEWAY_AND_INTEGRATION_ARCHITECTURE.md` (v1.0.0)
- `docs/NEXUS_OBSERVABILITY_ARCHITECTURE.md` (v1.0.0)
- `docs/NEXUS_PERFORMANCE_AND_RESOURCE_ARCHITECTURE.md` (v1.0.0)
- `docs/NEXUS_BACKUP_AND_DISASTER_RECOVERY_ARCHITECTURE.md` (v1.0.0)

---

## 1. Executive Summary

NEXUS is an autonomous, **local-first AI Software Engineering Command Center**. It coordinates software-engineering workflows through specialized agents (Planner, Developer, Tester, Debugger, Security, Reviewer), controlled development tools, local sandbox execution, automated test verification, and mandatory human approval gates.

Unlike cloud-based AI code assistants that perform unverified in-place file overwrites or cloud remote pushes, NEXUS implements **Deterministic Version Control Governance**. Every repository managed by NEXUS is treated as an authoritative local Git workspace where file mutations are sandboxed, diffs are cryptographically tracked and attributed, and changes are validated through automated test runs on isolated Git worktrees/branches before being presented for human review.

```
+---------------------------------------------------------------------------------------------------+
|                              NEXUS REPOSITORY EXECUTION TOPOLOGY                                  |
+---------------------------------------------------------------------------------------------------+
|  [ User Workstation Repository ] (e.g., C:\Projects\NexusCore)                                    |
|         │                                                                                         |
|         ├── [ Main Working Tree ] ─── Active User Branch (Untouched by NEXUS)                     |
|         │                                                                                         |
|         └── [ NEXUS Isolated Worktree / Branch ] ─── .nexus/worktrees/tsk_123/                    |
|                    │                                                                              |
|                    ├── Agent Code Modifications (Unified Diff Engine)                             |
|                    ├── Sandboxed Automated Test Execution (JUnit / PyTest)                        |
|                    ├── Security & Pre-Commit Secret Scanning (Semgrep / Gitleaks)                 |
|                    └── Atomic Checkpoint Commits (nexus/tsk_123-fix-auth)                         |
+---------------------------------------------------------------------------------------------------+
```

### 1.1 Objectives of the Repository & Git Architecture
1. **Preservation of User Workspace Integrity**: The developer's active working tree and uncommitted changes are sacred. NEXUS will never silently overwrite, stash, or destroy uncommitted developer modifications.
2. **Deterministic Task Isolation**: Multi-agent tasks execute in dedicated Git task branches and ephemeral Git worktrees, allowing parallel task execution without file locking or merge thrashing.
3. **Atomic & Reversible Code Changes**: Every code modification is tracked as a structured, reversible patch with unified diff generation, pre-commit validation, and 1-click rollback capability.
4. **Mandatory Human-in-the-Loop Git Governance**: Destructive operations (`git push --force`, `git reset --hard`, branch deletion) and remote pull request creation require explicit, authenticated developer approval.

---

## 2. Scope and Non-Goals

### 2.1 Scope Taxonomy

| Dimension | MVP (Phase 1) | V1 (Phase 2) | Future (Phase 3) |
| :--- | :--- | :--- | :--- |
| **Workspace Topology** | Local Git Repository (Single Branch) | Isolated Git Worktrees per Task | Multi-Repo Workspaces (Polyrepos) |
| **Code Modification** | Scoped Patch Engine + Atomic Write | AST-Aware Structural Code Refactor | Real-Time Collaborative Conflict Merge |
| **VCS Integration** | Native Git CLI Subprocess | GitHub / GitLab REST & GraphQL | Forgejo, Gitea & Custom SSH Remotes |
| **Delivery Engine** | Local Git Branch & Staged Commits | Automated PR / MR Creation & Sync | Multi-Stage CI/CD Pipeline Triggers |
| **Secret Scanning** | Regex-Based Pre-Commit Scan | AST & Entropy-Based Gitleaks Scan | Hardware Security Key (YubiKey) Signing |

### 2.2 Desktop vs. Android Responsibilities
- **Windows Desktop Command Center**: Primary repository execution environment. Executes Git CLI commands, manages worktrees, inspects working tree status, enforces file access bounds, and creates commits.
- **Android Companion Node**: Remote repository viewer and approval node. Displays live repository status, file change trees, colorized unified diffs, test summaries, and submits signed commit/PR approval tokens. Mobile never executes local Git commands directly.

### 2.3 Explicit Non-Goals
1. **No Proprietary VCS Replacement**: NEXUS is not a proprietary version control system. It integrates natively with standard Git repositories (`.git/`).
2. **No Silent Remote Pushes**: NEXUS will never push code to GitHub, GitLab, or remote origins without an explicit Tier 4 approval from the developer.
3. **No Implicit File Deletion**: Detaching a repository from the NEXUS UI removes project metadata from SQLite; it **never** deletes user source files from disk.

---

## 3. Confirmed Architectural Decisions

1. **Git CLI as Primary Engine**: Local Git interactions execute via the official system `git.exe` subprocess wrapped in Windows Job Objects with structured stdout/stderr parsers.
2. **Worktree Task Isolation**: Multi-agent coding tasks utilize isolated Git worktrees (`.nexus/worktrees/{task_id}/`) to prevent file contention with the developer's active IDE.
3. **Branch Naming Standard**: Task branches strictly follow the pattern: `nexus/{task_id}-{sanitized_goal_slug}`.
4. **Pre-Commit Security Gate**: Every commit must pass pre-commit secret detection and automated test execution before being presented for human review.

---

## 4. Repository Registration and Lifecycle

The repository registration workflow ensures that NEXUS only mounts valid, healthy Git repositories located within allowed filesystem boundaries.

```mermaid
flowchart TD
    SelectPath[Developer Selects Folder in UI] --> PathValidate{Path Exists & Is Directory?}
    PathValidate -- No --> ErrorPath[Return ValidationError: Path Not Found]
    PathValidate -- Yes --> GitDetect{Contains Valid .git/ Folder?}
    
    GitDetect -- No --> InitPrompt{Prompt User: Init Git Repo?}
    InitPrompt -- No --> Abort[Abort Registration]
    InitPrompt -- Yes --> GitInit[Execute: git init -b main]
    
    GitDetect -- Yes --> InspectMeta[Inspect HEAD, Remote, & Submodules]
    GitInit --> InspectMeta
    
    InspectMeta --> DuplCheck{Path Already Registered in DB?}
    DuplCheck -- Yes --> ErrorDupl[Return ConflictError: Already Registered]
    DuplCheck -- No --> CheckHealth{Repository Healthy?}
    
    CheckHealth -- Corrupt --> ErrorCorrupt[Return RepoHealthError: Corrupt Index]
    CheckHealth -- Clean --> PersistProject[Persist Project in SQLite & Init .nexus/]
    
    PersistProject --> Success[Registration Complete: Emit RepoRegisteredEvent]
```

### 4.1 Repository Lifecycle Actions

| Action | Execution Logic | Filesystem Impact | Database Impact |
| :--- | :--- | :--- | :--- |
| **`Register`** | Validates `.git/`, inspects branch/remotes, scans file tree. | Creates `.nexus/` metadata folder. | Creates `projects` row with unique `prj_<id>`. |
| **`Inspect`** | Runs `git status --porcelain=v2`, `git rev-parse`, `git remote -v`. | None (Read-only). | Updates `projects.last_inspected_at`. |
| **`Rename`** | Updates display label in UI. | None (Workspace directory unchanged). | Updates `projects.name`. |
| **`Archive`** | Marks repository inactive; disables background indexing. | None (Leaves files intact). | Sets `projects.status = "archived"`. |
| **`Detach`** | Unlinks project from NEXUS Command Center. | Deletes `.nexus/` cache (Prompts user). | Cascades deletion of project metadata in SQLite. |
| **`Delete (Disk)`**| Explicit user action requiring master password confirmation.| Deletes workspace directory from disk. | Deletes all project records and task histories. |

---

## 5. Repository State Inspection Engine

NEXUS continuously monitors repository health and working tree state across four distinct operational phases:
1. **Pre-Task Intake**: Assesses whether working tree is clean or has uncommitted developer changes.
2. **Pre-Code Modification**: Verifies that targeted files have not been externally modified since context collection.
3. **Pre-Commit Verification**: Confirms that only task-attributed diffs are staged for commit.
4. **Pre-Delivery / PR**: Confirms local branch is up to date with remote tracking branch.

```mermaid
classDiagram
    class RepoStateSnapshot {
        +string project_id
        +string current_branch
        +string head_commit_sha
        +bool is_clean
        +bool is_detached
        +bool is_merging
        +bool is_rebasing
        +int staged_count
        +int unstaged_count
        +int untracked_count
        +int ahead_count
        +int behind_count
        +list~FileStatusEntry~ changed_files
        +datetime timestamp
    }

    class FileStatusEntry {
        +string path
        +string status_code
        +int staged_bytes
        +int unstaged_bytes
        +bool is_binary
    }

    RepoStateSnapshot "1" *-- "many" FileStatusEntry
```

### 5.1 Stale-State Detection & External Change Guard
If a developer modifies a file in their IDE (e.g., VS Code) while a NEXUS agent is concurrently analyzing or patching that file:
1. NEXUS compares the file's current SHA-256 hash against the context snapshot hash captured at task start.
2. If a hash mismatch is detected, the patch operation **halts immediately**.
3. NEXUS transitions the task to `AWAITING_PERMISSION` and alerts the developer with a 3-way diff view (Base vs External Edit vs Agent Patch), preventing silent code overwrites.

---

## 6. Code Modification Strategy

To guarantee zero corruption of user codebases, NEXUS rejects blind whole-file rewrites in favor of **Context-Validated Unified Patching**.

```
+---------------------------------------------------------------------------------------------------+
|                                 ATOMIC CODE MODIFICATION PIPELINE                                 |
+---------------------------------------------------------------------------------------------------+
|  [ Agent Patch Proposal ] ──> [ Workspace Path Bounds Check ] ──> [ Pre-Patch File Hash Check ]   |
|                                                                                │                  |
|                                                                                ▼                  |
|  [ Verify File Compilation / Syntax ] <── [ Atomic File Write (.tmp -> rename) ] <────────────────┘
+---------------------------------------------------------------------------------------------------+
```

### 6.1 Modification Rules & Invariants
1. **Atomic Write Replacement**: Files are never written in-place directly. Edits are written to a temporary sibling file (`file.ts.tmp.nexus`) and committed via an atomic filesystem rename (`os.replace` / Win32 `MoveFileExW(MOVEFILE_REPLACE_EXISTING)`).
2. **Line-Ending Normalization**: NEXUS auto-detects and preserves existing repository line endings (`CRLF` vs `LF`) and character encodings (`UTF-8`, `UTF-8 with BOM`, `UTF-16`).
3. **Large File & Binary Protections**:
   - Files $> 2.0\text{ MB}$ require explicit user authorization before patching.
   - Binary files (images, compiled `.dll`/`.exe`, `.wasm`) are rejected from textual patch operations.
4. **Ignored Directory Sandbox**: Agent file operations are strictly prohibited inside `.git/`, `.nexus/`, `node_modules/`, `target/`, and directories matching `.gitignore`.

---

## 7. Change Tracking and Diff Management

NEXUS computes and tracks unified diffs (RFC 3986 / Git unified format) for every single mutation performed by an agent.

```diff
--- a/src/auth/jwt_service.py
+++ b/src/auth/jwt_service.py
@@ -42,6 +42,12 @@
     def verify_token(self, token: str) -> dict:
         try:
             payload = jwt.decode(token, self.secret_key, algorithms=["HS256"])
+            # Check token expiration explicitly
+            if payload.get("exp") < datetime.utcnow().timestamp():
+                raise TokenExpiredError("JWT token has expired")
             return payload
         except jwt.PyJWTError as e:
             raise AuthenticationError(f"Invalid token: {e}")
```

### 7.1 Attribution and Diff Storage
- **Task Attribution**: Every diff chunk is tagged with `task_id`, `step_id`, and `agent_role` (e.g., `DEVELOPER`).
- **Diff Persistence**: Diffs are stored in the SQLite database (`task_steps.output_payload`) and mirrored to `.nexus/diffs/{task_id}.patch` for offline review.
- **Diff Size Caps**: Single diffs exceeding **1.0 MB** are truncated in the UI preview with a downloadable raw patch link to prevent webview memory exhaustion.

---

## 8. Branch, Worktree, and Isolation Strategy

NEXUS evaluated five workspace execution topologies to achieve optimal performance, safety, and developer experience:

| Isolation Strategy | Developer IDE Contention | Disk Usage Overhead | Parallel Task Safety | Context Switch Cost | Recommended Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Direct Working Tree** | **Extreme** (Overwrites active editor) | **0 MB** (Zero overhead) | **Unsafe** (Collision) | Low | **Rejected** (Unsafe) |
| **2. Task-Specific Branch** | **High** (Switches active user branch) | **0 MB** | **Medium** (Serialized) | High | **Approved for MVP** |
| **3. Git Worktrees** | **Zero** (Completely isolated directory)| **Low** (Shares `.git/` objects)| **High** (True Parallelism)| **Zero** | **Approved Default (V1)** |
| **4. Temporary Local Clone** | **Zero** | **High** (Duplicates full repo) | **High** | High (Disk clone delay)| **Rejected** (Wasteful) |
| **5. Container Sandbox Copy**| **Zero** | **High** (Container filesystem) | **High** | Very High | **Reserved for DevContainers** |

```mermaid
flowchart TD
    subgraph RepoRoot["Main Repository Root: C:/Projects/NexusCore"]
        GitDir[Shared .git/ Directory]
        MainWorkTree[Main Worktree: Checked out on 'feat/user-ui']
    end

    subgraph NexusWorktrees["Isolated Worktrees: C:/Projects/NexusCore/.nexus/worktrees/"]
        Worktree1[Worktree 1: .nexus/worktrees/tsk_101/\nBranch: nexus/tsk_101-jwt-fix]
        Worktree2[Worktree 2: .nexus/worktrees/tsk_102/\nBranch: nexus/tsk_102-db-indexes]
    end

    GitDir -. "Shared Object Store" .-> MainWorkTree
    GitDir -. "Shared Object Store" .-> Worktree1
    GitDir -. "Shared Object Store" .-> Worktree2
```

### 8.1 Worktree Lifecycle Governance (V1 Default)
1. **Creation**: When a coding task is admitted, NEXUS creates an isolated worktree:
   `git worktree add -b nexus/{task_id}-{slug} .nexus/worktrees/{task_id} HEAD`
2. **Execution**: The Developer and Tester agents execute exclusively within `.nexus/worktrees/{task_id}/`. The developer's primary workspace in VS Code/Cursor remains completely undisturbed.
3. **Teardown**: Upon task completion or cancellation, NEXUS cleans up the worktree:
   `git worktree remove --force .nexus/worktrees/{task_id}` (leaving the branch `nexus/{task_id}-{slug}` intact).

---

## 9. Concurrent Tasks and Conflict Prevention

When multiple agents or tasks operate concurrently on the same codebase, NEXUS prevents collision through a **Hierarchical Lock and File Scope Matrix**.

```mermaid
flowchart TD
    Task1[Task A: Modifying src/auth/jwt.py] --> MutexCheck{Is src/auth/jwt.py Locked by Task B?}
    Task2[Task B: Modifying src/db/models.py] --> MutexCheck
    
    MutexCheck -- "No (Disjoint Files)" --> RunParallel[Execute Tasks Concurrently in Separate Worktrees]
    MutexCheck -- "Yes (Same File Edits)" --> LockAction{Conflict Policy?}
    
    LockAction -- "Serialize" --> QueueTask[Queue Task B until Task A Commits]
    LockAction -- "Interactive Merge" --> UserIntervention[Pause Task B & Request User Intervention]
```

### 9.1 Conflict Rules
1. **Per-File Mutex**: If two tasks target overlapping source files, the second task is queued until the first task completes verification and releases the lock.
2. **Git Branch Independence**: Each task operates on its own dedicated task branch. Git branch conflicts are isolated until the developer chooses to merge them.

---

## 10. Git Operations and Permission Matrix

All Git commands executed by NEXUS are classified into the 5-Tier Permission Framework.

| Git Command | Risk Classification | Permission Tier | Execution Scope | Approval Required? | Pre-Execution Invariants |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `git status`, `git diff`, `git log` | **SAFE** | **Tier 1** | Local Workspace | **No** (Auto) | Valid Git repository. |
| `git add`, `git branch (create)` | **LOW** | **Tier 2** | Local Workspace | **No** (Auto) | Valid workspace boundary. |
| `git checkout (task branch)`, `git commit`| **MEDIUM** | **Tier 3** | Task Worktree | **Policy Dependent** | Pre-commit tests pass. |
| `git merge`, `git rebase` | **MEDIUM** | **Tier 3** | Task Branch | **Policy Dependent** | Clean working tree. |
| `git push (standard branch)` | **HIGH** | **Tier 4** | Remote Origin | **YES (Mandatory)** | Valid remote + user sign-off. |
| `git push --force`, `git reset --hard`| **CRITICAL** | **Tier 4** | Local / Remote | **YES (Explicit Biometric)**| Explicit user confirmation. |
| `git branch -D (main/master)` | **PROHIBITED** | **Tier 5** | Protected Branches | **DENIED UNCONDITIONALLY** | Prohibited operation. |

---

## 11. Commit Workflow Architecture

NEXUS enforces a structured 10-step commit creation pipeline guaranteeing that every commit represents a functional, verified unit of work.

```mermaid
sequenceDiagram
    autonumber
    participant Dev as Developer Agent
    participant Reviewer as Reviewer Agent
    participant Git as Git Engine
    participant Sec as Pre-Commit Security Guard
    participant User as Developer (Human)

    Dev->>Git: Stage Task Changes (git add <modified_files>)
    Git->>Sec: Scan Staged Diffs for Leaked Secrets & Keys
    Sec-->>Git: Secret Scan Clean (Zero Leaks)
    
    Dev->>Reviewer: Generate Conventional Commit Message
    Reviewer-->>Dev: CommitMsg: "feat(auth): add JWT refresh token rotation logic"
    
    Dev->>User: Present Proposed Commit & Diffs for Approval
    User->>Dev: Submit Approval Decision (APPROVED)
    
    Dev->>Git: Execute Commit (git commit -m "...")
    Git-->>Dev: Commit Created (SHA: 01a4f89)
    Dev->>Git: Verify Commit Integrity & Record Task Reference
```

### 11.1 Commit Message Convention
NEXUS generates commit messages adhering to the **Conventional Commits 1.0.0** specification:
```
<type>(<scope>): <short_summary>

[NEXUS-TASK]: <task_id>
[NEXUS-AGENT]: <agent_role>
[TESTS-PASSED]: <test_suite_summary>

<detailed_body_explanation>
```

---

## 12. Remote Git Hosting Provider Integration

NEXUS integrates with remote Git providers (GitHub, GitLab, Forgejo) to fetch upstream state and submit pull requests.

```
+---------------------------------------------------------------------------------------------------+
|                                 REMOTE PROVIDER INTEGRATION STACK                                 |
+---------------------------------------------------------------------------------------------------+
|  [ Remote Provider Adapter ] (GitHub GraphQL / REST / GitLab API)                                 |
|         │                                                                                         |
|         ├── Authenticated via Windows DPAPI Encrypted OAuth Tokens / Personal Access Tokens       |
|         ├── Automatic Rate Limit Tracking (x-ratelimit-remaining) & Exponential Backoff           |
|         └── Branch Protection Inspection (Checks required reviews & status checks)                |
+---------------------------------------------------------------------------------------------------+
```

---

## 13. Pull Request Delivery Workflow

```mermaid
flowchart TD
    TaskComplete[Task Verified & Approved Locally] --> PushConfirm{User Approved Remote Push?}
    PushConfirm -- No --> LocalOnly[Retain Local Branch: nexus/tsk_123]
    PushConfirm -- Yes --> GitPush[Execute: git push origin nexus/tsk_123]
    
    GitPush --> GenPR[Reviewer Generates PR Title & Description]
    GenPR --> ShowPRModal[Present PR Submission Modal to User]
    
    ShowPRModal --> UserPRConfirm{User Confirms PR Creation?}
    UserPRConfirm -- No --> PushOnly[Branch Pushed; PR Creation Skipped]
    UserPRConfirm -- Yes --> APISubmit[Submit PR to GitHub/GitLab API]
    
    APISubmit --> PRCreated[Store PR URL & Emit PullRequestCreatedEvent]
```

---

## 14. Rollback and Recovery Playbooks

| Scenario | Detection Trigger | Recovery Procedure | Data Impact |
| :--- | :--- | :--- | :--- |
| **Failed Patch Application** | Git patch rejects with `.rej` files. | 1. Abort patch command.<br>2. Delete `.rej` files.<br>3. Restore target file from HEAD. | Zero corruption; file remains at pre-patch state. |
| **Failed Automated Test Suite** | Tester agent reports failing tests. | 1. Revert task branch working tree to previous step commit.<br>2. Re-trigger Debugger agent. | Task branch resets to last known passing checkpoint. |
| **Task Cancellation Mid-Run** | User clicks Cancel button in UI. | 1. Terminate running tool processes.<br>2. Create checkpoint commit `[NEXUS_CHECKPOINT]`.<br>3. Remove task worktree. | Task branch preserved for manual inspection; worktree removed. |
| **Worktree Metadata Corruption**| Git worktree locked or invalid pointer.| 1. Execute `git worktree prune`.<br>2. Recreate worktree from task branch ref. | Restores clean isolated worktree without data loss. |
| **Accidental Bad Commit** | Developer rejects final review diffs. | 1. Revert task branch commit via `git reset --soft HEAD~1`.<br>2. Prompt developer for guidance. | Uncommitted diffs staged for developer modification. |

---

## 15. Security, Repository Trust & Sandbox Boundaries

```mermaid
flowchart TD
    subgraph Boundary["Workspace Security Fence"]
        PathCheck["Path Traversal Filter (Deny '..', '\\', Symlink Escape)"]
        SecretScan["Pre-Commit Secret Scanner (Regex + Entropy Check)"]
        HookBypass["Git Hook Sandbox (--no-verify during automated test cycles)"]
    end

    subgraph Trust["Repository Trust Classification"]
        Trusted["TRUSTED: Full Sandboxed Tool Execution Permitted"]
        Restricted["RESTRICTED: Read-Only Analysis; Tool Execution Blocked"]
    end

    Boundary --> Trust
```

1. **Symlink Escape Protection**: NEXUS resolves all file paths to real canonical paths (`Path.resolve()`). If a symlink resolves to a target outside the repository root, access is blocked immediately with a `SecurityBoundaryViolationError`.
2. **Pre-Commit Secret Scanner**: Scans all staged diffs for private keys, AWS tokens, GitHub tokens, and database passwords before executing `git commit`.

---

## 16. Task Lifecycle Integration Matrix

| Task Lifecycle State | Git & Workspace Action | Persisted Git Metadata |
| :--- | :--- | :--- |
| **`ANALYZING`** | Inspects repository HEAD, status, and AST. | `head_commit_sha`, `current_branch` |
| **`READY_TO_EXECUTE`** | Provisions task branch and worktree. | `branch_name`, `worktree_path` |
| **`EXECUTING`** | Applies patches and atomic temporary file writes. | `modified_files_list`, `diff_stats` |
| **`TESTING`** | Executes test suites inside task worktree. | `test_run_commit_sha` |
| **`REVIEWING`** | Generates full unified diff against base branch. | `review_diff_stat`, `security_score` |
| **`AWAITING_FINAL_APPROVAL`**| Stages changes and prepares conventional commit. | `proposed_commit_msg`, `final_diff` |
| **`COMPLETED`** | Finalizes commit; cleans up task worktree. | `final_commit_sha`, `pr_url` (optional) |
| **`PAUSED` / `CANCELLED`**| Creates checkpoint commit; releases locks. | `checkpoint_commit_sha` |

---

## 17. Data and Persistence Alignment

The repository architecture maps directly to the authoritative SQLite schema:

```mermaid
erDiagram
    PROJECT ||--o{ TASK : contains
    PROJECT ||--o{ REPO_BRANCH : tracks
    TASK ||--o{ TASK_CHANGE_SET : produces
    TASK_CHANGE_SET ||--o{ FILE_CHANGE : includes

    PROJECT {
        string id PK "prj_01HZX..."
        string name
        string root_path
        string default_branch
        string remote_url
        datetime last_inspected_at
    }

    TASK_CHANGE_SET {
        string id PK "cs_01HZX..."
        string task_id FK
        string branch_name
        string base_commit_sha
        string head_commit_sha
        int files_changed
        int insertions
        int deletions
    }

    FILE_CHANGE {
        string id PK "fc_01HZX..."
        string change_set_id FK
        string file_path
        string change_type "MODIFIED | ADDED | DELETED"
        text unified_diff
    }
```

---

## 18. Observability and Audit Integration

Aligned with [`docs/NEXUS_OBSERVABILITY_ARCHITECTURE.md`](file:///c:/Users/user/OneDrive/Documents/NEXUS/docs/NEXUS_OBSERVABILITY_ARCHITECTURE.md), all repository operations generate structured telemetry records:

```json
{
  "timestamp": "2026-09-27T22:25:00.123Z",
  "event_type": "GIT_COMMIT_CREATED",
  "project_id": "prj_01HZX12ABC456",
  "task_id": "tsk_01HZX89QWE789",
  "branch_name": "nexus/tsk_01HZX89QWE789-jwt-fix",
  "commit_sha": "01a4f89c3b2e5d7a8f1b2c3d4e5f6a7b8c9d0e1f",
  "author": "NEXUS Agent (Developer) <agent@nexus.local>",
  "files_changed_count": 2,
  "insertions": 18,
  "deletions": 3,
  "pre_commit_checks": {
    "secret_scan": "PASSED",
    "tests": "PASSED_18_TESTS"
  }
}
```

---

## 19. Desktop and Mobile Capabilities

```
+---------------------------------------------------------------------------------------------------+
|                                 CROSS-PLATFORM CAPABILITY MATRIX                                  |
+---------------------------------------------------------------------------------------------------+
| Capability                              | Windows Desktop Command Center | Android Companion Node |
|-----------------------------------------|--------------------------------|------------------------|
| Repository Registration & Detach        | Full File Picker & Manage      | View Metadata Only     |
| Working Tree Live Status                | Full Porcelain Status          | Summary Badge (Clean)  |
| File Tree & Colorized Diffs             | Full Interactive Monaco Diff   | Read-Only Mobile Diff  |
| Worktree Creation & Isolation           | Authoritative Host Executor    | View Active Worktree   |
| Commit & Pull Request Approvals         | Full Interactive Sign-off      | Biometric Push Approval|
| Remote Push & PR Submission             | Executes Outbound HTTPS Push   | View Created PR Link   |
+---------------------------------------------------------------------------------------------------+
```

---

## 20. Architecture Diagrams

### 20.1 End-to-End Code Modification & Commit Approval Workflow

```mermaid
sequenceDiagram
    autonumber
    participant Agent as Developer Agent
    participant Worktree as Task Worktree (.nexus/worktrees/tsk_123/)
    participant Test as Test Runner Sandbox
    participant Sec as Secret Scanner Guard
    participant User as Developer (Desktop / Mobile)
    participant Git as Local Git Engine

    Agent->>Worktree: Apply Unified Diff Patch to jwt_service.py
    Worktree->>Test: Run PyTest Suite Inside Worktree
    Test-->>Worktree: 18 Tests Passed (100% Green)
    
    Worktree->>Sec: Scan Staged Diffs for Leaked Credentials
    Sec-->>Worktree: Zero Secrets Detected
    
    Worktree->>User: Push Approval Request (Diffs + Test Evidence)
    User->>Worktree: Tap Approve (Biometric / UI Token)
    
    Worktree->>Git: Commit to branch nexus/tsk_123-jwt-fix
    Git-->>Agent: Commit SHA Created (01a4f89)
    Agent->>Worktree: Remove Ephemeral Worktree Directory
```

---

## 21. Testing and Acceptance Strategy

### 21.1 Test Suite Matrix
1. **Repository Registration Tests**: Test valid `.git/` folder registration, missing directory rejection, and duplicate registration conflict errors.
2. **Symlink Boundary Tests**: Attempt file read/write targeting symlinks pointing outside workspace root; verify immediate `SecurityBoundaryViolationError`.
3. **Stale-State Detection Tests**: Modify file externally during active agent step; verify patch engine detects hash mismatch and halts execution.
4. **Worktree Isolation Tests**: Run two concurrent tasks targeting different branches; verify both execute in parallel without lock contention.
5. **Pre-Commit Secret Scanner Tests**: Stage fake AWS secret key (`AKIAIOSFODNN7EXAMPLE`); verify commit engine rejects commit with security alert.

---

## 22. Implementation Roadmap

```mermaid
gantt
    title NEXUS Repository & Git Architecture Implementation Roadmap
    dateFormat  YYYY-MM-DD
    section Phase 1: Repo Awareness
    Repository Registration & Health Inspector   :2026-10-01, 8d
    Git Status & Working Tree Inspection Engine :2026-10-09, 7d

    section Phase 2: Controlled Code Changes
    Context-Validated Patch Engine & Atomic Writes:2026-10-16, 10d
    Unified Diff Generator & Attribution Tracker:2026-10-26, 8d

    section Phase 3: Task Isolation & Worktrees
    Git Worktree Provisioning & Cleanup Engine  :2026-11-03, 12d
    Concurrent File Lock & Conflict Detector    :2026-11-15, 10d

    section Phase 4: Commit & Verification
    Pre-Commit Secret Scanner (Gitleaks/Regex)  :2026-11-25, 8d
    Conventional Commit Builder & Approval Gate :2026-12-03, 8d

    section Phase 5: Remote Delivery
    GitHub & GitLab REST/GraphQL PR Submitter   :2026-12-11, 14d
    Desktop/Mobile Diffs & PR Sync Engine       :2026-12-25, 10d
```

---

## 23. Risk Register and Open Decisions

### 23.1 Risk Register

| ID | Risk Description | Likelihood | Impact | Mitigation Strategy | Owner | Verification Method |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `R-GIT-01` | **Git Worktree Locking on Windows**: File locks held by language servers (LSP) prevent `git worktree remove`. | High | Medium | Implement retry with backoff and process handle inspection before worktree pruning. | Workspace Lead | Windows worktree cleanup drill. |
| `R-GIT-02` | **Merge Conflicts during Task Sync**: User commits to `main` while long-running agent task executes. | High | Medium | Auto-rebase task branch against current `main` HEAD before pre-commit testing. | Backend Lead | Simulated branch divergence test. |
| `R-GIT-03` | **Accidental Secret Commit**: Developer key committed inside unit test mock data. | Medium | Critical | Pre-commit regex scanner intercepts commit; alerts developer to confirm mock data. | Security Lead | Automated credential test suite. |

### 23.2 Register of Open Decisions

| ID | Topic | Current Architectural Recommendation | Next Required Action |
| :--- | :--- | :--- | :--- |
| `OD-GIT-01` | **Worktree Location Policy** | Place worktrees inside `.nexus/worktrees/` within project root (auto-added to `.gitignore`). | Verify compatibility with monorepos and IDE file watchers. |
| `OD-GIT-02` | **GPG / SSH Commit Signing** | Support commit signing if developer's local `git config` has `commit.gpgsign=true`. | Test GPG agent prompt forwarding inside background engine. |
| `OD-GIT-03` | **Default Branch Deletion Post-Merge**| Retain task branch locally after PR creation; offer 1-click prune in UI. | Product team sign-off on branch retention UX. |

---

## 24. Definition of Done

The NEXUS Repository, Code Change & Git Workflow Architecture is complete and approved when:
- [x] Repository registration, inspection, and lifecycle workflows are fully specified.
- [x] Working tree state inspection and stale-state detection mechanisms are detailed.
- [x] Atomic patch-based code modification and line-ending preservation rules are defined.
- [x] Unified diff generation, attribution, and size caps are documented.
- [x] Git worktree task isolation strategy and lifecycle governance are designed.
- [x] Concurrent task lock matrices and conflict resolution playbooks are detailed.
- [x] 5-Tier Git operation permission matrix is established.
- [x] 10-step commit creation pipeline and Conventional Commit conventions are specified.
- [x] Remote Git provider integration and Pull Request workflows are documented.
- [x] 5 comprehensive rollback and recovery playbooks are detailed.
- [x] Path traversal filters and pre-commit secret scanners are defined.
- [x] Alignment with SQLite schema and task lifecycle state machine is verified.
- [x] 7 detailed Mermaid architecture and workflow diagrams are included.
- [x] Phased implementation roadmap (Phases 1–5) with risk register and open decisions is complete.

---

## 25. Summary & Implementation Synthesis

### 25.1 Architecture Summary
The **NEXUS Repository, Code Change & Git Workflow Architecture** guarantees that AI-driven software engineering operates safely on real developer repositories. By pairing **Context-Validated Unified Patching**, **Git Worktree Task Isolation**, **Pre-Commit Secret & Test Verification**, and **Mandatory Human-in-the-Loop Git Approvals**, NEXUS eliminates accidental code loss, prevents file locking thrashing, and ensures clean, auditable Git history.

### 25.2 Core Repository Rules
1. **Zero Working Tree Contention**: Agent tasks execute in dedicated `.nexus/worktrees/` directories.
2. **Context-Validated Patching**: File edits halt immediately if external modifications are detected.
3. **Pre-Commit Defense**: Commits require passing test suites and clean secret scans before human review.
4. **Explicit Remote Push**: Code is never pushed to remote origins without cryptographic human sign-off.

### 25.3 Recommended Implementation Sequence
1. Implement repository registration and porcelain status inspector in `services/backend/src/nexus/services/project_service.py`.
2. Implement context-validated unified patch engine and atomic file replacer.
3. Implement Git worktree manager (`git worktree add/remove`) in `WorkspaceService`.
4. Deploy pre-commit secret scanner and Conventional Commit generator.
5. Integrate GitHub / GitLab REST/GraphQL pull request delivery engine.

---

## 26. Next Logical NEXUS Architecture Document

The recommended next document in the NEXUS master architecture series is:  
**`docs/NEXUS_AGENT_ROLES_PROMPTS_AND_COORDINATION_SPEC.md`**  
*(Focus: Formal prompt engineering contracts, system prompts, role personas, few-shot exemplars, structured JSON response schemas, and inter-agent message payloads for Planner, Developer, Tester, Debugger, Security, and Reviewer agents).*
