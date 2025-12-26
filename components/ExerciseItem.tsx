
import React, { useState, useRef, useEffect } from 'react';
import { PhraseExercise } from '../types';
import { speakText } from '../geminiService';

interface ExerciseItemProps {
  exercise: PhraseExercise;
  phraseImage: string | null;
  isImageLoading: boolean;
  onComplete: () => void;
  onMistake: (exercise: PhraseExercise) => void;
}

const ExerciseItem: React.FC<ExerciseItemProps> = ({ exercise, phraseImage, isImageLoading, onComplete, onMistake }) => {
  const [userInput, setUserInput] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isError, setIsError] = useState(false);
  const [shake, setShake] = useState(false);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [errorCount, setErrorCount] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUserInput('');
    setIsCorrect(false);
    setShowHint(false);
    setIsError(false);
    setErrorCount(0);
    setIsAnswerRevealed(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [exercise.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserInput(val);
    setIsError(false);
    
    if (val.trim().toLowerCase() === exercise.correctAnswer.toLowerCase()) {
      handleSuccess();
    }
  };

  const handleSuccess = () => {
    setIsCorrect(true);
    setIsError(false);
    onComplete();
    const fullSentence = exercise.sentenceWithBlank.replace('___', exercise.correctAnswer);
    handleSpeak(fullSentence, 'main');
  };

  const handleBlur = () => {
    if (userInput.trim() !== '' && !isCorrect) {
      if (userInput.trim().toLowerCase() !== exercise.correctAnswer.toLowerCase()) {
        setIsError(true);
        setShake(true);
        setErrorCount(prev => prev + 1);
        onMistake(exercise); // Record mistake to parent
        setTimeout(() => setShake(false), 500);
      }
    }
  };

  const handleShowAnswer = () => {
    setIsAnswerRevealed(true);
    setUserInput(exercise.correctAnswer);
    onMistake(exercise); // Revealing answer also counts as a "missed" opportunity
    handleSuccess();
  };

  const handleSpeak = async (text: string, id: string) => {
    setIsPlaying(id);
    await speakText(text);
    setIsPlaying(null);
  };

  const sentenceParts = exercise.sentenceWithBlank.split('___');

  return (
    <div className="w-full space-y-12">
      {/* Dynamic Visual Hint / Background */}
      <div className={`relative w-full bg-[var(--card-bg)] rounded-[2.5rem] md:rounded-[3.5rem] border-2 transition-all duration-1000 shadow-2xl theme-transition ${
        isCorrect ? 'border-emerald-400 translate-y-[-8px]' : isError ? 'border-rose-200' : 'border-[var(--border-primary)]'
      }`}>
        
        {!isCorrect && phraseImage && (
          <div className="absolute inset-0 opacity-[0.03] grayscale pointer-events-none rounded-[3.5rem] overflow-hidden">
            <img src={phraseImage} className="w-full h-full object-cover" alt="" />
          </div>
        )}

        <div className="relative z-10 p-8 md:p-24 flex flex-col gap-12 items-center">
          <div className="w-full flex justify-between items-center">
             <div className="flex items-center gap-3">
               <div className={`w-2 h-2 rounded-full ${isCorrect ? 'bg-emerald-500' : isError ? 'bg-rose-500' : 'bg-indigo-600 animate-pulse'}`}></div>
               <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${isError ? 'text-rose-600' : 'text-slate-400'}`}>
                 {isCorrect ? (isAnswerRevealed ? 'Revealed' : 'Mastered') : 'Challenge'}
               </span>
             </div>
             {isCorrect && (
               <button onClick={() => handleSpeak(exercise.sentenceWithBlank.replace('___', exercise.correctAnswer), 'main')} className={`p-4 rounded-2xl transition-all ${isPlaying === 'main' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-[var(--accent-soft)] text-indigo-600 hover:bg-indigo-50 shadow-sm'}`}>
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
               </button>
             )}
          </div>

          <div className="text-xl md:text-3xl font-bold leading-[3.5] text-[var(--text-primary)] text-center max-w-5xl px-2 md:px-6">
            <span className="opacity-90">{sentenceParts[0]}</span>
            <span className="relative inline-flex flex-col items-center mx-4 md:mx-10 align-middle group">
              <span className={`absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-[var(--accent-soft)] rounded-lg text-xs font-bold transition-all duration-700 whitespace-nowrap border border-[var(--border-primary)] ${isCorrect ? 'opacity-0 scale-90 -translate-y-4' : 'opacity-60 group-hover:opacity-100 text-[var(--text-primary)] shadow-sm'}`}>
                {exercise.correctAnswerChinese}
              </span>
              <input
                ref={inputRef}
                disabled={isCorrect}
                value={userInput}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="..."
                className={`bg-transparent border-b-4 outline-none transition-all text-center px-4 py-1 min-w-[60px] md:min-w-[80px] tracking-wide
                  ${isCorrect ? (isAnswerRevealed ? 'border-amber-400 text-amber-600' : 'border-emerald-500 text-emerald-600') : isError ? 'border-rose-400 text-rose-600' : 'border-[var(--border-primary)] focus:border-indigo-600 text-indigo-600'}
                  ${shake ? 'animate-bounce' : ''}
                `}
                style={{ width: `${Math.max(exercise.correctAnswer.length, userInput.length, 3) * (window.innerWidth < 768 ? 16 : 24)}px` }}
              />
            </span>
            <span className="opacity-90">{sentenceParts[1]}</span>
          </div>

          {!isCorrect && (
            <div className="flex flex-col items-center gap-5">
              <div className="flex flex-wrap justify-center gap-4">
                <button onClick={() => { setShowHint(true); setShake(true); setTimeout(() => setShake(false), 500); inputRef.current?.focus(); }} className="px-6 py-2 bg-[var(--accent-soft)] hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-[var(--border-primary)]">Hint?</button>
                {errorCount >= 3 && (
                  <button onClick={handleShowAnswer} className="px-6 py-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-amber-200 animate-fade-in shadow-lg shadow-amber-100">Answer</button>
                )}
              </div>
              {showHint && (
                <div className="px-6 py-4 bg-indigo-600 text-white rounded-2xl font-semibold text-base animate-fade-in shadow-xl shadow-indigo-100">{exercise.hint}</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 transition-all duration-1000 ${isCorrect ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-16 scale-95 pointer-events-none'}`}>
        <div className="lg:col-span-5">
           <div className="bg-[var(--card-bg)] rounded-[2.5rem] overflow-hidden border border-[var(--border-primary)] shadow-xl flex flex-col h-full group theme-transition">
              <div className="relative h-64 overflow-hidden bg-slate-100">
                {phraseImage ? (
                  <img src={phraseImage} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                <div className="absolute bottom-5 left-8">
                  <span className="text-[9px] font-black text-white/70 uppercase tracking-widest block mb-0.5">Focus Term</span>
                  <p className="text-white text-xl font-bold tracking-tight">{exercise.correctAnswer}</p>
                </div>
              </div>
              <div className="p-8 space-y-3">
                 <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] flex items-center gap-2"><div className="w-6 h-[2px] bg-emerald-100"></div>Translation</h4>
                 <p className="text-3xl font-bold text-[var(--text-primary)] tracking-tight leading-tight">{exercise.chineseMeaning}</p>
              </div>
           </div>
        </div>
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {exercise.additionalExamples.map((ex, i) => (
              <div key={i} className="group bg-[var(--card-bg)] p-6 rounded-[2rem] border border-[var(--border-primary)] transition-all duration-300 hover:border-indigo-100 shadow-lg theme-transition">
                <div className="flex items-center gap-6">
                  <button onClick={() => handleSpeak(ex.en, `ex-${i}`)} className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isPlaying === `ex-${i}` ? 'bg-indigo-600 text-white' : 'bg-[var(--accent-soft)] text-slate-300 hover:bg-indigo-600 shadow-sm'}`}><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg></button>
                  <div className="space-y-0.5">
                    <p className="text-lg font-bold text-[var(--text-primary)] tracking-tight">{ex.en}</p>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest italic">{ex.zh}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseItem;
