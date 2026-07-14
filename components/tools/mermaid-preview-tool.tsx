'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Copy, Check, Download } from 'lucide-react'
import DOMPurify from 'dompurify'

const EXAMPLES: Record<string, string> = {
  Flowchart: `flowchart TD
    A[Start] --> B{Is it working?}
    B -- Yes --> C[Great!]
    B -- No --> D[Debug]
    D --> B`,
  Sequence: `sequenceDiagram
    participant Client
    participant Server
    participant DB
    Client->>Server: POST /api/login
    Server->>DB: SELECT user WHERE email=?
    DB-->>Server: user record
    Server-->>Client: 200 OK + JWT`,
  'Class Diagram': `classDiagram
    class Animal {
      +String name
      +int age
      +makeSound() void
    }
    class Dog {
      +fetch() void
    }
    class Cat {
      +purr() void
    }
    Animal <|-- Dog
    Animal <|-- Cat`,
  'Git Graph': `gitGraph
    commit id: "init"
    branch feature
    checkout feature
    commit id: "add feature"
    commit id: "tests"
    checkout main
    merge feature id: "merge"
    commit id: "release"`,
  Gantt: `gantt
    title Project Timeline
    dateFormat YYYY-MM-DD
    section Planning
    Kickoff     :done, 2024-01-01, 3d
    Design      :done, 2024-01-04, 5d
    section Development
    Backend     :active, 2024-01-09, 10d
    Frontend    :2024-01-15, 8d
    section Launch
    QA          :2024-01-23, 4d
    Deploy      :milestone, 2024-01-27, 0d`,
}

export function MermaidPreviewTool() {
  const [source, setSource] = useState(EXAMPLES['Flowchart']!)
  const [svg, setSvg] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeExample, setActiveExample] = useState('Flowchart')
  const idRef = useRef(0)

  const render = useCallback(async (src: string) => {
    setLoading(true)
    setError('')
    const thisId = ++idRef.current
    try {
      const { default: mermaid } = await import('mermaid')
      mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' })
      const id = `mermaid-${Date.now()}`
      const { svg: rendered } = await mermaid.render(id, src.trim())
      // SVG from mermaid contains user-controlled diagram source; sanitize
      // before injection to prevent any embedded script execution.
      const safe = DOMPurify.sanitize(rendered, {
        USE_PROFILES: { svg: true, svgFilters: true },
      })
      if (idRef.current === thisId) setSvg(safe)
    } catch (err: unknown) {
      if (idRef.current === thisId) {
        setError(err instanceof Error ? err.message.split('\n')[0]! : 'Parse error')
        setSvg('')
      }
    } finally {
      if (idRef.current === thisId) setLoading(false)
    }
  }, [])

  // Debounce rendering
  useEffect(() => {
    const t = setTimeout(() => render(source), 350)
    return () => clearTimeout(t)
  }, [source, render])

  const copySource = () => {
    navigator.clipboard.writeText(source)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadSvg = () => {
    if (!svg) return
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'diagram.svg'
    a.click()
    URL.revokeObjectURL(url)
  }

  const loadExample = (name: string) => {
    setActiveExample(name)
    setSource(EXAMPLES[name]!)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {Object.keys(EXAMPLES).map((name) => (
          <button
            key={name}
            onClick={() => loadExample(name)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeExample === name
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Mermaid Source</label>
            <button
              onClick={copySource}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied ? <><Check size={12} className="text-green-500" />Copied</> : <><Copy size={12} />Copy</>}
            </button>
          </div>
          <textarea
            value={source}
            onChange={(e) => { setSource(e.target.value); setActiveExample('') }}
            className="input-base h-80 font-mono text-sm resize-none"
            placeholder="Enter Mermaid diagram source..."
            spellCheck={false}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Preview</label>
            {svg && (
              <button
                onClick={downloadSvg}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Download size={12} /> Download SVG
              </button>
            )}
          </div>
          <div className="border border-border rounded-lg h-80 overflow-auto flex items-center justify-center bg-white dark:bg-white p-4">
            {loading && (
              <span className="text-muted-foreground text-sm">Rendering...</span>
            )}
            {error && !loading && (
              <div className="text-red-600 text-sm font-mono p-4 whitespace-pre-wrap max-w-full overflow-auto">
                {error}
              </div>
            )}
            {svg && !loading && !error && (
              <div
                className="max-w-full max-h-full"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            )}
            {!svg && !loading && !error && (
              <span className="text-muted-foreground text-sm">Preview will appear here</span>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Supported diagram types: flowchart, sequenceDiagram, classDiagram, gitGraph, gantt, stateDiagram, pie, erDiagram, and more.
      </p>
    </div>
  )
}
