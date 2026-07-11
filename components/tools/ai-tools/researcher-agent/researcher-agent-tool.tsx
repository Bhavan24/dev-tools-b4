'use client'

import { useState, useRef } from 'react'
import {
  Loader2,
  AlertCircle,
  Copy,
  Check,
  Search,
  Globe,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
} from 'lucide-react'
import {
  ProviderConfigSection,
  DEFAULT_PROVIDER_CONFIG,
  buildRequestBody,
} from '@/components/tools/ai-tools/provider-config'
import type { ProviderConfig } from '@/components/tools/ai-tools/provider-config'

interface ResearchSource {
  title: string
  url: string
  snippet: string
}

export function ResearcherAgentTool() {
  const [providerConfig, setProviderConfig] = useState<ProviderConfig>(DEFAULT_PROVIDER_CONFIG)
  const [tavilyApiKey, setTavilyApiKey] = useState('')
  const [query, setQuery] = useState('')
  const [depth, setDepth] = useState<'quick' | 'standard' | 'deep'>('standard')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [report, setReport] = useState('')
  const [sources, setSources] = useState<ResearchSource[]>([])
  const [steps, setSteps] = useState<string[]>([])
  const [sourcesOpen, setSourcesOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  const isConfigured =
    providerConfig.provider !== '' &&
    providerConfig.modelId !== '' &&
    (Object.values(providerConfig.credentials).some((v) => v.trim() !== '') ||
      providerConfig.provider === 'ollama')

  const handleResearch = async () => {
    if (!isConfigured) {
      setError('Please configure an AI provider before running.')
      return
    }
    if (!query.trim()) {
      setError('Please enter a research question.')
      return
    }

    setLoading(true)
    setError('')
    setReport('')
    setSources([])
    setSteps([])

    const body = buildRequestBody(providerConfig, {
      query,
      depth,
      tavilyApiKey: tavilyApiKey.trim() || undefined,
      streaming: true,
    })

    try {
      const response = await fetch('/api/tools/ai/researcher-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Research failed')
      }

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        // Parse progress markers (NUL-delimited)
        const parts = buffer.split('\x00')
        for (let i = 0; i < parts.length - 1; i += 2) {
          const before = parts[i]
          const marker = parts[i + 1]

          if (before) {
            setReport((r) => r + before)
          }

          if (marker?.startsWith('TOOL:')) {
            const rest = marker.slice('TOOL:'.length)
            const colonIdx = rest.indexOf(':')
            const toolName = rest.slice(0, colonIdx)
            const argsStr = rest.slice(colonIdx + 1)
            try {
              const args = JSON.parse(argsStr)
              if (toolName === 'web_search') {
                setSteps((s) => [...s, `Searching: "${args.query}"`])
              } else if (toolName === 'extract_content') {
                setSteps((s) => [...s, `Reading: ${args.url}`])
              }
            } catch {
              // ignore parse errors in progress markers
            }
          } else if (marker?.startsWith('SOURCES:')) {
            try {
              const parsed = JSON.parse(marker.slice('SOURCES:'.length))
              setSources(parsed)
              setSourcesOpen(parsed.length > 0)
            } catch {
              // ignore
            }
          }
        }
        // Keep the last partial segment (may be incomplete)
        buffer = parts[parts.length - 1]
      }
      // Flush any remaining plain text
      if (buffer) setReport((r) => r + buffer)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const copyReport = () => {
    navigator.clipboard.writeText(report)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Provider configuration */}
      <ProviderConfigSection value={providerConfig} onChange={setProviderConfig} />

      {/* Tavily search key (optional) */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 bg-secondary flex items-center gap-2">
          <Globe size={16} className="text-muted-foreground" />
          <span className="font-medium text-sm text-foreground">Web Search</span>
          <span className="text-xs text-muted-foreground font-normal ml-1">optional</span>
        </div>
        <div className="p-5 border-t border-border bg-card space-y-2">
          <p className="text-xs text-muted-foreground">
            Add a{' '}
            <a
              href="https://tavily.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Tavily
            </a>{' '}
            API key to enable real-time web search. Without it, the model uses its training data
            only.
          </p>
          <input
            type="password"
            value={tavilyApiKey}
            onChange={(e) => setTavilyApiKey(e.target.value)}
            placeholder="tvly-..."
            className="input-base font-mono text-sm"
            autoComplete="off"
          />
        </div>
      </div>

      {/* Research query */}
      <div>
        <label className="block font-medium text-foreground mb-2">Research question</label>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. What are the latest advances in quantum computing and their practical applications?"
          className="input-base h-28 resize-none"
        />
      </div>

      {/* Depth selector */}
      <div>
        <label className="block font-medium text-foreground mb-2">Research depth</label>
        <div className="grid grid-cols-3 gap-3">
          {(['quick', 'standard', 'deep'] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDepth(d)}
              className={`px-4 py-3 rounded-xl border text-sm font-medium transition-colors capitalize ${
                depth === d
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              {d}
              <div className="text-xs font-normal mt-0.5">
                {d === 'quick' && '1-3 searches'}
                {d === 'standard' && '3-6 searches'}
                {d === 'deep' && '6-10 searches'}
              </div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleResearch}
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2 py-3"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Researching...
          </>
        ) : (
          <>
            <Search size={18} />
            Start Research
          </>
        )}
      </button>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Progress steps */}
      {(loading || steps.length > 0) && (
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3 bg-secondary flex items-center gap-2">
            <Loader2
              size={14}
              className={`${loading ? 'animate-spin' : ''} text-muted-foreground`}
            />
            <span className="text-sm font-medium text-foreground">Research Progress</span>
          </div>
          <div className="p-4 space-y-2 bg-card">
            {steps.length === 0 && loading && (
              <p className="text-sm text-muted-foreground">Planning research approach...</p>
            )}
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm text-foreground">{step}</p>
              </div>
            ))}
            {loading && steps.length > 0 && (
              <div className="flex items-center gap-2 pl-7 text-sm text-muted-foreground">
                <Loader2 size={12} className="animate-spin" />
                Working...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sources */}
      {sources.length > 0 && (
        <div className="border border-border rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setSourcesOpen((o) => !o)}
            className="w-full flex items-center justify-between px-5 py-3 bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <div className="flex items-center gap-2">
              <BookOpen size={14} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                Sources ({sources.length})
              </span>
            </div>
            {sourcesOpen ? (
              <ChevronUp size={14} className="text-muted-foreground" />
            ) : (
              <ChevronDown size={14} className="text-muted-foreground" />
            )}
          </button>
          {sourcesOpen && (
            <div className="p-4 space-y-3 border-t border-border bg-card">
              {sources.map((src, i) => (
                <div key={i} className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-primary hover:underline flex items-center gap-1 truncate"
                    >
                      {src.title || src.url}
                      <ExternalLink size={11} className="shrink-0" />
                    </a>
                    {src.snippet && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {src.snippet}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Report output */}
      {report ? (
        <div className="space-y-3" ref={reportRef}>
          <div className="flex items-center justify-between">
            <label className="font-medium text-foreground">Research Report</label>
            <button
              onClick={copyReport}
              className="flex items-center gap-1.5 text-sm btn-secondary px-3 py-1.5"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-green-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="bg-secondary rounded-xl p-5 text-sm whitespace-pre-wrap wrap-break-word max-h-175 overflow-auto leading-relaxed font-mono">
            {report}
          </div>
        </div>
      ) : (
        !loading &&
        !error && (
          <div className="bg-secondary rounded-xl p-5 h-40 flex items-center justify-center text-muted-foreground text-sm">
            Your research report will appear here
          </div>
        )
      )}
    </div>
  )
}
