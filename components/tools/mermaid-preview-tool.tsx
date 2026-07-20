'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Copy, Check, Download, Image } from 'lucide-react'
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
  const [downloadingPng, setDownloadingPng] = useState(false)
  const idRef = useRef(0)
  const previewRef = useRef<HTMLDivElement>(null)

  const render = useCallback(async (src: string) => {
    setLoading(true)
    setError('')
    const thisId = ++idRef.current
    try {
      const { default: mermaid } = await import('mermaid')
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'strict',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        fontSize: 14,
      })
      const id = `mermaid-${Date.now()}`
      const { svg: rendered } = await mermaid.render(id, src.trim())
      // SVG from mermaid contains user-controlled diagram source; sanitize
      // before injection to prevent any embedded script execution.
      const safe = DOMPurify.sanitize(rendered, {
        USE_PROFILES: { svg: true, svgFilters: true },
        ADD_TAGS: ['foreignObject'],
        ADD_ATTR: ['font-family', 'font-size', 'fill', 'stroke', 'text-anchor', 'dominant-baseline'],
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
    // Embed fonts so text renders correctly in downloaded SVG
    const withStyle = svg.replace(
      '<svg ',
      `<svg xmlns="http://www.w3.org/2000/svg" `
    ).replace(
      /(<svg[^>]*>)/,
      `$1<style>text, .label { font-family: ui-sans-serif, system-ui, Arial, sans-serif; font-size: 14px; }</style>`
    )
    const blob = new Blob([withStyle], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'diagram.svg'
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadPng = async () => {
    if (!svg || !previewRef.current) return
    setDownloadingPng(true)
    try {
      // Get the rendered SVG element from the DOM for accurate dimensions
      const svgEl = previewRef.current.querySelector('svg')
      if (!svgEl) return

      const bbox = svgEl.getBoundingClientRect()
      const scale = 2 // 2x for retina quality

      // Clone the SVG and embed fonts/styles for standalone rendering
      const clone = svgEl.cloneNode(true) as SVGElement
      const styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style')
      styleEl.textContent = `
        text, .label, tspan { font-family: Arial, Helvetica, sans-serif !important; }
        .node rect, .node circle, .node ellipse, .node polygon { fill: #fff; stroke: #333; }
        .edgePath .path { stroke: #333; }
      `
      clone.insertBefore(styleEl, clone.firstChild)

      // Ensure explicit width/height on the clone
      const w = bbox.width || svgEl.viewBox.baseVal.width || 800
      const h = bbox.height || svgEl.viewBox.baseVal.height || 600
      clone.setAttribute('width', String(w))
      clone.setAttribute('height', String(h))

      const svgData = new XMLSerializer().serializeToString(clone)
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const svgUrl = URL.createObjectURL(svgBlob)

      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = w * scale
        canvas.height = h * scale
        const ctx = canvas.getContext('2d')!
        ctx.scale(scale, scale)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, w, h)
        ctx.drawImage(img, 0, 0)
        URL.revokeObjectURL(svgUrl)

        canvas.toBlob((blob) => {
          if (!blob) return
          const pngUrl = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = pngUrl
          a.download = 'diagram.png'
          a.click()
          URL.revokeObjectURL(pngUrl)
          setDownloadingPng(false)
        }, 'image/png')
      }
      img.onerror = () => {
        URL.revokeObjectURL(svgUrl)
        setDownloadingPng(false)
      }
      img.src = svgUrl
    } catch {
      setDownloadingPng(false)
    }
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
              <div className="flex items-center gap-3">
                <button
                  onClick={downloadSvg}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Download size={12} /> SVG
                </button>
                <button
                  onClick={downloadPng}
                  disabled={downloadingPng}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  <Image size={12} /> {downloadingPng ? 'Exporting...' : 'PNG'}
                </button>
              </div>
            )}
          </div>
          {/* White background is intentional - mermaid diagrams have hardcoded light colors */}
          <div className="border border-border rounded-lg h-80 overflow-auto flex items-center justify-center bg-white p-4">
            {loading && (
              <span className="text-gray-400 text-sm">Rendering...</span>
            )}
            {error && !loading && (
              <div className="text-red-600 text-sm font-mono p-4 whitespace-pre-wrap max-w-full overflow-auto">
                {error}
              </div>
            )}
            {svg && !loading && !error && (
              <div
                ref={previewRef}
                className="max-w-full max-h-full [&_svg]:max-w-full [&_svg]:h-auto [&_text]:fill-gray-800 [&_text]:font-sans"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            )}
            {!svg && !loading && !error && (
              <span className="text-gray-400 text-sm">Preview will appear here</span>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Supported: flowchart, sequenceDiagram, classDiagram, gitGraph, gantt, stateDiagram, pie, erDiagram, and more.
        Download as SVG (vector) or PNG (raster at 2x resolution).
      </p>
    </div>
  )
}
