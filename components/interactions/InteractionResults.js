"use client";

import { useState } from "react";
import SeverityBadge from "@/components/SeverityBadge";

function InteractionRow({ interaction, defaultExpanded }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (interaction.notInDatabase) {
    return (
      <div className="bg-white border border-ash rounded-xl p-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-base font-semibold text-slate">
            {interaction.drug1}
            <span className="mx-2 text-muted">+</span>
            {interaction.drug2}
          </span>
          <span className="px-3 py-1 text-sm font-medium text-muted bg-stone-100 rounded-full border border-ash">
            Not in database
          </span>
        </div>
        <p className="text-sm text-muted mt-3 flex items-start gap-2">
          <svg className="w-4 h-4 text-muted flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          We couldn't find this drug in our database. This doesn't mean it's safe — consult your pharmacist or physician.
        </p>
      </div>
    );
  }

  const bgMap = {
    MAJOR: "bg-severity-major-bg border-severity-major-border",
    MODERATE: "bg-severity-moderate-bg border-severity-moderate-border",
    MINOR: "bg-severity-minor-bg border-severity-minor-border",
    SAFE: "bg-severity-safe-bg border-severity-safe-border",
  };

  return (
    <div className={`rounded-xl border ${bgMap[interaction.severity] || "border-ash bg-white"} overflow-hidden`}>
      <button
        className="w-full text-left px-5 py-4 flex items-start gap-4"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1.5 flex-wrap">
            <span className="text-base font-bold text-charcoal">
              {interaction.drug1}
              <span className="mx-2 text-muted">+</span>
              {interaction.drug2}
            </span>
            <SeverityBadge level={interaction.severity} />
          </div>
          <p className="text-sm text-slate">{interaction.summary}</p>
        </div>
        <div className="flex-shrink-0 mt-1">
          <svg
            className={`w-5 h-5 text-muted transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-charcoal/5">
          <div className="pt-4">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">What happens</p>
            <p className="text-sm text-slate leading-relaxed">{interaction.what}</p>
          </div>
          <div className="bg-white/60 rounded-xl p-4 border border-charcoal/5">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">What to do</p>
            <p className="text-sm text-slate leading-relaxed">{interaction.whatToDo}</p>
          </div>
          <p className="text-xs text-muted flex items-start gap-1.5">
            <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Source: {interaction.source}
          </p>
        </div>
      )}
    </div>
  );
}

export default function InteractionResults({ results }) {
  const flaggedCount = results.filter(
    (i) => i.severity === "MAJOR" || i.severity === "MODERATE"
  ).length;

  return (
    <div>
      {/* Summary bar */}
      <div className="flex items-center justify-between mb-4 px-1 flex-wrap gap-2">
        <p className="text-sm text-slate">
          Showing <span className="font-bold">{results.length}</span> pairs checked —{" "}
          <span className="text-severity-major font-bold">{flaggedCount} flagged</span>
        </p>
        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-severity-major" />Major</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-severity-moderate" />Moderate</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-severity-minor" />Minor</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-severity-safe" />Safe</span>
        </div>
      </div>

      <div className="space-y-3">
        {results.map((interaction, i) => (
          <InteractionRow
            key={i}
            interaction={interaction}
            defaultExpanded={i === 0}
          />
        ))}
      </div>
    </div>
  );
}
