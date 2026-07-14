'use client'

import { useState } from 'react'
import { useToolApi, ExecuteButton } from './base/tool-layout'
import { Copy, Check } from 'lucide-react'

export function LoremIpsumTool() {
  const [type, setType] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs')
  const [count, setCount] = useState(3)
  const [style, setStyle] = useState<'lorem' | 'english'>('lorem')
  const [result, setResult] = useState('')
  const { loading, error, copied, call, copy } = useToolApi('lorem-ipsum-generator')

  const handleGenerate = async () => {
    const res = await call({ type, count, style })
    if (res !== null) setResult(res.text ?? '')
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block font-medium text-foreground mb-2">Unit</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as typeof type)}
            className="input-base"
          >
            <option value="paragraphs">Paragraphs</option>
            <option value="sentences">Sentences</option>
            <option value="words">Words</option>
          </select>
        </div>
        <div>
          <label className="block font-medium text-foreground mb-2">Count</label>
          <input
            type="number"
            min={1}
            max={50}
            value={count}
            onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
            className="input-base"
          />
        </div>
        <div>
          <label className="block font-medium text-foreground mb-2">Style</label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value as typeof style)}
            className="input-base"
          >
            <option value="lorem">Classic Latin</option>
            <option value="english">Random English</option>
          </select>
        </div>
      </div>

      <ExecuteButton onClick={handleGenerate} loading={loading} label="Generate" />

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-3">
          <div className="bg-secondary rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap max-h-96 overflow-auto">
            {result}
          </div>
          <button
            onClick={() => copy(result)}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check size={18} className="text-green-500" />
                Copied
              </>
            ) : (
              <>
                <Copy size={18} />
                Copy Text
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
