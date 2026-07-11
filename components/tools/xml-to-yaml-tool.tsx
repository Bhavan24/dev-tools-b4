'use client'

import { SimpleIOTool } from './base/simple-io-tool'

export function XmlToYamlTool() {
  return (
    <SimpleIOTool
      toolId="xml-to-yaml"
      inputLabel="XML"
      inputPlaceholder="Enter XML to convert to YAML..."
      inputKey="xml"
      executeLabel="Convert to YAML"
    />
  )
}
