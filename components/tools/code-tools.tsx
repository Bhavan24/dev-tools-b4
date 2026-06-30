'use client'

import { useState } from 'react'
import { Loader2, AlertCircle, Copy, Check } from 'lucide-react'

interface CodeToolsProps {
  toolId: string
}

export function CodeTools({ toolId }: CodeToolsProps) {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [language, setLanguage] = useState('js')

  const isCodeCleaner = toolId === 'code-cleaner'
  const isDiffChecker = toolId === 'diff-checker'

  const handleExecute = async () => {
    setLoading(true)
    setError('')
    try {
      const body: Record<string, any> = isCodeCleaner
        ? { code: input, language }
        : isDiffChecker
          ? { text1: input.split('\n\n---\n\n')[0] || '', text2: input.split('\n\n---\n\n')[1] || '' }
          : {}

      const response = await fetch(`/api/tools/${toolId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Tool execution failed')
      }

      const data = await response.json()
      setResult(data.result)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (result) {
      const text = typeof result === 'string' ? result : JSON.stringify(result, null, 2)
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        {isCodeCleaner ? (
          <>
            <div>
              <label className="block font-medium text-foreground mb-3">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="input-base"
              >
                <option value="js">JavaScript</option>
                <option value="css">CSS</option>
                <option value="html">HTML</option>
                <option value="py">Python</option>
                <option value="java">Java</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-foreground mb-3">Code to Clean</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your code here..."
                className="input-base h-96 font-mono text-sm resize-none"
              />
            </div>
          </>
        ) : (
          <div>
            <label className="block font-medium text-foreground mb-3">
              Compare Two Texts (separated by a blank line with ---)
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={'First text here\n\n---\n\nSecond text here'}
              className="input-base h-96 font-mono text-sm resize-none"
            />
          </div>
        )}

        <button
          onClick={handleExecute}
          disabled={loading || !input}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Processing...
            </>
          ) : (
            'Execute'
          )}
        </button>
      </div>

      <div className="space-y-4">
        <label className="block font-medium text-foreground mb-3">Output</label>

        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {isDiffChecker && result.diff ? (
              <div className="space-y-3">
                <div className="bg-secondary rounded-lg p-3 space-y-2 max-h-96 overflow-auto">
                  <div className="text-xs font-medium text-muted-foreground">
                    Similarity: <span className="text-foreground">{result.similarity}%</span>
                  </div>
                  <div className="text-xs font-medium text-muted-foreground">
                    Lines: {result.text1_lines} vs {result.text2_lines}
                  </div>
                  <div className="space-y-1">
                    {result.diff.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-2 rounded text-xs font-mono ${
                          item.type === 'removed'
                            ? 'bg-red-500/20 text-red-700 dark:text-red-400'
                            : 'bg-green-500/20 text-green-700 dark:text-green-400'
                        }`}
                      >
                        <span className="font-semibold">
                          {item.type === 'removed' ? '- ' : '+ '}
                        </span>
                        <span className="break-all">{item.content}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-secondary rounded-lg p-4 font-mono text-sm mb-4 max-h-96 overflow-auto">
                <pre className="whitespace-pre-wrap break-words">
                  {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}

            <button
              onClick={copyToClipboard}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check size={18} className="text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={18} />
                  Copy Result
                </>
              )}
            </button>
          </div>
        )}

        {!result && !error && (
          <div className="bg-secondary rounded-lg p-4 h-96 flex items-center justify-center text-muted-foreground">
            Results will appear here
          </div>
        )}
      </div>
    </div>
  )
}
