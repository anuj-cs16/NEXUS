'use client';

import React from 'react';
import { ScreenId } from '../types/nexus';
import {
  Terminal,
  Activity,
  Search,
  Cpu,
  Boxes,
  ListTodo,
  Workflow,
  Brain,
  FolderTree,
  AppWindow,
  Sliders,
  TrendingUp,
  Bell,
  Plug,
  Settings,
  ShieldAlert,
} from 'lucide-react';

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
      title: 'COMMAND & CONTROL',
      items: [
        { id: '01-home' as ScreenId, label: 'Command Center', icon: <Terminal className="h-4 w-4 text-[#52E5FF]" />, badge: 'LIVE' },
        { id: '02-command' as ScreenId, label: 'AI Console', icon: <Cpu className="h-4 w-4 text-[#9B7CFF]" />, badge: 'AGENTS' },
        { id: '11-activity' as ScreenId, label: 'Live Operations', icon: <Activity className="h-4 w-4 text-[#45E6B0]" />, badge: undefined },
        { id: '12-trace' as ScreenId, label: 'NEXUS Trace', icon: <Search className="h-4 w-4 text-[#398BFF]" />, badge: undefined },
      ],
    },
    {
      title: 'INTELLIGENCE MODULES',
      items: [
        { id: '04-modules' as ScreenId, label: 'Active Modules', icon: <Boxes className="h-4 w-4 text-[#52E5FF]" />, badge: '7 ACTIVE' },
        { id: '06-tasks' as ScreenId, label: 'Task Execution', icon: <ListTodo className="h-4 w-4 text-[#FFC76A]" />, badge: '3' },
        { id: '08-automations' as ScreenId, label: 'Automations', icon: <Workflow className="h-4 w-4 text-[#9B7CFF]" />, badge: '2' },
        { id: '17-memory' as ScreenId, label: 'Memory Palace', icon: <Brain className="h-4 w-4 text-[#C4A2FF]" />, badge: undefined },
      ],
    },
    {
      title: 'WORKSPACE & SYSTEM',
      items: [
        { id: '13-files' as ScreenId, label: 'File Matrix', icon: <FolderTree className="h-4 w-4 text-[#398BFF]" />, badge: undefined },
        { id: '15-apps' as ScreenId, label: 'Tool Ecosystem', icon: <AppWindow className="h-4 w-4 text-[#52E5FF]" />, badge: '4 RUNNING' },
        { id: '16-system' as ScreenId, label: 'System Control', icon: <Sliders className="h-4 w-4 text-[#45E6B0]" />, badge: '14%' },
        { id: '19-insights' as ScreenId, label: 'Telemetry & Stats', icon: <TrendingUp className="h-4 w-4 text-[#FFC76A]" />, badge: undefined },
      ],
    },
    {
      title: 'SECURITY & CONFIG',
      items: [
        { id: '20-notifications' as ScreenId, label: 'Alerts & Events', icon: <Bell className="h-4 w-4 text-[#FF647C]" />, badge: unreadCount > 0 ? String(unreadCount) : undefined },
        { id: '22-integrations' as ScreenId, label: 'Integrations', icon: <Plug className="h-4 w-4 text-[#9B7CFF]" />, badge: '6' },
        { id: '21-settings' as ScreenId, label: 'System Settings', icon: <Settings className="h-4 w-4 text-[#8FA6C8]" />, badge: undefined },
      ],
    },
  ];

  return (
    <aside className="w-64 border-r border-[#1B2D52] bg-[#0A1225] flex flex-col shrink-0 select-none text-[#EAF4FF]">
      {/* Workstation Brand Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[#1B2D52]">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onNavigate('01-home')}>
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-[#050B18] via-[#111C35] to-[#172544] border border-[#52E5FF]/60 flex items-center justify-center shadow-[0_0_12px_rgba(82,229,255,0.25)]">
            <span className="font-mono font-black text-xs text-[#52E5FF] tracking-wider">NX</span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono font-bold tracking-widest text-sm text-[#EAF4FF] flex items-center gap-1">
              NEXUS <span className="text-[10px] text-[#52E5FF] font-semibold">OPS</span>
            </span>
            <span className="text-[9px] text-[#647A9B] font-mono tracking-wider">AI COMMAND CENTER</span>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-[#050B18] border border-[#1B2D52] px-2 py-0.5 rounded">
          <span className="h-1.5 w-1.5 rounded-full bg-[#45E6B0] shadow-[0_0_6px_#45E6B0] animate-pulse" />
          <span className="text-[9px] font-mono font-bold text-[#45E6B0]">ONLINE</span>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <div className="px-2 text-[9px] font-mono font-bold tracking-widest text-[#647A9B] uppercase">
              {section.title}
            </div>
            {section.items.map((item) => {
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer ${
                    isActive
                      ? 'bg-[#111C35] text-[#52E5FF] border border-[#52E5FF]/60 shadow-[0_0_10px_rgba(82,229,255,0.15)] font-semibold'
                      : 'text-[#8FA6C8] hover:bg-[#111C35]/60 hover:text-[#EAF4FF] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span className="tracking-wide">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                        item.badge === 'LIVE'
                          ? 'bg-[#52E5FF]/10 text-[#52E5FF] border-[#52E5FF]/40 shadow-[0_0_6px_rgba(82,229,255,0.2)]'
                          : item.badge === 'AGENTS'
                          ? 'bg-[#9B7CFF]/10 text-[#9B7CFF] border-[#9B7CFF]/40'
                          : 'bg-[#050B18] text-[#8FA6C8] border-[#1B2D52]'
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

      {/* Node Telemetry Status Footer */}
      <div className="p-3 border-t border-[#1B2D52] bg-[#050B18] flex items-center justify-between text-[10px] font-mono text-[#647A9B]">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-[#52E5FF] animate-pulse" />
          <span className="text-[#8FA6C8]">WORKSTATION #01</span>
        </div>
        <span className="text-[#52E5FF]">v1.0.0</span>
      </div>
    </aside>
  );
};
