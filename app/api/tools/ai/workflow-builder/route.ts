import { NextRequest, NextResponse } from 'next/server'
import { executeWorkflow } from '@/lib/workflow-engine'
import type { AIConfig } from '@/lib/ai-client'
import type { WorkflowDefinition } from '@/lib/workflow-types'

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
    const { workflow: workflowStr, input } = body

    if (!workflowStr) {
      return NextResponse.json({ error: 'workflow is required' }, { status: 400 })
    }

    let workflow: WorkflowDefinition
    try {
      workflow = JSON.parse(workflowStr)
    } catch {
      return NextResponse.json({ error: 'workflow must be a valid JSON string' }, { status: 400 })
    }

    const aiConfig = buildAIConfig(body)
    if (!aiConfig.provider || !aiConfig.modelId) {
      return NextResponse.json({ error: 'provider and modelId are required' }, { status: 400 })
    }

    // Server-side execution: unsafe nodes (JS transform/conditional) are disabled
    const result = await executeWorkflow(workflow, input ?? '', aiConfig)
    return NextResponse.json({ result })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Workflow execution failed' },
      { status: 400 }
    )
  }
}
