'use client'

import { SimpleIOTool } from './base/simple-io-tool'

export function HtmlBeautifierTool() {
  return (
    <SimpleIOTool
      toolId="html-beautifier"
      inputLabel="HTML to Beautify"
      inputPlaceholder="Enter HTML code..."
      inputKey="html"
      executeLabel="Beautify"
    />
  )
}
