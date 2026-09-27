'use client';

import React from 'react';
import { ScreenId, AutomationWorkflow } from '../types/nexus';
import { INITIAL_AUTOMATIONS } from '../data/mockData';

interface Screen10AutomationRunProps {
  workflow?: AutomationWorkflow;
  onNavigate: (screen: ScreenId) => void;
}

export const Screen10AutomationRun: React.FC<Screen10AutomationRunProps> = ({
  workflow = INITIAL_AUTOMATIONS[0],
  onNavigate,
}) => {
  const executionSteps = [
    { time: '08:30:01', label: 'Workflow trigger activated via cron schedule', status: 'completed', duration: '2s' },
    { time: '08:30:03', label: 'Launched Visual Studio Code (target: c:/NEXUS)', status: 'completed', duration: '3s' },
    { time: '08:30:06', label: 'Project workspace loaded & backend servers verified', status: 'completed', duration: '8s' },
    { time: '08:30:14', label: 'NEXUS Planner analyzed active GitHub issues & PRs', status: 'completed', duration: '18s' },
    { time: '08:30:32', label: 'Generated formatted daily standup briefing & audio summary', status: 'completed', duration: '10s' },
    { time: '08:30:42', label: 'Completed successfully with zero errors', status: 'completed', duration: '1s' },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#0a0a0f] p-8 space-y-6 select-none font-sans max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2a2a3a] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('08-automations')}
              className="text-xs text-[#9494a8] hover:text-white transition cursor-pointer"
            >
              ← Automations
            </button>
            <span className="text-[10px] font-mono text-[#22c55e] font-bold">
              SCREEN 10 — AUTOMATION RUN AUDIT
            </span>
          </div>
          <h2 className="text-xl font-black text-white">{workflow.name}</h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#22c55e]/15 border border-[#22c55e]/30 px-3 py-1.5 rounded-xl text-xs font-mono text-[#22c55e] font-bold">
            <span>✓ COMPLETED IN 00:42</span>
          </div>
          <button
            onClick={() => onNavigate('09-automation-builder')}
            className="px-3.5 py-1.5 rounded-xl bg-[#1a1a25] hover:bg-[#22222f] border border-[#2a2a3a] text-xs font-semibold text-white transition cursor-pointer"
          >
            Edit Graph
          </button>
        </div>
      </div>

      {/* Summary Telemetry Strip */}
      <div className="grid grid-cols-4 gap-4 text-xs font-mono">
        <div className="bg-[#12121a] p-4 rounded-xl border border-[#2a2a3a]">
          <div className="text-[#6b6b80] text-[10px] uppercase">TOTAL DURATION</div>
          <div className="text-base font-bold text-white mt-1">42 seconds</div>
        </div>
        <div className="bg-[#12121a] p-4 rounded-xl border border-[#2a2a3a]">
          <div className="text-[#6b6b80] text-[10px] uppercase">NODES EXECUTED</div>
          <div className="text-base font-bold text-[#34d399] mt-1">6 of 6</div>
        </div>
        <div className="bg-[#12121a] p-4 rounded-xl border border-[#2a2a3a]">
          <div className="text-[#6b6b80] text-[10px] uppercase">FAILURES</div>
          <div className="text-base font-bold text-[#22c55e] mt-1">0 errors</div>
        </div>
        <div className="bg-[#12121a] p-4 rounded-xl border border-[#2a2a3a]">
          <div className="text-[#6b6b80] text-[10px] uppercase">AI TOKENS</div>
          <div className="text-base font-bold text-[#818cf8] mt-1">942 tokens</div>
        </div>
      </div>

      {/* Timeline Steps */}
      <div className="rounded-2xl bg-[#12121a] border border-[#2a2a3a] p-6 shadow-xl space-y-4">
        <h3 className="text-xs font-bold font-mono text-[#818cf8] uppercase tracking-wider">
          TIMESTAMPED EXECUTION AUDIT
        </h3>

        <div className="space-y-3 font-mono text-xs">
          {executionSteps.map((step, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3.5 rounded-xl bg-[#1a1a25]/60 border border-[#2a2a3a] hover:border-[#3a3a4a] transition"
            >
              <div className="flex items-center gap-3">
                <span className="text-[#818cf8] font-bold">{step.time}</span>
                <span className="text-[#6b6b80]">➔</span>
                <span className="text-white font-sans text-xs">{step.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#6b6b80]">{step.duration}</span>
                <span className="rounded bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30 px-1.5 py-0.2 text-[9px] font-bold">
                  OK
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
