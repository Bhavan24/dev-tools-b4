import { createMcpHandler } from 'mcp-handler'
import { z } from 'zod'
import { toolHandlers } from '@/lib/tool-handlers'

// Helper to convert JSON Schema property to Zod validator
function jsonSchemaPropertyToZod(prop: Record<string, any>, isRequired: boolean): z.ZodTypeAny {
  let field: z.ZodTypeAny

  if (prop.enum) {
    field = z.enum(prop.enum as [string, ...string[]])
  } else if (prop.type === 'number') {
    let numField = z.number()
    if (prop.minimum !== undefined) numField = numField.min(prop.minimum)
    if (prop.maximum !== undefined) numField = numField.max(prop.maximum)
    field = numField
  } else if (prop.type === 'boolean') {
    field = z.boolean()
  } else {
    field = z.string()
  }

  if (prop.description) {
    field = field.describe(prop.description)
  }

  if (!isRequired) {
    field = field.optional()
  }

  return field
}

// Build Zod shape from JSON Schema properties
function buildZodShape(
  properties: Record<string, any>,
  required: string[] = []
): Record<string, z.ZodTypeAny> {
  const shape: Record<string, z.ZodTypeAny> = {}

  for (const [key, prop] of Object.entries(properties)) {
    const isRequired = required.includes(key)
    shape[key] = jsonSchemaPropertyToZod(prop, isRequired)
  }

  return shape
}

const handler = createMcpHandler(
  (server) => {
    // Register all tools from toolHandlers
    Object.entries(toolHandlers).forEach(([name, config]) => {
      const shape = buildZodShape(config.schema.properties, config.schema.required)
      const inputSchema = Object.keys(shape).length > 0 ? z.object(shape) : z.object({})

      server.registerTool(
        name,
        {
          title: name
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),
          description: config.description,
          inputSchema,
        },
        async (args) => {
          try {
            const result = await config.handler(args)
            return {
              content: [
                {
                  type: 'text',
                  text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
                },
              ],
            }
          } catch (error: any) {
            throw new Error(error.message || 'Tool execution failed')
          }
        }
      )
    })
  },
  {},
  { basePath: '/api', maxDuration: 60, verboseLogs: true }
)

export { handler as GET, handler as POST }
