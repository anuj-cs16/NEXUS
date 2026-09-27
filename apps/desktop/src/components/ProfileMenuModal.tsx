'use client';

import React from 'react';
import { ScreenId } from '../types/nexus';

interface ProfileMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: ScreenId) => void;
}

export const ProfileMenuModal: React.FC<ProfileMenuModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-end p-5 select-none" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-80 bg-[#12121a] border border-[#2a2a3a] rounded-2xl shadow-2xl p-5 space-y-4 ring-1 ring-white/10 mt-10 animate-in fade-in zoom-in-95 duration-100"
      >
        {/* User Profile Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-[#2a2a3a]">
          <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-[#6366f1] via-[#818cf8] to-[#ec4899] flex items-center justify-center font-bold text-base text-white ring-2 ring-[#6366f1]/40">
            AD
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Alex Developer</h4>
            <div className="text-[11px] text-[#818cf8] font-mono">alex@nexus-engineer.dev</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
              <span className="text-[10px] text-[#9494a8]">NEXUS Pro Member</span>
            </div>
          </div>
        </div>

        {/* Status & Plan Info */}
        <div className="bg-[#1a1a25] rounded-xl p-3 border border-[#2a2a3a] space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-[#6b6b80]">Local Inference Engine:</span>
            <span className="text-[#34d399] font-mono font-semibold">Ollama Active</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#6b6b80]">Storage Allocated:</span>
            <span className="text-[#e8e8ed] font-mono">1.2 GB / 50 GB</span>
          </div>
          <div className="w-full bg-[#22222f] h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-[#6366f1] to-[#34d399] h-full w-[12%]" />
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="space-y-1 text-xs">
          <button
            onClick={() => { onNavigate('21-settings'); onClose(); }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#1a1a25] text-[#9494a8] hover:text-white transition cursor-pointer"
          >
            <span className="flex items-center gap-2.5">
              <span>⚙️</span>
              <span>Preferences & AI Settings</span>
            </span>
            <span className="font-mono text-[10px] text-[#6b6b80]">⌘,</span>
          </button>
          <button
            onClick={() => { onNavigate('17-memory'); onClose(); }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#1a1a25] text-[#9494a8] hover:text-white transition cursor-pointer"
          >
            <span className="flex items-center gap-2.5">
              <span>🧠</span>
              <span>Manage Memory Palace</span>
            </span>
            <span className="font-mono text-[10px] text-[#6b6b80]">3 items</span>
          </button>
          <button
            onClick={() => { onNavigate('22-integrations'); onClose(); }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#1a1a25] text-[#9494a8] hover:text-white transition cursor-pointer"
          >
            <span className="flex items-center gap-2.5">
              <span>🔌</span>
              <span>Connected Applications</span>
            </span>
            <span className="font-mono text-[10px] text-[#22c55e]">6 live</span>
          </button>
        </div>

        {/* Lock & Sign Out */}
        <div className="pt-2 border-t border-[#2a2a3a] space-y-1 text-xs">
          <button
            onClick={onClose}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#1a1a25] text-[#9494a8] hover:text-white transition cursor-pointer"
          >
            <span>🔒</span>
            <span>Lock NEXUS Environment</span>
          </button>
          <button
            onClick={onClose}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#ef4444]/15 text-[#ef4444] transition cursor-pointer"
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
