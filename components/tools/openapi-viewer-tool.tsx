'use client'
import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

type Parsed = Record<string, any>

const METHOD_COLORS: Record<string, string> = {
  get: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  post: 'bg-green-500/15 text-green-600 dark:text-green-400',
  put: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  patch: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  delete: 'bg-red-500/15 text-red-600 dark:text-red-400',
  head: 'bg-slate-500/15 text-slate-600 dark:text-slate-400',
  options: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
}

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'] as const

function SchemaView({ schema, indent = 0 }: { schema: any; indent?: number }) {
  if (!schema || typeof schema !== 'object') return null
  const pad = indent * 16

  if (schema.$ref) {
    return (
      <span className="text-violet-600 dark:text-violet-400 font-mono text-xs">
        {schema.$ref.replace('#/components/schemas/', '')}
      </span>
    )
  }

  if (schema.type === 'object' && schema.properties) {
    return (
      <div style={{ paddingLeft: pad }}>
        {Object.entries(schema.properties as Record<string, any>).map(([k, v]: [string, any]) => (
          <div key={k} className="flex items-baseline gap-2 text-xs py-0.5">
            <span className="font-mono text-foreground font-medium">{k}</span>
            {(schema.required ?? []).includes(k) && (
              <span className="text-red-500 text-[10px]">required</span>
            )}
            <span className="text-muted-foreground">{v.type ?? (v.$ref ? 'ref' : 'any')}</span>
            {v.description && <span className="text-muted-foreground italic">{v.description}</span>}
          </div>
        ))}
      </div>
    )
  }

  return (
    <span className="text-xs text-muted-foreground font-mono">
      {schema.type ?? 'any'}
      {schema.format ? `(${schema.format})` : ''}
    </span>
  )
}

function OperationCard({ path, method, op }: { path: string; method: string; op: any }) {
  const [open, setOpen] = useState(false)
  const params: any[] = op.parameters ?? []
  const responses = op.responses ?? {}
  const requestBody = op.requestBody

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
      >
        <span
          className={`shrink-0 px-2 py-0.5 rounded text-xs font-bold uppercase ${
            METHOD_COLORS[method] ?? 'bg-muted text-muted-foreground'
          }`}
        >
          {method}
        </span>
        <span className="font-mono text-sm text-foreground flex-1">{path}</span>
        {op.summary && (
          <span className="text-sm text-muted-foreground hidden md:block">{op.summary}</span>
        )}
        {open ? (
          <ChevronDown size={14} className="shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight size={14} className="shrink-0 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="border-t border-border p-4 space-y-4 text-sm">
          {op.description && <p className="text-muted-foreground">{op.description}</p>}

          {op.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {op.tags.map((t: string) => (
                <span key={t} className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-xs">
                  {t}
                </span>
              ))}
            </div>
          )}

          {params.length > 0 && (
            <div>
              <p className="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-2">Parameters</p>
              <div className="space-y-1">
                {params.map((p: any, i: number) => (
                  <div key={i} className="flex items-baseline gap-2 text-xs font-mono">
                    <span className="text-foreground font-medium">{p.name}</span>
                    <span className="text-muted-foreground">{p.in}</span>
                    {p.required && <span className="text-red-500">required</span>}
                    {p.schema?.type && <span className="text-muted-foreground">{p.schema.type}</span>}
                    {p.description && <span className="text-muted-foreground italic">{p.description}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {requestBody && (
            <div>
              <p className="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-2">Request Body</p>
              {Object.entries(requestBody.content ?? {}).map(([ct, body]: [string, any]) => (
                <div key={ct} className="text-xs">
                  <span className="font-mono text-muted-foreground">{ct}</span>
                  {body?.schema && (
                    <div className="mt-1 ml-3">
                      <SchemaView schema={body.schema} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {Object.keys(responses).length > 0 && (
            <div>
              <p className="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-2">Responses</p>
              <div className="space-y-1">
                {Object.entries(responses).map(([code, resp]: [string, any]) => (
                  <div key={code} className="flex items-baseline gap-2 text-xs">
                    <span
                      className={`font-mono font-bold ${
                        code.startsWith('2') ? 'text-green-600 dark:text-green-400' :
                        code.startsWith('4') ? 'text-amber-600 dark:text-amber-400' :
                        code.startsWith('5') ? 'text-red-600 dark:text-red-400' :
                        'text-muted-foreground'
                      }`}
                    >
                      {code}
                    </span>
                    <span className="text-muted-foreground">{resp.description ?? ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function OpenApiViewerTool() {
  const [spec, setSpec] = useState('')
  const [parsed, setParsed] = useState<Parsed | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [filter, setFilter] = useState('')

  const handleParse = async () => {
    setParseError(null)
    setParsed(null)
    const yaml = await import('js-yaml')
    try {
      let obj: any
      try {
        obj = JSON.parse(spec)
      } catch {
        obj = yaml.load(spec)
      }
      if (typeof obj !== 'object' || obj === null) throw new Error('Spec must be a JSON object or YAML mapping')
      if (!obj.openapi?.startsWith('3.')) throw new Error(`Expected OpenAPI 3.x, got: ${obj.openapi ?? 'unknown'}`)
      setParsed(obj)
    } catch (e: any) {
      setParseError(e.message)
    }
  }

  const paths = parsed?.paths ?? {}
  const filterLower = filter.toLowerCase()
  const operations: Array<{ path: string; method: string; op: any }> = []
  for (const [path, pathItem] of Object.entries(paths as Record<string, any>)) {
    for (const method of HTTP_METHODS) {
      const op = pathItem[method]
      if (!op) continue
      if (
        filterLower &&
        !path.toLowerCase().includes(filterLower) &&
        !method.includes(filterLower) &&
        !op.summary?.toLowerCase().includes(filterLower) &&
        !op.tags?.some((t: string) => t.toLowerCase().includes(filterLower))
      ) continue
      operations.push({ path, method, op })
    }
  }

  const schemas = parsed?.components?.schemas ?? {}

  return (
    <div className="space-y-4">
      {!parsed ? (
        <div className="space-y-3">
          <label className="block text-sm font-medium">OpenAPI 3.x Spec (YAML or JSON)</label>
          <textarea
            value={spec}
            onChange={(e) => setSpec(e.target.value)}
            placeholder="Paste your OpenAPI 3.x specification here..."
            className="input-base h-64 font-mono text-sm resize-none"
            spellCheck={false}
          />
          {parseError && <p className="text-destructive text-sm">{parseError}</p>}
          <button
            onClick={handleParse}
            disabled={!spec.trim()}
            className="btn-primary"
          >
            Load Spec
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-foreground">{parsed.info?.title}</h3>
              <p className="text-sm text-muted-foreground">
                v{parsed.info?.version} - OpenAPI {parsed.openapi}
                {parsed.info?.description && ` - ${parsed.info.description}`}
              </p>
            </div>
            <button
              onClick={() => { setParsed(null); setSpec('') }}
              className="text-xs text-primary hover:underline shrink-0"
            >
              Load different spec
            </button>
          </div>

          <div className="flex gap-4 text-sm text-muted-foreground">
            <span><strong className="text-foreground">{Object.keys(paths).length}</strong> paths</span>
            <span><strong className="text-foreground">{operations.length}</strong> operations</span>
            <span><strong className="text-foreground">{Object.keys(schemas).length}</strong> schemas</span>
          </div>

          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by path, method, tag, or summary..."
            className="input-base text-sm"
          />

          {operations.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No operations match your filter.</p>
          ) : (
            <div className="space-y-2">
              {operations.map(({ path, method, op }) => (
                <OperationCard key={`${method}-${path}`} path={path} method={method} op={op} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
