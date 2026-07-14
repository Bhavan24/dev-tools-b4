'use client'
import { useState, useRef, useCallback } from 'react'
import { Upload, Download, AlertCircle } from 'lucide-react'

const PRESET_SCALES = [1, 2, 3, 4]

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function SvgToPngTool() {
  const [svgSrc, setSvgSrc] = useState('')
  const [svgName, setSvgName] = useState('image')
  const [scale, setScale] = useState(2)
  const [transparentBg, setTransparentBg] = useState(true)
  const [pngUrl, setPngUrl] = useState<string | null>(null)
  const [pngSize, setPngSize] = useState<{ w: number; h: number; bytes: number } | null>(null)
  const [error, setError] = useState('')
  const [rendering, setRendering] = useState(false)
  const [dragging, setDragging] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const loadSvgFile = (file: File) => {
    if (!file.type.includes('svg') && !file.name.endsWith('.svg')) {
      setError('Please select an SVG file')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      setSvgSrc(e.target?.result as string)
      setSvgName(file.name.replace(/\.svg$/i, ''))
      setPngUrl(null)
      setError('')
    }
    reader.readAsText(file)
  }

  const render = useCallback(() => {
    if (!svgSrc.trim()) return
    setError('')
    setRendering(true)
    setPngUrl(null)

    // Parse intrinsic SVG size
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgSrc, 'image/svg+xml')
    const svgEl = doc.documentElement

    // Check for parse errors
    if (svgEl.tagName === 'parsererror' || doc.querySelector('parsererror')) {
      setError('Invalid SVG: could not parse the document')
      setRendering(false)
      return
    }

    const viewBox = svgEl.getAttribute('viewBox')
    let baseW = parseFloat(svgEl.getAttribute('width') ?? '0')
    let baseH = parseFloat(svgEl.getAttribute('height') ?? '0')

    if ((!baseW || !baseH) && viewBox) {
      const parts = viewBox.trim().split(/[\s,]+/).map(Number)
      if (parts.length === 4) { baseW = parts[2]!; baseH = parts[3]! }
    }
    if (!baseW) baseW = 300
    if (!baseH) baseH = 150

    const targetW = Math.round(baseW * scale)
    const targetH = Math.round(baseH * scale)

    const canvas = canvasRef.current!
    canvas.width = targetW
    canvas.height = targetH
    const ctx = canvas.getContext('2d')!

    if (!transparentBg) {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, targetW, targetH)
    } else {
      ctx.clearRect(0, 0, targetW, targetH)
    }

    // Blob URL approach - works cross-origin
    const blob = new Blob([svgSrc], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const img = new window.Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, targetW, targetH)
      URL.revokeObjectURL(url)

      canvas.toBlob((pngBlob) => {
        if (!pngBlob) { setError('Failed to generate PNG'); setRendering(false); return }
        const pngObjUrl = URL.createObjectURL(pngBlob)
        setPngUrl(pngObjUrl)
        setPngSize({ w: targetW, h: targetH, bytes: pngBlob.size })
        setRendering(false)
      }, 'image/png')
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      setError('Failed to render SVG - ensure it is valid and self-contained')
      setRendering(false)
    }
    img.src = url
  }, [svgSrc, scale, transparentBg])

  const download = () => {
    if (!pngUrl || !pngSize) return
    const a = document.createElement('a')
    a.href = pngUrl
    a.download = `${svgName}@${scale}x.png`
    a.click()
  }

  return (
    <div className="space-y-5">
      <canvas ref={canvasRef} className="hidden" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) loadSvgFile(f) }}
            onClick={() => !svgSrc && fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
              svgSrc ? 'border-border cursor-default' : 'cursor-pointer hover:border-primary/50 hover:bg-muted/50'
            } ${dragging ? 'border-primary bg-primary/5' : ''}`}
          >
            <input ref={fileRef} type="file" accept=".svg,image/svg+xml" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) loadSvgFile(f) }} />
            <Upload size={28} className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">{svgSrc ? 'SVG loaded' : 'Drop an SVG file, or click to browse'}</p>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Or paste SVG source</label>
            <textarea
              value={svgSrc}
              onChange={(e) => { setSvgSrc(e.target.value); setPngUrl(null); setError('') }}
              placeholder="<svg ...>...</svg>"
              className="input-base h-40 font-mono text-xs resize-none"
              spellCheck={false}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Scale</label>
            <div className="flex gap-2">
              {PRESET_SCALES.map((s) => (
                <button
                  key={s}
                  onClick={() => { setScale(s); setPngUrl(null) }}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    scale === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/70'
                  }`}
                >
                  {s}×
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Multiplies the SVG's intrinsic width/height. 2× is standard for HiDPI displays.
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={transparentBg} onChange={(e) => { setTransparentBg(e.target.checked); setPngUrl(null) }} className="rounded" />
            Transparent background
          </label>

          <button onClick={render} disabled={!svgSrc.trim() || rendering} className="btn-primary">
            {rendering ? 'Rendering...' : 'Render to PNG'}
          </button>

          {error && (
            <div className="flex items-start gap-2 text-destructive text-sm">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {pngUrl && pngSize && (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                {pngSize.w} × {pngSize.h}px - {formatBytes(pngSize.bytes)}
              </div>
              <img
                src={pngUrl}
                alt="png preview"
                className="rounded-lg border border-border max-h-48 object-contain bg-[repeating-conic-gradient(#80808020_0%_25%,transparent_0%_50%)_0_0/16px_16px]"
              />
              <button onClick={download} className="btn-primary flex items-center gap-2">
                <Download size={14} />
                Download PNG
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
