'use client'

import { SimpleIOTool } from './base/simple-io-tool'

export function YamlValidatorTool() {
  return (
    <SimpleIOTool
      toolId="yaml-validator"
      inputLabel="YAML to Validate"
      inputPlaceholder="Enter YAML content..."
      inputKey="yaml"
      executeLabel="Validate"
    />
  )
}
