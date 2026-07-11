'use client'

import { SimpleIOTool } from './base/simple-io-tool'

export function JsMinifierTool() {
  return (
    <SimpleIOTool
      toolId="js-minifier"
      inputLabel="JavaScript to Minify"
      inputPlaceholder="Enter JavaScript code..."
      inputKey="code"
      executeLabel="Minify"
    />
  )
}
