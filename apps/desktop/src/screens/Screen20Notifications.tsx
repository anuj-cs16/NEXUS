'use client';

import React, { useState } from 'react';
import { ScreenId, NotificationItem } from '../types/nexus';
import { INITIAL_NOTIFICATIONS } from '../data/mockData';

interface Screen20NotificationsProps {
  onNavigate: (screen: ScreenId) => void;
  onRequestPermission: (appName: string, reason: string) => void;
}

export const Screen20Notifications: React.FC<Screen20NotificationsProps> = ({
  onNavigate,
  onRequestPermission,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'ai' | 'tasks' | 'automations' | 'system' | 'security'>('all');

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const filtered = notifications.filter((n) => (filter === 'all' ? true : n.category === filter));

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#0a0a0f] p-8 space-y-6 select-none font-sans max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2a2a3a] pb-4">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#818cf8]">
            SCREEN 20 — NOTIFICATION CENTER
          </div>
          <h2 className="text-xl font-black text-white mt-0.5">System & AI Notifications</h2>
        </div>

        <button
          onClick={markAllRead}
          className="px-3.5 py-1.5 rounded-xl bg-[#1a1a25] hover:bg-[#22222f] border border-[#2a2a3a] text-xs font-semibold text-[#9494a8] hover:text-white transition cursor-pointer"
        >
          Mark all as read
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#2a2a3a] pb-3 text-xs overflow-x-auto">
        {(['all', 'ai', 'tasks', 'automations', 'system', 'security'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3.5 py-1.5 rounded-xl capitalize font-medium transition cursor-pointer ${
              filter === cat
                ? 'bg-[#1a1a25] text-white border border-[#6366f1]/50 shadow-sm'
                : 'text-[#9494a8] hover:text-white hover:bg-[#1a1a25]/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.map((notif, idx) => (
          <div
            key={idx}
            onClick={() => {
              if (notif.category === 'security') {
                onRequestPermission('Terminal & Test Runner', notif.message);
              } else if (notif.category === 'tasks') {
                onNavigate('07-task-detail');
              } else if (notif.category === 'ai') {
                onNavigate('19-insights');
              }
            }}
            className={`p-4 rounded-2xl border transition flex items-start justify-between gap-4 cursor-pointer ${
              notif.unread
                ? 'bg-[#161622] border-[#6366f1]/50 shadow-md'
                : 'bg-[#12121a] border-[#2a2a3a] hover:bg-[#1a1a25]'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <span className="text-xl mt-0.5">
                {notif.category === 'security' ? '⚠️' : notif.category === 'tasks' ? '🧪' : '✨'}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white">{notif.title}</h4>
                  <span
                    className={`rounded px-1.5 py-0.2 text-[9px] font-mono uppercase font-bold ${
                      notif.priority === 'high' || notif.priority === 'critical'
                        ? 'bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30'
                        : 'bg-[#22c55e]/20 text-[#22c55e]'
                    }`}
                  >
                    {notif.priority}
                  </span>
                </div>
                <p className="text-xs text-[#9494a8] mt-1 leading-relaxed">{notif.message}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 text-xs font-mono text-[#6b6b80]">
              <span>{notif.timeAgo}</span>
              {notif.unread && <span className="h-2 w-2 rounded-full bg-[#6366f1]" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
