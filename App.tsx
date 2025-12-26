
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SCENARIOS } from './constants';
import { Scenario, PhraseExercise } from './types';
import { fetchPhrases, generateScenarioImage, generatePhraseImage } from './geminiService';
import ExerciseItem from './components/ExerciseItem';
import ProgressBar from './components/ProgressBar';
import HomeSection from './components/HomeSection';
import SummarySection from './components/SummarySection';
import MistakeList from './components/MistakeList';
import AuthForm from './components/AuthForm';
import { isAuthenticated, logout, getUser, type AuthResponse } from './authService';

type Theme = 'light' | 'night' | 'sepia';

const App: React.FC = () => {
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [exercises, setExercises] = useState<PhraseExercise[]>([]);
  const [scenarioImage, setScenarioImage] = useState<string | null>(null);
  const [currentPhraseImage, setCurrentPhraseImage] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCurrentSolved, setIsCurrentSolved] = useState(false);
  const [learnedBatch, setLearnedBatch] = useState<PhraseExercise[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [showMistakes, setShowMistakes] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
  
  // Mistake tracking: Record exercise and how many times it was missed
  const [mistakes, setMistakes] = useState<Record<string, { exercise: PhraseExercise, count: number }>>({});
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 检查认证状态
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = isAuthenticated();
      const userData = getUser();
      setAuthenticated(authStatus);
      setUser(userData);
      setIsAuthChecked(true);
    };
    
    checkAuth();
  }, []);

  // 处理认证成功
  const handleAuthSuccess = (authResponse: AuthResponse) => {
    setAuthenticated(true);
    setUser(authResponse.user);
  };

  // 处理登出
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      setAuthenticated(false);
      setUser(null);
      setSelectedScenario(null);
      setExercises([]);
      setScenarioImage(null);
      setCurrentPhraseImage(null);
      setCurrentIndex(0);
      setCompletedCount(0);
      setIsCurrentSolved(false);
      setLearnedBatch([]);
      setShowSummary(false);
      setShowMistakes(false);
    }
  };

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const loadMorePhrases = useCallback(async (scenario: Scenario) => {
    if (exercises.length >= 100) return;
    setIsLoading(true);
    try {
      const newPhrases = await fetchPhrases(scenario.title, 15);
      setExercises(prev => [...prev, ...newPhrases]);
    } catch (err) {
      console.error("Failed to load more phrases");
    } finally {
      setIsLoading(false);
    }
  }, [exercises.length]);

  const fetchCurrentImageImage = async (exercise: PhraseExercise) => {
    setIsImageLoading(true);
    setCurrentPhraseImage(null);
    
    // 默认图片路径
    const defaultImage = '/images/meng.jpg';
    
    try {
      // 添加超时处理（30秒）
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Image generation timeout')), 2 * 60 * 1000);
      });
      
      const img = await Promise.race([
        generatePhraseImage(exercise.chineseMeaning),
        timeoutPromise
      ]);
      
      // 如果返回 null 或空字符串，使用默认图片
      if (img) {
        setCurrentPhraseImage(img);
      } else {
        setCurrentPhraseImage(defaultImage);
      }
    } catch (err) {
      console.error("Failed to load phrase image:", err);
      // 超时或错误时使用默认图片
      setCurrentPhraseImage(defaultImage);
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleScenarioSelect = async (scenario: Scenario) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedScenario(scenario);
    setExercises([]);
    setScenarioImage(null);
    setCurrentPhraseImage(null);
    setCurrentIndex(0);
    setCompletedCount(0);
    setIsCurrentSolved(false);
    setIsLoading(true);
    setError(null);
    setLearnedBatch([]);
    setShowSummary(false);
    setShowMistakes(false);
    
    try {
      const [initialPhrases, ] = await Promise.all([
        fetchPhrases(scenario.title, 10),
        // generateScenarioImage(scenario.title)
      ]);
      setExercises(initialPhrases);
      // setScenarioImage(sImg);
      if (initialPhrases.length > 0) {
        fetchCurrentImageImage(initialPhrases[0]);
      }
    } catch (err) {
      setError("Failed to load scenario.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExerciseComplete = () => {
    setCompletedCount(prev => prev + 1);
    setIsCurrentSolved(true);
    const currentWord = exercises[currentIndex];
    if (!learnedBatch.find(w => w.id === currentWord.id)) {
      setLearnedBatch(prev => [...prev, currentWord]);
    }
  };

  const handleMistake = (exercise: PhraseExercise) => {
    setMistakes(prev => {
      const existing = prev[exercise.id];
      return {
        ...prev,
        [exercise.id]: {
          exercise,
          count: (existing?.count || 0) + 1
        }
      };
    });
  };

  const goToNext = () => {
    if (currentIndex < exercises.length - 1 && isCurrentSolved) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setIsCurrentSolved(false);
      fetchCurrentImageImage(exercises[nextIdx]);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      setIsCurrentSolved(true);
      fetchCurrentImageImage(exercises[prevIdx]);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to leave? Your progress will be lost.")) {
      setSelectedScenario(null);
      setExercises([]);
      setScenarioImage(null);
      setCurrentPhraseImage(null);
      setCurrentIndex(0);
      setCompletedCount(0);
      setIsCurrentSolved(false);
      setLearnedBatch([]);
      setShowSummary(false);
      setShowMistakes(false);
    }
  };

  useEffect(() => {
    if (selectedScenario && exercises.length > 0 && currentIndex >= exercises.length - 3 && exercises.length < 100 && !isLoading) {
      loadMorePhrases(selectedScenario);
    }
  }, [currentIndex, exercises.length, selectedScenario, loadMorePhrases, isLoading]);

  const isMilestoneReached = learnedBatch.length >= 10 && isCurrentSolved;
  const mistakeCount = Object.keys(mistakes).length;

  // 如果还在检查认证状态，显示加载
  if (!isAuthChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // 如果未认证，显示登录表单
  if (!authenticated) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen theme-transition text-[var(--text-primary)] flex flex-col selection:bg-indigo-600 selection:text-white">
      {showSummary && (
        <SummarySection 
          words={learnedBatch} 
          onContinue={() => { setLearnedBatch([]); setShowSummary(false); goToNext(); }} 
        />
      )}

      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${selectedScenario || showMistakes ? 'bg-[var(--card-bg)]/80 backdrop-blur-xl border-b border-[var(--border-primary)]' : 'bg-transparent'}`}>
        <div className="max-w-[1600px] mx-auto flex justify-between items-center px-6 md:px-10 py-5">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => {
            if (showMistakes) { setShowMistakes(false); }
            else if (!selectedScenario) { window.scrollTo({ top: 0, behavior: 'smooth' }); }
          }}>
            <div className="bg-slate-900 text-white p-3 rounded-2xl group-hover:bg-indigo-600 transition-all duration-300 shadow-xl shadow-slate-200">
               <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <h1 className={`text-xl font-bold tracking-tight transition-colors duration-500 ${selectedScenario || showMistakes ? 'text-[var(--text-primary)]' : 'text-white drop-shadow-lg'}`}>FLUENTSTEP.</h1>
          </div>
          
          <div className="flex items-center gap-4 md:gap-8">
            {/* Mistakes Trigger - Only show if in a scenario */}
            {selectedScenario && (
              <button 
                onClick={() => setShowMistakes(true)}
                className="relative group p-3 bg-[var(--accent-soft)] rounded-2xl border border-[var(--border-primary)] text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all theme-transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                {mistakeCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-[var(--card-bg)] animate-pulse">
                    {mistakeCount}
                  </span>
                )}
              </button>
            )}

            {/* Theme Switcher */}
            <div className="bg-[var(--accent-soft)] p-1 rounded-full flex gap-1 shadow-inner border border-[var(--border-primary)]">
              <button onClick={() => setTheme('light')} className={`p-2 rounded-full transition-all ${theme === 'light' ? 'bg-white shadow-md text-orange-500' : 'text-slate-400'}`}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42m12.72-12.72l1.42-1.42"/></svg></button>
              <button onClick={() => setTheme('night')} className={`p-2 rounded-full transition-all ${theme === 'night' ? 'bg-slate-800 shadow-md text-blue-400' : 'text-slate-400'}`}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg></button>
              <button onClick={() => setTheme('sepia')} className={`p-2 rounded-full transition-all ${theme === 'sepia' ? 'bg-[#D3BFA0] shadow-md text-amber-900' : 'text-slate-400'}`}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
            </div>

            {/* User Info */}
            {user && (
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-[var(--accent-soft)] rounded-xl border border-[var(--border-primary)]">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-[var(--text-primary)] max-w-[120px] truncate">
                  {user.email}
                </span>
              </div>
            )}

            {(selectedScenario || showMistakes) && (
              <button onClick={handleReset} className="hidden md:block px-5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">Exit</button>
            )}

            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="hidden md:block px-5 py-2 bg-slate-500/10 hover:bg-slate-500/20 text-slate-600 dark:text-slate-400 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {showMistakes ? (
          <div className="pt-32 min-h-screen">
            <MistakeList 
              mistakes={Object.values(mistakes)} 
              onClose={() => setShowMistakes(false)} 
            />
          </div>
        ) : !selectedScenario ? (
          <div ref={scrollContainerRef} className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth">
            <section className="h-screen w-full snap-start relative flex flex-col items-center justify-center text-center px-6 overflow-hidden bg-slate-950">
              <div className="absolute inset-0 z-0">
                <img src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=1920" className="w-full h-full object-cover opacity-50" alt="" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950"></div>
              </div>
              <div className="relative z-10 animate-fade-in space-y-10 max-w-4xl">
                <span className="px-8 py-3 bg-white/10 backdrop-blur-xl text-white border border-white/20 rounded-full text-xs font-black uppercase tracking-[0.4em]">Intelligence Powered by Gemini</span>
                <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">Visual <br/><span className="text-indigo-500">English.</span></h2>
                <div className="pt-6">
                  <button onClick={() => scrollContainerRef.current?.scrollTo({ top: window.innerHeight, behavior: 'smooth' })} className="px-10 py-5 bg-white text-slate-950 rounded-2xl font-semibold text-lg hover:bg-indigo-500 hover:text-white transition-all shadow-xl flex items-center gap-4 mx-auto group">
                    Select Scenario
                    <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                  </button>
                </div>
              </div>
            </section>
            {SCENARIOS.map((scenario, index) => (
              <HomeSection key={scenario.id} scenario={scenario} index={index} onSelect={() => handleScenarioSelect(scenario)} />
            ))}
          </div>
        ) : (
          <div className="animate-fade-in min-h-screen pt-32 pb-32">
            <div className="fixed inset-0 z-0 pointer-events-none">
               {currentPhraseImage ? (
                 <img src={currentPhraseImage} className="w-full h-full object-cover opacity-20 blur-2xl scale-125 transition-opacity duration-1000" alt="" />
               ) : scenarioImage && (
                 <img src={scenarioImage} className="w-full h-full object-cover opacity-10 blur-3xl scale-125 transition-opacity duration-1000" alt="" />
               )}
               <div className="absolute inset-0 bg-[var(--bg-primary)]/60 backdrop-blur-3xl"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                <div className="text-center md:text-left">
                   <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-[0.2em] mb-1.5 block">Visual Scenario Mastery</span>
                   <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight">{selectedScenario.title}</h2>
                </div>
                <div className="flex gap-3">
                  <div className="bg-[var(--card-bg)] px-6 py-3 rounded-2xl shadow-lg border border-[var(--border-primary)] text-center min-w-[120px] theme-transition">
                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Session Progress</p>
                    <p className="text-lg font-bold text-[var(--text-primary)]">{currentIndex + 1} <span className="text-slate-300 mx-1">/</span> {exercises.length}</p>
                  </div>
                  <div 
                    style={{ 
                      background: 'var(--accent-primary)', 
                      color: 'var(--accent-text)', 
                      boxShadow: '0 20px 25px -5px var(--shadow-color)',
                      borderColor: 'var(--accent-primary)'
                    }}
                    className="px-6 py-3 rounded-2xl text-center min-w-[120px] theme-transition border border-opacity-20"
                  >
                    <p className="text-[9px] font-semibold opacity-70 uppercase tracking-wide mb-0.5">Global Rank</p>
                    <p className="text-lg font-bold">Top 5%</p>
                  </div>
                </div>
              </div>

              {exercises.length > 0 ? (
                <div className="space-y-10">
                  <ExerciseItem 
                    key={exercises[currentIndex].id} 
                    exercise={exercises[currentIndex]} 
                    phraseImage={currentPhraseImage}
                    isImageLoading={isImageLoading}
                    onComplete={handleExerciseComplete}
                    onMistake={handleMistake}
                  />

                  <div className="flex items-center justify-between mt-16 p-3 bg-[var(--card-bg)]/50 backdrop-blur-md rounded-[3rem] border border-[var(--border-primary)] theme-transition">
                    <button onClick={goToPrev} disabled={currentIndex === 0} className={`h-12 w-12 md:h-14 md:w-14 flex items-center justify-center rounded-full transition-all ${currentIndex === 0 ? 'opacity-0' : 'bg-[var(--card-bg)] text-slate-400 hover:text-indigo-600 hover:shadow-lg active:scale-90 shadow-sm border border-[var(--border-primary)]'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5m7 7l-7-7 7-7"/></svg>
                    </button>
                    <div className="flex-grow flex justify-center">
                       <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                         <span className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.5em]">Live AI Environment</span>
                       </div>
                    </div>
                    {isMilestoneReached ? (
                      <button onClick={() => setShowSummary(true)} style={{ background: 'var(--accent-primary)', color: 'var(--accent-text)', boxShadow: '0 25px 50px -12px var(--shadow-color)' }} className="h-12 md:h-14 flex items-center gap-3 md:gap-4 px-5 md:px-8 rounded-full transition-all font-semibold text-sm md:text-base hover:scale-[1.02] active:scale-95 animate-bounce-slow">
                        Review 10
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
                      </button>
                    ) : (
                      <button onClick={goToNext} disabled={!isCurrentSolved || currentIndex >= exercises.length - 1} className={`h-12 md:h-14 flex items-center gap-3 md:gap-4 px-5 md:px-8 rounded-full transition-all font-semibold text-sm md:text-base ${(!isCurrentSolved || currentIndex >= exercises.length - 1) ? 'bg-slate-200 text-slate-400' : 'bg-slate-900 text-white hover:bg-indigo-600 hover:scale-[1.02] shadow-xl active:scale-95'}`}>
                        {currentIndex === exercises.length - 1 ? 'Finish' : 'Next'}
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7l7 7-7 7"/></svg>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-40 flex flex-col items-center bg-[var(--card-bg)]/80 backdrop-blur-2xl rounded-[4rem] shadow-2xl border border-[var(--border-primary)]">
                  <div className="w-24 h-24 border-[6px] border-slate-100 border-t-indigo-600 rounded-full animate-spin mb-10"></div>
                  <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3 tracking-tight text-center">Architecting Your <br/>Learning Space</h3>
                  <p className="text-slate-400 font-medium text-base">Generating contextual visuals and phrases...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
