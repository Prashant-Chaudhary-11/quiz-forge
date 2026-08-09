import { useState } from "react";
import {
  ArrowLeft,
  ArrowLeftRight,
  Printer,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Eye,
  Pencil,
  Award,
} from "lucide-react";
import type { QuizData, QuizModule, MCQQuestion, FillBlankQuestion, MatchQuestion, TrueFalseQuestion, ShortAnswerQuestion } from "@/lib/types";
import { MODULE_LABELS } from "@/lib/types";

interface QuizViewerProps {
  title: string;
  category: string;
  quiz: QuizData;
  onBack: () => void;
  onRetake: () => void;
}

type ViewMode = "answerKey" | "practice";

export function QuizViewer({ title, category, quiz, onBack, onRetake }: QuizViewerProps) {
  const [mode, setMode] = useState<ViewMode>("answerKey");
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [submitted, setSubmitted] = useState(false);

  const totalQuestions = quiz.modules.reduce((sum, m) => sum + m.questions.length, 0);

  const handleExport = () => {
    window.print();
  };

  const resetPractice = () => {
    setAnswers({});
    setSubmitted(false);
    setMode("practice");
  };

  const score = submitted
    ? quiz.modules.reduce((sum, mod) => {
        return sum + mod.questions.filter((q) => isCorrect(q, answers[q.id])).length;
      }, 0)
    : 0;

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header bar */}
      <div className="mb-6 no-print">
        <button
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {totalQuestions} questions · {category === "competitive" ? "Competitive" : "Normal"} difficulty
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
              <button
                onClick={() => setMode("answerKey")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  mode === "answerKey" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
              >
                <Eye className="h-3.5 w-3.5" /> Answer Key
              </button>
              <button
                onClick={() => { if (mode !== "practice") resetPractice(); }}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  mode === "practice" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
              >
                <Pencil className="h-3.5 w-3.5" /> Practice
              </button>
            </div>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <Printer className="h-4 w-4" /> <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Print-only header */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-slate-500">
          {totalQuestions} questions · {category === "competitive" ? "Competitive" : "Normal"} difficulty
        </p>
      </div>

      {/* Score banner */}
      {mode === "practice" && submitted && (
        <div className="mb-6 flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 no-print">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Award className="h-7 w-7" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">
              {score} / {totalQuestions}
            </p>
            <p className="text-sm text-slate-500">
              {Math.round((score / totalQuestions) * 100)}% correct
            </p>
          </div>
          <button
            onClick={resetPractice}
            className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" /> Retake
          </button>
        </div>
      )}

      {/* Quiz modules */}
      <div className="space-y-8">
        {quiz.modules.map((mod, modIdx) => (
          <ModuleSection
            key={mod.type + modIdx}
            module={mod}
            moduleIndex={modIdx}
            mode={mode}
            answers={answers}
            setAnswers={setAnswers}
            submitted={submitted}
            setSubmitted={setSubmitted}
          />
        ))}
      </div>

      {/* Submit button for practice */}
      {mode === "practice" && !submitted && (
        <div className="mt-8 flex justify-end no-print">
          <button
            onClick={() => setSubmitted(true)}
            className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Submit Answers
          </button>
        </div>
      )}

      {/* Retake button in answer key mode */}
      {mode === "answerKey" && (
        <div className="mt-8 flex justify-end no-print">
          <button
            onClick={onRetake}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" /> Generate New Quiz
          </button>
        </div>
      )}
    </div>
  );
}

function ModuleSection({
  module,
  moduleIndex,
  mode,
  answers,
  setAnswers,
  submitted,
  setSubmitted,
}: {
  module: QuizModule;
  moduleIndex: number;
  mode: ViewMode;
  answers: Record<string, unknown>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  submitted: boolean;
  setSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 text-xs font-bold text-white">
          {moduleIndex + 1}
        </span>
        {MODULE_LABELS[module.type] || module.type}
      </h2>
      <div className="space-y-5">
        {module.questions.map((q, qIdx) => (
          <QuestionRenderer
            key={q.id}
            question={q}
            index={qIdx}
            mode={mode}
            answers={answers}
            setAnswers={setAnswers}
            submitted={submitted}
          />
        ))}
      </div>
      {mode === "practice" && !submitted && module.questions.length > 0 && (
        <div className="mt-4 no-print">
          <button
            onClick={() => setSubmitted(true)}
            className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Submit Answers
          </button>
        </div>
      )}
    </div>
  );
}

function QuestionRenderer({
  question,
  index,
  mode,
  answers,
  setAnswers,
  submitted,
}: {
  question: QuizModule["questions"][number];
  index: number;
  mode: ViewMode;
  answers: Record<string, unknown>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  submitted: boolean;
}) {
  const userAnswer = answers[question.id];

  if (question.type === "mcq" || "options" in question) {
    return (
      <MCQView
        q={question as MCQQuestion}
        index={index}
        mode={mode}
        userAnswer={userAnswer as string | undefined}
        setAnswers={setAnswers}
        submitted={submitted}
      />
    );
  }
  if (question.type === "fill_blank" || "correctAnswer" in question && typeof (question as FillBlankQuestion).correctAnswer === "string" && !("listA" in question)) {
    return (
      <FillBlankView
        q={question as FillBlankQuestion}
        index={index}
        mode={mode}
        userAnswer={userAnswer as string | undefined}
        setAnswers={setAnswers}
        submitted={submitted}
      />
    );
  }
  if (question.type === "match" || "listA" in question) {
    return (
      <MatchView
        q={question as MatchQuestion}
        index={index}
        mode={mode}
        userAnswer={userAnswer as Record<string, string> | undefined}
        setAnswers={setAnswers}
        submitted={submitted}
      />
    );
  }
  if (question.type === "true_false" || typeof (question as TrueFalseQuestion).correctAnswer === "boolean") {
    return (
      <TrueFalseView
        q={question as TrueFalseQuestion}
        index={index}
        mode={mode}
        userAnswer={userAnswer as boolean | undefined}
        setAnswers={setAnswers}
        submitted={submitted}
      />
    );
  }
  return (
    <ShortAnswerView
      q={question as ShortAnswerQuestion}
      index={index}
      mode={mode}
      userAnswer={userAnswer as string | undefined}
      setAnswers={setAnswers}
      submitted={submitted}
    />
  );
}

function FeedbackBadge({ correct }: { correct: boolean }) {
  return correct ? (
    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
  ) : (
    <XCircle className="h-5 w-5 text-red-500 shrink-0" />
  );
}

function MCQView({
  q,
  index,
  mode,
  userAnswer,
  setAnswers,
  submitted,
}: {
  q: MCQQuestion;
  index: number;
  mode: ViewMode;
  userAnswer: string | undefined;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  submitted: boolean;
}) {
  const optionKeys = Object.keys(q.options);
  return (
    <div>
      <p className="mb-3 text-sm font-medium text-slate-900">
        {index + 1}. {q.question}
      </p>
      <div className="space-y-2">
        {optionKeys.map((key) => {
          const isCorrect = key === q.correctAnswer;
          const isPicked = userAnswer === key;
          let cls = "border-slate-200 hover:border-slate-300";
          if (mode === "answerKey" && isCorrect) {
            cls = "border-emerald-300 bg-emerald-50";
          } else if (mode === "practice" && submitted) {
            if (isCorrect) cls = "border-emerald-300 bg-emerald-50";
            else if (isPicked) cls = "border-red-300 bg-red-50";
          } else if (mode === "practice" && isPicked) {
            cls = "border-slate-900 bg-slate-50";
          }
          return (
            <button
              key={key}
              disabled={mode === "answerKey" || submitted}
              onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: key }))}
              className={`flex w-full items-center gap-3 rounded-lg border px-4 py-2.5 text-left text-sm transition ${cls} disabled:cursor-default`}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-600">
                {key}
              </span>
              <span className="text-slate-700">{q.options[key]}</span>
              {mode === "answerKey" && isCorrect && <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-500" />}
              {mode === "practice" && submitted && isPicked && !isCorrect && (
                <XCircle className="ml-auto h-4 w-4 text-red-500" />
              )}
            </button>
          );
        })}
      </div>
      {mode === "practice" && submitted && (
        <div className="mt-2 flex items-center gap-2 text-sm">
          <FeedbackBadge correct={userAnswer === q.correctAnswer} />
          <span className={userAnswer === q.correctAnswer ? "text-emerald-600" : "text-red-600"}>
            {userAnswer === q.correctAnswer ? "Correct!" : `Correct answer: ${q.correctAnswer}`}
          </span>
        </div>
      )}
    </div>
  );
}

function FillBlankView({
  q,
  index,
  mode,
  userAnswer,
  setAnswers,
  submitted,
}: {
  q: FillBlankQuestion;
  index: number;
  mode: ViewMode;
  userAnswer: string | undefined;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  submitted: boolean;
}) {
  const parts = q.question.split("___");
  return (
    <div>
      <p className="mb-3 text-sm font-medium text-slate-900">
        {index + 1}.{" "}
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              <span className="inline-block mx-1 align-middle">
                {mode === "answerKey" ? (
                  <span className="rounded-md bg-emerald-50 border border-emerald-300 px-2 py-0.5 text-emerald-700 font-medium text-xs">
                    {q.correctAnswer}
                  </span>
                ) : (
                  <input
                    type="text"
                    value={userAnswer ?? ""}
                    disabled={submitted}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                    placeholder="..."
                    className="inline-block w-28 rounded-md border border-slate-200 px-2 py-0.5 text-sm outline-none focus:border-slate-400 no-print"
                  />
                )}
              </span>
            )}
          </span>
        ))}
      </p>
      {mode === "practice" && submitted && (
        <div className="mt-2 flex items-center gap-2 text-sm">
          <FeedbackBadge correct={userAnswer?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()} />
          <span className={userAnswer?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase() ? "text-emerald-600" : "text-red-600"}>
            {userAnswer?.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
              ? "Correct!"
              : `Correct answer: ${q.correctAnswer}`}
          </span>
        </div>
      )}
    </div>
  );
}

function TrueFalseView({
  q,
  index,
  mode,
  userAnswer,
  setAnswers,
  submitted,
}: {
  q: TrueFalseQuestion;
  index: number;
  mode: ViewMode;
  userAnswer: boolean | undefined;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  submitted: boolean;
}) {
  const correctVal = q.correctAnswer;
  return (
    <div>
      <p className="mb-3 text-sm font-medium text-slate-900">
        {index + 1}. {q.question}
      </p>
      <div className="flex gap-3">
        {[true, false].map((val) => {
          const isCorrect = val === correctVal;
          const isPicked = userAnswer === val;
          let cls = "border-slate-200 hover:border-slate-300";
          if (mode === "answerKey" && isCorrect) cls = "border-emerald-300 bg-emerald-50";
          else if (mode === "practice" && submitted) {
            if (isCorrect) cls = "border-emerald-300 bg-emerald-50";
            else if (isPicked) cls = "border-red-300 bg-red-50";
          } else if (mode === "practice" && isPicked) cls = "border-slate-900 bg-slate-50";
          return (
            <button
              key={String(val)}
              disabled={mode === "answerKey" || submitted}
              onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: val }))}
              className={`rounded-lg border px-5 py-2 text-sm font-medium transition ${cls} disabled:cursor-default`}
            >
              {val ? "True" : "False"}
              {mode === "answerKey" && isCorrect && <CheckCircle2 className="ml-1.5 inline h-4 w-4 text-emerald-500" />}
            </button>
          );
        })}
      </div>
      {mode === "practice" && submitted && (
        <div className="mt-2 flex items-center gap-2 text-sm">
          <FeedbackBadge correct={userAnswer === correctVal} />
          <span className={userAnswer === correctVal ? "text-emerald-600" : "text-red-600"}>
            {userAnswer === correctVal ? "Correct!" : `Correct answer: ${correctVal ? "True" : "False"}`}
          </span>
        </div>
      )}
    </div>
  );
}

function MatchView({
  q,
  index,
  mode,
  userAnswer,
  setAnswers,
  submitted,
}: {
  q: MatchQuestion;
  index: number;
  mode: ViewMode;
  userAnswer: Record<string, string> | undefined;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  submitted: boolean;
}) {
  const pairs = Object.entries(q.correctPairs);
  return (
    <div>
      <p className="mb-3 text-sm font-medium text-slate-900">
        {index + 1}. {q.question}
      </p>
      <div className="space-y-2">
        {pairs.map(([leftItem, correctRight]) => {
          const userPick = userAnswer?.[leftItem];
          const isCorrect = mode === "practice" && submitted && userPick === correctRight;
          return (
            <div key={leftItem} className="flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-lg bg-slate-100 px-3 py-1.5 font-medium text-slate-700">
                {leftItem}
              </span>
              <ArrowLeftRight className="h-3.5 w-3.5 text-slate-300" />
              {mode === "answerKey" ? (
                <span className="rounded-lg bg-emerald-50 border border-emerald-300 px-3 py-1.5 font-medium text-emerald-700">
                  {correctRight}
                </span>
              ) : (
                <select
                  disabled={submitted}
                  value={userPick ?? ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [q.id]: { ...(prev[q.id] as Record<string, string>), [leftItem]: e.target.value },
                    }))
                  }
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-slate-400 no-print"
                >
                  <option value="">Select...</option>
                  {q.listB.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              )}
              {mode === "practice" && submitted && (
                <span className="flex items-center gap-1.5">
                  <FeedbackBadge correct={isCorrect} />
                  {!isCorrect && (
                    <span className="text-xs text-red-500">Correct: {correctRight}</span>
                  )}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ShortAnswerView({
  q,
  index,
  mode,
  userAnswer,
  setAnswers,
  submitted,
}: {
  q: ShortAnswerQuestion;
  index: number;
  mode: ViewMode;
  userAnswer: string | undefined;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  submitted: boolean;
}) {
  return (
    <div>
      <p className="mb-3 text-sm font-medium text-slate-900">
        {index + 1}. {q.question}
      </p>
      {mode === "practice" && !submitted && (
        <textarea
          value={userAnswer ?? ""}
          onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
          placeholder="Type your answer..."
          className="h-20 w-full resize-none rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-slate-400 no-print"
        />
      )}
      {mode === "answerKey" || submitted ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
          <span className="font-semibold text-slate-700">Answer: </span>
          {q.correctAnswer}
        </div>
      ) : null}
      {mode === "practice" && submitted && userAnswer && (
        <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700 no-print">
          Short answers are self-graded. Compare your answer with the model answer above.
        </div>
      )}
    </div>
  );
}

function isCorrect(question: QuizModule["questions"][number], userAnswer: unknown): boolean {
  if (userAnswer === undefined || userAnswer === null) return false;
  if ("options" in question) {
    return userAnswer === (question as MCQQuestion).correctAnswer;
  }
  if ("listA" in question) {
    const pairs = (question as MatchQuestion).correctPairs;
    const userPairs = userAnswer as Record<string, string>;
    return Object.entries(pairs).every(([k, v]) => userPairs?.[k] === v);
  }
  if (typeof (question as TrueFalseQuestion).correctAnswer === "boolean") {
    return userAnswer === (question as TrueFalseQuestion).correctAnswer;
  }
  if (typeof (question as FillBlankQuestion).correctAnswer === "string" && !("listA" in question)) {
    return (userAnswer as string)?.trim().toLowerCase() === (question as FillBlankQuestion).correctAnswer.trim().toLowerCase();
  }
  return false;
}
