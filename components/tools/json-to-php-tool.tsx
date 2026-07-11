'use client'

import { SimpleIOTool } from './base/simple-io-tool'

export function JsonToPhpTool() {
  return (
    <SimpleIOTool
      toolId="json-to-php"
      inputLabel="JSON"
      inputPlaceholder="Enter JSON to convert to PHP array..."
      inputKey="json"
      executeLabel="Convert to PHP"
    />
  )
}
