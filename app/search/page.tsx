'use client'
import { useState } from 'react'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [simplified, setSimplified] = useState(true)

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch(`/api/search?drug=${encodeURIComponent(query)}`)
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setResult(data.data)
      }
    } catch (e) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Medicine Search 🔍</h1>
      <p className="text-gray-500 mb-8">Search by brand name (Dolo, Combiflam) or generic name (ibuprofen, acetaminophen)</p>

      {/* Search Bar */}
      <div className="flex gap-3 mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Dolo, ibuprofen, metformin..."
          className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">⏳</div>
          <p>Fetching medicine data...</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Header */}
          <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold capitalize">{result.name}</h2>
              {result.brand_name && (
                <p className="text-blue-200 text-sm">Brand: {result.brand_name}</p>
              )}
            </div>
            {/* Toggle */}
            <button
              onClick={() => setSimplified(!simplified)}
              className="bg-white text-blue-600 text-sm px-3 py-1.5 rounded-full font-medium hover:bg-blue-50"
            >
              {simplified ? '📋 Technical' : '💬 Simple'}
            </button>
          </div>

          {/* Simple Explanation */}
          {simplified && result.simple_explanation && (
            <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
              <p className="text-sm font-semibold text-blue-700 mb-1">💬 Plain English Summary</p>
              <p className="text-gray-700 text-sm leading-relaxed">{result.simple_explanation}</p>
            </div>
          )}

          {/* Technical Details */}
          {!simplified && (
            <div className="divide-y divide-gray-100">
              <InfoRow label="📌 Purpose" value={result.purpose} />
              <InfoRow label="💊 Dosage" value={result.dosage} />
              <InfoRow label="⚠️ Warnings" value={result.warnings} />
              <InfoRow label="😣 Side Effects" value={result.side_effects} />
              <InfoRow label="🚫 Who Should Avoid" value={result.who_should_avoid} />
              <InfoRow label="💊 Drug Interactions" value={result.interactions} />
            </div>
          )}

          {/* Disclaimer */}
          <div className="px-6 py-3 bg-yellow-50 border-t border-yellow-100">
            <p className="text-xs text-yellow-700">⚠️ This information is for educational purposes only. Always consult your doctor or pharmacist.</p>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="px-6 py-4">
      <p className="text-sm font-semibold text-gray-500 mb-1">{label}</p>
      <p className="text-gray-700 text-sm leading-relaxed">{value}</p>
    </div>
  )
}