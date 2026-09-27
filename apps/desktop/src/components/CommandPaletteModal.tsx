'use client';

import React, { useState, useEffect } from 'react';
import { ScreenId } from '../types/nexus';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: ScreenId) => void;
  onExecuteCommand: (cmd: string) => void;
}

interface PaletteAction {
  category: 'Ask AI' | 'Apps' | 'Files' | 'Tasks' | 'Automations' | 'Settings' | 'Actions';
  icon: string;
  label: string;
  sublabel?: string;
  shortcut?: string;
  action: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onExecuteCommand,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const actions: PaletteAction[] = [
    { category: 'Ask AI', icon: '✨', label: 'Summarize today\'s project work and open pull requests', sublabel: 'NEXUS Research Agent', shortcut: 'Enter', action: () => { onExecuteCommand('Summarize today\'s work'); onClose(); onNavigate('02-command'); } },
    { category: 'Ask AI', icon: '⚡', label: 'Synthesize new backend service for auth token verification', sublabel: 'NEXUS Builder Agent', shortcut: '⌘B', action: () => { onExecuteCommand('Build auth token service'); onClose(); onNavigate('02-command'); } },
    { category: 'Apps', icon: '💻', label: 'Open Visual Studio Code with current workspace', sublabel: 'VS Code (c:/NEXUS)', shortcut: '↵', action: () => { onNavigate('15-apps'); onClose(); } },
    { category: 'Apps', icon: '🌐', label: 'Launch Google Chrome with localhost:3000', sublabel: 'Web Preview', shortcut: '⌘P', action: () => { onNavigate('15-apps'); onClose(); } },
    { category: 'Files', icon: '📁', label: 'Search project files by natural language query', sublabel: 'NEXUS Files Engine', shortcut: '→', action: () => { onNavigate('14-file-search'); onClose(); } },
    { category: 'Files', icon: '📄', label: 'Open NEXUS_DESIGN_DOC.md', sublabel: 'docs/NEXUS_DESIGN_DOC.md', shortcut: '⌘O', action: () => { onNavigate('13-files'); onClose(); } },
    { category: 'Tasks', icon: '📋', label: 'Create new engineering task with AI estimation', sublabel: 'Task Studio', shortcut: 'T', action: () => { onNavigate('06-tasks'); onClose(); } },
    { category: 'Automations', icon: '⚙️', label: 'Run "Morning Workspace" automation workflow', sublabel: '6 steps', shortcut: 'A', action: () => { onNavigate('10-automation-run'); onClose(); } },
    { category: 'Automations', icon: '🔧', label: 'Open visual Automation Node Builder', sublabel: 'Workflow Studio', shortcut: '⌘W', action: () => { onNavigate('09-automation-builder'); onClose(); } },
    { category: 'Settings', icon: '🛡️', label: 'Open Security & Agent Permission Matrix', sublabel: 'System Config', shortcut: '⌘,', action: () => { onNavigate('21-settings'); onClose(); } },
    { category: 'Actions', icon: '🧹', label: 'Rebuild Memory Palace & Vector Graph', sublabel: 'SQLite Vectors', shortcut: '⌘R', action: () => { onNavigate('17-memory'); onClose(); } },
  ];

  const filtered = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase()) ||
    (a.sublabel && a.sublabel.toLowerCase().includes(query.toLowerCase()))
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
        } else if (query.trim()) {
          onExecuteCommand(query);
          onClose();
          onNavigate('02-command');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-start justify-center pt-24 select-none animate-in fade-in duration-150">
      <div className="bg-[#12121a] border border-[#3a3a4a] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col ring-1 ring-white/10">
        {/* Search Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#2a2a3a] bg-[#1a1a25]">
          <span className="text-[#6366f1] text-base animate-pulse">⚡</span>
          <input
            type="text"
            autoFocus
            placeholder="What do you want to do? (Ask AI, launch app, search files...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder-[#6b6b80] outline-none font-sans"
          />
          <kbd
            onClick={onClose}
            className="rounded bg-[#22222f] border border-[#2a2a3a] px-2 py-0.5 text-[10px] font-mono text-[#9494a8] cursor-pointer hover:text-white"
          >
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filtered.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <div
                key={idx}
                onClick={item.action}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`flex items-center justify-between px-3.5 py-2 rounded-xl cursor-pointer transition ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#6366f1]/20 to-[#a855f7]/10 border border-[#6366f1]/50 text-white shadow-sm'
                    : 'text-[#9494a8] hover:bg-[#1a1a25] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-base shrink-0">{item.icon}</span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold truncate text-[#e8e8ed]">{item.label}</span>
                    {item.sublabel && (
                      <span className="text-[10px] text-[#6b6b80] truncate font-mono">{item.sublabel}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="rounded bg-[#1a1a25] border border-[#2a2a3a] px-1.5 py-0.5 text-[9px] font-mono uppercase text-[#6b6b80]">
                    {item.category}
                  </span>
                  {item.shortcut && (
                    <kbd className="rounded bg-[#22222f] border border-[#2a2a3a] px-1.5 py-0.5 text-[10px] font-mono text-[#818cf8]">
                      {item.shortcut}
                    </kbd>
                  )}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-10 text-xs text-[#6b6b80]">
              No exact shortcut match. Press <kbd className="text-[#818cf8]">Enter</kbd> to execute as a natural-language AI prompt.
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-4 py-2 border-t border-[#2a2a3a] bg-[#0e0e16] flex items-center justify-between text-[11px] text-[#6b6b80] font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="text-[#818cf8]">NEXUS Fast Launcher</span>
        </div>
      </div>
    </div>
  );
};
