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

  const loadExercises = async () => {
    if (!scenario) return;
    
    console.log('loadExercises called for scenario:', scenario.title);
    setIsLoading(true);
    setError(null);
    try {
      // 在获取到练习数据后再设置选中的场景
      setSelectedScenario(scenario);
      
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
      setCurrentPhraseImage( '../assets/meng.jpg');
    } catch (err) {
      setCurrentPhraseImage('../assets/meng.jpg');
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
  }, [currentIndex, exercises.length, scenario, loadMorePhrases, isLoading]);

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
    <div className="animate-fade-in pt-8 pb-48">
      <div className="fixed inset-0 z-0 pointer-events-none">
        {currentPhraseImage && (
          <img src={currentPhraseImage} className="w-full h-full object-cover opacity-20 blur-2xl scale-125 transition-opacity duration-1000" alt="" />
        )}
        <div className="absolute inset-0 bg-[var(--bg-primary)]/60 backdrop-blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="text-center md:text-left">
            <span className="text-[10px] font-semibold text-[var(--accent-primary)] uppercase tracking-[0.2em] mb-1.5 block">Fluent Scenario Mastery</span>
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight">{scenario.title}</h2>
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
              onShowSummary={() => {
                setShowSummary(true);
                navigate('/summary');
              }}
              isLast={currentIndex === exercises.length - 1}
              isCompleted={completedExercises.has(exercises[currentIndex].id)}
            />
          </div>
        ) : (
          <div className="py-40 flex flex-col items-center bg-[var(--card-bg)]/80 backdrop-blur-2xl rounded-[4rem] shadow-2xl border border-[var(--border-primary)]">
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
