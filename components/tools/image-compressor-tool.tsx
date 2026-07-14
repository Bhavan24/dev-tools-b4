'use client'
import { useState, useRef, useCallback } from 'react'
import { Upload, Download, ArrowRight } from 'lucide-react'

interface ImageState {
  src: string
  sizeBytes: number
  width: number
  height: number
  name: string
  mimeType: string
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function base64ToBytes(b64: string): number {
  // base64 length → approx byte count
  const padding = (b64.match(/=+$/) ?? [''])[0]!.length
  return Math.floor((b64.length * 3) / 4) - padding
}

export function ImageCompressorTool() {
  const [original, setOriginal] = useState<ImageState | null>(null)
  const [compressed, setCompressed] = useState<ImageState | null>(null)
  const [quality, setQuality] = useState(80)
  const [dragging, setDragging] = useState(false)
  const [compressing, setCompressing] = useState(false)
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
          sizeBytes: file.size,
          width: img.naturalWidth,
          height: img.naturalHeight,
          name: file.name,
          mimeType: file.type,
        })
        setCompressed(null)
      }
      img.src = src
    }
    reader.readAsDataURL(file)
  }, [])

  const compress = useCallback(() => {
    if (!original) return
    setCompressing(true)

    const canvas = canvasRef.current!
    const img = new window.Image()
    img.onload = () => {
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)

      // For PNG, canvas.toDataURL with quality doesn't shrink; use JPEG/WebP output
      const outputMime =
        original.mimeType === 'image/png' ? 'image/png' :
        original.mimeType === 'image/webp' ? 'image/webp' :
        'image/jpeg'

      const q = quality / 100
      const dataUrl = canvas.toDataURL(outputMime, q)
      const b64 = dataUrl.split(',')[1]!
      const sizeBytes = base64ToBytes(b64)

      setCompressed({
        src: dataUrl,
        sizeBytes,
        width: img.naturalWidth,
        height: img.naturalHeight,
        name: original.name,
        mimeType: outputMime,
      })
      setCompressing(false)
    }
    img.src = original.src
  }, [original, quality])

  const download = () => {
    if (!compressed) return
    const a = document.createElement('a')
    const ext = compressed.mimeType === 'image/png' ? 'png' : compressed.mimeType === 'image/webp' ? 'webp' : 'jpg'
    a.href = compressed.src
    a.download = compressed.name.replace(/\.[^.]+$/, `_compressed.${ext}`)
    a.click()
  }

  const savings = compressed && original
    ? Math.round((1 - compressed.sizeBytes / original.sizeBytes) * 100)
    : 0

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
            <button
              onClick={() => { setOriginal(null); setCompressed(null) }}
              className="btn-secondary text-sm"
            >
              Load different image
            </button>
            <span className="text-sm text-muted-foreground font-mono">{original.name}</span>
            <span className="text-sm text-muted-foreground">{original.width} × {original.height}px</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <label className="font-medium">Quality: {quality}%</label>
              <span className="text-muted-foreground text-xs">
                {original.mimeType === 'image/png' ? 'PNG compression level' : 'JPEG/WebP quality'}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={100}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Smaller file</span>
              <span>Higher quality</span>
            </div>
          </div>

          <button onClick={compress} disabled={compressing} className="btn-primary">
            {compressing ? 'Compressing...' : 'Compress Image'}
          </button>

          {compressed && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="text-muted-foreground text-xs">Original</p>
                  <p className="font-semibold">{formatBytes(original.sizeBytes)}</p>
                </div>
                <ArrowRight size={16} className="text-muted-foreground" />
                <div className="text-center">
                  <p className="text-muted-foreground text-xs">Compressed</p>
                  <p className="font-semibold">{formatBytes(compressed.sizeBytes)}</p>
                </div>
                {savings > 0 && (
                  <span className="bg-green-500/15 text-green-600 dark:text-green-400 px-2 py-0.5 rounded text-xs font-semibold">
                    -{savings}% smaller
                  </span>
                )}
                {savings <= 0 && (
                  <span className="bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded text-xs font-semibold">
                    No reduction at this quality
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Original</p>
                  <img src={original.src} alt="original" className="rounded-lg border border-border w-full object-contain max-h-64 bg-[repeating-conic-gradient(#80808020_0%_25%,transparent_0%_50%)_0_0/16px_16px]" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Compressed</p>
                  <img src={compressed.src} alt="compressed" className="rounded-lg border border-border w-full object-contain max-h-64 bg-[repeating-conic-gradient(#80808020_0%_25%,transparent_0%_50%)_0_0/16px_16px]" />
                </div>
              </div>

              <button onClick={download} className="btn-primary flex items-center gap-2">
                <Download size={14} />
                Download Compressed Image
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
