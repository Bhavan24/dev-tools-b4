'use client'

import { useState } from 'react'
import { Loader2, AlertCircle, Copy, Check } from 'lucide-react'

interface ColorToolsProps {
  toolId: string
}

export function ColorTools({ toolId }: ColorToolsProps) {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (toolId === 'rgb-to-hex') {
    return <RgbToHexTool onCopy={copyToClipboard} copied={copied} />
  } else if (toolId === 'hex-to-rgb') {
    return <HexToRgbTool onCopy={copyToClipboard} copied={copied} />
  } else if (toolId === 'color-code-picker') {
    return <ColorCodePickerTool onCopy={copyToClipboard} copied={copied} />
  }

  return null
}

function RgbToHexTool({ onCopy, copied }: { onCopy: (text: string) => void; copied: boolean }) {
  const [r, setR] = useState(100)
  const [g, setG] = useState(150)
  const [b, setB] = useState(200)
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleConvert = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/tools/rgb-to-hex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ r, g, b }),
      })
      if (!response.ok) throw new Error('Conversion failed')
      const data = await response.json()
      setResult(data.result)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const hexColor = result || '#000000'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div>
          <label className="block font-medium text-foreground mb-2">Red (0-255)</label>
          <div className="flex gap-3 items-center">
            <input
              type="range"
              min={0}
              max={255}
              value={r}
              onChange={(e) => setR(parseInt(e.target.value))}
              className="flex-1"
            />
            <input
              type="number"
              min={0}
              max={255}
              value={r}
              onChange={(e) => setR(Math.max(0, Math.min(255, parseInt(e.target.value) || 0)))}
              className="input-base w-20"
            />
          </div>
        </div>
        <div>
          <label className="block font-medium text-foreground mb-2">Green (0-255)</label>
          <div className="flex gap-3 items-center">
            <input
              type="range"
              min={0}
              max={255}
              value={g}
              onChange={(e) => setG(parseInt(e.target.value))}
              className="flex-1"
            />
            <input
              type="number"
              min={0}
              max={255}
              value={g}
              onChange={(e) => setG(Math.max(0, Math.min(255, parseInt(e.target.value) || 0)))}
              className="input-base w-20"
            />
          </div>
        </div>
        <div>
          <label className="block font-medium text-foreground mb-2">Blue (0-255)</label>
          <div className="flex gap-3 items-center">
            <input
              type="range"
              min={0}
              max={255}
              value={b}
              onChange={(e) => setB(parseInt(e.target.value))}
              className="flex-1"
            />
            <input
              type="number"
              min={0}
              max={255}
              value={b}
              onChange={(e) => setB(Math.max(0, Math.min(255, parseInt(e.target.value) || 0)))}
              className="input-base w-20"
            />
          </div>
        </div>

        <button
          onClick={handleConvert}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : 'Convert to HEX'}
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <div
            className="w-full h-40 rounded-lg border border-border shadow-sm"
            style={{ backgroundColor: `rgb(${r}, ${g}, ${b})` }}
          />
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
            <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-2">
            <div className="bg-secondary rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">HEX Color</p>
              <div className="flex items-center justify-between">
                <p className="font-mono text-lg font-semibold">{result}</p>
                <button
                  onClick={() => onCopy(result)}
                  className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                  title="Copy"
                >
                  {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                </button>
              </div>
            </div>
            <div className="bg-secondary rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">RGB</p>
              <p className="font-mono">
                rgb({r}, {g}, {b})
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function HexToRgbTool({ onCopy, copied }: { onCopy: (text: string) => void; copied: boolean }) {
  const [hex, setHex] = useState('#6496C8')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleConvert = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/tools/hex-to-rgb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hex }),
      })
      if (!response.ok) throw new Error('Conversion failed')
      const data = await response.json()
      setResult(data.result)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div>
          <label className="block font-medium text-foreground mb-3">HEX Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              className="w-16 h-10 rounded-lg border border-border cursor-pointer"
            />
            <input
              type="text"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              className="input-base flex-1 font-mono"
              placeholder="#000000"
            />
          </div>
        </div>

        <button
          onClick={handleConvert}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : 'Convert to RGB'}
        </button>
      </div>

      <div className="space-y-4">
        {result && (
          <div className="space-y-3">
            <div
              className="w-full h-40 rounded-lg border border-border shadow-sm"
              style={{ backgroundColor: hex }}
            />
            <div className="bg-secondary rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">RGB Values</p>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex justify-between items-center">
                  <span>Red: {result.r}</span>
                  <button
                    onClick={() => onCopy(String(result.r))}
                    className="p-1 hover:bg-primary/10 rounded"
                  >
                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span>Green: {result.g}</span>
                  <button
                    onClick={() => onCopy(String(result.g))}
                    className="p-1 hover:bg-primary/10 rounded"
                  >
                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span>Blue: {result.b}</span>
                  <button
                    onClick={() => onCopy(String(result.b))}
                    className="p-1 hover:bg-primary/10 rounded"
                  >
                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                </div>
                <div className="border-t border-border pt-2 flex justify-between items-center">
                  <span>{result.rgb}</span>
                  <button
                    onClick={() => onCopy(result.rgb)}
                    className="p-1 hover:bg-primary/10 rounded"
                  >
                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
            <AlertCircle size={18} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {!result && !error && (
          <div className="h-full flex items-center justify-center text-muted-foreground text-center">
            Select a color and click Convert
          </div>
        )}
      </div>
    </div>
  )
}

function ColorCodePickerTool({
  onCopy,
  copied,
}: {
  onCopy: (text: string) => void
  copied: boolean
}) {
  const [color, setColor] = useState('#FF5733')
  const [format, setFormat] = useState<'hex' | 'rgb' | 'hsl'>('hex')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleConvert = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/tools/color-code-picker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ color, to: format }),
      })
      if (!response.ok) throw new Error('Conversion failed')
      const data = await response.json()
      setResult(data.result)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div>
          <label className="block font-medium text-foreground mb-3">Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-16 h-10 rounded-lg border border-border cursor-pointer"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="input-base flex-1 font-mono"
              placeholder="#000000"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium text-foreground mb-3">Target Format</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as 'hex' | 'rgb' | 'hsl')}
            className="input-base w-full"
          >
            <option value="hex">HEX</option>
            <option value="rgb">RGB</option>
            <option value="hsl">HSL</option>
          </select>
        </div>

        <button
          onClick={handleConvert}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : 'Convert'}
        </button>
      </div>

      <div className="space-y-4">
        {result && (
          <div className="space-y-3">
            <div
              className="w-full h-40 rounded-lg border border-border shadow-sm"
              style={{ backgroundColor: color }}
            />
            <div className="bg-secondary rounded-lg p-4 space-y-2">
              {result.hex && (
                <div className="flex justify-between items-center font-mono text-sm">
                  <span>HEX: {result.hex}</span>
                  <button
                    onClick={() => onCopy(result.hex)}
                    className="p-1 hover:bg-primary/10 rounded"
                  >
                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                </div>
              )}
              {result.rgb && (
                <div className="flex justify-between items-center font-mono text-sm">
                  <span>RGB: {result.rgb}</span>
                  <button
                    onClick={() => onCopy(result.rgb)}
                    className="p-1 hover:bg-primary/10 rounded"
                  >
                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                </div>
              )}
              {result.hsl && (
                <div className="flex justify-between items-center font-mono text-sm">
                  <span>HSL: {result.hsl}</span>
                  <button
                    onClick={() => onCopy(result.hsl)}
                    className="p-1 hover:bg-primary/10 rounded"
                  >
                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
            <AlertCircle size={18} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {!result && !error && (
          <div className="h-full flex items-center justify-center text-muted-foreground text-center">
            Select a color and format, then click Convert
          </div>
        )}
      </div>
    </div>
  )
}
