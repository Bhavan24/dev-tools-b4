import { toolHandlers } from '@/lib/tool-handlers'

export async function POST(request: Request) {
  const body = await request.json()

  // Basic MCP protocol handler
  const method = body.method

  if (method === 'tools/list') {
    const tools = Object.entries(toolHandlers).map(([id, config]) => ({
      name: id,
      description: config.description,
      inputSchema: config.schema,
    }))
    return Response.json({ tools })
  }

  if (method === 'tools/call') {
    const { name, arguments: args } = body
    const handler = toolHandlers[name]

    if (!handler) {
      return Response.json(
        { error: 'Tool not found' },
        { status: 404 }
      )
    }

    try {
      const result = await handler.handler(args)
      return Response.json({ result })
    } catch (error: any) {
      return Response.json(
        { error: error.message || 'Tool execution failed' },
        { status: 400 }
      )
    }
  }

  return Response.json(
    { error: 'Unknown method' },
    { status: 400 }
  )
}

export async function GET() {
  return Response.json({
    name: 'DevTools MCP Server',
    version: '1.0.0',
    description: 'MCP server for developer tools',
  })
}
