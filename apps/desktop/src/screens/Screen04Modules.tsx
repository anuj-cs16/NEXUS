'use client';

import React, { useState } from 'react';
import { ScreenId, NexusModule } from '../types/nexus';
import { INITIAL_MODULES } from '../data/mockData';

interface Screen04ModulesProps {
  onNavigate: (screen: ScreenId) => void;
  onSelectModule: (mod: NexusModule) => void;
}

export const Screen04Modules: React.FC<Screen04ModulesProps> = ({
  onNavigate,
  onSelectModule,
}) => {
  const [modules, setModules] = useState<NexusModule[]>(INITIAL_MODULES);

  const toggleModule = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setModules((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status: m.status === 'disabled' ? 'active' : 'disabled' } : m
      )
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#0a0a0f] p-8 space-y-6 select-none font-sans max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2a2a3a] pb-4">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#818cf8]">
            SCREEN 04 — INTELLIGENCE ARCHITECTURE
          </div>
          <h2 className="text-xl font-black text-white mt-0.5">NEXUS AI Module Network</h2>
          <p className="text-xs text-[#9494a8] mt-1">
            Autonomous multi-agent collective orchestrating reasoning, synthesis, verification, and memory recall.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#1a1a25] border border-[#2a2a3a] px-3 py-1 text-xs font-mono text-[#34d399]">
            7 of 7 Modules Active
          </span>
        </div>
      </div>

      {/* Visual Neural Network Topology Diagram */}
      <div className="rounded-2xl bg-gradient-to-b from-[#12121a] to-[#0e0e16] border border-[#2a2a3a] p-5 shadow-xl space-y-3">
        <div className="text-xs font-bold font-mono text-[#818cf8] uppercase">
          INTER-MODULE EVENT BUS TOPOLOGY
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 py-4 text-xs font-mono">
          {modules.map((m, idx) => (
            <React.Fragment key={m.id}>
              <div
                onClick={() => { onSelectModule(m); onNavigate('05-module-detail'); }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#1a1a25] border border-[#3a3a4a] hover:border-[#6366f1] cursor-pointer transition shadow-md hover:scale-105"
              >
                <span>{m.icon}</span>
                <span className="font-bold text-white text-xs">{m.name.replace('NEXUS ', '')}</span>
                <span className={`h-2 w-2 rounded-full ${m.status === 'processing' ? 'bg-[#34d399] animate-ping' : m.status === 'active' ? 'bg-[#22c55e]' : 'bg-[#6b6b80]'}`} />
              </div>
              {idx < modules.length - 1 && (
                <span className="text-[#6366f1] font-black opacity-60">⇄</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {modules.map((mod) => {
          const isDisabled = mod.status === 'disabled';
          return (
            <div
              key={mod.id}
              onClick={() => { onSelectModule(mod); onNavigate('05-module-detail'); }}
              className={`rounded-2xl border p-5 shadow-xl transition flex flex-col justify-between cursor-pointer group ${
                isDisabled
                  ? 'bg-[#12121a]/50 border-[#2a2a3a] opacity-60'
                  : 'bg-[#12121a] border-[#2a2a3a] hover:border-[#6366f1]/60 hover:shadow-2xl hover:shadow-[#6366f1]/10'
              }`}
            >
              <div className="space-y-3">
                {/* Card Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center text-xl shadow-md"
                      style={{ backgroundColor: `${mod.color}15`, border: `1px solid ${mod.color}40` }}
                    >
                      {mod.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-[#818cf8] transition">
                        {mod.name}
                      </h3>
                      <div className="text-[10px] text-[#6b6b80] font-mono">{mod.tasksHandled} tasks handled</div>
                    </div>
                  </div>

                  <span
                    className={`rounded px-2 py-0.5 text-[9px] font-mono uppercase font-bold ${
                      mod.status === 'processing'
                        ? 'bg-[#34d399]/20 text-[#34d399] border border-[#34d399]/30 animate-pulse'
                        : mod.status === 'active'
                        ? 'bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30'
                        : 'bg-[#2a2a3a] text-[#9494a8]'
                    }`}
                  >
                    {mod.status}
                  </span>
                </div>

                <p className="text-xs text-[#9494a8] leading-relaxed line-clamp-2">
                  {mod.description}
                </p>

                {/* Capabilities Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {mod.capabilities.slice(0, 3).map((cap, cIdx) => (
                    <span
                      key={cIdx}
                      className="rounded bg-[#1a1a25] border border-[#2a2a3a] px-2 py-0.5 text-[10px] text-[#9494a8] font-mono"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-3 border-t border-[#2a2a3a] flex items-center justify-between text-xs">
                <span className="text-[10px] text-[#6b6b80] font-mono">Last: {mod.lastActivity}</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => toggleModule(mod.id, e)}
                    className="px-2 py-1 rounded bg-[#1a1a25] hover:bg-[#22222f] border border-[#2a2a3a] text-[10px] font-mono text-[#9494a8] hover:text-white transition cursor-pointer"
                  >
                    {isDisabled ? 'Enable' : 'Disable'}
                  </button>
                  <button
                    className="px-2.5 py-1 rounded bg-[#6366f1]/20 hover:bg-[#6366f1] text-[10px] font-mono text-[#818cf8] hover:text-white transition cursor-pointer"
                  >
                    Configure →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
