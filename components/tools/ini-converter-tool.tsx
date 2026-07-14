'use client'

import { useState } from 'react'
import { Loader2, AlertCircle, Copy, Check } from 'lucide-react'

type Format = 'json' | 'xml' | 'yaml'

export function IniConverterTool() {
  const [ini, setIni] = useState('')
  const [format, setFormat] = useState<Format>('json')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleExecute = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/tools/ini-converter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ini, format }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Tool execution failed')
      }

      const data = await response.json()
      setResult(data.result)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div>
          <label className="block font-medium text-foreground mb-3">INI Input</label>
          <textarea
            value={ini}
            onChange={(e) => setIni(e.target.value)}
            placeholder="Enter INI content..."
            className="input-base h-96 font-mono text-sm mb-4 resize-none"
          />
        </div>

        <div>
          <label className="block font-medium text-foreground mb-2">Output Format</label>
          <div className="flex gap-2">
            {(['json', 'xml', 'yaml'] as Format[]).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${
                  format === f
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border hover:bg-secondary'
                }`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleExecute}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Converting...
            </>
          ) : (
            `Convert to ${format.toUpperCase()}`
          )}
        </button>
      </div>

      <div className="space-y-4">
        <label className="block font-medium text-foreground mb-3">Output</label>

        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-secondary rounded-lg p-4 font-mono text-sm mb-4 max-h-96 overflow-auto">
            <pre className="whitespace-pre-wrap wrap-break-word">{result}</pre>
          </div>
        )}

        {!result && !error && (
          <div className="bg-secondary rounded-lg p-4 h-96 flex items-center justify-center text-muted-foreground">
            Results will appear here
          </div>
        )}

        {result && (
          <button
            onClick={copyToClipboard}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check size={18} className="text-green-500" />
                Copied
              </>
            ) : (
              <>
                <Copy size={18} />
                Copy Result
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
