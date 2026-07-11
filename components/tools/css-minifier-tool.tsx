'use client'

import { SimpleIOTool } from './base/simple-io-tool'

export function CssMinifierTool() {
  return (
    <SimpleIOTool
      toolId="css-minifier"
      inputLabel="CSS to Minify"
      inputPlaceholder="Enter CSS code..."
      inputKey="code"
      executeLabel="Minify"
    />
  )
}
