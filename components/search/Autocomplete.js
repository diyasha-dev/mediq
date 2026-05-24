'use client'
import { useState, useEffect, useRef } from 'react'
import indianMedicines from '@/data/indianMedicines'

const indianBrandNames = Object.keys(indianMedicines).map(name => ({
  label: name.charAt(0).toUpperCase() + name.slice(1),
  value: name,
  type: 'brand'
}))

export default function Autocomplete({ value, onChange, onSelect, placeholder, className, autoSearch = false }) {
  const [suggestions, setSuggestions] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }

    const q = query.toLowerCase()

    const indianMatches = indianBrandNames
      .filter(item => item.value.includes(q))
      .slice(0, 4)
      .map(item => ({
        label: item.label,
        sublabel: indianMedicines[item.value].charAt(0).toUpperCase() + indianMedicines[item.value].slice(1),
        value: item.label,
        type: 'indian'
      }))

    setSuggestions(indianMatches)
    if (indianMatches.length > 0) setShowDropdown(true)

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `https://rxnav.nlm.nih.gov/REST/spellingsuggestions.json?name=${encodeURIComponent(query)}`
        )
        const data = await res.json()
        const rxSuggestions = data?.suggestionGroup?.suggestionList?.suggestion || []

        const rxMatches = rxSuggestions
          .slice(0, 5)
          .map(name => ({
            label: name.charAt(0).toUpperCase() + name.slice(1),
            sublabel: 'Generic name',
            value: name,
            type: 'generic'
          }))
          .filter(rx => !indianMatches.find(im =>
            im.value.toLowerCase() === rx.value.toLowerCase()
          ))

        const combined = [...indianMatches, ...rxMatches].slice(0, 8)
        setSuggestions(combined)
        setShowDropdown(combined.length > 0)
      } catch (e) {
        console.log('Autocomplete error:', e)
      } finally {
        setLoading(false)
      }
    }, 300)
  }

  const handleChange = (e) => {
    const val = e.target.value
    onChange(val)
    fetchSuggestions(val)
    setActiveIndex(-1)
  }

  const handleSelect = (suggestion) => {
    // First update value
    onChange(suggestion.value)
    setSuggestions([])
    setShowDropdown(false)
    setActiveIndex(-1)
    // Then trigger search with the selected value directly
    if (autoSearch) {
      onSelect(suggestion.value)
    }
  }

  const handleKeyDown = (e) => {
    if (!showDropdown) {
      if (e.key === 'Enter') onSelect(value)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(prev => Math.min(prev + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        handleSelect(suggestions[activeIndex])
      } else {
        setShowDropdown(false)
        onSelect(value)
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
    }
  }

  return (
    <div className="relative flex-1" ref={dropdownRef}>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => value.length >= 2 && suggestions.length > 0 && setShowDropdown(true)}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-ash rounded-xl shadow-lg z-50 overflow-hidden">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(suggestion)}
              className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-stone-50 transition-colors border-b border-ash last:border-b-0 ${
                activeIndex === index ? 'bg-teal-50' : ''
              }`}
            >
              <div>
                <p className="text-sm font-semibold text-charcoal">{suggestion.label}</p>
                {suggestion.sublabel && (
                  <p className="text-xs text-muted">{suggestion.sublabel}</p>
                )}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                suggestion.type === 'indian'
                  ? 'bg-teal-50 text-teal border border-teal-muted'
                  : 'bg-stone-100 text-muted border border-ash'
              }`}>
                {suggestion.type === 'indian' ? 'Brand' : 'Generic'}
              </span>
            </button>
          ))}
          {loading && (
            <div className="px-4 py-2 text-xs text-muted flex items-center gap-2">
              <div className="w-3 h-3 border border-teal border-t-transparent rounded-full animate-spin" />
              Searching more...
            </div>
          )}
        </div>
      )}
    </div>
  )
}