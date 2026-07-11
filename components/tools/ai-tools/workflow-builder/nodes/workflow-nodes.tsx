'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { NodeData, NodeType } from '@/lib/workflow-types'

const NODE_COLORS: Record<NodeType, string> = {
  input: 'border-green-500 bg-green-500/5',
  output: 'border-blue-500 bg-blue-500/5',
  'llm-call': 'border-purple-500 bg-purple-500/5',
  conditional: 'border-amber-500 bg-amber-500/5',
  loop: 'border-orange-500 bg-orange-500/5',
  'tool-call': 'border-cyan-500 bg-cyan-500/5',
  transform: 'border-gray-400 bg-gray-500/5',
  merge: 'border-teal-500 bg-teal-500/5',
}

const NODE_HEADER_COLORS: Record<NodeType, string> = {
  input: 'bg-green-500',
  output: 'bg-blue-500',
  'llm-call': 'bg-purple-500',
  conditional: 'bg-amber-500',
  loop: 'bg-orange-500',
  'tool-call': 'bg-cyan-500',
  transform: 'bg-gray-500',
  merge: 'bg-teal-500',
}

const NODE_TYPE_LABELS: Record<NodeType, string> = {
  input: 'Input',
  output: 'Output',
  'llm-call': 'LLM Call',
  conditional: 'Conditional',
  loop: 'Loop',
  'tool-call': 'Tool Call',
  transform: 'Transform',
  merge: 'Merge',
}

function NodeShell({
  nodeType,
  label,
  subtitle,
  hasInput = true,
  hasOutput = true,
  conditionalHandles = false,
  executionStatus,
}: {
  nodeType: NodeType
  label: string
  subtitle?: string
  hasInput?: boolean
  hasOutput?: boolean
  conditionalHandles?: boolean
  executionStatus?: string
}) {
  const statusRing =
    executionStatus === 'running'
      ? 'ring-2 ring-yellow-400 ring-offset-1'
      : executionStatus === 'done'
        ? 'ring-2 ring-green-400 ring-offset-1'
        : executionStatus === 'error'
          ? 'ring-2 ring-red-400 ring-offset-1'
          : ''

  return (
    <div
      className={`min-w-[160px] max-w-[220px] rounded-xl border-2 overflow-hidden shadow-md ${NODE_COLORS[nodeType]} ${statusRing}`}
    >
      <div className={`px-3 py-1.5 flex items-center gap-1.5 ${NODE_HEADER_COLORS[nodeType]}`}>
        <span className="text-white text-xs font-semibold uppercase tracking-wide">
          {NODE_TYPE_LABELS[nodeType]}
        </span>
        {executionStatus === 'running' && (
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse ml-auto" />
        )}
        {executionStatus === 'done' && <span className="text-white text-xs ml-auto">✓</span>}
        {executionStatus === 'error' && <span className="text-white text-xs ml-auto">✗</span>}
      </div>
      <div className="px-3 py-2">
        <p className="text-sm font-medium text-foreground truncate">{label}</p>
        {subtitle && <p className="text-xs text-muted-foreground truncate mt-0.5">{subtitle}</p>}
      </div>

      {hasInput && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !bg-border !border-2 !border-background"
        />
      )}
      {hasOutput && !conditionalHandles && (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !bg-border !border-2 !border-background"
        />
      )}
      {conditionalHandles && (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            style={{ top: '35%' }}
            className="!w-3 !h-3 !bg-green-500 !border-2 !border-background"
          />
          <Handle
            type="source"
            position={Position.Right}
            id="false"
            style={{ top: '65%' }}
            className="!w-3 !h-3 !bg-red-500 !border-2 !border-background"
          />
        </>
      )}
    </div>
  )
}

// ReactFlow passes `data` as Record<string,unknown>; cast to NodeData for our use
export const InputNode = memo(({ data }: NodeProps) => {
  const d = data as unknown as NodeData
  if (d.type !== 'input') return null
  return <NodeShell nodeType="input" label={d.label} subtitle="Entry point" hasInput={false} />
})
InputNode.displayName = 'InputNode'

export const OutputNode = memo(({ data }: NodeProps) => {
  const d = data as unknown as NodeData
  if (d.type !== 'output') return null
  return (
    <NodeShell
      nodeType="output"
      label={d.label}
      subtitle={`Format: ${d.format}`}
      hasOutput={false}
    />
  )
})
OutputNode.displayName = 'OutputNode'

export const LLMCallNode = memo(({ data }: NodeProps) => {
  const d = data as unknown as NodeData
  if (d.type !== 'llm-call') return null
  const preview =
    d.userPromptTemplate.slice(0, 40) + (d.userPromptTemplate.length > 40 ? '...' : '')
  return <NodeShell nodeType="llm-call" label={d.label} subtitle={preview} />
})
LLMCallNode.displayName = 'LLMCallNode'

export const ConditionalNode = memo(({ data }: NodeProps) => {
  const d = data as unknown as NodeData
  if (d.type !== 'conditional') return null
  return (
    <NodeShell
      nodeType="conditional"
      label={d.label}
      subtitle={d.mode === 'llm' ? 'LLM decision' : d.condition.slice(0, 30)}
      conditionalHandles
    />
  )
})
ConditionalNode.displayName = 'ConditionalNode'

export const LoopNode = memo(({ data }: NodeProps) => {
  const d = data as unknown as NodeData
  if (d.type !== 'loop') return null
  return (
    <NodeShell
      nodeType="loop"
      label={d.label}
      subtitle={`each ${d.itemVariable} in ${d.iterateOver}`}
    />
  )
})
LoopNode.displayName = 'LoopNode'

export const ToolCallNode = memo(({ data }: NodeProps) => {
  const d = data as unknown as NodeData
  if (d.type !== 'tool-call') return null
  return (
    <NodeShell nodeType="tool-call" label={d.label} subtitle={d.toolId || 'No tool selected'} />
  )
})
ToolCallNode.displayName = 'ToolCallNode'

export const TransformNode = memo(({ data }: NodeProps) => {
  const d = data as unknown as NodeData
  if (d.type !== 'transform') return null
  return <NodeShell nodeType="transform" label={d.label} subtitle="JS transform" />
})
TransformNode.displayName = 'TransformNode'

export const MergeNode = memo(({ data }: NodeProps) => {
  const d = data as unknown as NodeData
  if (d.type !== 'merge') return null
  return <NodeShell nodeType="merge" label={d.label} subtitle={`Strategy: ${d.strategy}`} />
})
MergeNode.displayName = 'MergeNode'

export const NODE_TYPES = {
  input: InputNode,
  output: OutputNode,
  'llm-call': LLMCallNode,
  conditional: ConditionalNode,
  loop: LoopNode,
  'tool-call': ToolCallNode,
  transform: TransformNode,
  merge: MergeNode,
}
