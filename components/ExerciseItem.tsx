
import React, { useState, useRef, useEffect } from 'react';
import { PhraseExercise } from '../types';
import { speakText } from '../geminiService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faCheck, faVolumeHigh } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';

interface ExerciseItemProps {
  exercise: PhraseExercise;
  onComplete: () => void;
  onMistake: (exercise: PhraseExercise) => void;
  onPrev?: () => void;
  onNext?: () => void;
  canGoPrev?: boolean;
  canGoNext?: boolean;
  isMilestoneReached?: boolean;
  onShowSummary?: () => void;
  isLast?: boolean;
  isCompleted?: boolean;
}

const ExerciseItem: React.FC<ExerciseItemProps> = ({ 
  exercise, 
  onComplete, 
  onMistake,
  onPrev,
  onNext,
  canGoPrev = false,
  canGoNext = false,
  isMilestoneReached = false,
  onShowSummary,
  isLast = false,
  isCompleted = false
}) => {
  const [userInput, setUserInput] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [isError, setIsError] = useState(false);
  const [shake, setShake] = useState(false);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [errorCount, setErrorCount] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUserInput('');
    setIsCorrect(false);
    setIsError(false);
    setErrorCount(0);
    setIsAnswerRevealed(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [exercise.id]);

  // If exercise is already completed, reveal answer immediately
  useEffect(() => {
    if (isCompleted) {
      setIsCorrect(true);
      setIsAnswerRevealed(true);
      setUserInput(exercise.correctAnswer);
    }
  }, [isCompleted, exercise.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    // 过滤掉所有非拼音字符，只允许英文字母、空格和连字符
    val = val.replace(/[^a-zA-Z\s-]/g, '');
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
        onMistake(exercise);
        setTimeout(() => setShake(false), 500);
      }
    }
  };

  const handleShowAnswer = () => {
    setIsAnswerRevealed(true);
    setUserInput(exercise.correctAnswer);
    onMistake(exercise);
    handleSuccess();
  };

  const handleSpeak = async (text: string, id: string) => {
    setIsPlaying(id);
    await speakText(text);
    setIsPlaying(null);
  };

  const sentenceParts = exercise.sentenceWithBlank.split('___');

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 flex flex-col overflow-hidden rounded-[2.5rem] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl relative transition-all duration-500">
        
        {/* Top Section: Image Banner */}
        <div className={`relative w-full overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] flex-shrink-0 ${
            (isCorrect || isAnswerRevealed) ? 'h-[30%]' : 'h-[40%]'
        }`}>
             {/* Main Image - Fully Visible */}
             <img 
              src="../images/meng.jpg" 
              className="w-full h-full object-cover object-[center_25%] transition-transform duration-1000 scale-105 group-hover:scale-110" 
              alt={exercise.correctAnswer}
            />
            {/* Gradient Overlay for seamless blend */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/90 dark:to-slate-900/90"></div>
            
            {/* Floating Status Badge */}
            <div className="absolute top-6 left-6 z-20 flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                 <div className={`w-2 h-2 rounded-full ${isCorrect ? 'bg-green-400' : isError ? 'bg-red-400' : 'bg-blue-400 animate-pulse'}`}></div>
                 <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                    {isCorrect ? 'Solved' : 'Challenge'}
                 </span>
            </div>
        </div>

        {/* Middle Section: Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 -mt-6">
            <div className="px-6 md:px-10 pb-6">
                
                {/* Main Content Card */}
                <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-700 relative min-h-[300px] flex flex-col justify-center">
                    {/* Sentence Input */}
                    <div className="text-center space-y-8">
                        <div className="text-2xl md:text-3xl lg:text-4xl font-medium text-[var(--text-primary)] leading-loose font-serif tracking-wide relative z-0">
                            <span className="opacity-90">{sentenceParts[0]}</span>
                            <span className="relative inline-flex flex-col mx-3 align-baseline group justify-end pb-8">
                                <input
                                ref={inputRef}
                                disabled={isCorrect}
                                value={userInput}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                placeholder=""
                                className={`bg-transparent border-b-[2px] outline-none transition-all text-center px-4 py-1 min-w-[160px] font-bold text-inherit tracking-wide placeholder:text-transparent ${
                                    isCorrect 
                                        ? 'border-[var(--success)] text-[var(--success)]' 
                                        : isError 
                                            ? 'border-[var(--error)] text-[var(--error)]' 
                                            : 'border-slate-300 dark:border-slate-600 focus:border-[var(--accent-primary)] text-[var(--accent-primary)]'
                                } ${shake ? 'animate-shake' : ''}`}
                                />
                                {/* Floating Label/Hint - Positioned absolute at bottom, inside the padding area */}
                                <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 text-xs font-sans font-bold text-slate-400 uppercase tracking-widest transition-all duration-300 whitespace-nowrap z-50 ${userInput ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
                                    {exercise.correctAnswerChinese}
                                </span>
                            </span>
                            <span className="opacity-90">{sentenceParts[1]}</span>
                        </div>
                        
                        {!isCorrect && (
                           <div className="flex justify-center">
                               {errorCount >= 3 ? (
                                   <button 
                                     onClick={handleShowAnswer}
                                     className="text-xs font-bold text-amber-500 hover:text-amber-600 transition-colors uppercase tracking-widest border-b border-amber-500/30 pb-0.5"
                                   >
                                     Show Answer
                                   </button>
                               ) : (
                                   <div className="h-6"></div> // Spacer
                               )}
                           </div>
                        )}

                        {/* Play Full Sentence Button - Shown when correct */}
                        {(isCorrect || isAnswerRevealed) && (
                           <div className="flex justify-center pt-2 animate-fade-in-up">
                                <button 
                                    onClick={() => handleSpeak(exercise.sentenceWithBlank.replace('___', exercise.correctAnswer), 'main')}
                                    className="px-6 py-2.5 bg-[var(--accent-primary)]/10 hover:bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] rounded-full font-bold text-sm transition-all flex items-center gap-2.5 group"
                                >
                                    <div className="w-6 h-6 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <FontAwesomeIcon icon={faVolumeHigh} size="xs" />
                                    </div>
                                    <span>Play Full Sentence</span>
                                </button>
                           </div>
                        )}
                    </div>

                    {/* Revealed Information */}
                    {(isCorrect || isAnswerRevealed) && (
                        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700 animate-fade-in-up">
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                {/* Left: Word Definition */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-2">
                                        <h3 className="text-3xl font-bold text-[var(--text-primary)]">{exercise.correctAnswer}</h3>
                                        <button 
                                            onClick={() => handleSpeak(exercise.correctAnswer, 'word')}
                                            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[var(--accent-primary)] hover:scale-110 transition-transform"
                                        >
                                            <FontAwesomeIcon icon={faVolumeHigh} size="sm" />
                                        </button>
                                    </div>
                                    <div className="text-lg text-slate-600 dark:text-slate-300 font-medium mb-4">{exercise.chineseMeaning}</div>
                                </div>

                                {/* Right: Examples */}
                                <div className="flex-1 space-y-3 w-full">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Usage Examples</h4>
                                    {exercise.additionalExamples.map((ex, i) => (
                                        <div key={i} className="flex gap-4 items-start p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group">
                                            <button 
                                                onClick={() => handleSpeak(ex.en, `ex-${i}`)}
                                                className="flex-shrink-0 w-10 h-10 rounded-full bg-white dark:bg-slate-600 flex items-center justify-center text-[var(--accent-primary)] hover:scale-110 hover:bg-[var(--accent-primary)] hover:text-white transition-all shadow-sm"
                                            >
                                                <FontAwesomeIcon icon={faVolumeHigh} size="sm" />
                                            </button>
                                            <div>
                                                <p className="text-sm font-medium text-[var(--text-primary)] mb-1 leading-relaxed">{ex.en}</p>
                                                <p className="text-xs text-slate-500">{ex.zh}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Bottom Section: Minimal Footer */}
        <div className="flex-shrink-0 p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md z-20 flex justify-between items-center border-t border-white/20">
              <button 
                onClick={onPrev} 
                disabled={!canGoPrev} 
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  !canGoPrev ? 'opacity-0 pointer-events-none' : 'hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-primary)]'
                }`}
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>

              <div className="flex-1 px-8">
                  {/* Progress Bar or Status */}
                  {(isCorrect || isAnswerRevealed) && (
                      <div className="text-center animate-fade-in">
                          <span className="text-xs font-bold text-green-500 uppercase tracking-widest">Excellent</span>
                      </div>
                  )}
              </div>

              {isMilestoneReached && onShowSummary ? (
                    <button 
                    onClick={onShowSummary}
                    className="px-6 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg"
                    >
                    <span>Review</span>
                    </button>
            ) : (
                    <button 
                    onClick={onNext}
                    disabled={!canGoNext}
                    className={`px-6 py-3 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${
                        !canGoNext
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        : 'bg-[var(--text-primary)] text-[var(--bg-primary)] hover:scale-105 active:scale-95 shadow-lg'
                    }`}
                    >
                    <span>Next</span>
                    <FontAwesomeIcon icon={faArrowRight} />
                    </button>
            )}
        </div>

      </div>
    </div>
  );
};

export default ExerciseItem;
