'use client'
import { useState } from 'react'

export default function ReportPage() {
  const [text, setText] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notLoggedIn, setNotLoggedIn] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setSelectedFiles(prev => [...prev, ...files])
    setError('')
    setResult(null)
    e.target.value = ''
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setError('')
  }

  const handleAnalyze = async () => {
    if (!selectedFiles.length && !text.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      let res

      if (selectedFiles.length > 0) {
        const file = selectedFiles[0]

        if (file.type === 'application/pdf') {
          setError('For PDFs: open the file, select all text (Ctrl+A), copy and paste it in the text box below.')
          setLoading(false)
          return
        }

        if (!file.type.startsWith('image/')) {
          setError('Please upload an image (JPG, PNG).')
          setLoading(false)
          return
        }

        const formData = new FormData()
        formData.append('file', file)
        res = await fetch('/api/report', {
          method: 'POST',
          body: formData
        })
      } else {
        res = await fetch('/api/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ extracted_text: text })
        })
      }

      const data = await res.json()

      if (res.status === 401) {
        setNotLoggedIn(true)
      } else if (data.error) {
        setError(data.error)
      } else {
        setResult(data)
      }
    } catch (e) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const statusConfig = {
    HIGH: { color: 'bg-red-100 text-red-700 border-red-200', badge: 'bg-red-500 text-white' },
    LOW: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', badge: 'bg-yellow-500 text-white' },
    NORMAL: { color: 'bg-green-100 text-green-700 border-green-200', badge: 'bg-green-500 text-white' },
  }

  if (notLoggedIn) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <div className="text-5xl mb-4">🩺</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Login Required</h1>
        <p className="text-gray-500 mb-6">Report analysis is private. Please login to use this feature.</p>
        <a href="/auth" className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700">
          Login with Google
        </a>
      </div>
    )
  }

  const canAnalyze = (selectedFiles.length > 0 || text.trim()) && !loading

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Blood Report Explainer 🩺</h1>
      <p className="text-gray-500 mb-8">
        Upload your report image or paste text. We'll flag HIGH/LOW values and explain in plain English.
      </p>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">

        {/* File Upload Area */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-3 mb-3">

            {/* Selected File Thumbnails */}
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative w-24 h-24">
                <div className="w-24 h-24 border-2 border-blue-200 rounded-xl overflow-hidden bg-blue-50 flex items-center justify-center">
                  {file.type.startsWith('image/') ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-2">
                      <div className="text-2xl">📄</div>
                      <p className="text-xs text-blue-600 font-medium mt-1 truncate w-20">{file.name}</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm font-bold flex items-center justify-center hover:bg-red-600 shadow-sm"
                >
                  −
                </button>
              </div>
            ))}

            {/* Add file button */}
            <div className="w-24 h-24">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="fileUpload"
                multiple
              />
              <label
                htmlFor="fileUpload"
                className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
              >
                <span className="text-2xl text-gray-400">+</span>
                <span className="text-xs text-gray-400 mt-1">Add file</span>
              </label>
            </div>

          </div>
          <p className="text-xs text-gray-400">JPG, PNG recommended • PDF: paste text below instead</p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-xs text-gray-400 font-medium">OR PASTE TEXT</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Text Area */}
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            if (e.target.value) setSelectedFiles([])
          }}
          placeholder={`Paste report text here:
Hemoglobin 9.5 g/dL
WBC 11.5 thousand/uL
TSH 6.2 mIU/L`}
          rows={5}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
        />

        {/* Analyze Button */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-gray-400">
            {selectedFiles.length > 0
              ? '✅ File ready — click Analyze'
              : '💡 Tip: Copy text from PDF and paste above'}
          </p>
          <button
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Analyzing...' : 'Analyze Report'}
          </button>
        </div>
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
          <div className="text-4xl mb-3">🔬</div>
          <p>{selectedFiles.length > 0 ? 'Reading your report...' : 'Analyzing values...'}</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-1">📊 Summary</h2>
            <p className="text-sm text-gray-500 mb-4">
              Found {result.all_values.length} values • {result.abnormal_count} outside normal range
            </p>

            <div className="space-y-2">
              {result.all_values.map((val: any, i: number) => {
                const config = statusConfig[val.status as keyof typeof statusConfig]
                return (
                  <div key={i} className={`flex items-center justify-between border rounded-xl px-4 py-3 ${config.color}`}>
                    <div>
                      <p className="font-semibold text-sm">{val.name}</p>
                      <p className="text-xs opacity-70">Normal: {val.normal_range} {val.unit}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-bold">{val.value} {val.unit}</p>
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${config.badge}`}>
                        {val.status}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Unknown values */}
            {result.unknown_values && result.unknown_values.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-500 mb-2">
                  ℹ️ Found but reference range not available:
                </p>
                <div className="space-y-2">
                  {result.unknown_values.map((val: any, i: number) => (
                    <div key={i} className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
                      <div>
                        <p className="font-semibold text-sm text-gray-600 capitalize">{val.name}</p>
                        <p className="text-xs text-gray-400">Not in our reference database</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-gray-600">{val.value}</p>
                        <span className="text-xs px-2 py-1 rounded-full font-bold bg-gray-200 text-gray-600">?</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  💡 Consult your doctor for these values.
                </p>
              </div>
            )}
          </div>

          {result.explanation && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
              <h2 className="font-bold text-blue-800 mb-3">💬 What This Means</h2>
              <p className="text-blue-900 text-sm leading-relaxed">{result.explanation}</p>
            </div>
          )}

          {result.doctor_questions && result.doctor_questions.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-gray-800 mb-3">🏥 Questions to Ask Your Doctor</h2>
              <ul className="space-y-2">
                {result.doctor_questions.map((q: string, i: number) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-700">
                    <span className="text-blue-500 font-bold">{i + 1}.</span>
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-xs text-yellow-700">
            ⚠️ {result.disclaimer}
          </div>
        </div>
      )}
    </div>
  )
}