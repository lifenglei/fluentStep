
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
import CheckInPage from './components/CheckInPage';
import { isAuthenticated, logout, getUser, type AuthResponse } from './authService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAppStore } from './store/appStore';

type Theme = 'light' | 'night' | 'sepia';

const App: React.FC = () => {
  // 根据场景ID获取对应的FontAwesome图标
  const getScenarioIcon = (scenarioId: string): string => {
    switch (scenarioId) {
      case 'airport':
        return 'fa-plane';
      case 'business':
        return 'fa-briefcase';
      case 'workplace':
        return 'fa-building';
      case 'travel':
        return 'fa-globe';
      case 'restaurant':
        return 'fa-utensils';
      case 'medical':
        return 'fa-hospital';
      default:
        return 'fa-circle-notch';
    }
  };
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [scenarioImage, setScenarioImage] = useState<string | null>(null);
  const [currentPhraseImage, setCurrentPhraseImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>('light');
  
  // Zustand store state
  const {
    selectedScenario,
    exercises,
    currentIndex,
    completedCount,
    isCurrentSolved,
    learnedBatch,
    showSummary,
    showMistakes,
    showCheckIn,
    completedExercises,
    mistakes,
    setSelectedScenario,
    setExercises,
    setCurrentIndex,
    setCompletedCount,
    setIsCurrentSolved,
    setLearnedBatch,
    setShowSummary,
    setShowMistakes,
    setShowCheckIn,
    setCompletedExercises,
    setMistakes,
    addCompletedExercise,
    addMistake
  } = useAppStore();
  
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
      setExercises([...exercises, ...newPhrases]);
    } catch (err) {
      console.error("Failed to load more phrases");
    } finally {
      setIsLoading(false);
    }
  }, [exercises.length, setExercises]);

  const fetchCurrentImageImage = async (exercise: PhraseExercise) => {
    setIsImageLoading(true);
    setCurrentPhraseImage(null);
    
    // 默认图片路径
    const defaultImage = '/images/meng.jpg';
    
    // 创建 AbortController 用于取消请求
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      // 超时后取消请求
      abortController.abort();
      console.log("Image generation timeout, request cancelled");
    }, 10000); // 60秒超时
    
    try {
      //本地调试先注释掉，使用默认图片
      const img = await generatePhraseImage(exercise.chineseMeaning, abortController.signal);
      
      // 清除超时定时器（如果请求成功完成）
      clearTimeout(timeoutId);
      
      // 如果返回 null 或空字符串，使用默认图片
      setCurrentPhraseImage(defaultImage);
      if (img) {
        setCurrentPhraseImage(img);
      } else {
        setCurrentPhraseImage(defaultImage);
      }
    } catch (err) {
      // 清除超时定时器
      clearTimeout(timeoutId);
      
      // 如果是取消请求，直接使用默认图片，不记录错误
      if (err instanceof Error && err.name === 'AbortError') {
        setCurrentPhraseImage(defaultImage);
        return;
      }
      
      console.error("Failed to load phrase image:", err);
      // 错误时使用默认图片
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
    setCompletedCount(completedCount + 1);
    setIsCurrentSolved(true);
    const currentWord = exercises[currentIndex];
    if (!learnedBatch.find(w => w.id === currentWord.id)) {
      setLearnedBatch([...learnedBatch, currentWord]);
    }
    // Mark exercise as completed
    addCompletedExercise(currentWord.id);
  };

  const handleMistake = (exercise: PhraseExercise) => {
    addMistake(exercise);
  };

  const goToNext = () => {
    if (currentIndex < exercises.length - 1 && isCurrentSolved) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      // Check if next exercise is already completed
      setIsCurrentSolved(completedExercises.has(exercises[nextIdx].id));
      fetchCurrentImageImage(exercises[nextIdx]);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      // Check if previous exercise is already completed
      setIsCurrentSolved(completedExercises.has(exercises[prevIdx].id));
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

  const isMilestoneReached = learnedBatch.length >= 2 && isCurrentSolved;
  const mistakeCount = Object.keys(mistakes).length;

  // 如果还在检查认证状态，显示加载
    if (!isAuthChecked) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
          <div className="w-12 h-12 border-4 border-[var(--border-primary)] border-t-[var(--accent-primary)] rounded-full animate-spin"></div>
        </div>
      );
    }

  // 如果未认证，显示登录表单
  if (!authenticated) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen theme-transition text-[var(--text-primary)] flex flex-col selection:bg-[var(--accent-primary)] selection:text-[var(--accent-text)]">
      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${selectedScenario || showMistakes || showSummary ? 'bg-[var(--card-bg)]/80 backdrop-blur-xl border-b border-[var(--border-primary)]' : 'bg-transparent'}`}>
        <div className="max-w-[1600px] mx-auto flex justify-between items-center px-3 md:px-10 py-6">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => {
            if (showMistakes) { setShowMistakes(false); }
            else if (!selectedScenario) { window.scrollTo({ top: 0, behavior: 'smooth' }); }
          }}>
            <div className="bg-[var(--accent-primary)] text-[var(--accent-text)] p-3 rounded-2xl group-hover:bg-[var(--accent-secondary)] transition-all duration-300 shadow-xl shadow-[var(--shadow-color)]">
               <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <h1 className={`text-xl font-bold tracking-tight transition-colors duration-500 ${selectedScenario || showMistakes ? 'text-[var(--text-primary)]' : 'text-white drop-shadow-lg'}`}>FLUENTSTEP.</h1>
          </div>
          
          <div className="flex items-center gap-4 md:gap-8">
            {/* Mistakes Trigger - Only show if in a scenario */}
            {selectedScenario && (
              <button 
                onClick={() => setShowMistakes(true)}
                className="relative group p-3 bg-[var(--accent-soft)] rounded-2xl border border-[var(--border-primary)] text-[var(--text-muted)] hover:text-[var(--error)] hover:bg-[var(--error-bg)] transition-all theme-transition"
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
              <button onClick={() => setTheme('light')} className={`p-2 rounded-full transition-all ${theme === 'light' ? 'bg-[var(--card-bg)] shadow-md text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42m12.72-12.72l1.42-1.42"/></svg></button>
              <button onClick={() => setTheme('night')} className={`p-2 rounded-full transition-all ${theme === 'night' ? 'bg-[var(--card-bg)] shadow-md text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg></button>
              <button onClick={() => setTheme('sepia')} className={`p-2 rounded-full transition-all ${theme === 'sepia' ? 'bg-[var(--card-bg)] shadow-md text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
            </div>

            {/* User Info with Dropdown */}
            {user && (
              <div className="relative group">
                <div className="flex items-center gap-3 px-4 py-2 bg-[var(--accent-soft)] rounded-xl border border-[var(--border-primary)] cursor-pointer transition-all hover:bg-[var(--bg-secondary)] min-w-[160px]">
                  <div className="w-8 h-8 bg-[var(--accent-primary)] rounded-full flex items-center justify-center text-[var(--accent-text)] text-xs font-bold">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-[var(--text-primary)] max-w-[120px] truncate">
                    {user.email}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-muted)] transition-transform group-hover:rotate-180">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-[var(--card-bg)] rounded-xl border border-[var(--border-primary)] shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  {/* Check-in Option */}
                  <button 
                    onClick={() => setShowCheckIn(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--accent-soft)] transition-colors theme-transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span>签到</span>
                  </button>
                  
                  {/* Logout Option */}
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--accent-soft)] transition-colors theme-transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    <span>退出登录</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Summary Section - Only render when showSummary is true */}
      {showSummary && (
        <SummarySection 
          words={learnedBatch} 
          onContinue={() => {
            setLearnedBatch([]);
            setShowSummary(false);
            goToNext();
          }} 
        />
      )}

      <main className="flex-grow">
        {showMistakes ? (
          <div className="pt-[82px] h-screen overflow-hidden">
            <MistakeList 
              mistakes={Object.values(mistakes)} 
              onClose={() => setShowMistakes(false)} 
            />
          </div>
        ) : showCheckIn ? (
          <div className="pt-[82px] h-screen overflow-hidden">
            <CheckInPage onBack={() => setShowCheckIn(false)} />
          </div>
        ) : !selectedScenario ? (
          <div ref={scrollContainerRef} className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth">
            <section className="h-screen w-full snap-start relative flex flex-col items-center justify-center text-center px-6 overflow-hidden bg-[var(--accent-primary)]">
              <div className="absolute inset-0 z-0">
                <img src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=1920" className="w-full h-full object-cover opacity-50" alt="" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950"></div>
              </div>
              <div className="relative z-10 animate-fade-in space-y-10 max-w-4xl">
                <span className="px-8 py-3 bg-[var(--accent-text)]/10 backdrop-blur-xl text-[var(--accent-text)] border border-[var(--accent-text)]/20 rounded-full text-xs font-black uppercase tracking-[0.4em]">Intelligence Powered by Gemini</span>
                <h2 className="text-5xl md:text-7xl font-bold text-[var(--accent-text)] mb-6 tracking-tight leading-tight">Visual <br/><span className="text-[var(--accent-secondary)]">English.</span></h2>
                <div className="pt-6 space-y-6">
                  <button onClick={() => scrollContainerRef.current?.scrollTo({ top: window.innerHeight, behavior: 'smooth' })} className="px-10 py-5 bg-[var(--accent-text)] text-[var(--accent-primary)] rounded-2xl font-semibold text-lg hover:bg-[var(--accent-secondary)] hover:text-[var(--accent-text)] transition-all shadow-xl flex items-center gap-4 mx-auto group">
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
                   <span className="text-[10px] font-semibold text-[var(--accent-primary)] uppercase tracking-[0.2em] mb-1.5 block">Visual Scenario Mastery</span>
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
                <div>
                  <ExerciseItem 
                    key={exercises[currentIndex].id} 
                    exercise={exercises[currentIndex]} 
                    phraseImage={currentPhraseImage}
                    isImageLoading={isImageLoading}
                    onComplete={handleExerciseComplete}
                    onMistake={handleMistake}
                    onPrev={goToPrev}
                    onNext={goToNext}
                    canGoPrev={currentIndex > 0}
                    canGoNext={isCurrentSolved && currentIndex < exercises.length - 1}
                    isMilestoneReached={isMilestoneReached}
                    onShowSummary={() => setShowSummary(true)}
                    isLast={currentIndex === exercises.length - 1}
                    isCompleted={completedExercises.has(exercises[currentIndex].id)}
                  />
                </div>
              ) : (
                <div className="py-40 flex flex-col items-center bg-[var(--card-bg)]/80 backdrop-blur-2xl rounded-[4rem] shadow-2xl border border-[var(--border-primary)]">
                  <div className="w-16 h-16 flex flex-col items-center justify-center mb-10">
                    <FontAwesomeIcon 
                      icon={`fa-solid ${getScenarioIcon(selectedScenario?.id || '')}`} 
                      size="3x" 
                      className="text-indigo-600 mb-2"
                    />
                    <div className="flex space-x-1.5">
                      <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" style={{ animationDelay: '0s' }}></div>
                      <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 rounded-full bg-indigo-200 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3 tracking-tight text-center">Architecting Your <br/>Learning Space</h3>
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
