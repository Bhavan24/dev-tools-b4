'use client'
import { useState } from 'react'
import { useToolApi, ExecuteButton } from './base/tool-layout'
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react'

interface LintIssue {
  line: number
  rule: string
  message: string
  severity: 'error' | 'warning'
}

interface LintResult {
  valid: boolean
  issueCount: number
  errors: number
  warnings: number
  issues: LintIssue[]
}

const PLACEHOLDER = `# My Document
## Section One
Some content here.
### Subsection
Another paragraph with a bare URL https://example.com in it.
	Indented with a tab.
`

export function MarkdownLinterTool() {
  const [markdown, setMarkdown] = useState('')
  const [maxLineLength, setMaxLineLength] = useState(120)
  const [result, setResult] = useState<LintResult | null>(null)
  const { loading, error, call } = useToolApi('markdown-linter')

  const handleRun = async () => {
    const res = await call({ markdown, maxLineLength })
    if (res) setResult(res as LintResult)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Max line length:</label>
          <input
            type="number"
            value={maxLineLength}
            onChange={(e) => setMaxLineLength(Number(e.target.value))}
            min={0}
            className="input-base w-24 text-sm py-1.5 px-3"
          />
          <span className="text-xs text-muted-foreground">(0 = disabled)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Markdown Input</label>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder={PLACEHOLDER}
            className="input-base h-80 font-mono text-sm resize-none"
            spellCheck={false}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Lint Results</label>
          {result ? (
            <div className="h-80 overflow-auto space-y-2">
              <div className={`flex items-center gap-3 p-3 rounded-lg border ${
                result.valid
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}>
                {result.valid ? (
                  <CheckCircle2 size={18} className="text-green-600 shrink-0" />
                ) : (
                  <AlertCircle size={18} className="text-red-600 shrink-0" />
                )}
                <span className="text-sm font-medium">
                  {result.valid
                    ? 'No issues found'
                    : `${result.issueCount} issue${result.issueCount !== 1 ? 's' : ''} found`}
                </span>
                {!result.valid && (
                  <span className="text-xs text-muted-foreground ml-auto">
                    {result.errors > 0 && `${result.errors} error${result.errors !== 1 ? 's' : ''}`}
                    {result.errors > 0 && result.warnings > 0 && ', '}
                    {result.warnings > 0 && `${result.warnings} warning${result.warnings !== 1 ? 's' : ''}`}
                  </span>
                )}
              </div>

              {result.issues.map((issue, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-3 rounded-lg border text-sm ${
                    issue.severity === 'error'
                      ? 'border-red-500/30 bg-red-500/5'
                      : 'border-amber-500/30 bg-amber-500/5'
                  }`}
                >
                  {issue.severity === 'error' ? (
                    <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">Line {issue.line}</span>
                    {' '}
                    <span className="text-muted-foreground">{issue.message}</span>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground shrink-0">
                    {issue.rule}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-border rounded-lg h-80 flex items-center justify-center text-muted-foreground text-sm">
              Results will appear here
            </div>
          )}
        </div>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <ExecuteButton onClick={handleRun} loading={loading} label="Lint Markdown" />

      <p className="text-xs text-muted-foreground">
        Rules checked: MD001 (heading levels), MD018 (ATX heading format), MD022 (blank lines around headings), MD009 (trailing spaces), MD010 (hard tabs), MD013 (line length), MD034 (bare URLs), MD047 (file newline).
      </p>
    </div>
  )
}
