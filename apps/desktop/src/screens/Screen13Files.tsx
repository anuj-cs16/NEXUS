'use client';

import React, { useState } from 'react';
import { ScreenId, FileItem } from '../types/nexus';
import { INITIAL_FILES } from '../data/mockData';

interface Screen13FilesProps {
  onNavigate: (screen: ScreenId) => void;
  onSelectFile?: (file: FileItem) => void;
}

export const Screen13Files: React.FC<Screen13FilesProps> = ({
  onNavigate,
}) => {
  const [files] = useState<FileItem[]>(INITIAL_FILES);
  const [activeSection, setActiveSection] = useState<'Recent' | 'Favorites' | 'Projects' | 'AI Recommended'>('Projects');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedFile, setSelectedFile] = useState<FileItem>(files[0]);
  const [aiActionMessage, setAiActionMessage] = useState<string | null>(null);

  const triggerAiAction = (action: string) => {
    setAiActionMessage(`Executing AI action: "${action}" on ${selectedFile.name}... Synthesizing summary AST.`);
    setTimeout(() => setAiActionMessage(null), 3000);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#0a0a0f] select-none font-sans">
      {/* Sub-Sidebar: File Categories */}
      <aside className="w-56 border-r border-[#2a2a3a] bg-[#12121a] p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-4">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6b6b80]">
            EXPLORER SECTIONS
          </div>
          <div className="space-y-1">
            {(['Projects', 'Recent', 'Favorites', 'AI Recommended'] as const).map((sec) => (
              <button
                key={sec}
                onClick={() => setActiveSection(sec)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                  activeSection === sec
                    ? 'bg-[#1a1a25] text-white border border-[#6366f1]/40'
                    : 'text-[#9494a8] hover:bg-[#1a1a25]/50 hover:text-white'
                }`}
              >
                {sec === 'Projects' ? '📁' : sec === 'Recent' ? '🕒' : sec === 'Favorites' ? '⭐' : '✨'} {sec}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => onNavigate('14-file-search')}
          className="w-full py-2.5 rounded-xl bg-[#1a1a25] hover:bg-[#22222f] border border-[#2a2a3a] text-xs font-bold text-[#818cf8] flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <span>🔍</span>
          <span>Semantic AI Search</span>
        </button>
      </aside>

      {/* Main Files View */}
      <div className="flex-1 flex flex-col overflow-y-auto p-6 space-y-6">
        {/* Header Strip */}
        <div className="flex items-center justify-between border-b border-[#2a2a3a] pb-4">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#38bdf8]">
              SCREEN 13 — AI FILE ENGINE
            </div>
            <h2 className="text-xl font-black text-white mt-0.5">{activeSection} Files</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              className="p-2 rounded-lg bg-[#1a1a25] border border-[#2a2a3a] text-xs text-[#9494a8] hover:text-white transition cursor-pointer"
            >
              {viewMode === 'list' ? '⊞ Grid' : '☰ List'}
            </button>
          </div>
        </div>

        {/* AI Action Toast */}
        {aiActionMessage && (
          <div className="p-3.5 rounded-xl bg-[#6366f1]/20 border border-[#6366f1]/40 text-xs text-white animate-in fade-in duration-150">
            {aiActionMessage}
          </div>
        )}

        {/* Files Grid / List */}
        <div className="space-y-2">
          {files.map((f) => {
            const isSelected = selectedFile?.id === f.id;
            return (
              <div
                key={f.id}
                onClick={() => setSelectedFile(f)}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  isSelected
                    ? 'bg-[#1a1a25] border-[#6366f1] shadow-lg shadow-[#6366f1]/10'
                    : 'bg-[#12121a] border-[#2a2a3a] hover:bg-[#1a1a25] hover:border-[#3a3a4a]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{f.type === 'code' ? '⚡' : '📄'}</span>
                  <div>
                    <h4 className="text-xs font-bold text-white">{f.name}</h4>
                    <p className="text-[10px] text-[#6b6b80] font-mono">{f.path}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-[#9494a8]">
                  <span>{f.size}</span>
                  <span>{f.modified}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right AI File Action & Preview Sidebar */}
      {selectedFile && (
        <aside className="w-80 border-l border-[#2a2a3a] bg-[#12121a] p-5 flex flex-col justify-between shrink-0 space-y-4">
          <div className="space-y-4">
            <div className="border-b border-[#2a2a3a] pb-3">
              <span className="text-[10px] font-mono text-[#818cf8] uppercase">FILE PREVIEW</span>
              <h3 className="text-sm font-bold text-white truncate mt-1">{selectedFile.name}</h3>
              <p className="text-[10px] text-[#6b6b80] font-mono">{selectedFile.path}</p>
            </div>

            {/* Quick Metadata */}
            <div className="bg-[#1a1a25] p-3 rounded-xl border border-[#2a2a3a] space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-[#9494a8]">
                <span>Size:</span>
                <span className="text-white">{selectedFile.size}</span>
              </div>
              <div className="flex justify-between text-[#9494a8]">
                <span>Relevance:</span>
                <span className="text-[#34d399] font-bold">99% Relevant</span>
              </div>
            </div>

            {/* AI Actions Buttons */}
            <div className="space-y-2">
              <div className="text-[10px] font-mono font-bold text-[#6b6b80] uppercase">
                AI FILE ACTIONS
              </div>
              {[
                { label: 'Summarize Document', icon: '📝' },
                { label: 'Analyze AST & Architecture', icon: '🔍' },
                { label: 'Organize & Tag Automatically', icon: '🏷️' },
                { label: 'Find Semantically Similar', icon: '✨' },
                { label: 'Ask NEXUS about this file', icon: '💬' },
              ].map((act, idx) => (
                <button
                  key={idx}
                  onClick={() => triggerAiAction(act.label)}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl bg-[#1a1a25] hover:bg-[#22222f] border border-[#2a2a3a] hover:border-[#6366f1] text-xs text-[#e8e8ed] hover:text-white transition cursor-pointer text-left"
                >
                  <span>{act.icon}</span>
                  <span>{act.label}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      )}
    </div>
  );
};
