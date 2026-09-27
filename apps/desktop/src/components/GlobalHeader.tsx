'use client';

import React from 'react';
import { ScreenId } from '../types/nexus';

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
  return (
    <header className="h-14 border-b border-[#2a2a3a] bg-[#12121a] px-5 flex items-center justify-between shrink-0 select-none z-20">
      {/* Left Search / Global Command input */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <div
          onClick={onOpenPalette}
          className="flex-1 flex items-center justify-between bg-[#1a1a25] border border-[#2a2a3a] hover:border-[#6366f1]/50 rounded-lg px-3.5 py-1.5 text-xs text-[#9494a8] cursor-pointer transition shadow-inner group"
        >
          <div className="flex items-center gap-2">
            <span className="text-[#6366f1] group-hover:scale-110 transition">⚡</span>
            <span>Ask NEXUS or run commands...</span>
          </div>
          <kbd className="hidden sm:inline-block rounded bg-[#22222f] border border-[#2a2a3a] px-1.5 py-0.5 text-[10px] font-mono text-[#818cf8]">
            Ctrl + K
          </kbd>
        </div>

        <button
          onClick={onOpenGlobalSearch}
          title="Universal Search (Files, Apps, Tasks, Memory)"
          className="rounded-lg bg-[#1a1a25] hover:bg-[#22222f] border border-[#2a2a3a] p-2 text-xs text-[#9494a8] hover:text-white transition cursor-pointer"
        >
          🔍
        </button>
      </div>

      {/* Right Telemetry & Quick Action Controls */}
      <div className="flex items-center gap-3">
        {/* Model Indicator */}
        <div
          onClick={() => onNavigate('21-settings')}
          className="hidden md:flex items-center gap-2 bg-[#1a1a25] border border-[#2a2a3a] hover:border-[#3a3a4a] rounded-lg px-2.5 py-1 text-xs cursor-pointer transition"
        >
          <span className="text-[#6b6b80]">AI:</span>
          <span className="font-mono text-[#818cf8] font-medium">{activeModel}</span>
        </div>

        {/* Ollama Health Pill */}
        <div className="flex items-center gap-1.5 rounded-full bg-[#1a1a25] border border-[#2a2a3a] px-2.5 py-1 text-[11px]">
          <span className={`h-2 w-2 rounded-full ${ollamaConnected ? 'bg-[#22c55e] animate-pulse' : 'bg-[#ef4444]'}`} />
          <span className="text-[#9494a8]">Ollama:</span>
          <span className={ollamaConnected ? 'text-[#22c55e] font-semibold' : 'text-[#ef4444] font-semibold'}>
            {ollamaConnected ? 'Active' : 'Offline'}
          </span>
        </div>

        {/* Floating Desktop Widget Trigger */}
        <button
          onClick={onOpenOverlay}
          title="Launch Floating Desktop Quick Overlay (Screen 31)"
          className="hidden lg:flex items-center gap-1.5 rounded-lg bg-[#1a1a25] hover:bg-[#22222f] border border-[#2a2a3a] px-2.5 py-1 text-xs text-[#9494a8] hover:text-white transition cursor-pointer"
        >
          <span>🪟</span>
          <span className="text-[11px] font-medium">Mini Widget</span>
        </button>

        {/* Notifications Icon with Badge */}
        <button
          onClick={() => onNavigate('20-notifications')}
          className="relative rounded-lg bg-[#1a1a25] hover:bg-[#22222f] border border-[#2a2a3a] p-2 text-xs text-[#9494a8] hover:text-white transition cursor-pointer"
        >
          <span>🔔</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-[#ef4444] text-[9px] font-bold text-white flex items-center justify-center border border-[#12121a]">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Profile Avatar / Menu */}
        <button
          onClick={() => onNavigate('30-profile-menu')}
          className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#6366f1] to-[#ec4899] flex items-center justify-center font-bold text-xs text-white ring-2 ring-[#6366f1]/30 hover:ring-[#6366f1] transition cursor-pointer"
        >
          A
        </button>
      </div>
    </header>
  );
};
