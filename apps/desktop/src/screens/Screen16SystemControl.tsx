'use client';

import React from 'react';
import { ScreenId } from '../types/nexus';
import { Sliders, Cpu, Activity, HardDrive, Zap, Shield, Server } from 'lucide-react';

interface Screen16SystemControlProps {
  onNavigate: (screen: ScreenId) => void;
}

export const Screen16SystemControl: React.FC<Screen16SystemControlProps> = ({
  onNavigate,
}) => {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#050B18] p-6 space-y-5 select-none font-mono max-w-5xl mx-auto w-full cyber-grid-bg text-[#EAF4FF]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1B2D52] pb-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#52E5FF] flex items-center gap-1.5">
            <Sliders className="h-3.5 w-3.5" /> SCREEN 16 — HARDWARE & PROCESS GOVERNOR
          </div>
          <h2 className="text-lg font-black text-[#EAF4FF] tracking-wide mt-1">
            Host System Awareness & Hardware Telemetry
          </h2>
          <p className="text-xs text-[#8FA6C8] mt-0.5">
            Real-time process sandboxing, GPU VRAM allocation, and host resource governance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-md bg-[#111C35] border border-[#45E6B0]/40 px-3 py-1 text-xs text-[#45E6B0] font-bold shadow-[0_0_8px_rgba(69,230,176,0.2)]">
            HEALTH: NOMINAL (0 THROTTLING)
          </span>
        </div>
      </div>

      {/* Hardware Utilization Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="cyber-panel p-4 bg-[#0A1225] border border-[#1B2D52] space-y-2">
          <div className="flex justify-between text-xs text-[#647A9B]">
            <span>CPU UTILIZATION</span>
            <span className="text-[#45E6B0] font-bold">14.2%</span>
          </div>
          <div className="text-xl font-black text-[#EAF4FF]">16 Cores</div>
          <div className="w-full bg-[#050B18] h-1.5 rounded-full overflow-hidden border border-[#1B2D52]">
            <div className="bg-[#45E6B0] h-full w-[14%] shadow-[0_0_8px_#45E6B0]" />
          </div>
        </div>

        <div className="cyber-panel p-4 bg-[#0A1225] border border-[#1B2D52] space-y-2">
          <div className="flex justify-between text-xs text-[#647A9B]">
            <span>SYSTEM RAM</span>
            <span className="text-[#52E5FF] font-bold">4.2 / 32 GB</span>
          </div>
          <div className="text-xl font-black text-[#EAF4FF]">13% Active</div>
          <div className="w-full bg-[#050B18] h-1.5 rounded-full overflow-hidden border border-[#1B2D52]">
            <div className="bg-[#52E5FF] h-full w-[13%] shadow-[0_0_8px_#52E5FF]" />
          </div>
        </div>

        <div className="cyber-panel p-4 bg-[#0A1225] border border-[#1B2D52] space-y-2">
          <div className="flex justify-between text-xs text-[#647A9B]">
            <span>GPU VRAM</span>
            <span className="text-[#9B7CFF] font-bold">8.4 / 24 GB</span>
          </div>
          <div className="text-xl font-black text-[#EAF4FF]">RTX 4090</div>
          <div className="w-full bg-[#050B18] h-1.5 rounded-full overflow-hidden border border-[#1B2D52]">
            <div className="bg-[#9B7CFF] h-full w-[35%] shadow-[0_0_8px_#9B7CFF]" />
          </div>
        </div>

        <div className="cyber-panel p-4 bg-[#0A1225] border border-[#1B2D52] space-y-2">
          <div className="flex justify-between text-xs text-[#647A9B]">
            <span>STORAGE</span>
            <span className="text-[#FFC76A] font-bold">1.2 / 50 GB</span>
          </div>
          <div className="text-xl font-black text-[#EAF4FF]">SQLite WAL</div>
          <div className="w-full bg-[#050B18] h-1.5 rounded-full overflow-hidden border border-[#1B2D52]">
            <div className="bg-[#FFC76A] h-full w-[2%] shadow-[0_0_8px_#FFC76A]" />
          </div>
        </div>
      </div>

      {/* AI Workload & Active Agent Processes */}
      <div className="cyber-panel p-5 bg-[#0A1225] border border-[#1B2D52] space-y-3.5 shadow-[0_0_15px_rgba(82,229,255,0.05)]">
        <h3 className="text-xs font-bold text-[#52E5FF] uppercase tracking-widest">
          ACTIVE AI AGENT PROCESS GOVERNANCE
        </h3>

        <div className="space-y-2 text-xs">
          {[
            { name: 'NEXUS Planner Agent', pid: '20412', status: 'Running', cpu: '4.2%', ram: '142 MB', task: 'Synthesizing DAG execution steps' },
            { name: 'Ollama Inference Engine', pid: '8192', status: 'Active (GPU)', cpu: '2.1%', ram: '8,400 MB', task: 'qwen2.5-coder:7b stream' },
            { name: 'FastAPI Backend Engine', pid: '10940', status: 'Listening', cpu: '0.1%', ram: '88 MB', task: 'http://127.0.0.1:8000 (WAL mode)' },
            { name: 'EventBus WebSocket Streamer', pid: '10941', status: 'Streaming', cpu: '0.0%', ram: '14 MB', task: '3 active subscribers connected' },
          ].map((proc, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg bg-[#111C35] border border-[#1B2D52] hover:border-[#52E5FF]/40 transition"
            >
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#45E6B0] shadow-[0_0_6px_#45E6B0]" />
                <div>
                  <div className="font-bold text-[#EAF4FF] flex items-center gap-2">
                    <span>{proc.name}</span>
                    <span className="text-[10px] text-[#647A9B]">PID:{proc.pid}</span>
                  </div>
                  <div className="text-[10px] text-[#8FA6C8]">{proc.task}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[11px] text-[#8FA6C8]">
                <span>CPU: <strong className="text-[#EAF4FF]">{proc.cpu}</strong></span>
                <span>RAM: <strong className="text-[#EAF4FF]">{proc.ram}</strong></span>
                <span className="px-2 py-0.5 rounded bg-[#050B18] text-[#52E5FF] border border-[#1B2D52]">
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
