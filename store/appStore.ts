import { create } from 'zustand';
import { Scenario, PhraseExercise } from '../types';

export interface AppStore {
  selectedScenario: Scenario | null;
  exercises: PhraseExercise[];
  currentIndex: number;
  completedCount: number;
  isCurrentSolved: boolean;
  learnedBatch: PhraseExercise[];
  showSummary: boolean;
  showMistakes: boolean;
  showCheckIn: boolean;
  completedExercises: Set<string>;
  mistakes: Record<string, { exercise: PhraseExercise; count: number }>;
  
  setSelectedScenario: (scenario: Scenario | null) => void;
  setExercises: (exercises: PhraseExercise[]) => void;
  setCurrentIndex: (index: number) => void;
  setCompletedCount: (count: number) => void;
  setIsCurrentSolved: (solved: boolean) => void;
  setLearnedBatch: (batch: PhraseExercise[]) => void;
  setShowSummary: (show: boolean) => void;
  setShowMistakes: (show: boolean) => void;
  setShowCheckIn: (show: boolean) => void;
  setCompletedExercises: (exercises: Set<string>) => void;
  setMistakes: (mistakes: Record<string, { exercise: PhraseExercise; count: number }>) => void;
  
  addCompletedExercise: (id: string) => void;
  addMistake: (exercise: PhraseExercise) => void;
  reset: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  selectedScenario: null,
  exercises: [],
  currentIndex: 0,
  completedCount: 0,
  isCurrentSolved: false,
  learnedBatch: [],
  showSummary: false,
  showMistakes: false,
  showCheckIn: false,
  completedExercises: new Set(),
  mistakes: {},
  
  setSelectedScenario: (scenario) => set({ selectedScenario: scenario }),
  setExercises: (exercises) => set({ exercises }),
  setCurrentIndex: (index) => set({ currentIndex: index }),
  setCompletedCount: (count) => set({ completedCount: count }),
  setIsCurrentSolved: (solved) => set({ isCurrentSolved: solved }),
  setLearnedBatch: (batch) => set({ learnedBatch: batch }),
  setShowSummary: (show) => set({ showSummary: show }),
  setShowMistakes: (show) => set({ showMistakes: show }),
  setShowCheckIn: (show) => set({ showCheckIn: show }),
  setCompletedExercises: (exercises) => set({ completedExercises: exercises }),
  setMistakes: (mistakes) => set({ mistakes }),
  
  addCompletedExercise: (id) => set((state) => ({
    completedExercises: new Set(state.completedExercises).add(id)
  })),
  
  addMistake: (exercise) => set((state) => ({
    mistakes: {
      ...state.mistakes,
      [exercise.id]: {
        exercise,
        count: (state.mistakes[exercise.id]?.count || 0) + 1
      }
    }
  })),
  
  reset: () => set({
    selectedScenario: null,
    exercises: [],
    currentIndex: 0,
    completedCount: 0,
    isCurrentSolved: false,
    learnedBatch: [],
    showSummary: false,
    showMistakes: false,
    completedExercises: new Set(),
    mistakes: {}
  })
}));
