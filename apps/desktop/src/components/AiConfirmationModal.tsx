'use client';

import React from 'react';

interface AiConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReview: () => void;
  workflowName?: string;
  steps?: string[];
}

export const AiConfirmationModal: React.FC<AiConfirmationModalProps> = ({
  isOpen,
  onClose,
  onApprove,
  onReview,
  workflowName = 'Development & Test Automation Workflow',
  steps = [
    'Open Visual Studio Code with c:/NEXUS workspace',
    'Modify selected backend endpoint files (src/nexus/api/router.py)',
    'Run the local test suite (pytest tests/)',
    'Verify results and create atomic git commit on branch nexus/auto-task',
  ],
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="bg-[#12121a] border border-[#6366f1]/40 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 ring-1 ring-[#6366f1]/20">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-[#6366f1]/15 border border-[#6366f1]/30 flex items-center justify-center text-xl shrink-0">
            🤖
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#818cf8]">
              HUMAN-IN-THE-LOOP APPROVAL
            </div>
            <h3 className="text-base font-bold text-white mt-0.5">
              Ready to execute workflow
            </h3>
            <p className="text-xs text-[#9494a8] mt-1 font-medium">{workflowName}</p>
          </div>
        </div>

        {/* Action Sequence */}
        <div className="bg-[#1a1a25] border border-[#2a2a3a] rounded-xl p-4 space-y-3">
          <div className="text-xs font-semibold text-[#e8e8ed]">NEXUS will execute these actions:</div>
          <div className="space-y-2">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs">
                <span className="h-5 w-5 rounded-full bg-[#22222f] border border-[#2a2a3a] text-[10px] font-mono font-bold text-[#818cf8] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-[#9494a8] leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Consequence Note */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/20 text-[11px] text-[#34d399]">
          <span>✓</span>
          <span>Changes are isolated on a dedicated Git branch and fully reversible.</span>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#1a1a25] hover:bg-[#22222f] border border-[#2a2a3a] text-xs text-[#9494a8] hover:text-white transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onReview}
            className="px-4 py-2 rounded-xl bg-[#22222f] hover:bg-[#2a2a3a] border border-[#3a3a4a] text-xs font-semibold text-white transition cursor-pointer"
          >
            Review Step Diff
          </button>
          <button
            onClick={onApprove}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:opacity-90 text-xs font-bold text-white shadow-lg shadow-[#22c55e]/25 transition cursor-pointer flex items-center gap-1.5"
          >
            <span>Approve & Run</span>
            <span>⚡</span>
          </button>
        </div>
      </div>
    </div>
  );
};
