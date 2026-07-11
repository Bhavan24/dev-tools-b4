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
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type Connection,
  type Edge,
  type Node,
  type ReactFlowInstance,
  type EdgeProps,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

type RFNode = Node<Record<string, unknown>>

import { NODE_TYPES } from './nodes/workflow-nodes'
import { WorkflowSidebar } from './workflow-sidebar'
import { NodeConfigPanel } from './panels/node-config-panel'
import { WorkflowExecutionPanel } from './workflow-execution-panel'
import type {
  WorkflowNode,
  WorkflowDefinition,
  NodeType,
  NodeData,
  ExecutionStep,
  ExecutionResult,
  WorkflowEdge,
} from '@/lib/workflow-types'
import { NODE_PALETTE } from '@/lib/workflow-types'
import { WORKFLOW_TEMPLATES } from '@/lib/workflow-templates'
import {
  Play,
  Download,
  Upload,
  Trash2,
  Loader2,
  Code2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

// ---- Default graph ----

const DEFAULT_NODES: RFNode[] = [
  {
    id: 'node-start',
    type: 'start',
    position: { x: 80, y: 200 },
    data: { type: 'start', label: 'Start', description: '' },
  },
  {
    id: 'node-end',
    type: 'end',
    position: { x: 520, y: 200 },
    data: { type: 'end', label: 'End' },
  },
]

const DEFAULT_EDGES: Edge[] = [
  { id: 'e-start-end', source: 'node-start', target: 'node-end', type: 'workflow' },
]

let nodeCounter = 100
function makeNodeId() {
  return `node-${++nodeCounter}`
}

// ---- Custom bezier edge ----

const MINIMAP_COLORS: Record<string, string> = {
  start: '#10b981',
  end: '#94a3b8',
  agent: '#8b5cf6',
  tool: '#0ea5e9',
}

function WorkflowEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })
  const hasCondition = !!(data as any)?.conditionCode
  const label = (data as any)?.label as string | undefined

  const strokeColor = selected
    ? '#8b5cf6'
    : hasCondition
      ? '#f59e0b'
      : 'var(--color-border, #e2e8f0)'

  return (
    <>
      {/* Glow underlay for selected/conditional edges */}
      {(selected || hasCondition) && (
        <BaseEdge
          id={`${id}-glow`}
          path={edgePath}
          style={{
            stroke: strokeColor,
            strokeWidth: 6,
            opacity: 0.15,
            strokeDasharray: hasCondition ? '6 4' : undefined,
          }}
        />
      )}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: strokeColor,
          strokeWidth: selected ? 2 : 1.5,
          strokeDasharray: hasCondition ? '6 4' : undefined,
          transition: 'stroke 0.15s, stroke-width 0.15s',
        }}
      />
      {(label || hasCondition) && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <div className="flex items-center gap-1 bg-card border border-border rounded-lg px-2 py-0.5 shadow-md">
              {hasCondition && <Code2 size={9} className="text-amber-400 shrink-0" />}
              {label && (
                <span className="text-[10px] text-foreground font-semibold max-w-[90px] truncate">
                  {label}
                </span>
              )}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

const EDGE_TYPES = { workflow: WorkflowEdgeComponent }

// ---- Helpers to convert WorkflowDefinition <-> ReactFlow state ----

function defToRF(def: WorkflowDefinition): { nodes: RFNode[]; edges: Edge[] } {
  return {
    nodes: def.nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: n.data as unknown as Record<string, unknown>,
    })),
    edges: def.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle,
      label: e.label,
      type: 'workflow',
      data: { conditionCode: e.conditionCode, label: e.label },
    })),
  }
}

// ---- Main component ----

export function WorkflowBuilderTool() {
  const [nodes, setNodes, onNodesChange] = useNodesState<RFNode>(DEFAULT_NODES)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(DEFAULT_EDGES)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)
  const [workflowName, setWorkflowName] = useState('My Workflow')
  const [running, setRunning] = useState(false)
  const [execSteps, setExecSteps] = useState<ExecutionStep[]>([])
  const [execResult, setExecResult] = useState<ExecutionResult | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [inputExpanded, setInputExpanded] = useState(false)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null)

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null
  const selectedEdge = edges.find((e) => e.id === selectedEdgeId) ?? null

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) => addEdge({ ...connection, id: `e-${Date.now()}`, type: 'workflow' }, eds)),
    [setEdges]
  )

  const onNodeClick = useCallback((_: React.MouseEvent, node: RFNode) => {
    setSelectedNodeId(node.id)
    setSelectedEdgeId(null)
  }, [])

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setSelectedEdgeId(edge.id)
    setSelectedNodeId(null)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null)
    setSelectedEdgeId(null)
  }, [])

  const addNode = useCallback(
    (type: NodeType, position?: { x: number; y: number }) => {
      const palette = NODE_PALETTE.find((p) => p.type === type)
      if (!palette) return
      const id = makeNodeId()
      const pos = position ?? { x: 200 + Math.random() * 200, y: 100 + Math.random() * 200 }
      const newNode: RFNode = {
        id,
        type,
        position: pos,
        data: { type, label: palette.label, ...palette.defaultData } as Record<string, unknown>,
      }
      setNodes((nds) => [...nds, newNode])
      setSelectedNodeId(id)
      setSelectedEdgeId(null)
    },
    [setNodes]
  )

  const loadTemplate = useCallback(
    (def: WorkflowDefinition) => {
      const { nodes: ns, edges: es } = defToRF(def)
      setWorkflowName(def.name)
      setNodes(ns)
      setEdges(es)
      setSelectedNodeId(null)
      setSelectedEdgeId(null)
      setExecSteps([])
      setExecResult(null)
      setTimeout(() => rfInstance?.fitView({ padding: 0.2 }), 50)
    },
    [rfInstance, setNodes, setEdges]
  )

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()

      // Template drop - load entire graph
      const templateId = e.dataTransfer.getData('application/workflow-template-id')
      if (templateId) {
        const tpl = WORKFLOW_TEMPLATES.find((t) => t.id === templateId)
        if (tpl) {
          loadTemplate({
            id: `wf-${Date.now()}`,
            name: tpl.definition.name,
            version: '2.0',
            nodes: tpl.definition.nodes,
            edges: tpl.definition.edges,
          })
        }
        return
      }

      // Node drop
      const type = e.dataTransfer.getData('application/workflow-node-type') as NodeType
      if (!type || !rfInstance || !reactFlowWrapper.current) return
      const bounds = reactFlowWrapper.current.getBoundingClientRect()
      const position = rfInstance.screenToFlowPosition({
        x: e.clientX - bounds.left,
        y: e.clientY - bounds.top,
      })
      addNode(type, position)
    },
    [rfInstance, addNode, loadTemplate]
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

  const updateEdgeData = useCallback(
    (edgeId: string, patch: Partial<WorkflowEdge>) => {
      setEdges((eds) =>
        eds.map((e) =>
          e.id === edgeId
            ? {
                ...e,
                label: patch.label !== undefined ? patch.label : e.label,
                data: { ...(e.data ?? {}), ...(patch as Record<string, unknown>) },
              }
            : e
        )
      )
    },
    [setEdges]
  )

  const deleteSelected = useCallback(() => {
    if (selectedNodeId) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId))
      setEdges((eds) =>
        eds.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId)
      )
      setSelectedNodeId(null)
    } else if (selectedEdgeId) {
      setEdges((eds) => eds.filter((e) => e.id !== selectedEdgeId))
      setSelectedEdgeId(null)
    }
  }, [selectedNodeId, selectedEdgeId, setNodes, setEdges])

  const exportWorkflow = () => {
    const def: WorkflowDefinition = {
      id: `wf-${Date.now()}`,
      name: workflowName,
      version: '2.0',
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
        conditionCode: (e.data as any)?.conditionCode,
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
          const { nodes: ns, edges: es } = defToRF(def)
          setWorkflowName(def.name)
          setNodes(ns)
          setEdges(es)
        } catch {
          alert('Invalid workflow JSON file.')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const runWorkflow = async () => {
    setRunning(true)
    setExecSteps([])
    setExecResult(null)

    const def: WorkflowDefinition = {
      id: `wf-${Date.now()}`,
      name: workflowName,
      version: '2.0',
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
        conditionCode: (e.data as any)?.conditionCode,
      })),
    }

    try {
      const { executeWorkflowClient } = await import('@/lib/workflow-engine')
      const result = await executeWorkflowClient(def, inputValue, (step) => {
        setExecSteps((prev) => {
          const idx = prev.findIndex((s) => s.nodeId === step.nodeId)
          if (idx >= 0) {
            const c = [...prev]
            c[idx] = step
            return c
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

  const hasSelection = selectedNodeId !== null || selectedEdgeId !== null

  const panelEdge: WorkflowEdge | null = selectedEdge
    ? {
        id: selectedEdge.id,
        source: selectedEdge.source,
        target: selectedEdge.target,
        sourceHandle: selectedEdge.sourceHandle ?? undefined,
        label: typeof selectedEdge.label === 'string' ? selectedEdge.label : undefined,
        conditionCode: (selectedEdge.data as any)?.conditionCode,
      }
    : null

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] min-h-[600px]">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-card shrink-0 flex-wrap gap-y-2">
        <input
          type="text"
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          className="input-base text-sm font-semibold w-44 py-1.5"
        />
        <div className="flex-1" />
        <button
          onClick={importWorkflow}
          className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1.5"
        >
          <Upload size={12} /> Import
        </button>
        <button
          onClick={exportWorkflow}
          className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1.5"
        >
          <Download size={12} /> Export
        </button>
        {hasSelection && (
          <button
            onClick={deleteSelected}
            className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1.5 text-red-500 hover:text-red-600"
          >
            <Trash2 size={12} /> Delete
          </button>
        )}
        <button
          onClick={runWorkflow}
          disabled={running}
          className="btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1.5"
        >
          {running ? (
            <>
              <Loader2 size={12} className="animate-spin" /> Running…
            </>
          ) : (
            <>
              <Play size={12} /> Run
            </>
          )}
        </button>
      </div>

      {/* Input area */}
      <div className="border-b border-border bg-secondary/20 shrink-0">
        <div className="flex items-center gap-3 px-4 py-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">
            Input
          </label>
          <div className="flex-1" />
          <button
            onClick={() => setInputExpanded((v) => !v)}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            {inputExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            {inputExpanded ? 'collapse' : 'expand'}
          </button>
        </div>
        {inputExpanded ? (
          <div className="px-4 pb-2.5">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Multi-line text input passed to the Start node…"
              rows={4}
              className="input-base text-xs w-full resize-y font-mono"
            />
          </div>
        ) : (
          <div className="px-4 pb-1.5">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Text input passed to the Start node… (expand for multi-line)"
              className="input-base text-xs w-full py-1"
            />
          </div>
        )}
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        <WorkflowSidebar onAddNode={addNode} onLoadTemplate={loadTemplate} />

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
            edgeTypes={EDGE_TYPES}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            onInit={setRfInstance}
            fitView
            fitViewOptions={{ padding: 0.25 }}
            deleteKeyCode="Delete"
            className="bg-background"
            defaultEdgeOptions={{ type: 'workflow' }}
            proOptions={{ hideAttribution: false }}
          >
            <Background
              color="var(--color-border, #e2e8f0)"
              gap={28}
              size={1}
              style={{ opacity: 0.4 }}
            />
            <Controls className="!bg-card !border-border !shadow-lg !rounded-2xl overflow-hidden" />
            <MiniMap
              className="!bg-card !border !border-border !rounded-2xl shadow-lg"
              nodeColor={(n) => MINIMAP_COLORS[n.type as string] ?? '#94a3b8'}
              maskColor="rgba(0,0,0,0.06)"
            />
          </ReactFlow>

          {/* Empty state */}
          {nodes.length <= 2 && edges.length <= 1 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center space-y-1.5">
                <p className="text-sm font-medium text-muted-foreground">
                  Start building your LangGraph workflow
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Drag nodes or templates from the left panel · click an edge to add a condition
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Config panel */}
        {(selectedNode || panelEdge) && (
          <NodeConfigPanel
            node={
              selectedNode
                ? ({
                    ...selectedNode,
                    data: selectedNode.data as unknown as NodeData,
                  } as WorkflowNode)
                : null
            }
            selectedEdge={panelEdge}
            onUpdateNode={updateNodeData}
            onUpdateEdge={updateEdgeData}
            onClose={() => {
              setSelectedNodeId(null)
              setSelectedEdgeId(null)
            }}
          />
        )}
      </div>

      <WorkflowExecutionPanel running={running} result={execResult} steps={execSteps} />
    </div>
  )
}
