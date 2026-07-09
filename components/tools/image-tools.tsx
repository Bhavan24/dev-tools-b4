'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import {
  Loader2,
  AlertCircle,
  Download,
  Upload,
  QrCode,
  Image as ImageIcon,
  Camera,
  Monitor,
  ScanLine,
  Copy,
  Check,
  Archive,
} from 'lucide-react'
import jsQR from 'jsqr'
import JSZip from 'jszip'

interface ImageToolsProps {
  toolId: string
}

export function ImageTools({ toolId }: ImageToolsProps) {
  if (toolId === 'qr-code-generator') {
    return <QrCodeTool />
  } else if (toolId === 'favicon-generator') {
    return <FaviconGeneratorTool />
  }
  return null
}

// ─── QR Code Tool (Generate + Scan tabs) ────────────────────────────────────

function QrCodeTool() {
  const [tab, setTab] = useState<'generate' | 'scan'>('generate')

  return (
    <div className="space-y-6">
      <div className="flex gap-1 p-1 bg-secondary rounded-xl w-fit">
        <button
          onClick={() => setTab('generate')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'generate' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Generate
        </button>
        <button
          onClick={() => setTab('scan')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'scan' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Scan
        </button>
      </div>

      {tab === 'generate' ? <QrCodeGeneratorPanel /> : <QrCodeScannerPanel />}
    </div>
  )
}

// ─── Generator ───────────────────────────────────────────────────────────────

function QrCodeGeneratorPanel() {
  const [text, setText] = useState('')
  const [size, setSize] = useState(256)
  const [ecLevel, setEcLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M')
  const [result, setResult] = useState<{ dataUrl: string; text: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError('Please enter text or a URL')
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/tools/qr-code-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, size, errorCorrectionLevel: ecLevel }),
      })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'QR code generation failed')
      }
      const data = await response.json()
      setResult(data.result)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!result?.dataUrl) return
    const a = document.createElement('a')
    a.href = result.dataUrl
    a.download = 'qrcode.png'
    a.click()
  }

  const EC_LABELS: Record<string, string> = {
    L: 'L — 7% recovery',
    M: 'M — 15% recovery',
    Q: 'Q — 25% recovery',
    H: 'H — 30% recovery',
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-5">
        <div>
          <label className="block font-medium text-foreground mb-2">Text or URL</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleGenerate()}
            placeholder="https://example.com or any text..."
            className="input-base h-32 font-mono text-sm resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-foreground mb-2">Size: {size}px</label>
            <input
              type="range"
              min={128}
              max={512}
              step={32}
              value={size}
              onChange={(e) => setSize(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block font-medium text-foreground mb-2">Error Correction</label>
            <select
              value={ecLevel}
              onChange={(e) => setEcLevel(e.target.value as 'L' | 'M' | 'Q' | 'H')}
              className="input-base w-full"
            >
              {Object.entries(EC_LABELS).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <ErrorBanner message={error} />}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <QrCode size={18} />
              Generate QR Code
            </>
          )}
        </button>
      </div>

      <div className="space-y-4">
        {result ? (
          <div className="space-y-4">
            <div className="bg-secondary rounded-xl p-6 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={result.dataUrl}
                alt="Generated QR Code"
                className="rounded-lg shadow"
                style={{ width: size, height: size, maxWidth: '100%' }}
              />
            </div>
            <button
              onClick={handleDownload}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <Download size={18} />
              Download PNG
            </button>
          </div>
        ) : (
          <div className="bg-secondary rounded-xl h-64 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <QrCode size={40} className="opacity-30" />
            <p className="text-sm">QR code will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Scanner ─────────────────────────────────────────────────────────────────

type ScanMode = 'upload' | 'camera' | 'screen'

function QrCodeScannerPanel() {
  const [mode, setMode] = useState<ScanMode>('upload')
  const [scanning, setScanning] = useState(false)
  const [scannedResult, setScannedResult] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animFrameRef = useRef<number>(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraActive(false)
    setScanning(false)
  }, [])

  useEffect(() => () => stopCamera(), [stopCamera])

  const decodeFromImageData = (imageData: ImageData): string | null => {
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    })
    return code ? code.data : null
  }

  // Upload flow
  const handleFileUpload = (file: File) => {
    setError('')
    setScannedResult(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      const src = e.target?.result as string
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const decoded = decodeFromImageData(imageData)
        if (decoded) {
          setScannedResult(decoded)
        } else {
          setError('No QR code found in this image')
        }
      }
      img.src = src
    }
    reader.readAsDataURL(file)
  }

  // Screen capture flow
  const handleScreenCapture = async () => {
    setError('')
    setScannedResult(null)
    setScanning(true)
    try {
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: true,
        audio: false,
      })
      const video = document.createElement('video')
      video.srcObject = stream
      await video.play()
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(video, 0, 0)
      stream.getTracks().forEach((t: MediaStreamTrack) => t.stop())
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const decoded = decodeFromImageData(imageData)
      if (decoded) {
        setScannedResult(decoded)
      } else {
        setError('No QR code found in the captured screen')
      }
    } catch (err: any) {
      if (err.name !== 'NotAllowedError') setError('Screen capture failed: ' + err.message)
    } finally {
      setScanning(false)
    }
  }

  // Camera flow — continuous frame scanning
  const startCamera = async () => {
    setError('')
    setScannedResult(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraActive(true)

      const scanFrame = () => {
        const video = videoRef.current
        const canvas = canvasRef.current
        if (!video || !canvas || video.readyState < video.HAVE_ENOUGH_DATA) {
          animFrameRef.current = requestAnimationFrame(scanFrame)
          return
        }
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(video, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const decoded = decodeFromImageData(imageData)
        if (decoded) {
          setScannedResult(decoded)
          stopCamera()
          return
        }
        animFrameRef.current = requestAnimationFrame(scanFrame)
      }
      animFrameRef.current = requestAnimationFrame(scanFrame)
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied')
      } else {
        setError('Could not access camera: ' + err.message)
      }
    }
  }

  const handleModeChange = (m: ScanMode) => {
    stopCamera()
    setScannedResult(null)
    setError('')
    setMode(m)
  }

  const copyResult = () => {
    if (scannedResult) {
      navigator.clipboard.writeText(scannedResult)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const isUrl = (s: string) => {
    try {
      new URL(s)
      return true
    } catch {
      return false
    }
  }

  const MODES: { id: ScanMode; label: string; icon: React.ReactNode }[] = [
    { id: 'upload', label: 'Upload Image', icon: <Upload size={16} /> },
    { id: 'camera', label: 'Camera', icon: <Camera size={16} /> },
    { id: 'screen', label: 'Screen Capture', icon: <Monitor size={16} /> },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-5">
        {/* Mode selector */}
        <div className="space-y-2">
          <label className="block font-medium text-foreground">Scan method</label>
          <div className="grid grid-cols-3 gap-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => handleModeChange(m.id)}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-sm font-medium transition-all ${
                  mode === m.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                {m.icon}
                <span className="text-xs leading-tight text-center">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Upload */}
        {mode === 'upload' && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFileUpload(f)
              }}
            />
            <div
              className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-8 text-center cursor-pointer transition-colors hover:bg-secondary/50"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const f = e.dataTransfer.files?.[0]
                if (f) handleFileUpload(f)
              }}
            >
              <ScanLine size={32} className="mx-auto mb-3 text-muted-foreground" />
              <p className="font-medium text-foreground mb-1">Drop image with QR code</p>
              <p className="text-sm text-muted-foreground">or click to select a file</p>
            </div>
          </div>
        )}

        {/* Camera */}
        {mode === 'camera' && (
          <div className="space-y-3">
            {!cameraActive ? (
              <button
                onClick={startCamera}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Camera size={18} />
                Start Camera
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                Stop Camera
              </button>
            )}
            {cameraActive && (
              <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                <Loader2 size={12} className="animate-spin" />
                Scanning for QR code…
              </p>
            )}
          </div>
        )}

        {/* Screen capture */}
        {mode === 'screen' && (
          <button
            onClick={handleScreenCapture}
            disabled={scanning}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {scanning ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Capturing…
              </>
            ) : (
              <>
                <Monitor size={18} />
                Capture Screen
              </>
            )}
          </button>
        )}

        {error && <ErrorBanner message={error} />}
      </div>

      {/* Right: camera preview or result */}
      <div className="space-y-4">
        {mode === 'camera' && cameraActive && !scannedResult && (
          <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-2 border-primary rounded-lg opacity-60" />
            </div>
          </div>
        )}

        {/* Hidden canvas for non-camera modes */}
        {mode !== 'camera' && <canvas ref={canvasRef} className="hidden" />}

        {scannedResult ? (
          <div className="space-y-3">
            <div className="bg-secondary rounded-xl p-4 space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Decoded content
              </p>
              <p className="font-mono text-sm break-all">{scannedResult}</p>
              {isUrl(scannedResult) && (
                <a
                  href={scannedResult}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline block"
                >
                  Open URL →
                </a>
              )}
            </div>
            <button
              onClick={copyResult}
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
                  Copy Result
                </>
              )}
            </button>
            <button
              onClick={() => {
                setScannedResult(null)
                setError('')
              }}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Scan another
            </button>
          </div>
        ) : (
          !cameraActive && (
            <div className="bg-secondary rounded-xl h-64 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <ScanLine size={40} className="opacity-30" />
              <p className="text-sm">Decoded content will appear here</p>
            </div>
          )
        )}
      </div>
    </div>
  )
}

// ─── Favicon Generator ────────────────────────────────────────────────────────

const FAVICON_SIZES = [16, 32, 48, 64, 96, 128, 180, 192, 256, 512]
const ICO_SIZES = [16, 32, 48]

interface FaviconResult {
  size: number
  dataUrl: string
  pngBytes: Uint8Array
}

function FaviconGeneratorTool() {
  const [preview, setPreview] = useState<string | null>(null)
  const [favicons, setFavicons] = useState<FaviconResult[]>([])
  const [error, setError] = useState('')
  const [generating, setGenerating] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [zipping, setZipping] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback((file: File) => {
    setError('')
    setFavicons([])
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!allowed.includes(file.type)) {
      setError('Unsupported file type. Please upload a PNG, JPEG, JPG, or WebP image.')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const handleGenerate = () => {
    if (!preview) {
      setError('Please upload an image first')
      return
    }
    setGenerating(true)
    setError('')
    const img = new window.Image()
    img.onload = () => {
      const results: FaviconResult[] = FAVICON_SIZES.map((size) => {
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        canvas.getContext('2d')!.drawImage(img, 0, 0, size, size)
        const dataUrl = canvas.toDataURL('image/png')
        const base64 = dataUrl.split(',')[1]
        const pngBytes = base64ToUint8Array(base64)
        return { size, dataUrl, pngBytes }
      })
      setFavicons(results)
      setGenerating(false)
    }
    img.onerror = () => {
      setError('Failed to process image')
      setGenerating(false)
    }
    img.src = preview
  }

  const downloadPng = (favicon: FaviconResult) => {
    const a = document.createElement('a')
    a.href = favicon.dataUrl
    a.download = `favicon-${favicon.size}x${favicon.size}.png`
    a.click()
  }

  const downloadIco = () => {
    const icoFavicons = favicons.filter((f) => ICO_SIZES.includes(f.size))
    if (icoFavicons.length === 0) return
    const icoBytes = buildIco(icoFavicons)
    const blob = new Blob([icoBytes.buffer as ArrayBuffer], { type: 'image/x-icon' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'favicon.ico'
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadZip = async () => {
    if (favicons.length === 0) return
    setZipping(true)
    try {
      const zip = new JSZip()
      const pngFolder = zip.folder('png')!
      favicons.forEach((f) => {
        pngFolder.file(`favicon-${f.size}x${f.size}.png`, f.pngBytes)
      })
      const icoFavicons = favicons.filter((f) => ICO_SIZES.includes(f.size))
      zip.file('favicon.ico', buildIco(icoFavicons))
      zip.file('favicon-links.html', buildHtmlSnippet())
      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'favicons.zip'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setZipping(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragging
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-secondary/50'
            }`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <Upload size={32} className="mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium text-foreground mb-1">Drop image here or click to upload</p>
            <p className="text-sm text-muted-foreground">PNG, JPEG, JPG, WebP supported</p>
          </div>

          {preview && (
            <div className="bg-secondary rounded-xl p-4 flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Preview" className="w-16 h-16 object-contain rounded-lg" />
              <div>
                <p className="font-medium text-foreground text-sm">Image loaded</p>
                <p className="text-xs text-muted-foreground">Ready to generate favicons</p>
              </div>
            </div>
          )}

          {error && <ErrorBanner message={error} />}

          <button
            onClick={handleGenerate}
            disabled={!preview || generating}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <ImageIcon size={18} />
                Generate Favicons
              </>
            )}
          </button>
        </div>

        <div className="space-y-4">
          {favicons.length > 0 ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-foreground text-sm flex-1">
                  {favicons.length} sizes ready
                </span>
                <button
                  onClick={downloadIco}
                  className="btn-secondary text-xs flex items-center gap-1 px-3 py-1.5"
                >
                  <Download size={13} />
                  favicon.ico
                </button>
                <button
                  onClick={downloadZip}
                  disabled={zipping}
                  className="btn-primary text-xs flex items-center gap-1 px-3 py-1.5"
                >
                  {zipping ? <Loader2 size={13} className="animate-spin" /> : <Archive size={13} />}
                  Download All (.zip)
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
                {favicons.map((favicon) => (
                  <button
                    key={favicon.size}
                    onClick={() => downloadPng(favicon)}
                    className="bg-secondary hover:bg-secondary/80 rounded-xl p-3 flex flex-col items-center gap-2 transition-colors group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={favicon.dataUrl}
                      alt={`${favicon.size}x${favicon.size}`}
                      className="w-10 h-10 object-contain rounded"
                    />
                    <span className="text-xs text-muted-foreground font-mono">
                      {favicon.size}×{favicon.size}
                    </span>
                    <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <Download size={10} /> PNG
                    </span>
                  </button>
                ))}
              </div>

              <p className="text-xs text-muted-foreground">
                ZIP includes all PNGs, a multi-size <code className="font-mono">favicon.ico</code>{' '}
                (16/32/48px), and an HTML snippet.
              </p>
            </>
          ) : (
            <div className="bg-secondary rounded-xl h-64 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <ImageIcon size={40} className="opacity-30" />
              <p className="text-sm">Favicon sizes will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
      <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
      <p className="text-sm text-red-600">{message}</p>
    </div>
  )
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function buildIco(favicons: FaviconResult[]): Uint8Array {
  const count = favicons.length
  const headerSize = 6 + count * 16
  const dataSize = favicons.reduce((acc, f) => acc + f.pngBytes.length, 0)
  const buf = new ArrayBuffer(headerSize + dataSize)
  const view = new DataView(buf)

  view.setUint16(0, 0, true) // reserved
  view.setUint16(2, 1, true) // type = 1 (icon)
  view.setUint16(4, count, true) // image count

  let offset = headerSize
  favicons.forEach((f, i) => {
    const icoSize = f.size >= 256 ? 0 : f.size // 256 encoded as 0 per spec
    view.setUint8(6 + i * 16, icoSize) // width
    view.setUint8(7 + i * 16, icoSize) // height
    view.setUint8(8 + i * 16, 0) // color count
    view.setUint8(9 + i * 16, 0) // reserved
    view.setUint16(10 + i * 16, 1, true) // planes
    view.setUint16(12 + i * 16, 32, true) // bit depth
    view.setUint32(14 + i * 16, f.pngBytes.length, true) // byte size
    view.setUint32(18 + i * 16, offset, true) // offset
    new Uint8Array(buf, offset, f.pngBytes.length).set(f.pngBytes)
    offset += f.pngBytes.length
  })

  return new Uint8Array(buf)
}

function buildHtmlSnippet(): string {
  return [
    '<!-- Paste inside <head> -->',
    '<link rel="icon" type="image/x-icon" href="/favicon.ico">',
    '<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">',
    '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">',
    '<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png">',
    '<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png">',
    '<link rel="apple-touch-icon" sizes="180x180" href="/favicon-180x180.png">',
    '<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png">',
    '<link rel="icon" type="image/png" sizes="512x512" href="/favicon-512x512.png">',
  ].join('\n')
}
