'use client'

import { useState } from 'react'
import { useToolApi, ExecuteButton } from './base/tool-layout'
import { CheckCircle, XCircle } from 'lucide-react'

function Badge({ pass }: { pass: boolean }) {
  return pass ? (
    <span className="flex items-center gap-1 text-green-600 font-medium text-sm">
      <CheckCircle size={14} /> Pass
    </span>
  ) : (
    <span className="flex items-center gap-1 text-red-500 font-medium text-sm">
      <XCircle size={14} /> Fail
    </span>
  )
}

interface ContrastResult {
  ratio: number
  ratioDisplay: string
  wcagAA: { normal: boolean; large: boolean; ui: boolean }
  wcagAAA: { normal: boolean; large: boolean }
  foreground: string
  background: string
}

export function ColorContrastTool() {
  const [fg, setFg] = useState('#1a1a1a')
  const [bg, setBg] = useState('#ffffff')
  const [result, setResult] = useState<ContrastResult | null>(null)
  const { loading, error, call } = useToolApi('color-contrast-checker')

  const handleCheck = async () => {
    const res = await call({ foreground: fg, background: bg })
    if (res !== null) setResult(res)
  }

  const ratioColor =
    result === null ? ''
    : result.ratio >= 7 ? 'text-green-600'
    : result.ratio >= 4.5 ? 'text-yellow-600'
    : 'text-red-500'

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block font-medium text-foreground mb-2">Foreground Color</label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={fg.startsWith('#') && fg.length === 7 ? fg : '#1a1a1a'}
              onChange={(e) => setFg(e.target.value)}
              className="h-10 w-12 rounded border border-border cursor-pointer p-0.5 bg-transparent"
            />
            <input
              type="text"
              value={fg}
              onChange={(e) => setFg(e.target.value)}
              placeholder="#1a1a1a"
              className="input-base font-mono flex-1"
            />
          </div>
        </div>
        <div>
          <label className="block font-medium text-foreground mb-2">Background Color</label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={bg.startsWith('#') && bg.length === 7 ? bg : '#ffffff'}
              onChange={(e) => setBg(e.target.value)}
              className="h-10 w-12 rounded border border-border cursor-pointer p-0.5 bg-transparent"
            />
            <input
              type="text"
              value={bg}
              onChange={(e) => setBg(e.target.value)}
              placeholder="#ffffff"
              className="input-base font-mono flex-1"
            />
          </div>
        </div>
      </div>

      {(fg.startsWith('#') || bg.startsWith('#')) && (
        <div
          className="rounded-lg p-6 text-center transition-colors"
          style={{ backgroundColor: bg, color: fg, border: '1px solid rgba(128,128,128,0.2)' }}
        >
          <p className="text-2xl font-bold">Preview Text</p>
          <p className="text-sm mt-1 opacity-80">The quick brown fox jumps over the lazy dog</p>
        </div>
      )}

      <ExecuteButton onClick={handleCheck} loading={loading} label="Check Contrast" />

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-600">{error}</div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="bg-secondary rounded-lg p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Contrast Ratio</p>
            <p className={`text-4xl font-bold ${ratioColor}`}>{result.ratioDisplay}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-foreground">WCAG AA</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Normal text (4.5:1)</span><Badge pass={result.wcagAA.normal} /></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Large text (3:1)</span><Badge pass={result.wcagAA.large} /></div>
                <div className="flex justify-between"><span className="text-muted-foreground">UI components (3:1)</span><Badge pass={result.wcagAA.ui} /></div>
              </div>
            </div>
            <div className="bg-secondary rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-foreground">WCAG AAA</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Normal text (7:1)</span><Badge pass={result.wcagAAA.normal} /></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Large text (4.5:1)</span><Badge pass={result.wcagAAA.large} /></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
