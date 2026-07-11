import { NextRequest, NextResponse } from 'next/server'
import { streamResearch, executeResearch } from '@/lib/ai-researcher-handler'
import type { AIConfig } from '@/lib/ai-client'

export const maxDuration = 120

function buildAIConfig(body: any): AIConfig {
  const { provider, modelId, apiKey, resourceName, region, accessKeyId, secretAccessKey, baseUrl } =
    body

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

  return { provider, modelId, credentials }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, depth = 'standard', tavilyApiKey, streaming } = body

    if (!query?.trim()) {
      return NextResponse.json({ error: 'query is required' }, { status: 400 })
    }

    const aiConfig = buildAIConfig(body)

    if (!aiConfig.provider || !aiConfig.modelId) {
      return NextResponse.json({ error: 'provider and modelId are required' }, { status: 400 })
    }

    const researchConfig = { aiConfig, tavilyApiKey, query, depth }

    if (streaming) {
      const { stream, sources } = streamResearch(researchConfig)

      const encoder = new TextEncoder()
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const part of stream.fullStream) {
              if (part.type === 'text-delta') {
                controller.enqueue(encoder.encode((part as any).textDelta ?? ''))
              } else if (part.type === 'tool-call') {
                const p = part as any
                const inp = p.input ?? p.args ?? {}
                const marker = `\n\x00TOOL:${p.toolName}:${JSON.stringify(inp)}\x00\n`
                controller.enqueue(encoder.encode(marker))
              }
            }
            // Emit accumulated sources at end
            const sourcesMarker = `\n\x00SOURCES:${JSON.stringify(sources)}\x00\n`
            controller.enqueue(encoder.encode(sourcesMarker))
          } catch (err: any) {
            const errMarker = `\n\x00ERROR:${JSON.stringify(err.message)}\x00\n`
            controller.enqueue(encoder.encode(errMarker))
          } finally {
            controller.close()
          }
        },
      })

      return new Response(readable, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Transfer-Encoding': 'chunked' },
      })
    }

    const result = await executeResearch(researchConfig)
    return NextResponse.json({ result })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Research failed' }, { status: 400 })
  }
}
