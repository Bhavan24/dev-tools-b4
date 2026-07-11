import type {
  WorkflowDefinition,
  WorkflowNode,
  WorkflowEdge,
  ExecutionStep,
  ExecutionResult,
} from './workflow-types'
import type { AIConfig } from './ai-client'

type ProgressCallback = (step: ExecutionStep) => void

// Interpolate {{varName}} in a template string using the variable map
function interpolate(template: string, vars: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = vars[key]
    if (val === undefined) return `{{${key}}}`
    return typeof val === 'string' ? val : JSON.stringify(val)
  })
}

function topologicalSort(nodes: WorkflowNode[], edges: WorkflowEdge[]): WorkflowNode[] {
  const inDegree: Map<string, number> = new Map()
  const adj: Map<string, string[]> = new Map()

  for (const n of nodes) {
    inDegree.set(n.id, 0)
    adj.set(n.id, [])
  }

  for (const e of edges) {
    adj.get(e.source)?.push(e.target)
    inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1)
  }

  const queue: string[] = []
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id)
  }

  const sorted: WorkflowNode[] = []
  while (queue.length > 0) {
    const id = queue.shift()!
    const node = nodes.find((n) => n.id === id)
    if (node) sorted.push(node)
    for (const next of adj.get(id) ?? []) {
      const deg = (inDegree.get(next) ?? 1) - 1
      inDegree.set(next, deg)
      if (deg === 0) queue.push(next)
    }
  }

  return sorted
}

async function executeLLMNode(
  data: Extract<WorkflowDefinition['nodes'][number]['data'], { type: 'llm-call' }>,
  vars: Record<string, any>,
  aiConfig: AIConfig
): Promise<any> {
  const userPrompt = interpolate(data.userPromptTemplate, vars)
  const body: Record<string, any> = {
    message: userPrompt,
    systemPrompt: data.systemPrompt,
    provider: aiConfig.provider,
    modelId: data.modelOverride || aiConfig.modelId,
    ...(aiConfig.credentials as Record<string, any>),
    streaming: false,
  }

  const res = await fetch('/api/tools/ai/ai-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'LLM call failed')
  return json.result?.result ?? json.result ?? ''
}

async function executeToolCallNode(
  data: Extract<WorkflowDefinition['nodes'][number]['data'], { type: 'tool-call' }>,
  vars: Record<string, any>
): Promise<any> {
  if (!data.toolId) throw new Error('Tool ID is required for tool-call node')

  const inputBody: Record<string, any> = {}
  for (const [param, varName] of Object.entries(data.inputMapping)) {
    inputBody[param] = vars[varName] ?? vars['input'] ?? ''
  }

  const res = await fetch(`/api/tools/${data.toolId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inputBody),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Tool call failed')
  return json.result
}

// Transform and JS-conditional nodes execute user-authored code.
// This is only permitted client-side (browser sandbox, user controls their own workflow).
// Server-side execution (MCP handler) must pass allowUnsafeNodes: false to reject these.
async function executeTransformNode(
  data: Extract<WorkflowDefinition['nodes'][number]['data'], { type: 'transform' }>,
  vars: Record<string, any>,
  allowUnsafeNodes: boolean
): Promise<any> {
  if (!allowUnsafeNodes) {
    throw new Error('Transform nodes with custom code are disabled in MCP/server-side execution.')
  }
  try {
    // User is the author of `data.code` — this is an intentional client-side code sandbox.
    // eslint-disable-next-line no-new-func
    const fn = new Function('input', `"use strict"; ${data.code}`)
    return fn(vars)
  } catch (err: any) {
    throw new Error(`Transform error: ${err.message}`)
  }
}

async function executeConditionalNode(
  data: Extract<WorkflowDefinition['nodes'][number]['data'], { type: 'conditional' }>,
  vars: Record<string, any>,
  aiConfig: AIConfig,
  allowUnsafeNodes: boolean
): Promise<boolean> {
  if (data.mode === 'js') {
    if (!allowUnsafeNodes) {
      throw new Error(
        'JS-mode conditional nodes are disabled in MCP/server-side execution. Use "llm" mode instead.'
      )
    }
    try {
      const input = vars[data.inputVariable] ?? vars['input']
      // User is the author of `data.condition` — intentional client-side code sandbox.
      // eslint-disable-next-line no-new-func
      const fn = new Function('input', `"use strict"; return !!(${data.condition})`)
      return fn(input)
    } catch (err: any) {
      throw new Error(`Condition eval error: ${err.message}`)
    }
  }

  // LLM-based decision
  const userPrompt = `Given this context: ${JSON.stringify(vars)}\n\nEvaluate if this condition is true or false: "${data.condition}"\nRespond with only "true" or "false".`
  const body = {
    message: userPrompt,
    provider: aiConfig.provider,
    modelId: aiConfig.modelId,
    ...(aiConfig.credentials as Record<string, any>),
    streaming: false,
  }
  const res = await fetch('/api/tools/ai/ai-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  const answer = (json.result?.result ?? json.result ?? '').toLowerCase().trim()
  return answer.startsWith('true')
}

export class WorkflowEngine {
  private workflow: WorkflowDefinition
  private variables: Record<string, any>
  private aiConfig: AIConfig
  private onProgress: ProgressCallback
  private steps: ExecutionStep[]
  // true only in browser/client context where the user authored the workflow themselves
  private allowUnsafeNodes: boolean

  constructor(
    workflow: WorkflowDefinition,
    aiConfig: AIConfig,
    onProgress: ProgressCallback = () => {},
    allowUnsafeNodes = false
  ) {
    this.workflow = workflow
    this.variables = {}
    this.aiConfig = aiConfig
    this.onProgress = onProgress
    this.steps = []
    this.allowUnsafeNodes = allowUnsafeNodes
  }

  private emitStep(step: ExecutionStep) {
    this.steps.push(step)
    this.onProgress(step)
  }

  private outgoingEdges(nodeId: string): WorkflowEdge[] {
    return this.workflow.edges.filter((e) => e.source === nodeId)
  }

  async execute(input: any): Promise<ExecutionResult> {
    this.variables['input'] = input
    this.steps = []

    const sorted = topologicalSort(this.workflow.nodes, this.workflow.edges)
    const skipNodes = new Set<string>()

    for (const node of sorted) {
      if (skipNodes.has(node.id)) continue

      const step: ExecutionStep = {
        nodeId: node.id,
        nodeLabel: node.data.label,
        status: 'running',
      }
      this.emitStep({ ...step })

      try {
        const d = node.data

        if (d.type === 'input') {
          // Already set
          step.output = input
        } else if (d.type === 'output') {
          const raw = this.variables['input']
          step.output = d.format === 'json' ? JSON.stringify(raw, null, 2) : String(raw ?? '')
          this.variables['output'] = step.output
        } else if (d.type === 'llm-call') {
          const result = await executeLLMNode(d, this.variables, this.aiConfig)
          this.variables[d.outputVariable] = result
          this.variables['input'] = result
          step.output = result
        } else if (d.type === 'tool-call') {
          const result = await executeToolCallNode(d, this.variables)
          this.variables[d.outputVariable] = result
          this.variables['input'] = result
          step.output = result
        } else if (d.type === 'transform') {
          const result = await executeTransformNode(d, this.variables, this.allowUnsafeNodes)
          this.variables[d.outputVariable] = result
          this.variables['input'] = result
          step.output = result
        } else if (d.type === 'conditional') {
          const result = await executeConditionalNode(
            d,
            this.variables,
            this.aiConfig,
            this.allowUnsafeNodes
          )
          step.output = result
          // Skip nodes on the branch that was NOT taken
          const edges = this.outgoingEdges(node.id)
          for (const edge of edges) {
            if (edge.sourceHandle === 'true' && !result) skipNodes.add(edge.target)
            if (edge.sourceHandle === 'false' && result) skipNodes.add(edge.target)
          }
        } else if (d.type === 'loop') {
          const items = this.variables[d.iterateOver]
          if (Array.isArray(items)) {
            const results: any[] = []
            const limit = Math.min(items.length, d.maxIterations)
            for (let i = 0; i < limit; i++) {
              this.variables[d.itemVariable] = items[i]
              this.variables['input'] = items[i]
              results.push(items[i])
            }
            step.output = results
          }
        } else if (d.type === 'merge') {
          const edges = this.workflow.edges.filter((e) => e.target === node.id)
          const values = edges.map((e) => {
            const src = this.workflow.nodes.find((n) => n.id === e.source)
            if (!src) return undefined
            const srcData = src.data as any
            return this.variables[srcData.outputVariable ?? 'input']
          })
          let merged: any
          if (d.strategy === 'concat') {
            merged = values.flat()
          } else if (d.strategy === 'first') {
            merged = values[0]
          } else {
            merged = Object.fromEntries(edges.map((e, i) => [e.source, values[i]]))
          }
          this.variables[d.outputVariable] = merged
          this.variables['input'] = merged
          step.output = merged
        }

        step.status = 'done'
        this.emitStep({ ...step })
      } catch (err: any) {
        step.status = 'error'
        step.error = err.message
        this.emitStep({ ...step })
        return {
          success: false,
          output: null,
          steps: this.steps,
          error: `Node "${node.data.label}" failed: ${err.message}`,
        }
      }
    }

    return {
      success: true,
      output: this.variables['output'] ?? this.variables['input'],
      steps: this.steps,
    }
  }
}

// Server-side execution (MCP handler) - unsafe nodes disabled
export async function executeWorkflow(
  workflow: WorkflowDefinition,
  input: any,
  aiConfig: AIConfig
): Promise<ExecutionResult> {
  const engine = new WorkflowEngine(workflow, aiConfig, undefined, false)
  return engine.execute(input)
}

// Client-side execution - user authored the workflow, unsafe nodes permitted
export async function executeWorkflowClient(
  workflow: WorkflowDefinition,
  input: any,
  aiConfig: AIConfig,
  onProgress?: ProgressCallback
): Promise<ExecutionResult> {
  const engine = new WorkflowEngine(workflow, aiConfig, onProgress, true)
  return engine.execute(input)
}
