'use client'

import { SimpleIOTool } from './base/simple-io-tool'

export function JsonToYamlTool() {
  return (
    <SimpleIOTool
      toolId="json-to-yaml"
      inputLabel="JSON"
      inputPlaceholder="Enter JSON to convert to YAML..."
      inputKey="json"
      executeLabel="Convert to YAML"
    />
  )
}
