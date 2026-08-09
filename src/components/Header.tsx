import { Settings, BrainCircuit, Library } from "lucide-react";
import { hasApiKey } from "@/lib/storage";

interface HeaderProps {
  onOpenSettings: () => void;
  onGoHome: () => void;
  onGoLibrary: () => void;
  currentView: "home" | "library";
}

export function Header({ onOpenSettings, onGoHome, onGoLibrary, currentView }: HeaderProps) {
  const keyConnected = hasApiKey();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <button onClick={onGoHome} className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
            <BrainCircuit className="h-5 w-5" strokeWidth={2} />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Quiz<span className="text-slate-400">Forge</span>
          </span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onGoLibrary}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition ${
              currentView === "library"
                ? "bg-slate-100 text-slate-900"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Library className="h-4 w-4" />
            <span className="hidden sm:inline">My Quizzes</span>
          </button>

          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2">
            <span
              className={`h-2 w-2 rounded-full ${
                keyConnected ? "bg-emerald-500" : "bg-amber-400"
              }`}
            />
            <span className="hidden text-xs font-medium text-slate-500 sm:inline">
              {keyConnected ? "Key connected" : "No key"}
            </span>
          </div>

          <button
            onClick={onOpenSettings}
            className="rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-100"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
