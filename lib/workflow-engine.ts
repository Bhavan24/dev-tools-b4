import type {
  WorkflowDefinition,
  WorkflowNode,
  WorkflowEdge,
  ExecutionStep,
  ExecutionResult,
  AgentNodeData,
  ToolNodeData,
} from './workflow-types'

type ProgressCallback = (step: ExecutionStep) => void

// Interpolate {{varName}} in a template string
function interpolate(template: string, vars: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = vars[key]
    if (val === undefined) return `{{${key}}}`
    return typeof val === 'string' ? val : JSON.stringify(val)
  })
}

// Simple topological sort (Kahn's algorithm)
function topologicalSort(nodes: WorkflowNode[], edges: WorkflowEdge[]): WorkflowNode[] {
  const inDegree = new Map<string, number>()
  const adj = new Map<string, string[]>()

  for (const n of nodes) {
    inDegree.set(n.id, 0)
    adj.set(n.id, [])
  }
  for (const e of edges) {
    adj.get(e.source)?.push(e.target)
    inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1)
  }

  const queue = [...inDegree.entries()].filter(([, d]) => d === 0).map(([id]) => id)
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

// Evaluate an edge condition (TypeScript/JS code)
function evalCondition(code: string, state: Record<string, any>, allowUnsafe: boolean): boolean {
  if (!allowUnsafe) {
    throw new Error('Conditional edges with code are disabled in server-side execution.')
  }
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function('state', `"use strict"; ${code}`)
    return !!fn(state)
  } catch (err: any) {
    throw new Error(`Edge condition error: ${err.message}`)
  }
}

// ---- Agent node execution ----

async function executeAgentNode(data: AgentNodeData, vars: Record<string, any>): Promise<any> {
  if (!data.provider) throw new Error(`Agent "${data.label}" has no provider configured`)
  if (!data.modelId) throw new Error(`Agent "${data.label}" has no model configured`)

  const userPrompt = interpolate(data.userPromptTemplate, vars)

  const body: Record<string, any> = {
    message: userPrompt,
    systemPrompt: data.systemPrompt,
    provider: data.provider,
    modelId: data.modelId,
    ...data.credentials,
    streaming: false,
  }

  if (data.outputSchema) {
    try {
      body.outputSchema = JSON.parse(data.outputSchema)
    } catch {
      // ignore malformed schema
    }
  }

  const res = await fetch('/api/tools/ai/ai-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Agent call failed')
  return json.result?.result ?? json.result ?? ''
}

// ---- Tool node execution ----

async function executeToolNode(
  data: ToolNodeData,
  vars: Record<string, any>,
  allowUnsafe: boolean
): Promise<any> {
  const { toolKind } = data

  if (toolKind === 'api') {
    const url = interpolate(data.apiUrl ?? '', vars)
    if (!url) throw new Error('REST API tool requires a URL')

    const rawHeaders = data.apiHeaders ?? '{}'
    let headers: Record<string, string> = {}
    try {
      headers = JSON.parse(interpolate(rawHeaders, vars))
    } catch {
      throw new Error('API Headers must be valid JSON')
    }

    const method = data.apiMethod ?? 'GET'
    const reqInit: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
    }

    if (method !== 'GET' && data.apiBodyTemplate) {
      reqInit.body = interpolate(data.apiBodyTemplate, vars)
    }

    const res = await fetch(url, reqInit)
    const text = await res.text()
    if (!res.ok) throw new Error(`API ${method} ${url} → ${res.status}: ${text}`)
    try {
      return JSON.parse(text)
    } catch {
      return text
    }
  }

  if (toolKind === 'mcp') {
    const serverUrl = data.mcpServerUrl
    if (!serverUrl) throw new Error('MCP tool requires a server URL')

    const rawArgs = data.mcpArgumentsTemplate ?? '{}'
    let args: Record<string, any> = {}
    try {
      args = JSON.parse(interpolate(rawArgs, vars))
    } catch {
      throw new Error('MCP arguments must be valid JSON')
    }

    const res = await fetch(serverUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'tools/call',
        name: data.mcpToolName ?? '',
        arguments: args,
      }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'MCP call failed')
    return json.result
  }

  if (toolKind === 'devtool') {
    if (!data.devToolId) throw new Error('Dev tool requires a tool ID')

    let inputMapping: Record<string, string> = {}
    try {
      inputMapping = JSON.parse(data.devToolInputMapping ?? '{}')
    } catch {
      throw new Error('Dev tool input mapping must be valid JSON')
    }

    const body: Record<string, any> = {}
    for (const [param, varName] of Object.entries(inputMapping)) {
      body[param] = vars[varName] ?? vars['input'] ?? ''
    }
    if (Object.keys(body).length === 0) {
      body['input'] = vars['input'] ?? ''
    }

    const res = await fetch(`/api/tools/${data.devToolId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Dev tool call failed')
    return json.result
  }

  if (toolKind === 'function') {
    if (!allowUnsafe) {
      throw new Error('Custom function tools are disabled in server-side execution.')
    }
    if (!data.functionCode) throw new Error('Custom function tool requires code')
    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function('state', `"use strict"; ${data.functionCode}`)
      return fn(vars)
    } catch (err: any) {
      throw new Error(`Function tool error: ${err.message}`)
    }
  }

  throw new Error(`Unknown tool kind: ${toolKind}`)
}

// ---- Engine ----

export class WorkflowEngine {
  private workflow: WorkflowDefinition
  private state: Record<string, any>
  private onProgress: ProgressCallback
  private steps: ExecutionStep[]
  private allowUnsafe: boolean

  constructor(
    workflow: WorkflowDefinition,
    onProgress: ProgressCallback = () => {},
    allowUnsafe = false
  ) {
    this.workflow = workflow
    this.state = {}
    this.onProgress = onProgress
    this.steps = []
    this.allowUnsafe = allowUnsafe
  }

  private emit(step: ExecutionStep) {
    const idx = this.steps.findIndex((s) => s.nodeId === step.nodeId)
    if (idx >= 0) this.steps[idx] = step
    else this.steps.push(step)
    this.onProgress({ ...step })
  }

  private outgoing(nodeId: string): WorkflowEdge[] {
    return this.workflow.edges.filter((e) => e.source === nodeId)
  }

  async execute(input: string): Promise<ExecutionResult> {
    this.state = { input }
    this.steps = []

    const sorted = topologicalSort(this.workflow.nodes, this.workflow.edges)
    const skipped = new Set<string>()

    for (const node of sorted) {
      if (skipped.has(node.id)) continue

      const step: ExecutionStep = {
        nodeId: node.id,
        nodeLabel: node.data.label,
        status: 'running',
      }
      this.emit({ ...step })

      try {
        const d = node.data

        if (d.type === 'start') {
          step.output = input
        } else if (d.type === 'end') {
          step.output = this.state['input']
          this.state['output'] = step.output
        } else if (d.type === 'agent') {
          const result = await executeAgentNode(d, this.state)
          this.state[d.outputVariable] = result
          this.state['input'] = result
          step.output = result
        } else if (d.type === 'tool') {
          const result = await executeToolNode(d, this.state, this.allowUnsafe)
          this.state[d.outputVariable] = result
          this.state['input'] = result
          step.output = result
        }

        step.status = 'done'
        this.emit({ ...step })

        // Evaluate outgoing conditional edges
        const outEdges = this.outgoing(node.id)
        const hasConditions = outEdges.some((e) => e.conditionCode)
        if (hasConditions) {
          for (const edge of outEdges) {
            if (!edge.conditionCode) continue
            const pass = evalCondition(edge.conditionCode, this.state, this.allowUnsafe)
            if (!pass) {
              // Mark target and all reachable nodes from it as skipped
              this.markSkipped(edge.target, skipped)
            }
          }
        }
      } catch (err: any) {
        step.status = 'error'
        step.error = err.message
        this.emit({ ...step })
        return {
          success: false,
          output: null,
          steps: [...this.steps],
          error: `Node "${node.data.label}" failed: ${err.message}`,
        }
      }
    }

    return {
      success: true,
      output: this.state['output'] ?? this.state['input'],
      steps: [...this.steps],
    }
  }

  private markSkipped(nodeId: string, skipped: Set<string>) {
    if (skipped.has(nodeId)) return
    skipped.add(nodeId)
    for (const edge of this.outgoing(nodeId)) {
      this.markSkipped(edge.target, skipped)
    }
  }
}

export async function executeWorkflow(
  workflow: WorkflowDefinition,
  input: string
): Promise<ExecutionResult> {
  const engine = new WorkflowEngine(workflow, undefined, false)
  return engine.execute(input)
}

export async function executeWorkflowClient(
  workflow: WorkflowDefinition,
  input: string,
  onProgress?: ProgressCallback
): Promise<ExecutionResult> {
  const engine = new WorkflowEngine(workflow, onProgress, true)
  return engine.execute(input)
}
