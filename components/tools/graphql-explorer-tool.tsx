'use client'
import { useState, useRef } from 'react'
import { Play, Loader2, AlertCircle } from 'lucide-react'

interface SchemaType {
  name: string
  kind: string
  description: string | null
  fields: Array<{ name: string; type: string; description: string | null }> | null
}

const INTROSPECTION_QUERY = `{
  __schema {
    types {
      name
      kind
      description
      fields {
        name
        description
        type {
          name
          kind
          ofType { name kind ofType { name kind } }
        }
      }
    }
  }
}`

function resolveTypeName(t: any): string {
  if (!t) return 'unknown'
  if (t.name) return t.name
  if (t.ofType) {
    if (t.kind === 'NON_NULL') return `${resolveTypeName(t.ofType)}!`
    if (t.kind === 'LIST') return `[${resolveTypeName(t.ofType)}]`
    return resolveTypeName(t.ofType)
  }
  return t.kind ?? 'unknown'
}

export function GraphqlExplorerTool() {
  const [endpoint, setEndpoint] = useState('')
  const [headers, setHeaders] = useState('{\n  "Content-Type": "application/json"\n}')
  const [query, setQuery] = useState('{\n  \n}')
  const [variables, setVariables] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [schema, setSchema] = useState<SchemaType[] | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [loadingSchema, setLoadingSchema] = useState(false)
  const [loadingQuery, setLoadingQuery] = useState(false)
  const [schemaError, setSchemaError] = useState<string | null>(null)
  const [queryError, setQueryError] = useState<string | null>(null)

  const parsedHeaders = () => {
    try { return JSON.parse(headers) } catch { return { 'Content-Type': 'application/json' } }
  }

  const handleLoadSchema = async () => {
    if (!endpoint.trim()) return
    setLoadingSchema(true)
    setSchemaError(null)
    setSchema(null)
    try {
      const res = await fetch('/api/tools/graphql-explorer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: endpoint.trim(),
          headers: parsedHeaders(),
          query: INTROSPECTION_QUERY,
        }),
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      const types: SchemaType[] = (json.result?.data?.__schema?.types ?? [])
        .filter((t: any) => !t.name.startsWith('__') && ['OBJECT', 'INPUT_OBJECT', 'INTERFACE', 'ENUM'].includes(t.kind))
        .map((t: any) => ({
          name: t.name,
          kind: t.kind,
          description: t.description ?? null,
          fields: t.fields
            ? t.fields.map((f: any) => ({
                name: f.name,
                type: resolveTypeName(f.type),
                description: f.description ?? null,
              }))
            : null,
        }))
      setSchema(types)
      if (types.length > 0) setSelectedType(types[0]!.name)
    } catch (e: any) {
      setSchemaError(e.message)
    } finally {
      setLoadingSchema(false)
    }
  }

  const handleRunQuery = async () => {
    if (!endpoint.trim()) return
    setLoadingQuery(true)
    setQueryError(null)
    setResult(null)
    try {
      let vars: any = undefined
      if (variables.trim()) {
        try { vars = JSON.parse(variables) } catch { throw new Error('Variables must be valid JSON') }
      }
      const res = await fetch('/api/tools/graphql-explorer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: endpoint.trim(),
          headers: parsedHeaders(),
          query,
          variables: vars,
        }),
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setResult(JSON.stringify(json.result, null, 2))
    } catch (e: any) {
      setQueryError(e.message)
    } finally {
      setLoadingQuery(false)
    }
  }

  const activeType = schema?.find((t) => t.name === selectedType)

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLoadSchema()}
          placeholder="https://your-api.com/graphql"
          className="input-base flex-1 font-mono text-sm"
        />
        <button
          onClick={handleLoadSchema}
          disabled={!endpoint.trim() || loadingSchema}
          className="btn-secondary flex items-center gap-2 shrink-0"
        >
          {loadingSchema ? <Loader2 size={14} className="animate-spin" /> : null}
          Load Schema
        </button>
      </div>

      <details className="text-sm">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
          Request Headers (JSON)
        </summary>
        <textarea
          value={headers}
          onChange={(e) => setHeaders(e.target.value)}
          className="input-base mt-2 h-20 font-mono text-xs resize-none"
          spellCheck={false}
        />
      </details>

      {schemaError && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle size={14} /> {schemaError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {schema && schema.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium">Schema Types</label>
            <div className="border border-border rounded-lg h-64 overflow-auto">
              {schema.map((t) => (
                <button
                  key={t.name}
                  onClick={() => setSelectedType(t.name)}
                  className={`w-full text-left px-3 py-1.5 text-xs font-mono hover:bg-muted/50 transition-colors flex items-center justify-between ${
                    selectedType === t.name ? 'bg-muted' : ''
                  }`}
                >
                  <span className="text-foreground truncate">{t.name}</span>
                  <span className="text-muted-foreground shrink-0 ml-2">{t.kind.toLowerCase()}</span>
                </button>
              ))}
            </div>
            {activeType && (
              <div className="border border-border rounded-lg p-3 space-y-1 h-40 overflow-auto">
                <p className="text-xs font-medium text-foreground">{activeType.name}</p>
                {activeType.description && (
                  <p className="text-xs text-muted-foreground">{activeType.description}</p>
                )}
                {activeType.fields?.map((f) => (
                  <div key={f.name} className="flex items-baseline gap-2 text-xs font-mono">
                    <span className="text-foreground">{f.name}</span>
                    <span className="text-violet-500">{f.type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className={`space-y-2 ${schema && schema.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <label className="block text-sm font-medium">Query / Mutation</label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-base h-36 font-mono text-sm resize-none"
            spellCheck={false}
          />
          <label className="block text-sm font-medium">Variables (JSON, optional)</label>
          <textarea
            value={variables}
            onChange={(e) => setVariables(e.target.value)}
            placeholder='{"id": "1"}'
            className="input-base h-16 font-mono text-sm resize-none"
            spellCheck={false}
          />
          <button
            onClick={handleRunQuery}
            disabled={!endpoint.trim() || loadingQuery}
            className="btn-primary flex items-center gap-2"
          >
            {loadingQuery ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Play size={14} />
            )}
            Run Query
          </button>
        </div>
      </div>

      {queryError && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle size={14} /> {queryError}
        </div>
      )}

      {result && (
        <div className="space-y-2">
          <label className="block text-sm font-medium">Response</label>
          <pre className="input-base h-48 overflow-auto text-sm font-mono whitespace-pre p-3">
            {result}
          </pre>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        The endpoint must allow cross-origin requests from this origin, or requests are proxied server-side.
      </p>
    </div>
  )
}
