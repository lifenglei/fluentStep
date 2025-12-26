
import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  compact?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, compact = false }) => {
  const percentage = Math.min(Math.round((current / total) * 100), 100);

  if (compact) {
    return (
      <div className="w-full space-y-2">
        <div className="flex justify-between items-center px-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mastery</span>
          <span className="text-[9px] font-black text-indigo-600 tracking-tighter">{percentage}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden relative">
          <div 
            className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-out shadow-lg"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-2xl">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2">Completion Status</h4>
          <p className="text-5xl font-black text-slate-900 leading-none">
            {current} <span className="text-slate-100 mx-2">/</span> {total}
          </p>
        </div>
        <div className="text-right">
          <span className="text-6xl font-black text-indigo-600 tracking-tighter">{percentage}%</span>
        </div>
      </div>
      
      <div className="w-full bg-slate-50 rounded-full h-6 overflow-hidden p-2 shadow-inner border border-slate-100">
        <div 
          className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-out relative shadow-xl shadow-indigo-100"
          style={{ width: `${percentage}%` }}
        >
           <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
