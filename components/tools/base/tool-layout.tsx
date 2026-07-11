'use client'

import { Loader2, AlertCircle, Copy, Check } from 'lucide-react'
import { useState } from 'react'

// ─── Shared primitives ─────────────────────────────────────────────────────────

export function useToolApi(toolId: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const call = async (body: Record<string, unknown>) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/tools/${toolId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Tool execution failed')
      }
      const data = await res.json()
      return data.result
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred'
      setError(msg)
      return null
    } finally {
      setLoading(false)
    }
  }

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return { loading, error, setError, copied, call, copy }
}

// ─── Two-column Input/Output shell ────────────────────────────────────────────

interface ToolShellProps {
  left: React.ReactNode
  right: React.ReactNode
}

export function ToolShell({ left, right }: ToolShellProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">{left}</div>
      <div className="space-y-4">{right}</div>
    </div>
  )
}

// ─── Reusable output panel ────────────────────────────────────────────────────

interface OutputPanelProps {
  result: unknown
  error: string
  copied: boolean
  onCopy: () => void
  emptyLabel?: string
  height?: string
}

export function OutputPanel({
  result,
  error,
  copied,
  onCopy,
  emptyLabel = 'Results will appear here',
  height = 'h-96',
}: OutputPanelProps) {
  return (
    <>
      <label className="block font-medium text-foreground mb-3">Output</label>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {result !== null &&
        result !== undefined &&
        typeof result === 'object' &&
        !Array.isArray(result) && (
          <div className="mb-4 space-y-2 max-h-64 overflow-auto">
            {Object.entries(result as Record<string, unknown>).map(([key, val]) => (
              <div
                key={key}
                className="bg-secondary rounded-lg p-3 flex justify-between items-center text-sm"
              >
                <div>
                  <p className="text-xs text-muted-foreground capitalize font-medium">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="font-mono text-sm mt-1 break-all">{String(val)}</p>
                </div>
                <CopyButton text={String(val)} copied={copied} onCopy={onCopy} />
              </div>
            ))}
          </div>
        )}

      {result !== null &&
        result !== undefined &&
        (typeof result === 'string' || Array.isArray(result)) && (
          <div className="bg-secondary rounded-lg p-4 font-mono text-sm mb-4 max-h-96 overflow-auto">
            <pre className="whitespace-pre-wrap break-word">
              {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

      {(result === null || result === undefined) && !error && (
        <div
          className={`bg-secondary rounded-lg p-4 ${height} flex items-center justify-center text-muted-foreground`}
        >
          {emptyLabel}
        </div>
      )}

      {result !== null && result !== undefined && (
        <button
          onClick={onCopy}
          className="btn-secondary w-full flex items-center justify-center gap-2"
        >
          {copied ? (
            <>
              <Check size={18} className="text-green-500" />
              Copied
            </>
          ) : (
            <>
              <Copy size={18} />
              Copy Result
            </>
          )}
        </button>
      )}
    </>
  )
}

// ─── Execute button ────────────────────────────────────────────────────────────

interface ExecuteButtonProps {
  onClick: () => void
  loading: boolean
  label?: string
  loadingLabel?: string
  disabled?: boolean
}

export function ExecuteButton({
  onClick,
  loading,
  label = 'Execute',
  loadingLabel = 'Processing...',
  disabled = false,
}: ExecuteButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className="btn-primary w-full flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          {loadingLabel}
        </>
      ) : (
        label
      )}
    </button>
  )
}

// ─── Copy icon button ──────────────────────────────────────────────────────────

interface CopyButtonProps {
  text: string
  copied: boolean
  onCopy: (text: string) => void
  size?: number
}

export function CopyButton({ text, copied, onCopy, size = 16 }: CopyButtonProps) {
  return (
    <button
      onClick={() => onCopy(text)}
      className="p-2 hover:bg-primary/10 rounded transition-colors shrink-0 ml-2"
    >
      {copied ? <Check size={size} className="text-green-500" /> : <Copy size={size} />}
    </button>
  )
}

// ─── Textarea input ────────────────────────────────────────────────────────────

interface TextareaInputProps {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  height?: string
}

export function TextareaInput({
  label,
  value,
  onChange,
  placeholder = 'Enter input here...',
  height = 'h-96',
}: TextareaInputProps) {
  return (
    <div>
      <label className="block font-medium text-foreground mb-3">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`input-base ${height} font-mono text-sm mb-4 resize-none`}
      />
    </div>
  )
}

// ─── Error message inline ──────────────────────────────────────────────────────

export function InlineError({ message }: { message: string }) {
  if (!message) return null
  return (
    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
      <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
      <p className="text-sm text-red-600">{message}</p>
    </div>
  )
}
