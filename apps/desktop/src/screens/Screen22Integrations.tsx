'use client';

import React, { useState } from 'react';
import { ScreenId, IntegrationItem } from '../types/nexus';
import { INITIAL_INTEGRATIONS } from '../data/mockData';

interface Screen22IntegrationsProps {
  onNavigate: (screen: ScreenId) => void;
  onRequestPermission: (appName: string, reason: string) => void;
}

export const Screen22Integrations: React.FC<Screen22IntegrationsProps> = ({
  onNavigate,
  onRequestPermission,
}) => {
  const [integrations, setIntegrations] = useState<IntegrationItem[]>(INITIAL_INTEGRATIONS);
  const [filter, setFilter] = useState<'All' | 'Development' | 'Productivity' | 'System' | 'AI'>('All');

  const toggleConnect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const item = integrations.find((i) => i.id === id);
    if (item && item.status === 'not_connected') {
      onRequestPermission(item.name, `Connect ${item.name} into the NEXUS multi-agent ecosystem.`);
    }
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              status: i.status === 'connected' ? 'not_connected' : 'connected',
              lastSynced: 'Just now',
            }
          : i
      )
    );
  };

  const filtered = integrations.filter((i) => (filter === 'All' ? true : i.category === filter));

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#0a0a0f] p-8 space-y-6 select-none font-sans max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2a2a3a] pb-4">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#818cf8]">
            SCREEN 22 — INTEGRATION ECOSYSTEM
          </div>
          <h2 className="text-xl font-black text-white mt-0.5">Connected Developer Tools</h2>
          <p className="text-xs text-[#9494a8] mt-1">
            Connect local IDEs, version control, container sandboxes, and desktop browsers.
          </p>
        </div>

        <span className="rounded-full bg-[#22c55e]/15 border border-[#22c55e]/30 px-3 py-1 text-xs font-mono text-[#22c55e] font-bold">
          5 of 6 Connected
        </span>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 border-b border-[#2a2a3a] pb-3 text-xs">
        {(['All', 'Development', 'Productivity', 'System', 'AI'] as const).map((cat) => (
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

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((item) => {
          const isConnected = item.status === 'connected';

          return (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-[#12121a] border border-[#2a2a3a] hover:border-[#6366f1]/50 shadow-xl transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <h3 className="text-sm font-bold text-white">{item.name}</h3>
                      <span className="text-[10px] text-[#6b6b80] font-mono">{item.category}</span>
                    </div>
                  </div>

                  <span
                    className={`rounded px-2 py-0.5 text-[9px] font-mono uppercase font-bold ${
                      isConnected
                        ? 'bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30'
                        : 'bg-[#2a2a3a] text-[#9494a8]'
                    }`}
                  >
                    {isConnected ? 'Connected' : 'Not Connected'}
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] font-mono text-[#6b6b80] uppercase">GRANTED PERMISSIONS:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.permissions.map((perm, pIdx) => (
                      <span
                        key={pIdx}
                        className="rounded bg-[#1a1a25] border border-[#2a2a3a] px-2 py-0.5 text-[10px] text-[#9494a8] font-mono"
                      >
                        ✓ {perm}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-3 border-t border-[#2a2a3a] flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono text-[#6b6b80]">Synced: {item.lastSynced}</span>

                <button
                  onClick={(e) => toggleConnect(item.id, e)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isConnected
                      ? 'bg-[#1a1a25] hover:bg-[#ef4444]/20 text-[#ef4444] border border-[#2a2a3a]'
                      : 'bg-[#6366f1] hover:bg-[#818cf8] text-white shadow-md shadow-[#6366f1]/20'
                  }`}
                >
                  {isConnected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
