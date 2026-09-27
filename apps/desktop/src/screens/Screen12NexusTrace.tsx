'use client';

import React, { useState } from 'react';
import { ScreenId, TraceEvent } from '../types/nexus';
import { INITIAL_TRACE } from '../data/mockData';
import { Search, Terminal, Activity, Shield, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

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
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#050B18] p-6 space-y-5 select-none font-mono max-w-5xl mx-auto w-full cyber-grid-bg text-[#EAF4FF]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1B2D52] pb-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#52E5FF] flex items-center gap-1.5">
            <Search className="h-3.5 w-3.5" /> SCREEN 12 — TRANSPARENCY & AUDIT ENGINE
          </div>
          <h2 className="text-lg font-black text-[#EAF4FF] tracking-wide mt-1">
            NEXUS Deterministic Execution Trace
          </h2>
          <p className="text-xs text-[#8FA6C8] mt-0.5">
            Cryptographic execution audit log showing exact tools, duration, workspace paths, and telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-md bg-[#111C35] border border-[#45E6B0]/40 px-3 py-1 text-xs text-[#45E6B0] font-bold shadow-[0_0_8px_rgba(69,230,176,0.2)]">
            ✓ ZERO HIDDEN CHAIN-OF-THOUGHT
          </span>
        </div>
      </div>

      {/* Trace Timeline List */}
      <div className="space-y-3 font-mono text-xs">
        {events.map((evt) => {
          const isExpanded = expandedId === evt.id;
          const isCompleted = evt.status === 'completed';

          return (
            <div
              key={evt.id}
              className={`cyber-panel rounded-xl border transition overflow-hidden shadow-[0_0_15px_rgba(82,229,255,0.05)] ${
                isExpanded ? 'bg-[#111C35] border-[#52E5FF]' : 'bg-[#0A1225] border-[#1B2D52] hover:border-[#1B2D52]/80'
              }`}
            >
              {/* Event Header Strip */}
              <div
                onClick={() => toggleExpand(evt.id)}
                className="p-3.5 flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className={`h-2 w-2 rounded-full ${isCompleted ? 'bg-[#45E6B0] shadow-[0_0_6px_#45E6B0]' : 'bg-[#52E5FF] animate-ping'}`} />
                  <span className="text-[#52E5FF] font-bold text-xs">{evt.timestamp}</span>
                  <span className="text-[#EAF4FF] font-bold text-xs">{evt.phase}</span>
                </div>

                <div className="flex items-center gap-3 text-[11px]">
                  <span className="rounded bg-[#050B18] border border-[#1B2D52] px-2 py-0.5 text-[#45E6B0] font-bold">
                    TOOL: {evt.toolUsed}
                  </span>
                  <span className="text-[#8FA6C8]">{evt.duration}</span>
                  <span className="text-[#647A9B]">{isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</span>
                </div>
              </div>

              {/* Action Description */}
              <div className="px-3.5 pb-3 text-xs text-[#8FA6C8] leading-relaxed">
                {evt.action}
              </div>

              {/* Expandable Metadata JSON Tree */}
              {isExpanded && (
                <div className="p-3.5 border-t border-[#1B2D52] bg-[#050B18] space-y-2 font-mono text-[11px]">
                  <div className="text-[#647A9B] uppercase tracking-wider text-[10px] font-bold">
                    AUDIT METADATA RECORD:
                  </div>
                  <div className="bg-[#0A1225] p-3 rounded-lg border border-[#1B2D52] text-[#52E5FF] space-y-1">
                    {Object.entries(evt.metadata).map(([k, v]) => (
                      <div key={k} className="flex gap-2">
                        <span className="text-[#8FA6C8]">&quot;{k}&quot;:</span>
                        <span className="text-[#45E6B0]">&quot;{v}&quot;</span>
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
