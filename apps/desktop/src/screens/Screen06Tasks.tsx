'use client';

import React, { useState } from 'react';
import { ScreenId, TaskItem } from '../types/nexus';
import { INITIAL_TASKS } from '../data/mockData';
import {
  ListTodo,
  Plus,
  Play,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  ArrowRight,
  Shield,
  Activity,
} from 'lucide-react';

interface Screen06TasksProps {
  onNavigate: (screen: ScreenId) => void;
  onSelectTask: (task: TaskItem) => void;
}

export const Screen06Tasks: React.FC<Screen06TasksProps> = ({
  onNavigate,
  onSelectTask,
}) => {
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [filter, setFilter] = useState<'all' | 'active' | 'waiting' | 'completed' | 'failed' | 'scheduled'>('all');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const filteredTasks = tasks.filter((t) => (filter === 'all' ? true : t.status === filter));

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: TaskItem = {
      id: `tsk_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      title: newTitle,
      description: newDesc || 'Autonomous engineering task orchestrated via NEXUS DAG state machine.',
      priority: 'high',
      progress: 0,
      status: 'active',
      aiStatus: 'Queued for NEXUS Planner agent',
      createdAt: 'Just now',
      deadline: 'Today',
      relatedFiles: ['services/backend/src/nexus/main.py'],
      relatedApps: ['Visual Studio Code'],
      steps: [
        { name: 'Understand request intent', status: 'current' },
        { name: 'Gather AST code context', status: 'pending' },
        { name: 'Execute sandbox patch', status: 'pending' },
        { name: 'Validate with pytest', status: 'pending' },
      ],
    };

    setTasks((prev) => [newTask, ...prev]);
    setShowNewTaskModal(false);
    setNewTitle('');
    setNewDesc('');
    onSelectTask(newTask);
    onNavigate('07-task-detail');
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#050B18] p-6 space-y-5 select-none font-mono max-w-6xl mx-auto w-full cyber-grid-bg text-[#EAF4FF]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1B2D52] pb-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#52E5FF] flex items-center gap-1.5">
            <ListTodo className="h-3.5 w-3.5" /> SCREEN 06 — TASK EXECUTION MATRIX
          </div>
          <h2 className="text-lg font-black text-[#EAF4FF] tracking-wide mt-1">
            Autonomous Multi-Agent Task Operations
          </h2>
          <p className="text-xs text-[#8FA6C8] mt-0.5">
            Active task dependency graphs, tool executions, and verification pipelines.
          </p>
        </div>

        <button
          onClick={() => setShowNewTaskModal(true)}
          className="px-3.5 py-2 rounded-lg bg-[#52E5FF] hover:bg-[#398BFF] text-[#050B18] font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-[0_0_12px_rgba(82,229,255,0.3)]"
        >
          <Plus className="h-4 w-4" />
          <span>NEW TASK DAG</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1B2D52] pb-3 text-xs overflow-x-auto">
        {(['all', 'active', 'waiting', 'completed', 'failed', 'scheduled'] as const).map((tab) => {
          const count = tab === 'all' ? tasks.length : tasks.filter((t) => t.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg uppercase tracking-wider font-bold transition cursor-pointer flex items-center gap-2 ${
                filter === tab
                  ? 'bg-[#111C35] text-[#52E5FF] border border-[#52E5FF]/60 shadow-[0_0_10px_rgba(82,229,255,0.15)]'
                  : 'text-[#8FA6C8] hover:text-[#EAF4FF] hover:bg-[#111C35]/50 border border-transparent'
              }`}
            >
              <span>{tab}</span>
              <span className="rounded bg-[#050B18] border border-[#1B2D52] px-1.5 py-0.2 text-[10px] text-[#647A9B]">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            onClick={() => {
              onSelectTask(task);
              onNavigate('07-task-detail');
            }}
            className="cyber-panel p-4 bg-[#0A1225] border border-[#1B2D52] hover:border-[#52E5FF]/60 cursor-pointer transition space-y-3 shadow-[0_0_15px_rgba(82,229,255,0.05)] group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-[#52E5FF] font-bold">{task.id}</span>
                  <span className="text-[#647A9B]">•</span>
                  <span className="text-[#8FA6C8]">{task.createdAt}</span>
                </div>
                <h3 className="text-sm font-bold text-[#EAF4FF] group-hover:text-[#52E5FF] transition leading-snug">
                  {task.title}
                </h3>
              </div>
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${
                  task.status === 'active'
                    ? 'bg-[#52E5FF]/10 text-[#52E5FF] border-[#52E5FF]/40 shadow-[0_0_6px_rgba(82,229,255,0.2)]'
                    : task.status === 'completed'
                    ? 'bg-[#45E6B0]/10 text-[#45E6B0] border-[#45E6B0]/40'
                    : 'bg-[#FFC76A]/10 text-[#FFC76A] border-[#FFC76A]/40'
                }`}
              >
                {task.status}
              </span>
            </div>

            <p className="text-xs text-[#8FA6C8] leading-relaxed line-clamp-2">
              {task.description}
            </p>

            {/* Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#647A9B]">{task.aiStatus}</span>
                <span className="text-[#52E5FF] font-bold">{task.progress}%</span>
              </div>
              <div className="w-full bg-[#050B18] h-1.5 rounded-full overflow-hidden border border-[#1B2D52]">
                <div
                  className="bg-gradient-to-r from-[#398BFF] to-[#52E5FF] h-full transition-all duration-500 shadow-[0_0_8px_#52E5FF]"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </div>

            {/* Task Card Footer */}
            <div className="pt-2 border-t border-[#1B2D52] flex items-center justify-between text-[10px] text-[#8FA6C8]">
              <div className="flex items-center gap-2">
                <span>FILES: <strong className="text-[#EAF4FF]">{task.relatedFiles.length}</strong></span>
                <span>•</span>
                <span>STEPS: <strong className="text-[#EAF4FF]">{task.steps.length}</strong></span>
              </div>
              <span className="text-[#52E5FF] group-hover:translate-x-1 transition flex items-center gap-1 font-bold">
                VIEW DAG →
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 bg-[#050B18]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="cyber-panel p-6 bg-[#0A1225] border-2 border-[#52E5FF] max-w-lg w-full space-y-4 shadow-[0_0_30px_rgba(82,229,255,0.2)]">
            <div className="flex items-center justify-between border-b border-[#1B2D52] pb-3">
              <h3 className="text-sm font-bold text-[#52E5FF] tracking-wider uppercase">
                CREATE NEW AUTONOMOUS TASK DAG
              </h3>
              <button
                onClick={() => setShowNewTaskModal(false)}
                className="text-[#647A9B] hover:text-[#EAF4FF] text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[#8FA6C8] font-bold">TASK TITLE / GOAL</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Implement rate limiting and execute unit tests"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#050B18] border border-[#1B2D52] focus:border-[#52E5FF] rounded-lg p-2.5 text-[#EAF4FF] outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[#8FA6C8] font-bold">DETAILED SPECIFICATION</label>
                <textarea
                  rows={3}
                  placeholder="Provide architecture constraints, target directories, or tool policies..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-[#050B18] border border-[#1B2D52] focus:border-[#52E5FF] rounded-lg p-2.5 text-[#EAF4FF] outline-none font-mono resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1B2D52]">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#111C35] hover:bg-[#172544] border border-[#1B2D52] text-[#8FA6C8] font-bold transition cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#52E5FF] hover:bg-[#398BFF] text-[#050B18] font-bold transition cursor-pointer shadow-[0_0_10px_rgba(82,229,255,0.3)]"
                >
                  INITIALIZE DAG
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
