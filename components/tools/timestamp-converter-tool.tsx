'use client'

import { useState } from 'react'
import { useToolApi, ToolShell, OutputPanel, ExecuteButton } from './base/tool-layout'

export function TimestampConverterTool() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<unknown>(null)
  const { loading, error, copied, call, copy } = useToolApi('timestamp-converter')

  const handleExecute = async () => {
    const res = await call({ input })
    if (res !== null) setResult(res)
  }

  const handleCopy = () => {
    if (!result) return
    copy(typeof result === 'string' ? result : JSON.stringify(result, null, 2))
  }

  return (
    <ToolShell
      left={
        <div className="space-y-3">
          <label className="block font-medium text-foreground">Input</label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleExecute()}
            placeholder="Unix timestamp or ISO date (e.g. 1700000000 or 2023-11-14)"
            className="input-base"
          />
          <button
            onClick={() => setInput(String(Math.floor(Date.now() / 1000)))}
            className="btn-secondary text-sm w-full"
          >
            Use Current Time
          </button>
          <ExecuteButton onClick={handleExecute} loading={loading} label="Convert" />
        </div>
      }
      right={<OutputPanel result={result} error={error} copied={copied} onCopy={handleCopy} />}
    />
  )
}
