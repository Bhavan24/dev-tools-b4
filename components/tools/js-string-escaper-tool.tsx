'use client'

import { SimpleIOTool } from './base/simple-io-tool'

export function JsStringEscaperTool() {
  return (
    <SimpleIOTool
      toolId="js-string-escaper"
      inputLabel="Text to Escape"
      inputPlaceholder="Enter JavaScript string to escape..."
      inputKey="input"
      executeLabel="Escape"
    />
  )
}
