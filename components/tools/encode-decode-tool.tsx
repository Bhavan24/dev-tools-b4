'use client'

import { useState } from 'react'
import { Loader2, AlertCircle, Copy, Check } from 'lucide-react'

interface EncodeDecodeToolProps {
  toolId: string
}

const CONFIG: Record<string, { label1: string; label2: string; action1: string; action2: string }> =
  {
    'url-encoder-decoder': {
      label1: 'Encode',
      label2: 'Decode',
      action1: 'encode',
      action2: 'decode',
    },
    'html-encoder-decoder': {
      label1: 'Encode',
      label2: 'Decode',
      action1: 'encode',
      action2: 'decode',
    },
    'xml-string-escaper': {
      label1: 'Escape',
      label2: 'Unescape',
      action1: 'escape',
      action2: 'unescape',
    },
    'idn-converter': {
      label1: 'To ASCII',
      label2: 'To Unicode',
      action1: 'toAscii',
      action2: 'toUnicode',
    },
  }

export function EncodeDecodeTool({ toolId }: EncodeDecodeToolProps) {
  const config = CONFIG[toolId]
  const [input, setInput] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleExecute = async (action: string) => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/tools/${toolId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, action }),
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
          <label className="block font-medium text-foreground mb-3">Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text to encode/decode..."
            className="input-base h-64 font-mono text-sm mb-4 resize-none"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExecute(config.action1)}
            disabled={loading}
            className="flex-1 btn-primary flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : config.label1}
          </button>
          <button
            onClick={() => handleExecute(config.action2)}
            disabled={loading}
            className="flex-1 btn-secondary flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : config.label2}
          </button>
        </div>
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
          <div className="bg-secondary rounded-lg p-4 font-mono text-sm mb-4 max-h-64 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">{result}</pre>
          </div>
        )}

        {!result && !error && (
          <div className="bg-secondary rounded-lg p-4 h-64 flex items-center justify-center text-muted-foreground">
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
