import { useMemo, useState } from 'react'
import './App.css'

function normalize(str) {
  return (str || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase()
}

function App() {
  const [requestCode, setRequestCode] = useState('')
  const [finalKey, setFinalKey] = useState('')
  const [formattedFinalKey, setFormattedFinalKey] = useState('')
  const [normalized, setNormalized] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const clientNormalized = useMemo(() => normalize(requestCode), [requestCode])
  const normalizationChanged = useMemo(() => requestCode && clientNormalized !== requestCode, [requestCode, clientNormalized])

  async function handleGenerate(e) {
    e.preventDefault()
    setError('')
    setFinalKey('')
    setNormalized('')
    setFormattedFinalKey('')
    const code = requestCode
    if (!code) {
      setError('Please enter a request code.')
      return
    }
    const cleaned = normalize(code)
    if (!cleaned || !/^[A-Z0-9]+$/.test(cleaned)) {
      setError('Normalized request code is empty or invalid.')
      return
    }
    try {
      setLoading(true)
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestCode: code })
      })
      if (!res.ok) {
        throw new Error(`Request failed (HTTP ${res.status})`)
      }
      const data = await res.json()
      setFinalKey(data.finalKey)
      setFormattedFinalKey(data.formattedFinalKey || '')
      setNormalized(data.normalized)
    } catch (err) {
      setError(err.message || 'Unexpected error')
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    const toCopy = formattedFinalKey || finalKey
    if (!toCopy) return
    try {
      await navigator.clipboard.writeText(toCopy)
    } catch {}
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white shadow rounded p-6">
        <h1 className="text-xl font-semibold mb-4">License Key Generator</h1>
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label htmlFor="requestCode" className="block text-sm font-medium mb-1">Request Code</label>
            <input
              id="requestCode"
              type="text"
              value={requestCode}
              onChange={(e) => setRequestCode(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
              placeholder="Paste code like DEXS4E5AJYF6G"
            />
            {normalizationChanged && (
              <p className="text-xs text-gray-500 mt-1">Normalized: {clientNormalized}</p>
            )}
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white rounded py-2 disabled:opacity-50">
            {loading ? 'Generating…' : 'Generate'}
          </button>
        </form>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Final Key</span>
            <button onClick={handleCopy} disabled={!finalKey && !formattedFinalKey} className="text-sm text-blue-600 disabled:opacity-50">Copy</button>
          </div>
          <div className="mt-2 font-mono text-lg">{formattedFinalKey || finalKey || '—'}</div>
          {normalized && (
            <p className="text-xs text-gray-500 mt-1">Server normalized: {normalized}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
