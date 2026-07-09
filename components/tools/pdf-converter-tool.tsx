'use client'

import { useState, useRef } from 'react'
import {
  Upload,
  Download,
  FileText,
  ImageIcon,
  AlertCircle,
  Loader2,
  X,
  Plus,
  GripVertical,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type ConvTab = 'image-to-pdf' | 'pdf-to-images' | 'docx-to-pdf'

interface ImageEntry {
  id: string
  file: File
  dataUrl: string
  name: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2)
}

function DropZone({
  onFiles,
  accept,
  multiple = false,
  label,
}: {
  onFiles: (files: File[]) => void
  accept: string
  multiple?: boolean
  label: string
}) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handle = (files: File[]) => {
    const filtered = files.filter((f) => {
      const types = accept.split(',').map((s) => s.trim())
      return types.some((t) => {
        if (t.startsWith('.')) return f.name.toLowerCase().endsWith(t)
        return f.type === t || f.type.startsWith(t.replace('*', ''))
      })
    })
    if (filtered.length) onFiles(filtered)
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        handle(Array.from(e.dataTransfer.files))
      }}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
        dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
      }`}
    >
      <Upload className="mx-auto mb-3 text-muted-foreground" size={32} />
      <p className="font-medium text-foreground">{label}</p>
      <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          handle(Array.from(e.target.files ?? []))
          e.target.value = ''
        }}
      />
    </div>
  )
}

// ─── Image → PDF ──────────────────────────────────────────────────────────────

function ImageToPdf() {
  const [images, setImages] = useState<ImageEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const [pageSize, setPageSize] = useState<'fit' | 'A4' | 'Letter'>('fit')

  const handleFiles = (files: File[]) => {
    setError('')
    const entries: ImageEntry[] = []
    let pending = files.length
    files.forEach((f) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        entries.push({ id: uid(), file: f, dataUrl: e.target?.result as string, name: f.name })
        if (--pending === 0) {
          setImages((prev) => [...prev, ...entries])
        }
      }
      reader.readAsDataURL(f)
    })
  }

  const remove = (id: string) => setImages((prev) => prev.filter((i) => i.id !== id))

  const reorder = (from: number, to: number) => {
    setImages((prev) => {
      const next = [...prev]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item!)
      return next
    })
  }

  const convert = async () => {
    if (!images.length) {
      setError('Add at least one image.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { PDFDocument } = await import('pdf-lib')
      const pdf = await PDFDocument.create()

      for (const img of images) {
        const res = await fetch(img.dataUrl)
        const buf = await res.arrayBuffer()
        const bytes = new Uint8Array(buf)

        let embedded
        if (img.file.type === 'image/png') {
          embedded = await pdf.embedPng(bytes)
        } else {
          embedded = await pdf.embedJpg(bytes)
        }

        const { width: imgW, height: imgH } = embedded

        let pageW: number, pageH: number
        if (pageSize === 'A4') {
          pageW = 595
          pageH = 842
        } else if (pageSize === 'Letter') {
          pageW = 612
          pageH = 792
        } else {
          pageW = imgW
          pageH = imgH
        }

        const page = pdf.addPage([pageW, pageH])
        const scale = Math.min(pageW / imgW, pageH / imgH)
        const drawW = imgW * scale
        const drawH = imgH * scale
        const x = (pageW - drawW) / 2
        const y = (pageH - drawH) / 2
        page.drawImage(embedded, { x, y, width: drawW, height: drawH })
      }

      const bytes = await pdf.save()
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'images.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch (e: any) {
      setError(e.message || 'Conversion failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <DropZone
        onFiles={handleFiles}
        accept="image/png,image/jpeg,image/jpg,image/webp"
        multiple
        label="Drop images here (PNG, JPG, WebP)"
      />

      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              {images.length} image{images.length !== 1 ? 's' : ''} - drag to reorder
            </p>
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">Page size</label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as typeof pageSize)}
                className="input-base py-1 text-xs"
              >
                <option value="fit">Fit to image</option>
                <option value="A4">A4</option>
                <option value="Letter">Letter</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {images.map((img, idx) => (
              <div
                key={img.id}
                draggable
                onDragStart={() => setDraggingIdx(idx)}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOverIdx(idx)
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  if (draggingIdx !== null && draggingIdx !== idx) reorder(draggingIdx, idx)
                  setDraggingIdx(null)
                  setDragOverIdx(null)
                }}
                onDragEnd={() => {
                  setDraggingIdx(null)
                  setDragOverIdx(null)
                }}
                className={`relative group rounded-lg overflow-hidden border transition-colors ${
                  dragOverIdx === idx ? 'border-primary' : 'border-border'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.dataUrl}
                  alt={img.name}
                  className="w-full aspect-square object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <button
                  onClick={() => remove(img.id)}
                  className="absolute top-1 right-1 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                  {idx + 1}. {img.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-600">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <button
        onClick={convert}
        disabled={loading || images.length === 0}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Converting...
          </>
        ) : (
          <>
            <Download size={16} />
            Convert to PDF
          </>
        )}
      </button>
    </div>
  )
}

// ─── PDF → Images ─────────────────────────────────────────────────────────────

function PdfToImages() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [previews, setPreviews] = useState<string[]>([])
  const [scale, setScale] = useState(1.5)
  const [format, setFormat] = useState<'png' | 'jpeg'>('png')

  const loadFile = (files: File[]) => {
    const f = files[0]
    if (!f) return
    setFile(f)
    setPreviews([])
    setError('')
  }

  const convert = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    setPreviews([])
    try {
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
      const buf = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise
      const count = pdf.numPages
      const urls: string[] = []

      for (let i = 1; i <= count; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')!
        await page.render({ canvasContext: ctx, viewport, canvas } as any).promise
        const mimeType = format === 'png' ? 'image/png' : 'image/jpeg'
        urls.push(canvas.toDataURL(mimeType, 0.92))
      }
      setPreviews(urls)
    } catch (e: any) {
      setError(e.message || 'Conversion failed.')
    } finally {
      setLoading(false)
    }
  }

  const downloadAll = () => {
    previews.forEach((url, i) => {
      const a = document.createElement('a')
      a.href = url
      a.download = `page-${i + 1}.${format}`
      a.click()
    })
  }

  const downloadOne = (url: string, idx: number) => {
    const a = document.createElement('a')
    a.href = url
    a.download = `page-${idx + 1}.${format}`
    a.click()
  }

  return (
    <div className="space-y-6">
      {!file ? (
        <DropZone onFiles={loadFile} accept="application/pdf" label="Drop a PDF file" />
      ) : (
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-primary" />
            <span className="text-sm font-medium">{file.name}</span>
          </div>
          <button
            onClick={() => {
              setFile(null)
              setPreviews([])
            }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Change
          </button>
        </div>
      )}

      {file && (
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Scale</label>
            <select
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="input-base py-1 text-sm"
            >
              <option value={1}>1x (low)</option>
              <option value={1.5}>1.5x (medium)</option>
              <option value={2}>2x (high)</option>
              <option value={3}>3x (very high)</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as 'png' | 'jpeg')}
              className="input-base py-1 text-sm"
            >
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
            </select>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-600">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <button
        onClick={convert}
        disabled={loading || !file}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Converting...
          </>
        ) : (
          <>
            <ImageIcon size={16} />
            Convert to Images
          </>
        )}
      </button>

      {previews.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              {previews.length} page{previews.length !== 1 ? 's' : ''} converted
            </p>
            <button
              onClick={downloadAll}
              className="flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <Download size={14} />
              Download all
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {previews.map((url, i) => (
              <div key={i} className="group relative rounded-xl overflow-hidden border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Page ${i + 1}`} className="w-full" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <button
                    onClick={() => downloadOne(url, i)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 bg-white text-gray-900 text-xs font-medium px-3 py-1.5 rounded-lg"
                  >
                    <Download size={12} />
                    Page {i + 1}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── DOCX → PDF ───────────────────────────────────────────────────────────────

function DocxToPdf() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const loadFile = (files: File[]) => {
    const f = files[0]
    if (!f) return
    setFile(f)
    setError('')
    setDone(false)
  }

  const convert = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    setDone(false)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/tools/docx-to-pdf', { method: 'POST', body: formData })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Conversion failed.')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name.replace(/\.docx$/i, '.pdf')
      a.click()
      URL.revokeObjectURL(url)
      setDone(true)
    } catch (e: any) {
      setError(e.message || 'Conversion failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {!file ? (
        <DropZone
          onFiles={loadFile}
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          label="Drop a DOCX file"
        />
      ) : (
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-primary" />
            <span className="text-sm font-medium">{file.name}</span>
          </div>
          <button
            onClick={() => {
              setFile(null)
              setDone(false)
            }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Change
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-600">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {done && (
        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-600">
          PDF downloaded successfully.
        </div>
      )}

      <button
        onClick={convert}
        disabled={loading || !file}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Converting...
          </>
        ) : (
          <>
            <Download size={16} />
            Convert to PDF
          </>
        )}
      </button>

      <div className="p-4 bg-secondary rounded-xl text-sm text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">Note</p>
        <p>
          DOCX to PDF conversion happens server-side via Mammoth + PDFKit.
          Complex layouts, custom fonts, and embedded objects may render differently.
        </p>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PdfConverterTool({ toolId }: { toolId: string }) {
  const tabFromId: Record<string, ConvTab> = {
    'image-to-pdf': 'image-to-pdf',
    'pdf-to-images': 'pdf-to-images',
    'docx-to-pdf': 'docx-to-pdf',
  }

  const [tab, setTab] = useState<ConvTab>(tabFromId[toolId] ?? 'image-to-pdf')

  const tabs: { value: ConvTab; label: string; icon: React.ReactNode }[] = [
    { value: 'image-to-pdf', label: 'Image → PDF', icon: <ImageIcon size={16} /> },
    { value: 'pdf-to-images', label: 'PDF → Images', icon: <ImageIcon size={16} /> },
    { value: 'docx-to-pdf', label: 'DOCX → PDF', icon: <FileText size={16} /> },
  ]

  return (
    <div className="space-y-6 w-full">
      <div className="flex gap-2 border-b border-border pb-0">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
              tab === t.value
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'image-to-pdf' && <ImageToPdf />}
      {tab === 'pdf-to-images' && <PdfToImages />}
      {tab === 'docx-to-pdf' && <DocxToPdf />}
    </div>
  )
}
