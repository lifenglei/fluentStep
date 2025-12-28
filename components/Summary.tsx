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
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-6 md:p-10 pt-[82px] animate-fade-in">
      {/* Immersive Backdrop */}
      <div className="absolute inset-0 bg-[var(--bg-primary)] backdrop-blur-2xl"></div>
      
      <div className="relative z-10 w-full max-w-5xl flex flex-col h-full max-h-[calc(100vh-82px)]">
        <div className="text-center mb-10">
          <span className="px-5 py-2 bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-4 inline-block">
            Learning Milestone Reached
          </span>
          <h2 className="text-5xl md:text-6xl font-black text-[var(--text-primary)] tracking-tighter">Checkpoint Review</h2>
          <p className="text-[var(--text-muted)] mt-2 font-medium">You've just mastered 10 new phrases. Let's lock them in.</p>
        </div>

        {/* Words Grid */}
        <div className="flex-grow overflow-y-auto pr-4 custom-scrollbar space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {learnedBatch.map((word, index) => (
              <div 
                key={word.id} 
                className="group bg-[var(--card-bg)]/80 border border-[var(--border-primary)] p-5 rounded-3xl flex items-center justify-between hover:bg-[var(--card-bg)] transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-5">
                  <button 
                    onClick={() => speakText(word.correctAnswer)}
                    className="w-12 h-12 rounded-2xl bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] flex items-center justify-center group-hover:bg-[var(--accent-primary)] group-hover:text-[var(--accent-text)] transition-all shadow-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                  </button>
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-3">
                      <h4 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">{word.correctAnswer}</h4>
                      {word.phonetic && (
                        <span className="text-xs font-medium text-[var(--text-muted)] font-serif">/{word.phonetic}/</span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mt-1">{word.correctAnswerChinese}</p>
                  </div>
                </div>
                <div className="text-right pr-2">
                  <p className="text-sm text-[var(--text-muted)] italic max-w-[150px] truncate">{word.chineseMeaning}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-10 pt-6 border-t border-[var(--border-primary)] flex justify-center">
          <button 
            onClick={onContinue}
            className="px-14 py-6 bg-[var(--accent-primary)] text-[var(--accent-text)] rounded-full font-black text-xl hover:bg-[var(--accent-secondary)] hover:text-[var(--accent-text)] transition-all shadow-2xl flex items-center gap-6 group"
          >
            Keep Moving Forward
            <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Summary;
