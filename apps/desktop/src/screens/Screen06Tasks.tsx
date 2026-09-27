'use client';

import React, { useState } from 'react';
import { ScreenId, TaskItem } from '../types/nexus';
import { INITIAL_TASKS } from '../data/mockData';

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
      description: newDesc || 'Autonomous engineering task initiated by user.',
      priority: 'high',
      progress: 0,
      status: 'active',
      aiStatus: 'Queued for NEXUS Planner agent',
      createdAt: 'Just now',
      deadline: 'Today',
      relatedFiles: ['src/main.py'],
      relatedApps: ['Visual Studio Code'],
      steps: [
        { name: 'Understand request', status: 'current' },
        { name: 'Gather context', status: 'pending' },
        { name: 'Execute code changes', status: 'pending' },
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
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#0a0a0f] p-8 space-y-6 select-none font-sans max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2a2a3a] pb-4">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#818cf8]">
            SCREEN 06 — AI TASK MANAGEMENT
          </div>
          <h2 className="text-xl font-black text-white mt-0.5">Engineering Tasks & Sprints</h2>
          <p className="text-xs text-[#9494a8] mt-1">
            Autonomous multi-step engineering tasks orchestrated through the NEXUS DAG state machine.
          </p>
        </div>

        <button
          onClick={() => setShowNewTaskModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#818cf8] hover:opacity-90 text-xs font-bold text-white shadow-lg shadow-[#6366f1]/25 flex items-center gap-2 transition cursor-pointer"
        >
          <span>+ Create New Task</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#2a2a3a] pb-3 text-xs overflow-x-auto">
        {(['all', 'active', 'waiting', 'completed', 'failed', 'scheduled'] as const).map((tab) => {
          const count = tab === 'all' ? tasks.length : tasks.filter((t) => t.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl capitalize font-medium transition cursor-pointer flex items-center gap-2 ${
                filter === tab
                  ? 'bg-[#1a1a25] text-white border border-[#6366f1]/50 shadow-sm'
                  : 'text-[#9494a8] hover:text-white hover:bg-[#1a1a25]/50'
              }`}
            >
              <span>{tab}</span>
              <span className="rounded bg-[#22222f] px-1.5 py-0.2 text-[10px] font-mono text-[#6b6b80]">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredTasks.map((task) => {
          const isComplete = task.status === 'completed';
          const isWaiting = task.status === 'waiting';

          return (
            <div
              key={task.id}
              onClick={() => { onSelectTask(task); onNavigate('07-task-detail'); }}
              className="rounded-2xl bg-[#12121a] hover:bg-[#161622] border border-[#2a2a3a] hover:border-[#6366f1]/60 p-5 shadow-xl transition flex flex-col justify-between cursor-pointer space-y-4 group"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#6b6b80]">{task.id}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-2 py-0.5 text-[9px] font-mono uppercase font-bold ${
                        task.priority === 'critical'
                          ? 'bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30'
                          : task.priority === 'high'
                          ? 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30'
                          : 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30'
                      }`}
                    >
                      {task.priority}
                    </span>

                    <span
                      className={`rounded px-2 py-0.5 text-[9px] font-mono uppercase font-bold ${
                        isComplete
                          ? 'bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30'
                          : isWaiting
                          ? 'bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/30 animate-pulse'
                          : 'bg-[#6366f1]/15 text-[#818cf8] border border-[#6366f1]/30'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#818cf8] transition">
                    {task.title}
                  </h3>
                  <p className="text-xs text-[#9494a8] mt-1 leading-relaxed line-clamp-2">
                    {task.description}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-[#818cf8] truncate max-w-[280px]">{task.aiStatus}</span>
                    <span className="text-white font-bold">{task.progress}%</span>
                  </div>
                  <div className="w-full bg-[#1a1a25] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#6366f1] to-[#34d399] h-full rounded-full transition-all duration-300"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Related Entities & Metadata */}
              <div className="pt-3 border-t border-[#2a2a3a] flex items-center justify-between text-[11px] font-mono text-[#6b6b80]">
                <div className="flex items-center gap-3">
                  <span>📁 {task.relatedFiles.length} files</span>
                  <span>•</span>
                  <span>💻 {task.relatedApps.length} apps</span>
                </div>
                <span>{task.createdAt}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Task Creation Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2a2a3a] pb-3">
              <h3 className="text-sm font-bold text-white">Create Autonomous AI Task</h3>
              <button onClick={() => setShowNewTaskModal(false)} className="text-[#6b6b80] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5">
              <div>
                <label className="block text-xs text-[#9494a8] mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement WebSocket rate limiter middleware"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#1a1a25] border border-[#2a2a3a] rounded-xl px-3.5 py-2 text-xs text-white focus:border-[#6366f1] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-[#9494a8] mb-1">Detailed Goal & Acceptance Criteria</label>
                <textarea
                  rows={4}
                  placeholder="Describe technical requirements, target files, and test criteria..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-[#1a1a25] border border-[#2a2a3a] rounded-xl px-3.5 py-2 text-xs text-white focus:border-[#6366f1] outline-none resize-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#2a2a3a]">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#1a1a25] hover:bg-[#22222f] text-xs text-[#9494a8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#818cf8] text-xs font-bold text-white shadow-lg shadow-[#6366f1]/25"
                >
                  Start Execution Pipeline ⚡
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
