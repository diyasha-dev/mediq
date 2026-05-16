
"use client";

import { useState } from "react";
import UploadZone from "@/components/report/UploadZone";
import ReportResults from "@/components/report/ReportResults";
// import LoginGate from "@/components/LoginGate";
// if (notLoggedIn) {
//   return (
//     <div className="max-w-xl mx-auto px-6 py-20 text-center">
//       <div className="text-5xl mb-4">🩺</div>
//       <h1 className="text-2xl font-bold text-charcoal mb-3">Login Required</h1>
//       <p className="text-slate mb-6">Report analysis is private. Please login to use this feature.</p>
//       <a href="/auth" className="inline-flex px-8 py-3 bg-teal text-white rounded-xl font-semibold hover:bg-teal-hover">
//         Login with Google
//       </a>
//     </div>
//   )
// }
import MedicalDisclaimer from "@/components/MedicalDisclaimer";

export default function ReportPage() {
  const [text, setText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notLoggedIn, setNotLoggedIn] = useState(false);

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
          setError(
            "For PDFs: open the file, select all text (Ctrl+A), copy and paste it in the text box below."
          );
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
        res = await fetch("/api/report", {
          method: "POST",
          body: formData,
        });
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

 if (notLoggedIn) {
  return (
    <div className="max-w-xl mx-auto px-6 py-20 text-center">
      <div className="text-5xl mb-4">🩺</div>
      <h1 className="text-2xl font-bold text-charcoal mb-3">Login Required</h1>
      <p className="text-slate mb-6">Report analysis is private. Please login to use this feature.</p>
      <a href="/auth" className="inline-flex px-8 py-3 bg-teal text-white rounded-xl font-semibold hover:bg-teal-hover">
        Login with Google
      </a>
    </div>
  )
}

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      {/* Page header */}
      <h1 className="text-3xl md:text-4xl font-heading text-charcoal mb-2 tracking-tight">
        Blood Report Explainer
      </h1>
      <p className="text-slate mb-8">
        Upload your report image or paste text. We'll flag HIGH/LOW values and
        explain in plain English.
      </p>

      {/* Upload + text input */}
      <UploadZone
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
        text={text}
        setText={setText}
      />

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Analyze button */}
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
            <>
              <span className="spinner" />
              Analyzing…
            </>
          ) : (
            "Analyze Report"
          )}
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-12 text-muted">
          <div className="text-4xl mb-3">🔬</div>
          <p>
            {selectedFiles.length > 0
              ? "Reading your report..."
              : "Analyzing values..."}
          </p>
        </div>
      )}

      {/* Results — passes real API data */}
      {result && <ReportResults result={result} />}

      {/* Permanent disclaimer */}
      <div className="mt-10">
        <MedicalDisclaimer variant="prominent" />
      </div>
    </div>
  );
}

