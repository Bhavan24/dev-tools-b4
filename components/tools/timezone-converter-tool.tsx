'use client'
import { useState } from 'react'
import { useToolApi, ExecuteButton } from './base/tool-layout'

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Vancouver',
  'America/Sao_Paulo',
  'America/Argentina/Buenos_Aires',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Rome',
  'Europe/Madrid',
  'Europe/Moscow',
  'Europe/Istanbul',
  'Africa/Cairo',
  'Africa/Lagos',
  'Africa/Johannesburg',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Dhaka',
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Pacific/Auckland',
  'Pacific/Honolulu',
]

export function TimezoneConverterTool() {
  const now = new Date()
  const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)

  const [datetime, setDatetime] = useState(localIso)
  const [fromTimezone, setFromTimezone] = useState('UTC')
  const [toTimezone, setToTimezone] = useState('America/New_York')
  const [result, setResult] = useState<Record<string, string> | null>(null)
  const { loading, error, call } = useToolApi('timezone-converter')

  const handleRun = async () => {
    const res = await call({ datetime, fromTimezone, toTimezone })
    if (res) setResult(res as Record<string, string>)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Date &amp; Time</label>
          <input
            type="datetime-local"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
            className="input-base w-full"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">From Timezone</label>
          <select
            value={fromTimezone}
            onChange={(e) => setFromTimezone(e.target.value)}
            className="input-base w-full"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">To Timezone</label>
          <select
            value={toTimezone}
            onChange={(e) => setToTimezone(e.target.value)}
            className="input-base w-full"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>
      </div>
      <ExecuteButton onClick={handleRun} loading={loading} label="Convert Timezone" />
      {error && <p className="text-destructive text-sm">{error}</p>}
      {result && (
        <div className="card-base p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Input ({result.inputTimezone})</p>
              <p className="text-xl font-semibold">{result.input}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Output ({result.outputTimezone})</p>
              <p className="text-xl font-semibold">{result.outputDatetime}</p>
              <p className="text-xs text-muted-foreground">UTC offset: {result.utcOffset}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">UTC: <span className="font-mono text-sm">{result.utcTime}</span></p>
          </div>
        </div>
      )}
    </div>
  )
}
