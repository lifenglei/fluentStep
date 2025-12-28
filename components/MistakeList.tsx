
import React from 'react';
import { PhraseExercise } from '../types';
import { speakText } from '../geminiService';

interface MistakeListProps {
  mistakes: { exercise: PhraseExercise, count: number }[];
  onClose: () => void;
}

const MistakeList: React.FC<MistakeListProps> = ({ mistakes, onClose }) => {
  return (
    <div className="animate-fade-in pb-10 theme-transition h-full overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 md:px-8 mt-40">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="text-left">
            <span className="px-4 py-1.5 bg-[var(--error-bg)] text-[var(--error)] border border-[var(--error)]/20 rounded-full text-[9px] font-bold uppercase tracking-[0.3em] mb-3 inline-block">
              Mistake Analysis
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] tracking-tight">My Weak Points</h2>
            <p className="text-[var(--text-muted)] mt-2 font-normal text-sm">Review the phrases that challenged you most today.</p>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'var(--accent-soft)', color: 'var(--text-primary)' }}
            className="flex items-center gap-2 px-6 py-3 hover:bg-[var(--error-bg)] hover:text-[var(--error)] rounded-xl transition-all active:scale-95 border border-[var(--border-primary)] font-bold text-xs uppercase tracking-wider theme-transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Return
          </button>
        </div>

        {mistakes.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-6 bg-[var(--card-bg)] rounded-3xl border border-[var(--border-primary)] shadow-lg theme-transition">
            <div className="w-20 h-20 bg-[var(--success-bg)] rounded-full flex items-center justify-center text-[var(--success)]">
               <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight">Flawless Session!</h3>
            <p className="text-[var(--text-muted)] max-w-md font-normal">No mistakes recorded yet. Your accuracy is impressive!</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              {mistakes.sort((a, b) => b.count - a.count).map(({ exercise: word, count }, index) => (
                <div 
                  key={word.id} 
                  className="bg-[var(--card-bg)] border border-[var(--border-primary)]/40 p-5 rounded-2xl flex flex-col gap-4 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 animate-fade-in group theme-transition"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => speakText(word.correctAnswer)}
                        style={{ background: 'var(--accent-soft)', color: 'var(--accent-primary)' }}
                        className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-all shadow-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                      </button>
                      <div>
                        <div className="flex items-baseline gap-2">
                          <h4 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{word.correctAnswer}</h4>
                          <span className="text-sm font-normal text-[var(--text-muted)] font-serif">/{word.phonetic}/</span>
                        </div>
                        <p className="text-xs font-bold text-[var(--error)] uppercase tracking-[0.2em] mt-1 flex items-center gap-1.5">
                           <span className="w-1.25 h-1.25 rounded-full bg-[var(--error)]"></span>
                           Failed {count} times
                        </p>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                       <p className="text-xl font-bold text-[var(--text-muted)]">{word.correctAnswerChinese}</p>
                    </div>
                  </div>

                  <div className="bg-[var(--bg-primary)]/30 rounded-xl p-6 border border-[var(--border-primary)]/20 italic theme-transition shadow-inner relative overflow-hidden">
                    <p className="text-[var(--text-primary)] text-base md:text-lg leading-relaxed font-normal relative z-10">
                      "{word.sentenceWithBlank.replace('___', `[${word.correctAnswer}]`)}"
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase mt-5 tracking-[0.3em] relative z-10">{word.chineseMeaning}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MistakeList;
