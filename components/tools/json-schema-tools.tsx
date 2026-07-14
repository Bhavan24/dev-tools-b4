'use client'

import { useState } from 'react'
import { useToolApi, ToolShell, TextareaInput, ExecuteButton } from './base/tool-layout'
import { Copy, Check, CheckCircle, XCircle } from 'lucide-react'

export function JsonSchemaValidatorTool() {
  const [jsonInput, setJsonInput] = useState('')
  const [schemaInput, setSchemaInput] = useState('')
  const [result, setResult] = useState<{ valid: boolean; errors: string[] } | null>(null)
  const { loading, error, copied, call, copy } = useToolApi('json-schema-validator')

  const handleValidate = async () => {
    const res = await call({ json: jsonInput, schema: schemaInput })
    if (res !== null) setResult(res)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TextareaInput
          label="JSON Document"
          value={jsonInput}
          onChange={setJsonInput}
          placeholder='{"name": "Alice", "age": 30}'
          height="h-56"
        />
        <TextareaInput
          label="JSON Schema"
          value={schemaInput}
          onChange={setSchemaInput}
          placeholder='{"type":"object","properties":{"name":{"type":"string"},"age":{"type":"number"}},"required":["name"]}'
          height="h-56"
        />
      </div>

      <ExecuteButton onClick={handleValidate} loading={loading} label="Validate" />

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-3">
          <div
            className={`flex items-center gap-3 p-4 rounded-lg border ${
              result.valid
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}
          >
            {result.valid ? (
              <CheckCircle size={20} className="text-green-500 shrink-0" />
            ) : (
              <XCircle size={20} className="text-red-500 shrink-0" />
            )}
            <p className="font-medium">
              {result.valid ? 'Valid - document matches the schema' : `Invalid - ${result.errors.length} error${result.errors.length !== 1 ? 's' : ''} found`}
            </p>
          </div>
          {result.errors.length > 0 && (
            <div className="bg-secondary rounded-lg p-4 space-y-2">
              {result.errors.map((e, i) => (
                <p key={i} className="font-mono text-sm text-red-500">
                  {e}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function JsonSchemaGeneratorTool() {
  const [jsonInput, setJsonInput] = useState('')
  const [result, setResult] = useState('')
  const { loading, error, copied, call, copy } = useToolApi('json-schema-generator')

  const handleGenerate = async () => {
    const res = await call({ json: jsonInput })
    if (res !== null) setResult(typeof res === 'string' ? res : JSON.stringify(res, null, 2))
  }

  return (
    <ToolShell
      left={
        <TextareaInput
          label="Sample JSON"
          value={jsonInput}
          onChange={setJsonInput}
          placeholder='{"name": "Alice", "age": 30, "tags": ["admin", "user"]}'
          height="h-96"
        />
      }
      right={
        <div className="space-y-4">
          <label className="block font-medium text-foreground">Generated Schema</label>
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}
          {result ? (
            <>
              <div className="bg-secondary rounded-lg p-4 font-mono text-sm max-h-96 overflow-auto">
                <pre className="whitespace-pre-wrap">{result}</pre>
              </div>
              <button
                onClick={() => copy(result)}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                {copied ? (
                  <><Check size={18} className="text-green-500" /> Copied</>
                ) : (
                  <><Copy size={18} /> Copy Schema</>
                )}
              </button>
            </>
          ) : (
            <div className="bg-secondary rounded-lg p-4 h-96 flex items-center justify-center text-muted-foreground">
              Inferred schema will appear here
            </div>
          )}
          <ExecuteButton onClick={handleGenerate} loading={loading} label="Generate Schema" />
        </div>
      }
    />
  )
}
