'use client'
import { useState } from 'react'
import { useToolApi, ExecuteButton } from './base/tool-layout'

const SAMPLE_ENV = `# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
DB_NAME=mydb
DB_PASSWORD=

# Auth
JWT_SECRET="my-super-secret-key"
JWT_EXPIRY='7d'
JWT_SECRET=duplicate-key

# App
PORT=3000
NODE_ENV=development
DEBUG=true
`

interface EnvEntry {
  key: string
  value: string
  rawValue: string
  lineNumber: number
  hasIssue: boolean
  issue: string
}

interface EnvStats {
  total: number
  empty: number
  duplicates: number
  quoted: number
}

export function EnvFileParserTool() {
  const [content, setContent] = useState('')
  const [result, setResult] = useState<{ entries: EnvEntry[]; stats: EnvStats } | null>(null)
  const { loading, error, call } = useToolApi('env-file-parser')

  const handleRun = async () => {
    const res = await call({ content })
    if (res) setResult(res as { entries: EnvEntry[]; stats: EnvStats })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium">.env File Content</label>
          <button
            onClick={() => setContent(SAMPLE_ENV)}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Load sample
          </button>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste your .env file content here..."
          rows={10}
          className="input-base w-full font-mono text-sm"
        />
      </div>
      <ExecuteButton onClick={handleRun} loading={loading} label="Parse .env" />
      {error && <p className="text-destructive text-sm">{error}</p>}
      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3 text-center">
            {[
              { label: 'Total', value: result.stats.total, color: '' },
              { label: 'Empty Values', value: result.stats.empty, color: result.stats.empty > 0 ? 'text-yellow-600' : '' },
              { label: 'Duplicates', value: result.stats.duplicates, color: result.stats.duplicates > 0 ? 'text-destructive' : '' },
              { label: 'Quoted', value: result.stats.quoted, color: '' },
            ].map((stat) => (
              <div key={stat.label} className="card-base p-3">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="pb-2 pr-4">Line</th>
                  <th className="pb-2 pr-4">Key</th>
                  <th className="pb-2 pr-4">Value</th>
                  <th className="pb-2">Issue</th>
                </tr>
              </thead>
              <tbody>
                {result.entries.map((entry, i) => (
                  <tr
                    key={i}
                    className={`border-b border-border/50 ${
                      entry.issue.startsWith('Duplicate') || entry.issue === 'Missing = sign'
                        ? 'bg-destructive/5'
                        : entry.issue === 'Empty value'
                        ? 'bg-yellow-500/5'
                        : ''
                    }`}
                  >
                    <td className="py-2 pr-4 text-muted-foreground">{entry.lineNumber}</td>
                    <td className="py-2 pr-4 font-mono font-medium">{entry.key}</td>
                    <td className="py-2 pr-4 font-mono text-muted-foreground max-w-[200px] truncate">{entry.value || <span className="italic text-xs">(empty)</span>}</td>
                    <td className="py-2 text-xs">
                      {entry.issue ? (
                        <span className={entry.issue.startsWith('Duplicate') ? 'text-destructive' : 'text-yellow-600'}>
                          {entry.issue}
                        </span>
                      ) : (
                        <span className="text-green-600">OK</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
