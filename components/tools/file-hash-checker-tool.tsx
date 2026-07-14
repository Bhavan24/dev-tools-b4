'use client'
import { useState, useRef } from 'react'
import { Upload, FileText, Copy, Check } from 'lucide-react'

interface HashResult {
  filename: string
  sizeBytes: number
  hashes: {
    md5: string
    sha1: string
    sha256: string
    sha512: string
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export function FileHashCheckerTool() {
  const [result, setResult] = useState<HashResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const processFile = (file: File) => {
    setError('')
    setResult(null)
    setLoading(true)
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer
        const bytes = new Uint8Array(arrayBuffer)
        let binary = ''
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]!)
        const base64 = btoa(binary)

        const res = await fetch('/api/tools/file-hash-checker', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileBase64: base64, filename: file.name }),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Hashing failed')
        }
        const data = await res.json()
        setResult(data.result as HashResult)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const copyHash = (algo: string, value: string) => {
    navigator.clipboard.writeText(value)
    setCopied(algo)
    setTimeout(() => setCopied(null), 2000)
  }

  const hashLabels = [
    { key: 'md5', label: 'MD5' },
    { key: 'sha1', label: 'SHA-1' },
    { key: 'sha256', label: 'SHA-256' },
    { key: 'sha512', label: 'SHA-512' },
  ] as const

  return (
    <div className="space-y-6">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
          dragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-muted/50'
        }`}
      >
        <input ref={fileRef} type="file" className="hidden" onChange={onFileChange} />
        <Upload size={36} className="mx-auto mb-3 text-muted-foreground" />
        <p className="font-medium">Drop any file here, or click to browse</p>
        <p className="text-sm text-muted-foreground mt-1">
          No file is uploaded to the server - hashing runs entirely in your browser
        </p>
      </div>

      {loading && (
        <div className="text-center text-muted-foreground text-sm py-4">
          Computing hashes...
        </div>
      )}

      {error && <p className="text-destructive text-sm">{error}</p>}

      {result && (
        <div className="card-base p-5 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <FileText size={20} className="text-primary shrink-0" />
            <div>
              <p className="font-semibold">{result.filename}</p>
              <p className="text-xs text-muted-foreground">{formatBytes(result.sizeBytes)}</p>
            </div>
          </div>
          <div className="space-y-3">
            {hashLabels.map(({ key, label }) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">{label}</span>
                  <button
                    onClick={() => copyHash(key, result.hashes[key])}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copied === key ? (
                      <><Check size={12} className="text-green-500" /> Copied</>
                    ) : (
                      <><Copy size={12} /> Copy</>
                    )}
                  </button>
                </div>
                <p className="font-mono text-sm bg-muted rounded px-3 py-2 break-all">
                  {result.hashes[key]}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
