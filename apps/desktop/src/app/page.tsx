'use client';

import { useState, useEffect, useRef } from 'react';

// --- API Models & Interfaces ---
interface Project {
  id: string;
  name: string;
  path: string;
  description: string;
  status: string;
  language?: string | null;
  framework?: string | null;
  task_count: number;
  created_at: string;
}

interface TaskItem {
  id: string;
  project_id: string;
  goal: string;
  status: string;
  model?: string | null;
  summary?: string | null;
  error?: string | null;
  step_count: number;
  created_at: string;
}

interface ModelItem {
  name: string;
  size_bytes: number;
  family: string;
  parameter_size: string;
}

interface ApprovalItem {
  id: string;
  task_id: string;
  agent_type: string;
  tool_name: string;
  risk_level: string;
  description: string;
  status: string;
}

interface ActivityEvent {
  id: string;
  timestamp: string;
  agent?: string;
  type: string;
  text: string;
  tool?: string;
  isError?: boolean;
}

const API_BASE = 'http://127.0.0.1:8000/api/v1';

export default function NexusDashboard() {
  // --- State ---
  const [backendAlive, setBackendAlive] = useState(false);
  const [ollamaConnected, setOllamaConnected] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [models, setModels] = useState<ModelItem[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('qwen2.5-coder:14b');
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  
  // New Project Form Modal
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectPath, setNewProjectPath] = useState('');
  const [projectError, setProjectError] = useState('');

  // Task Input
  const [taskGoal, setTaskGoal] = useState('');
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  // Active Task Stream & Output Tabs
  const [activityFeed, setActivityFeed] = useState<ActivityEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'diff' | 'tests' | 'security' | 'summary'>('diff');
  const [diffContent, setDiffContent] = useState<string>('');
  const [testOutput, setTestOutput] = useState<string>('');
  const [securityOutput, setSecurityOutput] = useState<string>('');
  const [summaryOutput, setSummaryOutput] = useState<string>('');

  const eventSourceRef = useRef<EventSource | null>(null);
  const feedEndRef = useRef<HTMLDivElement>(null);

  // --- Initial System Health & Data Fetch ---
  const fetchHealth = async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (res.ok) {
        const data = await res.json();
        setBackendAlive(true);
        setOllamaConnected(data.ollama_status === 'connected');
      } else {
        setBackendAlive(false);
      }
    } catch {
      setBackendAlive(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_BASE}/projects`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
        if (data.projects?.length > 0 && !selectedProjectId) {
          setSelectedProjectId(data.projects[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load projects', e);
    }
  };

  const fetchModels = async () => {
    try {
      const res = await fetch(`${API_BASE}/models`);
      if (res.ok) {
        const data = await res.json();
        setModels(data.models || []);
        if (data.default_model) setSelectedModel(data.default_model);
      }
    } catch (e) {
      console.error('Failed to load models', e);
    }
  };

  const fetchTasks = async (projId: string) => {
    try {
      const res = await fetch(`${API_BASE}/projects/${projId}/tasks`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
        if (data.tasks?.length > 0 && !selectedTaskId) {
          selectTask(data.tasks[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load tasks', e);
    }
  };

  const fetchApprovals = async () => {
    try {
      const res = await fetch(`${API_BASE}/approvals`);
      if (res.ok) {
        const data = await res.json();
        setApprovals(data.approvals || []);
      }
    } catch (e) {
      console.error('Failed to load approvals', e);
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchProjects();
    fetchModels();
    fetchApprovals();

    const interval = setInterval(() => {
      fetchHealth();
      fetchApprovals();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchTasks(selectedProjectId);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activityFeed]);

  // --- Task Selection & Event Streaming ---
  const selectTask = async (task: TaskItem) => {
    setSelectedTaskId(task.id);
    setActivityFeed([
      {
        id: 'init-1',
        timestamp: new Date().toLocaleTimeString(),
        type: 'task.selected',
        text: `Selected Task: "${task.goal}" [Status: ${task.status}]`,
      },
    ]);
    setSummaryOutput(task.summary || 'Summary will appear when task is complete.');

    // Disconnect old SSE
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Connect SSE stream for live updates
    const es = new EventSource(`${API_BASE}/stream/events/tasks/${task.id}`);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const envelope = JSON.parse(event.data);
        const payload = envelope.payload || {};
        const type = envelope.event_type;

        let feedItem: ActivityEvent | null = null;

        if (type === 'agent.thought') {
          feedItem = {
            id: envelope.event_id,
            timestamp: new Date().toLocaleTimeString(),
            agent: envelope.agent_id,
            type: 'Thought',
            text: payload.thought || '',
          };
        } else if (type === 'tool.invoked') {
          feedItem = {
            id: envelope.event_id,
            timestamp: new Date().toLocaleTimeString(),
            agent: envelope.agent_id,
            type: 'Tool Call',
            tool: payload.tool,
            text: `Invoking tool: ${payload.tool} with parameters: ${JSON.stringify(payload.params || {})}`,
          };
        } else if (type === 'tool.completed') {
          feedItem = {
            id: envelope.event_id,
            timestamp: new Date().toLocaleTimeString(),
            agent: envelope.agent_id,
            type: 'Tool Result',
            tool: payload.tool,
            text: `Tool ${payload.tool} completed in ${payload.duration_ms}ms`,
          };
        } else if (type === 'tool.error') {
          feedItem = {
            id: envelope.event_id,
            timestamp: new Date().toLocaleTimeString(),
            agent: envelope.agent_id,
            type: 'Tool Error',
            tool: payload.tool,
            isError: true,
            text: `Tool error: ${payload.error}`,
          };
        } else if (type === 'task.completed') {
          feedItem = {
            id: envelope.event_id,
            timestamp: new Date().toLocaleTimeString(),
            type: 'Success',
            text: '🎉 Task completed all pipeline stages successfully!',
          };
          if (selectedProjectId) fetchTasks(selectedProjectId);
        }

        if (feedItem) {
          setActivityFeed((prev) => [...prev, feedItem!]);
        }
      } catch (err) {
        console.error('Failed to parse SSE event', err);
      }
    };
  };

  // --- Handlers ---
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setProjectError('');
    try {
      const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProjectName,
          path: newProjectPath,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setProjects((prev) => [created, ...prev]);
        setSelectedProjectId(created.id);
        setShowNewProjectModal(false);
        setNewProjectName('');
        setNewProjectPath('');
      } else {
        const err = await res.json();
        setProjectError(err.message || 'Failed to create project');
      }
    } catch {
      setProjectError('Could not connect to backend.');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !taskGoal.trim()) return;

    setIsSubmittingTask(true);
    try {
      const res = await fetch(`${API_BASE}/projects/${selectedProjectId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: taskGoal,
          model: selectedModel,
        }),
      });

      if (res.ok) {
        const task = await res.json();
        setTasks((prev) => [task, ...prev]);
        setTaskGoal('');
        selectTask(task);

        // Run the task immediately in the backend
        await fetch(`${API_BASE}/projects/${selectedProjectId}/tasks/${task.id}/run`, {
          method: 'POST',
        });
      }
    } catch (err) {
      console.error('Failed to submit task', err);
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleResolveApproval = async (approvalId: string, status: 'approved' | 'rejected') => {
    try {
      await fetch(`${API_BASE}/approvals/${approvalId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: status,
          reason: `User clicked ${status} in desktop UI`,
        }),
      });
      setApprovals((prev) => prev.filter((a) => a.id !== approvalId));
    } catch (e) {
      console.error('Failed to resolve approval', e);
    }
  };

  const activeProject = projects.find((p) => p.id === selectedProjectId);
  const activeTask = tasks.find((t) => t.id === selectedTaskId);

  return (
    <div className="flex h-screen w-screen flex-col bg-[#0a0a0f] text-[#e8e8ed] overflow-hidden select-none font-sans">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="flex h-14 items-center justify-between border-b border-[#2a2a3a] bg-[#12121a] px-5 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-[#6366f1] to-[#a855f7] flex items-center justify-center shadow-lg shadow-[#6366f1]/20">
              <span className="font-mono font-black text-sm text-white">N</span>
            </div>
            <span className="font-mono font-bold tracking-wider text-base bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
              NEXUS
            </span>
            <span className="rounded-full bg-[#1a1a25] border border-[#2a2a3a] px-2 py-0.5 text-[10px] font-mono text-[#818cf8]">
              MVP v0.1.0
            </span>
          </div>

          <div className="h-4 w-[1px] bg-[#2a2a3a]" />

          {/* Project Switcher */}
          <div className="flex items-center gap-2">
            <select
              value={selectedProjectId || ''}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-[#1a1a25] border border-[#2a2a3a] rounded-md px-3 py-1 text-xs text-[#e8e8ed] focus:border-[#6366f1] outline-none cursor-pointer hover:bg-[#22222f] transition"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  📁 {p.name}
                </option>
              ))}
              {projects.length === 0 && <option value="">No registered projects</option>}
            </select>

            <button
              onClick={() => setShowNewProjectModal(true)}
              className="flex items-center gap-1 rounded-md bg-[#1a1a25] hover:bg-[#22222f] border border-[#2a2a3a] px-2.5 py-1 text-xs text-[#9494a8] hover:text-white transition"
            >
              <span>+ Import</span>
            </button>
          </div>
        </div>

        {/* Right Status Controls */}
        <div className="flex items-center gap-4">
          {/* Model Selector */}
          <div className="flex items-center gap-2 bg-[#1a1a25] border border-[#2a2a3a] rounded-md px-2.5 py-1 text-xs">
            <span className="text-[#6b6b80]">Model:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-transparent text-[#818cf8] font-mono text-xs outline-none cursor-pointer"
            >
              {models.map((m) => (
                <option key={m.name} value={m.name} className="bg-[#12121a] text-white">
                  {m.name}
                </option>
              ))}
              {models.length === 0 && (
                <option value="qwen2.5-coder:14b" className="bg-[#12121a] text-white">
                  qwen2.5-coder:14b
                </option>
              )}
            </select>
          </div>

          {/* Ollama Status Badge */}
          <div className="flex items-center gap-1.5 rounded-full bg-[#1a1a25] border border-[#2a2a3a] px-2.5 py-1 text-[11px]">
            <span className={`h-2 w-2 rounded-full ${ollamaConnected ? 'bg-[#22c55e] animate-pulse' : 'bg-[#ef4444]'}`} />
            <span className="text-[#9494a8]">Ollama:</span>
            <span className={ollamaConnected ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
              {ollamaConnected ? 'Ready' : 'Offline'}
            </span>
          </div>

          {/* Backend Status Badge */}
          <div className="flex items-center gap-1.5 rounded-full bg-[#1a1a25] border border-[#2a2a3a] px-2.5 py-1 text-[11px]">
            <span className={`h-2 w-2 rounded-full ${backendAlive ? 'bg-[#22c55e]' : 'bg-[#ef4444]'}`} />
            <span className="text-[#9494a8]">Core:</span>
            <span className={backendAlive ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
              {backendAlive ? 'Active' : 'Down'}
            </span>
          </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE LAYOUT (3 PANELS) */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL: Tasks & Workspace Overview */}
        <aside className="w-72 border-r border-[#2a2a3a] bg-[#12121a] flex flex-col shrink-0">
          <div className="p-3 border-b border-[#2a2a3a]">
            <div className="flex items-center justify-between text-xs font-semibold text-[#9494a8] mb-2">
              <span>WORKSPACE</span>
              {activeProject?.language && (
                <span className="rounded bg-[#1a1a25] border border-[#2a2a3a] px-1.5 py-0.5 text-[10px] text-[#34d399] font-mono">
                  {activeProject.language}
                </span>
              )}
            </div>
            <div className="text-xs font-mono text-[#e8e8ed] truncate" title={activeProject?.path || ''}>
              {activeProject?.path || 'No project selected'}
            </div>
          </div>

          <div className="p-3 border-b border-[#2a2a3a] flex items-center justify-between">
            <span className="text-xs font-semibold text-[#9494a8]">TASK HISTORY ({tasks.length})</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {tasks.map((t) => {
              const isSelected = t.id === selectedTaskId;
              const isCompleted = t.status === 'completed';
              const isRunning = !['completed', 'failed', 'cancelled', 'created'].includes(t.status);

              return (
                <div
                  key={t.id}
                  onClick={() => selectTask(t)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-[#1a1a25] border-[#6366f1] shadow-md shadow-[#6366f1]/10'
                      : 'bg-[#12121a] border-[#2a2a3a] hover:bg-[#1a1a25] hover:border-[#3a3a4a]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-[#6b6b80]">{t.id}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-mono uppercase font-bold ${
                        isCompleted
                          ? 'bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20'
                          : isRunning
                          ? 'bg-[#6366f1]/10 text-[#818cf8] border border-[#6366f1]/20 animate-pulse'
                          : 'bg-[#2a2a3a] text-[#9494a8]'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#e8e8ed] font-medium line-clamp-2">{t.goal}</p>
                </div>
              );
            })}

            {tasks.length === 0 && (
              <div className="text-center py-10 text-[#6b6b80] text-xs">
                No tasks yet. Create one below to start the agent pipeline.
              </div>
            )}
          </div>
        </aside>

        {/* CENTER PANEL: Task Studio, Live Stepper & Timeline */}
        <main className="flex-1 flex flex-col bg-[#0a0a0f] overflow-hidden border-r border-[#2a2a3a]">
          {/* Active Approval Alert Banner (Human-in-the-Loop) */}
          {approvals.length > 0 && (
            <div className="bg-[#ef4444]/10 border-b border-[#ef4444]/30 p-3.5 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3">
                <span className="text-lg">⚠️</span>
                <div>
                  <div className="text-xs font-bold text-[#ef4444] uppercase tracking-wider">
                    Approval Required — High Risk Action
                  </div>
                  <div className="text-xs text-[#e8e8ed]">
                    {approvals[0].description} ({approvals[0].tool_name})
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleResolveApproval(approvals[0].id, 'rejected')}
                  className="rounded-md bg-[#22222f] hover:bg-[#2a2a3a] border border-[#2a2a3a] px-3 py-1.5 text-xs text-[#e8e8ed] transition"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleResolveApproval(approvals[0].id, 'approved')}
                  className="rounded-md bg-[#ef4444] hover:bg-[#dc2626] text-white px-3 py-1.5 text-xs font-semibold shadow-lg shadow-[#ef4444]/20 transition"
                >
                  Approve Execution
                </button>
              </div>
            </div>
          )}

          {/* Stepper / Agent Pipeline Status */}
          <div className="border-b border-[#2a2a3a] bg-[#12121a] px-5 py-3 shrink-0">
            <div className="flex items-center justify-between">
              {[
                { label: '1. Plan', agent: 'planner', color: '#818cf8' },
                { label: '2. Develop', agent: 'developer', color: '#34d399' },
                { label: '3. Test & Debug', agent: 'tester', color: '#fbbf24' },
                { label: '4. Security Audit', agent: 'security', color: '#f472b6' },
                { label: '5. Lead Review', agent: 'reviewer', color: '#60a5fa' },
              ].map((step, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: step.color }}
                    />
                    <span className="text-xs font-medium text-[#9494a8]">{step.label}</span>
                  </div>
                  {idx < 4 && <div className="h-[1px] w-8 bg-[#2a2a3a]" />}
                </div>
              ))}
            </div>
          </div>

          {/* Live Activity Timeline */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
            {activityFeed.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-lg border ${
                  item.isError
                    ? 'bg-[#ef4444]/10 border-[#ef4444]/30 text-[#ef4444]'
                    : item.type === 'Tool Call'
                    ? 'bg-[#1a1a25] border-[#34d399]/30 text-[#34d399]'
                    : item.type === 'Tool Result'
                    ? 'bg-[#12121a] border-[#2a2a3a] text-[#9494a8]'
                    : 'bg-[#12121a] border-[#2a2a3a] text-[#e8e8ed]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 text-[10px] text-[#6b6b80]">
                  <span className="font-bold uppercase tracking-wider text-[#818cf8]">
                    {item.agent ? `[${item.agent.toUpperCase()}]` : '[SYSTEM]'} {item.type}
                  </span>
                  <span>{item.timestamp}</span>
                </div>
                <div className="whitespace-pre-wrap leading-relaxed font-sans">{item.text}</div>
              </div>
            ))}
            <div ref={feedEndRef} />
          </div>

          {/* Natural Language Task Input Bar */}
          <div className="p-4 border-t border-[#2a2a3a] bg-[#12121a] shrink-0">
            <form onSubmit={handleCreateTask} className="flex gap-2">
              <input
                type="text"
                placeholder="Instruct NEXUS: e.g. 'Implement a rate limiter in src/nexus/core/limiter.py and add pytest tests'"
                value={taskGoal}
                onChange={(e) => setTaskGoal(e.target.value)}
                disabled={isSubmittingTask}
                className="flex-1 bg-[#1a1a25] border border-[#2a2a3a] rounded-lg px-4 py-2.5 text-xs text-white placeholder-[#6b6b80] focus:border-[#6366f1] outline-none transition"
              />
              <button
                type="submit"
                disabled={isSubmittingTask || !taskGoal.trim()}
                className="bg-gradient-to-r from-[#6366f1] to-[#818cf8] hover:opacity-90 disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-lg text-xs flex items-center gap-2 shadow-lg shadow-[#6366f1]/25 transition cursor-pointer"
              >
                {isSubmittingTask ? 'Launching...' : 'Run Agents ⚡'}
              </button>
            </form>
          </div>
        </main>

        {/* RIGHT PANEL: Output Inspector (Diffs, Tests, Security, Review) */}
        <aside className="w-96 bg-[#12121a] flex flex-col shrink-0">
          {/* Tabs Header */}
          <div className="flex border-b border-[#2a2a3a] bg-[#0a0a0f] text-xs">
            {[
              { key: 'diff', label: 'Code Diffs' },
              { key: 'tests', label: 'Test Results' },
              { key: 'security', label: 'Security' },
              { key: 'summary', label: 'Review' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 py-3 font-medium transition text-center border-b-2 ${
                  activeTab === tab.key
                    ? 'border-[#6366f1] text-[#e8e8ed] bg-[#12121a]'
                    : 'border-transparent text-[#6b6b80] hover:text-[#9494a8]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-4 overflow-y-auto font-mono text-xs">
            {activeTab === 'diff' && (
              <div className="text-[#9494a8]">
                {diffContent || (
                  <div className="text-center py-20 text-[#6b6b80]">
                    <div className="text-xl mb-2">📄</div>
                    Code diffs generated during task execution will be rendered here.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tests' && (
              <div className="text-[#9494a8]">
                {testOutput || (
                  <div className="text-center py-20 text-[#6b6b80]">
                    <div className="text-xl mb-2">🧪</div>
                    Automated test runner output and assertions will appear here.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'security' && (
              <div className="text-[#9494a8]">
                {securityOutput || (
                  <div className="text-center py-20 text-[#6b6b80]">
                    <div className="text-xl mb-2">🛡️</div>
                    OWASP vulnerability scans and secret checks will appear here.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'summary' && (
              <div className="text-[#e8e8ed] leading-relaxed font-sans">
                {summaryOutput ? (
                  <div className="whitespace-pre-wrap">{summaryOutput}</div>
                ) : (
                  <div className="text-center py-20 text-[#6b6b80]">
                    <div className="text-xl mb-2">📝</div>
                    The Reviewer agent will post the final task changelog here.
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* 3. IMPORT PROJECT MODAL */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#12121a] border border-[#2a2a3a] rounded-xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2a2a3a] pb-3">
              <h3 className="font-bold text-sm text-white">Import Codebase Workspace</h3>
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="text-[#6b6b80] hover:text-white"
              >
                ✕
              </button>
            </div>

            {projectError && (
              <div className="bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-md p-2.5 text-xs text-[#ef4444]">
                {projectError}
              </div>
            )}

            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="block text-xs text-[#9494a8] mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Backend App"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full bg-[#1a1a25] border border-[#2a2a3a] rounded-md px-3 py-2 text-xs text-white focus:border-[#6366f1] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-[#9494a8] mb-1">Filesystem Path (Absolute)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. C:\projects\my-app"
                  value={newProjectPath}
                  onChange={(e) => setNewProjectPath(e.target.value)}
                  className="w-full bg-[#1a1a25] border border-[#2a2a3a] rounded-md px-3 py-2 text-xs text-white font-mono focus:border-[#6366f1] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="px-4 py-2 rounded-md bg-[#1a1a25] hover:bg-[#22222f] border border-[#2a2a3a] text-xs text-[#9494a8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-[#6366f1] hover:bg-[#818cf8] text-xs font-semibold text-white shadow-lg shadow-[#6366f1]/25"
                >
                  Register Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
