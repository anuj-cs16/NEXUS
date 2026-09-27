'use client';

import React, { useState } from 'react';
import { ScreenId, AutomationWorkflow } from '../types/nexus';
import { INITIAL_AUTOMATIONS } from '../data/mockData';

interface Screen08AutomationsProps {
  onNavigate: (screen: ScreenId) => void;
  onSelectAutomation: (workflow: AutomationWorkflow) => void;
}

export const Screen08Automations: React.FC<Screen08AutomationsProps> = ({
  onNavigate,
  onSelectAutomation,
}) => {
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>(INITIAL_AUTOMATIONS);
  const [tab, setTab] = useState<'all' | 'active' | 'scheduled' | 'templates'>('all');

  const handleToggle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, status: w.status === 'paused' ? 'active' : 'paused' } : w
      )
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#0a0a0f] p-8 space-y-6 select-none font-sans max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2a2a3a] pb-4">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#fbbf24]">
            SCREEN 08 — WORKFLOW AUTOMATION
          </div>
          <h2 className="text-xl font-black text-white mt-0.5">Automations & Background Daemons</h2>
          <p className="text-xs text-[#9494a8] mt-1">
            Reactive event pipelines, cron schedules, and multi-app orchestration engines.
          </p>
        </div>

        <button
          onClick={() => onNavigate('09-automation-builder')}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] hover:opacity-90 text-xs font-bold text-black shadow-lg shadow-[#fbbf24]/20 flex items-center gap-2 transition cursor-pointer"
        >
          <span>+ Visual Workflow Builder</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#2a2a3a] pb-3 text-xs">
        {(['all', 'active', 'scheduled', 'templates'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3.5 py-1.5 rounded-xl capitalize font-medium transition cursor-pointer ${
              tab === t
                ? 'bg-[#1a1a25] text-white border border-[#fbbf24]/50 shadow-sm'
                : 'text-[#9494a8] hover:text-white hover:bg-[#1a1a25]/50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Automations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {workflows.map((wf) => {
          const isPaused = wf.status === 'paused';

          return (
            <div
              key={wf.id}
              onClick={() => { onSelectAutomation(wf); onNavigate('10-automation-run'); }}
              className={`rounded-2xl border p-5 shadow-xl transition flex flex-col justify-between cursor-pointer space-y-4 ${
                isPaused
                  ? 'bg-[#12121a]/60 border-[#2a2a3a] opacity-75'
                  : 'bg-[#12121a] border-[#2a2a3a] hover:border-[#fbbf24]/60 hover:shadow-2xl hover:shadow-[#fbbf24]/10'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#fbbf24] font-bold">
                    {wf.trigger}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-[9px] font-mono uppercase font-bold ${
                      isPaused
                        ? 'bg-[#2a2a3a] text-[#9494a8]'
                        : 'bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30'
                    }`}
                  >
                    {wf.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white">{wf.name}</h3>
                  <p className="text-xs text-[#9494a8] mt-1 leading-relaxed line-clamp-2">
                    {wf.description}
                  </p>
                </div>

                {/* Flow Node Visual Strip */}
                <div className="flex items-center gap-1.5 py-2 overflow-x-auto text-[10px] font-mono">
                  {wf.nodes.map((node, nIdx) => (
                    <React.Fragment key={node.id}>
                      <span className="rounded bg-[#1a1a25] border border-[#2a2a3a] px-2 py-1 text-white truncate max-w-[120px]">
                        {node.icon} {node.label.split(' ')[0]}
                      </span>
                      {nIdx < wf.nodes.length - 1 && <span className="text-[#6b6b80]">➔</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Action Controls */}
              <div className="pt-3 border-t border-[#2a2a3a] flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono text-[#6b6b80]">{wf.lastRun}</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleToggle(wf.id, e)}
                    className="px-2.5 py-1 rounded-lg bg-[#1a1a25] hover:bg-[#22222f] border border-[#2a2a3a] text-[10px] font-mono text-[#9494a8] hover:text-white transition cursor-pointer"
                  >
                    {isPaused ? '▶ Resume' : '⏸ Pause'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectAutomation(wf);
                      onNavigate('09-automation-builder');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#fbbf24]/15 hover:bg-[#fbbf24] text-[10px] font-mono text-[#fbbf24] hover:text-black font-bold transition cursor-pointer"
                  >
                    Edit Graph →
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
