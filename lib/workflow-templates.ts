import type {
  WorkflowNode,
  WorkflowEdge,
  AgentNodeData,
  ToolNodeData,
  StartNodeData,
  EndNodeData,
} from './workflow-types'

// ---- Template type ----

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: 'basic' | 'routing' | 'multi-agent' | 'tools' | 'advanced'
  tags: string[]
  definition: {
    name: string
    nodes: WorkflowNode[]
    edges: WorkflowEdge[]
  }
}

// ---- Helpers ----

function startNode(id: string, x: number, y: number, label = 'Start'): WorkflowNode {
  return {
    id,
    type: 'start',
    position: { x, y },
    data: { type: 'start', label } satisfies StartNodeData,
  }
}

function endNode(id: string, x: number, y: number, label = 'End'): WorkflowNode {
  return {
    id,
    type: 'end',
    position: { x, y },
    data: { type: 'end', label } satisfies EndNodeData,
  }
}

function agentNode(
  id: string,
  x: number,
  y: number,
  data: Omit<AgentNodeData, 'type'>
): WorkflowNode {
  return {
    id,
    type: 'agent',
    position: { x, y },
    data: { type: 'agent', ...data } satisfies AgentNodeData,
  }
}

function toolNode(
  id: string,
  x: number,
  y: number,
  data: Omit<ToolNodeData, 'type'>
): WorkflowNode {
  return {
    id,
    type: 'tool',
    position: { x, y },
    data: { type: 'tool', ...data } satisfies ToolNodeData,
  }
}

function edge(
  source: string,
  target: string,
  opts?: { conditionCode?: string; label?: string; sourceHandle?: string }
): WorkflowEdge {
  return {
    id: `e-${source}-${target}`,
    source,
    target,
    ...(opts?.sourceHandle ? { sourceHandle: opts.sourceHandle } : {}),
    ...(opts?.conditionCode ? { conditionCode: opts.conditionCode } : {}),
    ...(opts?.label ? { label: opts.label } : {}),
  }
}

const AGENT_DEFAULTS = {
  provider: '',
  modelId: '',
  credentials: {},
} as const

// ---- Templates ----

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  // 1. Simple Chain
  {
    id: 'simple-chain',
    name: 'Simple LLM Chain',
    description:
      'The most basic LangGraph pattern: a single AI agent node sandwiched between Start and End. Good starting point for any linear task.',
    category: 'basic',
    tags: ['beginner', 'single-agent', 'linear'],
    definition: {
      name: 'Simple LLM Chain',
      nodes: [
        startNode('start', 80, 150),
        agentNode('agent', 360, 150, {
          ...AGENT_DEFAULTS,
          label: 'LLM Agent',
          systemPrompt: 'You are a helpful assistant.',
          userPromptTemplate: '{{input}}',
          outputVariable: 'result',
        }),
        endNode('end', 640, 150),
      ],
      edges: [edge('start', 'agent'), edge('agent', 'end')],
    },
  },

  // 2. Conditional Routing
  {
    id: 'conditional-routing',
    name: 'Conditional Routing',
    description:
      'A classifier agent inspects input and routes to different downstream handlers based on the result — the LangGraph conditional-edge pattern.',
    category: 'routing',
    tags: ['routing', 'conditional', 'branching', 'sentiment'],
    definition: {
      name: 'Conditional Routing',
      nodes: [
        startNode('start', 80, 200),
        agentNode('classifier', 320, 200, {
          ...AGENT_DEFAULTS,
          label: 'Classifier',
          systemPrompt: "Classify the input as 'positive' or 'negative'. Return only the word.",
          userPromptTemplate: '{{input}}',
          outputVariable: 'classification',
        }),
        endNode('end-positive', 620, 80, 'End (Positive)'),
        agentNode('negative-handler', 580, 320, {
          ...AGENT_DEFAULTS,
          label: 'Negative Handler',
          systemPrompt: 'Handle negative sentiment. Be empathetic.',
          userPromptTemplate: 'The user said: {{input}}\n\nRespond with empathy.',
          outputVariable: 'negativeResponse',
        }),
        endNode('end', 840, 200),
      ],
      edges: [
        edge('start', 'classifier'),
        edge('classifier', 'end-positive', {
          conditionCode:
            "return state.classification && state.classification.toLowerCase().includes('positive')",
          label: 'positive',
        }),
        edge('classifier', 'negative-handler', {
          conditionCode:
            "return !state.classification || state.classification.toLowerCase().includes('negative')",
          label: 'negative',
        }),
        edge('negative-handler', 'end'),
      ],
    },
  },

  // 3. Tool Use
  {
    id: 'tool-use',
    name: 'Tool + Agent (API Enrichment)',
    description:
      'Fetch external data with a REST API tool node, then pass the raw payload to an agent that synthesizes and explains it.',
    category: 'tools',
    tags: ['tool-call', 'api', 'enrichment', 'summarization'],
    definition: {
      name: 'Tool + Agent (API Enrichment)',
      nodes: [
        startNode('start', 80, 150),
        toolNode('fetch-data', 340, 150, {
          label: 'Fetch Data',
          toolKind: 'api',
          apiUrl: 'https://api.example.com/search',
          apiMethod: 'GET',
          outputVariable: 'rawData',
        }),
        agentNode('synthesizer', 620, 150, {
          ...AGENT_DEFAULTS,
          label: 'Synthesizer',
          systemPrompt: 'Summarize and explain the fetched data.',
          userPromptTemplate: 'Data: {{rawData}}\n\nOriginal query: {{input}}',
          outputVariable: 'summary',
        }),
        endNode('end', 880, 150),
      ],
      edges: [
        edge('start', 'fetch-data'),
        edge('fetch-data', 'synthesizer'),
        edge('synthesizer', 'end'),
      ],
    },
  },

  // 4. Multi-Agent Pipeline
  {
    id: 'multi-agent-pipeline',
    name: 'Multi-Agent Pipeline',
    description:
      'Three specialized agents (Researcher, Writer, Editor) run in sequence — each consuming the previous output — to produce a polished final article.',
    category: 'multi-agent',
    tags: ['pipeline', 'sequential', 'research', 'writing'],
    definition: {
      name: 'Multi-Agent Pipeline',
      nodes: [
        startNode('start', 80, 200),
        agentNode('researcher', 300, 200, {
          ...AGENT_DEFAULTS,
          label: 'Researcher',
          systemPrompt: 'Research the given topic thoroughly.',
          userPromptTemplate: '{{input}}',
          outputVariable: 'research',
        }),
        agentNode('writer', 540, 200, {
          ...AGENT_DEFAULTS,
          label: 'Writer',
          systemPrompt: 'Write a clear article based on the research.',
          userPromptTemplate: 'Research:\n{{research}}\n\nTopic: {{input}}',
          outputVariable: 'draft',
        }),
        agentNode('editor', 780, 200, {
          ...AGENT_DEFAULTS,
          label: 'Editor',
          systemPrompt: 'Edit and improve the draft for clarity and style.',
          userPromptTemplate: 'Draft:\n{{draft}}',
          outputVariable: 'finalArticle',
        }),
        endNode('end', 1020, 200),
      ],
      edges: [
        edge('start', 'researcher'),
        edge('researcher', 'writer'),
        edge('writer', 'editor'),
        edge('editor', 'end'),
      ],
    },
  },

  // 5. Reflection Loop
  {
    id: 'reflection-loop',
    name: 'Self-Reflection Loop',
    description:
      'A Drafter produces output, a Critic evaluates it, and if the Critic requests revision the flow loops back through a Refiner — implementing the LangGraph cycle/loop pattern.',
    category: 'advanced',
    tags: ['loop', 'reflection', 'self-critique', 'iterative'],
    definition: {
      name: 'Self-Reflection Loop',
      nodes: [
        startNode('start', 80, 200),
        agentNode('drafter', 320, 200, {
          ...AGENT_DEFAULTS,
          label: 'Drafter',
          systemPrompt: 'Write a first draft.',
          userPromptTemplate: '{{input}}',
          outputVariable: 'draft',
        }),
        agentNode('critic', 560, 200, {
          ...AGENT_DEFAULTS,
          label: 'Critic',
          systemPrompt:
            'Evaluate the draft. If it needs major improvement reply REVISE otherwise reply DONE.',
          userPromptTemplate: 'Draft:\n{{draft}}',
          outputVariable: 'verdict',
        }),
        agentNode('refiner', 800, 200, {
          ...AGENT_DEFAULTS,
          label: 'Refiner',
          systemPrompt: 'Improve the draft based on critique.',
          userPromptTemplate: 'Original draft:\n{{draft}}\nCritique: needs improvement\n\nRewrite:',
          outputVariable: 'draft',
        }),
        endNode('end', 800, 400),
      ],
      edges: [
        edge('start', 'drafter'),
        edge('drafter', 'critic'),
        edge('critic', 'refiner', {
          conditionCode: "return state.verdict && state.verdict.includes('REVISE')",
          label: 'needs revision',
        }),
        edge('critic', 'end', {
          conditionCode: "return state.verdict && state.verdict.includes('DONE')",
          label: 'approved',
        }),
        edge('refiner', 'drafter'),
      ],
    },
  },

  // 6. RAG Pipeline
  {
    id: 'rag-pipeline',
    name: 'RAG Pipeline (Retrieval + Answer)',
    description:
      'Classic Retrieval-Augmented Generation: retrieve relevant chunks from a vector store, then pass them as context to an answer-generation agent.',
    category: 'tools',
    tags: ['rag', 'retrieval', 'vector-search', 'qa'],
    definition: {
      name: 'RAG Pipeline (Retrieval + Answer)',
      nodes: [
        startNode('start', 80, 200),
        toolNode('vector-search', 320, 200, {
          label: 'Vector Search',
          toolKind: 'api',
          apiUrl: 'https://your-vector-db/search',
          apiMethod: 'POST',
          apiBodyTemplate: '{"query":"{{input}}","topK":3}',
          outputVariable: 'context',
        }),
        agentNode('answer-generator', 580, 200, {
          ...AGENT_DEFAULTS,
          label: 'Answer Generator',
          systemPrompt: 'You are a helpful assistant. Answer based on the provided context.',
          userPromptTemplate: 'Context:\n{{context}}\n\nQuestion: {{input}}',
          outputVariable: 'answer',
        }),
        endNode('end', 840, 200),
      ],
      edges: [
        edge('start', 'vector-search'),
        edge('vector-search', 'answer-generator'),
        edge('answer-generator', 'end'),
      ],
    },
  },

  // 7. Parallel Fanout
  {
    id: 'parallel-fanout',
    name: 'Parallel Fanout (Map-Reduce)',
    description:
      'Three analyst agents run in parallel on the same input, and their outputs are merged by a function tool before a final synthesizer produces a unified report.',
    category: 'multi-agent',
    tags: ['parallel', 'fanout', 'map-reduce', 'analysis'],
    definition: {
      name: 'Parallel Fanout (Map-Reduce)',
      nodes: [
        startNode('start', 80, 200),
        agentNode('analyst-a', 320, 80, {
          ...AGENT_DEFAULTS,
          label: 'Analyst A',
          systemPrompt: 'Analyze from a financial perspective.',
          userPromptTemplate: '{{input}}',
          outputVariable: 'analysisA',
        }),
        agentNode('analyst-b', 320, 200, {
          ...AGENT_DEFAULTS,
          label: 'Analyst B',
          systemPrompt: 'Analyze from a technical perspective.',
          userPromptTemplate: '{{input}}',
          outputVariable: 'analysisB',
        }),
        agentNode('analyst-c', 320, 320, {
          ...AGENT_DEFAULTS,
          label: 'Analyst C',
          systemPrompt: 'Analyze from a market perspective.',
          userPromptTemplate: '{{input}}',
          outputVariable: 'analysisC',
        }),
        toolNode('merge', 580, 200, {
          label: 'Merge Results',
          toolKind: 'function',
          functionCode:
            'return `Financial: ${state.analysisA}\\n\\nTechnical: ${state.analysisB}\\n\\nMarket: ${state.analysisC}`',
          outputVariable: 'mergedAnalysis',
        }),
        agentNode('synthesizer', 820, 200, {
          ...AGENT_DEFAULTS,
          label: 'Synthesizer',
          systemPrompt: 'Synthesize all analyses into a unified report.',
          userPromptTemplate: '{{mergedAnalysis}}',
          outputVariable: 'report',
        }),
        endNode('end', 1060, 200),
      ],
      edges: [
        edge('start', 'analyst-a'),
        edge('start', 'analyst-b'),
        edge('start', 'analyst-c'),
        edge('analyst-a', 'merge'),
        edge('analyst-b', 'merge'),
        edge('analyst-c', 'merge'),
        edge('merge', 'synthesizer'),
        edge('synthesizer', 'end'),
      ],
    },
  },

  // 8. Structured Data Extraction
  {
    id: 'data-extraction',
    name: 'Structured Data Extraction',
    description:
      'An agent extracts typed entities from free text using a JSON output schema, then a devtool node beautifies the JSON for display.',
    category: 'tools',
    tags: ['extraction', 'structured-output', 'json-schema', 'nlp'],
    definition: {
      name: 'Structured Data Extraction',
      nodes: [
        startNode('start', 80, 150),
        agentNode('extractor', 320, 150, {
          ...AGENT_DEFAULTS,
          label: 'Extractor',
          systemPrompt: 'Extract structured data from the input. Return JSON only.',
          userPromptTemplate: 'Extract entities from: {{input}}',
          outputVariable: 'extracted',
          outputSchema:
            '{"type":"object","properties":{"entities":{"type":"array","items":{"type":"string"}},"sentiment":{"type":"string","enum":["positive","negative","neutral"]},"summary":{"type":"string"}}}',
        }),
        toolNode('format-json', 580, 150, {
          label: 'Format JSON',
          toolKind: 'devtool',
          devToolId: 'json-beautifier',
          devToolInputMapping: '{"input":"extracted"}',
          outputVariable: 'formattedOutput',
        }),
        endNode('end', 820, 150),
      ],
      edges: [
        edge('start', 'extractor'),
        edge('extractor', 'format-json'),
        edge('format-json', 'end'),
      ],
    },
  },

  // 9. Supervisor Pattern
  {
    id: 'supervisor-pattern',
    name: 'Supervisor Multi-Agent',
    description:
      'A Supervisor agent decides which specialist to invoke (Researcher or Writer) and routes accordingly - the canonical LangGraph supervisor pattern.',
    category: 'multi-agent',
    tags: ['supervisor', 'routing', 'specialist-agents', 'orchestration'],
    definition: {
      name: 'Supervisor Multi-Agent',
      nodes: [
        startNode('start', 80, 200),
        agentNode('supervisor', 320, 200, {
          ...AGENT_DEFAULTS,
          label: 'Supervisor',
          systemPrompt:
            'You are a supervisor. Based on the task, decide: reply RESEARCH if the query needs research, reply WRITE if it needs creative writing.',
          userPromptTemplate: 'Task: {{input}}',
          outputVariable: 'decision',
        }),
        agentNode('researcher', 580, 80, {
          ...AGENT_DEFAULTS,
          label: 'Researcher',
          systemPrompt: 'Research the topic and provide detailed findings.',
          userPromptTemplate: '{{input}}',
          outputVariable: 'researchResult',
        }),
        agentNode('writer', 580, 320, {
          ...AGENT_DEFAULTS,
          label: 'Writer',
          systemPrompt: 'Write creative content based on the brief.',
          userPromptTemplate: '{{input}}',
          outputVariable: 'writingResult',
        }),
        endNode('end', 840, 200),
      ],
      edges: [
        edge('start', 'supervisor'),
        edge('supervisor', 'researcher', {
          conditionCode: "return state.decision && state.decision.includes('RESEARCH')",
          label: 'research task',
        }),
        edge('supervisor', 'writer', {
          conditionCode: "return state.decision && state.decision.includes('WRITE')",
          label: 'write task',
        }),
        edge('researcher', 'end'),
        edge('writer', 'end'),
      ],
    },
  },

  // 10. Custom Code Pipeline
  {
    id: 'custom-code-pipeline',
    name: 'Custom Code Transform',
    description:
      'An agent processes input, a custom JS function node transforms the result (number the lines, compute stats), then a finalizer produces a clean report.',
    category: 'advanced',
    tags: ['custom-function', 'transform', 'code-node', 'formatting'],
    definition: {
      name: 'Custom Code Transform',
      nodes: [
        startNode('start', 80, 200),
        agentNode('processor', 320, 200, {
          ...AGENT_DEFAULTS,
          label: 'Processor',
          systemPrompt: 'Process and analyze the input.',
          userPromptTemplate: '{{input}}',
          outputVariable: 'processed',
        }),
        toolNode('transform', 560, 200, {
          label: 'Transform',
          toolKind: 'function',
          functionCode:
            "const lines = state.processed.split('\\n').filter(Boolean)\nconst numbered = lines.map((l,i) => `${i+1}. ${l}`).join('\\n')\nreturn { original: state.processed, formatted: numbered, lineCount: lines.length }",
          outputVariable: 'transformed',
        }),
        agentNode('finalizer', 800, 200, {
          ...AGENT_DEFAULTS,
          label: 'Finalizer',
          systemPrompt: 'Format the transformed data into a clean final report.',
          userPromptTemplate: 'Transformed data:\n{{transformed}}',
          outputVariable: 'final',
        }),
        endNode('end', 1040, 200),
      ],
      edges: [
        edge('start', 'processor'),
        edge('processor', 'transform'),
        edge('transform', 'finalizer'),
        edge('finalizer', 'end'),
      ],
    },
  },
]
