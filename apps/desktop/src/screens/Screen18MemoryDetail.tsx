'use client';

import React from 'react';
import { ScreenId, MemoryItem } from '../types/nexus';
import { INITIAL_MEMORIES } from '../data/mockData';

interface Screen18MemoryDetailProps {
  memory?: MemoryItem;
  onNavigate: (screen: ScreenId) => void;
}

export const Screen18MemoryDetail: React.FC<Screen18MemoryDetailProps> = ({
  memory = INITIAL_MEMORIES[0],
  onNavigate,
}) => {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#0a0a0f] p-8 space-y-6 select-none font-sans max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2a2a3a] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('17-memory')}
            className="text-xs text-[#9494a8] hover:text-white transition cursor-pointer"
          >
            ← Memory Center
          </button>
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#ec4899]">
              SCREEN 18 — MEMORY ENTITY INSPECTOR
            </div>
            <h2 className="text-xl font-black text-white mt-0.5">{memory.title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('17-memory')}
            className="px-3 py-1.5 rounded-xl bg-[#ef4444]/15 hover:bg-[#ef4444]/30 border border-[#ef4444]/30 text-xs font-semibold text-[#ef4444] transition cursor-pointer"
          >
            Erase from Palace
          </button>
        </div>
      </div>

      {/* Main Details Card */}
      <div className="rounded-2xl bg-[#12121a] border border-[#2a2a3a] p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="rounded bg-[#ec4899]/15 border border-[#ec4899]/30 px-2.5 py-0.5 text-xs font-mono text-[#f472b6] font-bold">
            Category: {memory.category}
          </span>
          <span className="text-xs font-mono text-[#6b6b80]">Created: {memory.createdAt}</span>
        </div>

        <div>
          <h4 className="text-xs font-bold text-[#6b6b80] uppercase font-mono tracking-wider">
            STORED KNOWLEDGE CONTEXT
          </h4>
          <p className="text-sm text-white mt-1.5 leading-relaxed bg-[#1a1a25] p-4 rounded-xl border border-[#2a2a3a]">
            {memory.description}
          </p>
        </div>

        {/* Related Information / Entities */}
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-bold text-[#6b6b80] uppercase font-mono tracking-wider">
            LINKED ARTIFACTS & ENTITIES
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {memory.relatedInfo.map((info, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#1a1a25] border border-[#2a2a3a] text-xs font-mono text-[#818cf8] flex items-center gap-2"
              >
                <span>🔗</span>
                <span className="truncate">{info}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Where this memory is being used */}
        <div className="space-y-2 pt-3 border-t border-[#2a2a3a]">
          <h4 className="text-xs font-bold text-[#34d399] uppercase font-mono tracking-wider">
            ACTIVE CONSUMERS IN MULTI-AGENT PIPELINE
          </h4>
          <div className="text-xs text-[#9494a8] leading-relaxed">
            Injected automatically into system prompts for <strong className="text-white">NEXUS Planner</strong> and <strong className="text-white">NEXUS Builder</strong> agents during task execution.
          </div>
        </div>
      </div>
    </div>
  );
};
