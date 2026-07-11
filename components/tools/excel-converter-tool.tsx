'use client'

import { useState, useRef, useCallback } from 'react'
import {
  Loader2,
  AlertCircle,
  Upload,
  Copy,
  Check,
  Download,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

interface ExcelConverterToolProps {
  toolId: 'excel-to-json' | 'excel-to-markdown'
}

interface SheetData {
  name: string
  rows: string[][]
}

interface SheetConfig {
  headerRows: number
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ExcelConverterTool({ toolId }: ExcelConverterToolProps) {
  const isJson = toolId === 'excel-to-json'

  const [sheets, setSheets] = useState<SheetData[]>([])
  const [configs, setConfigs] = useState<SheetConfig[]>([])
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState<ConversionResult[] | null>(null)
  const [activeSheet, setActiveSheet] = useState(0)
  const [copied, setCopied] = useState(false)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(async (file: File) => {
    const name = file.name.toLowerCase()
    if (!name.endsWith('.xlsx') && !name.endsWith('.xls') && !name.endsWith('.csv')) {
      setError('Please upload a .xlsx, .xls, or .csv file.')
      return
    }
    setError('')
    setResults(null)
    setLoading(true)
    setFileName(file.name)
    try {
      const XLSX = await import('xlsx')
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array', raw: false })

      const parsed: SheetData[] = workbook.SheetNames.map((sheetName) => {
        const ws = workbook.Sheets[sheetName]!
        const aoa: string[][] = XLSX.utils.sheet_to_json(ws, {
          header: 1,
          defval: '',
        }) as string[][]
        return { name: sheetName, rows: aoa }
      })

      setSheets(parsed)
      setConfigs(parsed.map(() => ({ headerRows: 1 })))
      setActiveSheet(0)
    } catch (err: any) {
      setError(err.message || 'Failed to read file')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) processFile(f)
  }

  const convert = async () => {
    if (sheets.length === 0) return
    setLoading(true)
    setError('')
    try {
      const out: ConversionResult[] = sheets.map((sheet, idx) => {
        const cfg = configs[idx] ?? { headerRows: 1 }
        return isJson
          ? convertToJson(sheet, cfg.headerRows)
          : convertToMarkdown(sheet, cfg.headerRows)
      })
      setResults(out)
      setActiveSheet(0)
    } catch (err: any) {
      setError(err.message || 'Conversion failed')
    } finally {
      setLoading(false)
    }
  }

  const activeResult = results?.[activeSheet]
  const outputText = activeResult
    ? isJson
      ? JSON.stringify(activeResult.data, null, 2)
      : (activeResult.data as string)
    : ''

  const copyOutput = () => {
    navigator.clipboard.writeText(outputText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadOutput = () => {
    if (!outputText) return
    const ext = isJson ? 'json' : 'md'
    const mime = isJson ? 'application/json' : 'text/markdown'
    const baseName = fileName.replace(/\.(xlsx?|csv)$/i, '')
    const sheetSuffix = sheets.length > 1 ? `_${sheets[activeSheet]?.name ?? activeSheet}` : ''
    const blob = new Blob([outputText], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${baseName}${sheetSuffix}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadAll = () => {
    if (!results) return
    results.forEach((r, idx) => {
      const text = isJson ? JSON.stringify(r.data, null, 2) : (r.data as string)
      const ext = isJson ? 'json' : 'md'
      const mime = isJson ? 'application/json' : 'text/markdown'
      const baseName = fileName.replace(/\.(xlsx?|csv)$/i, '')
      const sheetName = sheets[idx]?.name ?? `sheet${idx + 1}`
      const blob = new Blob([text], { type: mime })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${baseName}_${sheetName}.${ext}`
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  return (
    <div className="space-y-6">
      {/* File upload */}
      {sheets.length === 0 && (
        <div className="space-y-4">
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) processFile(f)
            }}
          />
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
              dragging
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-secondary/50'
            }`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <FileSpreadsheet size={40} className="mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium text-foreground mb-1">
              Drop an Excel or CSV file here, or click to upload
            </p>
            <p className="text-sm text-muted-foreground">.xlsx, .xls, .csv supported</p>
          </div>

          <button
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Reading file…
              </>
            ) : (
              <>
                <Upload size={18} />
                Select File
              </>
            )}
          </button>

          {error && <ErrorBanner message={error} />}
        </div>
      )}

      {/* Sheet configuration */}
      {sheets.length > 0 && !results && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileSpreadsheet size={20} className="text-primary shrink-0" />
              <span className="font-medium text-foreground truncate max-w-64">{fileName}</span>
              <span className="text-sm text-muted-foreground">
                {sheets.length} sheet{sheets.length !== 1 ? 's' : ''}
              </span>
            </div>
            <button
              onClick={() => {
                setSheets([])
                setConfigs([])
                setFileName('')
                setError('')
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Change file
            </button>
          </div>

          {error && <ErrorBanner message={error} />}

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Configure how many rows form the header for each sheet. Rows will be merged into one
              header when more than 1 is selected.
            </p>

            {sheets.map((sheet, idx) => (
              <SheetConfigCard
                key={sheet.name}
                sheet={sheet}
                config={configs[idx] ?? { headerRows: 1 }}
                onChange={(cfg) =>
                  setConfigs((prev) => {
                    const next = [...prev]
                    next[idx] = cfg
                    return next
                  })
                }
              />
            ))}
          </div>

          <button
            onClick={convert}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Converting…
              </>
            ) : (
              `Convert to ${isJson ? 'JSON' : 'Markdown'}`
            )}
          </button>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <FileSpreadsheet size={20} className="text-primary shrink-0" />
              <span className="font-medium text-foreground truncate max-w-64">{fileName}</span>
            </div>
            <div className="flex gap-2">
              {results.length > 1 && (
                <button
                  onClick={downloadAll}
                  className="btn-secondary flex items-center gap-2 text-sm"
                >
                  <Download size={15} />
                  Download all
                </button>
              )}
              <button
                onClick={() => {
                  setResults(null)
                  setSheets([])
                  setConfigs([])
                  setFileName('')
                  setError('')
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Start over
              </button>
            </div>
          </div>

          {/* Sheet tabs */}
          {results.length > 1 && (
            <div className="flex gap-1 p-1 bg-secondary rounded-xl overflow-x-auto">
              {results.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSheet(idx)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    activeSheet === idx
                      ? 'bg-background shadow text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {sheets[idx]?.name ?? `Sheet ${idx + 1}`}
                </button>
              ))}
            </div>
          )}

          {activeResult && (
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">
                {activeResult.rowCount} data rows · {activeResult.colCount} columns
              </div>
              <div className="bg-secondary rounded-xl p-4 font-mono text-sm max-h-[28rem] overflow-auto">
                <pre className="whitespace-pre-wrap wrap-break-word">{outputText}</pre>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={copyOutput}
              className="btn-secondary flex-1 flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check size={16} className="text-green-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={16} />
                  Copy
                </>
              )}
            </button>
            <button
              onClick={downloadOutput}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <Download size={16} />
              Download .{isJson ? 'json' : 'md'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sheet config card ────────────────────────────────────────────────────────

interface ConversionResult {
  data: any
  rowCount: number
  colCount: number
}

interface SheetConfigCardProps {
  sheet: SheetData
  config: SheetConfig
  onChange: (cfg: SheetConfig) => void
}

function SheetConfigCard({ sheet, config, onChange }: SheetConfigCardProps) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const maxHeaderRows = Math.min(5, Math.max(1, sheet.rows.length - 1))
  const previewRows = sheet.rows.slice(0, Math.min(6, sheet.rows.length))

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-secondary/50">
        <div className="flex items-center gap-3">
          <span className="font-medium text-sm text-foreground">{sheet.name}</span>
          <span className="text-xs text-muted-foreground">
            {sheet.rows.length} rows · {Math.max(...sheet.rows.map((r) => r.length), 0)} cols
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <label className="text-muted-foreground whitespace-nowrap">Header rows:</label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onChange({ headerRows: Math.max(1, config.headerRows - 1) })}
                disabled={config.headerRows <= 1}
                className="w-7 h-7 rounded-md bg-background border border-border flex items-center justify-center hover:bg-secondary disabled:opacity-30 transition-colors"
              >
                <ChevronDown size={14} />
              </button>
              <span className="w-5 text-center font-mono font-medium text-foreground">
                {config.headerRows}
              </span>
              <button
                onClick={() =>
                  onChange({ headerRows: Math.min(maxHeaderRows, config.headerRows + 1) })
                }
                disabled={config.headerRows >= maxHeaderRows}
                className="w-7 h-7 rounded-md bg-background border border-border flex items-center justify-center hover:bg-secondary disabled:opacity-30 transition-colors"
              >
                <ChevronUp size={14} />
              </button>
            </div>
          </div>

          <button
            onClick={() => setPreviewOpen((v) => !v)}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            {previewOpen ? 'Hide' : 'Preview'}
            {previewOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {previewOpen && (
        <div className="overflow-x-auto border-t border-border">
          <table className="text-xs w-full">
            <tbody>
              {previewRows.map((row, ri) => (
                <tr
                  key={ri}
                  className={
                    ri < config.headerRows
                      ? 'bg-primary/5 font-semibold text-foreground'
                      : 'text-muted-foreground odd:bg-secondary/30'
                  }
                >
                  <td className="px-2 py-1 border-r border-border text-muted-foreground w-8 text-center select-none">
                    {ri < config.headerRows ? `H${ri + 1}` : ri - config.headerRows + 1}
                  </td>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className="px-2 py-1 border-r border-border last:border-r-0 max-w-32 truncate"
                    >
                      {String(cell)}
                    </td>
                  ))}
                </tr>
              ))}
              {sheet.rows.length > 6 && (
                <tr>
                  <td colSpan={99} className="px-2 py-1 text-center text-muted-foreground italic">
                    …{sheet.rows.length - 6} more rows
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Conversion helpers ───────────────────────────────────────────────────────

function mergeHeaderRows(headerRows: string[][]): string[] {
  if (headerRows.length === 0) return []
  if (headerRows.length === 1) return headerRows[0]!.map(String)
  const colCount = Math.max(...headerRows.map((r) => r.length))
  return Array.from({ length: colCount }, (_, i) => {
    const parts = headerRows.map((r) => String(r[i] ?? '').trim()).filter(Boolean)
    return parts.join(' - ')
  })
}

function convertToJson(sheet: SheetData, headerRowCount: number): ConversionResult {
  const rows = sheet.rows
  if (rows.length === 0) return { data: [], rowCount: 0, colCount: 0 }
  const headers = mergeHeaderRows(rows.slice(0, headerRowCount))
  const dataRows = rows.slice(headerRowCount)
  const colCount = Math.max(headers.length, ...dataRows.map((r) => r.length))
  const records = dataRows.map((row) => {
    const obj: Record<string, any> = {}
    for (let i = 0; i < colCount; i++) {
      const key = headers[i] || `col${i + 1}`
      const raw = String(row[i] ?? '')
      obj[key] = raw === '' ? null : !isNaN(Number(raw)) && raw.trim() !== '' ? Number(raw) : raw
    }
    return obj
  })
  return { data: records, rowCount: records.length, colCount }
}

function convertToMarkdown(sheet: SheetData, headerRowCount: number): ConversionResult {
  const rows = sheet.rows
  if (rows.length === 0) return { data: '', rowCount: 0, colCount: 0 }
  const headers = mergeHeaderRows(rows.slice(0, headerRowCount))
  const dataRows = rows.slice(headerRowCount)
  const colCount = Math.max(headers.length, ...dataRows.map((r) => r.length))
  const pad = (s: string) => ` ${String(s).replace(/\|/g, '\\|')} `
  const filledHeaders = Array.from({ length: colCount }, (_, i) => headers[i] ?? '')
  const headerLine = '|' + filledHeaders.map(pad).join('|') + '|'
  const sepLine = '|' + Array(colCount).fill(' --- ').join('|') + '|'
  const dataLines = dataRows.map(
    (row) =>
      '|' + Array.from({ length: colCount }, (_, i) => pad(String(row[i] ?? ''))).join('|') + '|'
  )
  const markdown = [headerLine, sepLine, ...dataLines].join('\n')
  return { data: markdown, rowCount: dataRows.length, colCount }
}

// ─── Shared ───────────────────────────────────────────────────────────────────

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
      <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
      <p className="text-sm text-red-600">{message}</p>
    </div>
  )
}
