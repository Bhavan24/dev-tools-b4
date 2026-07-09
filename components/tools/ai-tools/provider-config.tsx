'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Settings } from 'lucide-react'
import { AI_PROVIDERS } from '@/lib/ai-providers'
import { ModelCombobox } from './model-combobox'
import type { ProviderDefinition } from '@/lib/ai-providers'

export type ProviderConfig = {
  provider: string
  modelId: string
  streaming: boolean
  credentials: Record<string, string>
}

interface ProviderConfigProps {
  value: ProviderConfig
  onChange: (config: ProviderConfig) => void
}

export function ProviderConfigSection({ value, onChange }: ProviderConfigProps) {
  const [open, setOpen] = useState(false)

  const selectedProvider: ProviderDefinition | undefined = AI_PROVIDERS.find(
    (p) => p.id === value.provider
  )

  const handleProviderChange = (providerId: string) => {
    const def = AI_PROVIDERS.find((p) => p.id === providerId)
    onChange({
      provider: providerId,
      modelId: def?.defaultModels[0] || '',
      streaming: value.streaming,
      credentials: {},
    })
  }

  const handleCredentialChange = (key: string, val: string) => {
    onChange({
      ...value,
      credentials: { ...value.credentials, [key]: val },
    })
  }

  const isConfigured =
    selectedProvider !== undefined &&
    selectedProvider.credentialFields.every(
      (f) => value.credentials[f.key] && value.credentials[f.key].trim() !== ''
    ) &&
    value.modelId.trim() !== ''

  return (
    <div className="border border-border rounded-xl mb-6 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-secondary hover:bg-secondary/80 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Settings size={16} className="text-muted-foreground" />
          <span className="font-medium text-sm text-foreground">AI Provider Configuration</span>
          {isConfigured ? (
            <span className="text-xs text-green-600 font-medium bg-green-500/10 px-2 py-0.5 rounded-full">
              {selectedProvider?.name} - {value.modelId}
            </span>
          ) : (
            <span className="text-xs text-amber-600 font-medium bg-amber-500/10 px-2 py-0.5 rounded-full">
              Not configured
            </span>
          )}
        </div>
        {open ? (
          <ChevronUp size={16} className="text-muted-foreground" />
        ) : (
          <ChevronDown size={16} className="text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="p-5 space-y-4 border-t border-border bg-card">
          {/* Provider select */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Provider</label>
            <select
              value={value.provider}
              onChange={(e) => handleProviderChange(e.target.value)}
              className="input-base"
            >
              <option value="">Select a provider...</option>
              {AI_PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Credential fields */}
          {selectedProvider && (
            <>
              {selectedProvider.credentialFields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={value.credentials[field.key] || ''}
                    onChange={(e) => handleCredentialChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="input-base font-mono text-sm"
                    autoComplete="off"
                  />
                </div>
              ))}

              {/* Model ID */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Model
                  <span className="ml-1 text-xs text-muted-foreground font-normal">
                    (type any model ID or pick from list)
                  </span>
                </label>
                <ModelCombobox
                  value={value.modelId}
                  onChange={(modelId) => onChange({ ...value, modelId })}
                  suggestions={selectedProvider.defaultModels}
                />
              </div>

              {/* Streaming toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="streaming-toggle"
                  checked={value.streaming}
                  onChange={(e) => onChange({ ...value, streaming: e.target.checked })}
                  className="w-4 h-4 rounded border-border cursor-pointer"
                />
                <label
                  htmlFor="streaming-toggle"
                  className="text-sm font-medium text-foreground cursor-pointer"
                >
                  Stream response (token by token)
                </label>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export const DEFAULT_PROVIDER_CONFIG: ProviderConfig = {
  provider: '',
  modelId: '',
  streaming: false,
  credentials: {},
}

export function buildRequestBody(
  providerConfig: ProviderConfig,
  toolFields: Record<string, any>
): Record<string, any> {
  return {
    ...toolFields,
    provider: providerConfig.provider,
    modelId: providerConfig.modelId,
    streaming: providerConfig.streaming,
    ...providerConfig.credentials,
  }
}
