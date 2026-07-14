'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

function rot13(text: string) {
  return text.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= 'Z' ? 65 : 97
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base)
  })
}

export function Rot13Tool() {
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState(false)

  const output = rot13(input)

  const copy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const swap = () => setInput(output)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block font-medium text-foreground mb-2">Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste text to apply ROT13..."
            className="input-base h-48 font-mono text-sm resize-none"
          />
        </div>
        <div>
          <label className="block font-medium text-foreground mb-2">Output</label>
          <textarea
            value={output}
            readOnly
            className="input-base h-48 font-mono text-sm resize-none bg-secondary"
          />
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={copy} disabled={!output} className="btn-primary flex items-center gap-2">
          {copied ? <><Check size={16} className="text-green-400" /> Copied</> : <><Copy size={16} /> Copy Output</>}
        </button>
        <button onClick={swap} disabled={!output} className="btn-secondary">
          Use Output as Input
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        ROT13 is its own inverse - applying it twice returns the original text.
      </p>
    </div>
  )
}
