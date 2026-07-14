'use client'
import { useState } from 'react'
import { useToolApi, ExecuteButton } from './base/tool-layout'

interface SemverParsed {
  major: number
  minor: number
  patch: number
  prerelease: string | null
  build: string | null
}

interface SemverResult {
  version1: string
  version2: string
  comparison: 'greater' | 'less' | 'equal'
  winner: string | null
  diff: { major: number; minor: number; patch: number; prerelease: string | null }
  parsed: { v1: SemverParsed; v2: SemverParsed }
}

export function SemverComparatorTool() {
  const [version1, setVersion1] = useState('1.2.3')
  const [version2, setVersion2] = useState('1.3.0')
  const [result, setResult] = useState<SemverResult | null>(null)
  const { loading, error, call } = useToolApi('semver-comparator')

  const handleRun = async () => {
    const res = await call({ version1, version2 })
    if (res) setResult(res as SemverResult)
  }

  const comparisonLabel = result
    ? result.comparison === 'equal'
      ? '='
      : result.comparison === 'greater'
      ? '>'
      : '<'
    : 'vs'

  const comparisonColor = result
    ? result.comparison === 'equal'
      ? 'text-muted-foreground'
      : 'text-primary'
    : 'text-muted-foreground'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex-1 space-y-2">
          <label className="block text-sm font-medium">Version 1</label>
          <input
            type="text"
            value={version1}
            onChange={(e) => setVersion1(e.target.value)}
            placeholder="e.g. 1.2.3 or v2.0.0-beta.1"
            className="input-base w-full font-mono"
          />
        </div>
        <div className="pt-6">
          <span className={`text-2xl font-bold ${comparisonColor}`}>{comparisonLabel}</span>
        </div>
        <div className="flex-1 space-y-2">
          <label className="block text-sm font-medium">Version 2</label>
          <input
            type="text"
            value={version2}
            onChange={(e) => setVersion2(e.target.value)}
            placeholder="e.g. 1.3.0 or v2.1.0"
            className="input-base w-full font-mono"
          />
        </div>
      </div>
      <ExecuteButton onClick={handleRun} loading={loading} label="Compare Versions" />
      {error && <p className="text-destructive text-sm">{error}</p>}
      {result && (
        <div className="card-base p-6 space-y-4">
          <div className="text-center">
            {result.comparison === 'equal' ? (
              <p className="text-lg font-semibold">Versions are equal</p>
            ) : (
              <p className="text-lg font-semibold">
                <span className="text-primary font-mono">{result.winner}</span> is higher
              </p>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4 text-center text-sm border-t border-border pt-4">
            {[
              { label: 'Major', value: result.diff.major },
              { label: 'Minor', value: result.diff.minor },
              { label: 'Patch', value: result.diff.patch },
            ].map((d) => (
              <div key={d.label}>
                <p className={`text-2xl font-bold ${Math.abs(d.value) > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                  {d.value > 0 ? `+${d.value}` : d.value}
                </p>
                <p className="text-xs text-muted-foreground">{d.label}</p>
              </div>
            ))}
          </div>
          {result.diff.prerelease && (
            <p className="text-center text-sm text-muted-foreground border-t border-border pt-3">
              Pre-release: {result.diff.prerelease}
            </p>
          )}
          <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm">
            {[
              { label: result.version1, parsed: result.parsed.v1 },
              { label: result.version2, parsed: result.parsed.v2 },
            ].map((v) => (
              <div key={v.label} className="bg-muted rounded p-3">
                <p className="font-mono font-semibold mb-2">{v.label}</p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>Major: {v.parsed.major} | Minor: {v.parsed.minor} | Patch: {v.parsed.patch}</p>
                  {v.parsed.prerelease && <p>Pre-release: {v.parsed.prerelease}</p>}
                  {v.parsed.build && <p>Build: {v.parsed.build}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
