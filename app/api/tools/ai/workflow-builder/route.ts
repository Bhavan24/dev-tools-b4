import { NextRequest, NextResponse } from 'next/server'
import { executeWorkflow } from '@/lib/workflow-engine'
import type { WorkflowDefinition } from '@/lib/workflow-types'

export const maxDuration = 120

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

    // Each agent node carries its own provider + credentials
    const result = await executeWorkflow(workflow, input ?? '')
    return NextResponse.json({ result })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Workflow execution failed' },
      { status: 400 }
    )
  }
}
