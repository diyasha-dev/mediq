'use client'
import { useState, useEffect } from 'react'

export default function VaultPage() {
  const [medications, setMedications] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ drug_name: '', generic_name: '', dosage: '', frequency: '' })
  const [adding, setAdding] = useState(false)
  const [warnings, setWarnings] = useState([])
  const [message, setMessage] = useState('')
  const [notLoggedIn, setNotLoggedIn] = useState(false)

  useEffect(() => { fetchMedications() }, [])

  const fetchMedications = async () => {
    try {
      const res = await fetch('/api/vault')
      const data = await res.json()
      if (data.error === 'Not logged in') {
        setNotLoggedIn(true)
      } else {
        setMedications(data.medications || [])
      }
    } catch (e) {
      setNotLoggedIn(true)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!form.drug_name.trim()) return
    setAdding(true)
    setMessage('')
    setWarnings([])

    try {
      const res = await fetch('/api/vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (data.error) {
        setMessage('Error: ' + data.error)
      } else {
        setMessage(data.message)
        setWarnings(data.warnings || [])
        setForm({ drug_name: '', generic_name: '', dosage: '', frequency: '' })
        setShowForm(false)
        fetchMedications()
      }
    } catch (e) {
      setMessage('Something went wrong.')
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this medicine from your vault?')) return
    try {
      const res = await fetch(`/api/vault?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.message) fetchMedications()
    } catch (e) {
      alert('Failed to delete.')
    }
  }

  if (notLoggedIn) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Login Required</h1>
        <p className="text-gray-500 mb-6">Your Medication Vault is private. Please login to access it.</p>
        <a href="/auth" className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700">
          Login with Google
        </a>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-400">
        <div className="text-4xl mb-3">⏳</div>
        <p>Loading your vault...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-gray-800">My Medication Vault 🔒</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700"
        >
          + Add Medicine
        </button>
      </div>
      <p className="text-gray-500 mb-8">Your personal medicine list. Private and secure.</p>

      {/* Interaction Warnings */}
      {warnings.length > 0 && (
        <div className="bg-red-50 border border-red-300 rounded-2xl p-5 mb-6">
          <p className="font-bold text-red-700 mb-3">🚨 Interaction Warning!</p>
          {warnings.map((w, i) => (
            <div key={i} className="mb-2">
              <p className="text-sm text-red-700 font-semibold capitalize">{w.drug_a} + {w.drug_b} — {w.severity.toUpperCase()}</p>
              <p className="text-sm text-red-600">{w.what_happens}</p>
            </div>
          ))}
        </div>
      )}

      {/* Success Message */}
      {message && !warnings.length && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6">
          {message}
        </div>
      )}

      {/* Add Medicine Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="font-bold text-gray-800 mb-4">Add New Medicine</h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Medicine name (e.g. Dolo 650) *"
              value={form.drug_name}
              onChange={(e) => setForm({ ...form, drug_name: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Generic name (e.g. acetaminophen) — optional"
              value={form.generic_name}
              onChange={(e) => setForm({ ...form, generic_name: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Dosage (e.g. 650mg)"
              value={form.dosage}
              onChange={(e) => setForm({ ...form, dosage: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Frequency (e.g. twice daily)"
              value={form.frequency}
              onChange={(e) => setForm({ ...form, frequency: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAdd}
                disabled={adding}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {adding ? 'Adding...' : 'Add Medicine'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="border border-gray-300 text-gray-600 px-6 py-2.5 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Medicine Cards */}
      {medications.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">💊</div>
          <p className="text-lg font-medium mb-2">Your vault is empty</p>
          <p className="text-sm">Add your medicines to track them and check for interactions</p>
        </div>
      ) : (
        <div className="space-y-4">
          {medications.map((med) => (
            <div key={med.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-start justify-between">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{med.drug_name}</h3>
                {med.generic_name && med.generic_name !== med.drug_name && (
                  <p className="text-sm text-gray-400">Generic: {med.generic_name}</p>
                )}
                <div className="flex gap-3 mt-2 flex-wrap">
                  {med.dosage && (
                    <span className="bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full">{med.dosage}</span>
                  )}
                  {med.frequency && (
                    <span className="bg-purple-50 text-purple-600 text-xs px-3 py-1 rounded-full">{med.frequency}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(med.id)}
                className="text-red-400 hover:text-red-600 text-sm ml-4"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-xs text-yellow-700">
        ⚠️ Always consult your doctor before adding or removing any medication.
      </div>
    </div>
  )
}