'use client'

import { useState } from 'react'
import { useToolApi, ToolShell, OutputPanel, ExecuteButton } from './base/tool-layout'

export function MimeTypeCheckerTool() {
  const [filename, setFilename] = useState('')
  const [result, setResult] = useState<unknown>(null)
  const { loading, error, copied, call, copy } = useToolApi('mime-type-checker')

  const handleExecute = async () => {
    const res = await call({ filename })
    if (res !== null) setResult(res)
  }

  const handleCopy = () => {
    if (!result) return
    copy(String(result))
  }

  return (
    <ToolShell
      left={
        <div className="space-y-3">
          <label className="block font-medium text-foreground">Filename</label>
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleExecute()}
            placeholder="filename.ext"
            className="input-base"
          />
          <ExecuteButton onClick={handleExecute} loading={loading} label="Check MIME Type" />
        </div>
      }
      right={
        <OutputPanel result={result} error={error} copied={copied} onCopy={handleCopy} />
      }
    />
  )
}
