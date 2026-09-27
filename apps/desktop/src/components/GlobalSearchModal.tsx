'use client';

import React, { useState } from 'react';
import { ScreenId } from '../types/nexus';
import {
  INITIAL_TASKS,
  INITIAL_FILES,
  INITIAL_APPS,
  INITIAL_AUTOMATIONS,
  INITIAL_MEMORIES,
  INITIAL_ACTIVITY,
} from '../data/mockData';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: ScreenId) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('NEXUS PRD');
  const [activeCategory, setActiveCategory] = useState<'All' | 'Files' | 'Tasks' | 'Apps' | 'Automations' | 'Memory'>('All');

  if (!isOpen) return null;

  const files = INITIAL_FILES.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.path.toLowerCase().includes(searchQuery.toLowerCase()));
  const tasks = INITIAL_TASKS.filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase()));
  const apps = INITIAL_APPS.filter((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.relatedTasks.some(r => r.toLowerCase().includes(searchQuery.toLowerCase())));
  const automations = INITIAL_AUTOMATIONS.filter((au) => au.name.toLowerCase().includes(searchQuery.toLowerCase()) || au.description.toLowerCase().includes(searchQuery.toLowerCase()));
  const memories = INITIAL_MEMORIES.filter((m) => m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.description.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-start justify-center pt-20 select-none animate-in fade-in duration-150">
      <div className="bg-[#12121a] border border-[#3a3a4a] rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col ring-1 ring-white/10">
        {/* Search Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#2a2a3a] bg-[#1a1a25]">
          <span className="text-[#818cf8] text-lg">🔍</span>
          <input
            type="text"
            autoFocus
            placeholder="Search across AI, Files, Apps, Tasks, Automations, Memory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder-[#6b6b80] outline-none font-sans font-medium"
          />
          <kbd
            onClick={onClose}
            className="rounded bg-[#22222f] border border-[#2a2a3a] px-2 py-0.5 text-[10px] font-mono text-[#9494a8] cursor-pointer hover:text-white"
          >
            ESC
          </kbd>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-[#2a2a3a] bg-[#0e0e16] overflow-x-auto text-xs">
          {(['All', 'Files', 'Tasks', 'Apps', 'Automations', 'Memory'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#6366f1] text-white shadow-md shadow-[#6366f1]/20'
                  : 'bg-[#1a1a25] text-[#9494a8] hover:text-white border border-[#2a2a3a]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Results Grouped by Category */}
        <div className="max-h-[480px] overflow-y-auto p-4 space-y-4">
          {/* Files Section */}
          {(activeCategory === 'All' || activeCategory === 'Files') && files.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6b6b80] px-1">
                FILES & DOCUMENTS ({files.length})
              </div>
              {files.map((file) => (
                <div
                  key={file.id}
                  onClick={() => { onNavigate('13-files'); onClose(); }}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#1a1a25]/60 hover:bg-[#1a1a25] border border-[#2a2a3a] hover:border-[#6366f1]/50 cursor-pointer transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{file.type === 'code' ? '⚡' : '📄'}</span>
                    <div>
                      <div className="text-xs font-semibold text-white">{file.name}</div>
                      <div className="text-[10px] text-[#6b6b80] font-mono">{file.path}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[#22222f] px-2 py-0.5 text-[10px] font-mono text-[#34d399]">
                      {Math.round((file.relevanceScore || 0.9) * 100)}% Match
                    </span>
                    <span className="text-[10px] text-[#6b6b80] font-mono">{file.size}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tasks Section */}
          {(activeCategory === 'All' || activeCategory === 'Tasks') && tasks.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6b6b80] px-1">
                TASKS & SPRINTS ({tasks.length})
              </div>
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => { onNavigate('07-task-detail'); onClose(); }}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#1a1a25]/60 hover:bg-[#1a1a25] border border-[#2a2a3a] hover:border-[#6366f1]/50 cursor-pointer transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">📋</span>
                    <div>
                      <div className="text-xs font-semibold text-white">{task.title}</div>
                      <div className="text-[10px] text-[#9494a8]">{task.aiStatus}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[#6366f1]/20 border border-[#6366f1]/30 px-2 py-0.5 text-[10px] font-mono text-[#818cf8]">
                      {task.progress}% Complete
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Memories Section */}
          {(activeCategory === 'All' || activeCategory === 'Memory') && memories.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6b6b80] px-1">
                KNOWLEDGE & MEMORY PALACE ({memories.length})
              </div>
              {memories.map((mem) => (
                <div
                  key={mem.id}
                  onClick={() => { onNavigate('18-memory-detail'); onClose(); }}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#1a1a25]/60 hover:bg-[#1a1a25] border border-[#2a2a3a] hover:border-[#6366f1]/50 cursor-pointer transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">🧠</span>
                    <div>
                      <div className="text-xs font-semibold text-white">{mem.title}</div>
                      <div className="text-[10px] text-[#9494a8] line-clamp-1">{mem.description}</div>
                    </div>
                  </div>
                  <span className="rounded bg-[#ec4899]/10 border border-[#ec4899]/20 px-2 py-0.5 text-[10px] font-mono text-[#f472b6]">
                    {mem.category}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Automations Section */}
          {(activeCategory === 'All' || activeCategory === 'Automations') && automations.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6b6b80] px-1">
                AUTOMATIONS ({automations.length})
              </div>
              {automations.map((auto) => (
                <div
                  key={auto.id}
                  onClick={() => { onNavigate('10-automation-run'); onClose(); }}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#1a1a25]/60 hover:bg-[#1a1a25] border border-[#2a2a3a] hover:border-[#6366f1]/50 cursor-pointer transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">⚙️</span>
                    <div>
                      <div className="text-xs font-semibold text-white">{auto.name}</div>
                      <div className="text-[10px] text-[#9494a8]">{auto.schedule}</div>
                    </div>
                  </div>
                  <span className="rounded bg-[#fbbf24]/10 border border-[#fbbf24]/20 px-2 py-0.5 text-[10px] font-mono text-[#fbbf24]">
                    {auto.stepsCount} Nodes
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-[#2a2a3a] bg-[#0e0e16] flex items-center justify-between text-[11px] text-[#6b6b80] font-mono">
          <span>Semantic Natural Language Search</span>
          <span className="text-[#818cf8]">Screen 29 — NEXUS Global Search</span>
        </div>
      </div>
    </div>
  );
};
