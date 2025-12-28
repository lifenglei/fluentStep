import React, { useRef, useEffect } from 'react';
import { SCENARIOS } from '../constants';
import { Scenario } from '../types';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import HomeSection from './HomeSection';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { setSelectedScenario, setExercises, setCurrentIndex, setCompletedCount, setIsCurrentSolved, setLearnedBatch, setShowSummary, setShowMistakes } = useAppStore();

  // Handle scroll events to control snapping
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const scrollAmount = window.innerHeight;
    const currentScroll = scrollContainer.scrollTop;
    const direction = e.deltaY > 0 ? 1 : -1;
    const newScroll = currentScroll + (direction * scrollAmount);

    scrollContainer.scrollTo({
      top: newScroll,
      behavior: 'smooth'
    });
  };

  // Add wheel event listener to control scrolling
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  const handleScenarioSelect = (scenario: Scenario) => {
    // Reset all app state
    useAppStore.getState().reset();
    
    // Set new scenario and navigate
    setSelectedScenario(scenario);
    navigate(`/learning/${scenario.id}`);
  };

  return (
    <div ref={scrollContainerRef} className="h-screen overflow-hidden snap-y snap-mandatory scroll-smooth">
      {/* Hero Section */}
      <section className="h-screen w-full snap-start relative flex flex-col items-center justify-center text-center px-6 overflow-hidden bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)]">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=1920" className="w-full h-full object-cover opacity-50" alt="" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950"></div>
        </div>
        <div className="relative z-10 animate-fade-in space-y-10 max-w-4xl">
          <h2 className="text-5xl md:text-7xl font-bold text-[var(--accent-text)] mb-6 tracking-tight leading-tight">Fluent <br/><span className="text-[var(--accent-secondary)]">English.</span></h2>
          <div className="pt-6 space-y-6">
            <button onClick={() => scrollContainerRef.current?.scrollTo({ top: window.innerHeight, behavior: 'smooth' })} className="px-10 py-5 bg-[var(--accent-text)] text-[var(--accent-primary)] rounded-full font-semibold text-lg hover:bg-[var(--accent-secondary)] hover:text-[var(--accent-text)] transition-all shadow-xl flex items-center gap-4 mx-auto group">
              Select Scenario
              <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
            </button>
          </div>
        </div>
      </section>

      {/* Scenarios Section */}
      {SCENARIOS.map((scenario, index) => (
        <HomeSection 
          key={scenario.id} 
          scenario={scenario} 
          index={index} 
          onSelect={() => handleScenarioSelect(scenario)} 
        />
      ))}
    </div>
  );
};

export default Home;
