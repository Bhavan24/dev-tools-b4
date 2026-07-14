'use client'

import { useState } from 'react'
import { useToolApi, ExecuteButton } from './base/tool-layout'
import { Copy, Check } from 'lucide-react'

const ACTIONS = [
  { value: 'to-js', label: 'Text → \\uXXXX (JS)' },
  { value: 'to-python', label: 'Text → \\UXXXXXXXX (Python)' },
  { value: 'to-codepoints', label: 'Text → U+XXXX (Codepoints)' },
  { value: 'to-html', label: 'Text → &#DDDD; (HTML)' },
  { value: 'unescape', label: 'Escapes → Text (Unescape)' },
]

export function UnicodeEscapeTool() {
  const [input, setInput] = useState('')
  const [action, setAction] = useState('to-js')
  const [result, setResult] = useState('')
  const { loading, error, copied, call, copy } = useToolApi('unicode-escape-converter')

  const handleConvert = async () => {
    const res = await call({ input, action })
    if (res !== null) setResult(res.result ?? '')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {ACTIONS.map((a) => (
          <button
            key={a.value}
            onClick={() => setAction(a.value)}
            className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
              action === a.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border hover:bg-secondary'
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="block font-medium text-foreground">Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={action === 'unescape' ? '\\u0048\\u0065\\u006C\\u006C\\u006F' : 'Hello, 世界! 🌍'}
            className="input-base h-48 font-mono text-sm resize-none"
          />
          <ExecuteButton onClick={handleConvert} loading={loading} label="Convert" />
        </div>

        <div className="space-y-3">
          <label className="block font-medium text-foreground">Output</label>
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-600">{error}</div>
          )}
          {result ? (
            <>
              <div className="bg-secondary rounded-lg p-4 font-mono text-sm h-48 overflow-auto">
                <pre className="whitespace-pre-wrap break-all">{result}</pre>
              </div>
              <button onClick={() => copy(result)} className="btn-secondary w-full flex items-center justify-center gap-2">
                {copied ? <><Check size={16} className="text-green-500" /> Copied</> : <><Copy size={16} /> Copy</>}
              </button>
            </>
          ) : (
            <div className="bg-secondary rounded-lg p-4 h-48 flex items-center justify-center text-muted-foreground text-sm">
              Result will appear here
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
