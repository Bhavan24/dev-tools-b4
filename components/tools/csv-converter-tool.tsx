'use client'

import { useRef, useState } from 'react'
import { Loader2, AlertCircle, Copy, Check, Upload, X } from 'lucide-react'

type Format = 'json' | 'xml' | 'yaml' | 'sql'

export function CsvConverterTool() {
  const [csv, setCsv] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [format, setFormat] = useState<Format>('json')
  const [hasHeader, setHasHeader] = useState(true)
  const [tableName, setTableName] = useState('table1')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (file: File) => {
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setError('Please upload a .csv file')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setCsv(text)
      setFileName(file.name)
      setError('')
      setResult(null)
    }
    reader.readAsText(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }

  const clearFile = () => {
    setCsv('')
    setFileName(null)
    setResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleExecute = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/tools/csv-converter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv, format, hasHeader, tableName }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Tool execution failed')
      }

      const data = await response.json()
      setResult(data.result)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div>
          <label className="block font-medium text-foreground mb-3">CSV Input</label>

          {/* File upload zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="mb-3 border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload(file)
              }}
            />
            {fileName ? (
              <div className="flex items-center justify-center gap-2 text-sm text-foreground">
                <Upload size={16} className="text-primary" />
                <span className="font-medium">{fileName}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); clearFile() }}
                  className="ml-1 p-0.5 hover:bg-red-500/10 rounded text-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                <Upload size={16} className="inline mr-1.5 mb-0.5" />
                Drop a CSV file here or click to upload
              </div>
            )}
          </div>

          <textarea
            value={csv}
            onChange={(e) => { setCsv(e.target.value); setFileName(null) }}
            placeholder="...or paste CSV data directly here"
            className="input-base h-52 font-mono text-sm resize-none"
          />
        </div>

        <div>
          <label className="block font-medium text-foreground mb-2">Output Format</label>
          <div className="flex gap-2">
            {(['json', 'xml', 'yaml', 'sql'] as Format[]).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                  format === f
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border hover:bg-secondary'
                }`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={hasHeader}
            onChange={(e) => setHasHeader(e.target.checked)}
            className="w-4 h-4 rounded border-border cursor-pointer"
          />
          <span className="font-medium text-foreground text-sm">First row is header</span>
        </label>

        {format === 'sql' && (
          <div className="space-y-2">
            <label className="block font-medium text-foreground text-sm">Table Name</label>
            <input
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="table1"
              className="input-base"
            />
          </div>
        )}

        <button
          onClick={handleExecute}
          disabled={loading || !csv.trim()}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Converting...
            </>
          ) : (
            `Convert to ${format.toUpperCase()}`
          )}
        </button>
      </div>

      <div className="space-y-4">
        <label className="block font-medium text-foreground mb-3">Output</label>

        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-secondary rounded-lg p-4 font-mono text-sm mb-4 max-h-96 overflow-auto">
            <pre className="whitespace-pre-wrap wrap-break-word">{result}</pre>
          </div>
        )}

        {!result && !error && (
          <div className="bg-secondary rounded-lg p-4 h-96 flex items-center justify-center text-muted-foreground">
            Results will appear here
          </div>
        )}

        {result && (
          <button
            onClick={copyToClipboard}
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
      </div>
    </div>
  )
}
