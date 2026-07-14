'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

type Action = 'sort-asc' | 'sort-desc' | 'reverse' | 'deduplicate' | 'shuffle' | 'number' | 'trim' | 'remove-empty'

function applyAction(text: string, action: Action): string {
  let lines = text.split('\n')
  switch (action) {
    case 'sort-asc': return [...lines].sort((a, b) => a.localeCompare(b)).join('\n')
    case 'sort-desc': return [...lines].sort((a, b) => b.localeCompare(a)).join('\n')
    case 'reverse': return [...lines].reverse().join('\n')
    case 'deduplicate': return [...new Set(lines)].join('\n')
    case 'shuffle': {
      const arr = [...lines]
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
      }
      return arr.join('\n')
    }
    case 'number': return lines.map((l, i) => `${i + 1}. ${l}`).join('\n')
    case 'trim': return lines.map((l) => l.trim()).join('\n')
    case 'remove-empty': return lines.filter((l) => l.trim() !== '').join('\n')
    default: return text
  }
}

const ACTIONS: { value: Action; label: string }[] = [
  { value: 'sort-asc', label: 'Sort A → Z' },
  { value: 'sort-desc', label: 'Sort Z → A' },
  { value: 'reverse', label: 'Reverse Order' },
  { value: 'deduplicate', label: 'Remove Duplicates' },
  { value: 'shuffle', label: 'Shuffle' },
  { value: 'number', label: 'Number Lines' },
  { value: 'trim', label: 'Trim Whitespace' },
  { value: 'remove-empty', label: 'Remove Empty Lines' },
]

export function LineUtilitiesTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [activeAction, setActiveAction] = useState<Action>('sort-asc')
  const [copied, setCopied] = useState(false)

  const apply = (action: Action) => {
    setActiveAction(action)
    if (input) setOutput(applyAction(input, action))
  }

  const copy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const inputLines = input ? input.split('\n').length : 0
  const outputLines = output ? output.split('\n').length : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {ACTIONS.map((a) => (
          <button
            key={a.value}
            onClick={() => apply(a.value)}
            className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
              activeAction === a.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border hover:bg-secondary'
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="font-medium text-foreground">Input</label>
            {inputLines > 0 && (
              <span className="text-xs text-muted-foreground">{inputLines} line{inputLines !== 1 ? 's' : ''}</span>
            )}
          </div>
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              if (e.target.value) setOutput(applyAction(e.target.value, activeAction))
              else setOutput('')
            }}
            placeholder="Paste lines here..."
            className="input-base h-72 font-mono text-sm resize-none"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="font-medium text-foreground">Output</label>
            {outputLines > 0 && (
              <span className="text-xs text-muted-foreground">{outputLines} line{outputLines !== 1 ? 's' : ''}</span>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Result will appear here..."
            className="input-base h-72 font-mono text-sm resize-none bg-secondary"
          />
        </div>
      </div>

      <div className="flex gap-3">
        {output && (
          <>
            <button onClick={copy} className="btn-primary flex items-center gap-2">
              {copied ? <><Check size={16} className="text-green-400" /> Copied</> : <><Copy size={16} /> Copy Output</>}
            </button>
            <button onClick={() => setInput(output)} className="btn-secondary">
              Use as Input
            </button>
          </>
        )}
      </div>
    </div>
  )
}
