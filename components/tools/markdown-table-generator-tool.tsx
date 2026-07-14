'use client'
import { useState, useCallback } from 'react'
import { Plus, Trash2, Copy, Check, ArrowLeft, ArrowRight } from 'lucide-react'

function generateTable(
  headers: string[],
  rows: string[][],
  alignment: string
): string {
  const sep = { left: ':---', center: ':---:', right: '---:', none: '---' }[alignment] ?? '---'
  const escape = (s: string) => s.replace(/\|/g, '\\|')

  const colWidths = headers.map((h, i) => {
    const maxRow = rows.reduce((m, r) => Math.max(m, (r[i] ?? '').length), 0)
    return Math.max(h.length, sep.length, maxRow)
  })

  const pad = (s: string, w: number) => escape(s).padEnd(w)
  const sepCell = (w: number) => {
    if (alignment === 'center') return ':' + '-'.repeat(w - 2) + ':'
    if (alignment === 'left') return ':' + '-'.repeat(w - 1)
    if (alignment === 'right') return '-'.repeat(w - 1) + ':'
    return '-'.repeat(w)
  }

  const headerLine = '| ' + headers.map((h, i) => pad(h, colWidths[i]!)).join(' | ') + ' |'
  const sepLine = '| ' + colWidths.map((w) => sepCell(w)).join(' | ') + ' |'
  const dataLines = rows.map((row) =>
    '| ' + headers.map((_, i) => pad(row[i] ?? '', colWidths[i]!)).join(' | ') + ' |'
  )

  return [headerLine, sepLine, ...dataLines].join('\n')
}

export function MarkdownTableGeneratorTool() {
  const [headers, setHeaders] = useState(['Column 1', 'Column 2', 'Column 3'])
  const [rows, setRows] = useState([
    ['Cell A1', 'Cell A2', 'Cell A3'],
    ['Cell B1', 'Cell B2', 'Cell B3'],
  ])
  const [alignment, setAlignment] = useState('none')
  const [copied, setCopied] = useState(false)

  const table = generateTable(headers, rows, alignment)

  const setHeader = (i: number, val: string) =>
    setHeaders((prev) => prev.map((h, j) => (j === i ? val : h)))

  const setCell = (r: number, c: number, val: string) =>
    setRows((prev) => prev.map((row, ri) => (ri === r ? row.map((cell, ci) => (ci === c ? val : cell)) : row)))

  const addColumn = () => {
    setHeaders((prev) => [...prev, `Column ${prev.length + 1}`])
    setRows((prev) => prev.map((row) => [...row, '']))
  }

  const removeColumn = (i: number) => {
    if (headers.length <= 1) return
    setHeaders((prev) => prev.filter((_, j) => j !== i))
    setRows((prev) => prev.map((row) => row.filter((_, j) => j !== i)))
  }

  const moveColumn = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= headers.length) return
    setHeaders((prev) => {
      const next = [...prev]
      ;[next[i]!, next[j]!] = [next[j]!, next[i]!]
      return next
    })
    setRows((prev) =>
      prev.map((row) => {
        const next = [...row]
        ;[next[i]!, next[j]!] = [next[j]!, next[i]!]
        return next
      })
    )
  }

  const addRow = () => setRows((prev) => [...prev, Array(headers.length).fill('')])

  const removeRow = (i: number) => setRows((prev) => prev.filter((_, j) => j !== i))

  const copy = () => {
    navigator.clipboard.writeText(table)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Alignment:</label>
          <select
            value={alignment}
            onChange={(e) => setAlignment(e.target.value)}
            className="input-base text-sm py-1.5 px-3"
          >
            <option value="none">Default</option>
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
        <button onClick={addColumn} className="btn-secondary text-sm flex items-center gap-1.5">
          <Plus size={14} /> Add Column
        </button>
        <button onClick={addRow} className="btn-secondary text-sm flex items-center gap-1.5">
          <Plus size={14} /> Add Row
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="border border-border p-1 bg-muted min-w-[120px]">
                  <input
                    value={h}
                    onChange={(e) => setHeader(i, e.target.value)}
                    className="w-full bg-transparent font-semibold text-center outline-none px-1"
                  />
                  <div className="flex justify-center gap-1 mt-1">
                    <button
                      onClick={() => moveColumn(i, -1)}
                      disabled={i === 0}
                      className="p-0.5 rounded hover:bg-primary/10 disabled:opacity-30"
                    >
                      <ArrowLeft size={11} />
                    </button>
                    <button
                      onClick={() => moveColumn(i, 1)}
                      disabled={i === headers.length - 1}
                      className="p-0.5 rounded hover:bg-primary/10 disabled:opacity-30"
                    >
                      <ArrowRight size={11} />
                    </button>
                    <button
                      onClick={() => removeColumn(i)}
                      disabled={headers.length <= 1}
                      className="p-0.5 rounded hover:bg-red-500/15 text-red-500 disabled:opacity-30"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </th>
              ))}
              <th className="border border-border p-1 bg-muted w-8" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} className="border border-border p-1">
                    <input
                      value={cell}
                      onChange={(e) => setCell(ri, ci, e.target.value)}
                      className="w-full bg-transparent outline-none px-1 text-center"
                    />
                  </td>
                ))}
                <td className="border border-border p-1 text-center">
                  <button
                    onClick={() => removeRow(ri)}
                    className="p-0.5 rounded hover:bg-red-500/15 text-red-500"
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Output</label>
          <button
            onClick={copy}
            className="flex items-center gap-1.5 text-sm btn-secondary"
          >
            {copied ? <><Check size={14} className="text-green-500" />Copied</> : <><Copy size={14} />Copy</>}
          </button>
        </div>
        <pre className="font-mono text-sm bg-muted rounded-lg p-4 overflow-x-auto whitespace-pre">
          {table}
        </pre>
      </div>
    </div>
  )
}
