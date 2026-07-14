'use client'
import { useState } from 'react'
import { useToolApi, ExecuteButton } from './base/tool-layout'

export function Iso8601ConverterTool() {
  const [inputVal, setInputVal] = useState('')
  const [outputFormat, setOutputFormat] = useState('all')
  const [result, setResult] = useState<Record<string, string | number> | null>(null)
  const { loading, error, call } = useToolApi('iso8601-converter')

  const handleRun = async () => {
    const res = await call({ input: inputVal, outputFormat })
    if (res) setResult(res as Record<string, string | number>)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium">Date / Time String</label>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="e.g. 2024-01-15T10:30:00Z, Jan 15 2024, 1705312200"
          className="input-base w-full"
        />
        <p className="text-xs text-muted-foreground">Accepts ISO 8601, RFC 2822, Unix timestamp, or any recognizable date string.</p>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium">Output Format</label>
        <select
          value={outputFormat}
          onChange={(e) => setOutputFormat(e.target.value)}
          className="input-base w-full"
        >
          <option value="all">All Formats</option>
          <option value="iso8601">ISO 8601</option>
          <option value="rfc2822">RFC 2822</option>
          <option value="human">Human Readable</option>
        </select>
      </div>
      <ExecuteButton onClick={handleRun} loading={loading} label="Convert" />
      {error && <p className="text-destructive text-sm">{error}</p>}
      {result && (
        <div className="card-base p-6 space-y-4">
          {result.iso8601 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">ISO 8601</p>
              <p className="font-mono text-sm bg-muted px-3 py-2 rounded">{String(result.iso8601)}</p>
            </div>
          )}
          {result.rfc2822 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">RFC 2822</p>
              <p className="font-mono text-sm bg-muted px-3 py-2 rounded">{String(result.rfc2822)}</p>
            </div>
          )}
          {result.human && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Human Readable</p>
              <p className="font-mono text-sm bg-muted px-3 py-2 rounded">{String(result.human)}</p>
            </div>
          )}
          {result.unix !== undefined && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Unix Timestamp</p>
              <p className="font-mono text-sm bg-muted px-3 py-2 rounded">{String(result.unix)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
