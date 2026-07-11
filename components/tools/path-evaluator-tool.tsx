'use client'

import { useState } from 'react'
import { Loader2, AlertCircle, Copy, Check } from 'lucide-react'

interface PathEvaluatorToolProps {
  toolId: string
}

type Mode = 'jsonpath' | 'xpath'

const JSON_SAMPLE = `{
  "store": {
    "books": [
      { "title": "Clean Code", "author": "Martin", "price": 29.99 },
      { "title": "The Pragmatic Programmer", "author": "Hunt", "price": 34.99 },
      { "title": "Refactoring", "author": "Fowler", "price": 39.99 }
    ],
    "name": "Tech Books"
  }
}`

const JSON_SAMPLE_PATH = '$.store.books[*].title'

const XML_SAMPLE = `<?xml version="1.0"?>
<catalog>
  <book id="1">
    <title>Clean Code</title>
    <author>Martin</author>
    <price>29.99</price>
  </book>
  <book id="2">
    <title>The Pragmatic Programmer</title>
    <author>Hunt</author>
    <price>34.99</price>
  </book>
  <book id="3">
    <title>Refactoring</title>
    <author>Fowler</author>
    <price>39.99</price>
  </book>
</catalog>`

const XML_SAMPLE_PATH = '//book/title/text()'

export function PathEvaluatorTool({ toolId }: PathEvaluatorToolProps) {
  const mode: Mode = toolId === 'xpath-evaluator' ? 'xpath' : 'jsonpath'

  const [input, setInput] = useState(mode === 'jsonpath' ? JSON_SAMPLE : XML_SAMPLE)
  const [path, setPath] = useState(mode === 'jsonpath' ? JSON_SAMPLE_PATH : XML_SAMPLE_PATH)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const evaluate = async () => {
    if (!input.trim() || !path.trim()) {
      setError('Both input and expression are required.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const response = await fetch(`/api/tools/${toolId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          mode === 'jsonpath' ? { json: input, path } : { xml: input, xpath: path }
        ),
      })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Evaluation failed')
      }
      const data = await response.json()
      setResult(data.result)
    } catch (err: any) {
      setError(err.message)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const resultText = result != null ? JSON.stringify(result, null, 2) : ''

  const copyResult = () => {
    navigator.clipboard.writeText(resultText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const label = mode === 'jsonpath' ? 'JSON' : 'XML'
  const exprLabel = mode === 'jsonpath' ? 'JSONPath expression' : 'XPath expression'
  const placeholder = mode === 'jsonpath' ? '$.store.books[*].title' : '//book/title/text()'

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{label} input</label>
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                setError('')
              }}
              className="input-base font-mono text-sm resize-none"
              style={{ height: '320px' }}
              placeholder={`Paste your ${label} here...`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{exprLabel}</label>
            <input
              type="text"
              value={path}
              onChange={(e) => {
                setPath(e.target.value)
                setError('')
              }}
              onKeyDown={(e) => e.key === 'Enter' && evaluate()}
              placeholder={placeholder}
              className="input-base font-mono text-sm"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            onClick={evaluate}
            disabled={!input.trim() || !path.trim() || loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Evaluating…
              </>
            ) : (
              'Evaluate'
            )}
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-foreground">Results</label>
            {result != null && (
              <button
                onClick={copyResult}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-green-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    Copy
                  </>
                )}
              </button>
            )}
          </div>

          {result != null ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                {Array.isArray(result)
                  ? `${result.length} match${result.length !== 1 ? 'es' : ''}`
                  : '1 result'}
              </p>
              <div
                className="bg-secondary rounded-xl p-4 font-mono text-sm overflow-auto"
                style={{ height: '360px' }}
              >
                <pre className="whitespace-pre-wrap wrap-break-word">{resultText}</pre>
              </div>
            </div>
          ) : (
            <div
              className="bg-secondary rounded-xl flex items-center justify-center text-muted-foreground text-sm"
              style={{ height: '400px' }}
            >
              Results will appear here
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
