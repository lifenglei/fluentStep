import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { PhraseExercise } from '../types';
import { speakText } from '../geminiService';

const Mistakes: React.FC = () => {
  const navigate = useNavigate();
  const { mistakes, setShowMistakes } = useAppStore();

  const handleClose = () => {
    setShowMistakes(false);
    navigate(-1);
  };

  const handleRetry = (exercise: PhraseExercise) => {
    // Navigate back to learning with this exercise
    setShowMistakes(false);
    navigate(-1);
  };

  const mistakeList = Object.values(mistakes);

  if (mistakeList.length === 0) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-6 md:p-10 animate-fade-in">
        <div className="absolute inset-0 bg-[var(--bg-primary)] backdrop-blur-2xl"></div>
        <div className="relative z-10 bg-[var(--card-bg)] p-8 rounded-3xl shadow-xl border border-[var(--border-primary)] max-w-md text-center">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">No Mistakes Yet</h2>
          <p className="text-[var(--text-muted)] mb-6">Great job! You haven't made any mistakes yet.</p>
          <button 
            onClick={handleClose}
            className="px-6 py-3 bg-[var(--accent-primary)] text-[var(--accent-text)] rounded-2xl hover:bg-[var(--accent-secondary)] transition-all"
          >
            Continue Learning
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-6 md:p-10 pt-[82px] animate-fade-in">
      <div className="absolute inset-0 bg-[var(--bg-primary)] backdrop-blur-2xl"></div>
      <div className="relative z-10 w-full max-w-4xl flex flex-col h-full max-h-[calc(100vh-82px)]">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">Your Mistakes</h2>
          <button 
            onClick={handleClose}
            className="p-3 rounded-full bg-[var(--accent-soft)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto pr-4 custom-scrollbar space-y-4">
          {mistakeList.map((mistake, index) => (
            <div key={mistake.id} className="bg-[var(--card-bg)] p-6 rounded-3xl border border-[var(--border-primary)] transition-all hover:shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => speakText(mistake.correctAnswer)}
                    className="w-10 h-10 rounded-2xl bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] flex items-center justify-center hover:bg-[var(--accent-primary)] hover:text-[var(--accent-text)] transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                  </button>
                  <div>
                    <h4 className="text-xl font-bold text-[var(--text-primary)]">{mistake.correctAnswer}</h4>
                    {mistake.phonetic && (
                      <span className="text-xs font-medium text-[var(--text-muted)] font-serif">/{mistake.phonetic}/</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[var(--text-muted)] italic">Your answer: {mistake.userAnswer}</p>
                </div>
              </div>
              <p className="text-[var(--text-muted)] mb-4">{mistake.chineseMeaning}</p>
              <button 
                onClick={() => handleRetry(mistake)}
                className="px-4 py-2 bg-[var(--accent-primary)] text-[var(--accent-text)] rounded-xl hover:bg-[var(--accent-secondary)] transition-all text-sm"
              >
                Retry This Exercise
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Mistakes;
