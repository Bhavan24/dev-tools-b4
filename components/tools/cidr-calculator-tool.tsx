'use client'
import { useState } from 'react'
import { useToolApi, ExecuteButton } from './base/tool-layout'

interface CidrResult {
  cidr: string
  inputIp: string
  networkAddress: string
  broadcastAddress: string
  subnetMask: string
  wildcardMask: string
  firstHost: string
  lastHost: string
  totalHosts: number
  usableHosts: number
  prefixLength: number
  ipClass: string
  isPrivate: boolean
}

export function CidrCalculatorTool() {
  const [cidr, setCidr] = useState('192.168.1.0/24')
  const [result, setResult] = useState<CidrResult | null>(null)
  const { loading, error, call } = useToolApi('cidr-calculator')

  const handleRun = async () => {
    const res = await call({ cidr })
    if (res) setResult(res as CidrResult)
  }

  const rows = result
    ? [
        { label: 'Network Address', value: result.networkAddress },
        { label: 'Broadcast Address', value: result.broadcastAddress },
        { label: 'Subnet Mask', value: result.subnetMask },
        { label: 'Wildcard Mask', value: result.wildcardMask },
        { label: 'First Host', value: result.firstHost },
        { label: 'Last Host', value: result.lastHost },
        { label: 'Total Hosts', value: result.totalHosts.toLocaleString() },
        { label: 'Usable Hosts', value: result.usableHosts.toLocaleString() },
        { label: 'Prefix Length', value: `/${result.prefixLength}` },
        { label: 'IP Class', value: result.ipClass },
        { label: 'Private Range', value: result.isPrivate ? 'Yes (RFC 1918)' : 'No' },
      ]
    : []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={cidr}
          onChange={(e) => setCidr(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleRun()}
          placeholder="192.168.1.0/24"
          className="input-base flex-1 font-mono"
        />
        <ExecuteButton onClick={handleRun} loading={loading} label="Calculate" />
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {result && (
        <div className="space-y-3">
          <p className="text-sm font-mono font-semibold text-primary">{result.cidr}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {rows.map(({ label, value }) => (
              <div key={label} className="card-base p-3 flex justify-between items-center gap-2">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="text-sm font-mono font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
