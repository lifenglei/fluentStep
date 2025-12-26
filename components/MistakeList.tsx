
import React from 'react';
import { PhraseExercise } from '../types';
import { speakText } from '../geminiService';

interface MistakeListProps {
  mistakes: { exercise: PhraseExercise, count: number }[];
  onClose: () => void;
}

const MistakeList: React.FC<MistakeListProps> = ({ mistakes, onClose }) => {
  return (
    <div className="animate-fade-in pb-20 theme-transition">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
          <div className="text-left">
            <span className="px-5 py-2 bg-rose-500/10 text-rose-600 border border-rose-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-4 inline-block">
              Mistake Analysis
            </span>
            <h2 className="text-5xl md:text-7xl font-black text-[var(--text-primary)] tracking-tighter">My Weak Points</h2>
            <p className="text-slate-400 mt-2 font-medium text-lg">Review the phrases that challenged you most today.</p>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'var(--accent-soft)', color: 'var(--text-primary)' }}
            className="flex items-center gap-3 px-8 py-4 hover:bg-rose-500/10 hover:text-rose-600 rounded-2xl transition-all active:scale-95 border border-[var(--border-primary)] font-black text-xs uppercase tracking-widest theme-transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Return
          </button>
        </div>

        {mistakes.length === 0 ? (
          <div className="py-40 flex flex-col items-center justify-center text-center space-y-6 bg-[var(--card-bg)] rounded-[3rem] border border-[var(--border-primary)] shadow-xl theme-transition">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
               <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-[var(--text-primary)] tracking-tighter">Flawless Session!</h3>
            <p className="text-slate-400 max-w-md font-medium">No mistakes recorded yet. Your accuracy is impressive!</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {mistakes.sort((a, b) => b.count - a.count).map(({ exercise: word, count }, index) => (
                <div 
                  key={word.id} 
                  className="bg-[var(--card-bg)] border border-[var(--border-primary)] p-8 rounded-[3rem] flex flex-col gap-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 animate-fade-in group theme-transition"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <button 
                        onClick={() => speakText(word.correctAnswer)}
                        style={{ background: 'var(--accent-soft)', color: 'var(--accent-primary)' }}
                        className="w-16 h-16 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-all shadow-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                      </button>
                      <div>
                        <div className="flex items-baseline gap-3">
                          <h4 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">{word.correctAnswer}</h4>
                          <span className="text-base font-medium text-slate-400 font-serif">/{word.phonetic}/</span>
                        </div>
                        <p className="text-xs font-black text-rose-500 uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                           Failed {count} times
                        </p>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                       <p className="text-2xl font-black text-slate-300">{word.correctAnswerChinese}</p>
                    </div>
                  </div>

                  <div className="bg-[var(--bg-primary)]/50 rounded-[2rem] p-8 border border-[var(--border-primary)] italic theme-transition shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                       <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="text-[var(--text-primary)]"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H16.017C14.9124 8 14.017 7.10457 14.017 6V5C14.017 3.89543 14.9124 3 16.017 3H19.017C21.2261 3 23.017 4.79086 23.017 7V15C23.017 18.3137 20.3307 21 17.017 21H14.017ZM1 21L1 18C1 16.8954 1.89543 16 3 16H6C6.55228 16 7 15.5523 7 15V9C7 8.44772 6.55228 8 6 8H3C1.89543 8 1 7.10457 1 6V5C1 3.89543 1.89543 3 3 3H6C8.20914 3 10 4.79086 10 7V15C10 18.3137 7.31371 21 4 21H1Z"/></svg>
                    </div>
                    <p className="text-[var(--text-primary)] text-lg md:text-xl leading-relaxed font-medium relative z-10">
                      "{word.sentenceWithBlank.replace('___', `[${word.correctAnswer}]`)}"
                    </p>
                    <p className="text-[11px] text-slate-400 font-black uppercase mt-6 tracking-[0.4em] relative z-10">{word.chineseMeaning}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 flex justify-center">
              <button 
                onClick={onClose}
                style={{ 
                  background: 'var(--accent-primary)', 
                  color: 'var(--accent-text)',
                  boxShadow: '0 25px 50px -12px var(--shadow-color)'
                }}
                className="px-16 md:px-20 py-6 md:py-8 rounded-full font-black text-xl md:text-2xl hover:scale-[1.05] transition-all active:scale-95 shadow-2xl flex items-center gap-6 group"
              >
                Back to Learning
                <svg className="w-8 h-8 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MistakeList;
