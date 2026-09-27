'use client';

import React, { useState } from 'react';
import { ScreenId } from '../types/nexus';
import {
  Zap,
  ListTodo,
  Cpu,
  Shield,
  Sliders,
  Sparkles,
  Send,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Smartphone,
  ExternalLink,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { INITIAL_TASKS, INITIAL_ACTIVITY, INITIAL_MODULES } from '../data/mockData';

interface Screen34Props {
  onNavigate: (screen: ScreenId) => void;
}

type MobileTab = 'overview' | 'tasks' | 'agents' | 'approvals' | 'more';

export const Screen34CompactResponsive: React.FC<Screen34Props> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<MobileTab>('overview');
  const [commandInput, setCommandInput] = useState('');

  const activeTasks = INITIAL_TASKS.slice(0, 3);
  const recentActivity = INITIAL_ACTIVITY.slice(0, 4);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-center min-h-full bg-[#050B18] text-[#EAF4FF] cyber-grid-bg">
      {/* Phone Mockup Frame Container */}
      <div className="w-full max-w-sm bg-[#0A1225] border-2 border-[#1B2D52] rounded-[36px] overflow-hidden shadow-[0_0_40px_rgba(82,229,255,0.15)] flex flex-col h-[760px] relative">
        
        {/* Top Notch / Status Bar */}
        <div className="h-6 bg-[#050B18] px-6 flex items-center justify-between text-[10px] font-mono text-[#647A9B] shrink-0 border-b border-[#1B2D52]">
          <span>09:41</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[#52E5FF]">5G</span>
            <span>100%</span>
          </div>
        </div>

        {/* Mobile Header / Desktop Status Bar */}
        <div className="p-3.5 bg-[#0A1225] border-b border-[#1B2D52] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-[#111C35] border border-[#52E5FF]/60 flex items-center justify-center shadow-[0_0_8px_rgba(82,229,255,0.3)]">
              <span className="font-mono font-black text-xs text-[#52E5FF]">NX</span>
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-[#EAF4FF] flex items-center gap-1.5">
                <span>NEXUS Mobile</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#45E6B0] animate-pulse" />
              </div>
              <div className="text-[9px] text-[#45E6B0] font-mono">Workstation-01 (14ms)</div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('01-home')}
            className="text-[10px] font-mono px-2 py-1 rounded bg-[#111C35] hover:bg-[#172544] border border-[#1B2D52] text-[#52E5FF] transition cursor-pointer"
          >
            Desktop HUD
          </button>
        </div>

        {/* Dynamic Tab Body Viewport */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3 font-mono">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-3">
              {/* Neural Core Mini HUD */}
              <div className="cyber-panel p-3 bg-[#111C35] border border-[#1B2D52] flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#0A1225] border border-[#52E5FF]/50 flex items-center justify-center shrink-0">
                  <Cpu className="h-5 w-5 text-[#52E5FF] animate-pulse" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#EAF4FF]">ENGINE: EXECUTING</div>
                  <div className="text-[10px] text-[#8FA6C8]">Ollama Qwen2.5-Coder (GPU)</div>
                </div>
              </div>

              {/* Mobile Command Input Box */}
              <div className="relative">
                <input
                  type="text"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  placeholder="Dispatch command to desktop..."
                  className="w-full bg-[#050B18] border border-[#1B2D52] focus:border-[#52E5FF] rounded-xl pl-3 pr-10 py-2.5 text-xs text-[#EAF4FF] placeholder-[#647A9B] outline-none"
                />
                <button
                  onClick={() => {
                    if (commandInput) {
                      onNavigate('02-command');
                    }
                  }}
                  className="absolute right-1.5 top-1.5 p-1.5 rounded-lg bg-[#52E5FF] text-[#050B18] font-bold hover:bg-[#398BFF] cursor-pointer"
                >
                  <Send className="h-3 w-3" />
                </button>
              </div>

              {/* Pending Approvals Callout */}
              <div
                onClick={() => setActiveTab('approvals')}
                className="p-3 rounded-xl bg-[#0A1225] border border-[#FFC76A]/60 flex items-center justify-between cursor-pointer hover:bg-[#111C35] transition shadow-[0_0_10px_rgba(255,199,106,0.15)]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded bg-[#FFC76A]/20 text-[#FFC76A]">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#FFC76A]">1 Pending Approval</div>
                    <div className="text-[9px] text-[#8FA6C8]">execute_command: &quot;git push&quot;</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-[#FFC76A]" />
              </div>

              {/* Active Task Card */}
              <div className="space-y-1.5">
                <div className="text-[9px] font-bold text-[#647A9B] uppercase tracking-wider">
                  ACTIVE TASK IN PROGRESS
                </div>
                <div
                  onClick={() => onNavigate('07-task-detail')}
                  className="cyber-panel p-3 bg-[#111C35] border border-[#1B2D52] space-y-2 cursor-pointer hover:border-[#52E5FF]/40 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#52E5FF]">{activeTasks[0].id}</span>
                    <span className="text-[9px] text-[#45E6B0] font-bold">42%</span>
                  </div>
                  <div className="text-xs font-bold text-[#EAF4FF] leading-snug">{activeTasks[0].title}</div>
                  <div className="w-full bg-[#050B18] h-1.5 rounded-full overflow-hidden border border-[#1B2D52]">
                    <div className="bg-[#52E5FF] h-full w-[42%]" />
                  </div>
                </div>
              </div>

              {/* Live Operations Stream */}
              <div className="space-y-1.5">
                <div className="text-[9px] font-bold text-[#647A9B] uppercase tracking-wider">
                  LIVE OPERATIONS FEED
                </div>
                <div className="space-y-1.5">
                  {recentActivity.map((act) => (
                    <div key={act.id} className="p-2 rounded-lg bg-[#050B18] border border-[#1B2D52] flex items-center justify-between text-[9px]">
                      <span className="text-[#8FA6C8] truncate max-w-[180px]">{act.title}</span>
                      <span className="text-[#45E6B0]">● OK</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TASKS */}
          {activeTab === 'tasks' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-[#1B2D52] pb-2">
                <span className="text-xs font-bold text-[#52E5FF]">TASK OPERATIONS</span>
                <span className="text-[10px] text-[#8FA6C8]">3 ACTIVE</span>
              </div>
              {activeTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onNavigate('07-task-detail')}
                  className="p-3 rounded-xl bg-[#111C35] border border-[#1B2D52] space-y-1.5 cursor-pointer hover:border-[#52E5FF]/40 transition"
                >
                  <div className="flex items-center justify-between text-[9px]">
                    <span className="text-[#52E5FF] font-bold">{task.id}</span>
                    <span className="text-[#45E6B0]">{task.status.toUpperCase()}</span>
                  </div>
                  <div className="text-xs font-bold text-[#EAF4FF]">{task.title}</div>
                  <div className="text-[9px] text-[#647A9B]">{task.aiStatus}</div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: AGENTS */}
          {activeTab === 'agents' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-[#1B2D52] pb-2">
                <span className="text-xs font-bold text-[#9B7CFF]">INTELLIGENCE MODULES</span>
                <span className="text-[10px] text-[#45E6B0]">7 READY</span>
              </div>
              {INITIAL_MODULES.map((mod) => (
                <div
                  key={mod.id}
                  onClick={() => onNavigate('04-modules')}
                  className="p-2.5 rounded-lg bg-[#111C35] border border-[#1B2D52] flex items-center justify-between cursor-pointer hover:border-[#9B7CFF]/50 transition"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{mod.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-[#EAF4FF]">{mod.name}</div>
                      <div className="text-[9px] text-[#647A9B] truncate max-w-[150px]">{mod.tagline}</div>
                    </div>
                  </div>
                  <span className="text-[9px] text-[#45E6B0] font-bold">READY</span>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: APPROVALS */}
          {activeTab === 'approvals' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#1B2D52] pb-2">
                <span className="text-xs font-bold text-[#FFC76A]">APPROVAL QUEUE</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#FFC76A]/20 text-[#FFC76A]">1 PENDING</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#111C35] border border-[#FFC76A] space-y-2.5 shadow-[0_0_15px_rgba(255,199,106,0.15)]">
                <div className="text-[10px] text-[#FFC76A] font-bold">HIGH-RISK TOOL EXECUTION</div>
                <div className="text-xs text-[#EAF4FF] font-bold leading-snug">
                  DeveloperAgent requested: <code className="text-[#52E5FF]">execute_command(&quot;git push&quot;)</code>
                </div>
                <div className="text-[9px] text-[#8FA6C8]">
                  Affected Files: 3 repository files in feat/dag-recovery branch
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => onNavigate('24-ai-confirmation')}
                    className="py-1.5 rounded-lg bg-[#45E6B0] text-[#050B18] font-bold text-xs shadow-[0_0_8px_rgba(69,230,176,0.3)] cursor-pointer"
                  >
                    APPROVE
                  </button>
                  <button
                    onClick={() => onNavigate('07-task-detail')}
                    className="py-1.5 rounded-lg bg-[#050B18] border border-[#1B2D52] text-[#FF647C] font-bold text-xs cursor-pointer"
                  >
                    REJECT
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MORE & SETTINGS */}
          {activeTab === 'more' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-[#1B2D52] pb-2">
                <span className="text-xs font-bold text-[#8FA6C8]">NODE CONTROLS</span>
                <span className="text-[10px] text-[#52E5FF]">v1.0.0</span>
              </div>

              {[
                { label: 'Desktop Connection (mTLS)', screen: '21-settings' as ScreenId },
                { label: 'Security & Biometrics', screen: '21-settings' as ScreenId },
                { label: 'Notification Settings', screen: '20-notifications' as ScreenId },
                { label: 'Execution Audit Trace', screen: '12-trace' as ScreenId },
              ].map((item, i) => (
                <div
                  key={i}
                  onClick={() => onNavigate(item.screen)}
                  className="p-3 rounded-lg bg-[#111C35] border border-[#1B2D52] flex items-center justify-between text-xs text-[#EAF4FF] hover:border-[#52E5FF]/40 cursor-pointer transition"
                >
                  <span>{item.label}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-[#647A9B]" />
                </div>
              ))}
            </div>
          )}

        </div>

        {/* 5-Tab Persistent Bottom Navigation Bar */}
        <div className="h-16 bg-[#050B18] border-t border-[#1B2D52] grid grid-cols-5 items-center px-1 shrink-0">
          {[
            { id: 'overview' as MobileTab, label: 'Overview', icon: <Zap className="h-4 w-4" /> },
            { id: 'tasks' as MobileTab, label: 'Tasks', icon: <ListTodo className="h-4 w-4" /> },
            { id: 'agents' as MobileTab, label: 'Agents', icon: <Cpu className="h-4 w-4" /> },
            { id: 'approvals' as MobileTab, label: 'Approvals', icon: <Shield className="h-4 w-4 text-[#FFC76A]" />, badge: '1' },
            { id: 'more' as MobileTab, label: 'More', icon: <Sliders className="h-4 w-4" /> },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1 relative cursor-pointer transition ${
                  isSelected ? 'text-[#52E5FF] font-bold' : 'text-[#647A9B] hover:text-[#8FA6C8]'
                }`}
              >
                {tab.icon}
                <span className="text-[9px] font-mono mt-0.5">{tab.label}</span>
                {tab.badge && (
                  <span className="absolute top-0.5 right-2 h-3.5 min-w-[14px] px-0.5 rounded-full bg-[#FFC76A] text-[#050B18] text-[8px] font-bold font-mono flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
