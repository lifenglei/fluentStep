import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SCENARIOS } from '../constants';
import { Scenario, PhraseExercise } from '../types';
import { fetchPhrases } from '../geminiService';
import ExerciseItem from './ExerciseItem';
import { useAppStore } from '../store/appStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faPlane,
  faBriefcase,
  faBuilding,
  faGlobe,
  faUtensils,
  faHospital
} from '@fortawesome/free-solid-svg-icons';

// Add icons to library
library.add(faPlane, faBriefcase, faBuilding, faGlobe, faUtensils, faHospital);

const Learning: React.FC = () => {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPhraseImage, setCurrentPhraseImage] = useState<string | null>(null);

  const {
    selectedScenario,
    exercises,
    currentIndex,
    completedCount,
    isCurrentSolved,
    learnedBatch,
    showSummary,
    showMistakes,
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
    addCompletedExercise,
    addMistake
  } = useAppStore();

  // Find the scenario from constants
  const scenario = SCENARIOS.find(s => s.id === scenarioId);

  // Fetch scenario data if not already loaded
  useEffect(() => {
    if (!scenario) {
      navigate('/');
      return;
    }

    // Only load exercises if scenario is valid and not already loaded
    if (scenarioId && scenario.id === scenarioId && exercises.length === 0) {
      loadExercises();
    }
  }, [scenarioId, scenario, exercises.length, navigate]);

  // Set selected scenario when scenario changes
  useEffect(() => {
    if (scenario && scenario.id === scenarioId) {
      setSelectedScenario(scenario);
    }
  }, [scenarioId, scenario, setSelectedScenario]);

  const loadExercises = async () => {
    if (!scenario) return;
    
    console.log('loadExercises called for scenario:', scenario.title);
    setIsLoading(true);
    setError(null);
    try {
      console.log('Calling fetchPhrases with:', scenario.title, 10);
      const initialPhrases = await fetchPhrases(scenario.title, 10);
      console.log('fetchPhrases returned:', initialPhrases.length, 'phrases');
      setExercises(initialPhrases);
      
      if (initialPhrases.length > 0) {
        fetchCurrentImage(initialPhrases[0]);
      }
    } catch (err) {
      console.error('Error in loadExercises:', err);
      setError("Failed to load exercises.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentImage = async (exercise: PhraseExercise) => {
    console.log('fetchCurrentImage called for:', exercise.correctAnswer);
    setIsImageLoading(true);
    setCurrentPhraseImage(null);
    
    try {
      console.log('Calling generatePhraseImage for:', exercise.correctAnswer);
      // const img = await generatePhraseImage(exercise.correctAnswer);
      setCurrentPhraseImage( '../images/meng.jpg');
    } catch (err) {
      setCurrentPhraseImage('../images/meng.jpg');
    } finally {
      setIsImageLoading(false);
    }
  };

  const loadMorePhrases = useCallback(async () => {
    if (!scenario || exercises.length >= 100 || isLoading) return;
    
    setIsLoading(true);
    try {
      const newPhrases = await fetchPhrases(scenario.title, 15);
      setExercises([...exercises, ...newPhrases]);
    } catch (err) {
      console.error("Failed to load more phrases");
    } finally {
      setIsLoading(false);
    }
  }, [exercises.length, isLoading, scenario, setExercises]);

  const handleExerciseComplete = () => {
    setCompletedCount(completedCount + 1);
    setIsCurrentSolved(true);
    const currentWord = exercises[currentIndex];
    if (!learnedBatch.find(w => w.id === currentWord.id)) {
      setLearnedBatch([...learnedBatch, currentWord]);
    }
    addCompletedExercise(currentWord.id);
  };

  const handleMistake = (exercise: PhraseExercise) => {
    addMistake(exercise);
  };

  const goToNext = () => {
    if (currentIndex < exercises.length - 1 && isCurrentSolved) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setIsCurrentSolved(completedExercises.has(exercises[nextIdx].id));
      fetchCurrentImage(exercises[nextIdx]);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      setIsCurrentSolved(completedExercises.has(exercises[prevIdx].id));
      fetchCurrentImage(exercises[prevIdx]);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to leave? Your progress will be lost.")) {
      navigate('/');
    }
  };

  // Load more exercises when approaching end
  useEffect(() => {
    if (scenario && exercises.length > 0 && currentIndex >= exercises.length - 3 && exercises.length < 100 && !isLoading) {
      loadMorePhrases();
    }
  }, [currentIndex, exercises.length, scenario, isLoading]);

  // Check if milestone reached
  const isMilestoneReached = learnedBatch.length >= 10 && isCurrentSolved;
  const mistakeCount = Object.keys(mistakes).length;

  if (!scenario) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Scenario not found</h2>
          <button onClick={() => navigate('/')} className="px-6 py-3 bg-[var(--accent-primary)] text-[var(--accent-text)] rounded-2xl hover:bg-[var(--accent-secondary)] transition-all">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (isLoading && exercises.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)]">
        {scenario && (
          <>
            <div className="w-16 h-16 flex items-center justify-center mb-6">
              <FontAwesomeIcon 
                icon={scenario.faIcon as any} 
                size="4x" 
                className="text-[var(--accent-primary)]" 
              />
            </div>
            <div className="flex justify-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">正在加载中 请稍等</h3>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[var(--bg-primary)] overflow-hidden flex flex-col">
      <div className="absolute inset-0 z-0 pointer-events-none">
        {currentPhraseImage ? (
          <img src={currentPhraseImage} className="w-full h-full object-cover opacity-30 blur-3xl scale-110 transition-all duration-1000" alt="" />
        ) : (
           <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 opacity-90"></div>
        )}
        <div className="absolute inset-0 bg-[var(--bg-primary)]/40 backdrop-blur-[100px]"></div>
      </div>

      <div className="relative z-20 px-4 pt-6 pb-4 flex-shrink-0 w-full max-w-5xl mx-auto">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg">
                <FontAwesomeIcon icon={scenario.faIcon as any} className="text-[var(--accent-primary)]" />
             </div>
             <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight leading-tight">{scenario.title}</h2>
                <div className="flex items-center gap-2 text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                  <span>Progress</span>
                  <div className="w-20 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[var(--accent-primary)] transition-all duration-500"
                      style={{ width: `${((currentIndex + 1) / exercises.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
             </div>
          </div>
          
          <div className="flex gap-2">
             <button onClick={() => navigate('/')} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all text-slate-500 hover:text-[var(--text-primary)]">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
             </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-4 pb-6 min-h-0 flex flex-col pt-2">
        {exercises.length > 0 ? (
          <ExerciseItem 
            key={exercises[currentIndex].id} 
            exercise={exercises[currentIndex]} 
            onComplete={handleExerciseComplete}
            onMistake={handleMistake}
            onPrev={goToPrev}
            onNext={goToNext}
            canGoPrev={currentIndex > 0}
            canGoNext={isCurrentSolved && currentIndex < exercises.length - 1}
            isMilestoneReached={isMilestoneReached}
            onShowSummary={() => {
              setShowSummary(true);
              navigate('/summary');
            }}
            isLast={currentIndex === exercises.length - 1}
            isCompleted={completedExercises.has(exercises[currentIndex].id)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--card-bg)]/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-[var(--border-primary)]">
            <div className="w-16 h-16 flex items-center justify-center mb-10">
              {scenario && (
                <FontAwesomeIcon 
                  icon={scenario.faIcon as any} 
                  size="4x" 
                  className="text-[var(--accent-primary)]" 
                />
              )}
            </div>
            <div className="flex justify-center gap-2 mb-6">
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-primary)] animate-pulse"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-primary)] animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-primary)] animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3 tracking-tight text-center">
              {'正在加载练习 请耐心等待'}
            </h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default Learning;
