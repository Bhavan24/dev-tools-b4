'use client'

import { useState } from 'react'
import { useToolApi, ExecuteButton } from './base/tool-layout'
import { Copy, Check, Eye, EyeOff } from 'lucide-react'

const DEFAULT_PAYLOAD = JSON.stringify({ sub: '1234567890', name: 'John Doe', admin: true }, null, 2)

export function JwtGeneratorTool() {
  const [payload, setPayload] = useState(DEFAULT_PAYLOAD)
  const [secret, setSecret] = useState('your-secret-key')
  const [algorithm, setAlgorithm] = useState<'HS256' | 'HS512'>('HS256')
  const [expiresIn, setExpiresIn] = useState('1h')
  const [showSecret, setShowSecret] = useState(false)
  const [result, setResult] = useState<{ token: string; header: object; payload: object } | null>(null)
  const { loading, error, copied, call, copy } = useToolApi('jwt-generator')

  const handleGenerate = async () => {
    const res = await call({ payload, secret, algorithm, expiresIn: expiresIn || undefined })
    if (res !== null) setResult(res)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div>
          <label className="block font-medium text-foreground mb-2">Payload (JSON)</label>
          <textarea
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            className="input-base h-40 font-mono text-sm resize-none"
            placeholder='{"sub": "user123", "name": "Alice"}'
          />
        </div>

        <div>
          <label className="block font-medium text-foreground mb-2">Secret Key</label>
          <div className="relative">
            <input
              type={showSecret ? 'text' : 'password'}
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="input-base font-mono pr-10"
              placeholder="your-secret-key"
            />
            <button
              type="button"
              onClick={() => setShowSecret((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-foreground mb-2">Algorithm</label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as typeof algorithm)}
              className="input-base"
            >
              <option value="HS256">HS256</option>
              <option value="HS512">HS512</option>
            </select>
          </div>
          <div>
            <label className="block font-medium text-foreground mb-2">Expires In</label>
            <input
              type="text"
              value={expiresIn}
              onChange={(e) => setExpiresIn(e.target.value)}
              placeholder="1h / 7d / 3600"
              className="input-base font-mono"
            />
          </div>
        </div>

        <ExecuteButton onClick={handleGenerate} loading={loading} label="Generate Token" />

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <label className="block font-medium text-foreground">Output</label>
        {result ? (
          <>
            <div className="space-y-3">
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2 font-medium">Signed Token</p>
                <p className="font-mono text-xs break-all text-primary leading-relaxed">{result.token}</p>
              </div>
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2 font-medium">Header</p>
                <pre className="font-mono text-xs text-foreground">{JSON.stringify(result.header, null, 2)}</pre>
              </div>
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2 font-medium">Payload</p>
                <pre className="font-mono text-xs text-foreground">{JSON.stringify(result.payload, null, 2)}</pre>
              </div>
            </div>
            <button
              onClick={() => copy(result.token)}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              {copied ? (
                <><Check size={18} className="text-green-500" /> Copied</>
              ) : (
                <><Copy size={18} /> Copy Token</>
              )}
            </button>
          </>
        ) : (
          <div className="bg-secondary rounded-lg p-4 h-64 flex items-center justify-center text-muted-foreground">
            Generated token will appear here
          </div>
        )}
      </div>
    </div>
  )
}
