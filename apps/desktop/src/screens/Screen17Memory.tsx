'use client';

import React, { useState } from 'react';
import { ScreenId, MemoryItem } from '../types/nexus';
import { INITIAL_MEMORIES } from '../data/mockData';

interface Screen17MemoryProps {
  onNavigate: (screen: ScreenId) => void;
  onSelectMemory: (mem: MemoryItem) => void;
}

export const Screen17Memory: React.FC<Screen17MemoryProps> = ({
  onNavigate,
  onSelectMemory,
}) => {
  const [memories, setMemories] = useState<MemoryItem[]>(INITIAL_MEMORIES);
  const [filter, setFilter] = useState<'All' | 'Project Context' | 'Preferences' | 'Important Information'>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleForget = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMemories((prev) => prev.filter((m) => m.id !== id));
    setToastMessage('Memory item permanently erased from local vector storage.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filtered = memories.filter((m) => (filter === 'All' ? true : m.category === filter));

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#0a0a0f] p-8 space-y-6 select-none font-sans max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2a2a3a] pb-4">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#ec4899]">
            SCREEN 17 — LONG-TERM KNOWLEDGE GRAPH
          </div>
          <h2 className="text-xl font-black text-white mt-0.5">NEXUS Memory Center</h2>
          <p className="text-xs text-[#9494a8] mt-1">
            Episodic memory, architectural decisions, and developer preferences stored locally in encrypted SQLite vectors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#ec4899]/15 border border-[#ec4899]/30 px-3 py-1 text-xs font-mono text-[#ec4899] font-bold">
            🔒 100% Local Vector Encryption
          </span>
        </div>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-[#ef4444]/15 border border-[#ef4444]/30 text-xs text-[#ef4444] animate-in fade-in duration-150">
          {toastMessage}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#2a2a3a] pb-3 text-xs">
        {(['All', 'Project Context', 'Preferences', 'Important Information'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3.5 py-1.5 rounded-xl capitalize font-medium transition cursor-pointer ${
              filter === cat
                ? 'bg-[#1a1a25] text-white border border-[#ec4899]/50 shadow-sm'
                : 'text-[#9494a8] hover:text-white hover:bg-[#1a1a25]/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Memory Items List */}
      <div className="space-y-3">
        {filtered.map((mem) => (
          <div
            key={mem.id}
            onClick={() => { onSelectMemory(mem); onNavigate('18-memory-detail'); }}
            className="p-5 rounded-2xl bg-[#12121a] hover:bg-[#161622] border border-[#2a2a3a] hover:border-[#ec4899]/60 shadow-xl transition flex flex-col justify-between space-y-3 cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-[#ec4899]/15 border border-[#ec4899]/30 px-2 py-0.2 text-[9px] font-mono text-[#f472b6] font-bold">
                    {mem.category}
                  </span>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#ec4899] transition">
                    {mem.title}
                  </h3>
                </div>
                <p className="text-xs text-[#9494a8] mt-1 leading-relaxed">{mem.description}</p>
              </div>

              <button
                onClick={(e) => handleForget(mem.id, e)}
                title="Forget / Erase memory permanently"
                className="px-2.5 py-1 rounded-lg bg-[#1a1a25] hover:bg-[#ef4444]/20 border border-[#2a2a3a] text-[10px] font-mono text-[#6b6b80] hover:text-[#ef4444] transition cursor-pointer"
              >
                Forget ✕
              </button>
            </div>

            <div className="pt-2 border-t border-[#2a2a3a] flex items-center justify-between text-[10px] font-mono text-[#6b6b80]">
              <span>Source: {mem.source}</span>
              <span>Saved: {mem.createdAt}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
