'use client';

import React from 'react';
import { ScreenId } from '../types/nexus';

interface Screen16SystemControlProps {
  onNavigate: (screen: ScreenId) => void;
}

export const Screen16SystemControl: React.FC<Screen16SystemControlProps> = ({
  onNavigate,
}) => {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#0a0a0f] p-8 space-y-6 select-none font-sans max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2a2a3a] pb-4">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#60a5fa]">
            SCREEN 16 — HARDWARE & PROCESS GOVERNOR
          </div>
          <h2 className="text-xl font-black text-white mt-0.5">System Awareness & Telemetry</h2>
          <p className="text-xs text-[#9494a8] mt-1">
            Real-time process sandboxing, GPU memory allocation, and host resource governance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#22c55e]/15 border border-[#22c55e]/30 px-3 py-1 text-xs font-mono text-[#22c55e] font-bold">
            Health: Optimal (0 throttling)
          </span>
        </div>
      </div>

      {/* Hardware Utilization Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#12121a] p-5 rounded-2xl border border-[#2a2a3a] space-y-2">
          <div className="flex justify-between text-xs font-mono text-[#6b6b80]">
            <span>CPU UTILIZATION</span>
            <span className="text-[#34d399] font-bold">12%</span>
          </div>
          <div className="text-2xl font-black text-white font-mono">16 Cores</div>
          <div className="w-full bg-[#1a1a25] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#34d399] h-full w-[12%]" />
          </div>
        </div>

        <div className="bg-[#12121a] p-5 rounded-2xl border border-[#2a2a3a] space-y-2">
          <div className="flex justify-between text-xs font-mono text-[#6b6b80]">
            <span>SYSTEM RAM</span>
            <span className="text-[#818cf8] font-bold">4.2 / 32 GB</span>
          </div>
          <div className="text-2xl font-black text-white font-mono">13% Used</div>
          <div className="w-full bg-[#1a1a25] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#818cf8] h-full w-[13%]" />
          </div>
        </div>

        <div className="bg-[#12121a] p-5 rounded-2xl border border-[#2a2a3a] space-y-2">
          <div className="flex justify-between text-xs font-mono text-[#6b6b80]">
            <span>GPU VRAM</span>
            <span className="text-[#ec4899] font-bold">8.4 / 24 GB</span>
          </div>
          <div className="text-2xl font-black text-white font-mono">Ollama Qwen</div>
          <div className="w-full bg-[#1a1a25] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#ec4899] h-full w-[35%]" />
          </div>
        </div>

        <div className="bg-[#12121a] p-5 rounded-2xl border border-[#2a2a3a] space-y-2">
          <div className="flex justify-between text-xs font-mono text-[#6b6b80]">
            <span>STORAGE</span>
            <span className="text-[#fbbf24] font-bold">1.2 / 50 GB</span>
          </div>
          <div className="text-2xl font-black text-white font-mono">SQLite DB</div>
          <div className="w-full bg-[#1a1a25] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#fbbf24] h-full w-[2%]" />
          </div>
        </div>
      </div>

      {/* AI Workload & Active Agent Processes */}
      <div className="rounded-2xl bg-[#12121a] border border-[#2a2a3a] p-6 shadow-xl space-y-4">
        <h3 className="text-xs font-bold font-mono text-[#818cf8] uppercase tracking-wider">
          ACTIVE AI AGENT WORKLOAD & PROCESS GOVERNANCE
        </h3>

        <div className="space-y-3 font-mono text-xs">
          {[
            { name: 'NEXUS Planner Agent', pid: '20412', status: 'Running', cpu: '4.2%', ram: '142 MB', task: 'Synthesizing PRD specifications' },
            { name: 'Ollama Inference Daemon', pid: '8192', status: 'Active (GPU)', cpu: '2.1%', ram: '8,400 MB', task: 'qwen2.5-coder:14b inference stream' },
            { name: 'FastAPI Backend Core', pid: '10940', status: 'Idle', cpu: '0.1%', ram: '88 MB', task: 'Listening on http://127.0.0.1:8000' },
            { name: 'EventBus WebSocket Hub', pid: '10941', status: 'Streaming', cpu: '0.0%', ram: '14 MB', task: '3 active subscribers connected' },
          ].map((proc, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3.5 rounded-xl bg-[#1a1a25]/60 border border-[#2a2a3a] hover:border-[#3a3a4a] transition"
            >
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
                <div>
                  <div className="text-white font-bold text-xs font-sans">{proc.name}</div>
                  <div className="text-[10px] text-[#6b6b80]">PID {proc.pid} • {proc.task}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[11px] text-[#9494a8]">
                <span>CPU: {proc.cpu}</span>
                <span>RAM: {proc.ram}</span>
                <span className="rounded bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30 px-2 py-0.5 text-[9px] font-bold">
                  {proc.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
