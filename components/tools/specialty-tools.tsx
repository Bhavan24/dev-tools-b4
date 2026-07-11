'use client'

import { useState } from 'react'
import { Loader2, AlertCircle, Copy, Check } from 'lucide-react'

interface SpecialtyToolsProps {
  toolId: string
}

export function SpecialtyTools({ toolId }: SpecialtyToolsProps) {
  if (toolId === 'jwt-decoder') {
    return <JwtDecoderTool />
  } else if (toolId === 'text-case-converter') {
    return <TextCaseConverterTool />
  } else if (toolId === 'regex-parser') {
    return <RegexParserTool />
  }
  return null
}

function JwtDecoderTool() {
  const [token, setToken] = useState('')
  const [result, setResult] = useState<{ header: any; payload: any; signature: string } | null>(
    null
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  const handleDecode = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/tools/jwt-decoder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Decoding failed')
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

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <label className="block font-medium text-foreground mb-3">JWT Token</label>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste your JWT token here..."
          className="input-base h-24 font-mono text-xs resize-none"
        />
        <button
          onClick={handleDecode}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : 'Decode'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Header */}
          <div className="card-base">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-foreground">Header</h3>
              <button
                onClick={() => copyToClipboard(JSON.stringify(result.header, null, 2), 'header')}
                className="p-2 hover:bg-primary/10 rounded transition-colors"
              >
                {copied === 'header' ? (
                  <Check size={16} className="text-green-500" />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </div>
            <div className="bg-background rounded p-3 font-mono text-xs overflow-auto max-h-32">
              <pre className="whitespace-pre-wrap wrap-break-word">
                {JSON.stringify(result.header, null, 2)}
              </pre>
            </div>
          </div>

          {/* Payload */}
          <div className="card-base">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-foreground">Payload</h3>
              <button
                onClick={() => copyToClipboard(JSON.stringify(result.payload, null, 2), 'payload')}
                className="p-2 hover:bg-primary/10 rounded transition-colors"
              >
                {copied === 'payload' ? (
                  <Check size={16} className="text-green-500" />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </div>
            <div className="bg-background rounded p-3 font-mono text-xs overflow-auto max-h-32">
              <pre className="whitespace-pre-wrap wrap-break-word">
                {JSON.stringify(result.payload, null, 2)}
              </pre>
            </div>
          </div>

          {/* Signature */}
          <div className="card-base">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-foreground">Signature</h3>
              <button
                onClick={() => copyToClipboard(result.signature, 'signature')}
                className="p-2 hover:bg-primary/10 rounded transition-colors"
              >
                {copied === 'signature' ? (
                  <Check size={16} className="text-green-500" />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </div>
            <div className="bg-background rounded p-3 font-mono text-xs overflow-auto max-h-32 break-all">
              {result.signature}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TextCaseConverterTool() {
  const [text, setText] = useState('')
  const [targetCase, setTargetCase] = useState('uppercase')
  const [result, setResult] = useState<{ converted: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleConvert = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/tools/text-case-converter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, case: targetCase }),
      })
      if (!response.ok) throw new Error('Conversion failed')
      const data = await response.json()
      setResult(data.result)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (result?.converted) {
      navigator.clipboard.writeText(result.converted)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const caseOptions = [
    { value: 'uppercase', label: 'UPPERCASE' },
    { value: 'lowercase', label: 'lowercase' },
    { value: 'capitalize', label: 'Capitalize' },
    { value: 'camelCase', label: 'camelCase' },
    { value: 'snake_case', label: 'snake_case' },
    { value: 'kebab-case', label: 'kebab-case' },
    { value: 'PascalCase', label: 'PascalCase' },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div>
          <label className="block font-medium text-foreground mb-3">Text Input</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text..."
            className="input-base h-64 font-mono text-sm resize-none mb-4"
          />
        </div>

        <div>
          <label className="block font-medium text-foreground mb-3">Target Case</label>
          <select
            value={targetCase}
            onChange={(e) => setTargetCase(e.target.value)}
            className="input-base w-full"
          >
            {caseOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleConvert}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : 'Convert'}
        </button>
      </div>

      <div className="space-y-4">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-secondary rounded-lg p-4 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Converted Text</p>
              <div className="bg-background rounded p-4 font-mono text-sm wrap-break-word max-h-32 overflow-auto">
                {result.converted}
              </div>
            </div>
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
          </div>
        )}

        {!result && !error && (
          <div className="bg-secondary rounded-lg p-4 h-64 flex items-center justify-center text-muted-foreground">
            Converted text will appear here
          </div>
        )}
      </div>
    </div>
  )
}

function RegexParserTool() {
  const [pattern, setPattern] = useState('^[a-z]+@[a-z]+\\.[a-z]{2,}$')
  const [flags, setFlags] = useState('i')
  const [testString, setTestString] = useState('test@example.com')
  const [result, setResult] = useState<{
    matches: string[]
    hasMatch: boolean
    isValid: boolean
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTest = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/tools/regex-parser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pattern, flags, testString }),
      })
      if (!response.ok) throw new Error('Test failed')
      const data = await response.json()
      setResult(data.result)
    } catch (err: any) {
      setError(err.message)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <label className="block font-medium text-foreground mb-2 text-sm">Regex Pattern</label>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="/pattern/"
              className="input-base font-mono text-sm"
            />
          </div>
          <div>
            <label className="block font-medium text-foreground mb-2 text-sm">Flags</label>
            <input
              type="text"
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              placeholder="g,i,m"
              className="input-base font-mono text-sm"
              maxLength={5}
            />
          </div>
        </div>

        <div>
          <label className="block font-medium text-foreground mb-2">Test String</label>
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Enter string to test..."
            className="input-base h-40 font-mono text-sm resize-none mb-4"
          />
        </div>

        <button
          onClick={handleTest}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : 'Test Pattern'}
        </button>
      </div>

      <div className="space-y-4">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {result && (
          <div className="card-base space-y-4">
            <div>
              <p
                className={`text-sm font-medium ${result.hasMatch ? 'text-green-600' : 'text-red-600'}`}
              >
                {result.hasMatch ? '✓ Matches Found' : '✗ No Matches'}
              </p>
            </div>

            {result.matches.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Matches ({result.matches.length})
                </p>
                <div className="space-y-1 max-h-32 overflow-auto">
                  {result.matches.map((match, idx) => (
                    <div
                      key={idx}
                      className="bg-secondary rounded px-3 py-1 font-mono text-xs wrap-break-word"
                    >
                      {match}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground mb-2">Test String</p>
              <div className="bg-secondary rounded p-3 font-mono text-xs max-h-20 overflow-auto wrap-break-word">
                {testString}
              </div>
            </div>
          </div>
        )}

        {!result && !error && (
          <div className="bg-secondary rounded-lg p-4 h-56 flex items-center justify-center text-muted-foreground">
            Test results will appear here
          </div>
        )}
      </div>
    </div>
  )
}
