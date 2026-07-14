'use client'
import { useState } from 'react'
import { useToolApi, ExecuteButton } from './base/tool-layout'

export function AgeCalculatorTool() {
  const today = new Date().toISOString().split('T')[0]!
  const [birthdate, setBirthdate] = useState('1990-01-01')
  const [referenceDate, setReferenceDate] = useState('')
  const [result, setResult] = useState<Record<string, string | number> | null>(null)
  const { loading, error, call } = useToolApi('age-calculator')

  const handleRun = async () => {
    const payload: Record<string, string> = { birthdate }
    if (referenceDate) payload.referenceDate = referenceDate
    const res = await call(payload)
    if (res) setResult(res as Record<string, string | number>)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Birthdate</label>
          <input
            type="date"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            className="input-base w-full"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Reference Date (optional)</label>
          <input
            type="date"
            value={referenceDate}
            onChange={(e) => setReferenceDate(e.target.value)}
            placeholder={`Default: today (${today})`}
            className="input-base w-full"
          />
          <p className="text-xs text-muted-foreground">Leave blank to use today</p>
        </div>
      </div>
      <ExecuteButton onClick={handleRun} loading={loading} label="Calculate Age" />
      {error && <p className="text-destructive text-sm">{error}</p>}
      {result && (
        <div className="card-base p-6 space-y-4">
          <div className="flex justify-center gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-primary">{String(result.years)}</p>
              <p className="text-xs text-muted-foreground mt-1">Years</p>
            </div>
            <div>
              <p className="text-4xl font-bold">{String(result.months)}</p>
              <p className="text-xs text-muted-foreground mt-1">Months</p>
            </div>
            <div>
              <p className="text-4xl font-bold">{String(result.days)}</p>
              <p className="text-xs text-muted-foreground mt-1">Days</p>
            </div>
          </div>
          <div className="border-t border-border pt-4 grid grid-cols-2 gap-4 text-sm text-center">
            <div>
              <p className="font-medium">{String(result.totalDays).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</p>
              <p className="text-xs text-muted-foreground">Total days lived</p>
            </div>
            <div>
              <p className="font-medium">{String(result.daysUntilNextBirthday)} days</p>
              <p className="text-xs text-muted-foreground">Until next birthday ({String(result.nextBirthday)})</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
