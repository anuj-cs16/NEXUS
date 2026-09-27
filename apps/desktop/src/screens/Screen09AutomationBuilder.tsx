'use client';

import React, { useState } from 'react';
import { ScreenId, AutomationWorkflow } from '../types/nexus';
import { INITIAL_AUTOMATIONS } from '../data/mockData';

interface Screen09AutomationBuilderProps {
  workflow?: AutomationWorkflow;
  onNavigate: (screen: ScreenId) => void;
  onRequestPermission: (appName: string, reason: string) => void;
}

export const Screen09AutomationBuilder: React.FC<Screen09AutomationBuilderProps> = ({
  workflow = INITIAL_AUTOMATIONS[0],
  onNavigate,
  onRequestPermission,
}) => {
  const [nodes, setNodes] = useState(workflow.nodes);
  const [workflowName, setWorkflowName] = useState(workflow.name);
  const [testSuccess, setTestSuccess] = useState(false);

  const addNode = (type: 'action' | 'ai' | 'condition') => {
    const newNode = {
      id: `n_${Date.now()}`,
      type: type,
      label: type === 'ai' ? 'NEXUS AI Reasoning' : type === 'condition' ? 'Check AST Condition' : 'Execute Command Tool',
      subtitle: type === 'ai' ? 'Analyze generated changes' : 'Run command in workspace sandbox',
      icon: type === 'ai' ? '🧠' : type === 'condition' ? '⚡' : '💻',
    };
    setNodes((prev) => [...prev, newNode]);
  };

  const deleteNode = (id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleTestWorkflow = () => {
    onRequestPermission('Visual Studio Code & Terminal', 'Test execution of Morning Workspace automation nodes.');
    setTimeout(() => {
      setTestSuccess(true);
      setTimeout(() => setTestSuccess(false), 4000);
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#0a0a0f] p-8 space-y-6 select-none font-sans max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2a2a3a] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('08-automations')}
              className="text-xs text-[#9494a8] hover:text-white transition cursor-pointer"
            >
              ← Automations
            </button>
            <span className="text-[10px] font-mono text-[#fbbf24] font-bold">
              SCREEN 09 — VISUAL WORKFLOW BUILDER
            </span>
          </div>
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="text-xl font-black text-white bg-transparent outline-none focus:border-b border-[#fbbf24]"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTestWorkflow}
            className="px-4 py-2 rounded-xl bg-[#1a1a25] hover:bg-[#22222f] border border-[#2a2a3a] text-xs font-semibold text-white flex items-center gap-2 transition cursor-pointer"
          >
            <span>▶ Test Workflow</span>
          </button>
          <button
            onClick={() => onNavigate('10-automation-run')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] text-xs font-bold text-black shadow-lg shadow-[#fbbf24]/20 transition cursor-pointer"
          >
            Save & Deploy Node Graph
          </button>
        </div>
      </div>

      {/* Test Success Toast */}
      {testSuccess && (
        <div className="p-3.5 rounded-xl bg-[#22c55e]/15 border border-[#22c55e]/30 text-xs text-[#34d399] flex items-center justify-between animate-in fade-in duration-150">
          <span>✓ Workflow graph executed all 6 nodes cleanly with zero errors!</span>
          <button onClick={() => onNavigate('10-automation-run')} className="font-bold underline cursor-pointer">View Execution Trace →</button>
        </div>
      )}

      {/* Node Palette Controls */}
      <div className="flex items-center justify-between bg-[#12121a] p-4 rounded-2xl border border-[#2a2a3a]">
        <div className="text-xs font-mono text-[#9494a8]">Insert Step:</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => addNode('condition')}
            className="px-3 py-1.5 rounded-lg bg-[#1a1a25] hover:bg-[#22222f] border border-[#2a2a3a] text-xs font-mono text-[#818cf8] transition cursor-pointer"
          >
            + Condition
          </button>
          <button
            onClick={() => addNode('action')}
            className="px-3 py-1.5 rounded-lg bg-[#1a1a25] hover:bg-[#22222f] border border-[#2a2a3a] text-xs font-mono text-[#34d399] transition cursor-pointer"
          >
            + Action Tool
          </button>
          <button
            onClick={() => addNode('ai')}
            className="px-3 py-1.5 rounded-lg bg-[#1a1a25] hover:bg-[#22222f] border border-[#2a2a3a] text-xs font-mono text-[#ec4899] transition cursor-pointer"
          >
            + AI Reasoning
          </button>
        </div>
      </div>

      {/* Connected Visual Node Graph */}
      <div className="space-y-4 relative py-2">
        {nodes.map((node, index) => (
          <React.Fragment key={node.id}>
            <div className="relative z-10 rounded-2xl bg-[#12121a] border border-[#2a2a3a] hover:border-[#fbbf24]/60 p-5 shadow-xl transition flex items-center justify-between gap-4 group">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-[#1a1a25] border border-[#3a3a4a] flex items-center justify-center text-xl shrink-0 shadow-md">
                  {node.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[#22222f] px-1.5 py-0.2 text-[9px] font-mono uppercase text-[#fbbf24] font-bold">
                      {node.type}
                    </span>
                    <h4 className="text-sm font-bold text-white">{node.label}</h4>
                  </div>
                  <p className="text-xs text-[#9494a8] mt-0.5 font-mono">{node.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => deleteNode(node.id)}
                  className="h-8 w-8 rounded-lg bg-[#1a1a25] hover:bg-[#ef4444]/20 text-[#6b6b80] hover:text-[#ef4444] border border-[#2a2a3a] text-xs flex items-center justify-center transition cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Connecting Flow Arrow */}
            {index < nodes.length - 1 && (
              <div className="flex justify-center my-1">
                <div className="flex flex-col items-center">
                  <div className="h-4 w-[2px] bg-gradient-to-b from-[#fbbf24] to-[#6366f1]" />
                  <span className="text-[10px] text-[#fbbf24] font-black">▼</span>
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
