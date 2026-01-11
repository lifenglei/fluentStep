import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { speakText } from '../geminiService';

const Summary: React.FC = () => {
  const navigate = useNavigate();
  const { learnedBatch, setLearnedBatch, setShowSummary } = useAppStore();

  const onContinue = () => {
    setLearnedBatch([]);
    setShowSummary(false);
    navigate(-1); // Go back to previous page
  };

  // If no words to summarize, redirect back
  if (learnedBatch.length === 0) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] animate-fade-in">
      <div className="flex-1 flex items-start justify-center p-6 md:p-10 overflow-hidden">
        {/* Immersive Backdrop */}
        <div className="absolute inset-0 bg-[var(--bg-primary)] backdrop-blur-2xl z-0"></div>
        
        <div className="relative z-10 w-full max-w-5xl flex flex-col h-full">
        <div className="text-center mb-12 mt-8">
          <span className="px-5 py-2 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-4 inline-block">
            Learning Milestone Reached
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tighter">Checkpoint Review</h2>
          <p className="text-[var(--text-muted)] mt-3 font-medium text-base">You've just mastered {learnedBatch.length} new phrases. Let's lock them in.</p>
        </div>

        {/* Words Grid */}
        <div className="flex-grow overflow-y-auto pr-4 custom-scrollbar space-y-3 min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {learnedBatch.map((word, index) => (
              <div 
                key={word.id} 
                className="group bg-[var(--card-bg)] border border-[var(--border-primary)] p-4 sm:p-5 rounded-2xl transition-all duration-300 animate-fade-in hover:shadow-xl hover:border-[var(--accent-primary)]/30"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Pronunciation Button */}
                  <button 
                    onClick={() => speakText(word.correctAnswer)}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center group-hover:bg-[var(--accent-primary)] group-hover:text-[var(--accent-text)] transition-all flex-shrink-0"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                  </button>
                  
                  {/* Main Content */}
                  <div className="flex-grow">
                    {/* Word, Phonetic, Part of Speech */}
                    <div className="flex flex-wrap items-baseline gap-2 sm:gap-3 mb-2">
                      <h4 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] tracking-tight">{word.correctAnswer}</h4>
                      {word.phonetic && (
                        <span className="text-xs font-medium text-[var(--text-muted)] font-serif">/{word.phonetic}/</span>
                      )}
                      {word.partOfSpeech && (
                        <span className="text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] rounded-full">
                          {word.partOfSpeech}
                        </span>
                      )}
                    </div>
                    
                    {/* Chinese Translation */}
                    <p className="text-sm text-[var(--text-primary)] mb-2 sm:mb-3">{word.correctAnswerChinese}</p>
                    
                    {/* Common Collocations */}
                    {word.commonCollocations && word.commonCollocations.length > 0 && (
                      <div className="space-y-1">
                        {word.commonCollocations.slice(0, 2).map((collocation, idx) => (
                          <div key={idx} className="text-[10px] sm:text-xs flex items-baseline gap-2">
                            <span className="text-[var(--accent-primary)] font-medium">•</span>
                            <span className="text-[var(--text-primary)]">
                              {typeof collocation === 'string' ? collocation : `${(collocation as { en: string; zh: string }).en}`}
                            </span>
                            <span className="text-[var(--text-muted)]">
                              {typeof collocation !== 'string' && `(${((collocation as { en: string; zh: string }).zh)})`}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-10 pt-6 border-t border-[var(--border-primary)] flex justify-center">
          <button 
            onClick={onContinue}
            className="px-12 py-5 bg-[var(--accent-primary)] text-[var(--accent-text)] rounded-full font-bold text-lg hover:bg-[var(--accent-primary)]/95 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-5 group"
          >
            Keep Moving Forward
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
  );
};

export default Summary;
