'use client';

import React, { useState } from 'react';
import { ScreenId, AppItem } from '../types/nexus';
import { INITIAL_APPS } from '../data/mockData';

interface Screen15AppsProps {
  onNavigate: (screen: ScreenId) => void;
  onRequestPermission: (appName: string, reason: string) => void;
}

export const Screen15Apps: React.FC<Screen15AppsProps> = ({
  onNavigate,
  onRequestPermission,
}) => {
  const [apps] = useState<AppItem[]>(INITIAL_APPS);
  const [activeTab, setActiveTab] = useState<'Running' | 'Recent' | 'Installed'>('Running');

  const handleAppAction = (appName: string, action: string) => {
    onRequestPermission(appName, `Allow NEXUS to perform action: ${action}`);
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#0a0a0f] p-8 space-y-6 select-none font-sans max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2a2a3a] pb-4">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#ec4899]">
            SCREEN 15 — APPLICATION ECOSYSTEM
          </div>
          <h2 className="text-xl font-black text-white mt-0.5">Desktop Application Governor</h2>
          <p className="text-xs text-[#9494a8] mt-1">
            Control, orchestrate, and bind desktop developer tools into autonomous agent workflows.
          </p>
        </div>

        <button
          onClick={() => onNavigate('08-automations')}
          className="px-3.5 py-1.5 rounded-xl bg-[#1a1a25] hover:bg-[#22222f] border border-[#2a2a3a] text-xs font-semibold text-[#818cf8] transition cursor-pointer"
        >
          View Automations →
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#2a2a3a] pb-3 text-xs">
        {(['Running', 'Recent', 'Installed'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-3.5 py-1.5 rounded-xl capitalize font-medium transition cursor-pointer ${
              activeTab === t
                ? 'bg-[#1a1a25] text-white border border-[#ec4899]/50 shadow-sm'
                : 'text-[#9494a8] hover:text-white hover:bg-[#1a1a25]/50'
            }`}
          >
            {t} Apps
          </button>
        ))}
      </div>

      {/* App Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {apps.map((app) => {
          const isRunning = app.status === 'running';

          return (
            <div
              key={app.id}
              className="p-5 rounded-2xl bg-[#12121a] border border-[#2a2a3a] hover:border-[#ec4899]/50 shadow-xl transition flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{app.icon}</span>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-[#ec4899] transition">
                        {app.name}
                      </h3>
                      <span className="text-[10px] text-[#6b6b80] font-mono">Last used: {app.lastUsed}</span>
                    </div>
                  </div>

                  <span
                    className={`rounded px-2 py-0.5 text-[9px] font-mono uppercase font-bold ${
                      isRunning
                        ? 'bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30'
                        : 'bg-[#2a2a3a] text-[#9494a8]'
                    }`}
                  >
                    {app.status}
                  </span>
                </div>

                <div className="bg-[#1a1a25] p-3 rounded-xl border border-[#2a2a3a] space-y-1 text-[11px] font-mono">
                  <div className="flex justify-between text-[#9494a8]">
                    <span>CPU / RAM:</span>
                    <span className="text-white">{app.cpu} • {app.memory}</span>
                  </div>
                  <div className="flex justify-between text-[#9494a8]">
                    <span>Related Tasks:</span>
                    <span className="text-[#818cf8] truncate max-w-[180px]">{app.relatedTasks[0]}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-[#2a2a3a] flex items-center justify-between text-xs">
                <button
                  onClick={() => handleAppAction(app.name, 'Add to Automation')}
                  className="text-[10px] font-mono text-[#818cf8] hover:underline cursor-pointer"
                >
                  + Add to Automation
                </button>

                <div className="flex items-center gap-2">
                  {isRunning ? (
                    <button
                      onClick={() => handleAppAction(app.name, 'Close Application')}
                      className="px-3 py-1 rounded-lg bg-[#ef4444]/15 hover:bg-[#ef4444]/30 text-[10px] font-mono text-[#ef4444] font-bold transition cursor-pointer"
                    >
                      Close App
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAppAction(app.name, 'Launch Application')}
                      className="px-3 py-1 rounded-lg bg-[#22c55e]/15 hover:bg-[#22c55e]/30 text-[10px] font-mono text-[#22c55e] font-bold transition cursor-pointer"
                    >
                      Launch
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
