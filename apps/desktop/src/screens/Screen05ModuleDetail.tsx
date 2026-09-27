'use client';

import React from 'react';
import { ScreenId, NexusModule } from '../types/nexus';
import { INITIAL_MODULES } from '../data/mockData';

interface Screen05ModuleDetailProps {
  module?: NexusModule;
  onNavigate: (screen: ScreenId) => void;
}

export const Screen05ModuleDetail: React.FC<Screen05ModuleDetailProps> = ({
  module = INITIAL_MODULES[0],
  onNavigate,
}) => {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#0a0a0f] p-8 space-y-6 select-none font-sans max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2a2a3a] pb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('04-modules')}
            className="rounded-xl bg-[#1a1a25] hover:bg-[#22222f] border border-[#2a2a3a] px-3 py-2 text-xs text-[#9494a8] hover:text-white transition cursor-pointer"
          >
            ← Back to Network
          </button>
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center text-xl shadow-lg"
              style={{ backgroundColor: `${module.color}20`, border: `1px solid ${module.color}50` }}
            >
              {module.icon}
            </div>
            <div>
              <h2 className="text-xl font-black text-white">{module.name}</h2>
              <div className="text-xs text-[#9494a8]">{module.tagline}</div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('11-activity')}
            className="px-3 py-1.5 rounded-xl bg-[#1a1a25] hover:bg-[#22222f] border border-[#2a2a3a] text-xs text-[#9494a8] hover:text-white transition cursor-pointer"
          >
            View Activity Feed
          </button>
          <button
            onClick={() => onNavigate('21-settings')}
            className="px-3 py-1.5 rounded-xl bg-[#6366f1] hover:bg-[#818cf8] text-xs font-bold text-white shadow-md shadow-[#6366f1]/25 transition cursor-pointer"
          >
            Configure Module
          </button>
        </div>
      </div>

      {/* Active Workstation Banner */}
      <div className="rounded-2xl bg-[#12121a] border border-[#2a2a3a] p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#818cf8] uppercase">
            <span className="h-2 w-2 rounded-full bg-[#34d399] animate-ping" />
            CURRENT ACTIVE WORKLOAD
          </div>
          <span className="rounded bg-[#34d399]/15 border border-[#34d399]/30 px-2 py-0.5 text-[10px] font-mono text-[#34d399] font-bold">
            PROCESSING (AST PARSING)
          </span>
        </div>

        <div className="bg-[#1a1a25] p-4 rounded-xl border border-[#2a2a3a] space-y-2">
          <div className="text-xs font-bold text-white">
            “Analyzing project architecture and synthesizing rate limiter AST”
          </div>
          <p className="text-xs text-[#9494a8] leading-relaxed">
            Target files: <code>src/nexus/core/limiter.py</code>, <code>tests/test_limiter.py</code>. Executing tool: <code>patch_file</code> with atomic diff rollback.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-2 text-center text-xs font-mono">
          <div className="p-3 bg-[#0e0e16] rounded-xl border border-[#2a2a3a]">
            <div className="text-[#6b6b80] text-[10px] uppercase">LATENCY</div>
            <div className="text-base font-bold text-[#34d399] mt-0.5">{module.latencyMs} ms</div>
          </div>
          <div className="p-3 bg-[#0e0e16] rounded-xl border border-[#2a2a3a]">
            <div className="text-[#6b6b80] text-[10px] uppercase">SUCCESS RATE</div>
            <div className="text-base font-bold text-white mt-0.5">{module.successRate}</div>
          </div>
          <div className="p-3 bg-[#0e0e16] rounded-xl border border-[#2a2a3a]">
            <div className="text-[#6b6b80] text-[10px] uppercase">TASKS EXECUTED</div>
            <div className="text-base font-bold text-[#818cf8] mt-0.5">{module.tasksHandled}</div>
          </div>
        </div>
      </div>

      {/* Capabilities & Connected Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-[#12121a] border border-[#2a2a3a] p-5 shadow-xl space-y-3">
          <h3 className="text-xs font-bold text-[#818cf8] uppercase tracking-wider font-mono">
            CAPABILITIES & AST PRIMITIVES
          </h3>
          <div className="space-y-2">
            {module.capabilities.map((cap, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs text-[#e8e8ed]">
                <span className="text-[#34d399]">✓</span>
                <span>{cap}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-[#12121a] border border-[#2a2a3a] p-5 shadow-xl space-y-3">
          <h3 className="text-xs font-bold text-[#fbbf24] uppercase tracking-wider font-mono">
            CONNECTED AGENT TOOLS & BOUNDARIES
          </h3>
          <div className="space-y-2">
            {module.connectedTools.map((tool, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[#1a1a25] border border-[#2a2a3a] text-xs font-mono">
                <span className="text-white font-bold">{tool}</span>
                <span className="text-[10px] text-[#34d399]">Permitted</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
