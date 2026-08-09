export type ModuleType = "mcq" | "fill_blank" | "match" | "true_false" | "short_answer";
export type Category = "normal" | "competitive";

export interface MCQQuestion {
  type?: "mcq";
  id: string;
  question: string;
  options: Record<string, string>;
  correctAnswer: string;
}

export interface FillBlankQuestion {
  type?: "fill_blank";
  id: string;
  question: string;
  correctAnswer: string;
}

export interface MatchQuestion {
  type?: "match";
  id: string;
  question: string;
  listA: string[];
  listB: string[];
  correctPairs: Record<string, string>;
}

export interface TrueFalseQuestion {
  type?: "true_false";
  id: string;
  question: string;
  correctAnswer: boolean;
}

export interface ShortAnswerQuestion {
  type?: "short_answer";
  id: string;
  question: string;
  correctAnswer: string;
}

export interface QuizModule {
  type: ModuleType;
  questions: QuizQuestion[];
}

export type QuizQuestion =
  | MCQQuestion
  | FillBlankQuestion
  | MatchQuestion
  | TrueFalseQuestion
  | ShortAnswerQuestion;

export interface QuizData {
  modules: QuizModule[];
}

export interface QuizRecord {
  id: string;
  title: string;
  source_content: string;
  source_label: string | null;
  category: string;
  question_count: number;
  module_types: string[];
  quiz_data: QuizData;
  created_at: string;
}

export const MODULE_LABELS: Record<ModuleType, string> = {
  mcq: "Multiple Choice",
  fill_blank: "Fill in the Blanks",
  match: "Match the Following",
  true_false: "True / False",
  short_answer: "Short Answer",
};

export const MODULE_ICONS: Record<ModuleType, string> = {
  mcq: "ListChecks",
  fill_blank: "PenLine",
  match: "ArrowLeftRight",
  true_false: "CheckCheck",
  short_answer: "TextCursorInput",
};

export const CATEGORY_LABELS: Record<Category, string> = {
  normal: "Normal Questions",
  competitive: "Competitive / Exam-Style",
};
