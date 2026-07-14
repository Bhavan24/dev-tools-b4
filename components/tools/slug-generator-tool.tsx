'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

function slugify(text: string, separator: string, caseStyle: string): string {
  let slug = text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9\s\-_]/g, '')
    .trim()
    .replace(/[\s\-_]+/g, separator)
  if (caseStyle === 'lower') return slug.toLowerCase()
  if (caseStyle === 'upper') return slug.toUpperCase()
  return slug.replace(/\w+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
}

export function SlugGeneratorTool() {
  const [text, setText] = useState('')
  const [separator, setSeparator] = useState('-')
  const [caseStyle, setCaseStyle] = useState('lower')
  const [copied, setCopied] = useState(false)

  const slug = text ? slugify(text, separator, caseStyle) : ''

  const copy = () => {
    navigator.clipboard.writeText(slug)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-medium text-foreground mb-2">Input Text</label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Hello World! This is a Title"
          className="input-base"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium text-foreground mb-2">Separator</label>
          <select value={separator} onChange={(e) => setSeparator(e.target.value)} className="input-base">
            <option value="-">Hyphen (-)</option>
            <option value="_">Underscore (_)</option>
            <option value=".">Dot (.)</option>
          </select>
        </div>
        <div>
          <label className="block font-medium text-foreground mb-2">Case</label>
          <select value={caseStyle} onChange={(e) => setCaseStyle(e.target.value)} className="input-base">
            <option value="lower">Lowercase</option>
            <option value="upper">Uppercase</option>
            <option value="title">Title Case</option>
          </select>
        </div>
      </div>

      <div className="bg-secondary rounded-lg p-4 space-y-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Generated Slug</p>
        {slug ? (
          <p className="font-mono text-lg font-medium text-primary break-all">{slug}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">Type text above to generate a slug</p>
        )}
        {slug && (
          <button onClick={copy} className="btn-secondary flex items-center gap-2">
            {copied ? <><Check size={16} className="text-green-500" /> Copied</> : <><Copy size={16} /> Copy</>}
          </button>
        )}
      </div>
    </div>
  )
}
