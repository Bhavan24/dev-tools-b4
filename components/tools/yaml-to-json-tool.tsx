'use client'

import { SimpleIOTool } from './base/simple-io-tool'

export function YamlToJsonTool() {
  return (
    <SimpleIOTool
      toolId="yaml-to-json"
      inputLabel="YAML"
      inputPlaceholder="Enter YAML to convert to JSON..."
      inputKey="yaml"
      executeLabel="Convert to JSON"
    />
  )
}
