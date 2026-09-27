'use client';

import React from 'react';

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAllowOnce: () => void;
  onAlwaysAllow: () => void;
  appName?: string;
  reason?: string;
  actionType?: 'application' | 'filesystem' | 'terminal' | 'network';
}

export const PermissionModal: React.FC<PermissionModalProps> = ({
  isOpen,
  onClose,
  onAllowOnce,
  onAlwaysAllow,
  appName = 'Visual Studio Code',
  reason = 'Required to continue your requested development workflow and load project workspace.',
  actionType = 'application',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="bg-[#12121a] border border-[#ef4444]/40 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 ring-1 ring-[#ef4444]/20">
        {/* Header Icon & Title */}
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-[#ef4444]/15 border border-[#ef4444]/30 flex items-center justify-center text-xl shrink-0">
            🛡️
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#ef4444]">
              SECURITY AUDIT & PERMISSION GATE
            </div>
            <h3 className="text-sm font-bold text-white mt-0.5">
              NEXUS wants to control {appName}
            </h3>
          </div>
        </div>

        {/* Reason Box */}
        <div className="bg-[#1a1a25] border border-[#2a2a3a] rounded-xl p-3.5 space-y-2 text-xs">
          <div className="text-[#9494a8]">
            <span className="font-semibold text-white">Reason: </span>
            {reason}
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-[#2a2a3a] text-[10px] font-mono text-[#6b6b80]">
            <span>Operation: <strong className="text-[#818cf8]">SPAWN_PROCESS</strong></span>
            <span>•</span>
            <span>Risk Tier: <strong className="text-[#ef4444]">HIGH</strong></span>
          </div>
        </div>

        {/* Consequences Preview */}
        <div className="text-[11px] text-[#9494a8] bg-[#0e0e16] p-3 rounded-lg border border-[#2a2a3a]/60 space-y-1">
          <div className="font-semibold text-[#e8e8ed]">NEXUS will be granted:</div>
          <ul className="list-disc pl-4 space-y-0.5 text-[#9494a8]">
            <li>Ability to launch & focus application window</li>
            <li>Workspace directory binding constraint (c:/NEXUS)</li>
            <li>Immutable audit logging to local SQLite record</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#1a1a25] hover:bg-[#22222f] border border-[#2a2a3a] text-xs text-[#9494a8] hover:text-white transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onAllowOnce}
            className="px-4 py-2 rounded-xl bg-[#22222f] hover:bg-[#2a2a3a] border border-[#3a3a4a] text-xs font-semibold text-white transition cursor-pointer"
          >
            Allow Once
          </button>
          <button
            onClick={onAlwaysAllow}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#818cf8] hover:opacity-90 text-xs font-semibold text-white shadow-lg shadow-[#6366f1]/25 transition cursor-pointer"
          >
            Always Allow
          </button>
        </div>
      </div>
    </div>
  );
};
