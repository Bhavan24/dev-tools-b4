'use client'

import { useState } from 'react'
import { useToolApi, ToolShell, OutputPanel, ExecuteButton } from './base/tool-layout'

export function UrlSplitterTool() {
  const [url, setUrl] = useState('')
  const [result, setResult] = useState<unknown>(null)
  const { loading, error, copied, call, copy } = useToolApi('url-splitter')

  const handleExecute = async () => {
    const res = await call({ url })
    if (res !== null) setResult(res)
  }

  const handleCopy = () => {
    if (!result) return
    copy(JSON.stringify(result, null, 2))
  }

  return (
    <ToolShell
      left={
        <div className="space-y-3">
          <label className="block font-medium text-foreground">URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleExecute()}
            placeholder="https://example.com/path?query=value"
            className="input-base"
          />
          <ExecuteButton onClick={handleExecute} loading={loading} label="Parse URL" />
        </div>
      }
      right={<OutputPanel result={result} error={error} copied={copied} onCopy={handleCopy} />}
    />
  )
}
