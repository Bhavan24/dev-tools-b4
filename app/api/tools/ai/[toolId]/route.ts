import { NextRequest, NextResponse } from 'next/server'
import { aiToolHandlers } from '@/lib/ai-tool-handlers'
import { invokeAIStream } from '@/lib/ai-client'
import type { AIConfig } from '@/lib/ai-client'

export const maxDuration = 60

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ toolId: string }> }
) {
  try {
    const { toolId } = await params
    const body = await request.json()

    const handler = aiToolHandlers[toolId]
    if (!handler) {
      return NextResponse.json({ error: 'AI tool not found' }, { status: 404 })
    }

    // Streaming path - invokeAIStream returns the full Response object
    if (body.streaming === true) {
      const config = buildAIConfig(body)
      const systemPrompt = body.systemPrompt || handler.systemPrompt

      // Build user input per tool
      let userInput =
        body.input ||
        body.text ||
        body.message ||
        body.code ||
        body.prompt ||
        body.description ||
        ''
      if (toolId === 'code-generator') {
        userInput = `Language: ${body.language || 'auto-detect'}\n\n${body.prompt || ''}`
      } else if (toolId === 'content-summarizer') {
        userInput = `Summarize the following content (${body.length || 'medium'} length):\n\n${body.text || ''}`
      } else if (toolId === 'ai-code-reviewer') {
        const lang = body.language ? `Language: ${body.language}\n\n` : ''
        userInput = `${lang}${body.code || ''}`
      } else if (toolId === 'ai-doc-generator') {
        userInput = `Generate ${body.format || 'markdown'} documentation for:\n\n${body.code || ''}`
      } else if (toolId === 'ai-test-generator') {
        const fw = body.framework ? `Testing framework: ${body.framework}\n\n` : ''
        userInput = `${fw}${body.code || ''}`
      } else if (toolId === 'ai-sql-builder') {
        const dialect = body.dialect ? `Dialect: ${body.dialect}\n` : ''
        const schemaCtx = body.schema ? `Schema context:\n${body.schema}\n\n` : ''
        userInput = `${dialect}${schemaCtx}Query: ${body.description || ''}`
      } else if (toolId === 'ai-schema-generator') {
        userInput = `Generate a ${body.format || 'json-schema'} schema for:\n\n${body.input || ''}`
      }

      return await invokeAIStream(config, systemPrompt, userInput)
    }

    // Batch path
    const result = await handler.handler(body)
    return NextResponse.json({ result })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'AI tool execution failed' },
      { status: 400 }
    )
  }
}
