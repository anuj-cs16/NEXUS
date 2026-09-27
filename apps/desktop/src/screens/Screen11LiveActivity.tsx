'use client';

import React, { useState } from 'react';
import { ScreenId, ActivityItem } from '../types/nexus';
import { INITIAL_ACTIVITY } from '../data/mockData';
import { Activity, Terminal, Shield, ArrowRight, CheckCircle2, Zap } from 'lucide-react';

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
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#050B18] p-6 space-y-5 select-none font-mono max-w-5xl mx-auto w-full cyber-grid-bg text-[#EAF4FF]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1B2D52] pb-4">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-[#52E5FF] animate-ping shadow-[0_0_8px_#52E5FF]" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#52E5FF] flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5" /> SCREEN 11 — REAL-TIME EVENT BUS TELEMETRY
            </div>
            <h2 className="text-lg font-black text-[#EAF4FF] tracking-wide mt-1">
              Live Operations & Event Feed
            </h2>
          </div>
        </div>

        <button
          onClick={() => onNavigate('12-trace')}
          className="px-3.5 py-1.5 rounded-lg bg-[#111C35] hover:bg-[#172544] border border-[#1B2D52] hover:border-[#52E5FF]/40 text-xs font-bold text-[#52E5FF] transition cursor-pointer flex items-center gap-1.5"
        >
          <span>NEXUS TRACE ENGINE</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1B2D52] pb-3 text-xs overflow-x-auto">
        {(['all', 'ai', 'apps', 'files', 'tasks', 'automations', 'system'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-lg uppercase tracking-wider font-bold transition cursor-pointer ${
              filter === cat
                ? 'bg-[#111C35] text-[#52E5FF] border border-[#52E5FF]/60 shadow-[0_0_10px_rgba(82,229,255,0.15)]'
                : 'text-[#8FA6C8] hover:text-[#EAF4FF] hover:bg-[#111C35]/50 border border-transparent'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Technical Operations Console Feed */}
      <div className="space-y-2.5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-3.5 rounded-xl bg-[#0A1225] hover:bg-[#111C35] border border-[#1B2D52] hover:border-[#52E5FF]/50 shadow-[0_0_15px_rgba(82,229,255,0.05)] transition flex items-center justify-between gap-4 group"
          >
            <div className="flex items-center gap-3.5">
              <div className="h-9 w-9 rounded-lg bg-[#111C35] border border-[#1B2D52] flex items-center justify-center text-lg shrink-0 shadow-inner group-hover:border-[#52E5FF]/40">
                {item.icon}
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-[#EAF4FF] group-hover:text-[#52E5FF] transition">
                  {item.title}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[#647A9B]">
                  <span className="uppercase text-[#52E5FF] font-bold">[{item.category}]</span>
                  <span>•</span>
                  <span>TIMESTAMP: {item.timeAgo}</span>
                  <span>•</span>
                  <span>ID: {item.id}</span>
                </div>
              </div>
            </div>

            <span className="rounded bg-[#45E6B0]/10 border border-[#45E6B0]/40 px-2.5 py-0.5 text-[10px] text-[#45E6B0] font-bold shadow-[0_0_6px_rgba(69,230,176,0.2)]">
              VERIFIED
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
