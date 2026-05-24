'use client'
import Autocomplete from '@/components/search/Autocomplete'

export default function DrugInputs({ drugs, setDrugs, onCheck, loading }) {
  const addDrug = () => {
    if (drugs.length < 5) setDrugs([...drugs, ""])
  }

  const updateDrug = (index, value) => {
    const updated = [...drugs]
    updated[index] = value
    setDrugs(updated)
  }

  const removeDrug = (index) => {
    if (drugs.length > 2) setDrugs(drugs.filter((_, i) => i !== index))
  }

  const clearAll = () => setDrugs(["", ""])

  const placeholders = [
    "e.g. Dolo 650, Paracetamol",
    "e.g. Warfarin, Combiflam",
    "e.g. Pantoprazole, Pan 40",
    "e.g. Calpol, Ibuprofen",
    "e.g. Metformin, Glycomet",
  ]

  return (
    <div>
      <div className="space-y-3 mb-5">
        {drugs.map((drug, i) => (
          <div key={i} className="flex gap-2 items-center">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center">
              <span className="text-sm font-bold text-teal">{i + 1}</span>
            </div>
            <Autocomplete
              value={drug}
              onChange={(val) => updateDrug(i, val)}
              onSelect={(val) => updateDrug(i, val)}
              autoSearch={false}
              placeholder={placeholders[i] || `Drug ${i + 1} name…`}
              className="w-full px-4 py-3 text-sm bg-stone-50 border border-ash rounded-xl text-charcoal placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
            />
            {drugs.length > 2 && (
              <button
                onClick={() => removeDrug(i)}
                className="p-2 text-muted hover:text-severity-major hover:bg-severity-major-bg rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {drugs.length < 5 && (
            <button
              onClick={addDrug}
              className="text-sm text-teal hover:text-teal-hover font-medium flex items-center gap-1.5 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Drug
            </button>
          )}
          <button
            onClick={clearAll}
            className="text-sm text-muted hover:text-slate font-medium transition-colors"
          >
            Clear all
          </button>
        </div>
        <button
          onClick={onCheck}
          disabled={loading || drugs.filter(d => d.trim()).length < 2}
          title="Check drug interactions (or press Enter)"
          className="px-6 py-3 text-sm font-semibold text-white bg-teal rounded-xl hover:bg-teal-hover active:bg-teal-active transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <><span className="spinner" />Checking…</>
          ) : "Check Interactions"}
        </button>
      </div>
    </div>
  )
}