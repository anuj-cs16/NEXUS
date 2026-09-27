'use client';

import React, { useState } from 'react';
import { ScreenId } from '../types/nexus';

interface DesktopOverlayWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: ScreenId) => void;
  onExecuteCommand: (cmd: string) => void;
}

export const DesktopOverlayWidget: React.FC<DesktopOverlayWidgetProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onExecuteCommand,
}) => {
  const [prompt, setPrompt] = useState('');

  if (!isOpen) return null;

  const handleRun = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onExecuteCommand(prompt);
    onClose();
    onNavigate('02-command');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="w-96 bg-[#12121a]/95 backdrop-blur-md border border-[#6366f1]/50 rounded-2xl p-4 shadow-2xl space-y-3 ring-1 ring-white/15">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-[#6366f1] to-[#a855f7] flex items-center justify-center text-xs font-mono font-bold text-white shadow-sm">
              N
            </div>
            <span className="text-xs font-bold text-white tracking-wide">NEXUS Desktop Overlay</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" />
            <button
              onClick={onClose}
              className="text-[#6b6b80] hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleRun} className="flex gap-2">
          <input
            type="text"
            autoFocus
            placeholder="Ask NEXUS anything..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 bg-[#1a1a25] border border-[#2a2a3a] focus:border-[#6366f1] rounded-xl px-3 py-2 text-xs text-white placeholder-[#6b6b80] outline-none"
          />
          <button
            type="submit"
            className="bg-[#6366f1] hover:bg-[#818cf8] text-white px-3 py-2 rounded-xl text-xs font-bold shadow-md shadow-[#6366f1]/25 transition cursor-pointer"
          >
            ⚡
          </button>
        </form>

        {/* Quick Action Badges */}
        <div className="flex items-center justify-between pt-1 border-t border-[#2a2a3a] text-[10px]">
          <button
            onClick={() => { onNavigate('14-file-search'); onClose(); }}
            className="text-[#9494a8] hover:text-[#818cf8] flex items-center gap-1 cursor-pointer"
          >
            <span>📁</span>
            <span>Search</span>
          </button>
          <button
            onClick={() => { onNavigate('06-tasks'); onClose(); }}
            className="text-[#9494a8] hover:text-[#818cf8] flex items-center gap-1 cursor-pointer"
          >
            <span>📋</span>
            <span>Tasks</span>
          </button>
          <button
            onClick={() => { onNavigate('08-automations'); onClose(); }}
            className="text-[#9494a8] hover:text-[#818cf8] flex items-center gap-1 cursor-pointer"
          >
            <span>⚙️</span>
            <span>Run</span>
          </button>
          <button
            onClick={() => { onNavigate('15-apps'); onClose(); }}
            className="text-[#9494a8] hover:text-[#818cf8] flex items-center gap-1 cursor-pointer"
          >
            <span>💻</span>
            <span>Apps</span>
          </button>
        </div>
      </div>
    </div>
  );
};
