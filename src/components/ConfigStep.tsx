import { useState } from "react";
import {
  ListChecks,
  PenLine,
  ArrowLeftRight,
  CheckCheck,
  TextCursorInput,
  ArrowLeft,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type { Category, ModuleType, QuizData } from "@/lib/types";
import { MODULE_LABELS } from "@/lib/types";
import { generateQuiz } from "@/lib/gemini";
import { hasApiKey } from "@/lib/storage";

const ICON_MAP = {
  mcq: ListChecks,
  fill_blank: PenLine,
  match: ArrowLeftRight,
  true_false: CheckCheck,
  short_answer: TextCursorInput,
} as const;

const ALL_MODULES: ModuleType[] = ["mcq", "fill_blank", "match", "true_false", "short_answer"];

interface ConfigStepProps {
  content: string;
  sourceLabel: string;
  onBack: () => void;
  onGenerated: (quiz: QuizData, title: string, category: Category, count: number, modules: ModuleType[]) => void;
  onOpenSettings: () => void;
}

export function ConfigStep({ content, sourceLabel, onBack, onGenerated, onOpenSettings }: ConfigStepProps) {
  const [title, setTitle] = useState("");
  const [count, setCount] = useState(10);
  const [selectedModules, setSelectedModules] = useState<ModuleType[]>(["mcq"]);
  const [category, setCategory] = useState<Category>("normal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleModule = (mod: ModuleType) => {
    setSelectedModules((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod]
    );
  };

  const handleGenerate = async () => {
    if (!hasApiKey()) {
      setError("Please add your Gemini API key in settings first.");
      return;
    }
    if (selectedModules.length === 0) {
      setError("Select at least one question type.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const quiz = await generateQuiz({
        content,
        questionCount: count,
        moduleTypes: selectedModules,
        category,
      });
      const finalTitle = title.trim() || `Quiz from ${sourceLabel || "study material"}`;
      onGenerated(quiz, finalTitle, category, count, selectedModules);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back to content
        </button>
        <h2 className="text-2xl font-bold text-slate-900">Configure your quiz</h2>
        <p className="mt-1.5 text-slate-500">
          Choose the question types, difficulty, and how many questions you want.
        </p>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            {error}
            {error.includes("API key") && (
              <button onClick={onOpenSettings} className="ml-2 font-semibold underline">
                Open settings
              </button>
            )}
          </div>
        </div>
      )}

      {/* Title */}
      <div className="mb-6">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Quiz title (optional)</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Biology Chapter 3 Review"
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
        />
      </div>

      {/* Question count */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Number of questions: <span className="font-bold text-slate-900">{count}</span>
        </label>
        <input
          type="range"
          min={5}
          max={50}
          step={5}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="w-full accent-slate-900"
        />
        <div className="mt-1 flex justify-between text-xs text-slate-400">
          <span>5</span>
          <span>50</span>
        </div>
      </div>

      {/* Module types */}
      <div className="mb-6">
        <label className="mb-2.5 block text-sm font-medium text-slate-700">Question types</label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ALL_MODULES.map((mod) => {
            const Icon = ICON_MAP[mod];
            const selected = selectedModules.includes(mod);
            return (
              <button
                key={mod}
                onClick={() => toggleModule(mod)}
                className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                  selected
                    ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg transition ${
                    selected ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${selected ? "text-slate-900" : "text-slate-600"}`}>
                    {MODULE_LABELS[mod]}
                  </p>
                </div>
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-md border transition ${
                    selected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300"
                  }`}
                >
                  {selected && <CheckCheck className="h-3.5 w-3.5" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category */}
      <div className="mb-8">
        <label className="mb-2.5 block text-sm font-medium text-slate-700">Difficulty / Category</label>
        <div className="grid grid-cols-2 gap-3">
          {(["normal", "competitive"] as Category[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-xl border p-4 text-center transition ${
                category === cat
                  ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <p className={`text-sm font-semibold ${category === cat ? "text-slate-900" : "text-slate-600"}`}>
                {cat === "normal" ? "Normal" : "Competitive"}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                {cat === "normal" ? "Straightforward, core concepts" : "Tricky, exam-style"}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Generate */}
      <div className="flex justify-end">
        <button
          onClick={handleGenerate}
          disabled={loading || selectedModules.length === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Generate Quiz
            </>
          )}
        </button>
      </div>

      {loading && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
          The AI is reading your material and crafting questions. This usually takes 10-20 seconds.
        </div>
      )}
    </div>
  );
}
