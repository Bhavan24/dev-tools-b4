import Link from 'next/link'
import { ArrowLeft, Copy, Terminal, Zap, BookOpen, Code2 } from 'lucide-react'
import { toolHandlers } from '@/lib/tool-handlers'
import { TOOLS, CATEGORY_INFO } from '@/lib/constants'
import type { Metadata } from 'next'
import { McpCopyButton } from './mcp-copy-button'

export const metadata: Metadata = {
  title: 'MCP API Docs — AI Developer Tools',
  description:
    'Full reference for all MCP-enabled tools: endpoints, parameters, types, and live examples.',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function typeBadge(type: string, isRequired: boolean) {
  const colors: Record<string, string> = {
    string: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    number: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
    boolean: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
    enum: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
  }
  const key = type === 'enum' ? 'enum' : type
  const color = colors[key] || 'bg-secondary text-foreground'
  return { color, label: type }
}

function buildExampleArgs(handler: {
  schema: { properties: Record<string, any>; required?: string[] }
}): Record<string, any> {
  const args: Record<string, any> = {}
  for (const [key, prop] of Object.entries(handler.schema.properties)) {
    if (prop.enum) {
      args[key] = prop.enum[0]
    } else if (prop.type === 'number') {
      args[key] = prop.default ?? prop.minimum ?? 1
    } else if (prop.type === 'boolean') {
      args[key] = prop.default ?? true
    } else {
      // string
      if (key === 'text' || key === 'input') args[key] = 'Hello world'
      else if (key === 'json') args[key] = '{"key":"value"}'
      else if (key === 'code') args[key] = 'function hello() { return "world"; }'
      else if (key === 'csv') args[key] = 'name,age\nAlice,30'
      else if (key === 'xml') args[key] = '<root><item>value</item></root>'
      else if (key === 'yaml') args[key] = 'key: value'
      else if (key === 'url') args[key] = 'https://example.com'
      else if (key === 'html') args[key] = '<p>Hello</p>'
      else if (key === 'hex') args[key] = '#ff5733'
      else if (key === 'base64') args[key] = 'SGVsbG8gV29ybGQ='
      else if (key === 'pdfBase64') args[key] = '<base64-encoded-pdf>'
      else args[key] = prop.default ?? `example-${key}`
    }
  }
  return args
}

function categoryColor(category: string): string {
  const colors: Record<string, string> = {
    developer: 'from-blue-500 to-blue-600',
    validation: 'from-purple-500 to-purple-600',
    formatter: 'from-cyan-500 to-cyan-600',
    converter: 'from-orange-500 to-orange-600',
    'ai-tools': 'from-pink-500 to-pink-600',
  }
  return colors[category] || 'from-slate-500 to-slate-600'
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function McpDocsPage() {
  const mcpEndpoint = 'https://ai-developer-tools.vercel.app/api/mcp'

  // Build the docs entries by joining toolHandlers (source of truth) with TOOLS (for name/category)
  const toolMeta = Object.fromEntries(TOOLS.map((t) => [t.id, t]))

  const entries = Object.entries(toolHandlers).map(([id, handler]) => ({
    id,
    handler,
    meta: toolMeta[id],
  }))

  // Group by category
  const grouped: Record<string, typeof entries> = {}
  for (const entry of entries) {
    const cat = entry.meta?.category ?? 'developer'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(entry)
  }

  const totalTools = entries.length

  return (
    <div className="container-main py-10">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-primary hover:text-accent mb-8 transition-colors text-sm"
      >
        <ArrowLeft size={16} />
        Back to Tools
      </Link>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-violet-600 text-white">
            <Terminal size={22} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">MCP API Reference</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Every tool below is callable via the{' '}
          <a
            href="https://modelcontextprotocol.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Model Context Protocol
          </a>
          . Connect Claude or any MCP-compatible client to the endpoint and all {totalTools} tools
          become available instantly.
        </p>
      </div>

      {/* Quick setup */}
      <div className="card-base mb-10 space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Zap size={18} className="text-violet-500" />
          Quick Setup
        </h2>

        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              MCP Endpoint
            </p>
            <div className="flex items-center gap-2 bg-muted rounded-lg border border-border p-3">
              <code className="flex-1 text-sm font-mono text-foreground break-all">
                {mcpEndpoint}
              </code>
              <McpCopyButton text={mcpEndpoint} label="Copy" />
            </div>
          </div>

          <div>
            <div className="relative bg-slate-900 rounded-lg overflow-hidden">
              <pre className="p-4 text-sm font-mono text-slate-100 overflow-x-auto">{`{
  "mcpServers": {
    "devtools": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "${mcpEndpoint}"
      ]
    }
  }
}`}</pre>
              <McpCopyButton
                text={`{\n  "mcpServers": {\n    "dev-tools": {\n      "command": "npx",\n      "args": [\n        "-y",\n        "mcp-remote",\n        "${mcpEndpoint}"\n      ]\n    }\n  }\n}`}
                label="Copy"
                className="absolute top-2 right-2 text-slate-100 bg-slate-700 hover:bg-slate-600"
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              curl test
            </p>
            <div className="relative bg-slate-900 rounded-lg overflow-hidden">
              <pre className="p-4 text-sm font-mono text-slate-100 overflow-x-auto">{`curl -X POST ${mcpEndpoint} \\
  -H "Content-Type: application/json" \\
  -d '{"method":"tools/list"}'`}</pre>
            </div>
          </div>
        </div>
      </div>

      {/* Table of contents */}
      <div className="card-base mb-10">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
          <BookOpen size={18} className="text-violet-500" />
          Tools ({totalTools})
        </h2>
        <div className="flex flex-wrap gap-x-6 gap-y-1">
          {Object.entries(grouped).map(([cat, tools]) => (
            <div key={cat}>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                {CATEGORY_INFO[cat as keyof typeof CATEGORY_INFO]?.name ?? cat}
              </p>
              <ul className="space-y-0.5 mb-3">
                {tools.map(({ id, meta }) => (
                  <li key={id}>
                    <a href={`#${id}`} className="text-sm text-primary hover:underline">
                      {meta?.name ?? id}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Tool entries grouped by category */}
      {Object.entries(grouped).map(([cat, tools]) => (
        <div key={cat} className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className={`h-1 w-8 rounded bg-linear-to-r ${categoryColor(cat)}`} />
            <h2 className="text-xl font-bold text-foreground">
              {CATEGORY_INFO[cat as keyof typeof CATEGORY_INFO]?.name ?? cat}
            </h2>
          </div>

          <div className="space-y-6">
            {tools.map(({ id, handler, meta }) => {
              const props = handler.schema.properties
              const required = handler.schema.required ?? []
              const exampleArgs = buildExampleArgs(handler)
              const hasParams = Object.keys(props).length > 0
              const exampleJson = JSON.stringify(exampleArgs, null, 2)

              return (
                <div
                  key={id}
                  id={id}
                  className="card-base scroll-mt-20 border-l-4 border-violet-500/60"
                >
                  {/* Title row */}
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold text-foreground">{meta?.name ?? id}</h3>
                        <span className="text-xs font-semibold bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded">
                          MCP
                        </span>
                        <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          {id}
                        </code>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{handler.description}</p>
                    </div>
                    {meta && (
                      <Link
                        href={`/tools/${id}`}
                        className="text-xs font-medium text-primary hover:underline whitespace-nowrap"
                      >
                        Open tool →
                      </Link>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Parameters table */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        {hasParams ? 'Parameters' : 'Parameters — none required'}
                      </p>
                      {hasParams ? (
                        <div className="rounded-lg border border-border overflow-hidden text-sm">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-muted/60 text-xs text-muted-foreground">
                                <th className="text-left px-3 py-2 font-semibold">Name</th>
                                <th className="text-left px-3 py-2 font-semibold">Type</th>
                                <th className="text-left px-3 py-2 font-semibold">Req</th>
                                <th className="text-left px-3 py-2 font-semibold">Description</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(props).map(([param, prop], i) => {
                                const isReq = required.includes(param)
                                const typeLabel = prop.enum ? `enum` : (prop.type ?? 'string')
                                const { color } = typeBadge(typeLabel, isReq)
                                return (
                                  <tr key={param} className={i % 2 === 0 ? '' : 'bg-muted/30'}>
                                    <td className="px-3 py-2 font-mono text-xs text-foreground align-top">
                                      {param}
                                    </td>
                                    <td className="px-3 py-2 align-top">
                                      <span
                                        className={`text-xs font-semibold px-1.5 py-0.5 rounded ${color}`}
                                      >
                                        {typeLabel}
                                      </span>
                                      {prop.enum && (
                                        <div className="mt-1 flex flex-wrap gap-1">
                                          {(prop.enum as string[]).map((v) => (
                                            <code key={v} className="text-xs bg-muted px-1 rounded">
                                              {v}
                                            </code>
                                          ))}
                                        </div>
                                      )}
                                    </td>
                                    <td className="px-3 py-2 align-top">
                                      {isReq ? (
                                        <span className="text-xs font-semibold text-red-500">
                                          yes
                                        </span>
                                      ) : (
                                        <span className="text-xs text-muted-foreground">no</span>
                                      )}
                                    </td>
                                    <td className="px-3 py-2 text-xs text-muted-foreground align-top">
                                      {prop.description ?? ''}
                                      {prop.default !== undefined && (
                                        <span className="ml-1 text-muted-foreground/70">
                                          (default:{' '}
                                          <code className="font-mono">{String(prop.default)}</code>)
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          No parameters — call with an empty object.
                        </p>
                      )}
                    </div>

                    {/* Example curl */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Example (tools/call)
                      </p>
                      <div className="relative bg-slate-900 rounded-lg overflow-hidden">
                        <pre className="p-3 text-xs font-mono text-slate-100 overflow-x-auto">{`curl -X POST ${mcpEndpoint} \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify({ method: 'tools/call', name: id, arguments: exampleArgs }, null, 2).split('\n').join('\n     ')}'`}</pre>
                        <McpCopyButton
                          text={`curl -X POST ${mcpEndpoint} \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify({ method: 'tools/call', name: id, arguments: exampleArgs })}'`}
                          label="Copy"
                          className="absolute top-2 right-2 text-slate-100 bg-slate-700 hover:bg-slate-600"
                        />
                      </div>

                      {hasParams && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                            Arguments JSON
                          </p>
                          <div className="relative bg-slate-900 rounded-lg overflow-hidden">
                            <pre className="p-3 text-xs font-mono text-slate-100 overflow-x-auto">
                              {exampleJson}
                            </pre>
                            <McpCopyButton
                              text={exampleJson}
                              label="Copy"
                              className="absolute top-2 right-2 text-slate-100 bg-slate-700 hover:bg-slate-600"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Footer note */}
      <div className="mt-12 p-6 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/50">
        <div className="flex items-start gap-3">
          <Code2 size={20} className="text-violet-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">Auto-generated reference</p>
            <p className="text-sm text-muted-foreground">
              This page is generated directly from the live handler registry. New tools appear here
              automatically as soon as they are implemented — no manual documentation updates
              needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
