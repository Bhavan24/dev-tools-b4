import { generateText, streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createGroq } from '@ai-sdk/groq'
import { createMistral } from '@ai-sdk/mistral'
import { createAzure } from '@ai-sdk/azure'
import { createAmazonBedrock } from '@ai-sdk/amazon-bedrock'
import type { LanguageModel } from 'ai'

export type AICredentials =
  | { apiKey: string }
  | { apiKey: string; resourceName: string }
  | { region: string; accessKeyId: string; secretAccessKey: string }
  | { baseUrl: string }

export type AIConfig = {
  provider: string
  modelId: string
  credentials: AICredentials
  streaming?: boolean
}

export function resolveModel(config: AIConfig): LanguageModel {
  const { provider, modelId, credentials } = config

  switch (provider) {
    case 'openai': {
      const creds = credentials as { apiKey: string }
      return createOpenAI({ apiKey: creds.apiKey })(modelId)
    }
    case 'anthropic': {
      const creds = credentials as { apiKey: string }
      return createAnthropic({ apiKey: creds.apiKey })(modelId)
    }
    case 'google': {
      const creds = credentials as { apiKey: string }
      return createGoogleGenerativeAI({ apiKey: creds.apiKey })(modelId)
    }
    case 'groq': {
      const creds = credentials as { apiKey: string }
      return createGroq({ apiKey: creds.apiKey })(modelId)
    }
    case 'mistral': {
      const creds = credentials as { apiKey: string }
      return createMistral({ apiKey: creds.apiKey })(modelId)
    }
    case 'azure': {
      const creds = credentials as { apiKey: string; resourceName: string }
      return createAzure({ resourceName: creds.resourceName, apiKey: creds.apiKey })(modelId)
    }
    case 'bedrock': {
      const creds = credentials as { region: string; accessKeyId: string; secretAccessKey: string }
      return createAmazonBedrock({
        region: creds.region,
        accessKeyId: creds.accessKeyId,
        secretAccessKey: creds.secretAccessKey,
      })(modelId)
    }
    case 'ollama': {
      const creds = credentials as { baseUrl: string }
      return createOpenAI({
        baseURL: `${creds.baseUrl.replace(/\/$/, '')}/v1`,
        apiKey: 'ollama',
      })(modelId)
    }
    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}

export async function invokeAI(
  config: AIConfig,
  systemPrompt: string,
  userInput: string
): Promise<string> {
  const model = resolveModel(config)
  const { text } = await generateText({
    model,
    system: systemPrompt,
    prompt: userInput,
    maxOutputTokens: 4096,
  })
  return text
}

export async function invokeAIStream(
  config: AIConfig,
  systemPrompt: string,
  userInput: string
): Promise<Response> {
  const model = resolveModel(config)
  const result = streamText({
    model,
    system: systemPrompt,
    prompt: userInput,
    maxOutputTokens: 4096,
  })
  return result.toTextStreamResponse()
}
