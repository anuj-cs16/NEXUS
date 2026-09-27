"use client";

import React from "react";
import { ScreenId } from "@/types/nexus";
import { 
  Sparkles, 
  Terminal, 
  Puzzle, 
  Zap, 
  FolderPlus, 
  Cpu, 
  ArrowRight, 
  CheckCircle2, 
  Search,
  BookOpen,
  ChevronRight
} from "lucide-react";

interface Screen33Props {
  onNavigate: (screen: ScreenId) => void;
}

export const Screen33FirstRun: React.FC<Screen33Props> = ({ onNavigate }) => {
  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-nexus-purple/20 via-nexus-blue/10 to-transparent border border-nexus-purple/30 p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-nexus-purple/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-nexus-purple/20 border border-nexus-purple/30 text-nexus-purple text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            FIRST RUN INITIALIZATION COMPLETE
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome to NEXUS
          </h1>
          <p className="text-sm text-nexus-text-muted leading-relaxed">
            Your autonomous AI operating environment is ready. Instead of empty graphs, start by taking your first guided action below.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <button 
              onClick={() => onNavigate("screen-02-command")}
              className="px-5 py-2.5 rounded-xl bg-nexus-purple hover:bg-nexus-purple-hover text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-nexus-purple/25 transition-all"
            >
              Ask your first question
              <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onNavigate("screen-01-home")}
              className="px-4 py-2.5 rounded-xl bg-nexus-surface hover:bg-nexus-border text-nexus-text hover:text-white border border-nexus-border text-xs font-medium transition-all"
            >
              Skip to Full Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Guided Starter Tasks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Recommended First Actions</h2>
            <p className="text-xs text-nexus-text-muted">Complete these to calibrate NEXUS to your specific development habits.</p>
          </div>
          <span className="text-xs font-mono text-nexus-text-muted">0 of 5 completed</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Action 1 */}
          <div 
            onClick={() => onNavigate("screen-02-command")}
            className="p-5 rounded-2xl bg-nexus-card hover:bg-nexus-surface border border-nexus-border hover:border-nexus-purple/50 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-nexus-purple/10 border border-nexus-purple/30 flex items-center justify-center text-nexus-purple group-hover:scale-105 transition-transform">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-nexus-purple transition-colors">1. Ask your first question</h3>
                <p className="text-xs text-nexus-text-muted mt-1 leading-relaxed">
                  Try &ldquo;Summarize my active workspace&rdquo; or &ldquo;What can you do?&rdquo; in the Command Console.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-nexus-border/50 text-xs text-nexus-purple font-medium mt-3">
              <span>Open Command</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Action 2 */}
          <div 
            onClick={() => onNavigate("screen-22-integrations")}
            className="p-5 rounded-2xl bg-nexus-card hover:bg-nexus-surface border border-nexus-border hover:border-nexus-blue/50 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-nexus-blue/10 border border-nexus-blue/30 flex items-center justify-center text-nexus-blue group-hover:scale-105 transition-transform">
                <Puzzle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-nexus-blue transition-colors">2. Connect an application</h3>
                <p className="text-xs text-nexus-text-muted mt-1 leading-relaxed">
                  Hook up VS Code, Git, or Terminal so NEXUS can execute development workflows.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-nexus-border/50 text-xs text-nexus-blue font-medium mt-3">
              <span>Connect Tools</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Action 3 */}
          <div 
            onClick={() => onNavigate("screen-09-automation-builder")}
            className="p-5 rounded-2xl bg-nexus-card hover:bg-nexus-surface border border-nexus-border hover:border-nexus-yellow/50 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-nexus-yellow/10 border border-nexus-yellow/30 flex items-center justify-center text-nexus-yellow group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-nexus-yellow transition-colors">3. Create your first automation</h3>
                <p className="text-xs text-nexus-text-muted mt-1 leading-relaxed">
                  Design a visual DAG workflow (e.g. &ldquo;Morning Workspace&rdquo; or &ldquo;Pre-commit QA&rdquo;).
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-nexus-border/50 text-xs text-nexus-yellow font-medium mt-3">
              <span>Launch Builder</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Action 4 */}
          <div 
            onClick={() => onNavigate("screen-13-files")}
            className="p-5 rounded-2xl bg-nexus-card hover:bg-nexus-surface border border-nexus-border hover:border-nexus-green/50 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-nexus-green/10 border border-nexus-green/30 flex items-center justify-center text-nexus-green group-hover:scale-105 transition-transform">
                <FolderPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-nexus-green transition-colors">4. Import project context</h3>
                <p className="text-xs text-nexus-text-muted mt-1 leading-relaxed">
                  Index your current codebase files so NEXUS can reason over types, APIs, and schemas.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-nexus-border/50 text-xs text-nexus-green font-medium mt-3">
              <span>Index Workspace</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Action 5 */}
          <div 
            onClick={() => onNavigate("screen-04-modules")}
            className="p-5 rounded-2xl bg-nexus-card hover:bg-nexus-surface border border-nexus-border hover:border-nexus-pink/50 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-nexus-pink/10 border border-nexus-pink/30 flex items-center justify-center text-nexus-pink group-hover:scale-105 transition-transform">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-nexus-pink transition-colors">5. Explore NEXUS modules</h3>
                <p className="text-xs text-nexus-text-muted mt-1 leading-relaxed">
                  Inspect the 7 specialized neural micro-agents and customize their role permissions.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-nexus-border/50 text-xs text-nexus-pink font-medium mt-3">
              <span>View Module Network</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Docs / Guide */}
          <div 
            onClick={() => onNavigate("screen-21-settings")}
            className="p-5 rounded-2xl bg-nexus-card hover:bg-nexus-surface border border-nexus-border hover:border-nexus-cyan/50 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-nexus-cyan/10 border border-nexus-cyan/30 flex items-center justify-center text-nexus-cyan group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-nexus-cyan transition-colors">Configure Environment</h3>
                <p className="text-xs text-nexus-text-muted mt-1 leading-relaxed">
                  Adjust keyboard shortcuts, Ollama model weights, and telemetry privacy toggles.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-nexus-border/50 text-xs text-nexus-cyan font-medium mt-3">
              <span>Open Settings</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
