'use client';

import React from 'react';
import { ScreenId } from '../types/nexus';

interface DesktopNotificationToastProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: ScreenId) => void;
  title?: string;
  message?: string;
  type?: 'task' | 'approval' | 'insight';
}

export const DesktopNotificationToast: React.FC<DesktopNotificationToastProps> = ({
  isOpen,
  onClose,
  onNavigate,
  title = 'Task completed',
  message = 'NEXUS completed "Synthesize PRD and System Architecture" with 19/19 passing tests.',
  type = 'task',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed top-5 right-5 z-50 select-none animate-in fade-in slide-in-from-top-4 duration-200">
      <div className="w-88 bg-[#12121a]/95 backdrop-blur-md border border-[#2a2a3a] rounded-2xl p-4 shadow-2xl space-y-2.5 ring-1 ring-white/15">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-[#6366f1]/20 border border-[#6366f1]/30 flex items-center justify-center text-sm shrink-0">
              {type === 'approval' ? '⚠️' : type === 'insight' ? '📈' : '🎉'}
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#818cf8]">
                NEXUS NOTIFICATION
              </div>
              <h4 className="text-xs font-bold text-white">{title}</h4>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#6b6b80] hover:text-white text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-[#9494a8] leading-relaxed pl-9">{message}</p>

        <div className="flex justify-end gap-2 pt-1 border-t border-[#2a2a3a]">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg text-xs text-[#6b6b80] hover:text-white"
          >
            Dismiss
          </button>
          <button
            onClick={() => {
              if (type === 'approval') onNavigate('23-permission-modal');
              else if (type === 'insight') onNavigate('19-insights');
              else onNavigate('07-task-detail');
              onClose();
            }}
            className="px-3 py-1 rounded-lg bg-[#6366f1] hover:bg-[#818cf8] text-xs font-semibold text-white shadow-md shadow-[#6366f1]/20 transition cursor-pointer"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};
