'use client'

import { useState } from 'react'
import { Loader2, AlertCircle, Plus, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react'

interface LinkCheckerToolProps {
  toolId: string
}

interface LinkResult {
  url: string
  status: number | null
  statusText: string
  ok: boolean
  latencyMs: number
  error?: string
}

export function LinkCheckerTool({ toolId }: LinkCheckerToolProps) {
  const [urls, setUrls] = useState<string[]>(['https://example.com', ''])
  const [results, setResults] = useState<LinkResult[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addRow = () => setUrls((prev) => [...prev, ''])
  const removeRow = (i: number) => setUrls((prev) => prev.filter((_, idx) => idx !== i))
  const updateRow = (i: number, val: string) =>
    setUrls((prev) => prev.map((u, idx) => (idx === i ? val : u)))

  const check = async () => {
    const targets = urls.map((u) => u.trim()).filter(Boolean)
    if (!targets.length) { setError('Add at least one URL to check.'); return }
    setError('')
    setResults(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/tools/${toolId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: targets }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Check failed')
      }
      const data = await res.json()
      setResults(data.result.results)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const validUrls = urls.filter((u) => u.trim()).length

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        {urls.map((url, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => updateRow(i, e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && check()}
              placeholder="https://example.com"
              className="input-base flex-1"
            />
            {urls.length > 1 && (
              <button onClick={() => removeRow(i)} className="btn-secondary p-2 text-muted-foreground hover:text-red-500">
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button onClick={addRow} className="btn-secondary flex items-center gap-2 text-sm">
          <Plus size={15} />Add URL
        </button>
        <button
          onClick={check}
          disabled={!validUrls || loading}
          className="btn-primary flex items-center gap-2"
        >
          {loading ? <><Loader2 size={16} className="animate-spin" />Checking…</> : `Check ${validUrls} URL${validUrls !== 1 ? 's' : ''}`}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
          <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {results && (
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="text-green-600 font-medium">{results.filter((r) => r.ok).length} reachable</span>
            <span>·</span>
            <span className="text-red-500 font-medium">{results.filter((r) => !r.ok).length} failed</span>
          </div>
          <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
            {results.map((r, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3 bg-background hover:bg-secondary/40 transition-colors">
                <div className="mt-0.5 shrink-0">
                  {r.ok ? (
                    <CheckCircle size={17} className="text-green-500" />
                  ) : (
                    <XCircle size={17} className="text-red-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{r.url}</p>
                  {r.error && <p className="text-xs text-red-500 mt-0.5">{r.error}</p>}
                </div>
                <div className="shrink-0 text-right space-y-0.5">
                  {r.status != null && (
                    <span className={`text-xs font-mono font-semibold ${r.ok ? 'text-green-600' : 'text-red-500'}`}>
                      {r.status} {r.statusText}
                    </span>
                  )}
                  {r.latencyMs > 0 && (
                    <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                      <Clock size={11} />
                      {r.latencyMs}ms
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
