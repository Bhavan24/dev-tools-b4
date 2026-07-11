'use client'

import { SimpleIOTool } from './base/simple-io-tool'

export function XmlToJsonTool() {
  return (
    <SimpleIOTool
      toolId="xml-to-json"
      inputLabel="XML"
      inputPlaceholder="Enter XML to convert to JSON..."
      inputKey="xml"
      executeLabel="Convert to JSON"
    />
  )
}
