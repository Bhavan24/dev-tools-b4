'use client'

import { useState } from 'react'
import { Loader2, AlertCircle, Copy, Check } from 'lucide-react'

interface ValidationToolsProps {
  toolId: string
}

export function ValidationTools({ toolId }: ValidationToolsProps) {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [maxRedirects, setMaxRedirects] = useState(10)

  const isHtmlValidator = toolId === 'html-validator'
  const isRedirectionChecker = toolId === 'redirection-checker'

  const handleExecute = async () => {
    setLoading(true)
    setError('')
    try {
      const body: Record<string, any> = isHtmlValidator
        ? { html: input }
        : isRedirectionChecker
          ? { url: input, maxRedirects }
          : {}

      const response = await fetch(`/api/tools/${toolId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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
      const text = typeof result === 'string' ? result : JSON.stringify(result, null, 2)
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        {isHtmlValidator ? (
          <div>
            <label className="block font-medium text-foreground mb-3">HTML to Validate</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your HTML here..."
              className="input-base h-96 font-mono text-sm resize-none"
            />
          </div>
        ) : (
          <>
            <div>
              <label className="block font-medium text-foreground mb-3">URL to Check</label>
              <input
                type="url"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleExecute()}
                placeholder="https://example.com"
                className="input-base"
              />
            </div>
            <div>
              <label className="block font-medium text-foreground mb-3">
                Max Redirects ({maxRedirects})
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={maxRedirects}
                onChange={(e) => setMaxRedirects(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground mt-2">
                Follow up to {maxRedirects} redirects
              </div>
            </div>
          </>
        )}

        <button
          onClick={handleExecute}
          disabled={loading || !input}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Processing...
            </>
          ) : (
            'Execute'
          )}
        </button>
      </div>

      <div className="space-y-4">
        <label className="block font-medium text-foreground mb-3">Results</label>

        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {isHtmlValidator ? (
              <div className="space-y-3">
                <div
                  className={`p-4 rounded-lg flex items-center justify-between ${
                    result.isValid
                      ? 'bg-green-500/10 border border-green-500/30'
                      : 'bg-red-500/10 border border-red-500/30'
                  }`}
                >
                  <div>
                    <p className={`font-semibold ${result.isValid ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                      {result.isValid ? 'Valid HTML' : 'Invalid HTML'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {result.errorCount} {result.errorCount === 1 ? 'error' : 'errors'}
                    </p>
                  </div>
                </div>

                {result.errors && result.errors.length > 0 && (
                  <div className="bg-secondary rounded-lg p-3 space-y-2 max-h-64 overflow-auto">
                    {result.errors.map((err: any, idx: number) => (
                      <div key={idx} className="border-l-2 border-red-500 pl-3 py-2">
                        <p className="text-xs font-mono text-muted-foreground">Line {err.line}</p>
                        <p className="text-sm text-foreground">{err.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-secondary rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Final URL</p>
                  <p className="font-mono text-sm break-all text-foreground">{result.finalUrl}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-secondary rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Redirects</p>
                    <p className="text-lg font-bold text-foreground">{result.redirectCount}</p>
                  </div>
                  <div className="bg-secondary rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className={`text-lg font-bold ${result.isRedirected ? 'text-orange-600' : 'text-green-600'}`}>
                      {result.isRedirected ? 'Redirected' : 'Direct'}
                    </p>
                  </div>
                </div>

                {result.chain && result.chain.length > 0 && (
                  <div className="bg-secondary rounded-lg p-3 space-y-2 max-h-48 overflow-auto">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Redirect Chain</p>
                    {result.chain.map((link: any, idx: number) => (
                      <div key={idx} className="text-xs font-mono p-2 bg-primary/5 rounded">
                        <p className="text-muted-foreground">{idx + 1}. {link.status}</p>
                        <p className="text-foreground break-all truncate">{link.url}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={copyToClipboard}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check size={18} className="text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={18} />
                  Copy Result
                </>
              )}
            </button>
          </div>
        )}

        {!result && !error && (
          <div className="bg-secondary rounded-lg p-4 h-96 flex items-center justify-center text-muted-foreground">
            Results will appear here
          </div>
        )}
      </div>
    </div>
  )
}
