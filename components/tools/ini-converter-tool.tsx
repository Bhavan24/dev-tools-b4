'use client'

import { SimpleIOTool } from './base/simple-io-tool'

export function IniToJsonTool() {
  return (
    <SimpleIOTool
      toolId="ini-to-json"
      inputLabel="INI"
      inputPlaceholder="Enter INI content..."
      inputKey="ini"
      executeLabel="Convert to JSON"
    />
  )
}

export function IniToXmlTool() {
  return (
    <SimpleIOTool
      toolId="ini-to-xml"
      inputLabel="INI"
      inputPlaceholder="Enter INI content..."
      inputKey="ini"
      executeLabel="Convert to XML"
    />
  )
}

export function IniToYamlTool() {
  return (
    <SimpleIOTool
      toolId="ini-to-yaml"
      inputLabel="INI"
      inputPlaceholder="Enter INI content..."
      inputKey="ini"
      executeLabel="Convert to YAML"
    />
  )
}
