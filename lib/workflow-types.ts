// ---- Node data shapes ----

export interface InputNodeData {
  type: 'input'
  label: string
  description?: string
}

export interface OutputNodeData {
  type: 'output'
  label: string
  format: 'text' | 'json'
}

export interface LLMCallNodeData {
  type: 'llm-call'
  label: string
  systemPrompt: string
  userPromptTemplate: string
  outputVariable: string
  // Per-node model override (empty = use global provider config)
  modelOverride?: string
}

export interface ConditionalNodeData {
  type: 'conditional'
  label: string
  // 'js' evaluates a JS expression; 'llm' asks the LLM to decide true/false
  mode: 'js' | 'llm'
  condition: string
  inputVariable: string
}

export interface LoopNodeData {
  type: 'loop'
  label: string
  iterateOver: string
  itemVariable: string
  maxIterations: number
}

export interface ToolCallNodeData {
  type: 'tool-call'
  label: string
  toolId: string
  inputMapping: Record<string, string>
  outputVariable: string
}

export interface TransformNodeData {
  type: 'transform'
  label: string
  // JS function body: receives `input` (current workflow variables), returns any
  code: string
  outputVariable: string
}

export interface MergeNodeData {
  type: 'merge'
  label: string
  strategy: 'concat' | 'object' | 'first'
  outputVariable: string
}

export type NodeData =
  | InputNodeData
  | OutputNodeData
  | LLMCallNodeData
  | ConditionalNodeData
  | LoopNodeData
  | ToolCallNodeData
  | TransformNodeData
  | MergeNodeData

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
  // Used for conditional nodes: 'true' | 'false'
  sourceHandle?: string
  label?: string
}

export interface WorkflowDefinition {
  id: string
  name: string
  version: '1.0'
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

// ---- Node palette metadata (for sidebar display) ----

export interface NodePaletteItem {
  type: NodeType
  label: string
  description: string
  icon: string
  category: 'ai' | 'logic' | 'io' | 'data'
  color: string
  defaultData: Record<string, any>
}

export const NODE_PALETTE: NodePaletteItem[] = [
  {
    type: 'input',
    label: 'Input',
    description: 'Entry point - receives initial data',
    icon: 'Play',
    category: 'io',
    color: 'bg-green-500',
    defaultData: { label: 'Input', description: '' },
  },
  {
    type: 'output',
    label: 'Output',
    description: 'Terminal node - emits final result',
    icon: 'Flag',
    category: 'io',
    color: 'bg-blue-500',
    defaultData: { label: 'Output', format: 'text' },
  },
  {
    type: 'llm-call',
    label: 'LLM Call',
    description: 'Invoke an AI model with a prompt',
    icon: 'Sparkles',
    category: 'ai',
    color: 'bg-purple-500',
    defaultData: {
      label: 'LLM Call',
      systemPrompt: 'You are a helpful assistant.',
      userPromptTemplate: '{{input}}',
      outputVariable: 'llmOutput',
    },
  },
  {
    type: 'conditional',
    label: 'Conditional',
    description: 'Route flow based on true/false condition',
    icon: 'GitBranch',
    category: 'logic',
    color: 'bg-amber-500',
    defaultData: {
      label: 'Condition',
      mode: 'js',
      condition: 'input.length > 0',
      inputVariable: 'input',
    },
  },
  {
    type: 'loop',
    label: 'Loop',
    description: 'Iterate over an array of items',
    icon: 'RefreshCw',
    category: 'logic',
    color: 'bg-orange-500',
    defaultData: {
      label: 'Loop',
      iterateOver: 'items',
      itemVariable: 'item',
      maxIterations: 10,
    },
  },
  {
    type: 'tool-call',
    label: 'Tool Call',
    description: 'Call any built-in developer tool',
    icon: 'Wrench',
    category: 'ai',
    color: 'bg-cyan-500',
    defaultData: {
      label: 'Tool Call',
      toolId: '',
      inputMapping: {},
      outputVariable: 'toolOutput',
    },
  },
  {
    type: 'transform',
    label: 'Transform',
    description: 'Transform data with JavaScript',
    icon: 'Code2',
    category: 'data',
    color: 'bg-gray-500',
    defaultData: {
      label: 'Transform',
      code: 'return input',
      outputVariable: 'transformed',
    },
  },
  {
    type: 'merge',
    label: 'Merge',
    description: 'Combine outputs from parallel branches',
    icon: 'Merge',
    category: 'logic',
    color: 'bg-teal-500',
    defaultData: {
      label: 'Merge',
      strategy: 'object',
      outputVariable: 'merged',
    },
  },
]

export const PALETTE_CATEGORY_LABELS: Record<string, string> = {
  io: 'Input / Output',
  ai: 'AI & Tools',
  logic: 'Logic & Flow',
  data: 'Data',
}
