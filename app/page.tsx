import { toolHandlers } from '@/lib/tool-handlers'
import { HomeClient } from './home-client'

export default function HomePage() {
  // Derive MCP-enabled tool IDs server-side from the live handler registry.
  // Passed as a plain array prop so client components stay in sync automatically.
  const mcpToolIds = Object.keys(toolHandlers)

  return <HomeClient mcpToolIds={mcpToolIds} />
}
