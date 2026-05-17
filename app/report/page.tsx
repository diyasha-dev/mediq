
"use client";

import { useState, useEffect } from "react";
import UploadZone from "@/components/report/UploadZone";
import ReportResults from "@/components/report/ReportResults";
import LoginGate from "@/components/LoginGate";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function ReportPage() {
  const [text, setText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notLoggedIn, setNotLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check login status on page load
  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) setNotLoggedIn(true)
      setCheckingAuth(false)
    })
  }, [])

  const handleAnalyze = async () => {
    if (!selectedFiles.length && !text.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      let res;

      if (selectedFiles.length > 0) {
        const file = selectedFiles[0];
        if (file.type === "application/pdf") {
          setError("For PDFs: open the file, select all text (Ctrl+A), copy and paste it in the text box below.");
          setLoading(false);
          return;
        }
        if (!file.type.startsWith("image/")) {
          setError("Please upload an image (JPG, PNG).");
          setLoading(false);
          return;
        }
        const formData = new FormData();
        formData.append("file", file);
        res = await fetch("/api/report", { method: "POST", body: formData });
      } else {
        res = await fetch("/api/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ extracted_text: text }),
        });
      }

      const data = await res.json();
      if (res.status === 401) {
        setNotLoggedIn(true);
      } else if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const canAnalyze = (selectedFiles.length > 0 || text.trim()) && !loading;

  // Still checking auth
  if (checkingAuth) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 text-center text-muted">
        <p className="text-sm">Loading...</p>
      </div>
    )
  }

  // Not logged in — show LoginGate immediately
  if (notLoggedIn) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl md:text-4xl font-heading text-charcoal mb-2 tracking-tight">
          Blood Report Explainer
        </h1>
        <p className="text-slate mb-8">
          Upload your report image or paste text. We'll flag HIGH/LOW values and explain in plain English.
        </p>
        <LoginGate feature="Blood Report Explainer" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <h1 className="text-3xl md:text-4xl font-heading text-charcoal mb-2 tracking-tight">
        Blood Report Explainer
      </h1>
      <p className="text-slate mb-8">
        Upload your report image or paste text. We'll flag HIGH/LOW values and explain in plain English.
      </p>

      <UploadZone
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
        text={text}
        setText={setText}
      />
      {error && (
  <div className={`px-4 py-3 rounded-xl mb-6 text-sm border ${
    error.includes('rate limit') || error.includes('busy')
      ? 'bg-severity-moderate-bg border-severity-moderate-border text-severity-moderate'
      : 'bg-severity-major-bg border-severity-major-border text-severity-major'
  }`}>
    {error}
    {(error.includes('rate limit') || error.includes('busy')) && (
      <p className="mt-2 text-xs opacity-80">
        💡 Tip: PDF text extraction always works instantly — no rate limits!
      </p>
    )}
  </div>
)}

      <div className="flex items-center justify-between mb-8">
        <p className="text-xs text-muted">
          {selectedFiles.length > 0
            ? "✅ File ready — click Analyze"
            : "💡 Tip: Copy text from a PDF and paste above"}
        </p>
        <button
          onClick={handleAnalyze}
          disabled={!canAnalyze}
          className={`px-6 py-3 text-sm font-semibold text-white rounded-xl transition-colors flex items-center gap-2 ${
            canAnalyze
              ? "bg-teal hover:bg-teal-hover active:bg-teal-active"
              : "bg-stone-300 cursor-not-allowed"
          }`}
        >
          {loading ? (
            <><span className="spinner" />Analyzing…</>
          ) : (
            "Analyze Report"
          )}
        </button>
      </div>

      {loading && (
        <div className="text-center py-12 text-muted">
          <div className="text-4xl mb-3">🔬</div>
          <p>{selectedFiles.length > 0 ? "Reading your report..." : "Analyzing values..."}</p>
        </div>
      )}

      {result && <ReportResults result={result} />}

      <div className="mt-10">
        <MedicalDisclaimer variant="prominent" />
      </div>
    </div>
  );
}