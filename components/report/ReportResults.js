
"use client";

import { useState } from "react";

function StatusBadge({ status }) {
  const config = {
    'NORMAL': { bg: 'bg-status-normal-bg', text: 'text-status-normal', label: 'NORMAL' },
    'BORDERLINE HIGH': { bg: 'bg-severity-moderate-bg', text: 'text-severity-moderate', label: 'BORDERLINE HIGH' },
    'HIGH': { bg: 'bg-status-high-bg', text: 'text-status-high', label: 'HIGH' },
    'CRITICALLY HIGH': { bg: 'bg-severity-major-bg', text: 'text-severity-major', label: 'CRITICALLY HIGH' },
    'BORDERLINE LOW': { bg: 'bg-severity-moderate-bg', text: 'text-severity-moderate', label: 'BORDERLINE LOW' },
    'LOW': { bg: 'bg-status-low-bg', text: 'text-status-low', label: 'LOW' },
    'CRITICALLY LOW': { bg: 'bg-severity-major-bg', text: 'text-severity-major', label: 'CRITICALLY LOW' },
    'UNKNOWN': { bg: 'bg-stone-100', text: 'text-muted', label: '?' },
  }
  const c = config[status] || config['UNKNOWN']
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  )
}

const conditionDetails = {
  "Possible Anemia": {
    causes: "Low iron intake, blood loss, vitamin B12 or folate deficiency, or chronic disease.",
    symptoms: "Fatigue, pale skin, shortness of breath, dizziness, and weakness.",
    foods: "Spinach, lentils, red meat, pomegranate, dates, and vitamin C-rich foods to boost iron absorption.",
    doctor: "General Physician or Hematologist"
  },
  "Possible Diabetes / Prediabetes": {
    causes: "Insulin resistance, poor diet, obesity, family history, or sedentary lifestyle.",
    symptoms: "Frequent urination, excessive thirst, fatigue, blurry vision, and slow wound healing.",
    foods: "Whole grains, leafy greens, legumes, nuts. Avoid sugary drinks, white rice, and processed foods.",
    doctor: "Diabetologist or Endocrinologist"
  },
  "Possible Hypothyroidism": {
    causes: "Underactive thyroid gland, iodine deficiency, autoimmune condition (Hashimoto's), or medication side effects.",
    symptoms: "Fatigue, weight gain, feeling cold, dry skin, hair loss, and slow heart rate.",
    foods: "Iodine-rich foods like eggs, dairy, and fish. Limit raw cruciferous vegetables like cabbage.",
    doctor: "Endocrinologist or General Physician"
  },
  "Possible Hyperthyroidism": {
    causes: "Overactive thyroid, Graves' disease, thyroid nodules, or excessive iodine intake.",
    symptoms: "Weight loss, rapid heartbeat, anxiety, sweating, tremors, and irritability.",
    foods: "Calcium-rich foods, cruciferous vegetables. Avoid iodine-rich foods and caffeine.",
    doctor: "Endocrinologist"
  },
  "Possible Cardiovascular Risk": {
    causes: "High cholesterol, unhealthy diet, smoking, obesity, diabetes, or family history.",
    symptoms: "Often no symptoms. May cause chest pain, shortness of breath, or fatigue.",
    foods: "Oats, almonds, olive oil, fruits, vegetables, and fish. Avoid fried and processed foods.",
    doctor: "Cardiologist or General Physician"
  },
  "Vitamin D Deficiency — Bone / Immune Risk": {
    causes: "Limited sun exposure, poor dietary intake, obesity, or malabsorption conditions.",
    symptoms: "Bone pain, muscle weakness, fatigue, frequent infections, and mood changes.",
    foods: "Fatty fish, egg yolks, fortified milk. Sunlight exposure 15–20 minutes daily is key.",
    doctor: "General Physician or Orthopedic"
  },
  "B12 Deficiency": {
    causes: "Vegetarian or vegan diet, poor absorption, or long-term use of certain medicines like metformin.",
    symptoms: "Tingling in hands/feet, weakness, memory problems, fatigue, and pale skin.",
    foods: "Eggs, dairy, fish, meat. Vegetarians should consider B12 supplements.",
    doctor: "General Physician or Neurologist"
  },
  "Possible Liver Inflammation / Damage": {
    causes: "Alcohol use, fatty liver disease, viral hepatitis, or certain medications.",
    symptoms: "Fatigue, yellowing of skin, abdominal pain, nausea, and dark urine.",
    foods: "Green vegetables, coffee (in moderation), fruits, and plenty of water. Avoid alcohol completely.",
    doctor: "Gastroenterologist or Hepatologist"
  },
  "Possible Kidney Dysfunction": {
    causes: "Diabetes, high blood pressure, dehydration, or kidney infections.",
    symptoms: "Swelling in legs, fatigue, changes in urination, and back pain.",
    foods: "Low-sodium, low-potassium diet. Drink adequate water. Avoid excess protein.",
    doctor: "Nephrologist or General Physician"
  },
  "Possible Infection / Inflammation": {
    causes: "Bacterial or viral infection, autoimmune condition, or tissue injury.",
    symptoms: "Fever, fatigue, body ache, swelling, or redness in affected area.",
    foods: "Turmeric, ginger, garlic, and antioxidant-rich fruits and vegetables.",
    doctor: "General Physician or Infectious Disease Specialist"
  },
  "Iron Deficiency Anemia": {
    causes: "Low dietary iron, blood loss from periods, or poor iron absorption.",
    symptoms: "Extreme fatigue, pale skin, cold hands and feet, brittle nails, and headache.",
    foods: "Lentils, spinach, tofu, seeds, and pair with vitamin C for better absorption.",
    doctor: "General Physician or Hematologist"
  },
  "Possible Gout / Kidney Stone Risk": {
    causes: "High purine diet, dehydration, obesity, or genetic tendency.",
    symptoms: "Sudden severe joint pain especially in big toe, swelling, and redness.",
    foods: "Drink plenty of water. Avoid red meat, shellfish, alcohol, and sugary drinks.",
    doctor: "Rheumatologist or General Physician"
  },
}

function getConditionDetails(condition) {
  if (!condition) return null
  // Direct match
  if (conditionDetails[condition]) return conditionDetails[condition]
  // Partial match
  for (const key of Object.keys(conditionDetails)) {
    if (condition.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(condition.toLowerCase())) {
      return conditionDetails[key]
    }
  }
  return null
}

function TestRow({ row, defaultExpanded }) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const isAbnormal = row.status !== 'NORMAL' && row.status !== 'UNKNOWN'
  const details = getConditionDetails(row.condition)

  const valueColor = row.status.includes('HIGH') ? 'text-status-high'
    : row.status.includes('LOW') ? 'text-status-low'
    : 'text-charcoal'

  return (
    <div className="border-b border-ash last:border-b-0">
      <div
        className={`px-5 py-4 flex items-center gap-4 ${isAbnormal ? 'cursor-pointer hover:bg-stone-50' : ''} transition-colors`}
        onClick={() => isAbnormal && setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-charcoal">{row.name}</p>
          {row.condition && (
            <p className="text-xs text-muted mt-0.5">{row.condition}</p>
          )}
        </div>

        <div className="text-right shrink-0">
          <p className={`text-sm font-bold font-mono tabular-nums ${valueColor}`}>
            {row.value} <span className="text-xs font-normal text-muted">{row.unit}</span>
          </p>
          <p className="text-xs text-muted font-mono">Ref: {row.normal_range}</p>
        </div>

        <div className="shrink-0">
          <StatusBadge status={row.status} />
        </div>

        {isAbnormal && (
          <svg
            className={`w-4 h-4 text-muted shrink-0 transition-transform duration-150 ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>

      {expanded && isAbnormal && (
        <div className="px-5 pb-5 space-y-3">

          {/* What this means — Phase 1 */}
          <div className="bg-teal-50 border border-teal-muted rounded-xl px-4 py-3">
            <p className="text-xs font-bold text-teal uppercase tracking-wider mb-1">What this means</p>
            <p className="text-sm text-slate leading-relaxed">
              Your <strong>{row.name}</strong> is {row.status.toLowerCase()} at{' '}
              <strong>{row.value} {row.unit}</strong> (normal is {row.normal_range} {row.unit}).
              {row.condition ? ` This may suggest ${row.condition.toLowerCase()}.` : ''}
              {' '}Don&apos;t worry — many people have this and it is treatable with the right care.
            </p>
          </div>

          {/* Details — Phase 2 */}
          {details && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white border border-ash rounded-xl p-4">
                <p className="text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
                  🔍 Common Causes
                </p>
                <p className="text-sm text-slate leading-relaxed">{details.causes}</p>
              </div>

              <div className="bg-white border border-ash rounded-xl p-4">
                <p className="text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
                  🩹 Symptoms to Watch
                </p>
                <p className="text-sm text-slate leading-relaxed">{details.symptoms}</p>
              </div>

              <div className="bg-white border border-ash rounded-xl p-4">
                <p className="text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
                  🥗 Foods to Eat
                </p>
                <p className="text-sm text-slate leading-relaxed">{details.foods}</p>
              </div>

              <div className="bg-white border border-ash rounded-xl p-4">
                <p className="text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
                  👨‍⚕️ See a Doctor
                </p>
                <p className="text-sm text-slate leading-relaxed">{details.doctor}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ReportResults({ result }) {
  const [copied, setCopied] = useState(false)

  if (!result) return null

  const rows = result.all_values || []
  const unknownValues = result.unknown_values || []
  const doctorQuestions = result.doctor_questions || []

  const criticalRows = rows.filter(r => r.status.includes('CRITICALLY'))
  const abnormalRows = rows.filter(r => r.status !== 'NORMAL' && !r.status.includes('CRITICALLY'))
  const normalRows = rows.filter(r => r.status === 'NORMAL')
  const conditionRows = rows.filter(r => r.condition)

  const handleCopy = () => {
    const flagged = rows.filter(r => r.status !== 'NORMAL')
    const text = [
      'Blood Report Analysis',
      '',
      'Flagged Results:',
      ...flagged.map(r => `• ${r.name}: ${r.value} ${r.unit} (${r.status})${r.condition ? ' — ' + r.condition : ''} | Ref: ${r.normal_range}`),
      '',
      doctorQuestions.length > 0 ? 'Questions for Doctor:' : '',
      ...doctorQuestions.map((q, i) => `${i + 1}. ${q}`),
    ].filter(l => l !== undefined).join('\n')

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="space-y-6">

      {/* Summary Cards */}
      <div className="bg-white border border-ash rounded-2xl p-6">
        <h2 className="text-lg font-bold text-charcoal mb-4">📊 Report Summary</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-severity-major-bg rounded-xl">
            <p className="text-2xl font-bold text-severity-major">{criticalRows.length}</p>
            <p className="text-xs text-severity-major font-medium mt-0.5">Critical</p>
          </div>
          <div className="text-center p-3 bg-severity-moderate-bg rounded-xl">
            <p className="text-2xl font-bold text-severity-moderate">{abnormalRows.length}</p>
            <p className="text-xs text-severity-moderate font-medium mt-0.5">Abnormal</p>
          </div>
          <div className="text-center p-3 bg-status-normal-bg rounded-xl">
            <p className="text-2xl font-bold text-status-normal">{normalRows.length}</p>
            <p className="text-xs text-status-normal font-medium mt-0.5">Normal</p>
          </div>
        </div>
      </div>

      {/* Results Table */}
      {rows.length > 0 && (
        <div className="bg-white border border-ash rounded-2xl overflow-hidden">
          <div className="px-5 py-3 bg-stone-50 border-b border-ash flex items-center justify-between">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">
              {rows.length} values analyzed
            </p>
            <p className="text-xs text-muted">Tap flagged rows for details</p>
          </div>
          {rows.map((row, i) => (
            <TestRow
              key={i}
              row={row}
              defaultExpanded={i === 0 && row.status !== 'NORMAL'}
            />
          ))}
        </div>
      )}

      {/* Unknown values */}
      {unknownValues.length > 0 && (
        <div className="bg-white border border-ash rounded-2xl p-5">
          <h3 className="text-sm font-bold text-charcoal mb-3">ℹ️ Found but reference range not available</h3>
          <div className="space-y-2">
            {unknownValues.map((val, i) => (
              <div key={i} className="flex items-center justify-between border border-ash rounded-xl px-4 py-3 bg-stone-50">
                <div>
                  <p className="font-semibold text-sm text-charcoal capitalize">{val.name}</p>
                  <p className="text-xs text-muted">Not in our reference database</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-bold text-slate font-mono">{val.value}</p>
                  <span className="text-xs px-2 py-1 rounded-full font-bold bg-stone-200 text-muted">?</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted mt-2">💡 Consult your doctor for these values.</p>
        </div>
      )}

      {/* AI Explanation */}
      {result.explanation && (
        <div className="bg-teal-50 border border-teal-muted rounded-2xl p-6">
          <h3 className="text-base font-bold text-teal mb-3">💬 What This Report Suggests</h3>
          <p className="text-sm text-slate leading-relaxed">{result.explanation}</p>
        </div>
      )}

      {/* Doctor Questions */}
      {doctorQuestions.length > 0 && (
        <div className="bg-white border border-ash rounded-2xl p-6">
          <h3 className="text-base font-bold text-charcoal mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Questions to Ask Your Doctor
          </h3>
          <ul className="space-y-3">
            {doctorQuestions.map((q, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-50 text-teal text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-slate leading-relaxed">{q}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Possible Conditions — subtle at bottom */}
      {conditionRows.length > 0 && (
  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5">
    <p className="text-sm font-bold text-charcoal mb-3">
      Conditions to Discuss with Your Doctor
    </p>
    <div className="flex flex-wrap gap-2">
      {conditionRows.map((r, i) => (
        <span key={i} className="px-3 py-1.5 bg-white border border-stone-300 text-slate text-xs font-semibold rounded-full shadow-sm">
          {r.condition}
        </span>
      ))}
    </div>
    <p className="text-xs text-muted mt-3">
      These are possible conditions based on your values — not a diagnosis. Always confirm with your doctor.
    </p>
  </div>
)}

      {/* Disclaimer */}
      {result.disclaimer && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700">
          ⚠️ {result.disclaimer}
        </div>
      )}

      {/* Action Buttons — Copy, Print, Share */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Copy */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate bg-white border border-ash rounded-xl hover:bg-stone-50 transition-all"
        >
          {copied ? (
            <><svg className="w-4 h-4 text-severity-safe" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Copied!</>
          ) : (
            <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy Summary</>
          )}
        </button>

        {/* Print */}
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate bg-white border border-ash rounded-xl hover:border-teal hover:text-teal transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z" />
          </svg>
          Print Report
        </button>

        {/* Share */}
        <button
          onClick={async () => {
            const flagged = rows.filter(r => r.status !== 'NORMAL')
            const lines = [
              'MediQ — Blood Report Summary',
              '',
              result.explanation || '',
              '',
              'Parameters:',
              ...flagged.map(r => `  • ${r.name}: ${r.value} ${r.unit} [${r.status}]${r.condition ? ' — ' + r.condition : ''}`),
            ]
            const shareText = lines.join('\n')
            if (navigator.share) {
              try { await navigator.share({ title: 'MediQ Blood Report', text: shareText }) } catch {}
            } else {
              await navigator.clipboard.writeText(shareText)
              alert('Report summary copied to clipboard!')
            }
          }}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-teal text-white rounded-xl hover:bg-teal-hover active:bg-teal-active transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share Report
        </button>
      </div>
    </div>
  )
}