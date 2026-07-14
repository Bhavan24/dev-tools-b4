'use client'
import { useState } from 'react'
import { useToolApi, ExecuteButton } from './base/tool-layout'

interface WhoisResult {
  domain: string
  status: string
  registrar: string | null
  registrantOrg: string | null
  created: string | null
  updated: string | null
  expires: string | null
  nameservers: string[]
  handle: string | null
  ldhName: string
}

function formatDate(iso: string | null): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function daysUntil(iso: string | null): number | null {
  if (!iso) return null
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000)
}

export function WhoisLookupTool() {
  const [domain, setDomain] = useState('')
  const [result, setResult] = useState<WhoisResult | null>(null)
  const { loading, error, call } = useToolApi('whois-lookup')

  const handleRun = async () => {
    setResult(null)
    const res = await call({ domain })
    if (res) setResult(res as WhoisResult)
  }

  const days = daysUntil(result?.expires ?? null)

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
        <ExecuteButton onClick={handleRun} loading={loading} label="WHOIS Lookup" />
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {result && (
        <div className="space-y-4">
          <div className="flex items-baseline gap-3">
            <h2 className="text-lg font-semibold font-mono">{result.ldhName}</h2>
            {days !== null && (
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded ${
                  days < 30
                    ? 'bg-red-500/15 text-red-600'
                    : days < 90
                    ? 'bg-amber-500/15 text-amber-600'
                    : 'bg-green-500/15 text-green-600'
                }`}
              >
                {days > 0 ? `Expires in ${days}d` : `Expired ${Math.abs(days)}d ago`}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Registrar', value: result.registrar },
              { label: 'Registrant Org', value: result.registrantOrg },
              { label: 'Status', value: result.status },
              { label: 'Handle', value: result.handle },
              { label: 'Created', value: formatDate(result.created) },
              { label: 'Updated', value: formatDate(result.updated) },
              { label: 'Expires', value: formatDate(result.expires) },
            ].map(({ label, value }) =>
              value ? (
                <div key={label} className="card-base p-3">
                  <p className="text-xs text-muted-foreground font-medium uppercase mb-1">{label}</p>
                  <p className="text-sm font-mono break-all">{value}</p>
                </div>
              ) : null
            )}
          </div>

          {result.nameservers.length > 0 && (
            <div className="card-base p-3">
              <p className="text-xs text-muted-foreground font-medium uppercase mb-2">Nameservers</p>
              <div className="space-y-1">
                {result.nameservers.map((ns) => (
                  <p key={ns} className="text-sm font-mono">{ns}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
