"use client";

import { useState } from "react";
import SeverityBadge from "@/components/SeverityBadge";

const DEMO_PAIRS = [
  { drug1: "Dolo 650", drug2: "Warfarin", severity: "MAJOR", summary: "Increases bleeding risk" },
  { drug1: "Calpol", drug2: "Ibuprofen", severity: "MODERATE", summary: "Duplicate pain relief" },
  { drug1: "Metformin", drug2: "Atorvastatin", severity: "SAFE", summary: "No known interaction" },
];

export default function InteractionWidget() {
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCheck = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setChecked(true);
    }, 800);
  };

  return (
    <div className="w-full max-w-sm bg-white border border-ash rounded-2xl shadow-md overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-ash bg-stone-50">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider">Live Preview</p>
        <p className="text-sm font-bold text-charcoal mt-0.5">Drug Interaction Check</p>
      </div>

      {/* Inputs */}
      <div className="px-5 py-4 space-y-2.5">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-teal-50 text-teal text-xs font-bold flex items-center justify-center shrink-0">1</span>
          <div className="flex-1 px-3 py-2 bg-stone-50 border border-ash rounded-lg text-sm text-charcoal">Dolo 650</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-teal-50 text-teal text-xs font-bold flex items-center justify-center shrink-0">2</span>
          <div className="flex-1 px-3 py-2 bg-stone-50 border border-ash rounded-lg text-sm text-charcoal">Warfarin</div>
        </div>

        {!checked ? (
          <button
            onClick={handleCheck}
            disabled={loading}
            className="w-full mt-2 py-2.5 text-sm font-semibold text-white bg-teal rounded-lg hover:bg-teal-hover transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="spinner" />
                Checking…
              </>
            ) : (
              "Check Interactions"
            )}
          </button>
        ) : (
          <div className="space-y-2 mt-2">
            {DEMO_PAIRS.map((pair, i) => (
              <div
                key={i}
                className={`rounded-lg px-3 py-2 flex items-center justify-between ${
                  pair.severity === "MAJOR"
                    ? "bg-severity-major-bg"
                    : pair.severity === "MODERATE"
                    ? "bg-severity-moderate-bg"
                    : "bg-severity-safe-bg"
                }`}
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-charcoal truncate">
                    {pair.drug1} + {pair.drug2}
                  </p>
                  <p className="text-[11px] text-muted truncate">{pair.summary}</p>
                </div>
                <SeverityBadge level={pair.severity} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
