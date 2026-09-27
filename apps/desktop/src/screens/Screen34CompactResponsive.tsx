"use client";

import React, { useState } from "react";
import { ScreenId } from "@/types/nexus";
import { 
  Terminal, 
  CheckSquare, 
  Activity, 
  Zap, 
  Bell, 
  Sparkles, 
  ArrowRight, 
  Send, 
  Layers, 
  Cpu, 
  Play, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { mockTasks, mockActivity, mockAutomations, mockNotifications } from "@/data/mockData";

interface Screen34Props {
  onNavigate: (screen: ScreenId) => void;
}

type MobileTab = "command" | "tasks" | "activity" | "automations" | "notifications";

export const Screen34CompactResponsive: React.FC<Screen34Props> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<MobileTab>("command");
  const [commandInput, setCommandInput] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-center min-h-full">
      {/* Outer Mobile Frame Preview Container */}
      <div className="w-full max-w-sm bg-nexus-card border border-nexus-border rounded-[32px] overflow-hidden shadow-2xl flex flex-col h-[740px] relative border-t-4 border-t-nexus-purple/60">
        
        {/* Mobile Status Bar / Header */}
        <div className="p-4 bg-nexus-surface/90 border-b border-nexus-border flex items-center justify-between backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-nexus-purple to-nexus-blue flex items-center justify-center text-white font-black text-xs">
              N
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                NEXUS Mobile
                <span className="w-1.5 h-1.5 rounded-full bg-nexus-green animate-pulse" />
              </div>
              <div className="text-[10px] text-nexus-text-muted">Compact Node Connected</div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button 
              onClick={() => onNavigate("screen-01-home")}
              className="text-[11px] px-2.5 py-1 rounded-md bg-nexus-purple/20 text-nexus-purple font-mono font-medium hover:bg-nexus-purple/30 transition-colors"
            >
              Desktop Mode
            </button>
          </div>
        </div>

        {/* Dynamic Mobile Viewport Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* TAB: COMMAND */}
          {activeTab === "command" && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3.5 rounded-xl bg-nexus-surface/80 border border-nexus-purple/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Sparkles className="w-3.5 h-3.5 text-nexus-purple" />
                  NEXUS Core Ready
                </div>
                <p className="text-[11px] text-nexus-text-muted">
                  Type a command or trigger quick automation workflows.
                </p>
              </div>

              {/* Mobile Command Input Box */}
              <div className="relative">
                <input 
                  type="text"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  placeholder="Ask NEXUS anything..."
                  className="w-full bg-nexus-surface border border-nexus-border rounded-xl pl-3 pr-10 py-3 text-xs text-white placeholder-nexus-text-muted focus:outline-none focus:border-nexus-purple"
                />
                <button 
                  onClick={() => {
                    if (commandInput) {
                      onNavigate("screen-02-command");
                    }
                  }}
                  className="absolute right-2 top-2.5 p-1.5 rounded-lg bg-nexus-purple text-white hover:bg-nexus-purple-hover"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-semibold text-nexus-text uppercase tracking-wider">Quick Commands</div>
                <div className="space-y-1.5">
                  {[
                    "Summarize today's work",
                    "Run development workflow",
                    "Find latest project files",
                    "Check system health"
                  ].map((cmd, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setCommandInput(cmd);
                      }}
                      className="w-full p-2.5 rounded-lg bg-nexus-surface/40 hover:bg-nexus-surface border border-nexus-border text-left text-xs text-nexus-text flex items-center justify-between"
                    >
                      <span className="truncate">{cmd}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-nexus-text-muted shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Task Snippet */}
              <div className="p-3 rounded-xl bg-nexus-surface/50 border border-nexus-border space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-nexus-text-muted">Active Task</span>
                  <span className="text-nexus-purple font-mono font-semibold">72%</span>
                </div>
                <div className="text-xs font-bold text-white truncate">Complete NEXUS PRD &amp; Engine</div>
                <div className="w-full h-1 bg-nexus-surface rounded-full overflow-hidden">
                  <div className="w-[72%] h-full bg-nexus-purple rounded-full" />
                </div>
              </div>
            </div>
          )}

          {/* TAB: TASKS */}
          {activeTab === "tasks" && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Active Tasks</span>
                <span className="text-[11px] text-nexus-purple font-mono">{mockTasks.length} Total</span>
              </div>

              <div className="space-y-2">
                {mockTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => onNavigate("screen-07-task-detail")}
                    className="p-3 rounded-xl bg-nexus-surface/60 border border-nexus-border hover:border-nexus-purple/50 cursor-pointer transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">{t.title}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-nexus-purple/10 text-nexus-purple">{t.priority}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-nexus-text-muted">
                      <span>{t.agentModule}</span>
                      <span className="font-mono">{t.progress}%</span>
                    </div>
                    <div className="w-full h-1 bg-nexus-surface rounded-full overflow-hidden">
                      <div className="h-full bg-nexus-purple rounded-full" style={{ width: `${t.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: ACTIVITY */}
          {activeTab === "activity" && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Live Activity</span>
                <span className="w-2 h-2 rounded-full bg-nexus-green animate-pulse" />
              </div>

              <div className="space-y-2">
                {mockActivity.map((act) => (
                  <div
                    key={act.id}
                    className="p-2.5 rounded-xl bg-nexus-surface/50 border border-nexus-border space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] text-nexus-text-muted">
                      <span className="font-mono text-nexus-purple uppercase">{act.category}</span>
                      <span>{act.timestamp}</span>
                    </div>
                    <p className="text-xs text-nexus-text font-medium">{act.action}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: AUTOMATIONS */}
          {activeTab === "automations" && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Automations</span>
                <button 
                  onClick={() => onNavigate("screen-09-automation-builder")}
                  className="text-[10px] text-nexus-purple font-semibold hover:underline"
                >
                  + New
                </button>
              </div>

              <div className="space-y-2">
                {mockAutomations.map((auto) => (
                  <div
                    key={auto.id}
                    className="p-3 rounded-xl bg-nexus-surface/60 border border-nexus-border space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-white truncate">{auto.name}</div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-nexus-green/10 text-nexus-green">{auto.status}</span>
                    </div>
                    <div className="text-[11px] text-nexus-text-muted font-mono">{auto.schedule}</div>
                    <div className="flex items-center justify-between pt-1 border-t border-nexus-border text-[11px]">
                      <span className="text-nexus-text-muted">{auto.nodes?.length ?? 4} Nodes</span>
                      <button 
                        onClick={() => onNavigate("screen-10-automation-run")}
                        className="text-nexus-purple font-semibold flex items-center gap-1"
                      >
                        <Play className="w-3 h-3" /> Run
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Notifications</span>
                <span className="text-[10px] font-mono text-nexus-purple">{mockNotifications.length} New</span>
              </div>

              <div className="space-y-2">
                {mockNotifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl border space-y-1 ${
                      n.read ? "bg-nexus-surface/30 border-nexus-border" : "bg-nexus-surface/80 border-nexus-purple/40"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-mono text-nexus-purple uppercase">{n.category}</span>
                      <span className="text-nexus-text-muted">{n.timestamp}</span>
                    </div>
                    <div className="text-xs font-bold text-white">{n.title}</div>
                    <p className="text-[11px] text-nexus-text-muted leading-relaxed">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <div className="p-2 bg-nexus-surface/95 border-t border-nexus-border grid grid-cols-5 gap-1 shrink-0 backdrop-blur-md">
          {[
            { id: "command", label: "Command", icon: Terminal },
            { id: "tasks", label: "Tasks", icon: CheckSquare },
            { id: "activity", label: "Activity", icon: Activity },
            { id: "automations", label: "Auto", icon: Zap },
            { id: "notifications", label: "Alerts", icon: Bell },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as MobileTab)}
                className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  isActive 
                    ? "bg-nexus-purple/15 text-nexus-purple font-semibold" 
                    : "text-nexus-text-muted hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px]">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
