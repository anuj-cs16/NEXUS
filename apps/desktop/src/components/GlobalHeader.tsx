'use client';

import React, { useState, useEffect } from 'react';
import { ScreenId } from '../types/nexus';
import { Terminal, Shield, Activity, Bell, Search, Layers, Cpu } from 'lucide-react';

interface GlobalHeaderProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  onOpenPalette: () => void;
  onOpenGlobalSearch: () => void;
  onOpenOverlay: () => void;
  unreadCount: number;
  ollamaConnected: boolean;
  activeModel: string;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  currentScreen,
  onNavigate,
  onOpenPalette,
  onOpenGlobalSearch,
  onOpenOverlay,
  unreadCount,
  ollamaConnected,
  activeModel,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-14 border-b border-[#1B2D52] bg-[#0A1225] px-5 flex items-center justify-between shrink-0 select-none z-20 text-[#EAF4FF]">
      {/* Left: Global Command Console Input */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <div
          onClick={onOpenPalette}
          className="flex-1 flex items-center justify-between bg-[#111C35] border border-[#1B2D52] hover:border-[#52E5FF]/60 rounded-lg px-3.5 py-1.5 text-xs text-[#8FA6C8] cursor-pointer transition shadow-inner group"
        >
          <div className="flex items-center gap-2">
            <span className="text-[#52E5FF] group-hover:scale-110 transition drop-shadow-[0_0_8px_#52E5FF]">⚡</span>
            <span className="font-mono text-[11px] tracking-wide text-[#8FA6C8] group-hover:text-[#EAF4FF]">
              COMMAND_LINE: Ask NEXUS or execute tool...
            </span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded bg-[#050B18] border border-[#1B2D52] px-2 py-0.5 text-[10px] font-mono text-[#52E5FF]">
            <span>CTRL</span> + <span>K</span>
          </kbd>
        </div>

        <button
          onClick={onOpenGlobalSearch}
          title="Universal Search (Files, AST, Tasks, Memory)"
          className="rounded-lg bg-[#111C35] hover:bg-[#172544] border border-[#1B2D52] hover:border-[#52E5FF]/40 p-2 text-xs text-[#8FA6C8] hover:text-[#52E5FF] transition cursor-pointer"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>

      {/* Center: Live Workstation Telemetry Status */}
      <div className="hidden xl:flex items-center gap-6 text-[11px] font-mono">
        <div className="flex items-center gap-2 text-[#8FA6C8]">
          <span className="text-[#647A9B]">WORKSPACE:</span>
          <span className="text-[#EAF4FF] font-semibold tracking-wider">NEXUS_CORE_DEV</span>
        </div>
        <div className="h-3 w-px bg-[#1B2D52]" />
        <div className="flex items-center gap-2">
          <span className="text-[#647A9B]">ENGINE:</span>
          <span className="text-[#52E5FF] font-bold flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#52E5FF] animate-pulse" />
            {activeModel}
          </span>
        </div>
        <div className="h-3 w-px bg-[#1B2D52]" />
        <div className="flex items-center gap-2 text-[#8FA6C8]">
          <span className="text-[#647A9B]">LINK:</span>
          <span className="text-[#45E6B0] font-semibold">mTLS (14ms)</span>
        </div>
      </div>

      {/* Right: Technical Controls, Clock & Profile */}
      <div className="flex items-center gap-3">
        {/* Monospace Live System Clock */}
        <div className="hidden sm:flex items-center gap-1.5 bg-[#050B18] border border-[#1B2D52] px-2.5 py-1 rounded-md text-[11px] font-mono text-[#52E5FF]">
          <Activity className="h-3 w-3 text-[#52E5FF] animate-pulse" />
          <span>{currentTime || '00:00:00'}</span>
          <span className="text-[9px] text-[#647A9B]">UTC</span>
        </div>

        {/* Ollama Engine Health Status Pill */}
        <div className="flex items-center gap-1.5 rounded-md bg-[#111C35] border border-[#1B2D52] px-2.5 py-1 text-[11px] font-mono">
          <span className={`h-2 w-2 rounded-full ${ollamaConnected ? 'bg-[#45E6B0] shadow-[0_0_6px_#45E6B0]' : 'bg-[#FF647C]'}`} />
          <span className="text-[#8FA6C8]">LLM:</span>
          <span className={ollamaConnected ? 'text-[#45E6B0] font-bold' : 'text-[#FF647C] font-bold'}>
            {ollamaConnected ? 'ACTIVE' : 'OFFLINE'}
          </span>
        </div>

        {/* Floating Mini Overlay Widget Trigger */}
        <button
          onClick={onOpenOverlay}
          title="Launch Floating Desktop Quick Overlay (Screen 31)"
          className="hidden md:flex items-center gap-1.5 rounded-md bg-[#111C35] hover:bg-[#172544] border border-[#1B2D52] hover:border-[#52E5FF]/40 px-2.5 py-1 text-xs text-[#8FA6C8] hover:text-[#52E5FF] transition cursor-pointer"
        >
          <Layers className="h-3.5 w-3.5" />
          <span className="text-[11px] font-mono">HUD</span>
        </button>

        {/* Notifications Icon with Cyan/Red Glow Badge */}
        <button
          onClick={() => onNavigate('20-notifications')}
          className="relative rounded-md bg-[#111C35] hover:bg-[#172544] border border-[#1B2D52] hover:border-[#52E5FF]/40 p-2 text-xs text-[#8FA6C8] hover:text-[#52E5FF] transition cursor-pointer"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-[#FF647C] text-[9px] font-mono font-bold text-white flex items-center justify-center border border-[#050B18] shadow-[0_0_8px_#FF647C]">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Profile Avatar / Operator Node */}
        <button
          onClick={() => onNavigate('30-profile-menu')}
          className="h-8 w-8 rounded-lg bg-gradient-to-tr from-[#398BFF] via-[#52E5FF] to-[#9B7CFF] flex items-center justify-center font-mono font-bold text-xs text-[#050B18] ring-2 ring-[#52E5FF]/40 hover:ring-[#52E5FF] transition cursor-pointer shadow-[0_0_10px_rgba(82,229,255,0.3)]"
        >
          NX
        </button>
      </div>
    </header>
  );
};
