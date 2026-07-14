'use client'
import { useState } from 'react'
import { useToolApi, ExecuteButton } from './base/tool-layout'
import { Copy, Check, ShieldCheck, ShieldX } from 'lucide-react'

export function BcryptTool() {
  const [tab, setTab] = useState<'hash' | 'verify'>('hash')

  // hash tab
  const [password, setPassword] = useState('')
  const [rounds, setRounds] = useState(10)
  const [hashResult, setHashResult] = useState('')
  const [copiedHash, setCopiedHash] = useState(false)

  // verify tab
  const [verifyPassword, setVerifyPassword] = useState('')
  const [verifyHash, setVerifyHash] = useState('')
  const [verifyMatch, setVerifyMatch] = useState<boolean | null>(null)

  const { loading, error, call } = useToolApi('bcrypt-tool')

  const handleHash = async () => {
    const res = await call({ action: 'hash', password, rounds })
    if (res) setHashResult(res.hash)
  }

  const handleVerify = async () => {
    setVerifyMatch(null)
    const res = await call({ action: 'verify', password: verifyPassword, hash: verifyHash })
    if (res) setVerifyMatch(res.match)
  }

  const copyHash = () => {
    navigator.clipboard.writeText(hashResult)
    setCopiedHash(true)
    setTimeout(() => setCopiedHash(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex border-b border-border">
        {(['hash', 'verify'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'hash' ? 'Hash Password' : 'Verify Password'}
          </button>
        ))}
      </div>

      {tab === 'hash' && (
        <div className="space-y-4 max-w-lg">
          <div>
            <label className="block text-sm font-medium mb-2">Plain-text Password</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password to hash..."
              className="input-base w-full font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Cost Rounds: <span className="text-primary font-mono">{rounds}</span>
            </label>
            <input
              type="range"
              min={4}
              max={14}
              value={rounds}
              onChange={(e) => setRounds(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>4 (fast)</span>
              <span>10 (default)</span>
              <span>14 (slow)</span>
            </div>
          </div>
          <ExecuteButton onClick={handleHash} loading={loading} label="Hash Password" loadingLabel="Hashing..." />
          {error && <p className="text-destructive text-sm">{error}</p>}
          {hashResult && (
            <div className="card-base p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-semibold uppercase">bcrypt hash</span>
                <button
                  onClick={copyHash}
                  className="flex items-center gap-1 text-xs hover:text-foreground transition-colors text-muted-foreground"
                >
                  {copiedHash ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  {copiedHash ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="font-mono text-sm break-all whitespace-pre-wrap bg-muted rounded p-3">
                {hashResult}
              </pre>
            </div>
          )}
        </div>
      )}

      {tab === 'verify' && (
        <div className="space-y-4 max-w-lg">
          <div>
            <label className="block text-sm font-medium mb-2">Plain-text Password</label>
            <input
              type="text"
              value={verifyPassword}
              onChange={(e) => setVerifyPassword(e.target.value)}
              placeholder="Enter password to check..."
              className="input-base w-full font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Bcrypt Hash</label>
            <input
              type="text"
              value={verifyHash}
              onChange={(e) => setVerifyHash(e.target.value)}
              placeholder="$2b$10$..."
              className="input-base w-full font-mono text-sm"
            />
          </div>
          <ExecuteButton onClick={handleVerify} loading={loading} label="Verify Password" loadingLabel="Verifying..." />
          {error && <p className="text-destructive text-sm">{error}</p>}
          {verifyMatch !== null && (
            <div
              className={`flex items-center gap-3 p-4 rounded-lg border ${
                verifyMatch
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}
            >
              {verifyMatch ? (
                <ShieldCheck size={24} className="text-green-500 shrink-0" />
              ) : (
                <ShieldX size={24} className="text-red-500 shrink-0" />
              )}
              <p className={`font-semibold ${verifyMatch ? 'text-green-600' : 'text-red-600'}`}>
                {verifyMatch ? 'Password matches the hash' : 'Password does not match the hash'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
