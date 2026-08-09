import { useState, useCallback, useRef } from "react";
import { Upload, FileText, ClipboardPaste, File, Loader2, X, AlertCircle } from "lucide-react";
import { extractPdfText, truncateContent } from "@/lib/pdf";

interface ContentStepProps {
  content: string;
  setContent: (content: string) => void;
  sourceLabel: string;
  setSourceLabel: (label: string) => void;
  onNext: () => void;
}

type Mode = "upload" | "paste";
type UploadState = "idle" | "processing" | "done" | "error";

export function ContentStep({
  content,
  setContent,
  sourceLabel,
  setSourceLabel,
  onNext,
}: ContentStepProps) {
  const [mode, setMode] = useState<Mode>("upload");
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file) return;
    setError(null);
    setFileName(file.name);

    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      setUploadState("error");
      return;
    }

    setUploadState("processing");
    try {
      const text = await extractPdfText(file);
      if (!text || text.trim().length < 20) {
        setError("Could not extract enough text from this PDF. It may be scanned images.");
        setUploadState("error");
        return;
      }
      const truncated = truncateContent(text);
      setContent(truncated);
      setSourceLabel(`PDF: ${file.name}`);
      setUploadState("done");
    } catch {
      setError("Failed to read the PDF. The file may be corrupted or password-protected.");
      setUploadState("error");
    }
  }, [setContent, setSourceLabel]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handlePasteSubmit = () => {
    const textarea = document.getElementById("paste-textarea") as HTMLTextAreaElement;
    const text = textarea?.value?.trim() ?? "";
    if (text.length < 20) {
      setError("Please paste at least a few sentences of content.");
      return;
    }
    setError(null);
    const truncated = truncateContent(text);
    setContent(truncated);
    setSourceLabel("Pasted text");
    setUploadState("done");
  };

  const clearContent = () => {
    setContent("");
    setSourceLabel("");
    setFileName("");
    setUploadState("idle");
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Add your study material</h2>
        <p className="mt-1.5 text-slate-500">
          Upload a PDF or paste your notes — the AI will read it and generate questions.
        </p>
      </div>

      <div className="mb-6 flex justify-center">
        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
          <button
            onClick={() => setMode("upload")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
              mode === "upload" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
            }`}
          >
            <Upload className="h-4 w-4" /> Upload PDF
          </button>
          <button
            onClick={() => setMode("paste")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
              mode === "paste" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
            }`}
          >
            <ClipboardPaste className="h-4 w-4" /> Paste Text
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {mode === "upload" ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition ${
            dragActive
              ? "border-slate-400 bg-slate-50"
              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          {uploadState === "processing" ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              <p className="text-sm font-medium text-slate-600">Reading your PDF...</p>
            </div>
          ) : uploadState === "done" && content ? (
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{fileName || sourceLabel}</p>
                <p className="text-xs text-slate-500">
                  {content.length.toLocaleString()} characters extracted
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); clearContent(); }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
              >
                <X className="h-3.5 w-3.5" /> Remove
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                <File className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Drop your PDF here, or <span className="text-slate-900 underline">browse</span>
                </p>
                <p className="text-xs text-slate-400">PDF files only, up to ~10MB</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <textarea
            id="paste-textarea"
            defaultValue={mode === "paste" && sourceLabel === "Pasted text" ? content : ""}
            placeholder="Paste your notes, textbook content, articles, or any text you want to generate questions from..."
            className="h-64 w-full resize-none rounded-2xl border border-slate-200 p-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
          <button
            onClick={handlePasteSubmit}
            className="mt-3 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Use this text
          </button>
          {uploadState === "done" && content && sourceLabel === "Pasted text" && (
            <div className="mt-3 flex items-center gap-2 text-sm text-emerald-600">
              <FileText className="h-4 w-4" />
              {content.length.toLocaleString()} characters loaded
              <button onClick={clearContent} className="ml-2 text-slate-400 hover:text-slate-600">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {content && (
        <div className="mt-6">
          <details className="group">
            <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
              <FileText className="h-4 w-4" />
              Preview extracted content
            </summary>
            <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              {content.slice(0, 2000)}
              {content.length > 2000 && "..."}
            </div>
          </details>
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <button
          onClick={onNext}
          disabled={!content}
          className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue to Configure
        </button>
      </div>
    </div>
  );
}
