'use client'

import { useState } from 'react'
import { useToolApi, ExecuteButton } from './base/tool-layout'
import { Copy, Check } from 'lucide-react'

const PRESETS = [
  { label: 'Every minute', value: '* * * * *' },
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Every day at midnight', value: '0 0 * * *' },
  { label: 'Every day at noon', value: '0 12 * * *' },
  { label: 'Every Sunday at midnight', value: '0 0 * * 0' },
  { label: 'Every weekday at 9am', value: '0 9 * * 1-5' },
  { label: 'Every 15 minutes', value: '*/15 * * * *' },
  { label: 'Every month on the 1st', value: '0 0 1 * *' },
]

interface ParseResult {
  expression: string
  description: string
  nextRuns: string[]
  fields: { second: string; minute: string; hour: string; day: string; month: string; weekday: string }
}

export function CronExpressionTool() {
  const [expression, setExpression] = useState('0 9 * * 1-5')
  const [nextCount, setNextCount] = useState(5)
  const [result, setResult] = useState<ParseResult | null>(null)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const { loading, error, call } = useToolApi('cron-expression-builder')

  const handleParse = async () => {
    const res = await call({ expression, nextCount })
    if (res !== null) setResult(res)
  }

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedToken(key)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  const fieldLabels: Record<string, string> = {
    second: 'Second',
    minute: 'Minute',
    hour: 'Hour',
    day: 'Day',
    month: 'Month',
    weekday: 'Weekday',
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="block font-medium text-foreground">Cron Expression</label>
        <input
          type="text"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleParse()}
          placeholder="* * * * *"
          className="input-base font-mono text-lg tracking-widest"
        />
        <p className="text-xs text-muted-foreground">Format: minute hour day month weekday &nbsp;(or 6 fields with second first)</p>
      </div>

      <div>
        <p className="text-sm font-medium text-foreground mb-2">Presets</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => setExpression(p.value)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                expression === p.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border hover:bg-secondary'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground whitespace-nowrap">Next runs:</label>
          <input
            type="number"
            min={1}
            max={20}
            value={nextCount}
            onChange={(e) => setNextCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 5)))}
            className="input-base w-20 text-center"
          />
        </div>
        <ExecuteButton onClick={handleParse} loading={loading} label="Parse" />
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-5">
          <div className="bg-secondary rounded-lg p-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Description</p>
              <p className="text-foreground font-medium">{result.description}</p>
            </div>
            <button
              onClick={() => copyText(result.expression, 'expr')}
              className="shrink-0 p-2 hover:bg-primary/10 rounded transition-colors"
              title="Copy expression"
            >
              {copiedToken === 'expr' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            </button>
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2">Fields</p>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(result.fields).map(([field, val]) => (
                <div key={field} className="bg-secondary rounded-lg px-3 py-2 text-center min-w-16">
                  <p className="font-mono text-base font-bold text-primary">{val}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{fieldLabels[field]}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2">
              Next {result.nextRuns.length} run{result.nextRuns.length !== 1 ? 's' : ''}
            </p>
            <div className="space-y-1">
              {result.nextRuns.map((run, i) => (
                <div key={i} className="bg-secondary rounded-lg px-4 py-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground w-6 shrink-0">{i + 1}.</span>
                  <span className="font-mono flex-1">{new Date(run).toLocaleString()}</span>
                  <button
                    onClick={() => copyText(run, `run-${i}`)}
                    className="p-1 hover:bg-primary/10 rounded ml-2"
                  >
                    {copiedToken === `run-${i}` ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
