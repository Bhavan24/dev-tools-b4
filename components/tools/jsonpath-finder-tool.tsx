'use client'

import { useState } from 'react'
import { Loader2, AlertCircle, Copy, Check, Info } from 'lucide-react'

interface JsonpathFinderToolProps {
  toolId: string
}

const SAMPLE_JSON = `{
  "users": [
    { "id": 1, "name": "Alice", "role": "admin", "active": true },
    { "id": 2, "name": "Bob", "role": "user", "active": false },
    { "id": 3, "name": "Carol", "role": "user", "active": true }
  ],
  "meta": { "total": 3, "page": 1 }
}`

const EXAMPLES = [
  { label: 'All names', path: '$.users[*].name' },
  { label: 'Active users', path: '$.users[?(@.active==true)]' },
  { label: 'Admin role', path: '$.users[?(@.role=="admin")]' },
  { label: 'First user', path: '$.users[0]' },
  { label: 'Total count', path: '$.meta.total' },
]

interface Result {
  results: any[]
  paths: string[]
  count: number
}

export function JsonpathFinderTool({ toolId }: JsonpathFinderToolProps) {
  const [json, setJson] = useState(SAMPLE_JSON)
  const [path, setPath] = useState('$.users[*].name')
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const evaluate = async () => {
    if (!json.trim() || !path.trim()) {
      setError('Both JSON and expression are required.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`/api/tools/${toolId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ json, path }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Evaluation failed')
      }
      const data = await res.json()
      setResult(data.result)
    } catch (err: any) {
      setError(err.message)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const resultText = result ? JSON.stringify(result.results, null, 2) : ''

  const copyResult = () => {
    navigator.clipboard.writeText(resultText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">JSON document</label>
            <textarea
              value={json}
              onChange={(e) => {
                setJson(e.target.value)
                setError('')
              }}
              className="input-base font-mono text-sm resize-none"
              style={{ height: '300px' }}
              placeholder="Paste your JSON here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              JSONPath expression
            </label>
            <input
              type="text"
              value={path}
              onChange={(e) => {
                setPath(e.target.value)
                setError('')
              }}
              onKeyDown={(e) => e.key === 'Enter' && evaluate()}
              placeholder="$.store.books[*].title"
              className="input-base font-mono text-sm"
            />
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Info size={12} />
              Quick examples:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.path}
                  onClick={() => {
                    setPath(ex.path)
                    setError('')
                  }}
                  className="px-2.5 py-1 text-xs rounded-lg bg-secondary hover:bg-secondary/70 text-foreground border border-border transition-colors font-mono"
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            onClick={evaluate}
            disabled={!json.trim() || !path.trim() || loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Finding…
              </>
            ) : (
              'Find Matches'
            )}
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-foreground">
              Results{' '}
              {result != null && (
                <span className="text-muted-foreground font-normal">
                  ({result.count} match{result.count !== 1 ? 'es' : ''})
                </span>
              )}
            </label>
            {result != null && (
              <button
                onClick={copyResult}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-green-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    Copy
                  </>
                )}
              </button>
            )}
          </div>

          {result != null ? (
            <div className="space-y-3">
              <div
                className="bg-secondary rounded-xl p-4 font-mono text-sm overflow-auto"
                style={{ height: '320px' }}
              >
                <pre className="whitespace-pre-wrap wrap-break-word">{resultText}</pre>
              </div>
              {result.paths.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Matched paths:</p>
                  <div className="space-y-1">
                    {result.paths.slice(0, 20).map((p, i) => (
                      <code
                        key={i}
                        className="block text-xs text-primary bg-secondary px-2 py-1 rounded font-mono truncate"
                      >
                        {p}
                      </code>
                    ))}
                    {result.paths.length > 20 && (
                      <p className="text-xs text-muted-foreground">
                        …and {result.paths.length - 20} more
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              className="bg-secondary rounded-xl flex items-center justify-center text-muted-foreground text-sm"
              style={{ height: '360px' }}
            >
              Results will appear here
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
