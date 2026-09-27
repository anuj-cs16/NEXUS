"use client";

import React from "react";
import { ScreenId } from "@/types/nexus";
import { 
  AlertTriangle, 
  RotateCcw, 
  ArrowRight, 
  FileCode, 
  Activity, 
  Terminal, 
  ExternalLink,
  ShieldAlert,
  ChevronRight,
  LifeBuoy
} from "lucide-react";

interface Screen25Props {
  onNavigate: (screen: ScreenId) => void;
}

export const Screen25ErrorRecovery: React.FC<Screen25Props> = ({ onNavigate }) => {
  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb / Screen Identification */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-nexus-text-muted">
          <span className="font-mono text-nexus-purple">NEXUS-RECOVERY</span>
          <span>/</span>
          <span>TASK-8902</span>
          <span>/</span>
          <span className="text-nexus-red">EXECUTION_HALTED</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-nexus-red/10 border border-nexus-red/30 text-nexus-red text-xs font-mono font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-nexus-red animate-pulse" />
            RECOVERABLE INCIDENT
          </span>
        </div>
      </div>

      {/* Main Recovery Card */}
      <div className="bg-nexus-card border border-nexus-red/20 rounded-2xl p-8 relative overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-nexus-red/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start gap-6">
          <div className="w-14 h-14 rounded-2xl bg-nexus-red/10 border border-nexus-red/30 flex items-center justify-center text-nexus-red shrink-0 shadow-lg shadow-nexus-red/10">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div className="space-y-4 flex-1">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                NEXUS couldn&apos;t complete the task.
              </h1>
              <p className="text-nexus-text-muted text-sm mt-1">
                An unexpected environment blocker interrupted the automated workflow pipeline during Step 3 (Environment Initialization).
              </p>
            </div>

            {/* Error Detail Box */}
            <div className="p-4 rounded-xl bg-nexus-surface/80 border border-nexus-border font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-nexus-text-muted pb-2 border-b border-nexus-border">
                <span className="text-nexus-red font-semibold">ERROR_CODE: ENV_TARGET_NOT_FOUND</span>
                <span>Timestamp: 10:48:19.402 UTC</span>
              </div>
              <p className="text-nexus-text leading-relaxed">
                <span className="text-nexus-text-muted">Reason: </span>
                <span className="text-white font-medium">&ldquo;Visual Studio Code was unavailable at standard path &apos;C:\Users\user\AppData\Local\Programs\Microsoft VS Code\Code.exe&apos;&rdquo;</span>
              </p>
              <div className="text-nexus-text-muted text-[11px] pt-1">
                Target process timed out after 30,000ms. No lockfile was corrupted. NEXUS rolled back preliminary filesystem buffers safely.
              </div>
            </div>

            {/* AI Diagnosis & Suggested Resolutions */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-semibold text-nexus-text uppercase tracking-wider flex items-center gap-2">
                <LifeBuoy className="w-3.5 h-3.5 text-nexus-purple" />
                Recommended Automated Recoveries
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Option 1 */}
                <div 
                  onClick={() => onNavigate("screen-07-task-detail")}
                  className="p-4 rounded-xl bg-nexus-surface/40 hover:bg-nexus-surface border border-nexus-border hover:border-nexus-purple/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white group-hover:text-nexus-purple transition-colors">1. Auto-Detect Fallback Path</span>
                    <ChevronRight className="w-4 h-4 text-nexus-text-muted group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-xs text-nexus-text-muted">
                    Scan system registry and PATH environment variables for alternative VS Code or Cursor binaries.
                  </p>
                </div>

                {/* Option 2 */}
                <div 
                  onClick={() => onNavigate("screen-02-command")}
                  className="p-4 rounded-xl bg-nexus-surface/40 hover:bg-nexus-surface border border-nexus-border hover:border-nexus-blue/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white group-hover:text-nexus-blue transition-colors">2. Switch to Internal Editor</span>
                    <ChevronRight className="w-4 h-4 text-nexus-text-muted group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-xs text-nexus-text-muted">
                    Execute code modifications and review directly inside NEXUS Built-in Code Buffer without external IDE.
                  </p>
                </div>

                {/* Option 3 */}
                <div 
                  onClick={() => onNavigate("screen-12-trace")}
                  className="p-4 rounded-xl bg-nexus-surface/40 hover:bg-nexus-surface border border-nexus-border hover:border-nexus-green/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white group-hover:text-nexus-green transition-colors">3. Inspect Execution Trace</span>
                    <ChevronRight className="w-4 h-4 text-nexus-text-muted group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-xs text-nexus-text-muted">
                    Audit precise step logs, standard error streams, and environment variables captured before failure.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-nexus-border/50">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onNavigate("screen-07-task-detail")}
                  className="px-5 py-2.5 rounded-xl bg-nexus-purple hover:bg-nexus-purple-hover text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-nexus-purple/20 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retry with Fallback Binary
                </button>
                <button 
                  onClick={() => onNavigate("screen-09-automation-builder")}
                  className="px-4 py-2.5 rounded-xl bg-nexus-surface hover:bg-nexus-border text-nexus-text hover:text-white border border-nexus-border text-xs font-medium transition-all"
                >
                  Change Action Step
                </button>
              </div>

              <button 
                onClick={() => onNavigate("screen-12-trace")}
                className="px-4 py-2.5 rounded-xl text-nexus-text-muted hover:text-white text-xs flex items-center gap-1.5 transition-colors"
              >
                <Terminal className="w-4 h-4" />
                View Detailed Crash Logs
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Safety & Sandbox Assurance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-nexus-card border border-nexus-border rounded-xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-nexus-green text-xs font-semibold">
            <ShieldAlert className="w-4 h-4" />
            Zero Data Loss Guarantee
          </div>
          <p className="text-xs text-nexus-text-muted leading-relaxed">
            NEXUS maintains transaction logs for all filesystem changes. No files were modified, committed, or deleted during the halted step.
          </p>
        </div>

        <div className="bg-nexus-card border border-nexus-border rounded-xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-nexus-blue text-xs font-semibold">
            <Activity className="w-4 h-4" />
            Agent Health: All 7 Modules Healthy
          </div>
          <p className="text-xs text-nexus-text-muted leading-relaxed">
            The error was isolated to external process launching. NEXUS Core, Memory Engine, and Autonomous Agents remain 100% online and responsive.
          </p>
        </div>
      </div>
    </div>
  );
};
