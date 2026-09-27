"use client";

import React from "react";
import { ScreenId } from "@/types/nexus";
import { 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw, 
  FileCode, 
  ExternalLink, 
  Clock, 
  Layers, 
  Zap, 
  Share2, 
  Sparkles,
  ChevronRight
} from "lucide-react";

interface Screen26Props {
  onNavigate: (screen: ScreenId) => void;
}

export const Screen26SuccessState: React.FC<Screen26Props> = ({ onNavigate }) => {
  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto space-y-6">
      {/* Screen Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-nexus-text-muted">
          <span className="font-mono text-nexus-purple">NEXUS-PIPELINE</span>
          <span>/</span>
          <span>TASK-8901</span>
          <span>/</span>
          <span className="text-nexus-green">COMPLETED_VERIFIED</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-nexus-green/10 border border-nexus-green/30 text-nexus-green text-xs font-mono font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            ZERO FAULTS DETECTED
          </span>
        </div>
      </div>

      {/* Hero Success Card */}
      <div className="bg-nexus-card border border-nexus-green/20 rounded-2xl p-8 relative overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-nexus-green/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start gap-6">
          <div className="w-14 h-14 rounded-2xl bg-nexus-green/10 border border-nexus-green/30 flex items-center justify-center text-nexus-green shrink-0 shadow-lg shadow-nexus-green/10">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-4 flex-1">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Task completed successfully
                </h1>
                <span className="px-2 py-0.5 rounded bg-nexus-purple/15 text-nexus-purple border border-nexus-purple/30 text-[11px] font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI Verified
                </span>
              </div>
              <p className="text-nexus-text-muted text-sm mt-1">
                Your NEXUS development workflow finished all 6 execution stages and passed automated unit validation.
              </p>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-nexus-surface/80 border border-nexus-border">
                <div className="flex items-center gap-1.5 text-xs text-nexus-text-muted">
                  <Clock className="w-3.5 h-3.5 text-nexus-blue" />
                  Total Duration
                </div>
                <div className="text-base font-bold text-white font-mono mt-1">
                  00:42.18
                </div>
              </div>

              <div className="p-3 rounded-xl bg-nexus-surface/80 border border-nexus-border">
                <div className="flex items-center gap-1.5 text-xs text-nexus-text-muted">
                  <Zap className="w-3.5 h-3.5 text-nexus-yellow" />
                  Actions Completed
                </div>
                <div className="text-base font-bold text-white font-mono mt-1">
                  14 / 14
                </div>
              </div>

              <div className="p-3 rounded-xl bg-nexus-surface/80 border border-nexus-border">
                <div className="flex items-center gap-1.5 text-xs text-nexus-text-muted">
                  <FileCode className="w-3.5 h-3.5 text-nexus-purple" />
                  Files Affected
                </div>
                <div className="text-base font-bold text-white font-mono mt-1">
                  6 Files (+420/-18)
                </div>
              </div>

              <div className="p-3 rounded-xl bg-nexus-surface/80 border border-nexus-border">
                <div className="flex items-center gap-1.5 text-xs text-nexus-text-muted">
                  <Layers className="w-3.5 h-3.5 text-nexus-green" />
                  Apps Engaged
                </div>
                <div className="text-base font-bold text-white font-mono mt-1">
                  VS Code, Node.js
                </div>
              </div>
            </div>

            {/* Affected Artifacts List */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-semibold text-nexus-text uppercase tracking-wider">
                Generated &amp; Modified Artifacts
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-nexus-surface/40 border border-nexus-border flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className="w-4 h-4 text-nexus-purple shrink-0" />
                    <span className="font-mono text-nexus-text truncate">services/backend/src/nexus/api/routes.py</span>
                  </div>
                  <span className="text-[10px] font-mono text-nexus-green bg-nexus-green/10 px-1.5 py-0.5 rounded shrink-0">+142 L</span>
                </div>

                <div className="p-2.5 rounded-lg bg-nexus-surface/40 border border-nexus-border flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className="w-4 h-4 text-nexus-blue shrink-0" />
                    <span className="font-mono text-nexus-text truncate">apps/desktop/src/types/nexus.ts</span>
                  </div>
                  <span className="text-[10px] font-mono text-nexus-green bg-nexus-green/10 px-1.5 py-0.5 rounded shrink-0">+88 L</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-nexus-border/50">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onNavigate("screen-07-task-detail")}
                  className="px-5 py-2.5 rounded-xl bg-nexus-purple hover:bg-nexus-purple-hover text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-nexus-purple/20 transition-all"
                >
                  View Full Task Details
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => onNavigate("screen-08-automations")}
                  className="px-4 py-2.5 rounded-xl bg-nexus-surface hover:bg-nexus-border text-nexus-text hover:text-white border border-nexus-border text-xs font-medium flex items-center gap-1.5 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Run Again
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onNavigate("screen-12-trace")}
                  className="px-3.5 py-2 rounded-xl text-nexus-text-muted hover:text-white text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Clock className="w-3.5 h-3.5" />
                  View Audit Trace
                </button>
                <button 
                  onClick={() => onNavigate("screen-01-home")}
                  className="px-4 py-2.5 rounded-xl bg-nexus-surface/80 hover:bg-nexus-surface text-nexus-text hover:text-white border border-nexus-border text-xs font-semibold transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Next Steps */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-nexus-text uppercase tracking-wider">
          Suggested Next Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div 
            onClick={() => onNavigate("screen-11-activity")}
            className="p-4 rounded-xl bg-nexus-card hover:bg-nexus-surface border border-nexus-border hover:border-nexus-purple/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-white group-hover:text-nexus-purple transition-colors">Check Live Activity</span>
              <ChevronRight className="w-4 h-4 text-nexus-text-muted group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-xs text-nexus-text-muted">
              Inspect real-time system logs and concurrent daemon tasks.
            </p>
          </div>

          <div 
            onClick={() => onNavigate("screen-19-insights")}
            className="p-4 rounded-xl bg-nexus-card hover:bg-nexus-surface border border-nexus-border hover:border-nexus-blue/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-white group-hover:text-nexus-blue transition-colors">Review Productivity Impact</span>
              <ChevronRight className="w-4 h-4 text-nexus-text-muted group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-xs text-nexus-text-muted">
              See total developer hours saved across today&apos;s automation runs.
            </p>
          </div>

          <div 
            onClick={() => onNavigate("screen-02-command")}
            className="p-4 rounded-xl bg-nexus-card hover:bg-nexus-surface border border-nexus-border hover:border-nexus-green/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-white group-hover:text-nexus-green transition-colors">Launch New Command</span>
              <ChevronRight className="w-4 h-4 text-nexus-text-muted group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-xs text-nexus-text-muted">
              Start another automated workflow or ask NEXUS anything.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
