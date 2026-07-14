'use client'
import { useState } from 'react'
import { useToolApi, ExecuteButton } from './base/tool-layout'

export function RelativeDateCalculatorTool() {
  const today = new Date().toISOString().split('T')[0]!
  const [tab, setTab] = useState<'diff' | 'add'>('diff')
  const [date1, setDate1] = useState(today)
  const [date2, setDate2] = useState(today)
  const [addDays, setAddDays] = useState(90)
  const [result, setResult] = useState<Record<string, string | number> | null>(null)
  const { loading, error, call } = useToolApi('relative-date-calculator')

  const handleRun = async () => {
    let payload: Record<string, unknown>
    if (tab === 'diff') {
      payload = { date1, date2, operation: 'diff' }
    } else {
      payload = { date1, operation: 'add', addDays }
    }
    const res = await call(payload)
    if (res) setResult(res as Record<string, string | number>)
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          onClick={() => { setTab('diff'); setResult(null) }}
          className={tab === 'diff' ? 'btn-primary' : 'btn-secondary'}
        >
          Date Difference
        </button>
        <button
          onClick={() => { setTab('add'); setResult(null) }}
          className={tab === 'add' ? 'btn-primary' : 'btn-secondary'}
        >
          Add / Subtract Days
        </button>
      </div>

      {tab === 'diff' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">From Date</label>
            <input type="date" value={date1} onChange={(e) => setDate1(e.target.value)} className="input-base w-full" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">To Date</label>
            <input type="date" value={date2} onChange={(e) => setDate2(e.target.value)} className="input-base w-full" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Start Date</label>
            <input type="date" value={date1} onChange={(e) => setDate1(e.target.value)} className="input-base w-full" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Days to Add</label>
            <input
              type="number"
              value={addDays}
              onChange={(e) => setAddDays(Number(e.target.value))}
              placeholder="Positive or negative"
              className="input-base w-full"
            />
            <p className="text-xs text-muted-foreground">Negative to go back in time</p>
          </div>
        </div>
      )}

      <ExecuteButton onClick={handleRun} loading={loading} label="Calculate" />
      {error && <p className="text-destructive text-sm">{error}</p>}
      {result && tab === 'diff' && (
        <div className="card-base p-6">
          <p className="text-center text-4xl font-bold text-primary mb-2">{String(result.absoluteDays)}</p>
          <p className="text-center text-muted-foreground mb-4">days</p>
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <p className="font-medium">{String(result.weeks)} wks {String(result.remainingDaysAfterWeeks)} days</p>
              <p className="text-xs text-muted-foreground">Weeks</p>
            </div>
            <div>
              <p className="font-medium">~{String(result.months)} months</p>
              <p className="text-xs text-muted-foreground">Approx.</p>
            </div>
            <div>
              <p className="font-medium">~{String(result.years)} years</p>
              <p className="text-xs text-muted-foreground">Approx.</p>
            </div>
          </div>
          {result.direction !== 'same' && (
            <p className="text-center text-xs text-muted-foreground mt-3">
              {result.date2} is {result.direction} relative to {result.date1}
            </p>
          )}
        </div>
      )}
      {result && tab === 'add' && (
        <div className="card-base p-6 text-center">
          <p className="text-muted-foreground text-sm mb-1">Result Date</p>
          <p className="text-3xl font-bold text-primary">{String(result.resultDate)}</p>
          <p className="text-muted-foreground mt-2">{String(result.resultReadable)}</p>
        </div>
      )}
    </div>
  )
}
