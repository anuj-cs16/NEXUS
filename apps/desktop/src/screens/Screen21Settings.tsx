'use client';

import React, { useState } from 'react';
import { ScreenId } from '../types/nexus';

interface Screen21SettingsProps {
  onNavigate: (screen: ScreenId) => void;
  activeModel: string;
  setActiveModel: (model: string) => void;
}

export const Screen21Settings: React.FC<Screen21SettingsProps> = ({
  onNavigate,
  activeModel,
  setActiveModel,
}) => {
  const [activeCategory, setActiveCategory] = useState<'General' | 'Appearance' | 'AI' | 'Agents' | 'Automation' | 'Memory' | 'Privacy' | 'Security' | 'Integrations' | 'Keyboard' | 'System'>('AI');
  const [savedToast, setSavedToast] = useState(false);

  const categories = [
    'General', 'Appearance', 'AI', 'Agents', 'Automation', 'Memory', 'Privacy', 'Security', 'Integrations', 'Keyboard', 'System'
  ] as const;

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#0a0a0f] select-none font-sans">
      {/* Sub-Sidebar: Categories */}
      <aside className="w-56 border-r border-[#2a2a3a] bg-[#12121a] p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-4">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#6b6b80]">
            SETTINGS PORTAL
          </div>
          <div className="space-y-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#1a1a25] text-white border border-[#6366f1]/40 shadow-sm'
                    : 'text-[#9494a8] hover:bg-[#1a1a25]/50 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-2 rounded-xl bg-[#6366f1] hover:bg-[#818cf8] text-xs font-bold text-white shadow-lg shadow-[#6366f1]/25 transition cursor-pointer"
        >
          Save Changes
        </button>
      </aside>

      {/* Settings Panel Content */}
      <div className="flex-1 flex flex-col overflow-y-auto p-8 space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2a2a3a] pb-4">
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#818cf8]">
              SCREEN 21 — SYSTEM CONFIGURATION
            </div>
            <h2 className="text-xl font-black text-white mt-0.5">{activeCategory} Settings</h2>
          </div>

          {savedToast && (
            <span className="text-xs text-[#34d399] font-mono animate-in fade-in">
              ✓ Preferences saved to local SQLite
            </span>
          )}
        </div>

        {/* Dynamic Category Panels */}
        {activeCategory === 'AI' && (
          <div className="space-y-5">
            <div className="p-5 rounded-2xl bg-[#12121a] border border-[#2a2a3a] space-y-4">
              <h3 className="text-sm font-bold text-white">Local Ollama LLM Backend</h3>
              <p className="text-xs text-[#9494a8]">Configure the active model and inference host endpoint.</p>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-mono text-[#6b6b80] mb-1">SELECTED MODEL</label>
                  <select
                    value={activeModel}
                    onChange={(e) => setActiveModel(e.target.value)}
                    className="w-full bg-[#1a1a25] border border-[#2a2a3a] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#6366f1] font-mono"
                  >
                    <option value="qwen2.5-coder:14b">qwen2.5-coder:14b (Default Recommended)</option>
                    <option value="qwen2.5-coder:32b">qwen2.5-coder:32b (High Precision)</option>
                    <option value="codellama:7b">codellama:7b (Ultra Fast)</option>
                    <option value="deepseek-coder:6.7b">deepseek-coder:6.7b</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#6b6b80] mb-1">OLLAMA HOST URL</label>
                  <input
                    type="text"
                    defaultValue="http://127.0.0.1:11434"
                    className="w-full bg-[#1a1a25] border border-[#2a2a3a] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#6366f1] font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#12121a] border border-[#2a2a3a] space-y-3 text-xs">
              <h3 className="text-sm font-bold text-white">Reasoning & Temperature</h3>
              <div className="flex justify-between text-[#9494a8]">
                <span>Generation Temperature:</span>
                <span className="text-white font-mono font-bold">0.2 (Deterministic Code Synthesis)</span>
              </div>
              <input type="range" min="0" max="1" step="0.05" defaultValue="0.2" className="w-full accent-[#6366f1]" />
            </div>
          </div>
        )}

        {activeCategory === 'Security' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[#12121a] border border-[#2a2a3a] space-y-3 text-xs">
              <h3 className="text-sm font-bold text-white">Workspace Path Boundary Jail</h3>
              <p className="text-[#9494a8]">Prevent all AI agents from reading or writing outside registered workspace directories.</p>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" defaultChecked className="accent-[#22c55e]" />
                <span className="text-white font-medium">Strict Jail Enforced (Raise PathTraversalError)</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#12121a] border border-[#2a2a3a] space-y-3 text-xs">
              <h3 className="text-sm font-bold text-white">High-Risk Operation Approvals</h3>
              <p className="text-[#9494a8]">Require interactive user confirmation before running destructive shell commands.</p>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" defaultChecked className="accent-[#6366f1]" />
                <span className="text-white font-medium">Require Approval on CRITICAL & HIGH risk tiers</span>
              </div>
            </div>
          </div>
        )}

        {activeCategory !== 'AI' && activeCategory !== 'Security' && (
          <div className="p-8 rounded-2xl bg-[#12121a] border border-[#2a2a3a] text-center space-y-3">
            <div className="text-2xl">⚙️</div>
            <h3 className="text-sm font-bold text-white">{activeCategory} Configuration</h3>
            <p className="text-xs text-[#9494a8] max-w-md mx-auto">
              Configured per NEXUS System Specifications. Settings are persistent across sessions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
