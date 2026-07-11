import { invokeAI } from './ai-client'
import type { AIConfig } from './ai-client'
import { executeResearch } from './ai-researcher-handler'

interface AIToolHandler {
  description: string
  systemPrompt: string
  schema: {
    type: string
    properties: Record<string, any>
    required?: string[]
  }
  handler: (input: any) => Promise<any>
}

const COMMON_AI_SCHEMA_FIELDS = {
  provider: {
    type: 'string',
    description:
      'AI provider id (openai, anthropic, google, groq, mistral, azure, bedrock, ollama)',
  },
  modelId: { type: 'string', description: 'Model identifier for the chosen provider' },
  apiKey: { type: 'string', description: 'API key for the provider (not required for Ollama)' },
  streaming: { type: 'boolean', description: 'Whether to stream the response (default: false)' },
}

function buildAIConfig(input: any): AIConfig {
  const {
    provider,
    modelId,
    apiKey,
    resourceName,
    region,
    accessKeyId,
    secretAccessKey,
    baseUrl,
    streaming,
  } = input

  let credentials: AIConfig['credentials']
  if (provider === 'bedrock') {
    credentials = { region, accessKeyId, secretAccessKey }
  } else if (provider === 'azure') {
    credentials = { apiKey, resourceName }
  } else if (provider === 'ollama') {
    credentials = { baseUrl: baseUrl || 'http://localhost:11434' }
  } else {
    credentials = { apiKey }
  }

  return { provider, modelId, credentials, streaming: streaming ?? false }
}

export const AI_SYSTEM_PROMPTS = {
  'ai-chat': `You are a helpful AI assistant. Respond clearly and concisely.`,

  'code-generator': `You are an expert software engineer.
Generate clean, production-ready code based on the user's description.
Include brief inline comments for non-obvious parts.
Return only the code, no surrounding explanation unless asked.`,

  'content-summarizer': `You are a professional content summarizer.
Produce a concise, accurate summary that preserves the key points and main ideas.
Use bullet points for clarity when the content has multiple distinct topics.`,

  'sentiment-analyzer': `You are a sentiment analysis expert.
Analyze the emotional tone of the provided text.
Return a structured analysis with: overall sentiment (Positive/Negative/Neutral/Mixed), confidence score (0-100), key emotional signals found, and a brief explanation.`,

  'ai-code-reviewer': `You are a senior software engineer conducting a thorough code review.
Analyze the code for: bugs, logic errors, security vulnerabilities, performance issues, code style, and maintainability.
Structure your response with clearly labeled sections: Bugs, Security, Performance, Style/Maintainability, and Summary.`,

  'ai-doc-generator': `You are a technical documentation expert.
Generate clear, comprehensive documentation for the provided source code.
Include: a description of what the code does, parameter/return type documentation, usage examples, and any important notes or edge cases.`,

  'ai-test-generator': `You are a test engineering expert.
Generate comprehensive unit tests for the provided code.
Cover: happy path, edge cases, error cases, and boundary conditions.
Use the same language and testing framework style as the input code if detectable, otherwise default to a sensible choice.`,

  'ai-sql-builder': `You are a SQL expert.
Generate correct, optimized SQL queries from natural language descriptions.
Return the SQL query followed by a brief explanation of what it does.
Use standard ANSI SQL unless a specific database dialect is requested.`,

  'ai-schema-generator': `You are a data modeling expert.
Generate JSON Schema (draft-07 compatible), database schemas, or OpenAPI specs from sample data or descriptions.
Return well-structured, properly annotated schemas with descriptions for each field.`,
}

export const aiToolHandlers: Record<string, AIToolHandler> = {
  'ai-chat': {
    description: 'Chat with an AI model with optional custom system prompt',
    systemPrompt: AI_SYSTEM_PROMPTS['ai-chat'],
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'User message to send to the AI' },
        systemPrompt: { type: 'string', description: 'Optional custom system prompt override' },
        ...COMMON_AI_SCHEMA_FIELDS,
        resourceName: { type: 'string', description: 'Azure resource name (Azure only)' },
        region: { type: 'string', description: 'AWS region (Bedrock only)' },
        accessKeyId: { type: 'string', description: 'AWS access key ID (Bedrock only)' },
        secretAccessKey: { type: 'string', description: 'AWS secret access key (Bedrock only)' },
        baseUrl: { type: 'string', description: 'Ollama base URL (Ollama only)' },
      },
      required: ['message', 'provider', 'modelId'],
    },
    handler: async (input) => {
      const config = buildAIConfig(input)
      const systemPrompt = input.systemPrompt || AI_SYSTEM_PROMPTS['ai-chat']
      const result = await invokeAI(config, systemPrompt, input.message)
      return { result }
    },
  },

  'code-generator': {
    description: 'Generate production-ready code from natural language descriptions using AI',
    systemPrompt: AI_SYSTEM_PROMPTS['code-generator'],
    schema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'Describe the code you want to generate' },
        language: {
          type: 'string',
          description: 'Target programming language (e.g. TypeScript, Python, Rust)',
        },
        ...COMMON_AI_SCHEMA_FIELDS,
        resourceName: { type: 'string', description: 'Azure resource name (Azure only)' },
        region: { type: 'string', description: 'AWS region (Bedrock only)' },
        accessKeyId: { type: 'string', description: 'AWS access key ID (Bedrock only)' },
        secretAccessKey: { type: 'string', description: 'AWS secret access key (Bedrock only)' },
        baseUrl: { type: 'string', description: 'Ollama base URL (Ollama only)' },
      },
      required: ['prompt', 'language', 'provider', 'modelId'],
    },
    handler: async (input) => {
      const config = buildAIConfig(input)
      const userInput = `Language: ${input.language}\n\n${input.prompt}`
      const result = await invokeAI(config, AI_SYSTEM_PROMPTS['code-generator'], userInput)
      return { result }
    },
  },

  'content-summarizer': {
    description: 'Summarize long documents, articles, and transcripts using AI',
    systemPrompt: AI_SYSTEM_PROMPTS['content-summarizer'],
    schema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Text content to summarize' },
        length: { type: 'string', description: 'Summary length: short, medium, or detailed' },
        ...COMMON_AI_SCHEMA_FIELDS,
        resourceName: { type: 'string', description: 'Azure resource name (Azure only)' },
        region: { type: 'string', description: 'AWS region (Bedrock only)' },
        accessKeyId: { type: 'string', description: 'AWS access key ID (Bedrock only)' },
        secretAccessKey: { type: 'string', description: 'AWS secret access key (Bedrock only)' },
        baseUrl: { type: 'string', description: 'Ollama base URL (Ollama only)' },
      },
      required: ['text', 'provider', 'modelId'],
    },
    handler: async (input) => {
      const config = buildAIConfig(input)
      const length = input.length || 'medium'
      const userInput = `Summarize the following content (${length} length):\n\n${input.text}`
      const result = await invokeAI(config, AI_SYSTEM_PROMPTS['content-summarizer'], userInput)
      return { result }
    },
  },

  'sentiment-analyzer': {
    description: 'Analyze sentiment and emotion from text using AI',
    systemPrompt: AI_SYSTEM_PROMPTS['sentiment-analyzer'],
    schema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Text to analyze for sentiment' },
        ...COMMON_AI_SCHEMA_FIELDS,
        resourceName: { type: 'string', description: 'Azure resource name (Azure only)' },
        region: { type: 'string', description: 'AWS region (Bedrock only)' },
        accessKeyId: { type: 'string', description: 'AWS access key ID (Bedrock only)' },
        secretAccessKey: { type: 'string', description: 'AWS secret access key (Bedrock only)' },
        baseUrl: { type: 'string', description: 'Ollama base URL (Ollama only)' },
      },
      required: ['text', 'provider', 'modelId'],
    },
    handler: async (input) => {
      const config = buildAIConfig(input)
      const result = await invokeAI(config, AI_SYSTEM_PROMPTS['sentiment-analyzer'], input.text)
      return { result }
    },
  },

  'ai-code-reviewer': {
    description: 'Review code for bugs, security issues, and improvements using AI',
    systemPrompt: AI_SYSTEM_PROMPTS['ai-code-reviewer'],
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Source code to review' },
        language: { type: 'string', description: 'Programming language of the code' },
        ...COMMON_AI_SCHEMA_FIELDS,
        resourceName: { type: 'string', description: 'Azure resource name (Azure only)' },
        region: { type: 'string', description: 'AWS region (Bedrock only)' },
        accessKeyId: { type: 'string', description: 'AWS access key ID (Bedrock only)' },
        secretAccessKey: { type: 'string', description: 'AWS secret access key (Bedrock only)' },
        baseUrl: { type: 'string', description: 'Ollama base URL (Ollama only)' },
      },
      required: ['code', 'provider', 'modelId'],
    },
    handler: async (input) => {
      const config = buildAIConfig(input)
      const lang = input.language ? `Language: ${input.language}\n\n` : ''
      const result = await invokeAI(
        config,
        AI_SYSTEM_PROMPTS['ai-code-reviewer'],
        `${lang}${input.code}`
      )
      return { result }
    },
  },

  'ai-doc-generator': {
    description: 'Generate API docs, README files, and inline comments from source code using AI',
    systemPrompt: AI_SYSTEM_PROMPTS['ai-doc-generator'],
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Source code to document' },
        format: { type: 'string', description: 'Output format: markdown, jsdoc, or inline' },
        ...COMMON_AI_SCHEMA_FIELDS,
        resourceName: { type: 'string', description: 'Azure resource name (Azure only)' },
        region: { type: 'string', description: 'AWS region (Bedrock only)' },
        accessKeyId: { type: 'string', description: 'AWS access key ID (Bedrock only)' },
        secretAccessKey: { type: 'string', description: 'AWS secret access key (Bedrock only)' },
        baseUrl: { type: 'string', description: 'Ollama base URL (Ollama only)' },
      },
      required: ['code', 'provider', 'modelId'],
    },
    handler: async (input) => {
      const config = buildAIConfig(input)
      const format = input.format || 'markdown'
      const userInput = `Generate ${format} documentation for:\n\n${input.code}`
      const result = await invokeAI(config, AI_SYSTEM_PROMPTS['ai-doc-generator'], userInput)
      return { result }
    },
  },

  'ai-test-generator': {
    description: 'Generate unit tests and test suites from source code using AI',
    systemPrompt: AI_SYSTEM_PROMPTS['ai-test-generator'],
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Source code to generate tests for' },
        framework: { type: 'string', description: 'Testing framework (e.g. Jest, pytest, JUnit)' },
        ...COMMON_AI_SCHEMA_FIELDS,
        resourceName: { type: 'string', description: 'Azure resource name (Azure only)' },
        region: { type: 'string', description: 'AWS region (Bedrock only)' },
        accessKeyId: { type: 'string', description: 'AWS access key ID (Bedrock only)' },
        secretAccessKey: { type: 'string', description: 'AWS secret access key (Bedrock only)' },
        baseUrl: { type: 'string', description: 'Ollama base URL (Ollama only)' },
      },
      required: ['code', 'provider', 'modelId'],
    },
    handler: async (input) => {
      const config = buildAIConfig(input)
      const fw = input.framework ? `Testing framework: ${input.framework}\n\n` : ''
      const result = await invokeAI(
        config,
        AI_SYSTEM_PROMPTS['ai-test-generator'],
        `${fw}${input.code}`
      )
      return { result }
    },
  },

  'ai-sql-builder': {
    description: 'Build SQL queries from natural language descriptions using AI',
    systemPrompt: AI_SYSTEM_PROMPTS['ai-sql-builder'],
    schema: {
      type: 'object',
      properties: {
        description: { type: 'string', description: 'Natural language description of the query' },
        dialect: {
          type: 'string',
          description: 'SQL dialect (PostgreSQL, MySQL, SQLite, MSSQL, etc.)',
        },
        schema: {
          type: 'string',
          description: 'Optional table schema context to help generate accurate queries',
        },
        ...COMMON_AI_SCHEMA_FIELDS,
        resourceName: { type: 'string', description: 'Azure resource name (Azure only)' },
        region: { type: 'string', description: 'AWS region (Bedrock only)' },
        accessKeyId: { type: 'string', description: 'AWS access key ID (Bedrock only)' },
        secretAccessKey: { type: 'string', description: 'AWS secret access key (Bedrock only)' },
        baseUrl: { type: 'string', description: 'Ollama base URL (Ollama only)' },
      },
      required: ['description', 'provider', 'modelId'],
    },
    handler: async (input) => {
      const config = buildAIConfig(input)
      const dialect = input.dialect ? `Dialect: ${input.dialect}\n` : ''
      const schema = input.schema ? `Schema context:\n${input.schema}\n\n` : ''
      const userInput = `${dialect}${schema}Query: ${input.description}`
      const result = await invokeAI(config, AI_SYSTEM_PROMPTS['ai-sql-builder'], userInput)
      return { result }
    },
  },

  'ai-schema-generator': {
    description:
      'Generate JSON Schema, database schemas, or OpenAPI specs from sample data using AI',
    systemPrompt: AI_SYSTEM_PROMPTS['ai-schema-generator'],
    schema: {
      type: 'object',
      properties: {
        input: {
          type: 'string',
          description: 'Sample data or natural language description to generate schema from',
        },
        format: {
          type: 'string',
          description: 'Output format: json-schema, openapi, sql, or prisma',
        },
        ...COMMON_AI_SCHEMA_FIELDS,
        resourceName: { type: 'string', description: 'Azure resource name (Azure only)' },
        region: { type: 'string', description: 'AWS region (Bedrock only)' },
        accessKeyId: { type: 'string', description: 'AWS access key ID (Bedrock only)' },
        secretAccessKey: { type: 'string', description: 'AWS secret access key (Bedrock only)' },
        baseUrl: { type: 'string', description: 'Ollama base URL (Ollama only)' },
      },
      required: ['input', 'provider', 'modelId'],
    },
    handler: async (input) => {
      const config = buildAIConfig(input)
      const format = input.format || 'json-schema'
      const userInput = `Generate a ${format} schema for:\n\n${input.input}`
      const result = await invokeAI(config, AI_SYSTEM_PROMPTS['ai-schema-generator'], userInput)
      return { result }
    },
  },

  'researcher-agent': {
    description:
      'Deep research assistant that performs multi-step web search, fact-checking, and synthesis',
    systemPrompt: '',
    schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Research question or topic to investigate' },
        depth: {
          type: 'string',
          description:
            'Research depth: quick (1-3 searches), standard (3-6 searches), deep (6-10 searches)',
        },
        tavilyApiKey: {
          type: 'string',
          description: 'Optional Tavily API key for real-time web search (get one at tavily.com)',
        },
        ...COMMON_AI_SCHEMA_FIELDS,
        resourceName: { type: 'string', description: 'Azure resource name (Azure only)' },
        region: { type: 'string', description: 'AWS region (Bedrock only)' },
        accessKeyId: { type: 'string', description: 'AWS access key ID (Bedrock only)' },
        secretAccessKey: { type: 'string', description: 'AWS secret access key (Bedrock only)' },
        baseUrl: { type: 'string', description: 'Ollama base URL (Ollama only)' },
      },
      required: ['query', 'provider', 'modelId'],
    },
    handler: async (input) => {
      const aiConfig = buildAIConfig(input)
      const result = await executeResearch({
        aiConfig,
        tavilyApiKey: input.tavilyApiKey,
        query: input.query,
        depth: input.depth || 'standard',
      })
      return result
    },
  },

  'workflow-builder': {
    description: 'Execute a visual AI workflow from a JSON workflow definition',
    systemPrompt: '',
    schema: {
      type: 'object',
      properties: {
        workflow: {
          type: 'string',
          description: 'JSON string of WorkflowDefinition (exported from the Workflow Builder UI)',
        },
        input: { type: 'string', description: 'Input data for the workflow entry node' },
        ...COMMON_AI_SCHEMA_FIELDS,
        resourceName: { type: 'string', description: 'Azure resource name (Azure only)' },
        region: { type: 'string', description: 'AWS region (Bedrock only)' },
        accessKeyId: { type: 'string', description: 'AWS access key ID (Bedrock only)' },
        secretAccessKey: { type: 'string', description: 'AWS secret access key (Bedrock only)' },
        baseUrl: { type: 'string', description: 'Ollama base URL (Ollama only)' },
      },
      required: ['workflow', 'input', 'provider', 'modelId'],
    },
    handler: async (input) => {
      // Executed via the dedicated /api/tools/ai/workflow-builder route for full streaming support.
      // Direct handler: parse and execute synchronously.
      let workflowDef: any
      try {
        workflowDef = JSON.parse(input.workflow)
      } catch {
        throw new Error('workflow must be a valid JSON string')
      }
      const aiConfig = buildAIConfig(input)
      // Dynamic import to avoid loading ReactFlow on server startup
      const { executeWorkflow } = await import('./workflow-engine')
      const result = await executeWorkflow(workflowDef, input.input, aiConfig)
      return result
    },
  },
}
