'use client'

import { useState } from 'react'
import { Loader2, AlertCircle, Copy, Check, Plus, X } from 'lucide-react'

interface ApiTesterToolProps {
  toolId: string
}

interface Header {
  key: string
  value: string
}

export function ApiTesterTool({ toolId }: ApiTesterToolProps) {
  const [url, setUrl] = useState('')
  const [method, setMethod] = useState('GET')
  const [headers, setHeaders] = useState<Header[]>([{ key: '', value: '' }])
  const [body, setBody] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [bodyTab, setBodyTab] = useState('json')

  const hasBody = ['POST', 'PUT', 'PATCH'].includes(method)

  const handleExecute = async () => {
    setLoading(true)
    setError('')
    try {
      if (!url.trim()) {
        throw new Error('Please enter a URL')
      }

      const headersObj: Record<string, string> = {}
      headers.forEach((h) => {
        if (h.key && h.value) {
          headersObj[h.key] = h.value
        }
      })

      const requestBody = {
        url: url.trim(),
        method,
        headers: JSON.stringify(headersObj),
        body: hasBody && body ? body : '',
      }

      if (hasBody && body) {
        try {
          JSON.parse(body)
        } catch {
          throw new Error('Request body must be valid JSON')
        }
      }

      const response = await fetch(`/api/tools/${toolId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Request failed')
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
      const text = JSON.stringify(result, null, 2)
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }])
  }

  const removeHeader = (idx: number) => {
    setHeaders(headers.filter((_, i) => i !== idx))
  }

  const updateHeader = (idx: number, key: 'key' | 'value', val: string) => {
    const newHeaders = [...headers]
    newHeaders[idx][key] = val
    setHeaders(newHeaders)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        {/* URL & Method */}
        <div className="card-base p-4 space-y-3">
          <div>
            <label className="block font-medium text-foreground mb-2">URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/endpoint"
              className="input-base"
            />
          </div>

          <div>
            <label className="block font-medium text-foreground mb-2">Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="input-base"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
          </div>
        </div>

        {/* Headers */}
        <div className="card-base p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-medium text-foreground">Headers</label>
            <button
              onClick={addHeader}
              className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
            >
              <Plus size={16} /> Add
            </button>
          </div>

          <div className="space-y-2 max-h-40 overflow-auto">
            {headers.map((header, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  value={header.key}
                  onChange={(e) => updateHeader(idx, 'key', e.target.value)}
                  placeholder="Key (e.g., Authorization)"
                  className="input-base flex-1 text-sm"
                />
                <input
                  type="text"
                  value={header.value}
                  onChange={(e) => updateHeader(idx, 'value', e.target.value)}
                  placeholder="Value"
                  className="input-base flex-1 text-sm"
                />
                {headers.length > 1 && (
                  <button
                    onClick={() => removeHeader(idx)}
                    className="p-2 hover:bg-red-500/10 rounded transition-colors text-red-500"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        {hasBody && (
          <div className="card-base p-4 space-y-3">
            <label className="font-medium text-foreground">Request Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder='{"key": "value"}'
              className="input-base h-40 font-mono text-sm resize-none"
            />
          </div>
        )}

        <button
          onClick={handleExecute}
          disabled={loading || !url}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Sending...
            </>
          ) : (
            `Send ${method} Request`
          )}
        </button>
      </div>

      {/* Response */}
      <div className="space-y-4">
        <label className="block font-medium text-foreground">Response</label>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {/* Status */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Status</p>
                <p
                  className={`text-2xl font-bold ${
                    result.status >= 200 && result.status < 300
                      ? 'text-green-600'
                      : result.status >= 300 && result.status < 400
                        ? 'text-blue-600'
                        : result.status >= 400 && result.status < 500
                          ? 'text-orange-600'
                          : 'text-red-600'
                  }`}
                >
                  {result.status}
                </p>
              </div>
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Size</p>
                <p className="text-lg font-bold text-foreground">{result.size} B</p>
              </div>
            </div>

            {/* Headers */}
            {result.headers && Object.keys(result.headers).length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Response Headers</p>
                <div className="bg-secondary rounded-lg p-3 max-h-32 overflow-auto">
                  {Object.entries(result.headers).map(([key, val]) => (
                    <div key={key} className="text-xs mb-1">
                      <span className="text-muted-foreground">{key}:</span>
                      <span className="ml-2 text-foreground break-all">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Body */}
            {result.body && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Response Body</p>
                <div className="bg-secondary rounded-lg p-3 font-mono text-sm max-h-48 overflow-auto">
                  <pre className="whitespace-pre-wrap break-words text-xs">
                    {typeof result.body === 'string'
                      ? result.body
                      : JSON.stringify(result.body, null, 2)}
                  </pre>
                </div>
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
                  Copy Response
                </>
              )}
            </button>
          </div>
        )}

        {!result && !error && (
          <div className="bg-secondary rounded-lg p-4 h-96 flex items-center justify-center text-muted-foreground">
            Response will appear here
          </div>
        )}
      </div>
    </div>
  )
}
