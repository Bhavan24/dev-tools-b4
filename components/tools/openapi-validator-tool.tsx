'use client'
import { useState } from 'react'
import { useToolApi, ExecuteButton } from './base/tool-layout'
import { CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react'

interface ValidationError {
  path: string
  message: string
}

interface ValidationResult {
  valid: boolean
  errorCount: number
  errors: ValidationError[]
  format: 'yaml' | 'json'
  info: { title: string; version: string } | null
  openapi: string | null
  pathCount: number
  operationCount: number
}

const EXAMPLE_SPEC = `openapi: "3.0.3"
info:
  title: Pet Store API
  version: "1.0.0"
paths:
  /pets:
    get:
      summary: List all pets
      operationId: listPets
      responses:
        "200":
          description: A list of pets
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/Pet"
components:
  schemas:
    Pet:
      type: object
      required:
        - id
        - name
      properties:
        id:
          type: integer
        name:
          type: string
`

export function OpenApiValidatorTool() {
  const [spec, setSpec] = useState('')
  const [result, setResult] = useState<ValidationResult | null>(null)
  const { loading, error, call } = useToolApi('openapi-validator')

  const handleRun = async () => {
    const res = await call({ spec })
    if (res) setResult(res as ValidationResult)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium">OpenAPI Spec (YAML or JSON)</label>
            <button
              onClick={() => setSpec(EXAMPLE_SPEC)}
              className="text-xs text-primary hover:underline"
            >
              Load example
            </button>
          </div>
          <textarea
            value={spec}
            onChange={(e) => setSpec(e.target.value)}
            placeholder="Paste your OpenAPI 3.x specification here..."
            className="input-base h-96 font-mono text-sm resize-none"
            spellCheck={false}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Validation Results</label>
          {result ? (
            <div className="h-96 overflow-auto space-y-3">
              <div
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  result.valid
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                }`}
              >
                {result.valid ? (
                  <CheckCircle2 size={18} className="text-green-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                )}
                <div className="text-sm">
                  <p className="font-medium">
                    {result.valid ? 'Valid OpenAPI spec' : `${result.errorCount} error${result.errorCount !== 1 ? 's' : ''} found`}
                  </p>
                  {result.info && (
                    <p className="text-muted-foreground mt-1">
                      {result.info.title} v{result.info.version} - OpenAPI {result.openapi}
                    </p>
                  )}
                </div>
              </div>

              {result.valid && (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="card-base p-3 text-center">
                    <p className="text-2xl font-bold text-foreground">{result.pathCount}</p>
                    <p className="text-muted-foreground text-xs mt-1">Paths</p>
                  </div>
                  <div className="card-base p-3 text-center">
                    <p className="text-2xl font-bold text-foreground">{result.operationCount}</p>
                    <p className="text-muted-foreground text-xs mt-1">Operations</p>
                  </div>
                </div>
              )}

              {result.errors.map((err, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg border border-red-500/30 bg-red-500/5 text-sm"
                >
                  <AlertTriangle size={15} className="text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <span className="font-mono text-xs text-muted-foreground">{err.path}</span>
                    <p className="text-foreground mt-0.5">{err.message}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-border rounded-lg h-96 flex items-center justify-center text-muted-foreground text-sm">
              Results will appear here
            </div>
          )}
        </div>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}
      <ExecuteButton onClick={handleRun} loading={loading} label="Validate Spec" />
    </div>
  )
}
