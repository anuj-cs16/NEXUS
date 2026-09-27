'use client';

import React from 'react';
import { ScreenId, CoreState } from '../types/nexus';
import {
  INITIAL_TASKS,
  INITIAL_AUTOMATIONS,
  INITIAL_ACTIVITY,
  INITIAL_MODULES,
} from '../data/mockData';

interface Screen01HomeProps {
  onNavigate: (screen: ScreenId) => void;
  coreState: CoreState;
  setCoreState: (state: CoreState) => void;
  onOpenPalette: () => void;
}

export const Screen01Home: React.FC<Screen01HomeProps> = ({
  onNavigate,
  coreState,
  setCoreState,
  onOpenPalette,
}) => {
  const activeTask = INITIAL_TASKS[0];
  const activeAutomations = INITIAL_AUTOMATIONS.slice(0, 2);
  const recentActivity = INITIAL_ACTIVITY.slice(0, 4);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#0a0a0f] p-6 space-y-6 select-none font-sans">
      {/* 1. HERO / NEXUS CORE STATUS BANNER */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#12121a] via-[#1a1a25] to-[#12121a] border border-[#2a2a3a] p-6 shadow-2xl overflow-hidden ring-1 ring-white/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#6366f1]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Pulsing Neural Core Orb */}
            <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-tr from-[#6366f1] via-[#818cf8] to-[#ec4899] flex items-center justify-center shadow-xl shadow-[#6366f1]/30 ring-2 ring-white/20 shrink-0">
              <span className="text-2xl animate-spin-slow">🌀</span>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-[#22c55e] border-2 border-[#12121a]" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-black tracking-tight text-white">NEXUS CORE</h1>
                <span className="rounded-full bg-[#22c55e]/15 border border-[#22c55e]/30 px-2.5 py-0.5 text-[11px] font-mono font-bold text-[#22c55e]">
                  ONLINE & READY
                </span>
                <span className="text-xs text-[#6b6b80] font-mono">v0.1.0-alpha</span>
              </div>
              <p className="text-xs text-[#9494a8] mt-1 max-w-xl leading-relaxed">
                Autonomous AI software engineering OS. All 7 intelligence modules active. Local Ollama LLM attached with zero cloud leakage.
              </p>
            </div>
          </div>

          {/* Interactive Core State Switcher */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className="text-[10px] font-mono font-bold text-[#6b6b80] uppercase">DEMO STATE TOGGLE</span>
            <div className="flex items-center gap-1.5 bg-[#0e0e16] border border-[#2a2a3a] p-1 rounded-xl">
              {(['idle', 'thinking', 'executing', 'success', 'error'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setCoreState(st)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono capitalize transition cursor-pointer ${
                    coreState === st
                      ? 'bg-[#6366f1] text-white font-bold shadow-sm'
                      : 'text-[#9494a8] hover:text-white hover:bg-[#1a1a25]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Current Activity Status Strip */}
        <div className="mt-5 pt-4 border-t border-[#2a2a3a]/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-[#818cf8]">Active Action:</span>
            <span className="text-white bg-[#22222f] px-2 py-0.5 rounded border border-[#2a2a3a]">
              {coreState === 'thinking' ? 'Synthesizing PRD and AST mappings...' : coreState === 'executing' ? 'Patching files & executing pytest suite...' : 'Listening on EventBus (0 tasks queued)'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[#6b6b80]">
            <span>Latency: <strong className="text-[#34d399]">14ms</strong></span>
            <span>•</span>
            <span>GPU: <strong className="text-white">RTX 4090 (24GB VRAM)</strong></span>
            <span>•</span>
            <span>RAM: <strong className="text-white">4.2GB / 32GB</strong></span>
          </div>
        </div>
      </div>

      {/* 2. PRIMARY QUICK ACTIONS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Ask NEXUS', icon: '💬', screen: '02-command' as ScreenId, color: '#6366f1' },
          { label: 'Start Task', icon: '📋', screen: '06-tasks' as ScreenId, color: '#34d399' },
          { label: 'Run Automation', icon: '⚙️', screen: '08-automations' as ScreenId, color: '#fbbf24' },
          { label: 'Search Files', icon: '📁', screen: '14-file-search' as ScreenId, color: '#38bdf8' },
          { label: 'Launch Apps', icon: '💻', screen: '15-apps' as ScreenId, color: '#ec4899' },
          { label: 'View Trace', icon: '🔍', screen: '12-trace' as ScreenId, color: '#a78bfa' },
        ].map((act, i) => (
          <button
            key={i}
            onClick={() => onNavigate(act.screen)}
            className="group flex flex-col items-center justify-center p-4 rounded-xl bg-[#12121a] hover:bg-[#1a1a25] border border-[#2a2a3a] hover:border-[#6366f1]/50 transition shadow-sm hover:shadow-lg hover:shadow-[#6366f1]/10 cursor-pointer text-center"
          >
            <span className="text-2xl mb-1.5 group-hover:scale-110 transition">{act.icon}</span>
            <span className="text-xs font-semibold text-[#e8e8ed] group-hover:text-white">{act.label}</span>
          </button>
        ))}
      </div>

      {/* 3. CENTER / LOWER MULTI-PANEL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Task Card & Live Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Task Card */}
          <div className="rounded-2xl bg-[#12121a] border border-[#2a2a3a] p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#6366f1] animate-pulse" />
                <h3 className="text-xs font-bold text-[#818cf8] uppercase tracking-wider font-mono">
                  ACTIVE ENGINEERING TASK
                </h3>
              </div>
              <span className="rounded bg-[#6366f1]/20 border border-[#6366f1]/30 px-2 py-0.5 text-[10px] font-mono text-[#818cf8] font-bold">
                {activeTask.progress}% COMPLETE
              </span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white">{activeTask.title}</h4>
              <p className="text-xs text-[#9494a8] mt-1 leading-relaxed">{activeTask.description}</p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-[#9494a8]">{activeTask.aiStatus}</span>
                <span className="text-white font-bold">{activeTask.progress}%</span>
              </div>
              <div className="w-full bg-[#1a1a25] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#6366f1] to-[#34d399] h-full rounded-full transition-all duration-500"
                  style={{ width: `${activeTask.progress}%` }}
                />
              </div>
            </div>

            {/* Task Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-[#2a2a3a]">
              <div className="flex items-center gap-2 text-[10px] font-mono text-[#6b6b80]">
                <span>Files: 3</span>
                <span>•</span>
                <span>Apps: VS Code, Chrome</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('07-task-detail')}
                  className="rounded-lg bg-[#6366f1] hover:bg-[#818cf8] text-white px-3 py-1.5 text-xs font-bold shadow-md shadow-[#6366f1]/20 transition cursor-pointer"
                >
                  Inspect Task Execution →
                </button>
              </div>
            </div>
          </div>

          {/* Live Activity Center */}
          <div className="rounded-2xl bg-[#12121a] border border-[#2a2a3a] p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#818cf8] uppercase tracking-wider font-mono">
                REAL-TIME ACTIVITY FEED
              </h3>
              <button
                onClick={() => onNavigate('11-activity')}
                className="text-xs text-[#9494a8] hover:text-white transition cursor-pointer"
              >
                View All Activity →
              </button>
            </div>

            <div className="space-y-2.5">
              {recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-[#1a1a25]/60 hover:bg-[#1a1a25] border border-[#2a2a3a] transition"
                >
                  <span className="text-base shrink-0 mt-0.5">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-[#e8e8ed]">{item.title}</div>
                    <div className="text-[10px] text-[#6b6b80] font-mono mt-0.5">{item.timeAgo}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Running Automations & System Insights */}
        <div className="space-y-6">
          {/* Running Automations */}
          <div className="rounded-2xl bg-[#12121a] border border-[#2a2a3a] p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#fbbf24] uppercase tracking-wider font-mono">
                RUNNING AUTOMATIONS
              </h3>
              <button
                onClick={() => onNavigate('08-automations')}
                className="text-xs text-[#9494a8] hover:text-white transition cursor-pointer"
              >
                Manage →
              </button>
            </div>

            <div className="space-y-3">
              {activeAutomations.map((auto) => (
                <div
                  key={auto.id}
                  className="p-3.5 rounded-xl bg-[#1a1a25] border border-[#2a2a3a] space-y-2 hover:border-[#fbbf24]/50 transition cursor-pointer"
                  onClick={() => onNavigate('10-automation-run')}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{auto.name}</span>
                    <span className="rounded bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30 px-1.5 py-0.2 text-[9px] font-mono font-bold">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9494a8] line-clamp-2">{auto.description}</p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#6b6b80] pt-1">
                    <span>{auto.schedule}</span>
                    <span className="text-[#fbbf24]">{auto.stepsCount} Nodes</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate('09-automation-builder')}
              className="w-full py-2 rounded-xl bg-[#1a1a25] hover:bg-[#22222f] border border-[#2a2a3a] text-xs font-semibold text-[#818cf8] transition cursor-pointer"
            >
              + Create New Workflow
            </button>
          </div>

          {/* System Insights Card */}
          <div className="rounded-2xl bg-[#12121a] border border-[#2a2a3a] p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#34d399] uppercase tracking-wider font-mono">
                SYSTEM INSIGHTS
              </h3>
              <button
                onClick={() => onNavigate('19-insights')}
                className="text-xs text-[#9494a8] hover:text-white transition cursor-pointer"
              >
                Details →
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#1a1a25] p-3 rounded-xl border border-[#2a2a3a]">
                <div className="text-[10px] text-[#6b6b80] font-mono uppercase">TIME SAVED</div>
                <div className="text-lg font-black text-white mt-1">3.4 hrs</div>
                <div className="text-[9px] text-[#34d399] font-mono mt-0.5">↑ 24% this week</div>
              </div>

              <div className="bg-[#1a1a25] p-3 rounded-xl border border-[#2a2a3a]">
                <div className="text-[10px] text-[#6b6b80] font-mono uppercase">TASKS DONE</div>
                <div className="text-lg font-black text-white mt-1">18 tasks</div>
                <div className="text-[9px] text-[#818cf8] font-mono mt-0.5">100% verified</div>
              </div>
            </div>

            <div className="bg-[#1a1a25] p-3 rounded-xl border border-[#2a2a3a] space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#9494a8]">Top Active Module:</span>
                <span className="text-[#34d399] font-mono font-bold">NEXUS Builder</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#9494a8]">Memory Nodes:</span>
                <span className="text-[#e8e8ed] font-mono font-bold">2,140 stored</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
