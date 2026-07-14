'use client'

import { useState } from 'react'
import { useToolApi, ToolShell, ExecuteButton } from './base/tool-layout'
import { Copy, Check } from 'lucide-react'

export function HexTextConverterTool() {
  const [input, setInput] = useState('')
  const [action, setAction] = useState<'encode' | 'decode'>('encode')
  const [separator, setSeparator] = useState(' ')
  const [result, setResult] = useState('')
  const { loading, error, copied, call, copy } = useToolApi('hex-text-converter')

  const handleConvert = async () => {
    const res = await call({ input, action, separator })
    if (res !== null) setResult(res.result ?? '')
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        {(['encode', 'decode'] as const).map((a) => (
          <button
            key={a}
            onClick={() => setAction(a)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              action === a ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-secondary'
            }`}
          >
            {a === 'encode' ? 'Text → Hex' : 'Hex → Text'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="block font-medium text-foreground">
            {action === 'encode' ? 'Input Text' : 'Hex Input'}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={action === 'encode' ? 'Hello, World!' : '48 65 6c 6c 6f'}
            className="input-base h-48 font-mono text-sm resize-none"
          />
          {action === 'encode' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Byte Separator</label>
              <select value={separator} onChange={(e) => setSeparator(e.target.value)} className="input-base">
                <option value=" ">Space</option>
                <option value="">None</option>
                <option value="-">Hyphen</option>
                <option value=":">Colon</option>
              </select>
            </div>
          )}
          <ExecuteButton onClick={handleConvert} loading={loading} label="Convert" />
        </div>

        <div className="space-y-3">
          <label className="block font-medium text-foreground">
            {action === 'encode' ? 'Hex Output' : 'Text Output'}
          </label>
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
