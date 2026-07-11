'use client'

import { useState } from 'react'
import { ToolShell, OutputPanel, TextareaInput, ExecuteButton, useToolApi } from './tool-layout'

/**
 * Generic single-input / single-output tool.
 * Covers tools that take one textarea of text and call the API with a named input key.
 */
interface SimpleIOToolProps {
  toolId: string
  inputLabel?: string
  inputPlaceholder?: string
  inputKey?: string
  executeLabel?: string
  extraBody?: Record<string, unknown>
}

export function SimpleIOTool({
  toolId,
  inputLabel = 'Input',
  inputPlaceholder = 'Enter input here...',
  inputKey = 'input',
  executeLabel = 'Execute',
  extraBody = {},
}: SimpleIOToolProps) {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<unknown>(null)
  const { loading, error, copied, call, copy } = useToolApi(toolId)

  const handleExecute = async () => {
    const res = await call({ [inputKey]: input, ...extraBody })
    if (res !== null) setResult(res)
  }

  const handleCopy = () => {
    if (result === null || result === undefined) return
    copy(typeof result === 'string' ? result : JSON.stringify(result, null, 2))
  }

  return (
    <ToolShell
      left={
        <>
          <TextareaInput
            label={inputLabel}
            value={input}
            onChange={setInput}
            placeholder={inputPlaceholder}
          />
          <ExecuteButton onClick={handleExecute} loading={loading} label={executeLabel} />
        </>
      }
      right={
        <OutputPanel result={result} error={error} copied={copied} onCopy={handleCopy} />
      }
    />
  )
}
