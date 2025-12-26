
import React from 'react';
import { Scenario } from '../types';

interface HomeSectionProps {
  scenario: Scenario;
  index: number;
  onSelect: () => void;
}

const HomeSection: React.FC<HomeSectionProps> = ({ scenario, index, onSelect }) => {
  // Map scenarios to high-quality Unsplash images for a polished home experience
  const images: Record<string, string> = {
    airport: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=1600',
    business: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1600',
    workplace: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1600',
    travel: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1600',
    restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1600',
    medical: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1600',
  };

  const isEven = index % 2 === 0;

  return (
    <section className="h-screen w-full snap-start relative flex items-center justify-center overflow-hidden bg-slate-900">
      {/* Immersive Background */}
      <div className="absolute inset-0">
        <img 
          src={images[scenario.id] || images.travel} 
          className="w-full h-full object-cover opacity-60 scale-105 transition-transform duration-1000 group-hover:scale-100" 
          alt={scenario.title}
        />
        <div className={`absolute inset-0 bg-gradient-to-r ${isEven ? 'from-slate-900 via-slate-900/40 to-transparent' : 'from-transparent via-slate-900/40 to-slate-900'}`}></div>
      </div>

      <div className={`relative z-10 w-full max-w-7xl mx-auto px-10 flex ${isEven ? 'justify-start' : 'justify-end'}`}>
        <div className={`max-w-xl space-y-8 animate-fade-in ${isEven ? 'text-left' : 'text-right'}`}>
          {/* <div className={`inline-flex items-center gap-4 ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
            <div className={`w-16 h-16 ${scenario.color} rounded-2xl flex items-center justify-center text-3xl shadow-2xl`}>
              {scenario.icon}
            </div>
            <div className="h-[2px] w-12 bg-indigo-500"></div>
          </div> */}
          
          <div className="space-y-4">
            <h3 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none">
              {scenario.title}
            </h3>
            <p className="text-xl text-slate-300 font-medium leading-relaxed opacity-90">
              {scenario.description}
            </p>
          </div>

          <div className={`pt-4 flex ${isEven ? 'justify-start' : 'justify-end'}`}>
            <button 
              onClick={onSelect}
              className="group relative px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-black text-lg transition-all shadow-2xl hover:-translate-y-1 flex items-center gap-4 overflow-hidden"
            >
              <span className="relative z-10">Start This Scenario</span>
              <svg className="w-6 h-6 relative z-10 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Side Number Indicator */}
      {/* <div className={`absolute bottom-10 ${isEven ? 'left-10' : 'right-10'} text-white/20 font-black text-9xl tracking-tighter pointer-events-none`}>
        0{index + 1}
      </div> */}
    </section>
  );
};

export default HomeSection;
