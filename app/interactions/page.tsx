"use client";

import { useState } from "react";
import DrugInputs from "@/components/interactions/DrugInputs";
import InteractionResults from "@/components/interactions/InteractionResults";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";

export default function InteractionsPage() {
  const [drugs, setDrugs] = useState(["", ""]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    const filledDrugs = drugs.filter((d) => d.trim());
    if (filledDrugs.length < 2) {
      setError("Please enter at least 2 medicine names");
      return;
    }

    setLoading(true);
    setChecked(false);
    setError("");
    setResults([]);

    try {
      const res = await fetch("/api/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drugs: filledDrugs }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        // Transform to shape InteractionResults expects
  const transformed = data.interactions.map((item: any) => ({
  drug1: item.drug_a.charAt(0).toUpperCase() + item.drug_a.slice(1),
  drug2: item.drug_b.charAt(0).toUpperCase() + item.drug_b.slice(1),
  severity: item.severity === 'major' ? 'MAJOR'
    : item.severity === 'moderate' ? 'MODERATE'
    : item.severity === 'minor' ? 'MINOR'
    : item.severity === 'unknown' ? null : 'SAFE',
  summary: item.severity === 'major' ? '⚠️ Dangerous combination — avoid'
    : item.severity === 'moderate' ? '⚠️ Use with caution — monitor closely'
    : item.severity === 'minor' ? '✅ Generally safe — minor risk only'
    : item.severity === 'unknown' ? '❓ Unknown — consult your doctor'
    : '✅ No significant interaction found',
  what: item.what_happens,
  whatToDo: item.what_to_do,
  source: item.source,
  isAI: item.data_source === 'ai_fallback',
  notInDatabase: item.data_source === 'not_found',
  disclaimer: item.disclaimer,
}));
        setResults(transformed);
        setChecked(true);
      }
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      <h1 className="text-3xl md:text-4xl font-heading text-charcoal mb-2 tracking-tight">
        Interaction Checker
      </h1>
      <p className="text-slate mb-8">
        Enter two or more medications to check for known drug-drug interactions.
      </p>

      <div className="bg-white border border-ash rounded-2xl p-6 md:p-8 mb-8 shadow-sm">
        <DrugInputs
          drugs={drugs}
          setDrugs={setDrugs}
          onCheck={handleCheck}
          loading={loading}
        />
      </div>

      {error && (
        <div className="bg-severity-major-bg border border-severity-major-border text-severity-major px-4 py-3 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {checked && results.length > 0 && (
        <div className="mb-10">
          <InteractionResults results={results} />
        </div>
      )}

      <MedicalDisclaimer variant="prominent" />
    </div>
  );
}