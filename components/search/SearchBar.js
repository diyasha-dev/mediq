'use client'
import Autocomplete from './Autocomplete'

export default function SearchBar({ value, onChange, onSearch, loading }) {
  const handleSelect = (selectedValue) => {
    onSearch(null, selectedValue)
  }

  return (
    <form onSubmit={onSearch} className="flex gap-0">
      <Autocomplete
        value={value}
        onChange={onChange}
        onSelect={handleSelect}
        autoSearch={true}
        placeholder="Search by drug name or brand (e.g. Dolo 650, Combiflam, Metformin)…"
        className="w-full px-5 py-3.5 text-sm bg-white border border-ash rounded-l-xl text-charcoal placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition-all"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-3.5 text-sm font-semibold text-white bg-teal rounded-r-xl hover:bg-teal-hover active:bg-teal-active transition-colors flex items-center gap-2 disabled:opacity-70"
      >
        {loading ? <span className="spinner" /> : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )}
        Search
      </button>
    </form>
  )
}