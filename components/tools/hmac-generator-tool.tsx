'use client'
import { useState } from 'react'
import { useToolApi, ExecuteButton } from './base/tool-layout'
import { Copy, Check } from 'lucide-react'

interface HmacResult {
  message: string
  algorithm: string
  encoding: string
  hmac: string
}

export function HmacGeneratorTool() {
  const [message, setMessage] = useState('')
  const [key, setKey] = useState('')
  const [algorithm, setAlgorithm] = useState('sha256')
  const [encoding, setEncoding] = useState('hex')
  const [result, setResult] = useState<HmacResult | null>(null)
  const [copied, setCopied] = useState(false)
  const { loading, error, call } = useToolApi('hmac-generator')

  const handleRun = async () => {
    const res = await call({ message, key, algorithm, encoding })
    if (res) setResult(res as HmacResult)
  }

  const copyHmac = () => {
    if (!result) return
    navigator.clipboard.writeText(result.hmac)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter the message to sign..."
              className="input-base h-32 font-mono text-sm resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Secret Key</label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Enter your secret key..."
              className="input-base w-full font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Algorithm</label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                className="input-base w-full"
              >
                <option value="sha256">HMAC-SHA256</option>
                <option value="sha512">HMAC-SHA512</option>
                <option value="sha1">HMAC-SHA1</option>
                <option value="md5">HMAC-MD5</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Output Encoding</label>
              <select
                value={encoding}
                onChange={(e) => setEncoding(e.target.value)}
                className="input-base w-full"
              >
                <option value="hex">Hex</option>
                <option value="base64">Base64</option>
              </select>
            </div>
          </div>
          <ExecuteButton onClick={handleRun} loading={loading} label="Generate HMAC" />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium">HMAC Signature</label>
          {error && <p className="text-destructive text-sm">{error}</p>}
          {result ? (
            <div className="card-base p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span className="uppercase font-semibold">{result.algorithm} / {result.encoding}</span>
                <button
                  onClick={copyHmac}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="font-mono text-sm break-all whitespace-pre-wrap bg-muted rounded p-3">
                {result.hmac}
              </pre>
            </div>
          ) : (
            <div className="card-base h-48 flex items-center justify-center text-muted-foreground text-sm">
              Signature will appear here
            </div>
          )}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Used for API request signing (AWS SigV4, Stripe webhooks, GitHub webhooks, etc.).</p>
            <p>The secret key is never sent to any server - computation runs entirely server-side in the tool handler.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
