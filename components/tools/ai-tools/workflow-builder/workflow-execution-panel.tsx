'use client'

import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Check,
} from 'lucide-react'
import type { ExecutionStep, ExecutionResult } from '@/lib/workflow-types'

interface WorkflowExecutionPanelProps {
  running: boolean
  result: ExecutionResult | null
  steps: ExecutionStep[]
}

export function WorkflowExecutionPanel({ running, result, steps }: WorkflowExecutionPanelProps) {
  const [open, setOpen] = useState(true)
  const [copied, setCopied] = useState(false)

  const hasActivity = running || steps.length > 0 || result !== null

  if (!hasActivity) return null

  const copyOutput = () => {
    const text =
      result?.output != null
        ? typeof result.output === 'string'
          ? result.output
          : JSON.stringify(result.output, null, 2)
        : ''
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="border-t border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {running ? (
            <Loader2 size={14} className="animate-spin text-yellow-500" />
          ) : result?.success === true ? (
            <CheckCircle2 size={14} className="text-green-500" />
          ) : result?.success === false ? (
            <XCircle size={14} className="text-red-500" />
          ) : (
            <Clock size={14} className="text-muted-foreground" />
          )}
          <span className="text-sm font-medium text-foreground">
            {running
              ? 'Executing workflow...'
              : result?.success === true
                ? 'Execution complete'
                : result?.success === false
                  ? 'Execution failed'
                  : 'Execution panel'}
          </span>
          <span className="text-xs text-muted-foreground">({steps.length} steps)</span>
        </div>
        {open ? (
          <ChevronDown size={14} className="text-muted-foreground" />
        ) : (
          <ChevronUp size={14} className="text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 max-h-60 overflow-y-auto">
          {/* Step list */}
          {steps.length > 0 && (
            <div className="space-y-1">
              {steps.map((step, i) => (
                <div key={`${step.nodeId}-${i}`} className="flex items-center gap-2 text-sm">
                  {step.status === 'running' ? (
                    <Loader2 size={12} className="animate-spin text-yellow-500 shrink-0" />
                  ) : step.status === 'done' ? (
                    <CheckCircle2 size={12} className="text-green-500 shrink-0" />
                  ) : step.status === 'error' ? (
                    <XCircle size={12} className="text-red-500 shrink-0" />
                  ) : (
                    <Clock size={12} className="text-muted-foreground shrink-0" />
                  )}
                  <span className="text-foreground">{step.nodeLabel}</span>
                  {step.error && (
                    <span className="text-red-500 text-xs truncate">{step.error}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Output */}
          {result?.output != null && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Output
                </p>
                <button
                  onClick={copyOutput}
                  className="flex items-center gap-1 text-xs btn-secondary px-2 py-1"
                >
                  {copied ? (
                    <>
                      <Check size={11} className="text-green-500" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={11} />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="bg-secondary rounded-lg p-3 font-mono text-xs whitespace-pre-wrap wrap-break-word max-h-32 overflow-auto">
                {typeof result.output === 'string'
                  ? result.output
                  : JSON.stringify(result.output, null, 2)}
              </div>
            </div>
          )}

          {/* Error */}
          {result?.error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-xs text-red-600">{result.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
