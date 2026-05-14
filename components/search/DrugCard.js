"use client";

import { useState, useEffect } from "react";

const TAB_MAP = {
  "Overview": "overview",
  "Dosage": "dosage",
  "Side Effects": "sideEffects",
  "Warnings": "warnings",
};

function WarningCard({ warning }) {
  const colors = {
    high: { bg: "bg-severity-major-bg", border: "border-severity-major-border", icon: "text-severity-major", title: "text-severity-major", body: "text-red-700" },
    moderate: { bg: "bg-severity-moderate-bg", border: "border-severity-moderate-border", icon: "text-severity-moderate", title: "text-severity-moderate", body: "text-amber-700" },
    low: { bg: "bg-severity-minor-bg", border: "border-severity-minor-border", icon: "text-severity-minor", title: "text-severity-minor", body: "text-blue-700" },
  };
  const c = colors[warning.level] || colors.low;
  return (
    <div className={`rounded-xl border ${c.bg} ${c.border} p-4`}>
      <div className="flex items-start gap-3">
        <svg className={`w-5 h-5 ${c.icon} flex-shrink-0 mt-0.5`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <p className={`text-sm font-bold ${c.title} mb-1`}>{warning.title}</p>
          <p className={`text-sm leading-relaxed ${c.body}`}>{warning.body}</p>
        </div>
      </div>
    </div>
  );
}

export default function DrugCard({ drug, activeFilters }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [plainEnglish, setPlainEnglish] = useState(false);

  // When filter chips change, switch to the first active filter tab
  useEffect(() => {
    if (activeFilters && activeFilters.length > 0) {
      const tabKey = TAB_MAP[activeFilters[activeFilters.length - 1]];
      if (tabKey) setActiveTab(tabKey);
    }
  }, [activeFilters]);

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "dosage", label: "Dosage" },
    { key: "sideEffects", label: "Side Effects" },
    { key: "warnings", label: "Warnings" },
  ];

  return (
    <div className="bg-white border border-ash rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Drug header */}
      <div className="px-6 py-5 border-b border-ash">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-xl font-bold text-charcoal">{drug.name}</h3>
            <p className="text-sm text-muted mt-0.5">
              {drug.brandNames.map((b, i) => (
                <span key={b}>
                  {i > 0 && <span className="mx-1 text-ash">·</span>}
                  <span className="italic">{b}</span>
                </span>
              ))}
            </p>
          </div>
          <span className="px-3 py-1 bg-teal-50 text-teal text-xs font-semibold rounded-full border border-teal-muted">
            {drug.drugClass}
          </span>
        </div>

        {/* Plain English toggle */}
        <div className="flex items-center gap-3 mt-4">
          <span className="text-sm text-muted">Reading mode:</span>
          <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-0.5">
            <button
              onClick={() => setPlainEnglish(false)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                !plainEnglish ? "bg-white text-charcoal shadow-sm" : "text-muted hover:text-slate"
              }`}
            >
              Clinical
            </button>
            <button
              onClick={() => setPlainEnglish(true)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                plainEnglish ? "bg-white text-teal shadow-sm" : "text-muted hover:text-slate"
              }`}
            >
              Plain English
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-ash">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              activeTab === tab.key
                ? "text-teal border-b-2 border-teal bg-teal-50/50"
                : "text-muted hover:text-charcoal hover:bg-stone-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-6 py-5">
        {activeTab === "overview" && (
          <div className="space-y-4">
            {plainEnglish ? (
              <p className="text-sm text-slate leading-relaxed">{drug.plainEnglish.overview}</p>
            ) : (
              <>
                <p className="text-sm text-slate leading-relaxed">{drug.overview.description}</p>
                <div className="bg-stone-50 rounded-xl p-4 border border-ash">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Mechanism of Action</p>
                  <p className="text-sm text-slate leading-relaxed">{drug.overview.mechanism}</p>
                </div>
                <p className="text-sm text-severity-minor bg-severity-minor-bg border border-severity-minor-border rounded-lg px-3 py-2">
                  {drug.overview.approved}
                </p>
              </>
            )}
          </div>
        )}

        {activeTab === "dosage" && (
          <div className="space-y-4">
            {plainEnglish ? (
              <p className="text-sm text-slate leading-relaxed">{drug.dosage.plainEnglish}</p>
            ) : (
              <>
                <div className="divide-y divide-ash rounded-xl border border-ash overflow-hidden">
                  {drug.dosage.standard.map((item) => (
                    <div key={item.label} className="flex items-start gap-4 px-4 py-3 bg-white">
                      <span className="text-sm font-semibold text-muted w-32 flex-shrink-0 pt-0.5">{item.label}</span>
                      <span className="text-sm text-charcoal font-mono">{item.value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-severity-moderate bg-severity-moderate-bg border border-severity-moderate-border rounded-lg px-3 py-2">
                  Dosage information is for reference only. Always follow your prescriber's instructions.
                </p>
              </>
            )}
          </div>
        )}

        {activeTab === "sideEffects" && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-muted uppercase tracking-wider mb-2.5">Common Side Effects</p>
              <div className="flex flex-wrap gap-2">
                {drug.sideEffects.common.map((s) => (
                  <span key={s} className="px-3 py-1.5 text-sm bg-stone-100 text-slate rounded-full border border-ash">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted uppercase tracking-wider mb-2.5">Less Common / Serious</p>
              <div className="flex flex-wrap gap-2">
                {drug.sideEffects.serious.map((s) => (
                  <span key={s} className="px-3 py-1.5 text-sm bg-severity-major-bg text-severity-major rounded-full border border-severity-major-border">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            {plainEnglish && drug.sideEffects.note && (
              <div className="bg-teal-50 border border-teal-muted rounded-xl p-4">
                <p className="text-sm text-slate leading-relaxed">{drug.sideEffects.note}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "warnings" && (
          <div className="space-y-3">
            {drug.warnings.map((w, i) => (
              <WarningCard key={i} warning={w} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
