'use client'
import { useState } from 'react'

interface Interaction {
  drug_a: string
  drug_b: string
  severity: string
  what_happens: string
  what_to_do: string
  source: string
  data_source: string
  disclaimer?: string
}

interface InteractionResult {
  drugs: string[]
  interactions: Interaction[]
  disclaimer: string
}

export default function InteractionsPage() {
  const [drugs, setDrugs] = useState(['', ''])
  const [results, setResults] = useState<InteractionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addDrug = () => setDrugs([...drugs, ''])

  const updateDrug = (index: number, value: string) => {
    const updated = [...drugs]
    updated[index] = value
    setDrugs(updated)
  }

  const removeDrug = (index: number) => {
    if (drugs.length <= 2) return
    setDrugs(drugs.filter((_, i) => i !== index))
  }

  const handleCheck = async () => {
    const filledDrugs = drugs.filter(d => d.trim())
    if (filledDrugs.length < 2) {
      setError('Please enter at least 2 medicine names')
      return
    }
    setLoading(true)
    setError('')
    setResults(null)

    try {
      const res = await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drugs: filledDrugs })
      })
      const data = await res.json()
      if (data.error) setError(data.error)
      else setResults(data)
    } catch (e) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const severityConfig: Record<string, { color: string; badge: string; icon: string }> = {
    major: { color: 'bg-red-100 border-red-300 text-red-800', badge: 'bg-red-500 text-white', icon: '🚨' },
    moderate: { color: 'bg-yellow-100 border-yellow-300 text-yellow-800', badge: 'bg-yellow-500 text-white', icon: '⚠️' },
    minor: { color: 'bg-green-100 border-green-300 text-green-800', badge: 'bg-green-500 text-white', icon: '✅' },
    unknown: { color: 'bg-gray-100 border-gray-300 text-gray-700', badge: 'bg-gray-400 text-white', icon: '❓' },
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Drug Interaction Checker ⚠️</h1>
      <p className="text-gray-500 mb-8">Enter 2 or more medicines to check if they are safe to take together</p>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <p className="text-sm font-semibold text-gray-600 mb-4">Enter Medicine Names:</p>
        <div className="space-y-3 mb-4">
          {drugs.map((drug, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={drug}
                onChange={(e) => updateDrug(index, e.target.value)}
                placeholder={`Medicine ${index + 1} (e.g. warfarin, Dolo)`}
                className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {drugs.length > 2 && (
                <button
                  onClick={() => removeDrug(index)}
                  className="text-red-400 hover:text-red-600 px-2 text-xl"
                >×</button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={addDrug}
            className="border border-blue-300 text-blue-600 px-4 py-2 rounded-xl text-sm hover:bg-blue-50"
          >
            + Add Medicine
          </button>
          <button
            onClick={handleCheck}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? 'Checking...' : 'Check Now'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">🔍</div>
          <p>Checking interactions...</p>
        </div>
      )}

      {results && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Checked {results.interactions.length} combination(s) for: <strong>{results.drugs.join(', ')}</strong>
          </p>

          {results.interactions.map((interaction, index) => {
            const config = severityConfig[interaction.severity] || severityConfig.unknown
            return (
              <div key={index} className={`border rounded-2xl p-5 ${config.color}`}>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-bold capitalize">
                    {config.icon} {interaction.drug_a} + {interaction.drug_b}
                  </p>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${config.badge}`}>
                    {interaction.severity}
                  </span>
                </div>
                <p className="text-sm mb-2"><strong>What happens:</strong> {interaction.what_happens}</p>
                <p className="text-sm mb-2"><strong>What to do:</strong> {interaction.what_to_do}</p>
                {interaction.disclaimer && (
                  <p className="text-xs mt-3 opacity-75">{interaction.disclaimer}</p>
                )}
                <p className="text-xs mt-2 opacity-60">
                  Source: {interaction.source} • {interaction.data_source === 'verified_database' ? '✓ Verified Data' : '🤖 AI Estimate'}
                </p>
              </div>
            )
          })}

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-xs text-yellow-700">
            ⚠️ {results.disclaimer}
          </div>
        </div>
      )}
    </div>
  )
}