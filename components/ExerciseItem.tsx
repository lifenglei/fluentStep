
import React, { useState, useRef, useEffect } from 'react';
import { PhraseExercise } from '../types';
import { speakText } from '../geminiService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCheck, faVolumeHigh } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';

interface ExerciseItemProps {
  exercise: PhraseExercise;
  phraseImage: string | null;
  isImageLoading: boolean;
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
  phraseImage, 
  isImageLoading, 
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
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden rounded-3xl border-[var(--border-primary)] bg-[var(--card-bg)] shadow-xl theme-transition max-h-[80vh] overflow-y-auto pt-6">
        {/* 左侧：上中下结构 */}
        <div className="flex flex-col border-r border-[var(--border-primary)] theme-transition">
          {/* 上：情景图片展示 */}
          <div className="bg-[var(--card-bg)] overflow-hidden flex-shrink-0 theme-transition min-h-[150px] max-h-[200px]">
            <img 
              src="../images/meng.jpg" 
              className="w-full h-full object-contain" 
              alt={exercise.correctAnswer}
            />
          </div>

          {/* 中：单词发音翻译 - 与右侧上半部分对齐 - 仅当答对或显示答案时可见 */}
          {(isCorrect || isAnswerRevealed) && (
            <div className="bg-[var(--card-bg)] dark:bg-slate-800 p-6 flex-shrink-0" style={{ minHeight: '150px', maxHeight: '200px' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">Key Word</div>
                  <div className="text-2xl font-bold text-[var(--text-primary)]">{exercise.correctAnswer}</div>
                  {exercise.phonetic && (
                    <div className="text-sm text-[var(--text-muted)] mt-1">/{exercise.phonetic}/</div>
                  )}
                </div>
                <button 
                    onClick={() => handleSpeak(exercise.correctAnswer, 'word')} 
                    className={`p-3 rounded-xl transition-all ${
                      isPlaying === 'word' 
                        ? 'bg-[var(--accent-primary)] text-[var(--accent-text)] shadow-lg' 
                        : 'bg-[var(--accent-soft)] text-[var(--accent-primary)] hover:bg-[var(--accent-soft)/80]'
                    }`}
                >
                  <FontAwesomeIcon icon="fa-solid fa-volume-high" size="lg" />
                </button>
              </div>
              <div className="pt-4">
                <div className="text-xs font-semibold text-[var(--success)] uppercase tracking-wider mb-2">Translation</div>
                <div className="text-lg font-semibold text-[var(--text-primary)]">{exercise.correctAnswerChinese}</div>
              </div>
            </div>
          )}

          {/* 下：句子翻译 - 仅当答对或显示答案时可见 */}
          {(isCorrect || isAnswerRevealed) && (
            <div className="bg-[var(--card-bg)] p-6 flex-1 theme-transition">
              <div className="text-xs font-semibold text-[var(--accent-primary)] uppercase tracking-wider mb-3">Full Sentence</div>
              <div className="text-base font-medium text-[var(--text-primary)] leading-relaxed mb-3">
                {exercise.sentenceWithBlank.replace('___', exercise.correctAnswer)}
              </div>
              <div className="pt-3">
                <div className="text-sm text-[var(--text-muted)] leading-relaxed">
                  {exercise.chineseMeaning}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 右侧：上下结构 */}
        <div className="flex flex-col">
          {/* 上：单词填写 - 与左侧图片对齐 */}
          <div className={`bg-[var(--card-bg)] transition-all duration-500 border-b-2 border-[var(--border-primary)] flex-shrink-0 theme-transition ${
            isCorrect ? 'border-b-emerald-400' : 
            isError ? 'border-b-rose-400' : 
            ''
          }`} style={{ minHeight: '150px', maxHeight: '200px' }}>
            <div className="p-6 h-full flex flex-col justify-center">
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    isCorrect ? 'bg-[var(--success)]' : 
                    isError ? 'bg-[var(--error)]' : 
                    'bg-[var(--accent-primary)] animate-pulse'
                  }`}></div>
                  <span className={`text-xs font-semibold uppercase tracking-wider ${
                    isCorrect ? 'text-[var(--success)]' : 
                    isError ? 'text-[var(--error)]' : 
                    'text-[var(--text-muted)]'
                  }`}>
                    {isCorrect ? (isAnswerRevealed ? 'Revealed' : 'Correct!') : 'Fill in the blank'}
                  </span>
                </div>
                {isCorrect && (
                  <button 
                    onClick={() => handleSpeak(exercise.sentenceWithBlank.replace('___', exercise.correctAnswer), 'main')} 
                    className={`p-2.5 rounded-xl transition-all ${
                      isPlaying === 'main' 
                        ? 'bg-[var(--accent-primary)] text-[var(--accent-text)] shadow-lg' 
                        : 'bg-[var(--accent-soft)] text-[var(--accent-primary)] hover:bg-[var(--accent-soft)/80]'
                    }`}
                  >
                    <FontAwesomeIcon icon="fa-solid fa-volume-high" size="lg" />
                  </button>
                )}
              </div>

              {/* Sentence with Blank */}
              <div className="text-left mb-6">
                <div className="text-xl md:text-2xl font-semibold text-[var(--text-primary)] leading-relaxed theme-transition">
                  <span className="opacity-80">{sentenceParts[0]}</span>
                  <span className="relative inline-block mx-2 md:mx-3 align-middle">
                    <div className="relative inline-block">
                      {/* Simple underline style */}
                      <input
                        ref={inputRef}
                        disabled={isCorrect}
                        value={userInput}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="..."
                        className={`bg-transparent border-b border-[var(--border-primary)] outline-none transition-all text-center px-0 py-1 min-w-[120px] md:min-w-[160px] font-semibold text-xl md:text-2xl tracking-wide placeholder:text-[var(--text-muted)] ${isCorrect ? 'border-[var(--success)] text-[var(--success)]' : isError ? 'border-[var(--error)] text-[var(--error)]' : 'text-[var(--accent-primary)] focus:border-[var(--accent-primary)]'} ${shake ? 'animate-pulse' : ''} theme-transition`}
                        style={{ width: 'auto' }}
                      />
                    </div>
                  </span>
                  <span className="text-sm font-medium text-[var(--accent-primary)] ml-2">({exercise.correctAnswerChinese})</span>
                  <span className="opacity-80">{sentenceParts[1]}</span>
                </div>
              </div>

              {/* Show Answer Button */}
              {!isCorrect && errorCount >= 3 && (
                <div className="flex justify-center">
                  <button 
                    onClick={handleShowAnswer} 
                    className="px-4 py-2 bg-[var(--warning-bg)] hover:bg-[var(--warning-bg)/80] text-[var(--warning)] rounded-xl text-sm font-medium transition-all shadow-sm theme-transition"
                  >
                    Show Answer
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 下：示例演示 - 仅当答对或显示答案时可见 */}
          {(isCorrect || isAnswerRevealed) && (
            <div className="bg-[var(--card-bg)] p-4 flex-1 overflow-y-auto theme-transition">
              <div className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">
                Example Sentences
              </div>
              <div className="space-y-3">
                {exercise.additionalExamples.slice(0, 3).map((ex, i) => (
                  <div 
                    key={i} 
                    className="group bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-primary)] hover:border-[var(--accent-primary)] transition-all duration-300 theme-transition"
                  >
                    <div className="flex items-start gap-3">
                      <button 
                        onClick={() => handleSpeak(ex.en, `ex-${i}`)} 
                        className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                          isPlaying === `ex-${i}` 
                            ? 'bg-[var(--accent-primary)] text-[var(--accent-text)] shadow-lg' 
                            : 'bg-[var(--card-bg)] text-[var(--text-muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent-primary)]'
                        }`}
                      >
                        <FontAwesomeIcon icon="fa-solid fa-volume-high" size="sm" />
                      </button>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium text-[var(--text-primary)] leading-relaxed theme-transition">
                          {ex.en}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] italic theme-transition">
                          {ex.zh}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 底部导航操作区域 - 与卡片融为一体 */}
        <div className={`col-span-1 lg:col-span-2 bg-[var(--card-bg)] ${
          isCorrect ? 'border-[var(--success)]' : 
          isError ? 'border-[var(--error)]' : 
          'border-[var(--border-primary)]'
        } theme-transition`}>
          <div className="flex items-center justify-between p-4">
            <button 
              onClick={onPrev} 
              disabled={!canGoPrev} 
              className={`h-10 w-10 md:h-12 md:w-12 flex items-center justify-center rounded-full transition-all ${
                !canGoPrev 
                  ? 'bg-[var(--bg-secondary)] text-[var(--text-muted)] cursor-not-allowed' 
                  : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-soft)] active:scale-90'
              }`}
            >
              <FontAwesomeIcon icon="fa-solid fa-arrow-left" size="lg" />
            </button>
            <div className="flex-grow flex justify-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse"></div>
                <span className="text-[9px] md:text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Live AI Environment</span>
              </div>
            </div>
            {isMilestoneReached && onShowSummary ? (
              <button 
                onClick={onShowSummary} 
                className="h-10 md:h-12 flex items-center gap-2 md:gap-3 px-4 md:px-6 rounded-full transition-all font-semibold text-xs md:text-sm bg-[var(--accent-primary)] text-[var(--accent-text)] hover:bg-[var(--accent-primary)]/90 hover:scale-[1.02] active:scale-95 shadow-lg theme-transition"
              >
                Review 10
                <FontAwesomeIcon icon="fa-solid fa-check" size="lg" />
              </button>
            ) : (
              <button 
                onClick={onNext} 
                disabled={!canGoNext} 
                className={`h-10 md:h-12 flex items-center gap-2 md:gap-3 px-4 md:px-6 rounded-full transition-all font-semibold text-xs md:text-sm ${
                  !canGoNext 
                    ? 'bg-[var(--bg-secondary)] text-[var(--text-muted)] cursor-not-allowed' 
                    : 'bg-[var(--accent-primary)] text-[var(--accent-text)] hover:bg-[var(--accent-primary)]/90 hover:scale-[1.02] shadow-lg active:scale-95'
                } theme-transition`}
              >
                {isLast ? 'Finish' : 'Next'}
                <FontAwesomeIcon icon="fa-solid fa-arrow-right" size="lg" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseItem;
