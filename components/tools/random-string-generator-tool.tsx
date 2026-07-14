'use client'

import { useState } from 'react'
import { Copy, Check, RefreshCw } from 'lucide-react'

const CHARSETS: Record<string, string> = {
  alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  numeric: '0123456789',
  hex: '0123456789abcdef',
  base58: '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',
}

function generate(length: number, count: number, charset: string, custom: string): string[] {
  const pool = charset === 'custom' ? (custom || CHARSETS.alphanumeric) : (CHARSETS[charset] ?? CHARSETS.alphanumeric)
  const len = Math.max(1, Math.min(length, 1024))
  const n = Math.max(1, Math.min(count, 100))
  return Array.from({ length: n }, () =>
    Array.from({ length: len }, () => pool[Math.floor(Math.random() * pool.length)]).join('')
  )
}

export function RandomStringGeneratorTool() {
  const [length, setLength] = useState(16)
  const [count, setCount] = useState(5)
  const [charset, setCharset] = useState('alphanumeric')
  const [custom, setCustom] = useState('')
  const [strings, setStrings] = useState<string[]>([])
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const [copiedAll, setCopiedAll] = useState(false)

  const handleGenerate = () => setStrings(generate(length, count, charset, custom))

  const copyOne = (s: string, i: number) => {
    navigator.clipboard.writeText(s)
    setCopiedIdx(i)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  const copyAll = () => {
    navigator.clipboard.writeText(strings.join('\n'))
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <label className="block font-medium text-foreground mb-2">Length</label>
          <input
            type="number"
            min={1}
            max={1024}
            value={length}
            onChange={(e) => setLength(Math.max(1, parseInt(e.target.value) || 16))}
            className="input-base"
          />
        </div>
        <div>
          <label className="block font-medium text-foreground mb-2">Count</label>
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 5)))}
            className="input-base"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block font-medium text-foreground mb-2">Character Set</label>
          <select value={charset} onChange={(e) => setCharset(e.target.value)} className="input-base">
            <option value="alphanumeric">Alphanumeric (A-Z a-z 0-9)</option>
            <option value="alpha">Alpha only (A-Z a-z)</option>
            <option value="numeric">Numeric only (0-9)</option>
            <option value="hex">Hex (0-9 a-f)</option>
            <option value="base58">Base58</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </div>

      {charset === 'custom' && (
        <div>
          <label className="block font-medium text-foreground mb-2">Custom Characters</label>
          <input
            type="text"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Enter characters to use (e.g. abc123!@#)"
            className="input-base font-mono"
          />
        </div>
      )}

      <button onClick={handleGenerate} className="btn-primary flex items-center gap-2">
        <RefreshCw size={16} />
        Generate
      </button>

      {strings.length > 0 && (
        <div className="space-y-3">
          <div className="space-y-2">
            {strings.map((s, i) => (
              <div key={i} className="bg-secondary rounded-lg px-4 py-2 flex items-center justify-between gap-3">
                <span className="font-mono text-sm break-all flex-1">{s}</span>
                <button onClick={() => copyOne(s, i)} className="shrink-0 p-1.5 hover:bg-primary/10 rounded transition-colors">
                  {copiedIdx === i ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
              </div>
            ))}
          </div>
          <button onClick={copyAll} className="btn-secondary w-full flex items-center justify-center gap-2">
            {copiedAll ? <><Check size={16} className="text-green-500" /> All Copied</> : <><Copy size={16} /> Copy All</>}
          </button>
        </div>
      )}
    </div>
  )
}
