'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Bot, Wrench, Play, Square, Zap, Code2, Globe, Server } from 'lucide-react'
import type { NodeData, ToolKind } from '@/lib/workflow-types'

// ---- Accent token maps ----

const RING: Record<string, string> = {
  emerald: '#10b981',
  slate: '#94a3b8',
  violet: '#8b5cf6',
  sky: '#0ea5e9',
}

const HEADER_GRADIENT: Record<string, string> = {
  emerald: 'from-emerald-500 to-emerald-600',
  slate: 'from-slate-400 to-slate-500',
  violet: 'from-violet-500 to-violet-600',
  sky: 'from-sky-500 to-sky-600',
}

const GLOW: Record<string, string> = {
  emerald: 'shadow-emerald-500/20',
  slate: 'shadow-slate-400/15',
  violet: 'shadow-violet-500/20',
  sky: 'shadow-sky-500/20',
}

const TOOL_KIND_ICON: Record<ToolKind, React.ElementType> = {
  api: Globe,
  mcp: Server,
  devtool: Zap,
  function: Code2,
}

const TOOL_KIND_COLOR: Record<ToolKind, string> = {
  api: 'text-sky-400',
  mcp: 'text-teal-400',
  devtool: 'text-yellow-400',
  function: 'text-orange-400',
}

const TOOL_KIND_LABEL: Record<ToolKind, string> = {
  api: 'REST API',
  mcp: 'MCP',
  devtool: 'Dev Tool',
  function: 'Function',
}

// ---- Status ring ----

function statusRingStyle(status?: string): React.CSSProperties {
  if (status === 'running') return { boxShadow: '0 0 0 2px #fbbf24, 0 0 12px #fbbf2466' }
  if (status === 'done') return { boxShadow: '0 0 0 2px #10b981, 0 0 12px #10b98166' }
  if (status === 'error') return { boxShadow: '0 0 0 2px #f87171, 0 0 12px #f8717166' }
  return {}
}

// ---- Handle ----

function InHandle({ id }: { id?: string }) {
  return (
    <Handle
      type="target"
      position={Position.Left}
      id={id}
      style={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        border: '2.5px solid var(--background)',
        background: '#64748b',
        left: -6,
      }}
    />
  )
}

function OutHandle({ id, top }: { id?: string; top?: string }) {
  return (
    <Handle
      type="source"
      position={Position.Right}
      id={id}
      style={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        border: '2.5px solid var(--background)',
        background: '#64748b',
        right: -6,
        ...(top ? { top } : {}),
      }}
    />
  )
}

// ---- NodeShell ----

interface ShellProps {
  accent: string
  icon: React.ElementType
  badge: string
  label: string
  subtitle?: string
  meta?: React.ReactNode
  hasInput?: boolean
  hasOutput?: boolean
  executionStatus?: string
  children?: React.ReactNode
}

function NodeShell({
  accent,
  icon: Icon,
  badge,
  label,
  subtitle,
  meta,
  hasInput = true,
  hasOutput = true,
  executionStatus,
}: ShellProps) {
  const accentColor = RING[accent] ?? RING.slate

  return (
    <div
      className={`relative min-w-50 max-w-65 rounded-2xl overflow-hidden bg-card border border-border shadow-xl ${GLOW[accent] ?? ''}`}
      style={{
        borderColor: accentColor + '55',
        boxShadow: `0 4px 24px -4px ${accentColor}30, 0 1px 3px rgba(0,0,0,.15)`,
        ...statusRingStyle(executionStatus),
      }}
    >
      {/* Header */}
      <div
        className={`bg-linear-to-r ${HEADER_GRADIENT[accent]} px-3 py-2 flex items-center gap-2`}
      >
        <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center shrink-0">
          <Icon size={11} className="text-white" />
        </div>
        <span className="text-white text-[10px] font-bold uppercase tracking-widest flex-1 truncate">
          {badge}
        </span>
        {executionStatus === 'running' && (
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" />
        )}
        {executionStatus === 'done' && (
          <span className="text-white/90 text-[10px] font-bold shrink-0">✓</span>
        )}
        {executionStatus === 'error' && (
          <span className="text-white/90 text-[10px] font-bold shrink-0">✗</span>
        )}
      </div>

      {/* Body */}
      <div className="px-3 pt-2.5 pb-2.5">
        <p className="text-[13px] font-semibold text-foreground leading-tight truncate">{label}</p>
        {subtitle && (
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">
            {subtitle}
          </p>
        )}
        {meta && <div className="mt-1.5">{meta}</div>}
      </div>

      {/* Thin accent bottom line */}
      <div
        className="h-0.5 w-full"
        style={{ background: `linear-gradient(to right, ${accentColor}80, transparent)` }}
      />

      {hasInput && <InHandle />}
      {hasOutput && <OutHandle />}
    </div>
  )
}

// ---- Pill badge helper ----

function Pill({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${color}`}
    >
      {children}
    </span>
  )
}

// ---- Node components ----

export const StartNode = memo(({ data }: NodeProps) => {
  const d = data as unknown as NodeData
  if (d.type !== 'start') return null
  return (
    <NodeShell
      accent="emerald"
      icon={Play}
      badge="START"
      label={d.label}
      subtitle={d.description || 'Graph entry point · text input'}
      hasInput={false}
    />
  )
})
StartNode.displayName = 'StartNode'

export const EndNode = memo(({ data }: NodeProps) => {
  const d = data as unknown as NodeData
  if (d.type !== 'end') return null
  return (
    <NodeShell
      accent="slate"
      icon={Square}
      badge="END"
      label={d.label}
      subtitle="Graph exit point · text output"
      hasOutput={false}
    />
  )
})
EndNode.displayName = 'EndNode'

export const AgentNode = memo(({ data }: NodeProps) => {
  const d = data as unknown as NodeData
  if (d.type !== 'agent') return null

  const hasProvider = !!(d.provider && d.modelId)
  const modelLabel = d.modelId || (d.provider ? `${d.provider} (no model)` : 'unconfigured')
  const promptPreview =
    d.userPromptTemplate.length > 42
      ? d.userPromptTemplate.slice(0, 42) + '…'
      : d.userPromptTemplate
  const hasSchema = !!(d.outputSchema && d.outputSchema.trim())

  return (
    <NodeShell
      accent="violet"
      icon={Bot}
      badge="AGENT"
      label={d.label}
      subtitle={promptPreview}
      meta={
        <div className="flex flex-wrap gap-1">
          {hasProvider ? (
            <Pill color="bg-violet-500/15 text-violet-400">{modelLabel}</Pill>
          ) : (
            <Pill color="bg-amber-500/15 text-amber-400">⚠ no provider</Pill>
          )}
          {hasSchema && <Pill color="bg-emerald-500/15 text-emerald-400">structured out</Pill>}
          <Pill color="bg-secondary text-muted-foreground">→ {d.outputVariable}</Pill>
        </div>
      }
    />
  )
})
AgentNode.displayName = 'AgentNode'

export const ToolNode = memo(({ data }: NodeProps) => {
  const d = data as unknown as NodeData
  if (d.type !== 'tool') return null

  const KindIcon = TOOL_KIND_ICON[d.toolKind] ?? Wrench
  const kindLabel = TOOL_KIND_LABEL[d.toolKind] ?? d.toolKind
  const kindColor = TOOL_KIND_COLOR[d.toolKind] ?? 'text-muted-foreground'

  const detail =
    d.toolKind === 'api'
      ? d.apiUrl || 'No URL set'
      : d.toolKind === 'mcp'
        ? d.mcpToolName || 'No tool name'
        : d.toolKind === 'devtool'
          ? d.devToolId || 'No tool selected'
          : 'Custom JS function'

  return (
    <NodeShell
      accent="sky"
      icon={Wrench}
      badge="TOOL"
      label={d.label}
      subtitle={detail}
      meta={
        <div className="flex flex-wrap gap-1">
          <Pill color={`bg-sky-500/10 ${kindColor}`}>
            <KindIcon size={9} />
            {kindLabel}
          </Pill>
          <Pill color="bg-secondary text-muted-foreground">→ {d.outputVariable}</Pill>
        </div>
      }
    />
  )
})
ToolNode.displayName = 'ToolNode'

export const NODE_TYPES = {
  start: StartNode,
  end: EndNode,
  agent: AgentNode,
  tool: ToolNode,
}
