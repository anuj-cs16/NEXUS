'use client';

import React, { useState } from 'react';
import { ScreenId, TaskItem } from '../types/nexus';
import { INITIAL_TASKS } from '../data/mockData';
import {
  Terminal,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  ArrowLeft,
  GitBranch,
  Shield,
  Layers,
  Clock,
  Eye,
  FileCode2,
} from 'lucide-react';

interface Screen07TaskDetailProps {
  task?: TaskItem;
  onNavigate: (screen: ScreenId) => void;
}

export const Screen07TaskDetail: React.FC<Screen07TaskDetailProps> = ({
  task = INITIAL_TASKS[0],
  onNavigate,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'diff' | 'logs'>('timeline');

  const timelineSteps = [
    {
      num: '01',
      title: 'REQUEST INTENT',
      desc: 'Parsed natural language prompt & inferred technical DAG requirements',
      agent: 'PlannerAgent',
      status: 'completed',
      duration: '42ms',
    },
    {
      num: '02',
      title: 'CONTEXT RETRIEVAL',
      desc: 'Indexed 24 workspace files & generated AST symbol relationships',
      agent: 'PlannerAgent',
      status: 'completed',
      duration: '180ms',
    },
    {
      num: '03',
      title: 'ARCHITECTURE & PLAN',
      desc: 'Identified 8 model schemas & 19 API endpoints in FastAPI backend',
      agent: 'PlannerAgent',
      status: 'completed',
      duration: '310ms',
    },
    {
      num: '04',
      title: 'TOOL EXECUTION',
      desc: 'Executing patch_file on task_service.py and running isolated pytest in sandbox',
      agent: 'DeveloperAgent',
      status: 'running',
      duration: '840ms active',
    },
    {
      num: '05',
      title: 'SECURITY & TEST VALIDATION',
      desc: 'Run 19 automated pytest assertions & verify zero DPAPI secret exposure',
      agent: 'Security + Tester',
      status: 'pending',
      duration: '--',
    },
    {
      num: '06',
      title: 'HUMAN APPROVAL & COMMIT',
      desc: 'Create signed atomic git commit with changelog and audit log trace',
      agent: 'ReviewerAgent',
      status: 'pending',
      duration: '--',
    },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#050B18] p-6 space-y-5 select-none font-mono max-w-6xl mx-auto w-full cyber-grid-bg text-[#EAF4FF]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1B2D52] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('06-tasks')}
              className="flex items-center gap-1.5 text-xs text-[#8FA6C8] hover:text-[#52E5FF] transition cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>TASKS_MATRIX</span>
            </button>
            <span className="text-[10px] text-[#647A9B]">{task.id}</span>
            <span className="rounded bg-[#52E5FF]/15 border border-[#52E5FF]/40 px-2 py-0.5 text-[10px] text-[#52E5FF] font-bold shadow-[0_0_8px_rgba(82,229,255,0.2)]">
              {task.progress}% EXECUTING
            </span>
          </div>
          <h2 className="text-lg font-black text-[#EAF4FF] tracking-wide">{task.title}</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
              isPaused
                ? 'bg-[#FFC76A]/20 border-[#FFC76A] text-[#FFC76A] shadow-[0_0_8px_rgba(255,199,106,0.3)]'
                : 'bg-[#111C35] border-[#1B2D52] text-[#8FA6C8] hover:text-[#EAF4FF]'
            }`}
          >
            {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            <span>{isPaused ? 'RESUME DAG' : 'PAUSE EXECUTION'}</span>
          </button>
          <button
            onClick={() => onNavigate('06-tasks')}
            className="px-3 py-1.5 rounded-lg bg-[#FF647C]/15 hover:bg-[#FF647C]/25 border border-[#FF647C]/40 text-xs font-bold text-[#FF647C] transition cursor-pointer"
          >
            CANCEL TASK
          </button>
        </div>
      </div>

      {/* Main Workspace Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left Column: 6-Stage Execution Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="cyber-panel p-5 bg-[#0A1225] border border-[#1B2D52] space-y-4 shadow-[0_0_15px_rgba(82,229,255,0.05)]">
            <div className="flex items-center justify-between border-b border-[#1B2D52] pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-[#52E5FF]" />
                <h3 className="text-xs font-bold text-[#52E5FF] tracking-wider uppercase">
                  MULTI-AGENT DAG EXECUTION PIPELINE
                </h3>
              </div>
              <span className="text-[10px] text-[#45E6B0]">STAGE 04 / 06 ACTIVE</span>
            </div>

            <div className="space-y-3 pt-1">
              {timelineSteps.map((step) => {
                const isCompleted = step.status === 'completed';
                const isRunning = step.status === 'running';

                return (
                  <div
                    key={step.num}
                    className={`flex items-start gap-3.5 p-3.5 rounded-lg border transition ${
                      isRunning
                        ? 'bg-[#111C35] border-[#52E5FF] shadow-[0_0_12px_rgba(82,229,255,0.2)]'
                        : isCompleted
                        ? 'bg-[#0A1225] border-[#45E6B0]/40'
                        : 'bg-[#050B18] border-[#1B2D52] opacity-50'
                    }`}
                  >
                    <div
                      className={`h-7 w-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                        isCompleted
                          ? 'bg-[#45E6B0] text-[#050B18] shadow-[0_0_8px_#45E6B0]'
                          : isRunning
                          ? 'bg-[#52E5FF] text-[#050B18] shadow-[0_0_8px_#52E5FF] animate-pulse'
                          : 'bg-[#111C35] text-[#647A9B] border border-[#1B2D52]'
                      }`}
                    >
                      {step.num}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#EAF4FF]">{step.title}</span>
                        <span className="text-[10px] text-[#647A9B]">[{step.agent}]</span>
                      </div>
                      <p className="text-[11px] text-[#8FA6C8] leading-snug">{step.desc}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-[10px] font-bold ${isCompleted ? 'text-[#45E6B0]' : isRunning ? 'text-[#52E5FF]' : 'text-[#647A9B]'}`}>
                        {step.duration}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Code Diff / Tool Trace Terminal */}
          <div className="cyber-panel p-4 bg-[#0A1225] border border-[#1B2D52] space-y-3">
            <div className="flex items-center justify-between border-b border-[#1B2D52] pb-2">
              <span className="text-xs font-bold text-[#9B7CFF] flex items-center gap-1.5">
                <FileCode2 className="h-4 w-4" /> LIVE TOOL DIFF: services/backend/src/nexus/services/task_service.py
              </span>
              <span className="text-[10px] text-[#45E6B0]">+34 lines, -12 lines</span>
            </div>

            <div className="p-3 rounded bg-[#050B18] border border-[#1B2D52] text-[11px] font-mono overflow-x-auto space-y-1">
              <div className="text-[#647A9B]">@@ -45,12 +45,18 @@ async def execute_step(self, step: TaskStep):</div>
              <div className="text-[#8FA6C8]">     # Validate tool permission boundary</div>
              <div className="text-[#FF647C] bg-[#FF647C]/10 px-1">-    if not self.policy.is_allowed(step.tool_name):</div>
              <div className="text-[#FF647C] bg-[#FF647C]/10 px-1">-        raise PermissionError(&quot;Tool forbidden&quot;)</div>
              <div className="text-[#45E6B0] bg-[#45E6B0]/10 px-1">+    authorized, reason = await self.policy_engine.evaluate(step.tool_name, step.params)</div>
              <div className="text-[#45E6B0] bg-[#45E6B0]/10 px-1">+    if not authorized:</div>
              <div className="text-[#45E6B0] bg-[#45E6B0]/10 px-1">+        return await self.approval_service.create_request(step, reason)</div>
              <div className="text-[#8FA6C8]">     return await self.tool_runner.dispatch(step)</div>
            </div>
          </div>
        </div>

        {/* Right Column: Agent Meta & Telemetry */}
        <div className="space-y-4">
          {/* Active Agents Card */}
          <div className="cyber-panel p-4 bg-[#0A1225] border border-[#1B2D52] space-y-3">
            <div className="flex items-center justify-between border-b border-[#1B2D52] pb-2">
              <span className="text-xs font-bold text-[#8FA6C8]">ASSIGNED AGENTS</span>
              <span className="text-[10px] text-[#52E5FF]">2 ACTIVE</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded bg-[#111C35] border border-[#1B2D52] flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#52E5FF]">DeveloperAgent</div>
                  <div className="text-[10px] text-[#647A9B]">Synthesizing AST patch</div>
                </div>
                <span className="text-[10px] text-[#45E6B0]">RUNNING</span>
              </div>

              <div className="p-2.5 rounded bg-[#111C35] border border-[#1B2D52] flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#9B7CFF]">SecurityAgent</div>
                  <div className="text-[10px] text-[#647A9B]">Policy inspection gate</div>
                </div>
                <span className="text-[10px] text-[#FFC76A]">QUEUED</span>
              </div>
            </div>
          </div>

          {/* Task Metadata Card */}
          <div className="cyber-panel p-4 bg-[#0A1225] border border-[#1B2D52] space-y-2.5 text-xs">
            <div className="text-[#8FA6C8] font-bold border-b border-[#1B2D52] pb-1.5">TASK PARAMETERS</div>
            <div className="flex items-center justify-between text-[#EAF4FF]">
              <span className="text-[#647A9B]">WORKSPACE:</span>
              <span>c:/NEXUS</span>
            </div>
            <div className="flex items-center justify-between text-[#EAF4FF]">
              <span className="text-[#647A9B]">GIT BRANCH:</span>
              <span className="text-[#52E5FF]">feat/dag-recovery</span>
            </div>
            <div className="flex items-center justify-between text-[#EAF4FF]">
              <span className="text-[#647A9B]">TARGET LLM:</span>
              <span className="text-[#9B7CFF]">qwen2.5-coder:7b</span>
            </div>
            <div className="flex items-center justify-between text-[#EAF4FF]">
              <span className="text-[#647A9B]">SANDBOX:</span>
              <span className="text-[#45E6B0]">DOCKER (ISOLATED)</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
