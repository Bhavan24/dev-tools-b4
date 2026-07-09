'use client'

import { useState, useRef } from 'react'
import { AlertCircle, Upload, Download, Copy, Check, Image as ImageIcon, Code } from 'lucide-react'

interface ImageDataUriToolProps {
  toolId: string
}

type Tab = 'to-uri' | 'from-uri'

export function ImageDataUriTool({ toolId }: ImageDataUriToolProps) {
  const [tab, setTab] = useState<Tab>('to-uri')

  return (
    <div className="space-y-6">
      <div className="flex gap-1 p-1 bg-secondary rounded-xl w-fit">
        <button
          onClick={() => setTab('to-uri')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'to-uri' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Image → Data URI
        </button>
        <button
          onClick={() => setTab('from-uri')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'from-uri' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Data URI → Image
        </button>
      </div>

      {tab === 'to-uri' ? <ImageToUriPanel /> : <UriToImagePanel />}
    </div>
  )
}

// ─── Image → Data URI ─────────────────────────────────────────────────────────

function ImageToUriPanel() {
  const [dataUri, setDataUri] = useState('')
  const [mimeType, setMimeType] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const ACCEPTED = [
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/ico',
    'image/x-icon',
  ]

  const processFile = (file: File) => {
    if (!ACCEPTED.includes(file.type) && !file.name.match(/\.(png|jpe?g|gif|webp|svg|bmp|ico)$/i)) {
      setError('Unsupported file type. Accepted: PNG, JPEG, GIF, WebP, SVG, BMP, ICO.')
      return
    }
    setError('')
    setFileName(file.name)
    setFileSize(file.size)
    setMimeType(file.type || 'image/png')
    const reader = new FileReader()
    reader.onload = (e) => setDataUri((e.target?.result as string) || '')
    reader.readAsDataURL(file)
  }

  const copy = () => {
    navigator.clipboard.writeText(dataUri)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatSize = (bytes: number) =>
    bytes < 1024
      ? `${bytes} B`
      : bytes < 1048576
        ? `${(bytes / 1024).toFixed(1)} KB`
        : `${(bytes / 1048576).toFixed(2)} MB`

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) processFile(f)
          }}
        />
        <div
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-secondary/50'}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            const f = e.dataTransfer.files?.[0]
            if (f) processFile(f)
          }}
        >
          <ImageIcon size={36} className="mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium text-foreground mb-1">Drop an image here or click to upload</p>
          <p className="text-sm text-muted-foreground">PNG, JPEG, GIF, WebP, SVG, BMP, ICO</p>
        </div>

        {fileName && !error && (
          <div className="bg-secondary rounded-lg px-4 py-2 text-sm flex items-center gap-2">
            <ImageIcon size={15} className="text-primary shrink-0" />
            <span className="truncate text-foreground">{fileName}</span>
            <span className="text-muted-foreground shrink-0 ml-auto">{formatSize(fileSize)}</span>
          </div>
        )}

        {error && <ErrorBanner message={error} />}
        <button
          onClick={() => inputRef.current?.click()}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Upload size={16} />
          Select Image
        </button>
      </div>

      <div className="space-y-4">
        {dataUri ? (
          <>
            <div
              className="bg-secondary rounded-xl p-3 flex items-center justify-center"
              style={{ height: '180px' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={dataUri}
                alt="Preview"
                className="max-h-full max-w-full object-contain rounded"
              />
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{mimeType}</span>
              <span>{formatSize(dataUri.length)} (encoded)</span>
            </div>
            <div className="bg-secondary rounded-xl p-3 font-mono text-xs max-h-40 overflow-auto break-all">
              {dataUri}
            </div>
            <button
              onClick={copy}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check size={16} className="text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={16} />
                  Copy Data URI
                </>
              )}
            </button>
          </>
        ) : (
          <div
            className="bg-secondary rounded-xl flex flex-col items-center justify-center gap-3 text-muted-foreground"
            style={{ height: '300px' }}
          >
            <Code size={40} className="opacity-30" />
            <p className="text-sm">Data URI will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Data URI → Image ─────────────────────────────────────────────────────────

function UriToImagePanel() {
  const [uri, setUri] = useState('')
  const [error, setError] = useState('')
  const [previewSrc, setPreviewSrc] = useState('')

  const validate = (value: string) => {
    setUri(value)
    setError('')
    setPreviewSrc('')
    if (!value.trim()) return
    if (!value.trim().startsWith('data:image/')) {
      setError('Input must be a valid image Data URI starting with "data:image/".')
      return
    }
    setPreviewSrc(value.trim())
  }

  const download = () => {
    if (!previewSrc) return
    const mime = previewSrc.split(';')[0]?.replace('data:', '') || 'image/png'
    const ext = mime.split('/')[1] || 'png'
    const a = document.createElement('a')
    a.href = previewSrc
    a.download = `image.${ext}`
    a.click()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Data URI input</label>
          <textarea
            value={uri}
            onChange={(e) => validate(e.target.value)}
            placeholder="data:image/png;base64,iVBORw0KGgo..."
            className="input-base font-mono text-sm resize-none"
            style={{ height: '320px' }}
          />
        </div>
        {error && <ErrorBanner message={error} />}
        <button
          onClick={download}
          disabled={!previewSrc}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Download size={16} />
          Download Image
        </button>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-foreground">Preview</label>
        {previewSrc ? (
          <div
            className="bg-secondary border border-border rounded-xl p-4 flex items-center justify-center"
            style={{ height: '360px' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewSrc}
              alt="Decoded preview"
              className="max-h-full max-w-full object-contain rounded"
            />
          </div>
        ) : (
          <div
            className="bg-secondary rounded-xl flex flex-col items-center justify-center gap-3 text-muted-foreground"
            style={{ height: '360px' }}
          >
            <ImageIcon size={40} className="opacity-30" />
            <p className="text-sm">Image preview will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
      <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
      <p className="text-sm text-red-600">{message}</p>
    </div>
  )
}
