import { useState } from "react";
import { BrainCircuit, Sparkles, FileText, Settings2, Library } from "lucide-react";
import { Header } from "@/components/Header";
import { SettingsModal } from "@/components/SettingsModal";
import { ContentStep } from "@/components/ContentStep";
import { ConfigStep } from "@/components/ConfigStep";
import { QuizViewer } from "@/components/QuizViewer";
import { QuizLibrary } from "@/components/QuizLibrary";
import { hasApiKey, saveQuiz } from "@/lib/storage";
import type { Category, ModuleType, QuizData, QuizRecord } from "@/lib/types";

type View = "home" | "config" | "viewer" | "library";
type Step = "content" | "config";

export default function App() {
  const [view, setView] = useState<View>("home");
  const [step, setStep] = useState<Step>("content");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [sourceLabel, setSourceLabel] = useState("");
  const [generatedQuiz, setGeneratedQuiz] = useState<QuizData | null>(null);
  const [quizMeta, setQuizMeta] = useState<{
    title: string;
    category: string;
  } | null>(null);
  const [_savedQuiz, setSavedQuiz] = useState<QuizRecord | null>(null);

  const handleGenerated = (
    quiz: QuizData,
    title: string,
    category: Category,
    count: number,
    modules: ModuleType[]
  ) => {
    const saved = saveQuiz({
      title,
      source_content: content,
      source_label: sourceLabel,
      category,
      question_count: count,
      module_types: modules,
      quiz_data: quiz,
    });

    setSavedQuiz(saved);
    setGeneratedQuiz(saved.quiz_data);
    setQuizMeta({ title: saved.title, category: saved.category });
    setView("viewer");
  };

  const startNew = () => {
    setContent("");
    setSourceLabel("");
    setGeneratedQuiz(null);
    setQuizMeta(null);
    setSavedQuiz(null);
    setStep("content");
    setView("home");
  };

  const openSavedQuiz = (record: QuizRecord) => {
    setSavedQuiz(record);
    setGeneratedQuiz(record.quiz_data);
    setQuizMeta({ title: record.title, category: record.category });
    setView("viewer");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header
        onOpenSettings={() => setSettingsOpen(true)}
        onGoHome={startNew}
        onGoLibrary={() => setView("library")}
        currentView={view === "library" ? "library" : "home"}
      />

      <main className="px-4 py-8 sm:px-6 sm:py-12">
        {view === "home" && step === "content" && (
          <>
            {!content && <Hero onGetStarted={() => {
              if (!hasApiKey()) setSettingsOpen(true);
            }} hasContent={!!content} />}
            <ContentStep
              content={content}
              setContent={setContent}
              sourceLabel={sourceLabel}
              setSourceLabel={setSourceLabel}
              onNext={() => setStep("config")}
            />
          </>
        )}

        {view === "home" && step === "config" && (
          <ConfigStep
            content={content}
            sourceLabel={sourceLabel}
            onBack={() => setStep("content")}
            onGenerated={handleGenerated}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        )}

        {view === "viewer" && generatedQuiz && quizMeta && (
          <QuizViewer
            title={quizMeta.title}
            category={quizMeta.category}
            quiz={generatedQuiz}
            onBack={() => setView("library")}
            onRetake={startNew}
          />
        )}

        {view === "library" && (
          <QuizLibrary onOpenQuiz={openSavedQuiz} onGoHome={startNew} />
        )}
      </main>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

function Hero({ onGetStarted, hasContent }: { onGetStarted: () => void; hasContent: boolean }) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white">
        <BrainCircuit className="h-8 w-8" strokeWidth={2} />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Turn any study material into a quiz
      </h1>
      <p className="mx-auto mt-3 max-w-xl text-slate-500">
        Upload a PDF or paste your notes, pick the question types and difficulty, and let AI
        generate a quiz you can practice, save, and export.
      </p>

      <div className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
        <FeatureCard
          icon={FileText}
          title="Upload or paste"
          desc="PDFs, notes, articles — any text content"
        />
        <FeatureCard
          icon={Sparkles}
          title="AI-generated"
          desc="MCQ, fill-blanks, matching, true/false & more"
        />
        <FeatureCard
          icon={Settings2}
          title="Bring your key"
          desc="Use your own free Gemini API key"
        />
      </div>

      {!hasContent && (
        <p className="mt-6 text-sm text-slate-400">
          Start by adding your study material below. First time? Click the{" "}
          <button onClick={onGetStarted} className="font-medium text-slate-600 underline">
            settings icon
          </button>{" "}
          to add your Gemini API key.
        </p>
      )}
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: typeof FileText;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-left">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-0.5 text-xs text-slate-400">{desc}</p>
    </div>
  );
}
