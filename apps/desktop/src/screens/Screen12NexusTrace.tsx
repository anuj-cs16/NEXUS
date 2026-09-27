'use client';

import React, { useState } from 'react';
import { ScreenId, TraceEvent } from '../types/nexus';
import { INITIAL_TRACE } from '../data/mockData';

interface Screen12NexusTraceProps {
  onNavigate: (screen: ScreenId) => void;
}

export const Screen12NexusTrace: React.FC<Screen12NexusTraceProps> = ({
  onNavigate,
}) => {
  const [events] = useState<TraceEvent[]>(INITIAL_TRACE);
  const [expandedId, setExpandedId] = useState<string | null>('tr_02');

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#0a0a0f] p-8 space-y-6 select-none font-sans max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2a2a3a] pb-4">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#38bdf8]">
            SCREEN 12 — TRANSPARENCY & AUDIT ENGINE
          </div>
          <h2 className="text-xl font-black text-white mt-0.5">NEXUS Execution Trace</h2>
          <p className="text-xs text-[#9494a8] mt-1">
            Deterministic execution audit log showing exact tools, duration, workspace paths, and telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#22c55e]/15 border border-[#22c55e]/30 px-3 py-1 text-xs font-mono text-[#22c55e]">
            ✓ Zero Hidden Chain-of-Thought
          </span>
        </div>
      </div>

      {/* Trace Timeline List */}
      <div className="space-y-3 font-mono text-xs">
        {events.map((evt, idx) => {
          const isExpanded = expandedId === evt.id;
          const isCompleted = evt.status === 'completed';

          return (
            <div
              key={evt.id}
              className={`rounded-2xl border transition overflow-hidden shadow-lg ${
                isExpanded ? 'bg-[#161622] border-[#6366f1]/60' : 'bg-[#12121a] border-[#2a2a3a] hover:border-[#3a3a4a]'
              }`}
            >
              {/* Event Header Strip */}
              <div
                onClick={() => toggleExpand(evt.id)}
                className="p-4 flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className={`h-2 w-2 rounded-full ${isCompleted ? 'bg-[#22c55e]' : 'bg-[#818cf8] animate-ping'}`} />
                  <span className="text-[#818cf8] font-bold text-xs">{evt.timestamp}</span>
                  <span className="text-white font-bold font-sans text-xs">{evt.phase}</span>
                </div>

                <div className="flex items-center gap-3 text-[11px]">
                  <span className="rounded bg-[#1a1a25] border border-[#2a2a3a] px-2 py-0.5 text-[#34d399]">
                    Tool: {evt.toolUsed}
                  </span>
                  <span className="text-[#9494a8]">{evt.duration}</span>
                  <span className="text-[#6b6b80]">{isExpanded ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Action Description */}
              <div className="px-4 pb-3 text-xs text-[#9494a8] font-sans">
                {evt.action}
              </div>

              {/* Expandable Metadata JSON Tree */}
              {isExpanded && (
                <div className="p-4 border-t border-[#2a2a3a] bg-[#0a0a0f] space-y-2 font-mono text-[11px]">
                  <div className="text-[#6b6b80] uppercase tracking-wider text-[10px]">
                    EXPANDABLE AUDIT METADATA:
                  </div>
                  <div className="bg-[#12121a] p-3 rounded-xl border border-[#2a2a3a] text-[#818cf8] space-y-1">
                    {Object.entries(evt.metadata).map(([k, v]) => (
                      <div key={k} className="flex gap-2">
                        <span className="text-[#9494a8]">"{k}":</span>
                        <span className="text-[#34d399]">"{v}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
