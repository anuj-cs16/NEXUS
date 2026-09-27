'use client';

import React, { useState } from 'react';
import { ScreenId } from '../types/nexus';

interface Screen02CommandProps {
  onNavigate: (screen: ScreenId) => void;
  onRequestPermission: (appName: string, reason: string) => void;
  onRequestAiConfirmation: (workflowName: string, steps: string[]) => void;
}

export const Screen02Command: React.FC<Screen02CommandProps> = ({
  onNavigate,
  onRequestPermission,
  onRequestAiConfirmation,
}) => {
  const [commandInput, setCommandInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [executionState, setExecutionState] = useState<'idle' | 'understanding' | 'executing' | 'completed' | 'confirmation_required'>('idle');
  const [responseLog, setResponseLog] = useState<string | null>(null);

  const suggestedCommands = [
    { cat: 'Development', text: 'Synthesize rate-limiting middleware in src/nexus/core/limiter.py and write unit tests' },
    { cat: 'Workspace', text: 'Find my latest project files and check for uncommitted git changes' },
    { cat: 'Automation', text: 'Open VS Code and launch the morning development workflow' },
    { cat: 'Productivity', text: 'Summarize today\'s work and generate pull request draft' },
  ];

  const recentCommands = [
    'Create a task to finish the PRD',
    'Run full pytest suite in backend sandbox',
    'Analyze dependencies in pyproject.toml',
  ];

  const handleExecute = (cmdText: string) => {
    const text = cmdText || commandInput;
    if (!text.trim()) return;

    setExecutionState('understanding');
    setResponseLog(`Understanding intent: "${text}"...\nGathering AST context from workspace...\nSelecting appropriate agent tools: [read_file, patch_file, execute_command]`);

    setTimeout(() => {
      if (text.toLowerCase().includes('open vs code') || text.toLowerCase().includes('workflow')) {
        setExecutionState('confirmation_required');
        onRequestAiConfirmation(
          'Launch VS Code & Execute Workflow',
          [
            'Open Visual Studio Code (c:/NEXUS)',
            'Check uncommitted git branches',
            'Run development server & health check',
          ]
        );
      } else {
        setExecutionState('executing');
        setResponseLog(
          `✓ Request parsed successfully\n✓ Target module: NEXUS Builder\n✓ Step 1: Read target file src/nexus/main.py\n✓ Step 2: Formulate architectural plan\n✓ Step 3: Run verification tests\n\nTask created: tsk_${Math.random().toString(36).substring(2, 9).toUpperCase()} [Status: Executing]`
        );
      }
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#0a0a0f] p-8 space-y-6 select-none font-sans max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2a2a3a] pb-4">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#818cf8]">
            SCREEN 02 — COMMAND CONSOLE
          </div>
          <h2 className="text-xl font-black text-white mt-0.5">NEXUS Command Interface</h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#1a1a25] border border-[#2a2a3a] px-3 py-1 text-xs font-mono text-[#9494a8]">
            Status: <strong className="text-[#34d399] uppercase font-bold">{executionState}</strong>
          </span>
        </div>
      </div>

      {/* Primary Command Input Console */}
      <div className="rounded-2xl bg-[#12121a] border-2 border-[#6366f1]/40 focus-within:border-[#6366f1] p-5 shadow-2xl space-y-4 ring-1 ring-[#6366f1]/20 transition">
        <div className="flex items-start gap-4">
          <span className="text-2xl text-[#6366f1] mt-1 shrink-0">⚡</span>
          <textarea
            rows={3}
            autoFocus
            placeholder="Command NEXUS: e.g. 'Synthesize auth middleware and verify with pytest', 'Open VS Code and load project', 'Summarize today\'s commits'..."
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder-[#6b6b80] outline-none font-mono resize-none leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#2a2a3a]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                isRecording
                  ? 'bg-[#ef4444]/20 border-[#ef4444] text-[#ef4444] animate-pulse'
                  : 'bg-[#1a1a25] border-[#2a2a3a] text-[#9494a8] hover:text-white'
              }`}
            >
              <span>🎙️</span>
              <span>{isRecording ? 'Listening...' : 'Voice Input'}</span>
            </button>

            <kbd className="hidden sm:inline-block rounded bg-[#22222f] border border-[#2a2a3a] px-2 py-1 text-[10px] font-mono text-[#6b6b80]">
              Press ↵ Enter to run
            </kbd>
          </div>

          <button
            onClick={() => handleExecute(commandInput)}
            disabled={!commandInput.trim() && !isRecording}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#818cf8] hover:opacity-90 disabled:opacity-50 text-xs font-bold text-white shadow-lg shadow-[#6366f1]/25 flex items-center gap-2 transition cursor-pointer"
          >
            <span>Execute Command</span>
            <span>➔</span>
          </button>
        </div>
      </div>

      {/* AI Execution & Response Area */}
      {responseLog && (
        <div className="rounded-2xl bg-[#12121a] border border-[#2a2a3a] p-5 shadow-xl space-y-3 font-mono text-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-[#2a2a3a] pb-2 text-[11px] text-[#818cf8] font-bold">
            <span>NEXUS EXECUTION ENGINE STREAM</span>
            <span>2.5s elapsed</span>
          </div>
          <div className="whitespace-pre-wrap text-[#e8e8ed] leading-relaxed bg-[#0a0a0f] p-4 rounded-xl border border-[#2a2a3a]">
            {responseLog}
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => onNavigate('07-task-detail')}
              className="px-3 py-1.5 rounded-lg bg-[#6366f1] hover:bg-[#818cf8] text-xs font-semibold text-white transition cursor-pointer"
            >
              Open Full Task Workspace →
            </button>
          </div>
        </div>
      )}

      {/* Suggested & Recent Commands */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Suggested */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase font-mono text-[#6b6b80] tracking-wider">
            SUGGESTED WORKFLOW COMMANDS
          </h4>
          <div className="space-y-2">
            {suggestedCommands.map((s, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setCommandInput(s.text);
                  handleExecute(s.text);
                }}
                className="p-3 rounded-xl bg-[#12121a] hover:bg-[#1a1a25] border border-[#2a2a3a] hover:border-[#6366f1]/50 cursor-pointer transition flex items-start justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <span className="rounded bg-[#22222f] px-1.5 py-0.5 text-[9px] font-mono text-[#818cf8]">
                    {s.cat}
                  </span>
                  <p className="text-xs text-[#e8e8ed] group-hover:text-white">{s.text}</p>
                </div>
                <span className="text-[#6366f1] text-xs opacity-0 group-hover:opacity-100 transition">➔</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent History */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase font-mono text-[#6b6b80] tracking-wider">
            RECENT COMMAND HISTORY
          </h4>
          <div className="space-y-2">
            {recentCommands.map((rc, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setCommandInput(rc);
                  handleExecute(rc);
                }}
                className="p-3 rounded-xl bg-[#12121a] hover:bg-[#1a1a25] border border-[#2a2a3a] hover:border-[#6366f1]/50 cursor-pointer transition flex items-center justify-between text-xs text-[#9494a8] hover:text-white"
              >
                <div className="flex items-center gap-2">
                  <span>🕒</span>
                  <span>{rc}</span>
                </div>
                <span className="text-[10px] font-mono text-[#6b6b80]">Re-run</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
