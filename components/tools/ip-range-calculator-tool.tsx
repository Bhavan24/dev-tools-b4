'use client'
import { useState } from 'react'
import { useToolApi, ExecuteButton } from './base/tool-layout'
import { Copy, Check } from 'lucide-react'

interface IpRangeResult {
  startIp: string
  endIp: string
  totalIps: number
  cidrCount: number
  cidrs: string[]
}

export function IpRangeCalculatorTool() {
  const [startIp, setStartIp] = useState('192.168.1.0')
  const [endIp, setEndIp] = useState('192.168.1.255')
  const [result, setResult] = useState<IpRangeResult | null>(null)
  const [copied, setCopied] = useState(false)
  const { loading, error, call } = useToolApi('ip-range-calculator')

  const handleRun = async () => {
    const res = await call({ startIp, endIp })
    if (res) setResult(res as IpRangeResult)
  }

  const copyAll = () => {
    if (!result) return
    navigator.clipboard.writeText(result.cidrs.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-2">Start IP</label>
          <input
            type="text"
            value={startIp}
            onChange={(e) => setStartIp(e.target.value)}
            placeholder="192.168.1.0"
            className="input-base w-full font-mono"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">End IP</label>
          <input
            type="text"
            value={endIp}
            onChange={(e) => setEndIp(e.target.value)}
            placeholder="192.168.1.255"
            className="input-base w-full font-mono"
          />
        </div>
      </div>
      <ExecuteButton onClick={handleRun} loading={loading} label="Calculate CIDR Blocks" />

      {error && <p className="text-destructive text-sm">{error}</p>}

      {result && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-mono text-foreground">{result.startIp}</span>
              {' - '}
              <span className="font-mono text-foreground">{result.endIp}</span>
              {' · '}
              {result.totalIps.toLocaleString()} IPs
              {' · '}
              {result.cidrCount} CIDR block{result.cidrCount !== 1 ? 's' : ''}
            </p>
            <button
              onClick={copyAll}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied ? <><Check size={13} className="text-green-500" />Copied</> : <><Copy size={13} />Copy all</>}
            </button>
          </div>
          <div className="space-y-1.5">
            {result.cidrs.map((cidr) => (
              <div key={cidr} className="card-base p-3 font-mono text-sm">
                {cidr}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
