'use client';

import React from 'react';
import { ScreenId } from '../types/nexus';

interface Screen19InsightsProps {
  onNavigate: (screen: ScreenId) => void;
}

export const Screen19Insights: React.FC<Screen19InsightsProps> = ({
  onNavigate,
}) => {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#0a0a0f] p-8 space-y-6 select-none font-sans max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2a2a3a] pb-4">
        <div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#34d399]">
            SCREEN 19 — PRODUCTIVITY INTELLIGENCE
          </div>
          <h2 className="text-xl font-black text-white mt-0.5">Workflow Efficiency Insights</h2>
          <p className="text-xs text-[#9494a8] mt-1">
            How NEXUS autonomous agents are accelerating your engineering velocity.
          </p>
        </div>

        <span className="rounded-full bg-[#34d399]/15 border border-[#34d399]/30 px-3 py-1 text-xs font-mono text-[#34d399] font-bold">
          ↑ 3.4 hrs Saved This Week
        </span>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#12121a] p-5 rounded-2xl border border-[#2a2a3a] space-y-1">
          <div className="text-[10px] font-mono text-[#6b6b80] uppercase">TASKS COMPLETED</div>
          <div className="text-2xl font-black text-white font-mono">18 tasks</div>
          <div className="text-[10px] font-mono text-[#34d399]">100% verified test suites</div>
        </div>

        <div className="bg-[#12121a] p-5 rounded-2xl border border-[#2a2a3a] space-y-1">
          <div className="text-[10px] font-mono text-[#6b6b80] uppercase">AUTOMATIONS RUN</div>
          <div className="text-2xl font-black text-white font-mono">42 runs</div>
          <div className="text-[10px] font-mono text-[#818cf8]">99.4% success rate</div>
        </div>

        <div className="bg-[#12121a] p-5 rounded-2xl border border-[#2a2a3a] space-y-1">
          <div className="text-[10px] font-mono text-[#6b6b80] uppercase">LINES WRITTEN</div>
          <div className="text-2xl font-black text-white font-mono">2,410 lines</div>
          <div className="text-[10px] font-mono text-[#34d399]">Zero AST regressions</div>
        </div>

        <div className="bg-[#12121a] p-5 rounded-2xl border border-[#2a2a3a] space-y-1">
          <div className="text-[10px] font-mono text-[#6b6b80] uppercase">LOCAL INFERENCE</div>
          <div className="text-2xl font-black text-white font-mono">100% Local</div>
          <div className="text-[10px] font-mono text-[#ec4899]">$0 API Cloud Cost</div>
        </div>
      </div>

      {/* Weekly Activity Visualizer */}
      <div className="rounded-2xl bg-[#12121a] border border-[#2a2a3a] p-6 shadow-xl space-y-4">
        <h3 className="text-xs font-bold font-mono text-[#818cf8] uppercase tracking-wider">
          WEEKLY ENGINEERING VELOCITY (HOURS SAVED)
        </h3>

        <div className="flex items-end justify-between h-40 pt-4 px-2">
          {[
            { day: 'Mon', hours: 0.8, height: '40%' },
            { day: 'Tue', hours: 1.2, height: '60%' },
            { day: 'Wed', hours: 0.5, height: '25%' },
            { day: 'Thu', hours: 1.8, height: '90%' },
            { day: 'Fri', hours: 1.4, height: '70%' },
            { day: 'Sat', hours: 0.4, height: '20%' },
            { day: 'Sun', hours: 0.9, height: '45%' },
          ].map((bar, i) => (
            <div key={i} className="flex flex-col items-center gap-2 h-full justify-end group">
              <div className="text-[10px] font-mono text-[#818cf8] opacity-0 group-hover:opacity-100 transition">
                {bar.hours}h
              </div>
              <div
                className="w-10 bg-gradient-to-t from-[#6366f1] to-[#34d399] rounded-t-xl transition-all duration-500 hover:brightness-125"
                style={{ height: bar.height }}
              />
              <span className="text-[11px] font-mono text-[#6b6b80]">{bar.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
