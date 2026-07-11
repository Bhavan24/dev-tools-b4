'use client'

import { SimpleIOTool } from './base/simple-io-tool'

export function Base64DecoderTool() {
  return (
    <SimpleIOTool
      toolId="base64-decoder"
      inputLabel="Base64 to Decode"
      inputPlaceholder="Enter Base64 string to decode..."
      inputKey="base64"
      executeLabel="Decode"
    />
  )
}
