import { NextRequest, NextResponse } from 'next/server'
import { toolHandlers } from '@/lib/tool-handlers'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ toolId: string }> }
) {
  try {
    const { toolId } = await params
    const body = await request.json()

    const handler = toolHandlers[toolId]
    if (!handler) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      )
    }

    const result = await handler.handler(body)
    return NextResponse.json({ result })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to execute tool' },
      { status: 400 }
    )
  }
}
