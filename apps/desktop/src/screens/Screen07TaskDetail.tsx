'use client';

import React, { useState } from 'react';
import { ScreenId, TaskItem } from '../types/nexus';
import { INITIAL_TASKS } from '../data/mockData';

interface Screen07TaskDetailProps {
  task?: TaskItem;
  onNavigate: (screen: ScreenId) => void;
}

export const Screen07TaskDetail: React.FC<Screen07TaskDetailProps> = ({
  task = INITIAL_TASKS[0],
  onNavigate,
}) => {
  const [isPaused, setIsPaused] = useState(false);

  const timelineSteps = [
    { num: 1, title: 'Understand Request', desc: 'Parsed natural language prompt & inferred technical requirements', status: 'completed', duration: '12s' },
    { num: 2, title: 'Gather Context', desc: 'Indexed 24 workspace files & generated AST relationships', status: 'completed', duration: '34s' },
    { num: 3, title: 'Analyze Architecture', desc: 'Identified 8 model schemas & 19 API endpoints', status: 'completed', duration: '45s' },
    { num: 4, title: 'Execute Actions', desc: 'Synthesizing complete PRD markdown & diagrams in docs/PRD.md', status: 'running', duration: '2m running' },
    { num: 5, title: 'Validate Result', desc: 'Run automated pytest assertions & typechecks', status: 'pending', duration: '--' },
    { num: 6, title: 'Complete & Commit', desc: 'Create signed atomic git commit with changelog summary', status: 'pending', duration: '--' },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#0a0a0f] p-8 space-y-6 select-none font-sans max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2a2a3a] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('06-tasks')}
              className="text-xs text-[#9494a8] hover:text-white transition cursor-pointer"
            >
              ← Tasks
            </button>
            <span className="text-[10px] font-mono text-[#6b6b80]">{task.id}</span>
            <span className="rounded bg-[#6366f1]/20 border border-[#6366f1]/30 px-2 py-0.5 text-[10px] font-mono text-[#818cf8] font-bold">
              {task.progress}% IN PROGRESS
            </span>
          </div>
          <h2 className="text-xl font-black text-white">{task.title}</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`px-4 py-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
              isPaused
                ? 'bg-[#fbbf24]/20 border-[#fbbf24] text-[#fbbf24]'
                : 'bg-[#1a1a25] border-[#2a2a3a] text-[#9494a8] hover:text-white'
            }`}
          >
            {isPaused ? '▶ Resume Task' : '⏸ Pause Pipeline'}
          </button>
          <button
            onClick={() => onNavigate('06-tasks')}
            className="px-4 py-2 rounded-xl bg-[#ef4444]/15 hover:bg-[#ef4444]/30 border border-[#ef4444]/30 text-xs font-semibold text-[#ef4444] transition cursor-pointer"
          >
            Cancel Task
          </button>
        </div>
      </div>

      {/* Main Workspace Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Execution Timeline (6 steps) */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-2xl bg-[#12121a] border border-[#2a2a3a] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold font-mono text-[#818cf8] uppercase tracking-wider">
                SAFE USER-FACING EXECUTION TIMELINE
              </h3>
              <span className="text-[10px] font-mono text-[#6b6b80]">Phase 4 of 6 Active</span>
            </div>

            <div className="space-y-4 pt-2">
              {timelineSteps.map((step) => {
                const isCompleted = step.status === 'completed';
                const isRunning = step.status === 'running';

                return (
                  <div
                    key={step.num}
                    className={`flex items-start gap-4 p-4 rounded-xl border transition ${
                      isRunning
                        ? 'bg-gradient-to-r from-[#1a1a25] to-[#12121a] border-[#6366f1] shadow-lg shadow-[#6366f1]/10'
                        : isCompleted
                        ? 'bg-[#1a1a25]/40 border-[#2a2a3a]'
                        : 'bg-[#12121a]/50 border-[#2a2a3a]/50 opacity-50'
                    }`}
                  >
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                        isCompleted
                          ? 'bg-[#22c55e] text-black shadow-md'
                          : isRunning
                          ? 'bg-[#6366f1] text-white animate-pulse ring-4 ring-[#6366f1]/20'
                          : 'bg-[#22222f] text-[#6b6b80]'
                      }`}
                    >
                      {isCompleted ? '✓' : step.num}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white">{step.title}</h4>
                        <span className="text-[10px] font-mono text-[#818cf8]">{step.duration}</span>
                      </div>
                      <p className="text-xs text-[#9494a8] leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side Panel: Related Artifacts & Metadata */}
        <div className="space-y-5">
          {/* Related Files */}
          <div className="rounded-2xl bg-[#12121a] border border-[#2a2a3a] p-5 shadow-xl space-y-3">
            <h3 className="text-xs font-bold font-mono text-[#818cf8] uppercase">RELATED WORKSPACE FILES</h3>
            <div className="space-y-2">
              {task.relatedFiles.map((file, i) => (
                <div
                  key={i}
                  onClick={() => onNavigate('13-files')}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#1a1a25] border border-[#2a2a3a] hover:border-[#6366f1] cursor-pointer transition text-xs font-mono"
                >
                  <span className="text-white truncate">{file}</span>
                  <span className="text-[10px] text-[#34d399]">Attached</span>
                </div>
              ))}
            </div>
          </div>

          {/* Connected Applications */}
          <div className="rounded-2xl bg-[#12121a] border border-[#2a2a3a] p-5 shadow-xl space-y-3">
            <h3 className="text-xs font-bold font-mono text-[#fbbf24] uppercase">CONNECTED APPLICATIONS</h3>
            <div className="space-y-2">
              {task.relatedApps.map((app, i) => (
                <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#1a1a25] border border-[#2a2a3a] text-xs">
                  <span>💻</span>
                  <span className="text-white font-medium">{app}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Execution Telemetry */}
          <div className="rounded-2xl bg-[#12121a] border border-[#2a2a3a] p-5 shadow-xl space-y-3 text-xs font-mono">
            <h3 className="text-xs font-bold text-[#34d399] uppercase">EXECUTION METRICS</h3>
            <div className="space-y-2 text-[#9494a8]">
              <div className="flex justify-between">
                <span>Active Model:</span>
                <span className="text-white font-bold">qwen2.5-coder:14b</span>
              </div>
              <div className="flex justify-between">
                <span>Sandbox Security:</span>
                <span className="text-[#34d399] font-bold">Jail Enforced (0 Escapes)</span>
              </div>
              <div className="flex justify-between">
                <span>Tokens Generated:</span>
                <span className="text-white font-bold">1,842 tokens</span>
              </div>
              <div className="flex justify-between">
                <span>Elapsed Duration:</span>
                <span className="text-[#818cf8] font-bold">3m 31s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
