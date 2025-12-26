
export interface Example {
  en: string;
  zh: string;
}

export interface PhraseExercise {
  id: string;
  sentenceWithBlank: string; // The sentence with "___"
  correctAnswer: string;
  correctAnswerChinese: string; 
  chineseMeaning: string;
  phonetic: string; // IPA phonetic symbols
  additionalExamples: Example[]; // Updated to object with en and zh
  hint: string;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface UserProgress {
  [scenarioId: string]: {
    completedIds: string[];
    currentScore: number;
  };
}
