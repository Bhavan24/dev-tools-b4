'use client'

import { useState } from 'react'
import { Plus, Trash2, Copy, Check } from 'lucide-react'

interface Param {
  key: string
  value: string
}

function buildUrl(protocol: string, host: string, port: string, path: string, params: Param[], hash: string): string {
  if (!host) return ''
  try {
    const base = `${protocol}://${host}${port ? ':' + port : ''}${path || '/'}`
    const url = new URL(base)
    for (const p of params) {
      if (p.key) url.searchParams.append(p.key, p.value)
    }
    if (hash) url.hash = hash
    return url.toString()
  } catch {
    return ''
  }
}

export function UrlBuilderTool() {
  const [protocol, setProtocol] = useState('https')
  const [host, setHost] = useState('')
  const [port, setPort] = useState('')
  const [path, setPath] = useState('')
  const [params, setParams] = useState<Param[]>([{ key: '', value: '' }])
  const [hash, setHash] = useState('')
  const [copied, setCopied] = useState(false)

  const url = buildUrl(protocol, host, port, path, params, hash)

  const addParam = () => setParams((p) => [...p, { key: '', value: '' }])
  const removeParam = (i: number) => setParams((p) => p.filter((_, idx) => idx !== i))
  const updateParam = (i: number, field: 'key' | 'value', val: string) =>
    setParams((p) => p.map((item, idx) => (idx === i ? { ...item, [field]: val } : item)))

  const copy = () => {
    if (!url) return
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label className="block font-medium text-foreground mb-2">Protocol</label>
          <select
            value={protocol}
            onChange={(e) => setProtocol(e.target.value)}
            className="input-base"
          >
            <option value="https">https</option>
            <option value="http">http</option>
            <option value="ftp">ftp</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block font-medium text-foreground mb-2">Host</label>
          <input
            type="text"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            placeholder="example.com"
            className="input-base font-mono"
          />
        </div>
        <div>
          <label className="block font-medium text-foreground mb-2">Port</label>
          <input
            type="text"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            placeholder="8080"
            className="input-base font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium text-foreground mb-2">Path</label>
          <input
            type="text"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="/api/users"
            className="input-base font-mono"
          />
        </div>
        <div>
          <label className="block font-medium text-foreground mb-2">Fragment (hash)</label>
          <input
            type="text"
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            placeholder="section-1"
            className="input-base font-mono"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="font-medium text-foreground">Query Parameters</label>
          <button onClick={addParam} className="btn-secondary text-sm flex items-center gap-1 px-3 py-1.5">
            <Plus size={14} />
            Add
          </button>
        </div>
        <div className="space-y-2">
          {params.map((p, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                value={p.key}
                onChange={(e) => updateParam(i, 'key', e.target.value)}
                placeholder="key"
                className="input-base font-mono flex-1"
              />
              <input
                type="text"
                value={p.value}
                onChange={(e) => updateParam(i, 'value', e.target.value)}
                placeholder="value"
                className="input-base font-mono flex-1"
              />
              <button
                onClick={() => removeParam(i)}
                className="p-2 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-secondary rounded-lg p-4 space-y-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Generated URL</p>
        {url ? (
          <p className="font-mono text-sm break-all text-foreground">{url}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">Enter a host to see the URL</p>
        )}
        {url && (
          <button
            onClick={copy}
            className="btn-primary flex items-center gap-2"
          >
            {copied ? (
              <><Check size={16} className="text-green-400" /> Copied</>
            ) : (
              <><Copy size={16} /> Copy URL</>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
