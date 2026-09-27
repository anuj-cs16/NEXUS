'use client';

import React from 'react';
import { ScreenId } from '../types/nexus';

interface AppSidebarProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  unreadCount: number;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentScreen,
  onNavigate,
  unreadCount,
}) => {
  const navSections = [
    {
      title: 'CORE ENVIRONMENT',
      items: [
        { id: '01-home' as ScreenId, label: 'Home / Core', icon: '🏠', badge: undefined },
        { id: '02-command' as ScreenId, label: 'AI Command', icon: '💬', badge: 'PRO' },
        { id: '11-activity' as ScreenId, label: 'Live Activity', icon: '⚡', badge: 'LIVE' },
        { id: '12-trace' as ScreenId, label: 'NEXUS Trace', icon: '🔍', badge: undefined },
      ],
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { id: '04-modules' as ScreenId, label: 'AI Modules', icon: '🤖', badge: '7' },
        { id: '06-tasks' as ScreenId, label: 'Tasks & Sprints', icon: '📋', badge: '3' },
        { id: '08-automations' as ScreenId, label: 'Automations', icon: '⚙️', badge: '2' },
        { id: '17-memory' as ScreenId, label: 'Memory Center', icon: '🧠', badge: undefined },
      ],
    },
    {
      title: 'WORKSPACE & OS',
      items: [
        { id: '13-files' as ScreenId, label: 'Files Explorer', icon: '📁', badge: undefined },
        { id: '15-apps' as ScreenId, label: 'Applications', icon: '💻', badge: '4' },
        { id: '16-system' as ScreenId, label: 'System Control', icon: '🖥️', badge: '12%' },
        { id: '19-insights' as ScreenId, label: 'Productivity Insights', icon: '📈', badge: '+3.4h' },
      ],
    },
    {
      title: 'SYSTEM & CONFIG',
      items: [
        { id: '20-notifications' as ScreenId, label: 'Notifications', icon: '🔔', badge: unreadCount > 0 ? String(unreadCount) : undefined },
        { id: '22-integrations' as ScreenId, label: 'Integrations', icon: '🔌', badge: '6' },
        { id: '21-settings' as ScreenId, label: 'Settings', icon: '⚙️', badge: undefined },
      ],
    },
  ];

  return (
    <aside className="w-64 border-r border-[#2a2a3a] bg-[#12121a] flex flex-col shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[#2a2a3a]">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onNavigate('01-home')}>
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-[#6366f1] via-[#818cf8] to-[#a855f7] flex items-center justify-center shadow-lg shadow-[#6366f1]/20 ring-1 ring-white/20">
            <span className="font-mono font-black text-sm text-white">N</span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono font-bold tracking-wider text-sm bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
              NEXUS
            </span>
            <span className="text-[10px] text-[#9494a8] font-mono">Autonomous AI OS</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" />
          <span className="text-[10px] font-mono font-semibold text-[#22c55e]">ONLINE</span>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <div className="px-2 text-[10px] font-mono font-bold tracking-wider text-[#6b6b80] uppercase">
              {section.title}
            </div>
            {section.items.map((item) => {
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-[#1a1a25] text-white border border-[#6366f1]/50 shadow-sm shadow-[#6366f1]/10'
                      : 'text-[#9494a8] hover:bg-[#1a1a25]/60 hover:text-[#e8e8ed]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                        item.badge === 'LIVE'
                          ? 'bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30 animate-pulse'
                          : isActive
                          ? 'bg-[#6366f1]/20 text-[#818cf8]'
                          : 'bg-[#2a2a3a] text-[#9494a8]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom User / Quick Action Profile */}
      <div className="p-3 border-t border-[#2a2a3a] bg-[#0e0e16] flex items-center justify-between">
        <div
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition"
          onClick={() => onNavigate('30-profile-menu')}
        >
          <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-[#6366f1] to-[#ec4899] flex items-center justify-center font-bold text-xs text-white">
            U
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-white">Alex Developer</span>
            <span className="text-[10px] text-[#6b6b80] font-mono">Pro Workspace</span>
          </div>
        </div>

        <button
          onClick={() => onNavigate('03-palette')}
          title="Open Command Palette (Ctrl+K)"
          className="rounded border border-[#2a2a3a] bg-[#1a1a25] px-1.5 py-0.5 text-[10px] font-mono text-[#818cf8] hover:bg-[#22222f] transition cursor-pointer"
        >
          ⌘K
        </button>
      </div>
    </aside>
  );
};
