'use client'

import { useState } from 'react'
import { Plus, Trash2, Copy, Check } from 'lucide-react'

interface Stop {
  color: string
  position: number
}

function buildCss(type: string, angle: number, stops: Stop[]): string {
  if (stops.length < 2) return ''
  const stopStr = stops.map((s) => `${s.color} ${s.position}%`).join(', ')
  return type === 'radial'
    ? `background: radial-gradient(circle, ${stopStr});`
    : `background: linear-gradient(${angle}deg, ${stopStr});`
}

export function CssGradientTool() {
  const [type, setType] = useState<'linear' | 'radial'>('linear')
  const [angle, setAngle] = useState(90)
  const [stops, setStops] = useState<Stop[]>([
    { color: '#6366f1', position: 0 },
    { color: '#ec4899', position: 100 },
  ])
  const [copied, setCopied] = useState(false)

  const css = buildCss(type, angle, stops)
  const gradient = css.replace('background: ', '').replace(';', '')

  const addStop = () => {
    const mid = stops.length > 1 ? Math.round((stops[stops.length - 2]!.position + stops[stops.length - 1]!.position) / 2) : 50
    setStops((s) => [...s, { color: '#ffffff', position: mid }])
  }

  const removeStop = (i: number) => setStops((s) => s.filter((_, idx) => idx !== i))
  const updateStop = (i: number, field: keyof Stop, val: string | number) =>
    setStops((s) => s.map((item, idx) => (idx === i ? { ...item, [field]: val } : item)))

  const copy = () => {
    navigator.clipboard.writeText(css)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block font-medium text-foreground mb-2">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className="input-base">
            <option value="linear">Linear</option>
            <option value="radial">Radial</option>
          </select>
        </div>
        {type === 'linear' && (
          <div>
            <label className="block font-medium text-foreground mb-2">Angle: {angle}°</label>
            <input
              type="range"
              min={0}
              max={360}
              value={angle}
              onChange={(e) => setAngle(parseInt(e.target.value))}
              className="w-full mt-3"
            />
          </div>
        )}
      </div>

      <div
        className="rounded-lg h-32 border border-border transition-all"
        style={{ background: gradient || 'var(--secondary)' }}
      />

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="font-medium text-foreground">Color Stops</label>
          <button onClick={addStop} className="btn-secondary text-sm flex items-center gap-1 px-3 py-1.5">
            <Plus size={14} /> Add Stop
          </button>
        </div>
        <div className="space-y-2">
          {stops.map((s, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="color"
                value={s.color.startsWith('#') && s.color.length === 7 ? s.color : '#ffffff'}
                onChange={(e) => updateStop(i, 'color', e.target.value)}
                className="h-9 w-12 rounded border border-border cursor-pointer p-0.5 bg-transparent shrink-0"
              />
              <input
                type="text"
                value={s.color}
                onChange={(e) => updateStop(i, 'color', e.target.value)}
                className="input-base font-mono flex-1"
              />
              <div className="flex items-center gap-2 w-32">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={s.position}
                  onChange={(e) => updateStop(i, 'position', parseInt(e.target.value) || 0)}
                  className="input-base font-mono w-16 text-center"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
              <button
                onClick={() => removeStop(i)}
                disabled={stops.length <= 2}
                className="p-2 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded transition-colors disabled:opacity-30"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {css && (
        <div className="bg-secondary rounded-lg p-4 space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">CSS</p>
          <p className="font-mono text-sm break-all">{css}</p>
          <button onClick={copy} className="btn-primary flex items-center gap-2">
            {copied ? <><Check size={16} className="text-green-400" /> Copied</> : <><Copy size={16} /> Copy CSS</>}
          </button>
        </div>
      )}
    </div>
  )
}
