'use client'

import { useState } from 'react'
import { Loader2, AlertCircle, Copy, Check, Info } from 'lucide-react'

interface SqlToMongodbToolProps {
  toolId: string
}

const EXAMPLES = [
  {
    label: 'SELECT *',
    sql: 'SELECT * FROM users WHERE age > 21 AND active = true',
  },
  {
    label: 'SELECT cols',
    sql: "SELECT name, email FROM users WHERE role = 'admin'",
  },
  {
    label: 'ORDER BY',
    sql: 'SELECT * FROM products ORDER BY price DESC LIMIT 10',
  },
  {
    label: 'INSERT',
    sql: "INSERT INTO users (name, email, age) VALUES ('Alice', 'alice@example.com', 30)",
  },
  {
    label: 'UPDATE',
    sql: "UPDATE users SET active = false WHERE last_login < '2024-01-01'",
  },
  {
    label: 'DELETE',
    sql: 'DELETE FROM sessions WHERE expires < NOW()',
  },
]

export function SqlToMongodbTool({ toolId }: SqlToMongodbToolProps) {
  const [sql, setSql] = useState(EXAMPLES[0]!.sql)
  const [result, setResult] = useState<{
    operation: string
    collection: string
    query: string
    explanation: string
  } | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const convert = async () => {
    if (!sql.trim()) {
      setError('Enter a SQL query to convert.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`/api/tools/${toolId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Conversion failed')
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

  const copy = () => {
    if (!result) return
    navigator.clipboard.writeText(result.query)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">SQL query</label>
            <textarea
              value={sql}
              onChange={(e) => {
                setSql(e.target.value)
                setError('')
              }}
              className="input-base font-mono text-sm resize-none"
              style={{ height: '240px' }}
              placeholder="SELECT * FROM users WHERE age > 21"
            />
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Info size={12} />
              Examples:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.label}
                  onClick={() => {
                    setSql(ex.sql)
                    setError('')
                  }}
                  className="px-2.5 py-1 text-xs rounded-lg bg-secondary hover:bg-secondary/70 text-foreground border border-border transition-colors"
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
            onClick={convert}
            disabled={!sql.trim() || loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Converting…
              </>
            ) : (
              'Convert to MongoDB'
            )}
          </button>
        </div>

        <div className="space-y-4">
          {result ? (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">
                    <span className="text-primary font-mono">{result.operation}</span>
                    {' on '}
                    <span className="font-mono text-muted-foreground">{result.collection}</span>
                  </p>
                </div>
                <button onClick={copy} className="btn-secondary flex items-center gap-2 text-sm">
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
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1.5">MongoDB query</label>
                <div
                  className="bg-secondary rounded-xl p-4 font-mono text-sm overflow-auto"
                  style={{ minHeight: '200px' }}
                >
                  <pre className="whitespace-pre-wrap wrap-break-word">{result.query}</pre>
                </div>
              </div>

              {result.explanation && (
                <div className="bg-secondary/50 border border-border rounded-xl p-4">
                  <p className="text-xs text-muted-foreground font-medium mb-1">Explanation</p>
                  <p className="text-sm text-foreground">{result.explanation}</p>
                </div>
              )}
            </>
          ) : (
            <div
              className="bg-secondary rounded-xl flex items-center justify-center text-muted-foreground text-sm"
              style={{ height: '360px' }}
            >
              MongoDB query will appear here
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
