'use client'

import { useState, useRef } from 'react'
import { Loader2, AlertCircle, Download, Copy, Check, Code, FileCode } from 'lucide-react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

interface HtmlMarkdownToolProps {
  toolId: string
}

type Tab = 'html-to-md' | 'md-to-html'

export function HtmlMarkdownTool({ toolId }: HtmlMarkdownToolProps) {
  const [tab, setTab] = useState<Tab>('html-to-md')

  return (
    <div className="space-y-6">
      <div className="flex gap-1 p-1 bg-secondary rounded-xl w-fit">
        <button
          onClick={() => setTab('html-to-md')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'html-to-md' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          HTML → Markdown
        </button>
        <button
          onClick={() => setTab('md-to-html')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'md-to-html' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Markdown → HTML
        </button>
      </div>

      {tab === 'html-to-md' ? <HtmlToMarkdownPanel /> : <MarkdownToHtmlPanel />}
    </div>
  )
}

// ─── HTML → Markdown ──────────────────────────────────────────────────────────

function HtmlToMarkdownPanel() {
  const [html, setHtml] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ markdown: string; wordCount: number } | null>(null)
  const [copied, setCopied] = useState(false)

  const convert = async () => {
    if (!html.trim()) { setError('Please enter some HTML first.'); return }
    setError('')
    setLoading(true)
    try {
      const response = await fetch('/api/tools/html-to-markdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html }),
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

  const copyMarkdown = () => {
    if (!result) return
    navigator.clipboard.writeText(result.markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadMarkdown = () => {
    if (!result) return
    const blob = new Blob([result.markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'output.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div>
          <label className="block font-medium text-foreground mb-2">HTML input</label>
          <textarea
            value={html}
            onChange={(e) => { setHtml(e.target.value); setError(''); setResult(null) }}
            placeholder={'<h1>Hello World</h1>\n<p>This is a <strong>sample</strong> paragraph.</p>\n<ul>\n  <li>Item one</li>\n  <li>Item two</li>\n</ul>'}
            className="input-base h-80 font-mono text-sm resize-none"
          />
        </div>
        {error && <ErrorBanner message={error} />}
        <button
          onClick={convert}
          disabled={!html.trim() || loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" />Converting…</>
          ) : (
            <><Code size={16} />Convert to Markdown</>
          )}
        </button>
      </div>

      <div className="space-y-4">
        {result ? (
          <>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
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

// ─── Markdown → HTML ──────────────────────────────────────────────────────────

function MarkdownToHtmlPanel() {
  const [markdown, setMarkdown] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ html: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [viewMode, setViewMode] = useState<'preview' | 'source'>('preview')

  const getPreviewHtml = (): string => {
    try {
      const raw = marked.parse(markdown) as string
      return DOMPurify.sanitize(raw)
    } catch {
      return ''
    }
  }

  const convert = async () => {
    if (!markdown.trim()) { setError('Please enter some Markdown first.'); return }
    setError('')
    setLoading(true)
    try {
      const response = await fetch('/api/tools/markdown-to-html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown }),
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

  const copyHtml = () => {
    if (!result) return
    navigator.clipboard.writeText(result.html)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadHtml = () => {
    if (!result) return
    const blob = new Blob([result.html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'output.html'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block font-medium text-foreground mb-2">Markdown source</label>
            <textarea
              value={markdown}
              onChange={(e) => { setMarkdown(e.target.value); setError(''); setResult(null) }}
              placeholder={'# Hello World\n\nThis is a **sample** paragraph.\n\n- Item one\n- Item two'}
              className="input-base h-80 font-mono text-sm resize-none"
            />
          </div>
          {error && <ErrorBanner message={error} />}
          <button
            onClick={convert}
            disabled={!markdown.trim() || loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" />Converting…</>
            ) : (
              <><Code size={16} />Convert to HTML</>
            )}
          </button>
        </div>

        <div className="space-y-3">
          <label className="block font-medium text-foreground">Live preview</label>
          {markdown.trim() ? (
            <div
              className="bg-background border border-border rounded-xl p-5 max-h-96 overflow-auto prose prose-sm"
              dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
            />
          ) : (
            <div className="bg-secondary rounded-xl h-72 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Code size={40} className="opacity-30" />
              <p className="text-sm">Rendered preview appears here as you type</p>
            </div>
          )}
        </div>
      </div>

      {result && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex gap-1 p-1 bg-secondary rounded-lg">
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${viewMode === 'preview' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Preview
              </button>
              <button
                onClick={() => setViewMode('source')}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${viewMode === 'source' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                HTML Source
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={copyHtml} className="btn-secondary flex items-center gap-2 text-sm">
                {copied ? <><Check size={14} className="text-green-500" />Copied</> : <><Copy size={14} />Copy HTML</>}
              </button>
              <button onClick={downloadHtml} className="btn-primary flex items-center gap-2 text-sm">
                <Download size={14} />Download .html
              </button>
            </div>
          </div>

          {viewMode === 'preview' ? (
            <div
              className="bg-background border border-border rounded-xl p-5 max-h-96 overflow-auto prose prose-sm"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(result.html) }}
            />
          ) : (
            <div className="bg-secondary rounded-xl p-4 font-mono text-sm max-h-96 overflow-auto">
              <pre className="whitespace-pre-wrap break-words">{result.html}</pre>
            </div>
          )}
        </div>
      )}
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
