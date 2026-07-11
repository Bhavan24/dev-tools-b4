'use client'

import { useState } from 'react'
import { Loader2, AlertCircle, Copy, Check } from 'lucide-react'

interface JsonClassConverterToolProps {
  toolId: string
}

const CONFIG: Record<string, { optionKey: string; optionLabel: string; optionDefault: string }> = {
  'json-to-java': { optionKey: 'className', optionLabel: 'Class Name', optionDefault: 'Data' },
  'json-to-csharp': { optionKey: 'className', optionLabel: 'Class Name', optionDefault: 'Data' },
  'json-to-xml': { optionKey: 'rootElement', optionLabel: 'Root Element', optionDefault: 'root' },
}

export function JsonClassConverterTool({ toolId }: JsonClassConverterToolProps) {
  const config = CONFIG[toolId] || CONFIG['json-to-java']
  const [json, setJson] = useState('')
  const [option, setOption] = useState(config.optionDefault)
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleExecute = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/tools/${toolId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          json,
          [config.optionKey]: option || config.optionDefault,
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

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div>
          <label className="block font-medium text-foreground mb-3">JSON Input</label>
          <textarea
            value={json}
            onChange={(e) => setJson(e.target.value)}
            placeholder="Enter JSON..."
            className="input-base h-96 font-mono text-sm mb-4 resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="block font-medium text-foreground text-sm">{config.optionLabel}</label>
          <input
            type="text"
            value={option}
            onChange={(e) => setOption(e.target.value)}
            placeholder={config.optionDefault}
            className="input-base"
          />
        </div>

        <button
          onClick={handleExecute}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Converting...
            </>
          ) : (
            'Convert'
          )}
        </button>
      </div>

      <div className="space-y-4">
        <label className="block font-medium text-foreground mb-3">Output</label>

        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-secondary rounded-lg p-4 font-mono text-sm mb-4 max-h-96 overflow-auto">
            <pre className="whitespace-pre-wrap wrap-break-word">{result}</pre>
          </div>
        )}

        {!result && !error && (
          <div className="bg-secondary rounded-lg p-4 h-96 flex items-center justify-center text-muted-foreground">
            Results will appear here
          </div>
        )}

        {result && (
          <button
            onClick={copyToClipboard}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check size={18} className="text-green-500" />
                Copied
              </>
            ) : (
              <>
                <Copy size={18} />
                Copy Result
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
