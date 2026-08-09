import { useEffect, useState } from "react";
import { Trash2, FileText, Calendar, Loader2, Plus, AlertCircle } from "lucide-react";
import { getSavedQuizzes, deleteQuiz } from "@/lib/storage";
import type { QuizRecord } from "@/lib/types";

interface QuizLibraryProps {
  onOpenQuiz: (quiz: QuizRecord) => void;
  onGoHome: () => void;
}

export function QuizLibrary({ onOpenQuiz, onGoHome }: QuizLibraryProps) {
  const [quizzes, setQuizzes] = useState<QuizRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuizzes = () => {
    setLoading(true);
    setError(null);
    try {
      const data = getSavedQuizzes();
      setQuizzes(data);
    } catch {
      setError("Could not load saved quizzes.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleDelete = (id: string) => {
    deleteQuiz(id);
    setQuizzes((prev) => prev.filter((q) => q.id !== id));
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  const countQuestions = (record: QuizRecord) => {
    return record.quiz_data?.modules?.reduce((sum: number, m: { questions: unknown[] }) => sum + m.questions.length, 0) ?? 0;
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Quizzes</h1>
          <p className="mt-1 text-sm text-slate-500">All quizzes generated in this app, saved automatically.</p>
        </div>
        <button
          onClick={onGoHome}
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" /> New Quiz
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
        </div>
      ) : quizzes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center">
          <FileText className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">No quizzes yet</p>
          <p className="mt-1 text-sm text-slate-400">Generate your first quiz to see it here.</p>
          <button
            onClick={onGoHome}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" /> Create a Quiz
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
            >
              <button onClick={() => onOpenQuiz(quiz)} className="flex-1 text-left">
                <h3 className="font-semibold text-slate-900 group-hover:text-slate-700">
                  {quiz.title}
                </h3>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <FileText className="h-3 w-3" /> {countQuestions(quiz)} questions
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {formatDate(quiz.created_at)}
                  </span>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-500">
                    {quiz.category === "competitive" ? "Competitive" : "Normal"}
                  </span>
                </div>
                {quiz.source_label && (
                  <p className="mt-2 truncate text-xs text-slate-400">From: {quiz.source_label}</p>
                )}
              </button>
              <div className="mt-3 flex items-center justify-end">
                <button
                  onClick={() => handleDelete(quiz.id)}
                  className="rounded-lg p-2 text-slate-300 transition hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
