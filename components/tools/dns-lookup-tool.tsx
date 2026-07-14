'use client'
import { useState } from 'react'
import { useToolApi, ExecuteButton } from './base/tool-layout'

const RECORD_TYPES = ['ALL', 'A', 'AAAA', 'MX', 'TXT', 'CNAME', 'NS', 'SOA'] as const
type RecordType = (typeof RECORD_TYPES)[number]

interface DnsRecord {
  type: string
  name: string
  ttl: number
  data: string
}

interface DnsResult {
  domain: string
  queried: string[]
  totalRecords: number
  records: DnsRecord[]
  byType?: Record<string, DnsRecord[]>
}

const TYPE_COLORS: Record<string, string> = {
  A: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  AAAA: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  MX: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  TXT: 'bg-green-500/15 text-green-600 dark:text-green-400',
  CNAME: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
  NS: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  SOA: 'bg-slate-500/15 text-slate-600 dark:text-slate-400',
}

export function DnsLookupTool() {
  const [domain, setDomain] = useState('')
  const [type, setType] = useState<RecordType>('ALL')
  const [result, setResult] = useState<DnsResult | null>(null)
  const { loading, error, call } = useToolApi('dns-lookup')

  const handleRun = async () => {
    setResult(null)
    const res = await call({ domain, type })
    if (res) setResult(res as DnsResult)
  }

  const records: DnsRecord[] =
    result
      ? type === 'ALL' && result.byType
        ? Object.entries(result.byType).flatMap(([t, recs]) =>
            recs.map((r) => ({ ...r, type: t }))
          )
        : result.records
      : []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleRun()}
          placeholder="example.com"
          className="input-base flex-1 font-mono"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as RecordType)}
          className="input-base sm:w-32"
        >
          {RECORD_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <ExecuteButton onClick={handleRun} loading={loading} label="Lookup" />
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {result && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              <span className="font-mono font-semibold text-foreground">{result.domain}</span>
              {' '}- {result.totalRecords} record{result.totalRecords !== 1 ? 's' : ''} found
            </span>
          </div>

          {records.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              No records found for this query.
            </p>
          ) : (
            <div className="space-y-2">
              {records.map((r, i) => (
                <div key={i} className="card-base p-3 flex items-start gap-3 text-sm font-mono">
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded text-xs font-bold uppercase ${
                      TYPE_COLORS[r.type] ?? 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {r.type}
                  </span>
                  <span className="flex-1 break-all text-foreground">{r.data}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{r.ttl}s</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
