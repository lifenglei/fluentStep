
import React, { useState, useRef, useEffect } from 'react';
import { PhraseExercise } from '../types';
import { speakText } from '../geminiService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden rounded-3xl  border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl" style={{ gridTemplateRows: 'auto auto' }}>
        {/* 左侧：上中下结构 */}
        <div className="flex flex-col border-r border-slate-200 dark:border-slate-700">
          {/* 上：情景图片展示 */}
          <div className="bg-white dark:bg-slate-800 overflow-hidden flex-shrink-0">
            <div className="relative h-[calc(50vh-4rem)] min-h-[300px] max-h-[400px] bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-700 dark:to-slate-800">
              {phraseImage ? (
                <img 
                  src={phraseImage} 
                  className="w-full h-full object-cover" 
                  alt={exercise.correctAnswer}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-indigo-200 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            </div>
          </div>

          {/* 中：单词发音翻译 - 与右侧上半部分对齐 - 仅当答对或显示答案时可见 */}
          {(isCorrect || isAnswerRevealed) && (
            <div className="bg-white dark:bg-slate-800 p-6 flex-shrink-0" style={{ height: 'calc(50vh - 4rem)', minHeight: '300px', maxHeight: '400px' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Key Word</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{exercise.correctAnswer}</div>
                  {exercise.phonetic && (
                    <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">/{exercise.phonetic}/</div>
                  )}
                </div>
                <button 
                  onClick={() => handleSpeak(exercise.correctAnswer, 'word')} 
                  className={`p-3 rounded-xl transition-all ${
                    isPlaying === 'word' 
                      ? 'bg-indigo-600 text-white shadow-lg' 
                      : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
                  }`}
                >
                  <FontAwesomeIcon icon="fa-solid fa-volume-high" size="lg" />
                </button>
              </div>
              <div className="pt-4">
                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">Translation</div>
                <div className="text-lg font-semibold text-slate-900 dark:text-white">{exercise.correctAnswerChinese}</div>
              </div>
            </div>
          )}

          {/* 下：句子翻译 - 仅当答对或显示答案时可见 */}
          {(isCorrect || isAnswerRevealed) && (
            <div className="bg-white dark:bg-slate-800 p-6 flex-1">
              <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3">Full Sentence</div>
              <div className="text-base font-medium text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                {exercise.sentenceWithBlank.replace('___', exercise.correctAnswer)}
              </div>
              <div className="pt-3">
                <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {exercise.chineseMeaning}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 右侧：上下结构 */}
        <div className="flex flex-col">
          {/* 上：单词填写 - 与左侧图片对齐 */}
          <div className={`bg-white dark:bg-slate-800 transition-all duration-500 border-b-2 border-slate-200 dark:border-slate-700 flex-shrink-0 ${
            isCorrect ? 'border-b-emerald-400' : 
            isError ? 'border-b-rose-400' : 
            ''
          }`} style={{ height: 'calc(50vh - 4rem)', minHeight: '300px', maxHeight: '400px' }}>
            <div className="p-6 h-full flex flex-col justify-center">
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    isCorrect ? 'bg-emerald-500' : 
                    isError ? 'bg-rose-500' : 
                    'bg-indigo-500 animate-pulse'
                  }`}></div>
                  <span className={`text-xs font-semibold uppercase tracking-wider ${
                    isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 
                    isError ? 'text-rose-600 dark:text-rose-400' : 
                    'text-slate-500 dark:text-slate-400'
                  }`}>
                    {isCorrect ? (isAnswerRevealed ? 'Revealed' : 'Correct!') : 'Fill in the blank'}
                  </span>
                </div>
                {isCorrect && (
                  <button 
                    onClick={() => handleSpeak(exercise.sentenceWithBlank.replace('___', exercise.correctAnswer), 'main')} 
                    className={`p-2.5 rounded-xl transition-all ${
                      isPlaying === 'main' 
                        ? 'bg-indigo-600 text-white shadow-lg' 
                        : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
                    }`}
                  >
                    <FontAwesomeIcon icon="fa-solid fa-volume-high" size="lg" />
                  </button>
                )}
              </div>

              {/* Sentence with Blank */}
              <div className="text-left mb-6">
                <div className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white leading-relaxed">
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
                        className={`bg-transparent border-b border-slate-300 dark:border-slate-500 outline-none transition-all text-center px-0 py-1 min-w-[120px] md:min-w-[160px] font-semibold text-xl md:text-2xl tracking-wide placeholder:text-slate-400 placeholder:dark:text-slate-500 ${isCorrect ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : isError ? 'border-rose-500 text-rose-600 dark:text-rose-400' : 'text-indigo-600 dark:text-indigo-400 focus:border-indigo-600 dark:focus:border-indigo-500'} ${shake ? 'animate-pulse' : ''}`}
                        style={{ width: 'auto' }}
                      />
                    </div>
                  </span>
                  <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 ml-2">({exercise.correctAnswerChinese})</span>
                  <span className="opacity-80">{sentenceParts[1]}</span>
                </div>
              </div>

              {/* Show Answer Button */}
              {!isCorrect && errorCount >= 3 && (
                <div className="flex justify-center">
                  <button 
                    onClick={handleShowAnswer} 
                    className="px-4 py-2 bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-400 rounded-xl text-sm font-medium transition-all shadow-sm"
                  >
                    Show Answer
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 下：示例演示 - 仅当答对或显示答案时可见 */}
          {(isCorrect || isAnswerRevealed) && (
            <div className="bg-white dark:bg-slate-800 p-6 flex-1 overflow-y-auto">
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-4">
                Example Sentences
              </div>
              <div className="space-y-3">
                {exercise.additionalExamples.map((ex, i) => (
                  <div 
                    key={i} 
                    className="group bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300"
                  >
                    <div className="flex items-start gap-3">
                      <button 
                        onClick={() => handleSpeak(ex.en, `ex-${i}`)} 
                        className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                          isPlaying === `ex-${i}` 
                            ? 'bg-indigo-600 text-white shadow-lg' 
                            : 'bg-white dark:bg-slate-600 text-slate-600 dark:text-slate-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400'
                        }`}
                      >
                        <FontAwesomeIcon icon="fa-solid fa-volume-high" size="sm" />
                      </button>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-white leading-relaxed">
                          {ex.en}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 italic">
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
        <div className={`col-span-1 lg:col-span-2  bg-white dark:bg-slate-800 ${
          isCorrect ? 'border-emerald-400' : 
          isError ? 'border-rose-400' : 
          'border-slate-200 dark:border-slate-700'
        }`}>
          <div className="flex items-center justify-between p-4">
            <button 
              onClick={onPrev} 
              disabled={!canGoPrev} 
              className={`h-10 w-10 md:h-12 md:w-12 flex items-center justify-center rounded-full transition-all ${
                !canGoPrev 
                  ? 'opacity-0 pointer-events-none' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 active:scale-90'
              }`}
            >
              <FontAwesomeIcon icon="fa-solid fa-arrow-left" size="lg" />
            </button>
            <div className="flex-grow flex justify-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[9px] md:text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Live AI Environment</span>
              </div>
            </div>
            {isMilestoneReached && onShowSummary ? (
              <button 
                onClick={onShowSummary} 
                className="h-10 md:h-12 flex items-center gap-2 md:gap-3 px-4 md:px-6 rounded-full transition-all font-semibold text-xs md:text-sm bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 shadow-lg"
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
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed' 
                    : 'bg-slate-900 dark:bg-slate-700 text-white hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:scale-[1.02] shadow-lg active:scale-95'
                }`}
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
