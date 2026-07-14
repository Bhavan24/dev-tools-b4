'use client'

import { useState } from 'react'
import { useToolApi, ExecuteButton } from './base/tool-layout'
import { Copy, Check } from 'lucide-react'

export function QueryStringParserTool() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<{ params: Record<string, string | string[]>; count: number } | null>(null)
  const { loading, error, copied, call, copy } = useToolApi('query-string-parser')

  const handleParse = async () => {
    const res = await call({ input })
    if (res !== null) setResult(res)
  }

  const handleCopy = () => {
    if (!result) return
    copy(JSON.stringify(result.params, null, 2))
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-medium text-foreground mb-2">Query String or URL</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleParse()}
          placeholder="?foo=1&bar=hello%20world or https://example.com/path?key=value"
          className="input-base font-mono text-sm"
        />
      </div>

      <ExecuteButton onClick={handleParse} loading={loading} label="Parse" />

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{result.count} parameter{result.count !== 1 ? 's' : ''} found</p>
            <button onClick={handleCopy} className="btn-secondary text-sm flex items-center gap-1 px-3 py-1.5">
              {copied ? <><Check size={14} className="text-green-500" /> Copied</> : <><Copy size={14} /> Copy JSON</>}
            </button>
          </div>
          <div className="space-y-2">
            {Object.entries(result.params).map(([key, val]) => (
              <div key={key} className="bg-secondary rounded-lg p-3 flex justify-between items-start text-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-primary font-mono break-all">{key}</p>
                  <p className="text-muted-foreground font-mono break-all mt-0.5">
                    {Array.isArray(val) ? (
                      <span>[{val.map((v, i) => <span key={i}>&quot;{v}&quot;{i < val.length - 1 ? ', ' : ''}</span>)}]</span>
                    ) : (
                      <>&quot;{val}&quot;</>
                    )}
                  </p>
                </div>
                {Array.isArray(val) && (
                  <span className="ml-3 shrink-0 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                    array ({val.length})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
