"use client";

import { useState, useEffect } from "react";
import SearchBar from "@/components/search/SearchBar";
import FilterChips from "@/components/search/FilterChips";
import DrugCard from "@/components/search/DrugCard";
import SkeletonCard from "@/components/search/SkeletonCard";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";

function transformApiToDrugCard(data: any) {
  const s = data.structured

  return {
    id: data.name,
    name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
    brandNames: data.brand_name ? [data.brand_name] : [],
    drugClass: data.purpose?.replace("Purpose ", "").split("\n")[0].slice(0, 50) || "Medicine",
    overview: {
      description: s?.clinical_overview || s?.simple_overview || data.purpose?.replace("Purpose ", "") || "Not available.",
      mechanism: s?.mechanism || "See full prescribing information.",
      approved: s?.approved_for || "Data sourced from FDA OpenData.",
    },
    plainEnglish: {
      overview: s?.simple_overview || data.simple_explanation || "Not available.",
    },
    dosage: {
      standard: s?.dosage_steps || [
        { label: "Dosage", value: data.dosage || "Consult your doctor." }
      ],
      plainEnglish: s?.dosage_plain || data.dosage || "Follow your doctor's instructions.",
    },

    sideEffects: {
      common: s?.side_effects_common || ["See package insert"],
      serious: s?.side_effects_serious || ["Contact doctor if unusual symptoms occur"],
      note: s?.side_effects_note || "",
    },

    warnings: s?.warnings || [
      {
        level: "moderate",
        title: "Important Warnings",
        body: data.warnings?.slice(0, 300) || "See package insert.",
      }
    ],
  }
}
export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");

  const [searchHistory, setSearchHistory] = useState<string[]>([])

  useEffect(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('mediq-search-history') || '[]')
      setSearchHistory(Array.isArray(parsed) ? parsed : [])
    } catch {
      setSearchHistory([])
    }
  }, [])

  const saveToHistory = (drugName: string) => {
    try {
      const parsed = JSON.parse(localStorage.getItem('mediq-search-history') || '[]')
      const history = Array.isArray(parsed) ? parsed : []
      const updated = [drugName, ...history.filter((h: string) => h !== drugName)].slice(0, 3)
      localStorage.setItem('mediq-search-history', JSON.stringify(updated))
      setSearchHistory(updated)
    } catch {
      // Ignore if localStorage fails
    }
  }

  const handleToggle = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  const handleSearch = async (e?: React.FormEvent, directValue?: string) => {
    e?.preventDefault()
    const searchQuery = directValue || query
    if (!searchQuery.trim()) return

    if (directValue) setQuery(directValue)

    setLoading(true)
    setResults([])
    setHasSearched(true)
    setError("")

    try {
      const res = await fetch(`/api/search?drug=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setResults([transformApiToDrugCard(data.data)])
        saveToHistory(searchQuery)
      }
    } catch (e) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">
      <h1 className="text-3xl md:text-4xl font-heading text-charcoal mb-2 tracking-tight">
        Medicine Search
      </h1>
      <p className="text-slate mb-8">
        Look up any drug for plain-language dosage, side effects, and warnings.
      </p>

      <div className="space-y-4 mb-10">
        <SearchBar
          value={query}
          onChange={setQuery}
          onSearch={handleSearch}
          loading={loading}
        />

        {/* Search History */}
        {searchHistory.length > 0 && !hasSearched && (
          <div className="flex items-center gap-2 flex-wrap mt-2">
            <span className="text-xs text-muted font-medium">Recent Searches:</span>
            {searchHistory.map((term, i) => (
              <button
                key={i}
                onClick={() => handleSearch(undefined, term)}
                className="text-xs px-3 py-1.5 bg-white border border-ash text-slate rounded-full hover:border-teal hover:text-teal transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-severity-major-bg border border-severity-major-border text-severity-major px-4 py-3 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-6 mb-12">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : results.length > 0 ? (
          results.map((drug: any) => (
            <DrugCard key={drug.id} drug={drug} activeFilters={activeFilters} />
          ))
        ) : hasSearched && !error ? (
          <div className="text-center py-16">
            <svg className="w-12 h-12 mx-auto mb-4 text-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-medium text-charcoal mb-1">No results found</p>
            <p className="text-sm text-muted">
              Try a different name — e.g. "Dolo 650", "Combiflam", "ibuprofen"
            </p>
          </div>
        ) : !hasSearched ? (
          <div className="text-center py-16 text-muted">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-sm">Search for any medicine to get started</p>
          </div>
        ) : null}
      </div>

      <div className="mt-10">
        <MedicalDisclaimer variant="prominent" />
      </div>

    </div>
  )
}