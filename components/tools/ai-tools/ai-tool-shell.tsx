'use client'

import { useState, useRef } from 'react'
import { Loader2, AlertCircle, Copy, Check, ChevronDown, ChevronUp, Eye } from 'lucide-react'
import { ProviderConfigSection, DEFAULT_PROVIDER_CONFIG, buildRequestBody } from './provider-config'
import { AI_SYSTEM_PROMPTS } from '@/lib/ai-tool-handlers'
import type { ProviderConfig } from './provider-config'

interface AIToolShellProps {
  toolId: string
  inputLabel: string
  inputPlaceholder: string
  inputType?: 'textarea' | 'code'
  extraFields?: React.ReactNode
  buildToolFields: (input: string) => Record<string, any>
  systemPromptKey: keyof typeof AI_SYSTEM_PROMPTS
  submitLabel?: string
}

export function AIToolShell({
  toolId,
  inputLabel,
  inputPlaceholder,
  inputType = 'textarea',
  extraFields,
  buildToolFields,
  systemPromptKey,
  submitLabel = 'Generate',
}: AIToolShellProps) {
  const [providerConfig, setProviderConfig] = useState<ProviderConfig>(DEFAULT_PROVIDER_CONFIG)
  const [input, setInput] = useState('')
  const [customSystemPrompt, setCustomSystemPrompt] = useState('')
  const [showSystemPrompt, setShowSystemPrompt] = useState(false)
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)

  const defaultSystemPrompt = AI_SYSTEM_PROMPTS[systemPromptKey]
  const effectiveSystemPrompt = customSystemPrompt.trim() || defaultSystemPrompt

  const isConfigured =
    (providerConfig.provider !== '' &&
      providerConfig.modelId !== '' &&
      Object.values(providerConfig.credentials).some((v) => v.trim() !== '')) ||
    providerConfig.provider === 'ollama'

  const handleSubmit = async () => {
    if (!isConfigured) {
      setError('Please configure an AI provider before running.')
      return
    }
    if (!input.trim()) {
      setError('Input cannot be empty.')
      return
    }

    setLoading(true)
    setError('')
    setResult('')

    const toolFields = {
      ...buildToolFields(input),
      systemPrompt: effectiveSystemPrompt,
    }
    const body = buildRequestBody(providerConfig, toolFields)

    try {
      const response = await fetch(`/api/tools/ai/${toolId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'AI tool execution failed')
      }

      if (providerConfig.streaming && response.body) {
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let accumulated = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          accumulated += decoder.decode(value, { stream: true })
          setResult(accumulated)
        }
      } else {
        const data = await response.json()
        const text = data.result?.result ?? data.result ?? ''
        setResult(typeof text === 'string' ? text : JSON.stringify(text, null, 2))
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setResult('')
    } finally {
      setLoading(false)
    }
  }

  const copyResult = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Provider configuration */}
      <ProviderConfigSection value={providerConfig} onChange={setProviderConfig} />

      {/* System prompt viewer / editor */}
      <div className="border border-border rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowSystemPrompt((s) => !s)}
          className="w-full flex items-center justify-between px-5 py-3 bg-secondary hover:bg-secondary/80 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Eye size={14} className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">System Prompt</span>
            {customSystemPrompt.trim() && (
              <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">
                Custom
              </span>
            )}
          </div>
          {showSystemPrompt ? (
            <ChevronUp size={14} className="text-muted-foreground" />
          ) : (
            <ChevronDown size={14} className="text-muted-foreground" />
          )}
        </button>

        {showSystemPrompt && (
          <div className="p-4 border-t border-border bg-card space-y-2">
            <p className="text-xs text-muted-foreground">
              Default system prompt (read-only). Add custom instructions below to extend it.
            </p>
            <div className="bg-secondary rounded-lg p-3 font-mono text-xs text-muted-foreground whitespace-pre-wrap max-h-32 overflow-auto">
              {defaultSystemPrompt}
            </div>
            <label className="block text-sm font-medium text-foreground mt-3">
              Custom instructions (appended to default)
            </label>
            <textarea
              value={customSystemPrompt}
              onChange={(e) => setCustomSystemPrompt(e.target.value)}
              placeholder="Add any extra instructions for the model..."
              className="input-base h-24 font-mono text-xs resize-none"
            />
          </div>
        )}
      </div>

      {/* Tool-specific extra fields */}
      {extraFields}

      {/* Main input */}
      <div>
        <label className="block font-medium text-foreground mb-2">{inputLabel}</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={inputPlaceholder}
          className={`input-base resize-none ${inputType === 'code' ? 'font-mono text-sm h-72' : 'h-48'}`}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2 py-3"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            {providerConfig.streaming ? 'Streaming...' : 'Generating...'}
          </>
        ) : (
          submitLabel
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Output */}
      {result ? (
        <div className="space-y-3" ref={resultRef}>
          <div className="flex items-center justify-between">
            <label className="font-medium text-foreground">Output</label>
            <button
              onClick={copyResult}
              className="flex items-center gap-1.5 text-sm btn-secondary px-3 py-1.5"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-green-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="bg-secondary rounded-xl p-5 font-mono text-sm whitespace-pre-wrap wrap-break-word max-h-[600px] overflow-auto leading-relaxed">
            {result}
          </div>
        </div>
      ) : (
        !error && (
          <div className="bg-secondary rounded-xl p-5 h-40 flex items-center justify-center text-muted-foreground text-sm">
            Output will appear here
          </div>
        )
      )}
    </div>
  )
}
