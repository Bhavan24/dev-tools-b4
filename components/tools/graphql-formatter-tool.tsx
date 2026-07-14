'use client'
import { useState } from 'react'
import { useToolApi, ExecuteButton } from './base/tool-layout'
import { Copy, Check } from 'lucide-react'

const EXAMPLE_QUERY = `query GetUser($id:ID!){user(id:$id){id name email posts{id title createdAt}}}`

export function GraphqlFormatterTool() {
  const [query, setQuery] = useState('')
  const [indentWidth, setIndentWidth] = useState(2)
  const [formatted, setFormatted] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const { loading, error, call } = useToolApi('graphql-formatter')

  const handleRun = async () => {
    const res = await call({ query, indentWidth })
    if (res) setFormatted((res as any).formatted)
  }

  const handleCopy = async () => {
    if (!formatted) return
    await navigator.clipboard.writeText(formatted)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Indent width:</label>
          <select
            value={indentWidth}
            onChange={(e) => setIndentWidth(Number(e.target.value))}
            className="input-base py-1.5 px-3 text-sm w-20"
          >
            <option value={2}>2</option>
            <option value={4}>4</option>
          </select>
        </div>
        <button
          onClick={() => setQuery(EXAMPLE_QUERY)}
          className="text-xs text-primary hover:underline ml-auto"
        >
          Load example
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Input</label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Paste a GraphQL query, mutation, subscription, or schema..."
            className="input-base h-72 font-mono text-sm resize-none"
            spellCheck={false}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium">Formatted Output</label>
            {formatted && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>
          {formatted ? (
            <pre className="input-base h-72 overflow-auto text-sm font-mono whitespace-pre p-3">
              {formatted}
            </pre>
          ) : (
            <div className="border border-border rounded-lg h-72 flex items-center justify-center text-muted-foreground text-sm">
              Formatted output will appear here
            </div>
          )}
        </div>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}
      <ExecuteButton onClick={handleRun} loading={loading} label="Format GraphQL" />
    </div>
  )
}
