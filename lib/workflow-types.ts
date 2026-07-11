// ---- Node data shapes ----

export interface StartNodeData {
  type: 'start'
  label: string
  description?: string
}

export interface EndNodeData {
  type: 'end'
  label: string
}

export interface AgentNodeData {
  type: 'agent'
  label: string
  // Per-agent AI provider config
  provider: string
  modelId: string
  // Credential fields keyed by provider field key (e.g. apiKey, region, etc.)
  credentials: Record<string, string>
  // Prompts
  systemPrompt: string
  userPromptTemplate: string
  // Optional JSON Schema for structured output (stored as JSON string)
  outputSchema?: string
  outputVariable: string
}

export type ToolKind = 'api' | 'mcp' | 'devtool' | 'function'

export interface ToolNodeData {
  type: 'tool'
  label: string
  toolKind: ToolKind
  outputVariable: string
  // REST API
  apiUrl?: string
  apiMethod?: string
  apiHeaders?: string
  apiBodyTemplate?: string
  // MCP server
  mcpServerUrl?: string
  mcpToolName?: string
  mcpArgumentsTemplate?: string
  // Built-in devtool
  devToolId?: string
  devToolInputMapping?: string
  // Custom JS/TS function (client-side only)
  functionCode?: string
}

export type NodeData = StartNodeData | EndNodeData | AgentNodeData | ToolNodeData
export type NodeType = NodeData['type']

export interface WorkflowNode {
  id: string
  type: NodeType
  position: { x: number; y: number }
  data: NodeData
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  // Optional TypeScript/JS code: receives `state`, returns boolean
  conditionCode?: string
  label?: string
}

export interface WorkflowDefinition {
  id: string
  name: string
  version: '2.0'
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}

// ---- Execution types ----

export interface ExecutionStep {
  nodeId: string
  nodeLabel: string
  status: 'pending' | 'running' | 'done' | 'error'
  output?: any
  error?: string
}

export interface ExecutionResult {
  success: boolean
  output: any
  steps: ExecutionStep[]
  error?: string
}

// ---- Palette ----

export interface NodePaletteItem {
  type: NodeType
  label: string
  description: string
  category: 'flow' | 'ai' | 'tools'
  accentColor: string
  defaultData: Record<string, any>
}

export const NODE_PALETTE: NodePaletteItem[] = [
  {
    type: 'start',
    label: 'Start',
    description: 'Entry point of the graph (LangGraph START)',
    category: 'flow',
    accentColor: 'emerald',
    defaultData: { label: 'Start', description: '' },
  },
  {
    type: 'end',
    label: 'End',
    description: 'Terminal node of the graph (LangGraph END)',
    category: 'flow',
    accentColor: 'slate',
    defaultData: { label: 'End' },
  },
  {
    type: 'agent',
    label: 'Agent',
    description: 'AI agent with provider config, prompts, and optional structured output',
    category: 'ai',
    accentColor: 'violet',
    defaultData: {
      label: 'Agent',
      provider: '',
      modelId: '',
      credentials: {},
      systemPrompt: 'You are a helpful assistant.',
      userPromptTemplate: '{{input}}',
      outputSchema: '',
      outputVariable: 'agentOutput',
    },
  },
  {
    type: 'tool',
    label: 'Tool',
    description: 'Invoke an API, MCP server, built-in devtool, or custom function',
    category: 'tools',
    accentColor: 'sky',
    defaultData: {
      label: 'Tool',
      toolKind: 'api' as ToolKind,
      outputVariable: 'toolOutput',
      apiUrl: '',
      apiMethod: 'GET',
      apiHeaders: '{}',
      apiBodyTemplate: '',
    },
  },
]

export const PALETTE_CATEGORY_LABELS: Record<string, string> = {
  flow: 'Flow Control',
  ai: 'AI',
  tools: 'Tools',
}
