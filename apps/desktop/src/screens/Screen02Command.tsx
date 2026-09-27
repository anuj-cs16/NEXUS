'use client';

import React, { useState } from 'react';
import { ScreenId } from '../types/nexus';
import { Terminal, Cpu, Zap, Mic, Play, CornerDownLeft, Sparkles, CheckCircle2, ShieldAlert, Activity } from 'lucide-react';

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
    { cat: 'ENGINEERING', text: 'Synthesize rate-limiting middleware in src/nexus/core/limiter.py and execute pytest suite' },
    { cat: 'WORKSPACE', text: 'Find recent project files and inspect uncommitted git modifications' },
    { cat: 'AUTOMATION', text: 'Launch morning engineering workflow and run verification checks' },
    { cat: 'SECURITY', text: 'Audit tool execution permission boundaries and secret exposure policies' },
  ];

  const recentCommands = [
    'Execute full pytest suite in backend sandbox',
    'Synthesize database backup manifest and verify SHA-256 digests',
    'Inspect Ollama Qwen2.5-Coder VRAM allocation and active contexts',
  ];

  const handleExecute = (cmdText: string) => {
    const text = cmdText || commandInput;
    if (!text.trim()) return;

    setExecutionState('understanding');
    setResponseLog(`[SYSTEM:PARSER] Analyzing intent: "${text}"...\n[AST:CONTEXT] Gathering code context from services/backend/src/...\n[AGENT:ROUTER] Selecting agent toolchain: [read_file, patch_file, execute_command, run_tests]`);

    setTimeout(() => {
      if (text.toLowerCase().includes('workflow') || text.toLowerCase().includes('launch')) {
        setExecutionState('confirmation_required');
        onRequestAiConfirmation(
          'Automated Engineering Workflow Execution',
          [
            'Inspect target workspace (c:/NEXUS)',
            'Check uncommitted git branches & diffs',
            'Execute backend test suite & verify health',
          ]
        );
      } else {
        setExecutionState('executing');
        setResponseLog(
          `✓ Request parsed into multi-agent DAG\n✓ Target module: NEXUS Builder\n✓ Step 1: Read target file services/backend/src/nexus/main.py\n✓ Step 2: Formulate architectural patch\n✓ Step 3: Run verification tests\n\nTask created: tsk_${Math.random().toString(36).substring(2, 9).toUpperCase()} [Status: EXECUTING IN SANDBOX]`
        );
      }
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#050B18] p-6 space-y-5 select-none font-mono max-w-5xl mx-auto w-full cyber-grid-bg text-[#EAF4FF]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1B2D52] pb-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#52E5FF] flex items-center gap-1.5">
            <Terminal className="h-3.5 w-3.5" /> SCREEN 02 — CYBER COMMAND CONSOLE
          </div>
          <h2 className="text-lg font-black text-[#EAF4FF] tracking-wide mt-1">
            NEXUS AI Autonomous Command Interface
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-md bg-[#111C35] border border-[#1B2D52] px-3 py-1 text-xs text-[#8FA6C8] flex items-center gap-2">
            <span>ENGINE STATE:</span>
            <strong className="text-[#52E5FF] uppercase font-bold">{executionState}</strong>
          </span>
        </div>
      </div>

      {/* Primary Cyber Command Input Console */}
      <div className="rounded-xl bg-[#0A1225] border-2 border-[#1B2D52] focus-within:border-[#52E5FF] p-5 shadow-[0_0_20px_rgba(82,229,255,0.1)] space-y-4 transition">
        <div className="flex items-start gap-4">
          <span className="text-xl text-[#52E5FF] mt-1 shrink-0">⚡</span>
          <textarea
            rows={3}
            autoFocus
            placeholder="ENTER COMMAND: e.g. 'Synthesize auth middleware and verify with pytest', 'Check uncommitted git changes', 'Audit tool sandbox policies'..."
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            className="w-full bg-transparent text-xs text-[#EAF4FF] placeholder-[#647A9B] outline-none font-mono resize-none leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#1B2D52]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition cursor-pointer ${
                isRecording
                  ? 'bg-[#FF647C]/20 border-[#FF647C] text-[#FF647C] animate-pulse'
                  : 'bg-[#111C35] border-[#1B2D52] text-[#8FA6C8] hover:text-[#EAF4FF] hover:border-[#52E5FF]/40'
              }`}
            >
              <Mic className="h-3.5 w-3.5" />
              <span>{isRecording ? 'RECORDING AUDIO...' : 'VOICE INPUT'}</span>
            </button>

            <button
              onClick={() => onRequestPermission('Tool Sandbox', 'Execute arbitrary shell command in Docker container')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111C35] border border-[#1B2D52] hover:border-[#FFC76A]/50 text-xs text-[#FFC76A] transition cursor-pointer"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>TEST PERMISSION GATE</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExecute(commandInput)}
              disabled={!commandInput.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#52E5FF] hover:bg-[#398BFF] disabled:opacity-40 disabled:cursor-not-allowed text-[#050B18] font-bold text-xs font-mono transition cursor-pointer shadow-[0_0_12px_rgba(82,229,255,0.3)]"
            >
              <span>DISPATCH COMMAND</span>
              <CornerDownLeft className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Response & Execution Log Console */}
      {responseLog && (
        <div className="p-4 rounded-xl bg-[#0A1225] border border-[#52E5FF]/50 space-y-2 shadow-[0_0_15px_rgba(82,229,255,0.15)]">
          <div className="flex items-center justify-between text-xs border-b border-[#1B2D52] pb-2">
            <span className="text-[#52E5FF] font-bold flex items-center gap-2">
              <Activity className="h-4 w-4 animate-spin-slow" /> AGENT ORCHESTRATION TRACE
            </span>
            <span className="text-[#45E6B0] text-[10px]">LIVE OUTPUT</span>
          </div>
          <pre className="text-xs text-[#EAF4FF] font-mono whitespace-pre-wrap leading-relaxed">
            {responseLog}
          </pre>
          <div className="pt-2 flex items-center justify-end">
            <button
              onClick={() => onNavigate('07-task-detail')}
              className="px-3 py-1 rounded bg-[#52E5FF]/20 hover:bg-[#52E5FF]/30 border border-[#52E5FF]/50 text-[#52E5FF] text-xs font-bold transition cursor-pointer"
            >
              VIEW IN TASK EXECUTION (SCREEN 07) →
            </button>
          </div>
        </div>
      )}

      {/* Suggested Engineering Commands */}
      <div className="space-y-3">
        <div className="text-[10px] font-bold tracking-widest text-[#647A9B] uppercase">
          RECOMMENDED WORKFLOW COMMANDS
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {suggestedCommands.map((cmd, i) => (
            <div
              key={i}
              onClick={() => {
                setCommandInput(cmd.text);
                handleExecute(cmd.text);
              }}
              className="p-3 rounded-xl bg-[#0A1225] hover:bg-[#111C35] border border-[#1B2D52] hover:border-[#52E5FF]/50 cursor-pointer transition flex items-start gap-3 group"
            >
              <span className="text-[#52E5FF] mt-0.5 group-hover:scale-110 transition">⚡</span>
              <div className="flex flex-col space-y-1">
                <span className="text-[9px] font-bold text-[#52E5FF] tracking-wider uppercase">
                  [{cmd.cat}]
                </span>
                <span className="text-xs text-[#8FA6C8] group-hover:text-[#EAF4FF] leading-snug">
                  {cmd.text}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Execution Log */}
      <div className="space-y-2 pt-2 border-t border-[#1B2D52]">
        <div className="text-[10px] font-bold tracking-widest text-[#647A9B] uppercase">
          RECENT DISPATCH HISTORY
        </div>
        <div className="space-y-1.5">
          {recentCommands.map((cmd, i) => (
            <div
              key={i}
              onClick={() => setCommandInput(cmd)}
              className="p-2.5 rounded-lg bg-[#0A1225] hover:bg-[#111C35] border border-[#1B2D52] flex items-center justify-between text-xs text-[#8FA6C8] hover:text-[#EAF4FF] cursor-pointer transition"
            >
              <div className="flex items-center gap-2">
                <span className="text-[#647A9B]">&gt;</span>
                <span>{cmd}</span>
              </div>
              <span className="text-[10px] text-[#52E5FF] hover:underline">RELOAD</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
