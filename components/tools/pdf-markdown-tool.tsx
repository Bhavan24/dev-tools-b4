'use client'

import { useState, useRef } from 'react'
import { Loader2, AlertCircle, Download, Upload, Copy, Check, FileText, FileCode } from 'lucide-react'
import { marked } from 'marked'

interface PdfMarkdownToolProps {
  toolId: string
}

type Tab = 'pdf-to-md' | 'md-to-pdf'

export function PdfMarkdownTool({ toolId }: PdfMarkdownToolProps) {
  const [tab, setTab] = useState<Tab>('pdf-to-md')

  return (
    <div className="space-y-6">
      <div className="flex gap-1 p-1 bg-secondary rounded-xl w-fit">
        <button
          onClick={() => setTab('pdf-to-md')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'pdf-to-md' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          PDF → Markdown
        </button>
        <button
          onClick={() => setTab('md-to-pdf')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'md-to-pdf' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Markdown → PDF
        </button>
      </div>

      {tab === 'pdf-to-md' ? <PdfToMarkdownPanel /> : <MarkdownToPdfPanel />}
    </div>
  )
}

// ─── PDF → Markdown ───────────────────────────────────────────────────────────

function PdfToMarkdownPanel() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ markdown: string; pageCount: number; wordCount: number } | null>(null)
  const [copied, setCopied] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file.')
      return
    }
    setError('')
    setResult(null)
    setLoading(true)
    setFileName(file.name)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
      const response = await fetch('/api/tools/pdf-to-markdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfBase64: base64 }),
      })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Conversion failed')
      }
      const data = await response.json()
      setResult(data.result)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const downloadMarkdown = () => {
    if (!result) return
    const blob = new Blob([result.markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName.replace(/\.pdf$/i, '.md') || 'output.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyMarkdown = () => {
    if (!result) return
    navigator.clipboard.writeText(result.markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f) }}
        />
        <div
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
            dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-secondary/50'
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) processFile(f) }}
        >
          <FileText size={36} className="mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium text-foreground mb-1">Drop a PDF here or click to upload</p>
          <p className="text-sm text-muted-foreground">PDF files only</p>
        </div>

        {fileName && !error && (
          <div className="bg-secondary rounded-lg px-4 py-2 flex items-center gap-2 text-sm">
            <FileText size={16} className="text-primary shrink-0" />
            <span className="truncate text-foreground">{fileName}</span>
          </div>
        )}

        {error && <ErrorBanner message={error} />}

        <button
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader2 size={18} className="animate-spin" />Converting…</>
          ) : (
            <><Upload size={18} />Select PDF</>
          )}
        </button>
      </div>

      <div className="space-y-4">
        {result ? (
          <>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{result.pageCount} page{result.pageCount !== 1 ? 's' : ''}</span>
              <span>·</span>
              <span>{result.wordCount.toLocaleString()} words</span>
            </div>
            <div className="bg-secondary rounded-xl p-4 font-mono text-sm max-h-96 overflow-auto">
              <pre className="whitespace-pre-wrap break-words">{result.markdown}</pre>
            </div>
            <div className="flex gap-2">
              <button onClick={copyMarkdown} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                {copied ? <><Check size={16} className="text-green-500" />Copied</> : <><Copy size={16} />Copy</>}
              </button>
              <button onClick={downloadMarkdown} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Download size={16} />Download .md
              </button>
            </div>
          </>
        ) : (
          <div className="bg-secondary rounded-xl h-72 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <FileCode size={40} className="opacity-30" />
            <p className="text-sm">Markdown output will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Markdown → PDF ───────────────────────────────────────────────────────────

function MarkdownToPdfPanel() {
  const [markdown, setMarkdown] = useState('')
  const [preview, setPreview] = useState(false)
  const [error, setError] = useState('')

  const getHtml = (): string => {
    try {
      return marked.parse(markdown) as string
    } catch {
      return ''
    }
  }

  const downloadPdf = () => {
    if (!markdown.trim()) { setError('Please enter some Markdown first.'); return }
    setError('')
    const html = getHtml()
    const printWindow = window.open('', '_blank')
    if (!printWindow) { setError('Popup blocked — please allow popups and try again.'); return }
    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Markdown Export</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #222; }
  h1,h2,h3,h4,h5,h6 { margin-top: 1.5em; margin-bottom: 0.5em; }
  pre { background: #f4f4f4; padding: 1em; border-radius: 6px; overflow-x: auto; }
  code { background: #f4f4f4; padding: 0.2em 0.4em; border-radius: 4px; font-size: 0.9em; }
  pre code { background: none; padding: 0; }
  blockquote { border-left: 4px solid #ccc; margin: 0; padding-left: 1em; color: #555; }
  table { border-collapse: collapse; width: 100%; }
  th,td { border: 1px solid #ddd; padding: 8px 12px; }
  th { background: #f4f4f4; }
  img { max-width: 100%; }
  a { color: #0066cc; }
</style>
</head>
<body>${html}</body>
</html>`)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => { printWindow.print(); printWindow.close() }, 300)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div>
          <label className="block font-medium text-foreground mb-2">Markdown source</label>
          <textarea
            value={markdown}
            onChange={(e) => { setMarkdown(e.target.value); setError('') }}
            placeholder={'# My Document\n\nWrite your **Markdown** here...\n\n## Section\n\nSome paragraph text.'}
            className="input-base h-80 font-mono text-sm resize-none"
          />
        </div>
        {error && <ErrorBanner message={error} />}
        <div className="flex gap-2">
          <button
            onClick={() => setPreview((p) => !p)}
            className="btn-secondary flex-1"
          >
            {preview ? 'Hide Preview' : 'Preview'}
          </button>
          <button
            onClick={downloadPdf}
            disabled={!markdown.trim()}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            <Download size={16} />Print / Save PDF
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Opens the browser print dialog — choose "Save as PDF" to download.
        </p>
      </div>

      <div className="space-y-3">
        <label className="block font-medium text-foreground">Preview</label>
        {preview && markdown.trim() ? (
          <div
            className="bg-background border border-border rounded-xl p-5 max-h-96 overflow-auto prose prose-sm"
            dangerouslySetInnerHTML={{ __html: getHtml() }}
          />
        ) : (
          <div className="bg-secondary rounded-xl h-72 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <FileText size={40} className="opacity-30" />
            <p className="text-sm">{preview ? 'Nothing to preview yet' : 'Click Preview to see rendered output'}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Shared ───────────────────────────────────────────────────────────────────

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
      <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
      <p className="text-sm text-red-600">{message}</p>
    </div>
  )
}
