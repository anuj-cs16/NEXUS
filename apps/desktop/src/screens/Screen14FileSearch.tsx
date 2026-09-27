'use client';

import React, { useState } from 'react';
import { ScreenId } from '../types/nexus';
import { INITIAL_FILES } from '../data/mockData';

interface Screen14FileSearchProps {
  onNavigate: (screen: ScreenId) => void;
}

export const Screen14FileSearch: React.FC<Screen14FileSearchProps> = ({
  onNavigate,
}) => {
  const [nlQuery, setNlQuery] = useState('Find the latest NEXUS design documents and architectural specs');
  const [results] = useState(INITIAL_FILES);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#0a0a0f] p-8 space-y-6 select-none font-sans max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2a2a3a] pb-4">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#38bdf8]">
            SCREEN 14 — SEMANTIC FILE INTELLIGENCE
          </div>
          <h2 className="text-xl font-black text-white mt-0.5">Intelligent Natural Language File Search</h2>
          <p className="text-xs text-[#9494a8] mt-1">
            Local vector embeddings search through code semantics, comments, and docstrings.
          </p>
        </div>

        <button
          onClick={() => onNavigate('13-files')}
          className="text-xs text-[#9494a8] hover:text-white transition cursor-pointer"
        >
          ← Back to Files Explorer
        </button>
      </div>

      {/* Natural Language Search Box */}
      <div className="rounded-2xl bg-[#12121a] border-2 border-[#38bdf8]/40 focus-within:border-[#38bdf8] p-4 shadow-xl flex items-center gap-3">
        <span className="text-xl text-[#38bdf8]">🔍</span>
        <input
          type="text"
          value={nlQuery}
          onChange={(e) => setNlQuery(e.target.value)}
          placeholder="Ask in plain English: 'Find where the event bus publishes messages', 'Show me the PRD'..."
          className="flex-1 bg-transparent text-sm text-white placeholder-[#6b6b80] outline-none font-sans font-medium"
        />
        <button className="px-4 py-2 rounded-xl bg-[#38bdf8] text-black text-xs font-bold shadow-md shadow-[#38bdf8]/20 cursor-pointer">
          AI Search
        </button>
      </div>

      {/* Semantic Matches Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-[#6b6b80]">
          <span>SEMANTIC EMBEDDING MATCHES ({results.length} files found)</span>
          <span className="text-[#34d399]">Vector Similarity &gt; 0.80</span>
        </div>

        <div className="space-y-3">
          {results.map((file) => (
            <div
              key={file.id}
              onClick={() => onNavigate('13-files')}
              className="p-5 rounded-2xl bg-[#12121a] hover:bg-[#161622] border border-[#2a2a3a] hover:border-[#38bdf8]/60 shadow-xl transition flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-[#1a1a25] border border-[#3a3a4a] flex items-center justify-center text-xl shrink-0 shadow-md">
                  {file.type === 'code' ? '⚡' : '📄'}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white group-hover:text-[#38bdf8] transition">
                      {file.name}
                    </h3>
                    <span className="rounded bg-[#22222f] px-1.5 py-0.2 text-[9px] font-mono text-[#818cf8]">
                      {file.project}
                    </span>
                  </div>
                  <p className="text-xs text-[#6b6b80] font-mono">{file.path}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {file.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="rounded bg-[#1a1a25] px-2 py-0.5 text-[10px] font-mono text-[#9494a8]">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex md:flex-col items-end justify-between shrink-0 text-xs font-mono">
                <span className="rounded-full bg-[#34d399]/15 border border-[#34d399]/30 px-2.5 py-1 text-[#34d399] font-bold text-[11px]">
                  {Math.round((file.relevanceScore || 0.95) * 100)}% Match
                </span>
                <span className="text-[10px] text-[#6b6b80] mt-1">{file.size} • {file.modified}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
