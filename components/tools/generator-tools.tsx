'use client'

import { useState, useEffect } from 'react'
import { Loader2, AlertCircle, Copy, Check, RefreshCw } from 'lucide-react'

interface GeneratorToolsProps {
  toolId: string
}

export function GeneratorTools({ toolId }: GeneratorToolsProps) {
  if (toolId === 'uuid-generator') {
    return <UuidGeneratorTool />
  } else if (toolId === 'password-generator') {
    return <PasswordGeneratorTool />
  } else if (toolId === 'hash-generator') {
    return <HashGeneratorTool />
  } else if (toolId === 'json-generator') {
    return <JsonGeneratorTool />
  }
  return null
}

function UuidGeneratorTool() {
  const [count, setCount] = useState(5)
  const [result, setResult] = useState<{ uuids: string[] } | null>(null)
  const [loading, setLoading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/tools/uuid-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count }),
      })
      if (!response.ok) throw new Error('Generation failed')
      const data = await response.json()
      setResult(data.result)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const copyAll = () => {
    if (result?.uuids) {
      navigator.clipboard.writeText(result.uuids.join('\n'))
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block font-medium text-foreground mb-3">Number of UUIDs</label>
          <div className="flex gap-2 items-center">
            <input
              type="range"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="flex-1"
            />
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              className="input-base w-20"
            />
          </div>
        </div>

        <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? <Loader2 size={18} className="animate-spin" /> : 'Generate UUIDs'}
        </button>
      </div>

      {result && (
        <div className="card-base">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-foreground">{result.uuids.length} UUIDs Generated</h3>
            <button onClick={copyAll} className="btn-secondary text-sm flex items-center gap-1">
              <Copy size={14} />
              Copy All
            </button>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {result.uuids.map((uuid, idx) => (
              <div key={idx} className="bg-secondary rounded-lg p-3 flex justify-between items-center font-mono text-sm">
                <span>{uuid}</span>
                <button
                  onClick={() => copyToClipboard(uuid, idx)}
                  className="p-1 hover:bg-primary/10 rounded transition-colors"
                >
                  {copiedIndex === idx ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function PasswordGeneratorTool() {
  const [length, setLength] = useState(16)
  const [uppercase, setUppercase] = useState(true)
  const [lowercase, setLowercase] = useState(true)
  const [numbers, setNumbers] = useState(true)
  const [symbols, setSymbols] = useState(true)
  const [result, setResult] = useState<{ password: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!uppercase && !lowercase && !numbers && !symbols) {
      setError('Select at least one character type')
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/tools/password-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ length, uppercase, lowercase, numbers, symbols }),
      })
      if (!response.ok) throw new Error('Generation failed')
      const data = await response.json()
      setResult(data.result)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (result?.password) {
      navigator.clipboard.writeText(result.password)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getStrength = () => {
    let strength = 0
    if (uppercase) strength++
    if (lowercase) strength++
    if (numbers) strength++
    if (symbols) strength++
    const estimatedEntropy = Math.log2(Math.pow(26 * 2 + 10 + 33, length))
    if (estimatedEntropy < 50) return { text: 'Weak', color: 'bg-red-500' }
    if (estimatedEntropy < 80) return { text: 'Medium', color: 'bg-yellow-500' }
    return { text: 'Strong', color: 'bg-green-500' }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block font-medium text-foreground mb-3">Length: {length}</label>
          <input type="range" min={8} max={128} value={length} onChange={(e) => setLength(parseInt(e.target.value))} className="w-full" />
        </div>

        <div className="space-y-2">
          <h3 className="font-medium text-foreground">Character Types</h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="w-4 h-4 rounded border-border cursor-pointer"
            />
            <span className="text-sm">Uppercase (A-Z)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={lowercase}
              onChange={(e) => setLowercase(e.target.checked)}
              className="w-4 h-4 rounded border-border cursor-pointer"
            />
            <span className="text-sm">Lowercase (a-z)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={numbers}
              onChange={(e) => setNumbers(e.target.checked)}
              className="w-4 h-4 rounded border-border cursor-pointer"
            />
            <span className="text-sm">Numbers (0-9)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={symbols}
              onChange={(e) => setSymbols(e.target.checked)}
              className="w-4 h-4 rounded border-border cursor-pointer"
            />
            <span className="text-sm">Symbols (!@#$%^&*)</span>
          </label>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? <Loader2 size={18} className="animate-spin" /> : 'Generate Password'}
        </button>
      </div>

      {result && (
        <div className="card-base">
          <p className="text-sm text-muted-foreground mb-2">Generated Password</p>
          <div className="bg-secondary rounded-lg p-4 mb-4 flex justify-between items-center">
            <span className="font-mono text-lg font-bold break-all">{result.password}</span>
            <button onClick={copyToClipboard} className="p-2 hover:bg-primary/10 rounded transition-colors">
              {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Strength:</span>
            <div className={`${getStrength().color} text-white text-xs font-semibold px-3 py-1 rounded-full`}>{getStrength().text}</div>
          </div>
        </div>
      )}
    </div>
  )
}

function HashGeneratorTool() {
  const [text, setText] = useState('')
  const [algorithm, setAlgorithm] = useState<'md5' | 'sha1' | 'sha256' | 'sha512'>('sha256')
  const [result, setResult] = useState<{ hash: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleHash = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/tools/hash-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, algorithm }),
      })
      if (!response.ok) throw new Error('Hashing failed')
      const data = await response.json()
      setResult(data.result)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (result?.hash) {
      navigator.clipboard.writeText(result.hash)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div>
          <label className="block font-medium text-foreground mb-3">Text to Hash</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text..."
            className="input-base h-64 font-mono text-sm resize-none mb-4"
          />
        </div>

        <div>
          <label className="block font-medium text-foreground mb-3">Algorithm</label>
          <div className="grid grid-cols-2 gap-2">
            {(['md5', 'sha1', 'sha256', 'sha512'] as const).map((algo) => (
              <button
                key={algo}
                onClick={() => setAlgorithm(algo)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  algorithm === algo ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                {algo.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleHash} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? <Loader2 size={18} className="animate-spin" /> : 'Generate Hash'}
        </button>
      </div>

      <div className="space-y-4">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-secondary rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full text-white bg-primary`}>{algorithm.toUpperCase()}</span>
            </div>
            <div className="bg-background rounded p-3 font-mono text-xs break-all max-h-32 overflow-auto">{result.hash}</div>
            <button onClick={copyToClipboard} className="btn-secondary w-full flex items-center justify-center gap-2">
              {copied ? (
                <>
                  <Check size={18} className="text-green-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={18} />
                  Copy Hash
                </>
              )}
            </button>
          </div>
        )}

        {!result && !error && (
          <div className="bg-secondary rounded-lg p-4 h-64 flex items-center justify-center text-muted-foreground">
            Hash will appear here
          </div>
        )}
      </div>
    </div>
  )
}

function JsonGeneratorTool() {
  const [type, setType] = useState('person')
  const [count, setCount] = useState(10)
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/tools/json-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, count }),
      })
      if (!response.ok) throw new Error('Generation failed')
      const data = await response.json()
      setResult(data.result)
    } catch (err: any) {
      setError(err.message)
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
          <label className="block font-medium text-foreground mb-3">Data Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="input-base w-full">
            <option value="person">Person</option>
            <option value="product">Product</option>
            <option value="todo">Todo</option>
            <option value="note">Note</option>
          </select>
        </div>

        <div>
          <label className="block font-medium text-foreground mb-3">Count</label>
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 10)))}
            className="input-base"
          />
        </div>

        <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? <Loader2 size={18} className="animate-spin" /> : 'Generate JSON'}
        </button>
      </div>

      <div className="space-y-4">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-3">
            <div className="bg-secondary rounded-lg p-4 font-mono text-xs max-h-96 overflow-auto">
              <pre className="whitespace-pre-wrap break-words">{result}</pre>
            </div>
            <button onClick={copyToClipboard} className="btn-secondary w-full flex items-center justify-center gap-2">
              {copied ? (
                <>
                  <Check size={18} className="text-green-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={18} />
                  Copy JSON
                </>
              )}
            </button>
          </div>
        )}

        {!result && !error && (
          <div className="bg-secondary rounded-lg p-4 h-96 flex items-center justify-center text-muted-foreground">
            Generated JSON will appear here
          </div>
        )}
      </div>
    </div>
  )
}
