'use client'

import { useState, useCallback, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  type ReactFlowInstance,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

// ReactFlow requires data: Record<string,unknown>; we cast through this alias
type RFNode = Node<Record<string, unknown>>

import { NODE_TYPES } from './nodes/workflow-nodes'
import { WorkflowSidebar } from './workflow-sidebar'
import { NodeConfigPanel } from './panels/node-config-panel'
import { WorkflowExecutionPanel } from './workflow-execution-panel'
import { ProviderConfigSection, DEFAULT_PROVIDER_CONFIG } from '../provider-config'
import type { ProviderConfig } from '../provider-config'
import type {
  WorkflowNode,
  WorkflowDefinition,
  NodeType,
  NodeData,
  ExecutionStep,
  ExecutionResult,
} from '@/lib/workflow-types'
import { NODE_PALETTE } from '@/lib/workflow-types'
import { Play, Download, Upload, Trash2, LayoutGrid, Loader2 } from 'lucide-react'

const DEFAULT_NODES: RFNode[] = [
  {
    id: 'node-input-1',
    type: 'input',
    position: { x: 80, y: 180 },
    data: { type: 'input', label: 'Input', description: '' },
  },
  {
    id: 'node-output-1',
    type: 'output',
    position: { x: 480, y: 180 },
    data: { type: 'output', label: 'Output', format: 'text' },
  },
]

let nodeCounter = 100

function makeNodeId() {
  return `node-${++nodeCounter}`
}

export function WorkflowBuilderTool() {
  const [nodes, setNodes, onNodesChange] = useNodesState<RFNode>(DEFAULT_NODES)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [providerConfig, setProviderConfig] = useState<ProviderConfig>(DEFAULT_PROVIDER_CONFIG)
  const [workflowName, setWorkflowName] = useState('My Workflow')
  const [running, setRunning] = useState(false)
  const [execSteps, setExecSteps] = useState<ExecutionStep[]>([])
  const [execResult, setExecResult] = useState<ExecutionResult | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [showInput, setShowInput] = useState(false)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null)

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) => addEdge({ ...connection, id: `e-${Date.now()}` }, eds)),
    [setEdges]
  )

  const onNodeClick = useCallback((_: React.MouseEvent, node: RFNode) => {
    setSelectedNodeId(node.id)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null)
  }, [])

  const addNode = useCallback(
    (type: NodeType, position?: { x: number; y: number }) => {
      const palette = NODE_PALETTE.find((p) => p.type === type)
      if (!palette) return
      const id = makeNodeId()
      const pos = position ?? {
        x: 200 + Math.random() * 200,
        y: 100 + Math.random() * 200,
      }
      const newNode: RFNode = {
        id,
        type,
        position: pos,
        data: { type, label: palette.label, ...palette.defaultData } as Record<string, unknown>,
      }
      setNodes((nds) => [...nds, newNode])
      setSelectedNodeId(id)
    },
    [setNodes]
  )

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const type = e.dataTransfer.getData('application/workflow-node-type') as NodeType
      if (!type || !rfInstance || !reactFlowWrapper.current) return
      const bounds = reactFlowWrapper.current.getBoundingClientRect()
      const position = rfInstance.screenToFlowPosition({
        x: e.clientX - bounds.left,
        y: e.clientY - bounds.top,
      })
      addNode(type, position)
    },
    [rfInstance, addNode]
  )

  const updateNodeData = useCallback(
    (nodeId: string, patch: Partial<NodeData>) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, ...(patch as Record<string, unknown>) } } : n
        )
      )
    },
    [setNodes]
  )

  const deleteSelectedNode = useCallback(() => {
    if (!selectedNodeId) return
    setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId))
    setEdges((eds) => eds.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId))
    setSelectedNodeId(null)
  }, [selectedNodeId, setNodes, setEdges])

  const exportWorkflow = () => {
    const def: WorkflowDefinition = {
      id: `wf-${Date.now()}`,
      name: workflowName,
      version: '1.0',
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type as NodeType,
        position: n.position,
        data: n.data as unknown as NodeData,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle ?? undefined,
        label: typeof e.label === 'string' ? e.label : undefined,
      })),
    }
    const blob = new Blob([JSON.stringify(def, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${workflowName.replace(/\s+/g, '-').toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importWorkflow = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const def: WorkflowDefinition = JSON.parse(ev.target?.result as string)
          setWorkflowName(def.name)
          setNodes(
            def.nodes.map((n) => ({
              id: n.id,
              type: n.type,
              position: n.position,
              data: n.data as unknown as Record<string, unknown>,
            }))
          )
          setEdges(
            def.edges.map((e) => ({
              id: e.id,
              source: e.source,
              target: e.target,
              sourceHandle: e.sourceHandle,
              label: e.label,
            }))
          )
        } catch {
          alert('Invalid workflow JSON file.')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const runWorkflow = async () => {
    const isConfigured =
      providerConfig.provider !== '' &&
      providerConfig.modelId !== '' &&
      (Object.values(providerConfig.credentials).some((v) => v.trim() !== '') ||
        providerConfig.provider === 'ollama')

    if (!isConfigured) {
      alert('Please configure an AI provider before running.')
      return
    }

    setRunning(true)
    setExecSteps([])
    setExecResult(null)

    const def: WorkflowDefinition = {
      id: `wf-${Date.now()}`,
      name: workflowName,
      version: '1.0',
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type as NodeType,
        position: n.position,
        data: n.data as unknown as NodeData,
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle ?? undefined,
      })),
    }

    try {
      // Dynamic import so ReactFlow's bundle isn't loaded server-side
      const { executeWorkflowClient } = await import('@/lib/workflow-engine')
      const aiConfig = {
        provider: providerConfig.provider,
        modelId: providerConfig.modelId,
        credentials: providerConfig.credentials as any,
      }
      const result = await executeWorkflowClient(def, inputValue, aiConfig, (step) => {
        setExecSteps((prev) => {
          const idx = prev.findIndex((s) => s.nodeId === step.nodeId)
          if (idx >= 0) {
            const copy = [...prev]
            copy[idx] = step
            return copy
          }
          return [...prev, step]
        })
      })
      setExecResult(result)
    } catch (err: any) {
      setExecResult({ success: false, output: null, steps: [], error: err.message })
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] min-h-[600px]">
      {/* Top toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card shrink-0 flex-wrap gap-y-2">
        <input
          type="text"
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          className="input-base text-sm font-medium w-48 py-1.5"
        />

        <div className="flex-1" />

        {/* Provider config (collapsed) */}
        <div className="w-72">
          <ProviderConfigSection value={providerConfig} onChange={setProviderConfig} />
        </div>

        <button
          onClick={() => setShowInput((v) => !v)}
          className="btn-secondary text-sm px-3 py-1.5 flex items-center gap-1.5"
          title="Set workflow input"
        >
          <LayoutGrid size={14} />
          Input
        </button>
        <button
          onClick={importWorkflow}
          className="btn-secondary text-sm px-3 py-1.5 flex items-center gap-1.5"
          title="Import workflow JSON"
        >
          <Upload size={14} />
          Import
        </button>
        <button
          onClick={exportWorkflow}
          className="btn-secondary text-sm px-3 py-1.5 flex items-center gap-1.5"
          title="Export workflow JSON"
        >
          <Download size={14} />
          Export
        </button>
        {selectedNodeId && (
          <button
            onClick={deleteSelectedNode}
            className="btn-secondary text-sm px-3 py-1.5 flex items-center gap-1.5 text-red-500 hover:text-red-600"
            title="Delete selected node"
          >
            <Trash2 size={14} />
            Delete
          </button>
        )}
        <button
          onClick={runWorkflow}
          disabled={running}
          className="btn-primary text-sm px-4 py-1.5 flex items-center gap-1.5"
        >
          {running ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play size={14} />
              Run
            </>
          )}
        </button>
      </div>

      {/* Input bar */}
      {showInput && (
        <div className="px-4 py-2 border-b border-border bg-secondary/50 flex items-center gap-3 shrink-0">
          <label className="text-sm font-medium text-foreground whitespace-nowrap">
            Workflow Input:
          </label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter input data for the workflow..."
            className="input-base text-sm flex-1 py-1.5"
          />
        </div>
      )}

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        <WorkflowSidebar onAddNode={addNode} />

        {/* Canvas */}
        <div
          ref={reactFlowWrapper}
          className="flex-1 relative"
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={NODE_TYPES}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onInit={setRfInstance}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            deleteKeyCode="Delete"
            className="bg-background"
          >
            <Background color="var(--border)" gap={20} size={1} />
            <Controls className="!bg-card !border-border !shadow-md" />
            <MiniMap
              className="!bg-card !border !border-border !rounded-xl"
              nodeColor={(n) => {
                const type = n.type as NodeType
                const colors: Record<NodeType, string> = {
                  input: '#22c55e',
                  output: '#3b82f6',
                  'llm-call': '#a855f7',
                  conditional: '#f59e0b',
                  loop: '#f97316',
                  'tool-call': '#06b6d4',
                  transform: '#6b7280',
                  merge: '#14b8a6',
                }
                return colors[type] ?? '#94a3b8'
              }}
            />
          </ReactFlow>

          {/* Empty state hint */}
          {nodes.length <= 2 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-muted-foreground">
                <p className="text-sm">Drag nodes from the left panel onto the canvas</p>
                <p className="text-xs mt-1">
                  Connect nodes by dragging from an output handle to an input handle
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Config panel */}
        {selectedNode && (
          <NodeConfigPanel
            node={
              { ...selectedNode, data: selectedNode.data as unknown as NodeData } as WorkflowNode
            }
            onUpdate={updateNodeData}
            onClose={() => setSelectedNodeId(null)}
          />
        )}
      </div>

      {/* Execution panel */}
      <WorkflowExecutionPanel running={running} result={execResult} steps={execSteps} />
    </div>
  )
}
