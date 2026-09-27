'use client';

import React, { useState } from 'react';
import { ScreenId, CoreState } from '../types/nexus';
import {
  INITIAL_TASKS,
  INITIAL_AUTOMATIONS,
  INITIAL_ACTIVITY,
  INITIAL_MODULES,
} from '../data/mockData';
import {
  Terminal,
  Activity,
  Cpu,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowRight,
  GitBranch,
  Layers,
  Sparkles,
  Server,
  Zap,
  Smartphone,
  Eye,
  CornerDownLeft,
} from 'lucide-react';

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
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(3); // Default on Tool Execution
  const [commandInputValue, setCommandInputValue] = useState<string>('');

  const activeTask = INITIAL_TASKS[0];
  const recentActivity = INITIAL_ACTIVITY.slice(0, 6);

  // 6-Stage Connected Execution Timeline
  const timelineStages = [
    {
      id: '01',
      title: 'COMMAND',
      subtitle: 'Prompt Received',
      agent: 'User / Orchestrator',
      status: 'completed',
      duration: '42ms',
      desc: 'User initiated: "Refactor task execution DAG with recovery rollback"',
    },
    {
      id: '02',
      title: 'CONTEXT',
      subtitle: 'AST & Memory',
      agent: 'Planner Agent',
      status: 'completed',
      duration: '180ms',
      desc: 'Extracted 14 AST symbols from services/backend/src/nexus/services/',
    },
    {
      id: '03',
      title: 'AGENT SELECT',
      subtitle: 'DAG Multi-Agent',
      agent: 'Developer + Security',
      status: 'completed',
      duration: '110ms',
      desc: 'Assigned DeveloperAgent for code generation & SecurityAgent for audit',
    },
    {
      id: '04',
      title: 'TOOL EXECUTION',
      subtitle: 'Patch & Sandbox',
      agent: 'Developer Agent',
      status: 'active',
      duration: '840ms',
      desc: 'Executing patch_file on task_service.py and running isolated pytest',
    },
    {
      id: '05',
      title: 'VALIDATION',
      subtitle: 'Security & Tests',
      agent: 'Tester Agent',
      status: 'pending',
      duration: '--',
      desc: 'Verifying 19 pytest test cases & checking DPAPI secret boundaries',
    },
    {
      id: '06',
      title: 'RESULT',
      subtitle: 'Human Approval',
      agent: 'Reviewer Agent',
      status: 'pending',
      duration: '--',
      desc: 'Ready for developer inspection in Screen 07 / Screen 26',
    },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#050B18] text-[#EAF4FF] select-none cyber-grid-bg">
      {/* 3-PANEL FUTURISTIC CYBER OPERATIONS WORKSTATION GRID */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 p-4 overflow-y-auto">
        
        {/* =========================================================================
            LEFT PANEL: SYSTEM CONTROL & NEURAL CORE (3 Cols on XL)
            ========================================================================= */}
        <div className="lg:col-span-3 flex flex-col space-y-3">
          
          {/* 1. NEXUS NEURAL CORE VISUALIZATION */}
          <div className="cyber-panel p-4 flex flex-col items-center justify-center relative overflow-hidden bg-[#0A1225] border border-[#1B2D52]">
            {/* Ambient Core Glow */}
            <div
              className={`absolute w-44 h-44 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
                coreState === 'thinking'
                  ? 'bg-[#9B7CFF]/25 scale-125'
                  : coreState === 'executing'
                  ? 'bg-[#52E5FF]/30 scale-125'
                  : coreState === 'error'
                  ? 'bg-[#FF647C]/30 scale-125'
                  : 'bg-[#52E5FF]/15'
              }`}
            />

            {/* Neural Concentric Rings */}
            <div className="relative h-28 w-28 flex items-center justify-center my-2">
              {/* Outer Pulsing Ring */}
              <div className="absolute inset-0 rounded-full border border-[#52E5FF]/30 animate-pulse-ring" />
              {/* Middle Rotating Tech Ring */}
              <div className="absolute inset-2 rounded-full border border-dashed border-[#9B7CFF]/50 animate-radar" />
              {/* Inner Glowing Core */}
              <div
                className={`h-16 w-16 rounded-2xl flex flex-col items-center justify-center shadow-lg transition-all duration-500 border ${
                  coreState === 'thinking'
                    ? 'bg-gradient-to-tr from-[#111C35] to-[#172544] border-[#9B7CFF] shadow-[0_0_20px_#9B7CFF]'
                    : coreState === 'executing'
                    ? 'bg-gradient-to-tr from-[#111C35] to-[#172544] border-[#52E5FF] shadow-[0_0_20px_#52E5FF]'
                    : coreState === 'error'
                    ? 'bg-gradient-to-tr from-[#111C35] to-[#172544] border-[#FF647C] shadow-[0_0_20px_#FF647C]'
                    : 'bg-gradient-to-tr from-[#0A1225] to-[#111C35] border-[#52E5FF]/60 shadow-[0_0_15px_rgba(82,229,255,0.25)]'
                }`}
              >
                <Cpu
                  className={`h-7 w-7 transition ${
                    coreState === 'thinking'
                      ? 'text-[#9B7CFF] animate-spin-slow'
                      : coreState === 'executing'
                      ? 'text-[#52E5FF] animate-bounce'
                      : coreState === 'error'
                      ? 'text-[#FF647C]'
                      : 'text-[#52E5FF]'
                  }`}
                />
              </div>
            </div>

            {/* Status Header */}
            <div className="text-center z-10">
              <h2 className="text-sm font-mono font-black tracking-widest text-[#EAF4FF] flex items-center justify-center gap-1.5">
                NEXUS NEURAL CORE
              </h2>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span
                  className={`h-2 w-2 rounded-full ${
                    coreState === 'executing'
                      ? 'bg-[#52E5FF] shadow-[0_0_8px_#52E5FF] animate-ping'
                      : coreState === 'thinking'
                      ? 'bg-[#9B7CFF] shadow-[0_0_8px_#9B7CFF] animate-pulse'
                      : 'bg-[#45E6B0] shadow-[0_0_8px_#45E6B0]'
                  }`}
                />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#52E5FF]">
                  STATE: {coreState}
                </span>
              </div>
            </div>

            {/* Interactive Core State Toggle Bar */}
            <div className="mt-3 w-full pt-3 border-t border-[#1B2D52] flex items-center justify-between gap-1">
              {(['idle', 'thinking', 'executing', 'error'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setCoreState(st)}
                  className={`flex-1 py-1 rounded text-[9px] font-mono uppercase tracking-wider transition cursor-pointer ${
                    coreState === st
                      ? 'bg-[#52E5FF] text-[#050B18] font-bold shadow-[0_0_8px_rgba(82,229,255,0.4)]'
                      : 'bg-[#050B18] text-[#8FA6C8] hover:text-[#EAF4FF] border border-[#1B2D52]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* 2. LIVE SYSTEM HARDWARE TELEMETRY */}
          <div className="cyber-panel p-3.5 space-y-2.5 bg-[#0A1225] border border-[#1B2D52]">
            <div className="flex items-center justify-between text-[11px] font-mono border-b border-[#1B2D52] pb-2">
              <span className="font-bold text-[#8FA6C8] tracking-wider flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-[#52E5FF]" /> SYSTEM TELEMETRY
              </span>
              <span className="text-[#45E6B0] text-[10px] font-bold">NOMINAL</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="bg-[#111C35] p-2 rounded border border-[#1B2D52]">
                <div className="text-[#647A9B]">CPU (16 CORES)</div>
                <div className="text-[#EAF4FF] font-bold text-xs mt-0.5">14.2%</div>
                <div className="w-full bg-[#050B18] h-1 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-[#52E5FF] h-full w-[14%]" />
                </div>
              </div>

              <div className="bg-[#111C35] p-2 rounded border border-[#1B2D52]">
                <div className="text-[#647A9B]">RAM (32 GB)</div>
                <div className="text-[#EAF4FF] font-bold text-xs mt-0.5">4.2 GB / 32 GB</div>
                <div className="w-full bg-[#050B18] h-1 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-[#9B7CFF] h-full w-[18%]" />
                </div>
              </div>

              <div className="bg-[#111C35] p-2 rounded border border-[#1B2D52]">
                <div className="text-[#647A9B]">GPU (RTX 4090)</div>
                <div className="text-[#EAF4FF] font-bold text-xs mt-0.5">2.4 / 24 GB VRAM</div>
                <div className="w-full bg-[#050B18] h-1 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-[#45E6B0] h-full w-[10%]" />
                </div>
              </div>

              <div className="bg-[#111C35] p-2 rounded border border-[#1B2D52]">
                <div className="text-[#647A9B]">LOCAL LATENCY</div>
                <div className="text-[#45E6B0] font-bold text-xs mt-0.5">14 ms (mTLS)</div>
                <div className="w-full bg-[#050B18] h-1 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-[#45E6B0] h-full w-[100%]" />
                </div>
              </div>
            </div>
          </div>

          {/* 3. ACTIVE AI MODULES STATUS */}
          <div className="cyber-panel p-3.5 space-y-2 bg-[#0A1225] border border-[#1B2D52]">
            <div className="flex items-center justify-between text-[11px] font-mono border-b border-[#1B2D52] pb-2">
              <span className="font-bold text-[#8FA6C8] tracking-wider flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-[#9B7CFF]" /> ACTIVE MODULES
              </span>
              <button
                onClick={() => onNavigate('04-modules')}
                className="text-[10px] text-[#52E5FF] hover:underline font-mono cursor-pointer"
              >
                VIEW ALL (7)
              </button>
            </div>

            <div className="space-y-1.5">
              {INITIAL_MODULES.slice(0, 4).map((mod) => (
                <div
                  key={mod.id}
                  onClick={() => onNavigate('04-modules')}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#111C35] hover:bg-[#172544] border border-[#1B2D52] hover:border-[#52E5FF]/40 cursor-pointer transition"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{mod.icon}</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-mono font-semibold text-[#EAF4FF]">{mod.name}</span>
                      <span className="text-[9px] text-[#647A9B] font-mono truncate max-w-[120px]">{mod.tagline}</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#050B18] text-[#45E6B0] border border-[#45E6B0]/30">
                    READY
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. CONNECTED COMPANION NODE */}
          <div className="cyber-panel p-3 bg-[#0A1225] border border-[#1B2D52] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[#111C35] border border-[#1B2D52]">
                <Smartphone className="h-4 w-4 text-[#52E5FF]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-mono font-bold text-[#EAF4FF]">ANDROID NODE #01</span>
                <span className="text-[10px] text-[#45E6B0] font-mono">Pixel 8 Pro • mTLS Synced</span>
              </div>
            </div>
            <span className="h-2 w-2 rounded-full bg-[#45E6B0] animate-pulse shadow-[0_0_6px_#45E6B0]" />
          </div>

        </div>

        {/* =========================================================================
            CENTER PANEL: CONNECTED EXECUTION TIMELINE & COMMAND CONSOLE (6 Cols on XL)
            ========================================================================= */}
        <div className="lg:col-span-6 flex flex-col space-y-3">
          
          {/* 1. FUTURISTIC COMMAND INPUT BAR */}
          <div className="cyber-panel p-3 bg-[#0A1225] border border-[#1B2D52] flex items-center gap-2.5 shadow-[0_0_15px_rgba(82,229,255,0.08)]">
            <div className="p-2 rounded bg-[#111C35] border border-[#1B2D52] text-[#52E5FF]">
              <Terminal className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={commandInputValue}
              onChange={(e) => setCommandInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onNavigate('02-command');
                }
              }}
              placeholder="ENTER INSTRUCTION: e.g., 'Refactor task DAG and run security verification'..."
              className="flex-1 bg-transparent border-none outline-none text-xs font-mono text-[#EAF4FF] placeholder-[#647A9B]"
            />
            <button
              onClick={() => onNavigate('02-command')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#52E5FF] hover:bg-[#398BFF] text-[#050B18] font-mono font-bold text-xs transition cursor-pointer shadow-[0_0_10px_rgba(82,229,255,0.3)]"
            >
              <span>EXECUTE</span>
              <CornerDownLeft className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* 2. CENTRAL CONNECTED AI EXECUTION TIMELINE */}
          <div className="cyber-panel p-4 bg-[#0A1225] border border-[#1B2D52] flex-1 flex flex-col">
            <div className="flex items-center justify-between border-b border-[#1B2D52] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-[#52E5FF]" />
                <h3 className="text-xs font-mono font-black tracking-widest text-[#EAF4FF] uppercase">
                  ACTIVE EXECUTION TIMELINE — TASK #01
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#52E5FF]/10 text-[#52E5FF] border border-[#52E5FF]/40 animate-pulse">
                  STAGE 04: TOOL EXECUTION
                </span>
                <button
                  onClick={() => onNavigate('07-task-detail')}
                  className="text-[10px] font-mono text-[#8FA6C8] hover:text-[#52E5FF] underline cursor-pointer"
                >
                  FULL DAG
                </button>
              </div>
            </div>

            {/* CONNECTED HORIZONTAL NODE PIPELINE */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 my-2 relative">
              {timelineStages.map((stage, idx) => {
                const isSelected = selectedStepIndex === idx;
                return (
                  <div
                    key={stage.id}
                    onClick={() => setSelectedStepIndex(idx)}
                    className={`flex flex-col p-2.5 rounded-lg cursor-pointer transition border relative ${
                      isSelected
                        ? 'bg-[#172544] border-[#52E5FF] shadow-[0_0_12px_rgba(82,229,255,0.25)]'
                        : stage.status === 'completed'
                        ? 'bg-[#111C35] border-[#45E6B0]/50 hover:border-[#45E6B0]'
                        : stage.status === 'active'
                        ? 'bg-[#111C35] border-[#52E5FF]/70 shadow-[0_0_10px_rgba(82,229,255,0.2)]'
                        : 'bg-[#050B18] border-[#1B2D52] opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[9px] font-mono mb-1">
                      <span className="font-bold text-[#52E5FF]">{stage.id}</span>
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          stage.status === 'completed'
                            ? 'bg-[#45E6B0]'
                            : stage.status === 'active'
                            ? 'bg-[#52E5FF] animate-ping'
                            : 'bg-[#647A9B]'
                        }`}
                      />
                    </div>
                    <div className="text-[11px] font-mono font-bold text-[#EAF4FF] truncate">{stage.title}</div>
                    <div className="text-[9px] text-[#647A9B] font-mono truncate">{stage.subtitle}</div>
                    <div className="mt-2 pt-1 border-t border-[#1B2D52] flex items-center justify-between text-[8px] font-mono text-[#8FA6C8]">
                      <span>{stage.duration}</span>
                      <span className={stage.status === 'completed' ? 'text-[#45E6B0]' : stage.status === 'active' ? 'text-[#52E5FF]' : 'text-[#647A9B]'}>
                        {stage.status === 'completed' ? 'PASS' : stage.status === 'active' ? 'RUN' : 'WAIT'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SELECTED STAGE INSPECTION TERMINAL */}
            <div className="mt-4 p-3.5 rounded-lg bg-[#050B18] border border-[#1B2D52] flex-1 flex flex-col justify-between font-mono">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs border-b border-[#1B2D52] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[#52E5FF] font-bold">
                      INSPECT STAGE {timelineStages[selectedStepIndex].id}: {timelineStages[selectedStepIndex].title}
                    </span>
                    <span className="text-[10px] text-[#647A9B]">({timelineStages[selectedStepIndex].agent})</span>
                  </div>
                  <span className="text-[10px] text-[#45E6B0] font-bold">
                    EXEC TIME: {timelineStages[selectedStepIndex].duration}
                  </span>
                </div>

                <p className="text-xs text-[#8FA6C8] leading-relaxed">
                  {timelineStages[selectedStepIndex].desc}
                </p>

                {/* Technical Execution Log Trace Snippet */}
                <div className="p-2.5 rounded bg-[#0A1225] border border-[#1B2D52] text-[11px] space-y-1 text-[#EAF4FF]">
                  <div className="text-[#647A9B] text-[10px]">$ nexus.tool_execution.patch_file(target=&quot;task_service.py&quot;)</div>
                  <div className="text-[#45E6B0] flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Hunk #1 applied cleanly: +34 lines, -12 lines</span>
                  </div>
                  <div className="text-[#52E5FF] flex items-center gap-1.5">
                    <Activity className="h-3 w-3 animate-spin-slow" />
                    <span>Executing pytest tests/test_task_service.py... (19/19 passing)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#1B2D52] mt-3">
                <button
                  onClick={() => onNavigate('07-task-detail')}
                  className="flex items-center gap-1.5 text-xs text-[#52E5FF] hover:underline cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Inspect Full Code Diff & Output</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('23-permission-modal')}
                    className="px-2.5 py-1 rounded bg-[#111C35] hover:bg-[#172544] border border-[#1B2D52] text-[11px] text-[#8FA6C8] hover:text-[#EAF4FF] cursor-pointer"
                  >
                    Permissions
                  </button>
                  <button
                    onClick={() => onNavigate('06-tasks')}
                    className="px-2.5 py-1 rounded bg-[#52E5FF]/20 hover:bg-[#52E5FF]/30 border border-[#52E5FF]/50 text-[11px] text-[#52E5FF] font-bold cursor-pointer"
                  >
                    Manage Tasks
                  </button>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS WORKSTATION LAUNCHPAD */}
            <div className="mt-3 grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { label: 'AI Console', icon: '💬', screen: '02-command' as ScreenId },
                { label: 'Tasks', icon: '📋', screen: '06-tasks' as ScreenId },
                { label: 'Automations', icon: '⚙️', screen: '08-automations' as ScreenId },
                { label: 'File Matrix', icon: '📁', screen: '13-files' as ScreenId },
                { label: 'Memory', icon: '🧠', screen: '17-memory' as ScreenId },
                { label: 'Audit Trace', icon: '🔍', screen: '12-trace' as ScreenId },
              ].map((act, i) => (
                <button
                  key={i}
                  onClick={() => onNavigate(act.screen)}
                  className="flex flex-col items-center justify-center p-2 rounded-lg bg-[#111C35] hover:bg-[#172544] border border-[#1B2D52] hover:border-[#52E5FF]/50 transition cursor-pointer text-center group"
                >
                  <span className="text-base mb-1 group-hover:scale-110 transition">{act.icon}</span>
                  <span className="text-[10px] font-mono text-[#8FA6C8] group-hover:text-[#52E5FF]">{act.label}</span>
                </button>
              ))}
            </div>

          </div>

        </div>

        {/* =========================================================================
            RIGHT PANEL: LIVE OPERATIONS & AUDIT CONSOLE (3 Cols on XL)
            ========================================================================= */}
        <div className="lg:col-span-3 flex flex-col space-y-3">
          
          {/* 1. LIVE OPERATIONS ACTIVITY FEED */}
          <div className="cyber-panel p-3.5 space-y-2 bg-[#0A1225] border border-[#1B2D52] flex-1 flex flex-col">
            <div className="flex items-center justify-between text-[11px] font-mono border-b border-[#1B2D52] pb-2">
              <span className="font-bold text-[#8FA6C8] tracking-wider flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-[#45E6B0]" /> LIVE OPERATIONS LOG
              </span>
              <button
                onClick={() => onNavigate('11-activity')}
                className="text-[10px] text-[#52E5FF] hover:underline font-mono cursor-pointer"
              >
                EXPAND
              </button>
            </div>

            <div className="space-y-2 overflow-y-auto flex-1 font-mono text-[10px]">
              {recentActivity.map((act) => (
                <div
                  key={act.id}
                  className="p-2 rounded bg-[#111C35] border border-[#1B2D52] space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[#647A9B]">{act.timeAgo || 'Just now'}</span>
                    <span className="text-[#52E5FF] font-bold">[{act.category?.toUpperCase()}]</span>
                  </div>
                  <div className="text-[#EAF4FF] font-medium leading-tight">{act.title || act.action}</div>
                  <div className="flex items-center justify-between text-[9px] text-[#8FA6C8]">
                    <span className="text-[#45E6B0]">● SUCCESS</span>
                    <span className="text-[#647A9B]">ID: {act.id.slice(0, 8)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. PENDING HUMAN APPROVAL GATE */}
          <div className="cyber-panel p-3.5 bg-[#0A1225] border border-[#FFC76A]/50 space-y-2.5 shadow-[0_0_12px_rgba(255,199,106,0.1)]">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="font-bold text-[#FFC76A] flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-[#FFC76A]" /> PENDING APPROVAL
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#FFC76A]/10 text-[#FFC76A] border border-[#FFC76A]/40">
                HIGH RISK
              </span>
            </div>

            <div className="text-[11px] font-mono text-[#EAF4FF] leading-snug">
              DeveloperAgent requested tool: <code className="text-[#52E5FF]">execute_command(&quot;git push origin main&quot;)</code>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
              <button
                onClick={() => onNavigate('24-ai-confirmation')}
                className="py-1.5 rounded bg-[#45E6B0] hover:bg-[#34d399] text-[#050B18] font-bold text-xs transition cursor-pointer shadow-[0_0_8px_rgba(69,230,176,0.3)]"
              >
                APPROVE
              </button>
              <button
                onClick={() => onNavigate('07-task-detail')}
                className="py-1.5 rounded bg-[#111C35] hover:bg-[#172544] border border-[#1B2D52] text-[#FF647C] font-bold text-xs transition cursor-pointer"
              >
                REJECT
              </button>
            </div>
          </div>

          {/* 3. ACTIVE RUNTIME TOOL BOUNDARIES */}
          <div className="cyber-panel p-3 bg-[#0A1225] border border-[#1B2D52] space-y-2 font-mono text-[10px]">
            <div className="flex items-center justify-between text-[#8FA6C8] border-b border-[#1B2D52] pb-1.5">
              <span>TOOL RUNTIME</span>
              <span className="text-[#52E5FF]">SANDBOXED</span>
            </div>
            <div className="flex items-center justify-between text-[#EAF4FF]">
              <span className="text-[#647A9B]">Docker Sandbox:</span>
              <span className="text-[#45E6B0]">RUNNING (nexus-sbx)</span>
            </div>
            <div className="flex items-center justify-between text-[#EAF4FF]">
              <span className="text-[#647A9B]">Git VCS Engine:</span>
              <span className="text-[#45E6B0]">ATTACHED (main)</span>
            </div>
            <div className="flex items-center justify-between text-[#EAF4FF]">
              <span className="text-[#647A9B]">ChromaDB Vector:</span>
              <span className="text-[#45E6B0]">MOUNTED (142 docs)</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
