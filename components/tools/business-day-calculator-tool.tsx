'use client'
import { useState } from 'react'
import { useToolApi, ExecuteButton } from './base/tool-layout'

export function BusinessDayCalculatorTool() {
  const today = new Date().toISOString().split('T')[0]!
  const [startDate, setStartDate] = useState(today)
  const [days, setDays] = useState(10)
  const [holidays, setHolidays] = useState('')
  const [result, setResult] = useState<Record<string, string | number> | null>(null)
  const { loading, error, call } = useToolApi('business-day-calculator')

  const handleRun = async () => {
    const res = await call({ startDate, days, holidays })
    if (res) setResult(res as Record<string, string | number>)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input-base w-full"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Business Days</label>
          <input
            type="number"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            placeholder="Positive to add, negative to subtract"
            className="input-base w-full"
          />
          <p className="text-xs text-muted-foreground">Positive = add days, negative = subtract days</p>
        </div>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium">Holidays to Skip (optional)</label>
        <textarea
          value={holidays}
          onChange={(e) => setHolidays(e.target.value)}
          placeholder="2024-12-25, 2024-01-01, ..."
          rows={3}
          className="input-base w-full"
        />
        <p className="text-xs text-muted-foreground">Comma-separated dates in YYYY-MM-DD format</p>
      </div>
      <ExecuteButton onClick={handleRun} loading={loading} label="Calculate" />
      {error && <p className="text-destructive text-sm">{error}</p>}
      {result && (
        <div className="card-base p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Start Date</p>
              <p className="font-semibold">{String(result.startDate)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">End Date</p>
              <p className="font-semibold text-primary">{String(result.endDate)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Business Days</p>
              <p className="font-semibold">{String(result.businessDaysAdded)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Calendar Days</p>
              <p className="font-semibold">{String(result.totalCalendarDays)}</p>
            </div>
          </div>
          {Number(result.holidaysSkipped) > 0 && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              {result.holidaysSkipped} holiday(s) skipped
            </p>
          )}
        </div>
      )}
    </div>
  )
}
