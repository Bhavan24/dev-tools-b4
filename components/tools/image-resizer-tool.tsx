'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, Download, Link, Unlink } from 'lucide-react'

interface ImageState {
  src: string
  width: number
  height: number
  name: string
  mimeType: string
  sizeBytes: number
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

type Mode = 'pixels' | 'percent'

export function ImageResizerTool() {
  const [original, setOriginal] = useState<ImageState | null>(null)
  const [resized, setResized] = useState<ImageState | null>(null)
  const [mode, setMode] = useState<Mode>('pixels')
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const [percent, setPercent] = useState(50)
  const [lockAspect, setLockAspect] = useState(true)
  const [dragging, setDragging] = useState(false)
  const [resizing, setResizing] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const loadFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const src = e.target?.result as string
      const img = new window.Image()
      img.onload = () => {
        setOriginal({
          src,
          width: img.naturalWidth,
          height: img.naturalHeight,
          name: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
        })
        setWidth(img.naturalWidth)
        setHeight(img.naturalHeight)
        setResized(null)
      }
      img.src = src
    }
    reader.readAsDataURL(file)
  }, [])

  const handleWidthChange = (v: number) => {
    setWidth(v)
    if (lockAspect && original && v > 0) {
      setHeight(Math.round((v / original.width) * original.height))
    }
  }

  const handleHeightChange = (v: number) => {
    setHeight(v)
    if (lockAspect && original && v > 0) {
      setWidth(Math.round((v / original.height) * original.width))
    }
  }

  const resize = useCallback(() => {
    if (!original) return
    setResizing(true)

    const targetW = mode === 'percent' ? Math.round(original.width * (percent / 100)) : width
    const targetH = mode === 'percent' ? Math.round(original.height * (percent / 100)) : height

    if (targetW < 1 || targetH < 1) { setResizing(false); return }

    const canvas = canvasRef.current!
    canvas.width = targetW
    canvas.height = targetH
    const ctx = canvas.getContext('2d')!
    const img = new window.Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, targetW, targetH)
      const outputMime = original.mimeType === 'image/png' ? 'image/png' : original.mimeType === 'image/webp' ? 'image/webp' : 'image/jpeg'
      const dataUrl = canvas.toDataURL(outputMime, 0.92)
      const b64 = dataUrl.split(',')[1]!
      const padding = (b64.match(/=+$/) ?? [''])[0]!.length
      const sizeBytes = Math.floor((b64.length * 3) / 4) - padding
      setResized({ src: dataUrl, width: targetW, height: targetH, name: original.name, mimeType: outputMime, sizeBytes })
      setResizing(false)
    }
    img.src = original.src
  }, [original, mode, width, height, percent])

  const download = () => {
    if (!resized) return
    const ext = resized.mimeType === 'image/png' ? 'png' : resized.mimeType === 'image/webp' ? 'webp' : 'jpg'
    const a = document.createElement('a')
    a.href = resized.src
    a.download = resized.name.replace(/\.[^.]+$/, `_${resized.width}x${resized.height}.${ext}`)
    a.click()
  }

  return (
    <div className="space-y-6">
      <canvas ref={canvasRef} className="hidden" />

      {!original ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) loadFile(f) }}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
            dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'
          }`}
        >
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f) }} />
          <Upload size={36} className="mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium">Drop an image here, or click to browse</p>
          <p className="text-sm text-muted-foreground mt-1">JPEG, PNG, WebP - all processing runs in your browser</p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => { setOriginal(null); setResized(null) }} className="btn-secondary text-sm">
              Load different image
            </button>
            <span className="text-sm text-muted-foreground">
              {original.name} - {original.width} × {original.height}px - {formatBytes(original.sizeBytes)}
            </span>
          </div>

          <div className="flex gap-2">
            {(['pixels', 'percent'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setResized(null) }}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  mode === m ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/70'
                }`}
              >
                {m === 'pixels' ? 'Exact pixels' : 'Percentage'}
              </button>
            ))}
          </div>

          {mode === 'pixels' ? (
            <div className="flex flex-wrap items-center gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Width (px)</label>
                <input
                  type="number"
                  min={1}
                  value={width}
                  onChange={(e) => handleWidthChange(Number(e.target.value))}
                  className="input-base w-32 text-sm"
                />
              </div>
              <button
                onClick={() => setLockAspect((v) => !v)}
                className={`mt-5 p-2 rounded-lg border transition-colors ${lockAspect ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground'}`}
                title={lockAspect ? 'Aspect ratio locked' : 'Aspect ratio unlocked'}
              >
                {lockAspect ? <Link size={16} /> : <Unlink size={16} />}
              </button>
              <div className="space-y-1">
                <label className="text-sm font-medium">Height (px)</label>
                <input
                  type="number"
                  min={1}
                  value={height}
                  onChange={(e) => handleHeightChange(Number(e.target.value))}
                  className="input-base w-32 text-sm"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <label className="font-medium">Scale: {percent}%</label>
                <span className="text-muted-foreground">
                  {Math.round(original.width * percent / 100)} × {Math.round(original.height * percent / 100)}px
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={400}
                value={percent}
                onChange={(e) => { setPercent(Number(e.target.value)); setResized(null) }}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1%</span>
                <span>100%</span>
                <span>400%</span>
              </div>
            </div>
          )}

          <button onClick={resize} disabled={resizing} className="btn-primary">
            {resizing ? 'Resizing...' : 'Resize Image'}
          </button>

          {resized && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-6 text-sm items-center">
                <div>
                  <span className="text-muted-foreground">Result: </span>
                  <span className="font-semibold">{resized.width} × {resized.height}px</span>
                  <span className="text-muted-foreground ml-2">{formatBytes(resized.sizeBytes)}</span>
                </div>
              </div>
              <img src={resized.src} alt="resized" className="rounded-lg border border-border max-h-64 object-contain bg-[repeating-conic-gradient(#80808020_0%_25%,transparent_0%_50%)_0_0/16px_16px]" />
              <button onClick={download} className="btn-primary flex items-center gap-2">
                <Download size={14} />
                Download Resized Image
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
