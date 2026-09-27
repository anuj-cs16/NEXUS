"use client";

import React, { useState } from "react";
import { ScreenId } from "@/types/nexus";
import { 
  CheckSquare, 
  Zap, 
  Activity, 
  FolderOpen, 
  Brain, 
  Bell, 
  Puzzle, 
  Plus, 
  Sparkles,
  ArrowRight,
  Search
} from "lucide-react";

interface Screen27Props {
  onNavigate: (screen: ScreenId) => void;
}

type CategoryType = "tasks" | "automations" | "activity" | "files" | "memory" | "notifications" | "integrations";

export const Screen27EmptyStates: React.FC<Screen27Props> = ({ onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>("automations");

  const categories = [
    { id: "tasks", label: "No Tasks", icon: CheckSquare },
    { id: "automations", label: "No Automations", icon: Zap },
    { id: "activity", label: "No Activity", icon: Activity },
    { id: "files", label: "No Files", icon: FolderOpen },
    { id: "memory", label: "No Memory", icon: Brain },
    { id: "notifications", label: "No Notifications", icon: Bell },
    { id: "integrations", label: "No Integrations", icon: Puzzle },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-nexus-text-muted mb-1">
            <span className="font-mono text-nexus-purple">NEXUS-SYSTEM</span>
            <span>/</span>
            <span>EMPTY_STATES_SHOWCASE</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            NEXUS Zero-State Experiences
          </h1>
          <p className="text-nexus-text-muted text-xs mt-0.5">
            Every empty state provides clear guidance, zero-friction CTAs, and instant AI jump-starts.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-nexus-surface rounded-xl border border-nexus-border">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as CategoryType)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  isActive 
                    ? "bg-nexus-purple text-white shadow-md shadow-nexus-purple/20" 
                    : "text-nexus-text-muted hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Showcase Card */}
      <div className="bg-nexus-card border border-nexus-border rounded-2xl p-12 relative overflow-hidden shadow-2xl backdrop-blur-xl flex flex-col items-center justify-center text-center min-h-[440px]">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-nexus-purple/5 rounded-full blur-3xl pointer-events-none" />

        {/* Tasks Empty State */}
        {activeCategory === "tasks" && (
          <div className="max-w-md space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-nexus-surface border border-nexus-border flex items-center justify-center text-nexus-purple mx-auto shadow-lg shadow-nexus-purple/10">
              <CheckSquare className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">No active tasks</h2>
              <p className="text-nexus-text-muted text-xs mt-1.5 leading-relaxed">
                You&apos;re completely caught up! Start a new autonomous objective or let NEXUS orchestrate your development workflow.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button 
                onClick={() => onNavigate("screen-06-tasks")}
                className="px-5 py-2.5 rounded-xl bg-nexus-purple hover:bg-nexus-purple-hover text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-nexus-purple/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                Create New Task
              </button>
              <button 
                onClick={() => onNavigate("screen-02-command")}
                className="px-4 py-2.5 rounded-xl bg-nexus-surface hover:bg-nexus-border text-nexus-text hover:text-white border border-nexus-border text-xs font-medium transition-all"
              >
                Prompt NEXUS
              </button>
            </div>
          </div>
        )}

        {/* Automations Empty State */}
        {activeCategory === "automations" && (
          <div className="max-w-md space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-nexus-surface border border-nexus-border flex items-center justify-center text-nexus-yellow mx-auto shadow-lg shadow-nexus-yellow/10">
              <Zap className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">No automations configured yet</h2>
              <p className="text-nexus-text-muted text-xs mt-1.5 leading-relaxed">
                Build your first workflow and let NEXUS autonomously handle repetitive builds, tests, and environment preparations.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button 
                onClick={() => onNavigate("screen-09-automation-builder")}
                className="px-5 py-2.5 rounded-xl bg-nexus-purple hover:bg-nexus-purple-hover text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-nexus-purple/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                Build First Workflow
              </button>
              <button 
                onClick={() => onNavigate("screen-08-automations")}
                className="px-4 py-2.5 rounded-xl bg-nexus-surface hover:bg-nexus-border text-nexus-text hover:text-white border border-nexus-border text-xs font-medium transition-all"
              >
                Explore Templates
              </button>
            </div>
          </div>
        )}

        {/* Activity Empty State */}
        {activeCategory === "activity" && (
          <div className="max-w-md space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-nexus-surface border border-nexus-border flex items-center justify-center text-nexus-blue mx-auto shadow-lg shadow-nexus-blue/10">
              <Activity className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">No recent activity detected</h2>
              <p className="text-nexus-text-muted text-xs mt-1.5 leading-relaxed">
                NEXUS daemons and background agents will log telemetry here in real-time as tasks and commands are executed.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button 
                onClick={() => onNavigate("screen-02-command")}
                className="px-5 py-2.5 rounded-xl bg-nexus-purple hover:bg-nexus-purple-hover text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-nexus-purple/20 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Execute Sample Command
              </button>
            </div>
          </div>
        )}

        {/* Files Empty State */}
        {activeCategory === "files" && (
          <div className="max-w-md space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-nexus-surface border border-nexus-border flex items-center justify-center text-nexus-green mx-auto shadow-lg shadow-nexus-green/10">
              <FolderOpen className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">No indexed project files</h2>
              <p className="text-nexus-text-muted text-xs mt-1.5 leading-relaxed">
                Connect a project directory or workspace folder to unlock semantic indexing, code analysis, and deep AI search.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button 
                onClick={() => onNavigate("screen-13-files")}
                className="px-5 py-2.5 rounded-xl bg-nexus-purple hover:bg-nexus-purple-hover text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-nexus-purple/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                Index Workspace Folder
              </button>
            </div>
          </div>
        )}

        {/* Memory Empty State */}
        {activeCategory === "memory" && (
          <div className="max-w-md space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-nexus-surface border border-nexus-border flex items-center justify-center text-nexus-pink mx-auto shadow-lg shadow-nexus-pink/10">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Memory bank is empty</h2>
              <p className="text-nexus-text-muted text-xs mt-1.5 leading-relaxed">
                NEXUS stores explicit developer preferences, project architectures, and workflow patterns strictly with your consent.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button 
                onClick={() => onNavigate("screen-17-memory")}
                className="px-5 py-2.5 rounded-xl bg-nexus-purple hover:bg-nexus-purple-hover text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-nexus-purple/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Context Memory
              </button>
            </div>
          </div>
        )}

        {/* Notifications Empty State */}
        {activeCategory === "notifications" && (
          <div className="max-w-md space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-nexus-surface border border-nexus-border flex items-center justify-center text-nexus-cyan mx-auto shadow-lg shadow-nexus-cyan/10">
              <Bell className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">All caught up!</h2>
              <p className="text-nexus-text-muted text-xs mt-1.5 leading-relaxed">
                There are no pending alerts, workflow requests, or confirmation approvals waiting for your attention.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button 
                onClick={() => onNavigate("screen-01-home")}
                className="px-5 py-2.5 rounded-xl bg-nexus-surface hover:bg-nexus-border text-nexus-text hover:text-white border border-nexus-border text-xs font-medium transition-all"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Integrations Empty State */}
        {activeCategory === "integrations" && (
          <div className="max-w-md space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-nexus-surface border border-nexus-border flex items-center justify-center text-nexus-purple mx-auto shadow-lg shadow-nexus-purple/10">
              <Puzzle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">No external tools connected</h2>
              <p className="text-nexus-text-muted text-xs mt-1.5 leading-relaxed">
                Connect your IDE, GitHub repositories, Docker daemon, or terminal tools to give NEXUS autonomous superpowers.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button 
                onClick={() => onNavigate("screen-22-integrations")}
                className="px-5 py-2.5 rounded-xl bg-nexus-purple hover:bg-nexus-purple-hover text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-nexus-purple/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                Connect Integrations
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
