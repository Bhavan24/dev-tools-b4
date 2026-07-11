'use client'

import { SimpleIOTool } from './base/simple-io-tool'

export function JsValidatorTool() {
  return (
    <SimpleIOTool
      toolId="js-validator"
      inputLabel="JavaScript to Validate"
      inputPlaceholder="Enter JavaScript code..."
      inputKey="code"
      executeLabel="Validate"
    />
  )
}
