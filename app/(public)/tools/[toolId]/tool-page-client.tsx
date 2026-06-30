'use client'

import { useState } from 'react'
import { TOOLS } from '@/lib/constants'
import { Loader2, AlertCircle } from 'lucide-react'
import { MockDataGenerator } from '@/components/tools/mock-data-generator'

interface ToolPageClientProps {
  toolId: string
}

export function ToolPageClient({ toolId }: ToolPageClientProps) {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const tool = TOOLS.find((t) => t.id === toolId)

  if (!tool) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">Tool not found</p>
        </div>
      </div>
    )
  }

  if ('comingSoon' in tool && tool.comingSoon) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="card-base max-w-md text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{tool.name}</h2>
          <p className="text-muted-foreground mb-6">{tool.description}</p>
          <p className="text-primary font-semibold">Coming Soon</p>
        </div>
      </div>
    )
  }

  if (toolId === 'mock-data-generator') {
    return (
      <div className="max-w-4xl">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">{tool.name}</h2>
          <p className="text-sm text-muted-foreground">{tool.description}</p>
        </div>
        <MockDataGenerator toolId={toolId} />
      </div>
    )
  }

  const handleExecute = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/tools/${toolId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input,
          json: input,
          code: input,
          text: input,
          xml: input,
          csv: input,
          yaml: input,
          html: input,
          ini: input,
          base64: input,
          url: input,
          filename: input,
          pattern: input,
          testString: input,
          sql: input,
          tableName: tool.id.includes('sql') ? 'table1' : undefined,
        }),
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">{tool.name}</h2>
          <p className="text-sm text-muted-foreground">{tool.description}</p>
        </div>

        <div>
          <label className="block font-medium text-foreground mb-3">Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your input here..."
            className="input-base h-96 font-mono text-sm mb-4 resize-none"
          />

          <button
            onClick={handleExecute}
            disabled={loading}
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
      </div>

      {/* Output Section */}
      <div className="space-y-4">
        <div>
          <label className="block font-medium text-foreground mb-3">Output</label>

          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-secondary rounded-lg p-4 font-mono text-sm mb-4 max-h-96 overflow-auto">
              <pre className="whitespace-pre-wrap break-words">
                {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          {!result && !error && (
            <div className="bg-secondary rounded-lg p-4 h-96 flex items-center justify-center text-muted-foreground">
              Results will appear here
            </div>
          )}

          {result && (
            <button
              onClick={() => {
                const text = typeof result === 'string' ? result : JSON.stringify(result, null, 2)
                navigator.clipboard.writeText(text)
              }}
              className="btn-secondary w-full"
            >
              Copy Result
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
