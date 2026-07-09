'use client'

import { useState, useRef } from 'react'
import {
  AlertCircle,
  Upload,
  Download,
  Copy,
  Check,
  Code,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react'
import DOMPurify from 'dompurify'

const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="80" fill="#6366f1" opacity="0.8"/>
  <rect x="60" y="60" width="80" height="80" fill="white" opacity="0.3" rx="8"/>
  <text x="100" y="108" font-family="Arial" font-size="18" fill="white" text-anchor="middle">SVG</text>
</svg>`

interface SvgViewerToolProps {
  toolId: string
}

export function SvgViewerTool({ toolId }: SvgViewerToolProps) {
  const [source, setSource] = useState(SAMPLE_SVG)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [viewMode, setViewMode] = useState<'split' | 'preview' | 'source'>('split')
  const inputRef = useRef<HTMLInputElement>(null)

  const validateAndSet = (value: string) => {
    setSource(value)
    if (!value.trim()) {
      setError('')
      return
    }
    if (!value.trim().toLowerCase().includes('<svg')) {
      setError('Input does not appear to be valid SVG.')
    } else {
      setError('')
    }
  }

  const handleFileUpload = (file: File) => {
    if (!file.name.endsWith('.svg') && file.type !== 'image/svg+xml') {
      setError('Please upload an .svg file.')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => validateAndSet((e.target?.result as string) || '')
    reader.readAsText(file)
  }

  const downloadSvg = () => {
    const blob = new Blob([source], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'image.svg'
    a.click()
    URL.revokeObjectURL(url)
  }

  const copySvg = () => {
    navigator.clipboard.writeText(source)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sanitizedSvg = source.trim()
    ? DOMPurify.sanitize(source, { USE_PROFILES: { svg: true, svgFilters: true } })
    : ''

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 p-1 bg-secondary rounded-xl">
          {(['split', 'preview', 'source'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${viewMode === m ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {m === 'split' ? (
                'Split'
              ) : m === 'preview' ? (
                <span className="flex items-center gap-1">
                  <Eye size={13} />
                  Preview
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Code size={13} />
                  Source
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}
            className="btn-secondary p-2"
            title="Zoom out"
          >
            <ZoomOut size={15} />
          </button>
          <span className="text-sm text-muted-foreground w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(4, z + 0.25))}
            className="btn-secondary p-2"
            title="Zoom in"
          >
            <ZoomIn size={15} />
          </button>
          <button onClick={() => setZoom(1)} className="btn-secondary p-2" title="Reset zoom">
            <RotateCcw size={15} />
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".svg,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleFileUpload(f)
          }}
        />
        <button
          onClick={() => inputRef.current?.click()}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <Upload size={15} />
          Upload SVG
        </button>
        <button onClick={copySvg} className="btn-secondary flex items-center gap-2 text-sm">
          {copied ? (
            <>
              <Check size={15} className="text-green-500" />
              Copied
            </>
          ) : (
            <>
              <Copy size={15} />
              Copy
            </>
          )}
        </button>
        <button
          onClick={downloadSvg}
          disabled={!source.trim() || !!error}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Download size={15} />
          Download
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
          <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div
        className={`grid gap-6 ${viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}
      >
        {(viewMode === 'split' || viewMode === 'source') && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">SVG source</label>
            <textarea
              value={source}
              onChange={(e) => validateAndSet(e.target.value)}
              placeholder="Paste your SVG code here..."
              className="input-base font-mono text-sm resize-none"
              style={{ height: '420px' }}
            />
          </div>
        )}

        {(viewMode === 'split' || viewMode === 'preview') && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Preview</label>
            <div
              className="bg-secondary border border-border rounded-xl overflow-auto flex items-center justify-center"
              style={{ height: '420px' }}
            >
              {sanitizedSvg && !error ? (
                <div
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: 'center',
                    transition: 'transform 0.15s',
                  }}
                  dangerouslySetInnerHTML={{ __html: sanitizedSvg }}
                />
              ) : (
                <p className="text-sm text-muted-foreground">SVG preview will appear here</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
