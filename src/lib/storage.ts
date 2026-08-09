const API_KEY_STORAGE = "gemini_api_key";
const QUIZZES_STORAGE = "saved_quizzes";

export function getApiKey(): string | null {
  try {
    return localStorage.getItem(API_KEY_STORAGE);
  } catch {
    return null;
  }
}

export function setApiKey(key: string): void {
  try {
    const trimmed = key.trim();
    if (trimmed) {
      localStorage.setItem(API_KEY_STORAGE, trimmed);
    } else {
      localStorage.removeItem(API_KEY_STORAGE);
    }
  } catch {
    // ignore
  }
}

export function clearApiKey(): void {
  try {
    localStorage.removeItem(API_KEY_STORAGE);
  } catch {
    // ignore
  }
}

export function hasApiKey(): boolean {
  const key = getApiKey();
  return !!key && key.trim().length > 0;
}

export function getSavedQuizzes(): import("./types").QuizRecord[] {
  try {
    const data = localStorage.getItem(QUIZZES_STORAGE);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveQuiz(record: Omit<import("./types").QuizRecord, "id" | "created_at">): import("./types").QuizRecord {
  const quizzes = getSavedQuizzes();
  const newRecord: import("./types").QuizRecord = {
    ...record,
    id: "quiz_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
    created_at: new Date().toISOString(),
  };
  quizzes.unshift(newRecord);
  try {
    localStorage.setItem(QUIZZES_STORAGE, JSON.stringify(quizzes));
  } catch {
    // ignore
  }
  return newRecord;
}

export function deleteQuiz(id: string): void {
  const quizzes = getSavedQuizzes().filter((q) => q.id !== id);
  try {
    localStorage.setItem(QUIZZES_STORAGE, JSON.stringify(quizzes));
  } catch {
    // ignore
  }
}

