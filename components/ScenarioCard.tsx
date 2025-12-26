
import React from 'react';
import { Scenario } from '../types';

interface ScenarioCardProps {
  scenario: Scenario;
  onSelect: () => void;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario, onSelect }) => {
  return (
    <div 
      onClick={onSelect}
      className="group bg-white rounded-3xl border border-slate-100 p-8 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer hover:-translate-y-2 relative overflow-hidden"
    >
      <div className={`absolute -top-10 -right-10 w-40 h-40 opacity-[0.03] group-hover:opacity-[0.08] rounded-full transition-all duration-700 group-hover:scale-150 ${scenario.color}`}></div>
      
      <div className="flex flex-col h-full relative z-10">
        <div className={`w-14 h-14 ${scenario.color} rounded-2xl flex items-center justify-center text-3xl mb-6 text-white shadow-xl shadow-indigo-100 group-hover:scale-110 transition-transform duration-500`}>
          {scenario.icon}
        </div>
        <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight group-hover:text-indigo-600 transition-colors">{scenario.title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-8 font-medium">
          {scenario.description}
        </p>
        
        <div className="mt-auto flex items-center text-indigo-600 font-black text-xs uppercase tracking-widest">
          Enter Scenario
          <div className="w-8 h-[2px] bg-indigo-100 ml-3 group-hover:w-12 transition-all duration-500"></div>
          <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ScenarioCard;
