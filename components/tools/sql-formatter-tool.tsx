'use client'

import { SimpleIOTool } from './base/simple-io-tool'

export function SqlFormatterTool() {
  return (
    <SimpleIOTool
      toolId="sql-formatter"
      inputLabel="SQL to Format"
      inputPlaceholder="Enter SQL query..."
      inputKey="sql"
      executeLabel="Format"
    />
  )
}
