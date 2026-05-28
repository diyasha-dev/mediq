"use client";

import { useState, useEffect } from "react";
import LoginGate from "@/components/LoginGate";
import SeverityBadge from "@/components/SeverityBadge";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import { useToast } from "@/components/Toast";
import { createSupabaseBrowserClient } from "@/lib/supabase";

// Re-sync alarms with the service worker — pass meds directly to avoid re-fetch race condition
async function rescheduleAlarms(meds?: any[]) {
  if (typeof window === 'undefined' || !("serviceWorker" in navigator)) return;
  try {
    // Wait until SW is truly active (avoids postMessage being silently dropped)
    const reg = await navigator.serviceWorker.ready;

    let medications = meds;
    // If no meds passed in, fetch fresh from server
    if (!medications) {
      const res = await fetch('/api/vault', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      medications = data.medications || [];
    }

    const alarms = (medications || [])
      .filter((m: any) => m.reminder_time?.length > 0)
      .map((m: any) => ({ id: m.id, drugName: m.drug_name, times: m.reminder_time.filter(Boolean) }));

    const sw = reg.active;
    if (sw) {
      sw.postMessage({ type: 'SCHEDULE_ALARMS', alarms });
    }
  } catch (_) {}
};

function getDrugClass(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('ibuprofen') || n.includes('combiflam') || n.includes('brufen') || n.includes('diclofenac') || n.includes('naproxen')) return 'NSAID / Pain Relief'
  if (n.includes('paracetamol') || n.includes('acetaminophen') || n.includes('dolo') || n.includes('calpol') || n.includes('crocin')) return 'Analgesic / Fever Relief'
  if (n.includes('amoxicillin') || n.includes('azithromycin') || n.includes('ciprofloxacin') || n.includes('metronidazole') || n.includes('augmentin')) return 'Antibiotic'
  if (n.includes('metformin') || n.includes('glycomet') || n.includes('glucophage') || n.includes('glipizide') || n.includes('sitagliptin')) return 'Antidiabetic'
  if (n.includes('atorvastatin') || n.includes('rosuvastatin') || n.includes('lipitor') || n.includes('tonact')) return 'Statin / Cholesterol'
  if (n.includes('amlodipine') || n.includes('telmisartan') || n.includes('atenolol') || n.includes('stamlo') || n.includes('telma')) return 'Blood Pressure'
  if (n.includes('omeprazole') || n.includes('pantoprazole') || n.includes('omez') || n.includes('rabeprazole')) return 'Antacid / PPI'
  if (n.includes('cetirizine') || n.includes('loratadine') || n.includes('fexofenadine') || n.includes('zyrtec') || n.includes('allegra')) return 'Antihistamine'
  if (n.includes('levothyroxine') || n.includes('thyronorm') || n.includes('eltroxin')) return 'Thyroid Hormone'
  if (n.includes('warfarin') || n.includes('aspirin') || n.includes('clopidogrel')) return 'Blood Thinner'
  if (n.includes('vitamin') || n.includes('calcium') || n.includes('iron') || n.includes('zinc') || n.includes('b12')) return 'Vitamin / Supplement'
  if (n.includes('escitalopram') || n.includes('alprazolam') || n.includes('sertraline') || n.includes('nexito')) return 'Mental Health'
  if (n.includes('insulin')) return 'Insulin'
  return 'Medicine'
}

function formatTime(time: string): string {
  if (!time) return ''
  const [hours, minutes] = time.split(':').map(Number)
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const h = hours % 12 || 12
  return `${h}:${minutes.toString().padStart(2, '0')} ${ampm}`
}

function ReminderToggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      aria-label={enabled ? "Disable reminder" : "Enable reminder"}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${enabled ? "bg-teal" : "bg-stone-300"}`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform shadow-sm ${enabled ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  )
}

function MedicineModal({ onClose, onSave, editMed }: {
  onClose: () => void
  onSave: (med: any, isEdit: boolean) => void
  editMed?: any
}) {
  const isEdit = !!editMed
  const [form, setForm] = useState({
    name: editMed?.drug_name || "",
    generic_name: editMed?.generic_name || "",
    dosage: editMed?.dosage || "",
    frequency: editMed?.frequency || "",
    reminderTimes: editMed?.reminder_time?.length > 0 ? editMed.reminder_time : [""]
  })
  const [saving, setSaving] = useState(false)
  const update = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const addReminderTime = () => {
    if (form.reminderTimes.length < 3) update('reminderTimes', [...form.reminderTimes, ""])
  }

  const updateReminderTime = (index: number, value: string) => {
    const updated = [...form.reminderTimes]
    updated[index] = value
    update('reminderTimes', updated)
  }

  const removeReminderTime = (index: number) => {
    const updated = form.reminderTimes.filter((_: any, i: number) => i !== index)
    update('reminderTimes', updated.length > 0 ? updated : [""])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    const validReminders = form.reminderTimes.filter((t: string) => t.trim())
    await onSave({
      id: editMed?.id,
      drug_name: form.name,
      generic_name: form.generic_name || form.name,
      dosage: form.dosage || "—",
      frequency: form.frequency || "—",
      reminder_time: validReminders,
    }, isEdit)
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-ash sticky top-0 bg-white">
          <h2 className="text-lg font-bold text-charcoal">{isEdit ? 'Edit Medicine' : 'Add Medicine'}</h2>
          <button onClick={onClose} className="p-1.5 text-muted hover:text-slate hover:bg-stone-100 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1.5">Drug Name *</label>
            <input required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Dolo 650, Pantoprazole" className="w-full px-4 py-3 text-sm bg-stone-50 border border-ash rounded-xl text-charcoal placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1.5">Generic Name <span className="text-muted font-normal">(optional)</span></label>
            <input value={form.generic_name} onChange={(e) => update("generic_name", e.target.value)} placeholder="e.g. acetaminophen" className="w-full px-4 py-3 text-sm bg-stone-50 border border-ash rounded-xl text-charcoal placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1.5">Dosage</label>
            <input value={form.dosage} onChange={(e) => update("dosage", e.target.value)} placeholder="e.g. 500 mg" className="w-full px-4 py-3 text-sm bg-stone-50 border border-ash rounded-xl text-charcoal placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1.5">Frequency</label>
            <input value={form.frequency} onChange={(e) => update("frequency", e.target.value)} placeholder="e.g. Twice daily with meals" className="w-full px-4 py-3 text-sm bg-stone-50 border border-ash rounded-xl text-charcoal placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-charcoal">Reminder Times <span className="text-muted font-normal">(up to 3)</span></label>
              {form.reminderTimes.length < 3 && (
                <button type="button" onClick={addReminderTime} className="text-xs text-teal font-semibold hover:text-teal-hover flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add time
                </button>
              )}
            </div>
            <div className="space-y-2">
              {form.reminderTimes.map((time: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <input type="time" value={time} onChange={(e) => updateReminderTime(index, e.target.value)} className="flex-1 px-4 py-2.5 text-sm bg-stone-50 border border-ash rounded-xl text-charcoal focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent" />
                  {form.reminderTimes.length > 1 && (
                    <button type="button" onClick={() => removeReminderTime(index)} className="p-2 text-muted hover:text-severity-major hover:bg-severity-major-bg rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            {form.reminderTimes.some((t: string) => t) && (
              <p className="text-xs text-teal font-medium mt-2">🔔 You'll get a push notification at this time daily.</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-medium text-slate bg-stone-100 rounded-xl hover:bg-stone-200 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-3 text-sm font-semibold text-white bg-teal rounded-xl hover:bg-teal-hover transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Medicine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Edit icon component for reuse
function EditIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  )
}

function DeleteIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}

export default function VaultPage() {
  const [meds, setMeds] = useState<any[]>([])
  const [warnings, setWarnings] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editMed, setEditMed] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notLoggedIn, setNotLoggedIn] = useState(false)
  const { addToast } = useToast()

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { setNotLoggedIn(true); setLoading(false) }
      else fetchMeds()
    })
  }, [])

  const fetchMeds = async () => {
    try {
      const res = await fetch('/api/vault', { cache: 'no-store' })
      const data = await res.json()
      if (data.error === 'Not logged in') {
        setNotLoggedIn(true)
      } else {
        const medications = data.medications || []
        setMeds(medications)
        if (medications.length >= 2) {
          const drugNames = medications.map((m: any) => m.generic_name || m.drug_name)
          try {
            const intRes = await fetch('/api/interactions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ drugs: drugNames })
            })
            const intData = await intRes.json()
            const serious = (intData.interactions || []).filter(
              (i: any) => i.severity === 'major' || i.severity === 'moderate'
            )
            setWarnings(serious)
          } catch (e) { setWarnings([]) }
        } else {
          setWarnings([])
        }
      }
    } catch (e) {
      console.log('Fetch error:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (formData: any, isEdit: boolean) => {
    try {
      if (isEdit) {
        const res = await fetch(`/api/vault?id=${formData.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
        const data = await res.json()
        if (data.error) addToast(data.error, { type: 'error' })
        else {
          addToast(`${formData.drug_name} updated!`)
          // Build updated meds list and pass directly so SW gets fresh data immediately
          const updatedMeds = meds.map((m: any) => m.id === formData.id ? { ...m, ...formData } : m)
          setMeds(updatedMeds)
          rescheduleAlarms(updatedMeds)
        }
      } else {
        const res = await fetch('/api/vault', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
        const data = await res.json()
        if (data.error) { addToast(data.error, { type: 'error' }); return }
        if (data.warnings?.length > 0) {
          setWarnings(data.warnings)
          data.warnings.forEach((w: any) => addToast(`⚠️ ${w.drug_a} + ${w.drug_b} interaction!`, { type: 'error' }))
        } else {
          addToast(`${formData.drug_name} added to your vault`)
        }
        // Refetch so we have the new med's DB id, then pass to SW
        const res2 = await fetch('/api/vault', { cache: 'no-store' })
        const data2 = await res2.json()
        const freshMeds = data2.medications || []
        setMeds(freshMeds)
        rescheduleAlarms(freshMeds)
      }
    } catch (e) {
      addToast('Something went wrong', { type: 'error' })
    }
  }

  const handleDelete = async (id: string, name: string) => {
    const deletedMed = meds.find(m => m.id === id)
    try {
      const res = await fetch(`/api/vault?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.message) {
        setMeds(prev => prev.filter(m => m.id !== id))
        setWarnings([])
        addToast(`Removed ${name} from your vault`, {
          action: {
            label: 'Undo',
            onClick: async () => {
              if (deletedMed) {
                await fetch('/api/vault', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    drug_name: deletedMed.drug_name,
                    generic_name: deletedMed.generic_name,
                    dosage: deletedMed.dosage,
                    frequency: deletedMed.frequency,
                    reminder_time: deletedMed.reminder_time
                  })
                })
                fetchMeds()
                addToast(`${name} restored!`)
              }
            }
          }
        })
      }
    } catch (e) {
      addToast('Failed to remove medicine', { type: 'error' })
    }
  }

  const toggleReminder = async (med: any) => {
    const currentlyEnabled = med.reminder_time?.length > 0
    // When turning back ON: restore the last known time from the med object,
    // or use the previously stored time, fallback to 08:00
    const lastTime = med._lastReminderTime || '08:00'
    const newReminders = currentlyEnabled ? [] : [lastTime]

    // Optimistically update UI
    const updatedMed = currentlyEnabled
      ? { ...med, reminder_time: [], _lastReminderTime: med.reminder_time?.[0] || lastTime }
      : { ...med, reminder_time: newReminders }
    const updatedMeds = meds.map((m: any) => m.id === med.id ? updatedMed : m)
    setMeds(updatedMeds)

    try {
      await fetch(`/api/vault?id=${med.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminder_time: newReminders })
      })
      addToast(currentlyEnabled ? 'Reminder turned off' : `Reminder set for ${newReminders.map(formatTime).join(', ')}`)
      rescheduleAlarms(updatedMeds)
    } catch (e) { fetchMeds() }
  }

  const openEdit = (med: any) => { setEditMed(med); setShowModal(true) }
  const closeModal = () => { setShowModal(false); setEditMed(null) }

  const medsWithInteractions = new Set(
    warnings.flatMap((w: any) => [w.drug_a?.toLowerCase().trim(), w.drug_b?.toLowerCase().trim()])
  )

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center text-muted">
        <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm">Loading your vault...</p>
      </div>
    )
  }

  if (notLoggedIn) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl md:text-4xl font-heading text-charcoal mb-2 tracking-tight">Medication Vault</h1>
        <p className="text-slate mb-8">Your personal medication list with reminders and interaction alerts.</p>
        <LoginGate feature="Medication Vault" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
      {showModal && <MedicineModal onClose={closeModal} onSave={handleSave} editMed={editMed} />}

      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading text-charcoal mb-2 tracking-tight">Medication Vault</h1>
          <p className="text-slate">Your personal medication list with reminders and interaction alerts.</p>
        </div>
        <button
          onClick={() => { setEditMed(null); setShowModal(true) }}
          className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-teal rounded-xl hover:bg-teal-hover active:bg-teal-active transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Medicine
        </button>
      </div>

      {/* Interaction Warning */}
      {warnings.length > 0 && (
        <div className="bg-severity-major-bg border border-severity-major-border rounded-2xl px-5 py-4 mb-6 flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mt-0.5">
            <svg className="w-5 h-5 text-severity-major" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm font-bold text-red-800">Interaction Warning</p>
              <SeverityBadge level="MAJOR" />
            </div>
            {warnings.map((w, i) => (
              <p key={i} className="text-sm text-red-700 mb-1">
                <span className="font-semibold capitalize">{w.drug_a} + {w.drug_b}</span> — {w.what_happens}
              </p>
            ))}
            <a href="/interactions" className="text-sm text-severity-major font-medium hover:underline mt-1 inline-block">
              View full interaction report →
            </a>
          </div>
        </div>
      )}

      {/* Empty state */}
      {meds.length === 0 ? (
        <div className="text-center py-20 bg-white border border-ash rounded-2xl">
          <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-charcoal mb-2">Your vault is empty</h3>
          <p className="text-sm text-muted mb-6">Add your medications to track doses and get interaction alerts.</p>
          <button onClick={() => setShowModal(true)} className="px-6 py-3 text-sm font-semibold text-white bg-teal rounded-xl hover:bg-teal-hover transition-colors">
            Add your first medicine
          </button>
        </div>
      ) : (
        <>
          {/* Table header */}
          <div className="hidden md:grid grid-cols-[2fr_1fr_2fr_auto_auto_auto] gap-4 px-5 py-2 mb-1">
            <span className="text-xs font-bold text-charcoal uppercase tracking-wider">Medication</span>
            <span className="text-xs font-bold text-charcoal uppercase tracking-wider">Dosage</span>
            <span className="text-xs font-bold text-charcoal uppercase tracking-wider">Frequency</span>
            <span className="text-xs font-bold text-charcoal uppercase tracking-wider">Reminder</span>
            <span className="sr-only">Edit</span>
            <span className="sr-only">Delete</span>
          </div>

          <div className="space-y-2 mb-8">
            {meds.map((med) => {
              const drugClass = getDrugClass(med.drug_name || med.generic_name || '')
              const hasInteraction = medsWithInteractions.has(med.generic_name?.toLowerCase().trim()) ||
                medsWithInteractions.has(med.drug_name?.toLowerCase().trim()) ||
                medsWithInteractions.has(med.generic_name?.toLowerCase().trim().split(' ')[0]) ||
                medsWithInteractions.has(med.drug_name?.toLowerCase().trim().split(' ')[0])

              return (
                <div
                  key={med.id}
                  className={`bg-white border rounded-xl overflow-hidden transition-shadow hover:shadow-sm ${hasInteraction ? 'border-severity-major-border' : 'border-ash'}`}
                >
                  {/* Mobile layout */}
                  <div className="md:hidden px-5 py-4">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2 flex-1">
                        <p className="text-base font-bold text-charcoal">{med.drug_name}</p>
                        {hasInteraction && <span className="w-2.5 h-2.5 rounded-full bg-severity-major flex-shrink-0" title="Interaction warning" />}
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <button onClick={() => openEdit(med)} className="p-2 text-muted hover:text-teal hover:bg-teal-50 rounded-lg transition-colors" title="Edit">
                          <EditIcon />
                        </button>
                        <button onClick={() => handleDelete(med.id, med.drug_name)} className="p-2 text-muted hover:text-severity-major hover:bg-severity-major-bg rounded-lg transition-colors" title="Remove">
                          <DeleteIcon />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-teal font-medium mb-2">{drugClass}</p>
                    <p className="text-sm text-slate mb-3">
                      <span className="text-muted">Dose:</span> {med.dosage} · {med.frequency}
                    </p>
                    <div className="flex items-center gap-2">
                      <ReminderToggle enabled={med.reminder_time?.length > 0} onChange={() => toggleReminder(med)} />
                      <span className="text-sm text-muted">
                        {med.reminder_time?.length > 0
                          ? med.reminder_time.map((t: string) => formatTime(t)).join(', ')
                          : 'Reminder off'}
                      </span>
                    </div>
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden md:grid grid-cols-[2fr_1fr_2fr_auto_auto_auto] gap-4 px-5 py-4 items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-charcoal">{med.drug_name}</p>
                        {hasInteraction && <span className="w-2.5 h-2.5 rounded-full bg-severity-major flex-shrink-0" title="Interaction warning" />}
                      </div>
                      <p className="text-xs text-teal font-medium mt-0.5">{drugClass}</p>
                    </div>
                    <span className="text-sm font-mono text-slate">{med.dosage}</span>
                    <span className="text-sm text-slate">{med.frequency}</span>
                    <div className="flex items-center gap-2">
                      <ReminderToggle enabled={med.reminder_time?.length > 0} onChange={() => toggleReminder(med)} />
                      {med.reminder_time?.length > 0 && (
                        <span className="text-xs text-muted">
                          {med.reminder_time.map((t: string) => formatTime(t)).join(', ')}
                        </span>
                      )}
                    </div>
                    <button onClick={() => openEdit(med)} className="p-2 text-muted hover:text-teal hover:bg-teal-50 rounded-lg transition-colors" title="Edit">
                      <EditIcon />
                    </button>
                    <button onClick={() => handleDelete(med.id, med.drug_name)} className="p-2 text-muted hover:text-severity-major hover:bg-severity-major-bg rounded-lg transition-colors" title="Remove">
                      <DeleteIcon />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      <MedicalDisclaimer variant="prominent" />
    </div>
  )
}