'use client'
import { useState } from 'react'
import { useToolApi, ExecuteButton } from './base/tool-layout'
import { Copy, Check } from 'lucide-react'

interface FormatResult {
  formatted: string
  linesBefore: number
  linesAfter: number
  changed: boolean
}

const PLACEHOLDER = `# My Document

This is a paragraph.
## Section One
Some content here.
### Subsection

Another paragraph
with trailing spaces.
`

export function MarkdownFormatterTool() {
  const [markdown, setMarkdown] = useState('')
  const [headingStyle, setHeadingStyle] = useState('atx')
  const [result, setResult] = useState<FormatResult | null>(null)
  const [copied, setCopied] = useState(false)
  const { loading, error, call } = useToolApi('markdown-formatter')

  const handleRun = async () => {
    const res = await call({ markdown, headingStyle })
    if (res) setResult(res as FormatResult)
  }

  const applyFormatted = () => {
    if (result) {
      setMarkdown(result.formatted)
      setResult(null)
    }
  }

  const copy = () => {
    if (!result) return
    navigator.clipboard.writeText(result.formatted)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Heading style:</label>
          <select
            value={headingStyle}
            onChange={(e) => setHeadingStyle(e.target.value)}
            className="input-base text-sm py-1.5 px-3"
          >
            <option value="atx">ATX (# style)</option>
            <option value="preserve">Preserve</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Input</label>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder={PLACEHOLDER}
            className="input-base h-80 font-mono text-sm resize-none"
            spellCheck={false}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Formatted Output</label>
            {result && (
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded ${result.changed ? 'bg-amber-500/15 text-amber-600' : 'bg-green-500/15 text-green-600'}`}>
                  {result.changed ? 'Changes applied' : 'Already formatted'}
                </span>
                <button
                  onClick={copy}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copied ? <><Check size={12} className="text-green-500" />Copied</> : <><Copy size={12} />Copy</>}
                </button>
              </div>
            )}
          </div>
          {result ? (
            <pre className="font-mono text-sm bg-muted rounded-lg p-4 h-80 overflow-auto whitespace-pre-wrap">
              {result.formatted}
            </pre>
          ) : (
            <div className="border border-border rounded-lg h-80 flex items-center justify-center text-muted-foreground text-sm">
              Formatted output will appear here
            </div>
          )}
        </div>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <div className="flex gap-3">
        <ExecuteButton onClick={handleRun} loading={loading} label="Format Markdown" />
        {result?.changed && (
          <button onClick={applyFormatted} className="btn-secondary">
            Apply to Input
          </button>
        )}
      </div>

      {result && (
        <p className="text-xs text-muted-foreground">
          {result.linesBefore} lines in → {result.linesAfter} lines out
        </p>
      )}
    </div>
  )
}
