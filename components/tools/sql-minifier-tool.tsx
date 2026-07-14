'use client'
import { useState } from 'react'
import { useToolApi, ExecuteButton } from './base/tool-layout'
import { Copy, Check } from 'lucide-react'

const EXAMPLE = `-- Fetch top customers by revenue
SELECT
    c.id,
    c.name,       -- customer name
    /* billing address */
    c.email,
    SUM(o.total) AS total_revenue
FROM customers c
INNER JOIN orders o
    ON o.customer_id = c.id
WHERE
    o.status = 'completed'
    AND o.created_at >= '2024-01-01'
GROUP BY
    c.id,
    c.name,
    c.email
ORDER BY total_revenue DESC
LIMIT 20;`

export function SqlMinifierTool() {
  const [sql, setSql] = useState('')
  const [preserveNewlines, setPreserveNewlines] = useState(false)
  const [result, setResult] = useState<{
    minified: string
    originalLength: number
    minifiedLength: number
    savedBytes: number
    savedPercent: number
  } | null>(null)
  const [copied, setCopied] = useState(false)
  const { loading, error, call } = useToolApi('sql-minifier')

  const handleRun = async () => {
    const res = await call({ sql, preserveNewlines })
    if (res) setResult(res as typeof result)
  }

  const handleCopy = async () => {
    if (!result) return
    await navigator.clipboard.writeText(result.minified)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={preserveNewlines}
            onChange={(e) => setPreserveNewlines(e.target.checked)}
            className="rounded"
          />
          Preserve newlines before semicolons
        </label>
        <button
          onClick={() => setSql(EXAMPLE)}
          className="text-xs text-primary hover:underline ml-auto"
        >
          Load example
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium">SQL Input</label>
          <textarea
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            placeholder="Paste your SQL here..."
            className="input-base h-72 font-mono text-sm resize-none"
            spellCheck={false}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium">Minified Output</label>
            {result && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>
          {result ? (
            <div className="space-y-3">
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>{result.originalLength} chars</span>
                <span>→</span>
                <span className="text-foreground font-medium">{result.minifiedLength} chars</span>
                <span className="text-green-600 font-medium">-{result.savedPercent}%</span>
              </div>
              <pre className="input-base h-56 overflow-auto text-sm font-mono whitespace-pre-wrap break-all p-3">
                {result.minified}
              </pre>
            </div>
          ) : (
            <div className="border border-border rounded-lg h-72 flex items-center justify-center text-muted-foreground text-sm">
              Minified output will appear here
            </div>
          )}
        </div>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}
      <ExecuteButton onClick={handleRun} loading={loading} label="Minify SQL" />
    </div>
  )
}
