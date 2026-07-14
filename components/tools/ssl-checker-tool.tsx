'use client'
import { useState } from 'react'
import { useToolApi, ExecuteButton } from './base/tool-layout'
import { ShieldCheck, ShieldX, ShieldAlert } from 'lucide-react'

interface SslResult {
  domain: string
  valid: boolean
  daysRemaining: number
  subject: { cn: string | null; o: string | null; c: string | null }
  issuer: { cn: string | null; o: string | null; c: string | null }
  validFrom: string
  validTo: string
  serialNumber: string | null
  fingerprint256: string | null
  sans: string[]
  sanCount: number
}

function fmt(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function SslCheckerTool() {
  const [domain, setDomain] = useState('')
  const [result, setResult] = useState<SslResult | null>(null)
  const { loading, error, call } = useToolApi('ssl-checker')

  const handleRun = async () => {
    setResult(null)
    const res = await call({ domain })
    if (res) setResult(res as SslResult)
  }

  const statusColor =
    !result ? '' :
    result.daysRemaining <= 0 ? 'text-red-600' :
    result.daysRemaining < 30 ? 'text-amber-600' :
    'text-green-600'

  const StatusIcon =
    !result ? null :
    result.daysRemaining <= 0 ? ShieldX :
    result.daysRemaining < 30 ? ShieldAlert :
    ShieldCheck

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
        <ExecuteButton onClick={handleRun} loading={loading} label="Check Certificate" />
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {result && StatusIcon && (
        <div className="space-y-4">
          <div className={`flex items-center gap-3 p-4 rounded-xl border ${
            result.daysRemaining <= 0
              ? 'bg-red-500/10 border-red-500/30'
              : result.daysRemaining < 30
              ? 'bg-amber-500/10 border-amber-500/30'
              : 'bg-green-500/10 border-green-500/30'
          }`}>
            <StatusIcon size={28} className={statusColor} />
            <div>
              <p className={`font-semibold ${statusColor}`}>
                {result.daysRemaining <= 0
                  ? `Certificate expired ${Math.abs(result.daysRemaining)} days ago`
                  : result.daysRemaining < 30
                  ? `Expires soon - ${result.daysRemaining} days remaining`
                  : `Valid - ${result.daysRemaining} days remaining`}
              </p>
              <p className="text-sm text-muted-foreground font-mono">{result.domain}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="card-base p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Subject</p>
              <div className="text-sm space-y-0.5 font-mono">
                {result.subject.cn && <p><span className="text-muted-foreground">CN</span> {result.subject.cn}</p>}
                {result.subject.o && <p><span className="text-muted-foreground">O &nbsp;</span> {result.subject.o}</p>}
                {result.subject.c && <p><span className="text-muted-foreground">C &nbsp;</span> {result.subject.c}</p>}
              </div>
            </div>
            <div className="card-base p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Issuer</p>
              <div className="text-sm space-y-0.5 font-mono">
                {result.issuer.cn && <p><span className="text-muted-foreground">CN</span> {result.issuer.cn}</p>}
                {result.issuer.o && <p><span className="text-muted-foreground">O &nbsp;</span> {result.issuer.o}</p>}
                {result.issuer.c && <p><span className="text-muted-foreground">C &nbsp;</span> {result.issuer.c}</p>}
              </div>
            </div>
            <div className="card-base p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Validity Period</p>
              <div className="text-sm space-y-0.5">
                <p><span className="text-muted-foreground">From:</span> {fmt(result.validFrom)}</p>
                <p><span className="text-muted-foreground">To: &nbsp;</span> {fmt(result.validTo)}</p>
              </div>
            </div>
            {result.fingerprint256 && (
              <div className="card-base p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">SHA-256 Fingerprint</p>
                <p className="text-xs font-mono break-all text-muted-foreground">{result.fingerprint256}</p>
              </div>
            )}
          </div>

          {result.sans.length > 0 && (
            <div className="card-base p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">
                Subject Alternative Names ({result.sanCount})
              </p>
              <div className="flex flex-wrap gap-2">
                {result.sans.map((san) => (
                  <span key={san} className="text-xs font-mono bg-muted px-2 py-1 rounded">
                    {san}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
