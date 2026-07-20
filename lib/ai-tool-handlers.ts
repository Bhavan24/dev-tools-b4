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

  'ai-commit-generator': `You are an expert software engineer who writes clear, concise git commit messages following the Conventional Commits specification (https://www.conventionalcommits.org).
Format: <type>(<optional scope>): <description>

Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert

Rules:
- Subject line: imperative mood, no period, max 72 characters
- Body (optional): explain the WHY, wrap at 72 characters
- Breaking changes: add BREAKING CHANGE: in the footer or ! after the type
- Return the commit message only, no additional commentary`,

  'ai-regex-generator': `You are a regex expert.
Given a description of what to match, produce a regular expression that satisfies the requirement.
Return:
1. The regex pattern (just the pattern, no delimiters)
2. Flags to use (e.g. i, g, m) with explanation
3. A plain-language explanation of how the pattern works
4. 3-5 example strings that match and 2-3 that do not match

Be precise. Avoid over-matching. Prefer readable patterns over clever one-liners.`,

  'ai-error-explainer': `You are a debugging expert who explains errors clearly to developers at any experience level.
Given a stack trace or error message, provide:
1. Plain-language explanation of what went wrong
2. The most likely root cause(s)
3. Step-by-step fix suggestions, ordered by likelihood
4. How to prevent this error in the future

Be concise and actionable. Avoid jargon unless necessary; if used, define it.`,

  'ai-log-analyzer': `You are a site reliability engineer analyzing application logs.
Given a log snippet, produce:
1. Summary: what the system was doing
2. Errors & warnings: list with severity, message, and timestamp if present
3. Anomalies or unusual patterns
4. Root cause hypothesis for any errors
5. Recommended next steps

Group related events. Highlight the most critical issues first.`,

  'ai-dockerfile-generator': `You are a DevOps expert specializing in containerization.
Generate a production-ready Dockerfile for the described application stack.
Include:
- Appropriate base image (prefer official slim/alpine variants)
- Multi-stage build if beneficial for image size
- Non-root user for security
- COPY/RUN steps ordered for best layer caching
- Exposed ports, WORKDIR, ENV, ENTRYPOINT/CMD
- Brief inline comments for non-obvious choices

Return only the Dockerfile content, no surrounding explanation.`,

  'ai-architecture-diagram': `You are a software architect who creates clear system diagrams using Mermaid syntax.
Given a system description, generate a Mermaid diagram that accurately represents the architecture.
Choose the most appropriate diagram type (graph TD/LR, sequenceDiagram, classDiagram, C4Context, etc.).
Use descriptive node labels and relationship annotations.
Return only the Mermaid source code (starting with the diagram type declaration), no surrounding explanation.`,

  'ai-prompt-optimizer': `You are a prompt engineering expert who helps people write more effective prompts for AI models.
Analyze the provided prompt and return:
1. Issues identified (vague instructions, missing context, conflicting directives, etc.)
2. Optimized version of the prompt with improvements applied
3. Explanation of what was changed and why
4. Optional: alternative formulations for different use cases

Keep the optimized prompt's intent identical to the original.`,

  'ai-release-notes': `You are a technical writer who creates clear, user-focused release notes.
Given a list of commit messages or PR titles, produce polished release notes:
- Group changes into sections: New Features, Improvements, Bug Fixes, Breaking Changes, Other
- Omit trivial/internal changes (chore, ci, docs tweaks) unless significant
- Translate technical jargon into user-facing language
- Use present tense: "Adds X", "Fixes Y"
- Format as Markdown with a version header if a version is provided

Return only the release notes Markdown.`,

  'ai-email-generator': `You are an expert professional communications writer specializing in email composition and improvement.

Given a scenario description or a draft email, produce a polished result based on the requested style:
- professional: formal, clear, respectful tone suited for business correspondence
- friendly: warm, conversational but still professional
- short: ultra-concise, no fluff, gets straight to the point
- persuasive: compelling, action-oriented, highlights benefits
- apologetic: sincere, empathetic, takes responsibility clearly
- follow-up: gentle, referencing previous contact, clear call to action

Always include:
1. Subject line (if not provided)
2. Salutation
3. Well-structured body
4. Clear call to action (if applicable)
5. Professional sign-off

Return only the final email (subject line first, then body). No meta-commentary.`,

  'ai-social-post': `You are an expert social media content strategist who writes engaging, platform-optimized posts.

Platform-specific rules you MUST follow:
- LinkedIn: professional tone, 150-300 words, can use line breaks, up to 3 relevant hashtags, no emojis in excess
- Twitter/X: max 280 characters, punchy and direct, 1-2 hashtags, emojis optional
- Instagram: visual storytelling, 100-200 words, 5-10 hashtags at the end, emojis welcome
- Facebook: conversational, 50-150 words, 1-2 hashtags, relatable and shareable
- WhatsApp: casual and personal, very short (1-3 sentences), no hashtags, warm tone
- TikTok: energetic, trend-aware, 50-100 words, call-to-action, 3-5 hashtags
- Threads: casual, conversational, max 500 characters, minimal hashtags

For the requested platform(s), generate a ready-to-post version.
If multiple platforms are requested, clearly label each section.
Return only the post content, no explanation.`,
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

  'ai-commit-generator': {
    description: 'Generate a Conventional Commits-formatted git commit message from a diff or changed file list using AI',
    systemPrompt: AI_SYSTEM_PROMPTS['ai-commit-generator'],
    schema: {
      type: 'object',
      properties: {
        diff: { type: 'string', description: 'Git diff output or list of changed files with descriptions' },
        scope: { type: 'string', description: 'Optional scope hint (e.g. auth, api, ui)' },
        ...COMMON_AI_SCHEMA_FIELDS,
        resourceName: { type: 'string', description: 'Azure resource name (Azure only)' },
        region: { type: 'string', description: 'AWS region (Bedrock only)' },
        accessKeyId: { type: 'string', description: 'AWS access key ID (Bedrock only)' },
        secretAccessKey: { type: 'string', description: 'AWS secret access key (Bedrock only)' },
        baseUrl: { type: 'string', description: 'Ollama base URL (Ollama only)' },
      },
      required: ['diff', 'provider', 'modelId'],
    },
    handler: async (input) => {
      const config = buildAIConfig(input)
      const scope = input.scope ? `Suggested scope: ${input.scope}\n\n` : ''
      const userInput = `${scope}Changes:\n${input.diff}`
      const result = await invokeAI(config, AI_SYSTEM_PROMPTS['ai-commit-generator'], userInput)
      return { result }
    },
  },

  'ai-regex-generator': {
    description: 'Generate a regular expression from a plain-language description using AI, with explanation and examples',
    systemPrompt: AI_SYSTEM_PROMPTS['ai-regex-generator'],
    schema: {
      type: 'object',
      properties: {
        description: { type: 'string', description: 'Plain-language description of what to match' },
        language: { type: 'string', description: 'Target language/engine (e.g. JavaScript, Python, PCRE)' },
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
      const lang = input.language ? `Target engine: ${input.language}\n\n` : ''
      const userInput = `${lang}Match: ${input.description}`
      const result = await invokeAI(config, AI_SYSTEM_PROMPTS['ai-regex-generator'], userInput)
      return { result }
    },
  },

  'ai-error-explainer': {
    description: 'Explain a stack trace or error message in plain language with fix suggestions using AI',
    systemPrompt: AI_SYSTEM_PROMPTS['ai-error-explainer'],
    schema: {
      type: 'object',
      properties: {
        error: { type: 'string', description: 'Stack trace or error message to explain' },
        context: { type: 'string', description: 'Optional context: language, framework, or what the code was doing' },
        ...COMMON_AI_SCHEMA_FIELDS,
        resourceName: { type: 'string', description: 'Azure resource name (Azure only)' },
        region: { type: 'string', description: 'AWS region (Bedrock only)' },
        accessKeyId: { type: 'string', description: 'AWS access key ID (Bedrock only)' },
        secretAccessKey: { type: 'string', description: 'AWS secret access key (Bedrock only)' },
        baseUrl: { type: 'string', description: 'Ollama base URL (Ollama only)' },
      },
      required: ['error', 'provider', 'modelId'],
    },
    handler: async (input) => {
      const config = buildAIConfig(input)
      const ctx = input.context ? `Context: ${input.context}\n\n` : ''
      const userInput = `${ctx}Error:\n${input.error}`
      const result = await invokeAI(config, AI_SYSTEM_PROMPTS['ai-error-explainer'], userInput)
      return { result }
    },
  },

  'ai-log-analyzer': {
    description: 'Analyze server or application logs with AI to surface errors, anomalies, and patterns',
    systemPrompt: AI_SYSTEM_PROMPTS['ai-log-analyzer'],
    schema: {
      type: 'object',
      properties: {
        logs: { type: 'string', description: 'Log content to analyze' },
        focus: { type: 'string', description: 'Optional focus area (e.g. errors only, performance, security)' },
        ...COMMON_AI_SCHEMA_FIELDS,
        resourceName: { type: 'string', description: 'Azure resource name (Azure only)' },
        region: { type: 'string', description: 'AWS region (Bedrock only)' },
        accessKeyId: { type: 'string', description: 'AWS access key ID (Bedrock only)' },
        secretAccessKey: { type: 'string', description: 'AWS secret access key (Bedrock only)' },
        baseUrl: { type: 'string', description: 'Ollama base URL (Ollama only)' },
      },
      required: ['logs', 'provider', 'modelId'],
    },
    handler: async (input) => {
      const config = buildAIConfig(input)
      const focus = input.focus ? `Focus: ${input.focus}\n\n` : ''
      const userInput = `${focus}Logs:\n${input.logs}`
      const result = await invokeAI(config, AI_SYSTEM_PROMPTS['ai-log-analyzer'], userInput)
      return { result }
    },
  },

  'ai-dockerfile-generator': {
    description: 'Generate a production-ready Dockerfile from an application stack description using AI',
    systemPrompt: AI_SYSTEM_PROMPTS['ai-dockerfile-generator'],
    schema: {
      type: 'object',
      properties: {
        description: { type: 'string', description: 'Describe your app stack (language, runtime, dependencies, build steps)' },
        baseImage: { type: 'string', description: 'Optional preferred base image (e.g. node:20-alpine, python:3.12-slim)' },
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
      const base = input.baseImage ? `Preferred base image: ${input.baseImage}\n\n` : ''
      const userInput = `${base}Stack: ${input.description}`
      const result = await invokeAI(config, AI_SYSTEM_PROMPTS['ai-dockerfile-generator'], userInput)
      return { result }
    },
  },

  'ai-architecture-diagram': {
    description: 'Generate a Mermaid architecture diagram from a system description using AI',
    systemPrompt: AI_SYSTEM_PROMPTS['ai-architecture-diagram'],
    schema: {
      type: 'object',
      properties: {
        description: { type: 'string', description: 'Describe your system architecture, components, and their relationships' },
        diagramType: { type: 'string', description: 'Preferred diagram type (e.g. flowchart, sequence, class, C4 - or leave blank for auto)' },
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
      const type = input.diagramType ? `Preferred diagram type: ${input.diagramType}\n\n` : ''
      const userInput = `${type}System: ${input.description}`
      const result = await invokeAI(config, AI_SYSTEM_PROMPTS['ai-architecture-diagram'], userInput)
      return { result }
    },
  },

  'ai-prompt-optimizer': {
    description: 'Analyze and improve a prompt for clarity and effectiveness using AI',
    systemPrompt: AI_SYSTEM_PROMPTS['ai-prompt-optimizer'],
    schema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'The prompt to optimize' },
        targetModel: { type: 'string', description: 'Optional target model context (e.g. GPT-4, Claude, Gemini)' },
        ...COMMON_AI_SCHEMA_FIELDS,
        resourceName: { type: 'string', description: 'Azure resource name (Azure only)' },
        region: { type: 'string', description: 'AWS region (Bedrock only)' },
        accessKeyId: { type: 'string', description: 'AWS access key ID (Bedrock only)' },
        secretAccessKey: { type: 'string', description: 'AWS secret access key (Bedrock only)' },
        baseUrl: { type: 'string', description: 'Ollama base URL (Ollama only)' },
      },
      required: ['prompt', 'provider', 'modelId'],
    },
    handler: async (input) => {
      const config = buildAIConfig(input)
      const model = input.targetModel ? `Target model: ${input.targetModel}\n\n` : ''
      const userInput = `${model}Prompt to optimize:\n${input.prompt}`
      const result = await invokeAI(config, AI_SYSTEM_PROMPTS['ai-prompt-optimizer'], userInput)
      return { result }
    },
  },

  'ai-release-notes': {
    description: 'Generate formatted release notes from commit messages or PR titles using AI',
    systemPrompt: AI_SYSTEM_PROMPTS['ai-release-notes'],
    schema: {
      type: 'object',
      properties: {
        commits: { type: 'string', description: 'Commit log or PR title list (one per line)' },
        version: { type: 'string', description: 'Optional version number (e.g. v2.1.0)' },
        ...COMMON_AI_SCHEMA_FIELDS,
        resourceName: { type: 'string', description: 'Azure resource name (Azure only)' },
        region: { type: 'string', description: 'AWS region (Bedrock only)' },
        accessKeyId: { type: 'string', description: 'AWS access key ID (Bedrock only)' },
        secretAccessKey: { type: 'string', description: 'AWS secret access key (Bedrock only)' },
        baseUrl: { type: 'string', description: 'Ollama base URL (Ollama only)' },
      },
      required: ['commits', 'provider', 'modelId'],
    },
    handler: async (input) => {
      const config = buildAIConfig(input)
      const ver = input.version ? `Version: ${input.version}\n\n` : ''
      const userInput = `${ver}Commits:\n${input.commits}`
      const result = await invokeAI(config, AI_SYSTEM_PROMPTS['ai-release-notes'], userInput)
      return { result }
    },
  },

  'ai-email-generator': {
    description: 'Generate or improve professional emails from a scenario or draft using AI',
    systemPrompt: AI_SYSTEM_PROMPTS['ai-email-generator'],
    schema: {
      type: 'object',
      properties: {
        input: { type: 'string', description: 'Describe the email scenario or paste your draft email' },
        style: {
          type: 'string',
          description: 'Email style: professional, friendly, short, persuasive, apologetic, follow-up',
        },
        recipientContext: {
          type: 'string',
          description: 'Optional context about the recipient (e.g. manager, client, colleague, unknown)',
        },
        systemPrompt: { type: 'string', description: 'Optional custom system prompt override' },
        ...COMMON_AI_SCHEMA_FIELDS,
        resourceName: { type: 'string', description: 'Azure resource name (Azure only)' },
        region: { type: 'string', description: 'AWS region (Bedrock only)' },
        accessKeyId: { type: 'string', description: 'AWS access key ID (Bedrock only)' },
        secretAccessKey: { type: 'string', description: 'AWS secret access key (Bedrock only)' },
        baseUrl: { type: 'string', description: 'Ollama base URL (Ollama only)' },
      },
      required: ['input', 'style', 'provider', 'modelId'],
    },
    handler: async (input) => {
      const config = buildAIConfig(input)
      const systemPrompt = input.systemPrompt || AI_SYSTEM_PROMPTS['ai-email-generator']
      const recipient = input.recipientContext ? `Recipient context: ${input.recipientContext}\n` : ''
      const userInput = `Style: ${input.style}\n${recipient}\n${input.input}`
      const result = await invokeAI(config, systemPrompt, userInput)
      return { result }
    },
  },

  'ai-social-post': {
    description: 'Generate platform-optimized social media posts for LinkedIn, Instagram, Twitter, Facebook, WhatsApp, TikTok, and Threads using AI',
    systemPrompt: AI_SYSTEM_PROMPTS['ai-social-post'],
    schema: {
      type: 'object',
      properties: {
        topic: { type: 'string', description: 'Topic, idea, or content to turn into a social post' },
        platforms: {
          type: 'string',
          description: 'Comma-separated platforms: linkedin, twitter, instagram, facebook, whatsapp, tiktok, threads',
        },
        tone: {
          type: 'string',
          description: 'Optional tone: inspirational, educational, promotional, humorous, personal, announcement',
        },
        systemPrompt: { type: 'string', description: 'Optional custom system prompt override' },
        ...COMMON_AI_SCHEMA_FIELDS,
        resourceName: { type: 'string', description: 'Azure resource name (Azure only)' },
        region: { type: 'string', description: 'AWS region (Bedrock only)' },
        accessKeyId: { type: 'string', description: 'AWS access key ID (Bedrock only)' },
        secretAccessKey: { type: 'string', description: 'AWS secret access key (Bedrock only)' },
        baseUrl: { type: 'string', description: 'Ollama base URL (Ollama only)' },
      },
      required: ['topic', 'platforms', 'provider', 'modelId'],
    },
    handler: async (input) => {
      const config = buildAIConfig(input)
      const systemPrompt = input.systemPrompt || AI_SYSTEM_PROMPTS['ai-social-post']
      const tone = input.tone ? `Tone: ${input.tone}\n` : ''
      const userInput = `Platforms: ${input.platforms}\n${tone}\nTopic/Content:\n${input.topic}`
      const result = await invokeAI(config, systemPrompt, userInput)
      return { result }
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
      // Dynamic import to avoid loading ReactFlow on server startup
      const { executeWorkflow } = await import('./workflow-engine')
      const result = await executeWorkflow(workflowDef, input.input)
      return result
    },
  },
}
