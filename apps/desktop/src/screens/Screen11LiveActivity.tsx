'use client';

import React, { useState } from 'react';
import { ScreenId, ActivityItem } from '../types/nexus';
import { INITIAL_ACTIVITY } from '../data/mockData';

interface Screen11LiveActivityProps {
  onNavigate: (screen: ScreenId) => void;
}

export const Screen11LiveActivity: React.FC<Screen11LiveActivityProps> = ({
  onNavigate,
}) => {
  const [items] = useState<ActivityItem[]>(INITIAL_ACTIVITY);
  const [filter, setFilter] = useState<'all' | 'ai' | 'apps' | 'files' | 'tasks' | 'automations' | 'system'>('all');

  const filtered = items.filter((i) => (filter === 'all' ? true : i.category === filter));

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#0a0a0f] p-8 space-y-6 select-none font-sans max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2a2a3a] pb-4">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-[#ef4444] animate-ping" />
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#ef4444]">
              SCREEN 11 — REAL-TIME EVENT BUS
            </div>
            <h2 className="text-xl font-black text-white mt-0.5">Live Activity Center</h2>
          </div>
        </div>

        <button
          onClick={() => onNavigate('12-trace')}
          className="px-3.5 py-1.5 rounded-xl bg-[#1a1a25] hover:bg-[#22222f] border border-[#2a2a3a] text-xs font-semibold text-[#818cf8] transition cursor-pointer"
        >
          View NEXUS Trace Engine →
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#2a2a3a] pb-3 text-xs overflow-x-auto">
        {(['all', 'ai', 'apps', 'files', 'tasks', 'automations', 'system'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3.5 py-1.5 rounded-xl capitalize font-medium transition cursor-pointer ${
              filter === cat
                ? 'bg-[#1a1a25] text-white border border-[#6366f1]/50 shadow-sm'
                : 'text-[#9494a8] hover:text-white hover:bg-[#1a1a25]/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Activity Timeline List */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl bg-[#12121a] hover:bg-[#161622] border border-[#2a2a3a] hover:border-[#6366f1]/50 shadow-xl transition flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-[#1a1a25] border border-[#3a3a4a] flex items-center justify-center text-xl shrink-0 shadow-md">
                {item.icon}
              </div>
              <div>
                <div className="text-xs font-bold text-white">{item.title}</div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-[#6b6b80] mt-1">
                  <span className="uppercase text-[#818cf8]">[{item.category}]</span>
                  <span>•</span>
                  <span>{item.timeAgo}</span>
                </div>
              </div>
            </div>

            <span className="rounded bg-[#22c55e]/15 border border-[#22c55e]/30 px-2 py-0.5 text-[10px] font-mono text-[#22c55e] font-bold">
              VERIFIED
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
