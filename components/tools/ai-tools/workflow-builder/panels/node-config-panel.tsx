'use client'

import { X, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import type { WorkflowNode, NodeData, ToolKind, WorkflowEdge } from '@/lib/workflow-types'
import { TOOLS } from '@/lib/constants'
import { AI_PROVIDERS } from '@/lib/ai-providers'
import { ModelCombobox } from '@/components/tools/ai-tools/model-combobox'

interface NodeConfigPanelProps {
  node: WorkflowNode | null
  selectedEdge: WorkflowEdge | null
  onUpdateNode: (nodeId: string, data: Partial<NodeData>) => void
  onUpdateEdge: (edgeId: string, patch: Partial<WorkflowEdge>) => void
  onClose: () => void
}

export function NodeConfigPanel({
  node,
  selectedEdge,
  onUpdateNode,
  onUpdateEdge,
  onClose,
}: NodeConfigPanelProps) {
  if (!node && !selectedEdge) return null

  return (
    <div className="w-80 shrink-0 border-l border-border bg-card flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/60">
        <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">
          {selectedEdge ? 'Edge Config' : 'Node Config'}
        </span>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {selectedEdge && <EdgeConfigForm edge={selectedEdge} onUpdate={onUpdateEdge} />}
        {node && !selectedEdge && <NodeConfigForm node={node} onUpdate={onUpdateNode} />}
      </div>
    </div>
  )
}

// ---- Shared primitives ----

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
        {label}
      </label>
      {hint && <p className="text-[10px] text-muted-foreground mb-1 leading-relaxed">{hint}</p>}
      {children}
    </div>
  )
}

function TextInput({
  value,
  onChange,
  placeholder,
  mono,
  type = 'text',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  mono?: boolean
  type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`input-base text-xs w-full ${mono ? 'font-mono' : ''}`}
      autoComplete="off"
    />
  )
}

function TextArea({
  value,
  onChange,
  placeholder,
  mono,
  rows = 4,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  mono?: boolean
  rows?: number
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`input-base text-xs w-full resize-none ${mono ? 'font-mono' : ''}`}
    />
  )
}

/** JSON textarea: auto-formats on blur, shows error ring if invalid */
function JsonEditor({
  value,
  onChange,
  placeholder,
  rows = 5,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}) {
  const [error, setError] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
    setError(false)
  }

  const handleBlur = () => {
    if (!value.trim()) return
    try {
      const pretty = JSON.stringify(JSON.parse(value), null, 2)
      onChange(pretty)
      setError(false)
    } catch {
      setError(true)
    }
  }

  return (
    <div>
      <textarea
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        rows={rows}
        className={`input-base text-xs w-full resize-none font-mono ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
      />
      {error && <p className="text-[10px] text-red-500 mt-0.5">Invalid JSON - check syntax</p>}
    </div>
  )
}

function SelectInput({
  value,
  onChange,
  children,
}: {
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input-base text-xs w-full"
    >
      {children}
    </select>
  )
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 py-0.5">
      <div className="flex-1 h-px bg-border" />
      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest shrink-0">
        {label}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

function Collapsible({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 bg-secondary/40 hover:bg-secondary/70 transition-colors text-left"
      >
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          {label}
        </span>
        {open ? (
          <ChevronUp size={11} className="text-muted-foreground" />
        ) : (
          <ChevronDown size={11} className="text-muted-foreground" />
        )}
      </button>
      {open && <div className="p-3 space-y-3 border-t border-border">{children}</div>}
    </div>
  )
}

// ---- Edge config ----

function EdgeConfigForm({
  edge,
  onUpdate,
}: {
  edge: WorkflowEdge
  onUpdate: (edgeId: string, patch: Partial<WorkflowEdge>) => void
}) {
  return (
    <div className="p-4 space-y-4">
      <Field label="Edge Label">
        <TextInput
          value={edge.label ?? ''}
          onChange={(v) => onUpdate(edge.id, { label: v })}
          placeholder="Optional label…"
        />
      </Field>

      <Divider label="Condition" />

      <Field
        label="TypeScript Condition Code"
        hint="Return true to follow this edge. Receives `state: Record<string, any>`. Leave empty for unconditional."
      >
        <TextArea
          value={edge.conditionCode ?? ''}
          onChange={(v) => onUpdate(edge.id, { conditionCode: v })}
          placeholder={`// Example:\nreturn state.sentiment === 'positive'`}
          mono
          rows={7}
        />
      </Field>

      <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl">
        <p className="text-[10px] text-amber-600 leading-relaxed">
          Condition code runs client-side in a sandboxed function. Used for LangGraph-style
          conditional routing.
        </p>
      </div>
    </div>
  )
}

// ---- Node config ----

function NodeConfigForm({
  node,
  onUpdate,
}: {
  node: WorkflowNode
  onUpdate: (nodeId: string, data: Partial<NodeData>) => void
}) {
  const d = node.data
  const upd = (patch: Partial<NodeData>) => onUpdate(node.id, patch)

  return (
    <div className="p-4 space-y-4">
      <Field label="Label">
        <TextInput value={d.label} onChange={(v) => upd({ label: v } as any)} />
      </Field>

      {d.type === 'start' && <StartFields data={d} upd={upd} />}
      {d.type === 'agent' && <AgentFields data={d} upd={upd} />}
      {d.type === 'tool' && <ToolFields data={d} upd={upd} />}
    </div>
  )
}

// ---- Start fields ----

function StartFields({
  data,
  upd,
}: {
  data: Extract<NodeData, { type: 'start' }>
  upd: (p: Partial<NodeData>) => void
}) {
  return (
    <Field label="Input Description" hint="Describe what text input this workflow expects.">
      <TextArea
        value={data.description ?? ''}
        onChange={(v) => upd({ description: v } as any)}
        placeholder="e.g. A customer support query…"
        rows={3}
      />
    </Field>
  )
}

// ---- Agent fields ----

function AgentFields({
  data,
  upd,
}: {
  data: Extract<NodeData, { type: 'agent' }>
  upd: (p: Partial<NodeData>) => void
}) {
  const selectedProvider = AI_PROVIDERS.find((p) => p.id === data.provider)

  const handleProviderChange = (providerId: string) => {
    upd({
      provider: providerId,
      modelId: AI_PROVIDERS.find((p) => p.id === providerId)?.defaultModels[0] ?? '',
      credentials: {},
    } as any)
  }

  const handleCredentialChange = (key: string, val: string) => {
    upd({ credentials: { ...data.credentials, [key]: val } } as any)
  }

  return (
    <>
      <Divider label="AI Provider" />

      <Field label="Provider">
        <SelectInput value={data.provider} onChange={handleProviderChange}>
          <option value="">Select a provider…</option>
          {AI_PROVIDERS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </SelectInput>
      </Field>

      {selectedProvider && (
        <>
          {selectedProvider.credentialFields.map((field) => (
            <Field key={field.key} label={field.label}>
              <TextInput
                type={field.type}
                value={data.credentials[field.key] ?? ''}
                onChange={(v) => handleCredentialChange(field.key, v)}
                placeholder={field.placeholder}
                mono
              />
            </Field>
          ))}

          <Field label="Model" hint="Type any model ID or pick from the list.">
            <ModelCombobox
              value={data.modelId}
              onChange={(v) => upd({ modelId: v } as any)}
              suggestions={selectedProvider.defaultModels}
            />
          </Field>
        </>
      )}

      <Divider label="Prompts" />

      <Field label="System Prompt">
        <TextArea
          value={data.systemPrompt}
          onChange={(v) => upd({ systemPrompt: v } as any)}
          rows={4}
        />
      </Field>

      <Field
        label="User Prompt Template"
        hint="Use {{varName}} to interpolate workflow state variables."
      >
        <TextArea
          value={data.userPromptTemplate}
          onChange={(v) => upd({ userPromptTemplate: v } as any)}
          mono
          rows={4}
        />
      </Field>

      <Divider label="Output" />

      <Field label="Output Variable" hint="State key where this agent's response is stored.">
        <TextInput
          value={data.outputVariable}
          onChange={(v) => upd({ outputVariable: v } as any)}
          mono
        />
      </Field>

      <Collapsible label="Structured Output (optional)">
        <Field
          label="JSON Schema"
          hint="When set, the model responds with structured data matching this schema."
        >
          <JsonEditor
            value={data.outputSchema ?? ''}
            onChange={(v) => upd({ outputSchema: v } as any)}
            rows={9}
            placeholder={`{\n  "type": "object",\n  "properties": {\n    "sentiment": { "type": "string" },\n    "score": { "type": "number" }\n  }\n}`}
          />
        </Field>
      </Collapsible>
    </>
  )
}

// ---- Tool fields ----

const TOOL_KIND_OPTIONS: { value: ToolKind; label: string }[] = [
  { value: 'api', label: 'REST API' },
  { value: 'mcp', label: 'MCP Server' },
  { value: 'devtool', label: 'Built-in Dev Tool' },
  { value: 'function', label: 'Custom Function (JS)' },
]

function ToolFields({
  data,
  upd,
}: {
  data: Extract<NodeData, { type: 'tool' }>
  upd: (p: Partial<NodeData>) => void
}) {
  return (
    <>
      <Field label="Tool Type">
        <SelectInput
          value={data.toolKind}
          onChange={(v) => upd({ toolKind: v as ToolKind } as any)}
        >
          {TOOL_KIND_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </SelectInput>
      </Field>

      <Field label="Output Variable">
        <TextInput
          value={data.outputVariable}
          onChange={(v) => upd({ outputVariable: v } as any)}
          mono
        />
      </Field>

      {data.toolKind === 'api' && <ApiToolFields data={data} upd={upd} />}
      {data.toolKind === 'mcp' && <McpToolFields data={data} upd={upd} />}
      {data.toolKind === 'devtool' && <DevToolFields data={data} upd={upd} />}
      {data.toolKind === 'function' && <FunctionToolFields data={data} upd={upd} />}
    </>
  )
}

function ApiToolFields({
  data,
  upd,
}: {
  data: Extract<NodeData, { type: 'tool' }>
  upd: (p: Partial<NodeData>) => void
}) {
  return (
    <>
      <Divider label="REST API" />
      <Field label="URL" hint="Use {{varName}} for dynamic values from workflow state.">
        <TextInput
          value={data.apiUrl ?? ''}
          onChange={(v) => upd({ apiUrl: v } as any)}
          placeholder="https://api.example.com/endpoint"
          mono
        />
      </Field>
      <Field label="HTTP Method">
        <SelectInput value={data.apiMethod ?? 'GET'} onChange={(v) => upd({ apiMethod: v } as any)}>
          <option>GET</option>
          <option>POST</option>
          <option>PUT</option>
          <option>PATCH</option>
          <option>DELETE</option>
        </SelectInput>
      </Field>
      <Field label="Headers" hint="JSON object. Use {{varName}} for dynamic values.">
        <JsonEditor
          value={data.apiHeaders ?? '{}'}
          onChange={(v) => upd({ apiHeaders: v } as any)}
          rows={3}
          placeholder={'{\n  "Authorization": "Bearer {{token}}"\n}'}
        />
      </Field>
      {(data.apiMethod ?? 'GET') !== 'GET' && (
        <Field label="Body" hint="JSON object. Use {{varName}} for interpolation.">
          <JsonEditor
            value={data.apiBodyTemplate ?? ''}
            onChange={(v) => upd({ apiBodyTemplate: v } as any)}
            rows={5}
            placeholder={'{\n  "query": "{{input}}"\n}'}
          />
        </Field>
      )}
    </>
  )
}

function McpToolFields({
  data,
  upd,
}: {
  data: Extract<NodeData, { type: 'tool' }>
  upd: (p: Partial<NodeData>) => void
}) {
  return (
    <>
      <Divider label="MCP Server" />
      <Field label="Server URL">
        <TextInput
          value={data.mcpServerUrl ?? ''}
          onChange={(v) => upd({ mcpServerUrl: v } as any)}
          placeholder="https://mcp.example.com/sse"
          mono
        />
      </Field>
      <Field label="Tool Name">
        <TextInput
          value={data.mcpToolName ?? ''}
          onChange={(v) => upd({ mcpToolName: v } as any)}
          placeholder="tool-name"
          mono
        />
      </Field>
      <Field label="Arguments" hint="JSON object. Use {{varName}} for dynamic values.">
        <JsonEditor
          value={data.mcpArgumentsTemplate ?? '{}'}
          onChange={(v) => upd({ mcpArgumentsTemplate: v } as any)}
          rows={5}
          placeholder={'{\n  "input": "{{input}}"\n}'}
        />
      </Field>
    </>
  )
}

function DevToolFields({
  data,
  upd,
}: {
  data: Extract<NodeData, { type: 'tool' }>
  upd: (p: Partial<NodeData>) => void
}) {
  return (
    <>
      <Divider label="Built-in Dev Tool" />
      <Field label="Tool">
        <SelectInput value={data.devToolId ?? ''} onChange={(v) => upd({ devToolId: v } as any)}>
          <option value="">Select a tool…</option>
          {TOOLS.filter((t) => !('comingSoon' in t && t.comingSoon)).map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </SelectInput>
      </Field>
      <Field
        label="Input Mapping"
        hint='JSON: maps tool params → state variables. e.g. {"input":"agentOutput"}'
      >
        <JsonEditor
          value={data.devToolInputMapping ?? '{}'}
          onChange={(v) => upd({ devToolInputMapping: v } as any)}
          rows={4}
          placeholder={'{\n  "input": "agentOutput"\n}'}
        />
      </Field>
    </>
  )
}

function FunctionToolFields({
  data,
  upd,
}: {
  data: Extract<NodeData, { type: 'tool' }>
  upd: (p: Partial<NodeData>) => void
}) {
  return (
    <>
      <Divider label="Custom Function" />
      <Field
        label="JavaScript Code"
        hint="Receives `state: Record<string, any>`. Must return a value. Runs client-side only."
      >
        <TextArea
          value={data.functionCode ?? ''}
          onChange={(v) => upd({ functionCode: v } as any)}
          mono
          rows={8}
          placeholder={'// Example:\nreturn state.input.toUpperCase()'}
        />
      </Field>
      <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl">
        <p className="text-[10px] text-amber-600 leading-relaxed">
          Custom functions run in the browser sandbox. Disabled in server-side / MCP execution.
        </p>
      </div>
    </>
  )
}
