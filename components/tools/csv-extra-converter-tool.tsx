'use client'

import { SimpleIOTool } from './base/simple-io-tool'

export function CsvToXmlTool() {
  return (
    <SimpleIOTool
      toolId="csv-to-xml"
      inputLabel="CSV"
      inputPlaceholder="Paste CSV data..."
      inputKey="csv"
      executeLabel="Convert to XML"
    />
  )
}

export function CsvToYamlTool() {
  return (
    <SimpleIOTool
      toolId="csv-to-yaml"
      inputLabel="CSV"
      inputPlaceholder="Paste CSV data..."
      inputKey="csv"
      executeLabel="Convert to YAML"
    />
  )
}
