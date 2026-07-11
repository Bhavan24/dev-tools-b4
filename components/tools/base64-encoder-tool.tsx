'use client'

import { SimpleIOTool } from './base/simple-io-tool'

export function Base64EncoderTool() {
  return (
    <SimpleIOTool
      toolId="base64-encoder"
      inputLabel="Text to Encode"
      inputPlaceholder="Enter text to encode to Base64..."
      inputKey="text"
      executeLabel="Encode"
    />
  )
}
