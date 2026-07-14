'use client'

import { useState } from 'react'
import { useToolApi, ExecuteButton } from './base/tool-layout'
import { Copy, Check } from 'lucide-react'

interface ColorEntry {
  hex: string
  rgb: string
  hsl: string
}

interface PaletteResult {
  base: ColorEntry
  complementary: ColorEntry[]
  analogous: ColorEntry[]
  triadic: ColorEntry[]
  tetradic: ColorEntry[]
  shades: ColorEntry[]
}

function ColorSwatch({ color, label }: { color: ColorEntry; label?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(color.hex)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      onClick={copy}
      title={`${color.hex} - click to copy`}
      className="group flex flex-col items-center gap-1 focus:outline-none"
    >
      <div
        className="w-12 h-12 rounded-lg border border-border/50 shadow-sm group-hover:scale-110 transition-transform flex items-center justify-center"
        style={{ backgroundColor: color.hex }}
      >
        {copied && <Check size={14} className="text-white drop-shadow" />}
      </div>
      <span className="font-mono text-xs text-muted-foreground group-hover:text-foreground transition-colors">
        {label ?? color.hex}
      </span>
    </button>
  )
}

function PaletteRow({ title, colors }: { title: string; colors: ColorEntry[] }) {
  const [copiedAll, setCopiedAll] = useState(false)
  const copyAll = () => {
    navigator.clipboard.writeText(colors.map((c) => c.hex).join(', '))
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 1500)
  }
  return (
    <div className="bg-secondary rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <button onClick={copyAll} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
          {copiedAll ? <><Check size={12} className="text-green-500" /> Copied</> : <><Copy size={12} /> Copy all</>}
        </button>
      </div>
      <div className="flex gap-3 flex-wrap">
        {colors.map((c, i) => <ColorSwatch key={i} color={c} />)}
      </div>
      <div className="space-y-1">
        {colors.map((c, i) => (
          <p key={i} className="font-mono text-xs text-muted-foreground">
            {c.hex} &nbsp; {c.rgb} &nbsp; {c.hsl}
          </p>
        ))}
      </div>
    </div>
  )
}

export function ColorPaletteTool() {
  const [color, setColor] = useState('#3b82f6')
  const [result, setResult] = useState<PaletteResult | null>(null)
  const { loading, error, call } = useToolApi('color-palette-generator')

  const handleGenerate = async () => {
    const res = await call({ color })
    if (res !== null) setResult(res)
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-medium text-foreground mb-2">Base Color</label>
        <div className="flex gap-3 items-center">
          <input
            type="color"
            value={color.startsWith('#') && color.length === 7 ? color : '#3b82f6'}
            onChange={(e) => setColor(e.target.value)}
            className="h-10 w-14 rounded border border-border cursor-pointer p-0.5 bg-transparent"
          />
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="#3b82f6 or rgb(59, 130, 246)"
            className="input-base font-mono flex-1"
          />
        </div>
      </div>

      <ExecuteButton onClick={handleGenerate} loading={loading} label="Generate Palettes" />

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-600">{error}</div>
      )}

      {result && (
        <div className="space-y-4">
          <PaletteRow title="Complementary" colors={result.complementary} />
          <PaletteRow title="Analogous" colors={result.analogous} />
          <PaletteRow title="Triadic" colors={result.triadic} />
          <PaletteRow title="Tetradic" colors={result.tetradic} />
          <PaletteRow title="Shades" colors={result.shades} />
        </div>
      )}
    </div>
  )
}
