'use client'
import { useState } from 'react'
import { useToolApi, ExecuteButton } from './base/tool-layout'
import { CheckCircle2, AlertCircle } from 'lucide-react'

type Dialect = 'generic' | 'postgresql' | 'mysql' | 'sqlite'

interface SqlError {
  line: number
  column: number
  message: string
}

interface SqlValidationResult {
  valid: boolean
  errorCount: number
  errors: SqlError[]
  dialect: Dialect
  statementCount: number
}

const EXAMPLES: Record<Dialect, string> = {
  generic: `SELECT u.id, u.name, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.created_at >= '2024-01-01'
GROUP BY u.id, u.name
ORDER BY order_count DESC
LIMIT 10;`,
  postgresql: `SELECT id, name, metadata->>'email' AS email
FROM users
WHERE created_at > NOW() - INTERVAL '30 days'
  AND status = $1
ORDER BY created_at DESC;`,
  mysql: `SELECT id, name, JSON_EXTRACT(metadata, '$.email') AS email
FROM users
WHERE created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
  AND status = ?
ORDER BY created_at DESC;`,
  sqlite: `SELECT id, name
FROM users
WHERE created_at > datetime('now', '-30 days')
ORDER BY created_at DESC;`,
}

export function SqlValidatorTool() {
  const [sql, setSql] = useState('')
  const [dialect, setDialect] = useState<Dialect>('generic')
  const [result, setResult] = useState<SqlValidationResult | null>(null)
  const { loading, error, call } = useToolApi('sql-validator')

  const handleRun = async () => {
    const res = await call({ sql, dialect })
    if (res) setResult(res as SqlValidationResult)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Dialect:</label>
          <select
            value={dialect}
            onChange={(e) => setDialect(e.target.value as Dialect)}
            className="input-base py-1.5 px-3 text-sm w-36"
          >
            <option value="generic">Generic SQL</option>
            <option value="postgresql">PostgreSQL</option>
            <option value="mysql">MySQL</option>
            <option value="sqlite">SQLite</option>
          </select>
        </div>
        <button
          onClick={() => setSql(EXAMPLES[dialect])}
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
            placeholder="Paste your SQL statement here..."
            className="input-base h-72 font-mono text-sm resize-none"
            spellCheck={false}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Validation Results</label>
          {result ? (
            <div className="h-72 overflow-auto space-y-2">
              <div
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  result.valid
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                }`}
              >
                {result.valid ? (
                  <CheckCircle2 size={18} className="text-green-600 shrink-0" />
                ) : (
                  <AlertCircle size={18} className="text-red-600 shrink-0" />
                )}
                <span className="text-sm font-medium">
                  {result.valid
                    ? `Valid ${result.dialect} SQL - ${result.statementCount} statement${result.statementCount !== 1 ? 's' : ''}`
                    : `${result.errorCount} error${result.errorCount !== 1 ? 's' : ''} found`}
                </span>
              </div>

              {result.errors.map((err, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg border border-red-500/30 bg-red-500/5 text-sm"
                >
                  <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-mono text-xs text-muted-foreground">
                      Line {err.line}, Col {err.column}
                    </span>
                    <p className="text-foreground mt-0.5">{err.message}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-border rounded-lg h-72 flex items-center justify-center text-muted-foreground text-sm">
              Results will appear here
            </div>
          )}
        </div>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}
      <ExecuteButton onClick={handleRun} loading={loading} label="Validate SQL" />
    </div>
  )
}
