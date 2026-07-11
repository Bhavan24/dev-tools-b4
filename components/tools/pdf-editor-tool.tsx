'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import {
  Upload,
  Download,
  Trash2,
  RotateCw,
  FileText,
  Scissors,
  Merge,
  Type,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  GripVertical,
  X,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'merge' | 'split' | 'edit'

interface PageItem {
  id: string
  pageIndex: number // 0-based index in original file
  rotation: number // 0, 90, 180, 270
  label: string
}

interface UploadedFile {
  name: string
  arrayBuffer: ArrayBuffer
  pageCount: number
  id: string
}

interface Overlay {
  id: string
  type: 'text' | 'image'
  source: 'extracted' | 'new'
  pageIndex: number
  // Position as fraction of PDF page (0-1, top-left origin)
  x: number
  y: number
  // Size as fraction of PDF page
  w: number
  h: number
  // Text fields
  text: string
  fontSize: number // in PDF points
  color: string
  bold: boolean
  italic: boolean
  // Image field
  imageData?: string
  // Original PDF coords for white-out on save (extracted only)
  pdfOrigX?: number
  pdfOrigY?: number // baseline from bottom
  pdfOrigW?: number
  pdfOrigH?: number
  modified?: boolean // extracted text that was moved/edited
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2)
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DropZone({
  onFiles,
  multiple = false,
  label,
}: {
  onFiles: (files: File[]) => void
  multiple?: boolean
  label?: string
}) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type === 'application/pdf')
    if (files.length) onFiles(files)
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
        dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
      }`}
    >
      <Upload className="mx-auto mb-3 text-muted-foreground" size={32} />
      <p className="font-medium text-foreground">{label ?? 'Drop PDF files here'}</p>
      <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? [])
          if (files.length) onFiles(files)
          e.target.value = ''
        }}
      />
    </div>
  )
}

// ─── Merge Tab ────────────────────────────────────────────────────────────────

function MergeTab() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)

  const loadFile = async (file: File): Promise<UploadedFile> => {
    const { PDFDocument } = await import('pdf-lib')
    const buf = await file.arrayBuffer()
    const doc = await PDFDocument.load(buf)
    return {
      id: uid(),
      name: file.name,
      arrayBuffer: buf,
      pageCount: doc.getPageCount(),
    }
  }

  const handleDrop = async (dropped: File[]) => {
    setError('')
    try {
      const loaded = await Promise.all(dropped.map(loadFile))
      setFiles((prev) => [...prev, ...loaded])
    } catch {
      setError('Failed to read one or more PDF files.')
    }
  }

  const remove = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id))

  const reorder = (from: number, to: number) => {
    setFiles((prev) => {
      const next = [...prev]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item!)
      return next
    })
  }

  const merge = async () => {
    if (files.length < 2) {
      setError('Add at least 2 PDF files to merge.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { PDFDocument } = await import('pdf-lib')
      const merged = await PDFDocument.create()
      for (const f of files) {
        const src = await PDFDocument.load(f.arrayBuffer)
        const indices = src.getPageIndices()
        const pages = await merged.copyPages(src, indices)
        pages.forEach((p) => merged.addPage(p))
      }
      const bytes = await merged.save()
      download(bytes, 'merged.pdf')
    } catch (e: any) {
      setError(e.message || 'Merge failed.')
    } finally {
      setLoading(false)
    }
  }

  const download = (bytes: Uint8Array, name: string) => {
    const blob = new Blob([bytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <DropZone onFiles={handleDrop} multiple label="Drop PDF files here to merge" />

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Drag rows to reorder - {files.length} file{files.length !== 1 ? 's' : ''}
          </p>
          {files.map((f, idx) => (
            <div
              key={f.id}
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
              className={`flex items-center gap-3 p-3 rounded-lg bg-secondary border transition-colors ${
                dragOverIdx === idx ? 'border-primary' : 'border-transparent'
              }`}
            >
              <GripVertical size={16} className="text-muted-foreground cursor-grab shrink-0" />
              <FileText size={16} className="text-primary shrink-0" />
              <span className="flex-1 text-sm font-medium truncate">{f.name}</span>
              <span className="text-xs text-muted-foreground">
                {f.pageCount} page{f.pageCount !== 1 ? 's' : ''}
              </span>
              <button
                onClick={() => remove(f.id)}
                className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-600">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <button
        onClick={merge}
        disabled={loading || files.length < 2}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Merging...
          </>
        ) : (
          <>
            <Merge size={16} />
            Merge PDFs
          </>
        )}
      </button>
    </div>
  )
}

// ─── Split Tab ────────────────────────────────────────────────────────────────

type SplitMode = 'all' | 'range' | 'extract'

function SplitTab() {
  const [file, setFile] = useState<UploadedFile | null>(null)
  const [mode, setMode] = useState<SplitMode>('all')
  const [rangeInput, setRangeInput] = useState('')
  const [pages, setPages] = useState<PageItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadFile = async (dropped: File[]) => {
    const f = dropped[0]
    if (!f) return
    setError('')
    try {
      const { PDFDocument } = await import('pdf-lib')
      const buf = await f.arrayBuffer()
      const doc = await PDFDocument.load(buf)
      const count = doc.getPageCount()
      setFile({ id: uid(), name: f.name, arrayBuffer: buf, pageCount: count })
      setPages(
        Array.from({ length: count }, (_, i) => ({
          id: uid(),
          pageIndex: i,
          rotation: 0,
          label: `Page ${i + 1}`,
        }))
      )
    } catch {
      setError('Could not read PDF file.')
    }
  }

  const parseRanges = (input: string, max: number): number[][] => {
    const groups: number[][] = []
    for (const part of input.split(',')) {
      const t = part.trim()
      if (!t) continue
      const dash = t.indexOf('-')
      if (dash !== -1) {
        const from = parseInt(t.slice(0, dash), 10) - 1
        const to = parseInt(t.slice(dash + 1), 10) - 1
        if (isNaN(from) || isNaN(to) || from < 0 || to >= max || from > to) {
          throw new Error(`Invalid range "${t}"`)
        }
        groups.push(Array.from({ length: to - from + 1 }, (_, i) => from + i))
      } else {
        const n = parseInt(t, 10) - 1
        if (isNaN(n) || n < 0 || n >= max) throw new Error(`Invalid page "${t}"`)
        groups.push([n])
      }
    }
    return groups
  }

  const doSplit = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const { PDFDocument } = await import('pdf-lib')
      const src = await PDFDocument.load(file.arrayBuffer)

      if (mode === 'all') {
        // Each page as individual PDF
        for (let i = 0; i < file.pageCount; i++) {
          const out = await PDFDocument.create()
          const [p] = await out.copyPages(src, [i])
          out.addPage(p!)
          const bytes = await out.save()
          downloadBytes(bytes, `page-${i + 1}.pdf`)
          await new Promise((r) => setTimeout(r, 50))
        }
      } else if (mode === 'range') {
        const groups = parseRanges(rangeInput, file.pageCount)
        if (!groups.length) throw new Error('No valid ranges entered.')
        for (let g = 0; g < groups.length; g++) {
          const out = await PDFDocument.create()
          const indices = groups[g]!
          const ps = await out.copyPages(src, indices)
          ps.forEach((p) => out.addPage(p))
          const bytes = await out.save()
          downloadBytes(bytes, `split-${g + 1}.pdf`)
          await new Promise((r) => setTimeout(r, 50))
        }
      } else {
        // extract selected pages
        const selected = pages.filter((p) => (p as any).selected).map((p) => p.pageIndex)
        if (!selected.length) throw new Error('Select at least one page to extract.')
        const out = await PDFDocument.create()
        const ps = await out.copyPages(src, selected)
        ps.forEach((p) => out.addPage(p))
        const bytes = await out.save()
        downloadBytes(bytes, 'extracted.pdf')
      }
    } catch (e: any) {
      setError(e.message || 'Split failed.')
    } finally {
      setLoading(false)
    }
  }

  const downloadBytes = (bytes: Uint8Array, name: string) => {
    const blob = new Blob([bytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
  }

  const toggleSelect = (id: string) => {
    setPages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, selected: !(p as any).selected } : p))
    )
  }

  return (
    <div className="space-y-6">
      {!file ? (
        <DropZone onFiles={loadFile} label="Drop a PDF file to split" />
      ) : (
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-primary" />
            <span className="text-sm font-medium">{file.name}</span>
            <span className="text-xs text-muted-foreground">({file.pageCount} pages)</span>
          </div>
          <button
            onClick={() => setFile(null)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Change
          </button>
        </div>
      )}

      {file && (
        <>
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Split mode</p>
            <div className="flex gap-2 flex-wrap">
              {(
                [
                  { value: 'all', label: 'All pages individually' },
                  { value: 'range', label: 'By page ranges' },
                  { value: 'extract', label: 'Extract selected' },
                ] as { value: SplitMode; label: string }[]
              ).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setMode(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    mode === opt.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary hover:bg-secondary/80 text-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {mode === 'range' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Page ranges (e.g. 1-3, 5, 7-9)
              </label>
              <input
                value={rangeInput}
                onChange={(e) => setRangeInput(e.target.value)}
                placeholder="1-3, 5, 7-9"
                className="input-base"
              />
              <p className="text-xs text-muted-foreground">
                Each comma-separated entry becomes a separate PDF.
              </p>
            </div>
          )}

          {mode === 'extract' && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Select pages to extract</p>
              <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
                {pages.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => toggleSelect(p.id)}
                    className={`aspect-square rounded-lg text-xs font-medium transition-colors ${
                      (p as any).selected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary hover:bg-secondary/80 text-foreground'
                    }`}
                  >
                    {p.pageIndex + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-600">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <button
        onClick={doSplit}
        disabled={loading || !file}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Splitting...
          </>
        ) : (
          <>
            <Scissors size={16} />
            Split PDF
          </>
        )}
      </button>
    </div>
  )
}

// ─── Edit Tab ─────────────────────────────────────────────────────────────────

type EditorTool = 'select' | 'add-text' | 'add-image'

// Drag state stored in a ref so it never causes re-renders
interface DragState {
  id: string
  startMouseX: number
  startMouseY: number
  startOvX: number // overlay start position (fraction)
  startOvY: number
  kind: 'move' | 'resize'
}

function EditTab() {
  const [file, setFile] = useState<UploadedFile | null>(null)
  const [pages, setPages] = useState<PageItem[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [overlays, setOverlays] = useState<Overlay[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [tool, setTool] = useState<EditorTool>('select')
  const [newTextInput, setNewTextInput] = useState('New text')
  const [newFontSize, setNewFontSize] = useState(14)
  const [newColor, setNewColor] = useState('#000000')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pageRendering, setPageRendering] = useState(false)
  const [pageDataUrl, setPageDataUrl] = useState<string | null>(null)
  // Track actual pixel size of the rendered page image for coordinate mapping
  const [pagePixelSize, setPagePixelSize] = useState({ w: 1, h: 1 })
  // Track PDF logical size for save mapping
  const [pdfPageSize, setPdfPageSize] = useState({ w: 612, h: 792 })

  const pageContainerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragState | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const currentPageIndex = pages[currentPage]?.pageIndex ?? currentPage

  // ── File load ────────────────────────────────────────────────────────────────

  const loadFile = async (dropped: File[]) => {
    const f = dropped[0]
    if (!f) return
    setError('')
    try {
      const { PDFDocument } = await import('pdf-lib')
      const buf = await f.arrayBuffer()
      const doc = await PDFDocument.load(buf)
      const count = doc.getPageCount()
      setFile({ id: uid(), name: f.name, arrayBuffer: buf, pageCount: count })
      setPages(
        Array.from({ length: count }, (_, i) => ({
          id: uid(),
          pageIndex: i,
          rotation: 0,
          label: `Page ${i + 1}`,
        }))
      )
      setCurrentPage(0)
      setOverlays([])
      setSelectedId(null)
    } catch {
      setError('Could not read PDF file.')
    }
  }

  // ── Page render + text extraction ────────────────────────────────────────────

  const renderPage = useCallback(
    async (pageIndex: number) => {
      if (!file) return
      setPageRendering(true)
      setSelectedId(null)
      setEditingId(null)
      try {
        const pdfjsLib = await import('pdfjs-dist')
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
        const pdf = await pdfjsLib.getDocument({ data: file.arrayBuffer.slice(0) }).promise
        const page = await pdf.getPage(pageIndex + 1)
        const SCALE = 1.5
        const viewport = page.getViewport({ scale: SCALE })

        // Render to canvas
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')!
        await page.render({ canvasContext: ctx, viewport, canvas } as any).promise
        setPageDataUrl(canvas.toDataURL())
        setPagePixelSize({ w: viewport.width, h: viewport.height })

        // PDF logical size (at scale 1)
        const vp1 = page.getViewport({ scale: 1 })
        setPdfPageSize({ w: vp1.width, h: vp1.height })

        // Extract text items - remove old extracted overlays for this page then add fresh ones
        const textContent = await page.getTextContent()
        const extracted: Overlay[] = []

        for (const item of textContent.items as any[]) {
          if (!item.str?.trim()) continue
          // pdfjs transform: [scaleX, skewY, skewX, scaleY, tx, ty]
          // tx, ty are in PDF user space (origin bottom-left)
          const tx = item.transform[4] as number
          const ty = item.transform[5] as number
          const fontSize = Math.abs(item.transform[3] as number) || 12
          const itemW = (item.width as number) || fontSize * item.str.length * 0.6
          const itemH = fontSize * 1.2

          extracted.push({
            id: uid(),
            type: 'text',
            source: 'extracted',
            pageIndex,
            // Convert from PDF space (bottom-left) to fraction (top-left)
            x: tx / vp1.width,
            y: 1 - (ty + itemH) / vp1.height,
            w: itemW / vp1.width,
            h: itemH / vp1.height,
            text: item.str,
            fontSize,
            color: '#000000',
            bold: false,
            italic: false,
            pdfOrigX: tx,
            pdfOrigY: ty,
            pdfOrigW: itemW,
            pdfOrigH: itemH,
            modified: false,
          })
        }

        // Merge: keep non-extracted overlays for this page, replace extracted ones
        setOverlays((prev) => [
          ...prev.filter((o) => o.pageIndex !== pageIndex || o.source === 'new'),
          ...extracted,
        ])
      } catch {
        setPageDataUrl(null)
      } finally {
        setPageRendering(false)
      }
    },
    [file]
  )

  useEffect(() => {
    if (file) renderPage(currentPageIndex)
  }, [file, currentPageIndex, renderPage])

  // Update pagePixelSize when the image element resizes
  useEffect(() => {
    const img = pageContainerRef.current?.querySelector('img')
    if (!img) return
    const obs = new ResizeObserver(() => {
      setPagePixelSize({ w: img.clientWidth, h: img.clientHeight })
    })
    obs.observe(img)
    return () => obs.disconnect()
  }, [pageDataUrl])

  // ── Page management ──────────────────────────────────────────────────────────

  const rotatePage = (pageId: string) => {
    setPages((prev) =>
      prev.map((p) => (p.id === pageId ? { ...p, rotation: (p.rotation + 90) % 360 } : p))
    )
  }

  const deletePage = (pageId: string) => {
    const deleted = pages.find((p) => p.id === pageId)
    setPages((prev) => prev.filter((p) => p.id !== pageId))
    if (deleted) setOverlays((prev) => prev.filter((o) => o.pageIndex !== deleted.pageIndex))
    setCurrentPage((prev) => Math.max(0, Math.min(prev, pages.length - 2)))
  }

  // ── Overlay helpers ──────────────────────────────────────────────────────────

  const currentOverlays = overlays.filter((o) => o.pageIndex === currentPageIndex)

  const updateOverlay = (id: string, patch: Partial<Overlay>) => {
    setOverlays((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)))
  }

  const removeOverlay = (id: string) => {
    setOverlays((prev) => prev.filter((o) => o.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  // ── Canvas click: place new text / deselect ──────────────────────────────────

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't fire if we just finished a drag
    if (dragRef.current) return

    const rect = e.currentTarget.getBoundingClientRect()
    const fx = (e.clientX - rect.left) / rect.width
    const fy = (e.clientY - rect.top) / rect.height

    if (tool === 'add-text') {
      const ov: Overlay = {
        id: uid(),
        type: 'text',
        source: 'new',
        pageIndex: currentPageIndex,
        x: fx,
        y: fy,
        w: Math.max(0.1, (newFontSize * newTextInput.length * 0.6) / pdfPageSize.w),
        h: (newFontSize * 1.4) / pdfPageSize.h,
        text: newTextInput || 'Text',
        fontSize: newFontSize,
        color: newColor,
        bold: false,
        italic: false,
      }
      setOverlays((prev) => [...prev, ov])
      setSelectedId(ov.id)
      setTool('select')
      return
    }

    // Deselect when clicking empty canvas area
    setSelectedId(null)
    setEditingId(null)
  }

  // ── Image upload ─────────────────────────────────────────────────────────────

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const data = ev.target?.result as string
      const ov: Overlay = {
        id: uid(),
        type: 'image',
        source: 'new',
        pageIndex: currentPageIndex,
        x: 0.1,
        y: 0.1,
        w: 0.35,
        h: 0.25,
        text: '',
        fontSize: 12,
        color: '#000000',
        bold: false,
        italic: false,
        imageData: data,
      }
      setOverlays((prev) => [...prev, ov])
      setSelectedId(ov.id)
      setTool('select')
    }
    reader.readAsDataURL(f)
    e.target.value = ''
  }

  // ── Drag to move ─────────────────────────────────────────────────────────────

  const startDrag = (e: React.MouseEvent, id: string, kind: 'move' | 'resize', ov: Overlay) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedId(id)
    dragRef.current = {
      id,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startOvX: ov.x,
      startOvY: ov.y,
      kind,
    }
  }

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current
      if (!d) return
      const container = pageContainerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      const dx = (e.clientX - d.startMouseX) / rect.width
      const dy = (e.clientY - d.startMouseY) / rect.height

      setOverlays((prev) =>
        prev.map((o) => {
          if (o.id !== d.id) return o
          if (d.kind === 'move') {
            return {
              ...o,
              x: Math.max(0, Math.min(1 - o.w, d.startOvX + dx)),
              y: Math.max(0, Math.min(1 - o.h, d.startOvY + dy)),
              modified: true,
            }
          } else {
            // resize: anchor top-left, drag bottom-right corner
            const newW = Math.max(0.03, o.w + dx)
            const newH = Math.max(0.02, o.h + dy)
            // For resize we update the ref start so it's incremental
            dragRef.current = { ...d, startMouseX: e.clientX, startMouseY: e.clientY }
            return { ...o, w: newW, h: newH, modified: true }
          }
        })
      )
    }
    const onUp = () => {
      dragRef.current = null
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  // ── Save ─────────────────────────────────────────────────────────────────────

  const save = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const { PDFDocument, rgb, degrees } = await import('pdf-lib')
      const { StandardFonts } = await import('pdf-lib')
      const src = await PDFDocument.load(file.arrayBuffer)
      const out = await PDFDocument.create()

      // Copy pages with rotation
      for (const pg of pages) {
        const [outPage] = await out.copyPages(src, [pg.pageIndex])
        if (!outPage) continue
        if (pg.rotation !== 0) outPage.setRotation(degrees(pg.rotation))
        out.addPage(outPage)
      }

      const fontNormal = await out.embedFont(StandardFonts.Helvetica)
      const fontBold = await out.embedFont(StandardFonts.HelveticaBold)
      const fontItalic = await out.embedFont(StandardFonts.HelveticaOblique)
      const fontBoldItalic = await out.embedFont(StandardFonts.HelveticaBoldOblique)

      const outPages = out.getPages()

      for (const ov of overlays) {
        const pgIdx = pages.findIndex((p) => p.pageIndex === ov.pageIndex)
        if (pgIdx === -1) continue
        const outPage = outPages[pgIdx]
        if (!outPage) continue
        const { width: pdfW, height: pdfH } = outPage.getSize()

        if (ov.type === 'text' && ov.text) {
          // White-out original position for extracted text that was modified
          if (ov.source === 'extracted' && ov.modified && ov.pdfOrigX !== undefined) {
            outPage.drawRectangle({
              x: ov.pdfOrigX,
              y: ov.pdfOrigY! - 2,
              width: ov.pdfOrigW! + 2,
              height: ov.pdfOrigH! + 4,
              color: rgb(1, 1, 1),
              borderWidth: 0,
            })
          }

          const hex = ov.color ?? '#000000'
          const r = parseInt(hex.slice(1, 3), 16) / 255
          const g = parseInt(hex.slice(3, 5), 16) / 255
          const b = parseInt(hex.slice(5, 7), 16) / 255
          const font =
            ov.bold && ov.italic
              ? fontBoldItalic
              : ov.bold
                ? fontBold
                : ov.italic
                  ? fontItalic
                  : fontNormal

          // Convert fraction (top-left) back to PDF coords (bottom-left)
          const pdfX = ov.x * pdfW
          const pdfY = pdfH - ov.y * pdfH - ov.fontSize * 1.2

          outPage.drawText(ov.text, {
            x: Math.max(0, pdfX),
            y: Math.max(0, pdfY),
            size: ov.fontSize,
            font,
            color: rgb(r, g, b),
            maxWidth: ov.w * pdfW,
          })
        } else if (ov.type === 'image' && ov.imageData) {
          try {
            let embedded
            const base64 = ov.imageData.split(',')[1]!
            const buf = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
            if (ov.imageData.includes('data:image/png')) {
              embedded = await out.embedPng(buf)
            } else {
              embedded = await out.embedJpg(buf)
            }
            const imgW = ov.w * pdfW
            const imgH = ov.h * pdfH
            outPage.drawImage(embedded, {
              x: ov.x * pdfW,
              y: pdfH - ov.y * pdfH - imgH,
              width: imgW,
              height: imgH,
            })
          } catch {
            // skip unembeddable image
          }
        }
      }

      const bytes = await out.save()
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name.replace(/\.pdf$/i, '') + '-edited.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch (e: any) {
      setError(e.message || 'Failed to save PDF.')
    } finally {
      setLoading(false)
    }
  }

  // ── Selected overlay props panel ─────────────────────────────────────────────

  const selected = overlays.find((o) => o.id === selectedId)

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {!file ? (
        <DropZone onFiles={loadFile} label="Drop a PDF file to edit" />
      ) : (
        <>
          {/* ── Toolbar ── */}
          <div className="flex items-center gap-2 flex-wrap p-2 bg-secondary rounded-xl">
            <span className="text-xs font-medium text-muted-foreground truncate max-w-40 mr-1">
              {file.name}
            </span>
            <div className="h-4 w-px bg-border mx-1" />

            {/* Tool buttons */}
            {(
              [
                { value: 'select', label: 'Select', icon: <GripVertical size={14} /> },
                { value: 'add-text', label: 'Add Text', icon: <Type size={14} /> },
              ] as { value: EditorTool; label: string; icon: React.ReactNode }[]
            ).map((t) => (
              <button
                key={t.value}
                onClick={() => setTool(t.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  tool === t.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background hover:bg-background/80 text-foreground'
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}

            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-background hover:bg-background/80 text-foreground cursor-pointer transition-colors">
              <ImageIcon size={14} />
              Add Image
              <input
                ref={imageInputRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={handleImageFile}
              />
            </label>

            <div className="flex-1" />

            <button
              onClick={save}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              Download
            </button>
          </div>

          {/* ── Add-text options bar ── */}
          {tool === 'add-text' && (
            <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl flex-wrap">
              <p className="text-sm font-medium text-primary whitespace-nowrap">
                Click on the page to place text
              </p>
              <input
                value={newTextInput}
                onChange={(e) => setNewTextInput(e.target.value)}
                placeholder="Text to add..."
                className="input-base flex-1 min-w-32 py-1.5 text-sm"
              />
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-muted-foreground">Size</label>
                <input
                  type="number"
                  value={newFontSize}
                  onChange={(e) =>
                    setNewFontSize(Math.max(6, Math.min(72, Number(e.target.value))))
                  }
                  className="input-base w-16 py-1.5 text-sm"
                  min={6}
                  max={72}
                />
              </div>
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-muted-foreground">Color</label>
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border border-border"
                />
              </div>
              <button
                onClick={() => setTool('select')}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          )}

          {/* ── Properties panel for selected overlay ── */}
          {selected && (
            <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl flex-wrap">
              {selected.type === 'text' && (
                <>
                  <span className="text-xs font-medium text-muted-foreground">Edit:</span>
                  <input
                    value={selected.text}
                    onChange={(e) =>
                      updateOverlay(selected.id, { text: e.target.value, modified: true })
                    }
                    className="input-base flex-1 min-w-40 py-1.5 text-sm"
                  />
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs text-muted-foreground">Size</label>
                    <input
                      type="number"
                      value={selected.fontSize}
                      onChange={(e) =>
                        updateOverlay(selected.id, {
                          fontSize: Math.max(6, Math.min(72, Number(e.target.value))),
                          modified: true,
                        })
                      }
                      className="input-base w-16 py-1.5 text-sm"
                      min={6}
                      max={72}
                    />
                  </div>
                  <button
                    onClick={() =>
                      updateOverlay(selected.id, { bold: !selected.bold, modified: true })
                    }
                    className={`px-2.5 py-1.5 rounded-lg text-sm font-bold transition-colors ${selected.bold ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground'}`}
                  >
                    B
                  </button>
                  <button
                    onClick={() =>
                      updateOverlay(selected.id, { italic: !selected.italic, modified: true })
                    }
                    className={`px-2.5 py-1.5 rounded-lg text-sm italic transition-colors ${selected.italic ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground'}`}
                  >
                    I
                  </button>
                  <input
                    type="color"
                    value={selected.color}
                    onChange={(e) =>
                      updateOverlay(selected.id, { color: e.target.value, modified: true })
                    }
                    className="w-8 h-8 rounded cursor-pointer border border-border"
                  />
                </>
              )}
              <button
                onClick={() => removeOverlay(selected.id)}
                className="flex items-center gap-1 text-xs text-destructive hover:underline ml-auto"
              >
                <Trash2 size={12} />
                Delete
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* ── Page sidebar ── */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Pages ({pages.length})
              </p>
              <div className="space-y-1.5 max-h-[560px] overflow-y-auto pr-1">
                {pages.map((p, idx) => (
                  <div
                    key={p.id}
                    onClick={() => setCurrentPage(idx)}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                      currentPage === idx
                        ? 'bg-primary/10 border border-primary/30'
                        : 'bg-secondary hover:bg-secondary/80 border border-transparent'
                    }`}
                  >
                    <div className="w-8 h-10 bg-white border border-border rounded flex items-center justify-center shrink-0">
                      <FileText size={12} className="text-muted-foreground" />
                    </div>
                    <span className="text-xs flex-1 truncate">{p.label}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          rotatePage(p.id)
                        }}
                        className="p-0.5 hover:bg-primary/10 rounded text-muted-foreground hover:text-primary transition-colors"
                        title="Rotate 90°"
                      >
                        <RotateCw size={11} />
                      </button>
                      {pages.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deletePage(p.id)
                          }}
                          className="p-0.5 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-colors"
                          title="Delete page"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Canvas area ── */}
            <div className="lg:col-span-3 space-y-2">
              {/* Page nav */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage + 1} of {pages.length}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(pages.length - 1, p + 1))}
                  disabled={currentPage >= pages.length - 1}
                  className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Canvas */}
              <div
                ref={pageContainerRef}
                className={`relative bg-white border border-border rounded-xl overflow-hidden shadow-sm select-none ${
                  tool === 'add-text' ? 'cursor-crosshair' : 'cursor-default'
                }`}
                style={{ minHeight: 400 }}
                onClick={handleCanvasClick}
              >
                {pageRendering && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
                    <Loader2 size={24} className="animate-spin text-primary" />
                  </div>
                )}

                {pageDataUrl && (
                  <img
                    src={pageDataUrl}
                    alt={`Page ${currentPage + 1}`}
                    className="w-full block"
                    style={{
                      transform: `rotate(${pages[currentPage]?.rotation ?? 0}deg)`,
                      transition: 'transform 0.2s',
                    }}
                    onLoad={(e) => {
                      const img = e.currentTarget
                      setPagePixelSize({ w: img.clientWidth, h: img.clientHeight })
                    }}
                  />
                )}

                {/* Overlays */}
                {pageDataUrl &&
                  currentOverlays.map((ov) => {
                    const isSelected = selectedId === ov.id
                    const containerH = pagePixelSize.h
                    // Extracted text that hasn't been modified is invisible - it's a hit zone
                    // over the already-rendered PDF canvas text. Only show it when selected
                    // or when it's been changed (at which point save will white-out the original).
                    const isExtractedUnchanged = ov.source === 'extracted' && !ov.modified

                    return (
                      <div
                        key={ov.id}
                        onMouseDown={(e) => startDrag(e, ov.id, 'move', ov)}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedId(ov.id)
                          setEditingId(null)
                        }}
                        style={{
                          position: 'absolute',
                          left: `${ov.x * 100}%`,
                          top: `${ov.y * 100}%`,
                          width: `${ov.w * 100}%`,
                          minHeight: `${ov.h * 100}%`,
                          cursor: 'move',
                          // Show selection ring for all selected overlays.
                          // For unmodified extracted text, use a faint hover ring so user
                          // can see it's clickable without doubling the rendered text.
                          outline: isSelected
                            ? '2px solid #3b82f6'
                            : isExtractedUnchanged
                              ? 'none'
                              : 'none',
                          outlineOffset: '1px',
                          boxSizing: 'border-box',
                          userSelect: 'none',
                          // Subtle highlight on the selected extracted-text hit zone
                          background:
                            isSelected && isExtractedUnchanged
                              ? 'rgba(59,130,246,0.15)'
                              : 'transparent',
                        }}
                      >
                        {ov.type === 'text' ? (
                          <span
                            style={{
                              display: 'block',
                              fontSize: `${(ov.fontSize / pdfPageSize.h) * containerH}px`,
                              // Invisible when it's unmodified extracted text (PDF canvas already shows it)
                              // Visible once user has changed text/style/position
                              color: isExtractedUnchanged ? 'transparent' : ov.color,
                              fontFamily: 'Helvetica, Arial, sans-serif',
                              fontWeight: ov.bold ? 'bold' : 'normal',
                              fontStyle: ov.italic ? 'italic' : 'normal',
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                              lineHeight: 1.2,
                              pointerEvents: 'none',
                            }}
                          >
                            {ov.text}
                          </span>
                        ) : (
                          ov.imageData && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={ov.imageData}
                              alt="overlay"
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                display: 'block',
                                pointerEvents: 'none',
                              }}
                            />
                          )
                        )}

                        {/* Resize handle (bottom-right corner) */}
                        {isSelected && (
                          <div
                            onMouseDown={(e) => {
                              e.stopPropagation()
                              startDrag(e, ov.id, 'resize', ov)
                            }}
                            style={{
                              position: 'absolute',
                              right: -5,
                              bottom: -5,
                              width: 12,
                              height: 12,
                              background: '#3b82f6',
                              borderRadius: 3,
                              cursor: 'se-resize',
                              zIndex: 10,
                            }}
                          />
                        )}
                      </div>
                    )
                  })}
              </div>

              <p className="text-xs text-muted-foreground">
                {tool === 'select'
                  ? 'Click to select - drag to move - drag corner handle to resize'
                  : 'Click on the page to place text'}
              </p>
            </div>
          </div>
        </>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-600">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PdfEditorTool() {
  const [tab, setTab] = useState<Tab>('edit')

  const tabs: { value: Tab; label: string; icon: React.ReactNode }[] = [
    { value: 'edit', label: 'Edit PDF', icon: <Type size={16} /> },
    { value: 'merge', label: 'Merge PDFs', icon: <Merge size={16} /> },
    { value: 'split', label: 'Split PDF', icon: <Scissors size={16} /> },
  ]

  return (
    <div className="space-y-6 w-full">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-0">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
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

      {/* Content */}
      {tab === 'edit' && <EditTab />}
      {tab === 'merge' && <MergeTab />}
      {tab === 'split' && <SplitTab />}
    </div>
  )
}
