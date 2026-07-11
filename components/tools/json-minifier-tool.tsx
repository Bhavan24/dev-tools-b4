'use client'

import { SimpleIOTool } from './base/simple-io-tool'

export function JsonMinifierTool() {
  return (
    <SimpleIOTool
      toolId="json-minifier"
      inputLabel="JSON to Minify"
      inputPlaceholder="Enter JSON..."
      inputKey="json"
      executeLabel="Minify"
    />
  )
}
