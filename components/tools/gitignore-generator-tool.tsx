'use client'
import { useState } from 'react'
import { useToolApi, ExecuteButton } from './base/tool-layout'

const TEMPLATE_CATEGORIES = {
  Languages: ['Node', 'Python', 'Ruby', 'Java', 'Go', 'Rust', 'PHP', 'CSharp', 'Swift', 'Kotlin'],
  Editors: ['VSCode', 'JetBrains', 'Vim', 'Xcode'],
  OS: ['macOS', 'Windows', 'Linux'],
  Frameworks: ['NextJS', 'React', 'Angular', 'Vue', 'Django', 'Rails', 'Laravel'],
}

export function GitignoreGeneratorTool() {
  const [selected, setSelected] = useState<Set<string>>(new Set(['Node', 'macOS', 'VSCode']))
  const [customEntries, setCustomEntries] = useState('')
  const [result, setResult] = useState<{ gitignore: string; templates: string[]; lineCount: number } | null>(null)
  const [copied, setCopied] = useState(false)
  const { loading, error, call } = useToolApi('gitignore-generator')

  const toggleTemplate = (tpl: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(tpl)) next.delete(tpl)
      else next.add(tpl)
      return next
    })
  }

  const handleRun = async () => {
    const res = await call({ templates: Array.from(selected), customEntries })
    if (res) setResult(res as { gitignore: string; templates: string[]; lineCount: number })
  }

  const handleCopy = () => {
    if (result?.gitignore) {
      navigator.clipboard.writeText(result.gitignore)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-6">
      {Object.entries(TEMPLATE_CATEGORIES).map(([category, templates]) => (
        <div key={category} className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">{category}</h3>
          <div className="flex flex-wrap gap-2">
            {templates.map((tpl) => (
              <button
                key={tpl}
                onClick={() => toggleTemplate(tpl)}
                className={selected.has(tpl) ? 'btn-primary text-sm px-3 py-1' : 'btn-secondary text-sm px-3 py-1'}
              >
                {tpl}
              </button>
            ))}
          </div>
        </div>
      ))}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Custom Entries (optional)</label>
        <textarea
          value={customEntries}
          onChange={(e) => setCustomEntries(e.target.value)}
          placeholder={'# My custom ignores\n*.secret\nlocal-config.json'}
          rows={4}
          className="input-base w-full font-mono text-sm"
        />
      </div>
      <ExecuteButton
        onClick={handleRun}
        loading={loading}
        label={`Generate .gitignore (${selected.size} template${selected.size !== 1 ? 's' : ''})`}
      />
      {error && <p className="text-destructive text-sm">{error}</p>}
      {result && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{result.lineCount} lines - {result.templates.join(', ')}</p>
            <button onClick={handleCopy} className="btn-secondary text-sm">
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <textarea
            readOnly
            value={result.gitignore}
            rows={20}
            className="input-base w-full font-mono text-xs"
          />
        </div>
      )}
    </div>
  )
}
