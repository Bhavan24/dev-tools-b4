'use client'

import { X } from 'lucide-react'
import type { WorkflowNode, NodeData, NodeType } from '@/lib/workflow-types'
import { TOOLS } from '@/lib/constants'

interface NodeConfigPanelProps {
  node: WorkflowNode | null
  onUpdate: (nodeId: string, data: Partial<NodeData>) => void
  onClose: () => void
}

export function NodeConfigPanel({ node, onUpdate, onClose }: NodeConfigPanelProps) {
  if (!node) return null

  const d = node.data
  const update = (patch: Partial<NodeData>) => onUpdate(node.id, patch)

  return (
    <div className="w-72 shrink-0 border-l border-border bg-card flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary">
        <span className="text-sm font-semibold text-foreground">Configure Node</span>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Label (all node types) */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
            Label
          </label>
          <input
            type="text"
            value={d.label}
            onChange={(e) => update({ label: e.target.value } as any)}
            className="input-base text-sm"
          />
        </div>

        {d.type === 'input' && (
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
              Description
            </label>
            <textarea
              value={(d as any).description || ''}
              onChange={(e) => update({ description: e.target.value } as any)}
              placeholder="What data does this workflow expect?"
              className="input-base text-sm h-20 resize-none"
            />
          </div>
        )}

        {d.type === 'output' && (
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
              Format
            </label>
            <select
              value={(d as any).format}
              onChange={(e) => update({ format: e.target.value } as any)}
              className="input-base text-sm"
            >
              <option value="text">Text</option>
              <option value="json">JSON</option>
            </select>
          </div>
        )}

        {d.type === 'llm-call' && (
          <>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                System Prompt
              </label>
              <textarea
                value={(d as any).systemPrompt}
                onChange={(e) => update({ systemPrompt: e.target.value } as any)}
                className="input-base text-sm h-24 resize-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                User Prompt Template
              </label>
              <p className="text-xs text-muted-foreground mb-1">
                Use {`{{varName}}`} for variables
              </p>
              <textarea
                value={(d as any).userPromptTemplate}
                onChange={(e) => update({ userPromptTemplate: e.target.value } as any)}
                className="input-base text-sm h-24 resize-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                Output Variable
              </label>
              <input
                type="text"
                value={(d as any).outputVariable}
                onChange={(e) => update({ outputVariable: e.target.value } as any)}
                className="input-base text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                Model Override <span className="normal-case font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={(d as any).modelOverride || ''}
                onChange={(e) => update({ modelOverride: e.target.value || undefined } as any)}
                placeholder="Leave blank to use global model"
                className="input-base text-sm font-mono"
              />
            </div>
          </>
        )}

        {d.type === 'conditional' && (
          <>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                Decision Mode
              </label>
              <select
                value={(d as any).mode}
                onChange={(e) => update({ mode: e.target.value } as any)}
                className="input-base text-sm"
              >
                <option value="js">JavaScript expression (client only)</option>
                <option value="llm">Ask the LLM</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                {(d as any).mode === 'llm' ? 'LLM Question' : 'JS Expression'}
              </label>
              <textarea
                value={(d as any).condition}
                onChange={(e) => update({ condition: e.target.value } as any)}
                placeholder={
                  (d as any).mode === 'llm' ? 'Is the input about technology?' : 'input.length > 10'
                }
                className="input-base text-sm h-20 resize-none font-mono"
              />
              {(d as any).mode === 'js' && (
                <p className="text-xs text-amber-600 mt-1">
                  JS mode runs in browser only. Use LLM mode for MCP execution.
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                Input Variable
              </label>
              <input
                type="text"
                value={(d as any).inputVariable}
                onChange={(e) => update({ inputVariable: e.target.value } as any)}
                className="input-base text-sm font-mono"
              />
            </div>
          </>
        )}

        {d.type === 'loop' && (
          <>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                Iterate Over Variable
              </label>
              <input
                type="text"
                value={(d as any).iterateOver}
                onChange={(e) => update({ iterateOver: e.target.value } as any)}
                className="input-base text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                Item Variable Name
              </label>
              <input
                type="text"
                value={(d as any).itemVariable}
                onChange={(e) => update({ itemVariable: e.target.value } as any)}
                className="input-base text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                Max Iterations
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={(d as any).maxIterations}
                onChange={(e) =>
                  update({ maxIterations: Math.max(1, parseInt(e.target.value) || 1) } as any)
                }
                className="input-base text-sm"
              />
            </div>
          </>
        )}

        {d.type === 'tool-call' && (
          <>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                Tool
              </label>
              <select
                value={(d as any).toolId}
                onChange={(e) => update({ toolId: e.target.value } as any)}
                className="input-base text-sm"
              >
                <option value="">Select a tool...</option>
                {TOOLS.filter((t) => !('comingSoon' in t && t.comingSoon)).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                Output Variable
              </label>
              <input
                type="text"
                value={(d as any).outputVariable}
                onChange={(e) => update({ outputVariable: e.target.value } as any)}
                className="input-base text-sm font-mono"
              />
            </div>
          </>
        )}

        {d.type === 'transform' && (
          <>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                JavaScript Code
              </label>
              <p className="text-xs text-muted-foreground mb-1">
                Receives <code className="font-mono">input</code> (all workflow variables). Must{' '}
                <code className="font-mono">return</code> a value.
              </p>
              <p className="text-xs text-amber-600 mb-2">
                Runs in browser only. Disabled for MCP execution.
              </p>
              <textarea
                value={(d as any).code}
                onChange={(e) => update({ code: e.target.value } as any)}
                className="input-base text-sm h-32 resize-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                Output Variable
              </label>
              <input
                type="text"
                value={(d as any).outputVariable}
                onChange={(e) => update({ outputVariable: e.target.value } as any)}
                className="input-base text-sm font-mono"
              />
            </div>
          </>
        )}

        {d.type === 'merge' && (
          <>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                Merge Strategy
              </label>
              <select
                value={(d as any).strategy}
                onChange={(e) => update({ strategy: e.target.value } as any)}
                className="input-base text-sm"
              >
                <option value="object">Object (keyed by source node ID)</option>
                <option value="concat">Concat (flatten arrays)</option>
                <option value="first">First (take first input)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                Output Variable
              </label>
              <input
                type="text"
                value={(d as any).outputVariable}
                onChange={(e) => update({ outputVariable: e.target.value } as any)}
                className="input-base text-sm font-mono"
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
