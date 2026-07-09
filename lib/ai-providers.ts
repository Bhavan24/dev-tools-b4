export type CredentialField = {
  key: string
  label: string
  placeholder: string
  type: 'password' | 'text'
}

export type ProviderDefinition = {
  id: string
  name: string
  credentialFields: CredentialField[]
  defaultModels: string[]
}

export const AI_PROVIDERS: ProviderDefinition[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    credentialFields: [
      {
        key: 'apiKey',
        label: 'API Key',
        placeholder: 'sk-...',
        type: 'password',
      },
    ],
    defaultModels: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    credentialFields: [
      {
        key: 'apiKey',
        label: 'API Key',
        placeholder: 'sk-ant-...',
        type: 'password',
      },
    ],
    defaultModels: [
      'claude-sonnet-4-6',
      'claude-opus-4-8',
      'claude-haiku-4-5-20251001',
      'claude-3-5-sonnet-20241022',
    ],
  },
  {
    id: 'google',
    name: 'Google Gemini',
    credentialFields: [
      {
        key: 'apiKey',
        label: 'API Key',
        placeholder: 'AIza...',
        type: 'password',
      },
    ],
    defaultModels: [
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
    ],
  },
  {
    id: 'groq',
    name: 'Groq',
    credentialFields: [
      {
        key: 'apiKey',
        label: 'API Key',
        placeholder: 'gsk_...',
        type: 'password',
      },
    ],
    defaultModels: [
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'mixtral-8x7b-32768',
      'gemma2-9b-it',
    ],
  },
  {
    id: 'mistral',
    name: 'Mistral',
    credentialFields: [
      {
        key: 'apiKey',
        label: 'API Key',
        placeholder: '...',
        type: 'password',
      },
    ],
    defaultModels: ['mistral-large-latest', 'mistral-small-latest', 'mistral-medium-latest'],
  },
  {
    id: 'azure',
    name: 'Azure OpenAI',
    credentialFields: [
      {
        key: 'resourceName',
        label: 'Resource Name',
        placeholder: 'my-azure-resource',
        type: 'text',
      },
      {
        key: 'apiKey',
        label: 'API Key',
        placeholder: '...',
        type: 'password',
      },
    ],
    defaultModels: ['gpt-4o', 'gpt-4-turbo', 'gpt-35-turbo'],
  },
  {
    id: 'bedrock',
    name: 'AWS Bedrock',
    credentialFields: [
      {
        key: 'region',
        label: 'AWS Region',
        placeholder: 'us-east-1',
        type: 'text',
      },
      {
        key: 'accessKeyId',
        label: 'Access Key ID',
        placeholder: 'AKIA...',
        type: 'text',
      },
      {
        key: 'secretAccessKey',
        label: 'Secret Access Key',
        placeholder: '...',
        type: 'password',
      },
    ],
    defaultModels: [
      'anthropic.claude-3-5-sonnet-20241022-v2:0',
      'anthropic.claude-3-haiku-20240307-v1:0',
      'amazon.titan-text-express-v1',
      'meta.llama3-70b-instruct-v1:0',
    ],
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    credentialFields: [
      {
        key: 'baseUrl',
        label: 'Base URL',
        placeholder: 'http://localhost:11434',
        type: 'text',
      },
    ],
    defaultModels: ['llama3.2', 'mistral', 'codellama', 'phi3'],
  },
]

export const AI_PROVIDER_MAP = new Map<string, ProviderDefinition>(
  AI_PROVIDERS.map((p) => [p.id, p])
)

export function getProvider(id: string): ProviderDefinition | undefined {
  return AI_PROVIDER_MAP.get(id)
}
