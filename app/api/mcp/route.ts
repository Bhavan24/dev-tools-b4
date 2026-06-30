import { toolHandlers } from '@/lib/tool-handlers'

export async function POST(request: Request) {
  const body = await request.json()

  // MCP JSON-RPC 2.0 protocol handler
  const method = body.method
  const jsonrpc = body.jsonrpc || '2.0'
  const id = body.id

  try {
    if (method === 'tools/list') {
      const tools = Object.entries(toolHandlers).map(([name, config]) => ({
        name,
        description: config.description,
        inputSchema: config.schema,
      }))
      return Response.json({
        jsonrpc,
        id,
        result: { tools },
      })
    }

    if (method === 'tools/call') {
      const { name, arguments: args } = body.params
      const handler = toolHandlers[name]

      if (!handler) {
        return Response.json(
          {
            jsonrpc,
            id,
            error: { code: -32601, message: 'Tool not found' },
          },
          { status: 404 }
        )
      }

      try {
        const result = await handler.handler(args)
        return Response.json({
          jsonrpc,
          id,
          result: {
            content: [
              {
                type: 'text',
                text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
              },
            ],
          },
        })
      } catch (error: any) {
        return Response.json(
          {
            jsonrpc,
            id,
            error: { code: -32603, message: error.message || 'Tool execution failed' },
          },
          { status: 400 }
        )
      }
    }

    return Response.json(
      {
        jsonrpc,
        id,
        error: { code: -32601, message: 'Method not found' },
      },
      { status: 400 }
    )
  } catch (error: any) {
    return Response.json(
      {
        jsonrpc,
        error: { code: -32700, message: 'Parse error' },
      },
      { status: 400 }
    )
  }
}

export async function GET() {
  return Response.json({
    name: 'AI Developer Tools MCP Server',
    version: '1.0.0',
    description: 'MCP server for AI developer tools',
  })
}
