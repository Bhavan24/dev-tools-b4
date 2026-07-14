'use client'
import { useState } from 'react'
import { useToolApi, ExecuteButton } from './base/tool-layout'

const COMMIT_TYPES = [
  { value: 'feat', label: 'feat - A new feature' },
  { value: 'fix', label: 'fix - A bug fix' },
  { value: 'docs', label: 'docs - Documentation only changes' },
  { value: 'style', label: 'style - Formatting, missing semi colons, etc.' },
  { value: 'refactor', label: 'refactor - A code change that neither fixes a bug nor adds a feature' },
  { value: 'perf', label: 'perf - A code change that improves performance' },
  { value: 'test', label: 'test - Adding missing tests' },
  { value: 'build', label: 'build - Changes to build system or external dependencies' },
  { value: 'ci', label: 'ci - Changes to CI configuration files and scripts' },
  { value: 'chore', label: 'chore - Other changes that do not modify src or test files' },
  { value: 'revert', label: 'revert - Reverts a previous commit' },
]

export function ConventionalCommitTool() {
  const [type, setType] = useState('feat')
  const [scope, setScope] = useState('')
  const [description, setDescription] = useState('')
  const [body, setBody] = useState('')
  const [breakingChange, setBreakingChange] = useState('')
  const [issueRefs, setIssueRefs] = useState('')
  const [result, setResult] = useState<{ message: string; subject: string; hasBody: boolean } | null>(null)
  const [copied, setCopied] = useState(false)
  const { loading, error, call } = useToolApi('conventional-commit-generator')

  const handleRun = async () => {
    const res = await call({ type, scope, description, body, breakingChange, issueRefs })
    if (res) setResult(res as { message: string; subject: string; hasBody: boolean })
  }

  const handleCopy = () => {
    if (result?.message) {
      navigator.clipboard.writeText(result.message)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // live preview
  const scopePart = scope.trim() ? `(${scope.trim()})` : ''
  const breakingMark = breakingChange.trim() ? '!' : ''
  const preview = description.trim() ? `${type}${scopePart}${breakingMark}: ${description.trim()}` : `${type}${scopePart}: ...`

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="input-base w-full">
            {COMMIT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Scope (optional)</label>
          <input
            type="text"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            placeholder="e.g. auth, api, ui"
            className="input-base w-full"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description of the change"
          className="input-base w-full"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium">Body (optional)</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Longer description of the change..."
          rows={3}
          className="input-base w-full"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Breaking Change (optional)</label>
          <input
            type="text"
            value={breakingChange}
            onChange={(e) => setBreakingChange(e.target.value)}
            placeholder="Description of breaking change"
            className="input-base w-full"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Issue References (optional)</label>
          <input
            type="text"
            value={issueRefs}
            onChange={(e) => setIssueRefs(e.target.value)}
            placeholder="Closes #123, Fixes #456"
            className="input-base w-full"
          />
        </div>
      </div>
      <div className="card-base p-3">
        <p className="text-xs text-muted-foreground mb-1">Live preview</p>
        <p className="font-mono text-sm">{preview}</p>
      </div>
      <ExecuteButton onClick={handleRun} loading={loading} label="Generate Commit Message" />
      {error && <p className="text-destructive text-sm">{error}</p>}
      {result && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Commit Message</label>
            <button onClick={handleCopy} className="btn-secondary text-sm">
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="bg-muted p-4 rounded text-sm font-mono whitespace-pre-wrap">{result.message}</pre>
        </div>
      )}
    </div>
  )
}
