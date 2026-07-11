'use client'

import { useState } from 'react'
import { Loader2, AlertCircle, Copy, Check, RefreshCw } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type DiffRow =
  | { type: 'unchanged'; leftNum: number; rightNum: number; left: string; right: string }
  | { type: 'removed'; leftNum: number; rightNum: null; left: string; right: null }
  | { type: 'added'; leftNum: null; rightNum: number; left: null; right: string }

// Pair up consecutive removed+added into a "modified" group for inline char diff
type DisplayRow =
  | DiffRow
  | { type: 'modified'; leftNum: number; rightNum: number; left: string; right: string }

type CharPart = { text: string; changed: boolean }

// ─── LCS-based line diff ──────────────────────────────────────────────────────

function computeLineDiff(leftLines: string[], rightLines: string[]): DiffRow[] {
  const m = leftLines.length
  const n = rightLines.length

  // For large inputs use a simple forward-pass diff to keep it fast
  if (m * n > 200_000) {
    return simpleDiff(leftLines, rightLines)
  }

  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i]![j] =
        leftLines[i - 1] === rightLines[j - 1]
          ? dp[i - 1]![j - 1]! + 1
          : Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!)
    }
  }

  const rows: DiffRow[] = []
  let i = m
  let j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && leftLines[i - 1] === rightLines[j - 1]) {
      rows.unshift({
        type: 'unchanged',
        leftNum: i,
        rightNum: j,
        left: leftLines[i - 1]!,
        right: rightLines[j - 1]!,
      })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i]![j - 1]! >= dp[i - 1]![j]!)) {
      rows.unshift({ type: 'added', leftNum: null, rightNum: j, left: null, right: rightLines[j - 1]! })
      j--
    } else {
      rows.unshift({ type: 'removed', leftNum: i, rightNum: null, left: leftLines[i - 1]!, right: null })
      i--
    }
  }
  return rows
}

function simpleDiff(leftLines: string[], rightLines: string[]): DiffRow[] {
  const rows: DiffRow[] = []
  const max = Math.max(leftLines.length, rightLines.length)
  for (let i = 0; i < max; i++) {
    const l = leftLines[i]
    const r = rightLines[i]
    if (l !== undefined && r !== undefined) {
      if (l === r) {
        rows.push({ type: 'unchanged', leftNum: i + 1, rightNum: i + 1, left: l, right: r })
      } else {
        rows.push({ type: 'removed', leftNum: i + 1, rightNum: null, left: l, right: null })
        rows.push({ type: 'added', leftNum: null, rightNum: i + 1, left: null, right: r })
      }
    } else if (l !== undefined) {
      rows.push({ type: 'removed', leftNum: i + 1, rightNum: null, left: l, right: null })
    } else if (r !== undefined) {
      rows.push({ type: 'added', leftNum: null, rightNum: i + 1, left: null, right: r })
    }
  }
  return rows
}

// Merge consecutive removed+added pairs into "modified" rows
function pairModified(rows: DiffRow[]): DisplayRow[] {
  const out: DisplayRow[] = []
  let i = 0
  while (i < rows.length) {
    const cur = rows[i]!
    const next = rows[i + 1]
    if (cur.type === 'removed' && next?.type === 'added') {
      out.push({
        type: 'modified',
        leftNum: cur.leftNum,
        rightNum: next.rightNum!,
        left: cur.left,
        right: next.right!,
      })
      i += 2
    } else {
      out.push(cur)
      i++
    }
  }
  return out
}

// ─── Character-level diff ─────────────────────────────────────────────────────

function charDiff(a: string, b: string): { left: CharPart[]; right: CharPart[] } {
  const m = a.length
  const n = b.length
  // For very long lines fall back to marking whole line
  if (m * n > 40_000) {
    return {
      left: [{ text: a, changed: true }],
      right: [{ text: b, changed: true }],
    }
  }

  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i]![j] = a[i - 1] === b[j - 1] ? dp[i - 1]![j - 1]! + 1 : Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!)
    }
  }

  // Backtrack
  let i = m
  let j = n
  const leftParts: Array<{ ch: string; changed: boolean }> = []
  const rightParts: Array<{ ch: string; changed: boolean }> = []

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      leftParts.unshift({ ch: a[i - 1]!, changed: false })
      rightParts.unshift({ ch: b[j - 1]!, changed: false })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i]![j - 1]! >= dp[i - 1]![j]!)) {
      rightParts.unshift({ ch: b[j - 1]!, changed: true })
      j--
    } else {
      leftParts.unshift({ ch: a[i - 1]!, changed: true })
      i--
    }
  }

  // Merge consecutive same-changed segments
  const merge = (parts: Array<{ ch: string; changed: boolean }>): CharPart[] => {
    const out: CharPart[] = []
    for (const part of parts) {
      const last = out[out.length - 1]
      if (last && last.changed === part.changed) {
        last.text += part.ch
      } else {
        out.push({ text: part.ch, changed: part.changed })
      }
    }
    return out
  }

  return { left: merge(leftParts), right: merge(rightParts) }
}

// ─── Stats ────────────────────────────────────────────────────────────────────

interface DiffStats {
  unchanged: number
  removed: number
  added: number
  modified: number
  similarity: number
}

function computeStats(rows: DisplayRow[]): DiffStats {
  let unchanged = 0, removed = 0, added = 0, modified = 0
  for (const row of rows) {
    if (row.type === 'unchanged') unchanged++
    else if (row.type === 'removed') removed++
    else if (row.type === 'added') added++
    else if (row.type === 'modified') modified++
  }
  const total = unchanged + removed + added + modified
  const similarity = total === 0 ? 100 : Math.round((unchanged / total) * 100)
  return { unchanged, removed, added, modified, similarity }
}

// ─── Rendering helpers ────────────────────────────────────────────────────────

function renderCharParts(parts: CharPart[], side: 'left' | 'right') {
  return parts.map((p, i) =>
    p.changed ? (
      <mark
        key={i}
        className={`rounded-sm font-mono ${
          side === 'left'
            ? 'bg-red-400/40 dark:bg-red-500/40'
            : 'bg-green-400/40 dark:bg-green-500/40'
        }`}
      >
        {p.text}
      </mark>
    ) : (
      <span key={i}>{p.text}</span>
    )
  )
}

const LINE_NUM_CLS = 'w-10 shrink-0 text-right pr-3 text-muted-foreground/50 select-none font-mono text-xs'

function LineNum({ n }: { n: number | null }) {
  return <span className={LINE_NUM_CLS}>{n ?? ''}</span>
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DiffCheckerTool() {
  const [left, setLeft] = useState('')
  const [right, setRight] = useState('')
  const [rows, setRows] = useState<DisplayRow[] | null>(null)
  const [stats, setStats] = useState<DiffStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<'left' | 'right' | null>(null)
  const [showUnchanged, setShowUnchanged] = useState(true)

  const handleCompare = () => {
    if (!left && !right) return
    setLoading(true)
    setError('')
    try {
      const leftLines = left.split('\n')
      const rightLines = right.split('\n')
      const diffRows = computeLineDiff(leftLines, rightLines)
      const display = pairModified(diffRows)
      setRows(display)
      setStats(computeStats(display))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Comparison failed')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (side: 'left' | 'right') => {
    navigator.clipboard.writeText(side === 'left' ? left : right)
    setCopied(side)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleClear = () => {
    setLeft('')
    setRight('')
    setRows(null)
    setStats(null)
    setError('')
  }

  const visibleRows = rows
    ? showUnchanged
      ? rows
      : rows.filter((r) => r.type !== 'unchanged')
    : []

  return (
    <div className="space-y-4 w-full">
      {/* Input panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block font-medium text-foreground text-sm">Original</label>
            <button
              onClick={() => handleCopy('left')}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied === 'left' ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
              Copy
            </button>
          </div>
          <textarea
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            placeholder="Paste the original text here..."
            className="input-base h-48 font-mono text-sm resize-none w-full"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block font-medium text-foreground text-sm">Modified</label>
            <button
              onClick={() => handleCopy('right')}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied === 'right' ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
              Copy
            </button>
          </div>
          <textarea
            value={right}
            onChange={(e) => setRight(e.target.value)}
            placeholder="Paste the modified text here..."
            className="input-base h-48 font-mono text-sm resize-none w-full"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleCompare}
          disabled={loading || (!left && !right)}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Comparing...
            </>
          ) : (
            'Compare'
          )}
        </button>
        {rows && (
          <button onClick={handleClear} className="btn-secondary flex items-center gap-2 px-4">
            <RefreshCw size={14} />
            Clear
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
          <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Stats bar */}
      {stats && (
        <div className="flex flex-wrap gap-3 items-center bg-secondary rounded-lg px-4 py-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-sm font-semibold text-foreground">{stats.similarity}%</span>
            <span className="text-xs text-muted-foreground">similar</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-muted-foreground" />
            <span className="text-sm text-foreground">{stats.unchanged}</span>
            <span className="text-xs text-muted-foreground">unchanged</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-sm text-foreground">{stats.removed}</span>
            <span className="text-xs text-muted-foreground">removed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm text-foreground">{stats.added}</span>
            <span className="text-xs text-muted-foreground">added</span>
          </div>
          {stats.modified > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-sm text-foreground">{stats.modified}</span>
              <span className="text-xs text-muted-foreground">modified</span>
            </div>
          )}
          <div className="ml-auto">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showUnchanged}
                onChange={(e) => setShowUnchanged(e.target.checked)}
                className="w-3.5 h-3.5 cursor-pointer"
              />
              <span className="text-xs text-muted-foreground">Show unchanged</span>
            </label>
          </div>
        </div>
      )}

      {/* Side-by-side diff */}
      {rows && visibleRows.length === 0 && (
        <div className="bg-secondary rounded-lg p-6 text-center text-muted-foreground text-sm">
          {rows.length === 0 ? 'No differences found - texts are identical.' : 'All lines are unchanged. Toggle "Show unchanged" to see them.'}
        </div>
      )}

      {visibleRows.length > 0 && (
        <div className="rounded-lg border border-border overflow-hidden">
          {/* Column headers */}
          <div className="grid grid-cols-2 border-b border-border bg-secondary/50">
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground border-r border-border flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
              Original
            </div>
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              Modified
            </div>
          </div>

          {/* Diff rows */}
          <div className="overflow-auto max-h-[600px] font-mono text-xs leading-5">
            {visibleRows.map((row, idx) => {
              if (row.type === 'unchanged') {
                return (
                  <div key={idx} className="grid grid-cols-2 border-b border-border/40 last:border-0">
                    <div className="flex items-start px-1 py-0.5 border-r border-border/40">
                      <LineNum n={row.leftNum} />
                      <span className="text-foreground/70 whitespace-pre wrap-break-word min-w-0">{row.left || ' '}</span>
                    </div>
                    <div className="flex items-start px-1 py-0.5">
                      <LineNum n={row.rightNum} />
                      <span className="text-foreground/70 whitespace-pre wrap-break-word min-w-0">{row.right || ' '}</span>
                    </div>
                  </div>
                )
              }

              if (row.type === 'removed') {
                return (
                  <div key={idx} className="grid grid-cols-2 border-b border-border/40 last:border-0 bg-red-500/5">
                    <div className="flex items-start px-1 py-0.5 border-r border-border/40 bg-red-500/10">
                      <LineNum n={row.leftNum} />
                      <span className="text-red-700 dark:text-red-400 whitespace-pre wrap-break-word min-w-0">
                        <span className="select-none text-red-400 mr-1">-</span>
                        {row.left || ' '}
                      </span>
                    </div>
                    <div className="flex items-start px-1 py-0.5">
                      <LineNum n={null} />
                      <span className="text-muted-foreground/30 select-none">·</span>
                    </div>
                  </div>
                )
              }

              if (row.type === 'added') {
                return (
                  <div key={idx} className="grid grid-cols-2 border-b border-border/40 last:border-0 bg-green-500/5">
                    <div className="flex items-start px-1 py-0.5 border-r border-border/40">
                      <LineNum n={null} />
                      <span className="text-muted-foreground/30 select-none">·</span>
                    </div>
                    <div className="flex items-start px-1 py-0.5 bg-green-500/10">
                      <LineNum n={row.rightNum} />
                      <span className="text-green-700 dark:text-green-400 whitespace-pre wrap-break-word min-w-0">
                        <span className="select-none text-green-400 mr-1">+</span>
                        {row.right || ' '}
                      </span>
                    </div>
                  </div>
                )
              }

              // modified - show char-level diff
              const { left: leftParts, right: rightParts } = charDiff(row.left, row.right)
              return (
                <div key={idx} className="grid grid-cols-2 border-b border-border/40 last:border-0">
                  <div className="flex items-start px-1 py-0.5 border-r border-border/40 bg-red-500/10">
                    <LineNum n={row.leftNum} />
                    <span className="text-red-700 dark:text-red-400 whitespace-pre wrap-break-word min-w-0">
                      <span className="select-none text-red-400 mr-1">-</span>
                      {renderCharParts(leftParts, 'left')}
                    </span>
                  </div>
                  <div className="flex items-start px-1 py-0.5 bg-green-500/10">
                    <LineNum n={row.rightNum} />
                    <span className="text-green-700 dark:text-green-400 whitespace-pre wrap-break-word min-w-0">
                      <span className="select-none text-green-400 mr-1">+</span>
                      {renderCharParts(rightParts, 'right')}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
