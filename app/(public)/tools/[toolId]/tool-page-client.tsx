'use client'

import { useState } from 'react'
import { TOOLS } from '@/lib/constants'
import { Loader2, AlertCircle, Copy, Check } from 'lucide-react'
import { MockDataGenerator } from '@/components/tools/mock-data-generator'
import { EncodeDecodeTool } from '@/components/tools/encode-decode-tool'
import { IndentFormatterTool } from '@/components/tools/indent-formatter-tool'
import { JsonClassConverterTool } from '@/components/tools/json-class-converter-tool'
import { CsvOptionsConverterTool } from '@/components/tools/csv-options-converter-tool'
import { ColorTools } from '@/components/tools/color-tools'
import { GeneratorTools } from '@/components/tools/generator-tools'
import { SpecialtyTools } from '@/components/tools/specialty-tools'
import { CodeTools } from '@/components/tools/code-tools'
import { ValidationTools } from '@/components/tools/validation-tools'
import { ConverterTools } from '@/components/tools/converter-tools'
import { ApiTesterTool } from '@/components/tools/api-tester-tool'
import { NotesTool } from '@/components/tools/notes-tool'
import { ImageTools } from '@/components/tools/image-tools'
import { PdfMarkdownTool } from '@/components/tools/pdf-markdown-tool'
import { DocxMarkdownTool } from '@/components/tools/docx-markdown-tool'
import { HtmlMarkdownTool } from '@/components/tools/html-markdown-tool'
import { SvgViewerTool } from '@/components/tools/svg-viewer-tool'
import { PathEvaluatorTool } from '@/components/tools/path-evaluator-tool'
import { ImageDataUriTool } from '@/components/tools/image-data-uri-tool'
import { LinkCheckerTool } from '@/components/tools/link-checker-tool'
import { JsonpathFinderTool } from '@/components/tools/jsonpath-finder-tool'
import { SqlToMongodbTool } from '@/components/tools/sql-to-mongodb-tool'

interface ToolPageClientProps {
  toolId: string
}

const CUSTOM_TOOL_REGISTRY: Record<string, (id: string) => React.ReactElement> = {
  'mock-data-generator': (id) => <MockDataGenerator toolId={id} />,
  'url-encoder-decoder': (id) => <EncodeDecodeTool toolId={id} />,
  'html-encoder-decoder': (id) => <EncodeDecodeTool toolId={id} />,
  'xml-string-escaper': (id) => <EncodeDecodeTool toolId={id} />,
  'idn-converter': (id) => <EncodeDecodeTool toolId={id} />,
  'js-beautifier': (id) => <IndentFormatterTool toolId={id} />,
  'css-beautifier': (id) => <IndentFormatterTool toolId={id} />,
  'json-beautifier': (id) => <IndentFormatterTool toolId={id} />,
  'json-formatter': (id) => <IndentFormatterTool toolId={id} />,
  'xml-formatter': (id) => <IndentFormatterTool toolId={id} />,
  'html-formatter': (id) => <IndentFormatterTool toolId={id} />,
  'json-to-java': (id) => <JsonClassConverterTool toolId={id} />,
  'json-to-csharp': (id) => <JsonClassConverterTool toolId={id} />,
  'json-to-xml': (id) => <JsonClassConverterTool toolId={id} />,
  'csv-to-json': (id) => <CsvOptionsConverterTool toolId={id} />,
  'csv-to-sql': (id) => <CsvOptionsConverterTool toolId={id} />,
  'color-code-picker': (id) => <ColorTools toolId={id} />,
  'rgb-to-hex': (id) => <ColorTools toolId={id} />,
  'hex-to-rgb': (id) => <ColorTools toolId={id} />,
  'uuid-generator': (id) => <GeneratorTools toolId={id} />,
  'password-generator': (id) => <GeneratorTools toolId={id} />,
  'hash-generator': (id) => <GeneratorTools toolId={id} />,
  'json-generator': (id) => <GeneratorTools toolId={id} />,
  'jwt-decoder': (id) => <SpecialtyTools toolId={id} />,
  'text-case-converter': (id) => <SpecialtyTools toolId={id} />,
  'regex-parser': (id) => <SpecialtyTools toolId={id} />,
  'code-cleaner': (id) => <CodeTools toolId={id} />,
  'diff-checker': (id) => <CodeTools toolId={id} />,
  'html-validator': (id) => <ValidationTools toolId={id} />,
  'redirection-checker': (id) => <ValidationTools toolId={id} />,
  'currency-converter': (id) => <ConverterTools toolId={id} />,
  'rest-api-tester': (id) => <ApiTesterTool toolId={id} />,
  'notes': (id) => <NotesTool toolId={id} />,
  'qr-code-generator': (id) => <ImageTools toolId={id} />,
  'favicon-generator': (id) => <ImageTools toolId={id} />,
  'pdf-to-markdown': (id) => <PdfMarkdownTool toolId={id} />,
  'docx-to-markdown': (id) => <DocxMarkdownTool toolId={id} />,
  'html-to-markdown': (id) => <HtmlMarkdownTool toolId={id} />,
  'svg-viewer': (id) => <SvgViewerTool toolId={id} />,
  'json-path-evaluator': (id) => <PathEvaluatorTool toolId={id} />,
  'xpath-evaluator': (id) => <PathEvaluatorTool toolId={id} />,
  'image-to-data-uri': (id) => <ImageDataUriTool toolId={id} />,
  'link-checker': (id) => <LinkCheckerTool toolId={id} />,
  'jsonpath-finder': (id) => <JsonpathFinderTool toolId={id} />,
  'sql-to-mongodb': (id) => <SqlToMongodbTool toolId={id} />,
}

const SINGLE_LINE_TOOLS = new Set(['timestamp-converter', 'url-splitter', 'mime-type-checker'])
const NO_INPUT_TOOLS = new Set(['public-ip-lookup'])

export function ToolPageClient({ toolId }: ToolPageClientProps) {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const tool = TOOLS.find((t) => t.id === toolId)

  if (!tool) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">Tool not found</p>
        </div>
      </div>
    )
  }

  if ('comingSoon' in tool && tool.comingSoon) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="card-base max-w-md text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{tool.name}</h2>
          <p className="text-muted-foreground mb-6">{tool.description}</p>
          <p className="text-primary font-semibold">Coming Soon</p>
        </div>
      </div>
    )
  }

  // Check registry for custom components
  const customFactory = CUSTOM_TOOL_REGISTRY[toolId]
  if (customFactory) {
    return (
      <div className="max-w-4xl">
        {/* <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">{tool.name}</h2>
          <p className="text-sm text-muted-foreground">{tool.description}</p>
        </div> */}
        {customFactory(toolId)}
      </div>
    )
  }

  const handleExecute = async () => {
    setLoading(true)
    setError('')
    try {
      const body: Record<string, any> = {
        input,
        json: input,
        code: input,
        text: input,
        xml: input,
        csv: input,
        yaml: input,
        html: input,
        ini: input,
        base64: input,
        url: input,
        filename: input,
        pattern: input,
        testString: input,
        sql: input,
      }

      if (NO_INPUT_TOOLS.has(toolId)) {
        // no input needed
      } else if (SINGLE_LINE_TOOLS.has(toolId) || tool.id.includes('sql')) {
        body.tableName = 'table1'
      }

      const response = await fetch(`/api/tools/${toolId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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
      const text = typeof result === 'string' ? result : JSON.stringify(result, null, 2)
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input Section */}
      <div className="space-y-4">
        {/* <div>
          <h2 className="text-xl font-bold text-foreground">{tool.name}</h2>
          <p className="text-sm text-muted-foreground">{tool.description}</p>
        </div> */}

        <div>
          {NO_INPUT_TOOLS.has(toolId) ? (
            <button
              onClick={handleExecute}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Looking up...
                </>
              ) : (
                'Look Up My IP'
              )}
            </button>
          ) : SINGLE_LINE_TOOLS.has(toolId) ? (
            <div className="space-y-3">
              <label className="block font-medium text-foreground">Input</label>
              <input
                type={toolId === 'url-splitter' ? 'url' : 'text'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleExecute()}
                placeholder={
                  toolId === 'timestamp-converter'
                    ? 'Unix timestamp or ISO date (e.g., 1700000000 or 2023-11-14)'
                    : toolId === 'url-splitter'
                      ? 'https://example.com/path?query=value'
                      : 'filename.ext'
                }
                className="input-base"
              />
              {toolId === 'timestamp-converter' && (
                <button
                  onClick={() => setInput(String(Math.floor(Date.now() / 1000)))}
                  className="btn-secondary text-sm w-full"
                >
                  Use Current Time
                </button>
              )}
              <button
                onClick={handleExecute}
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Execute'
                )}
              </button>
            </div>
          ) : (
            <>
              <label className="block font-medium text-foreground mb-3">Input</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your input here..."
                className="input-base h-96 font-mono text-sm mb-4 resize-none"
              />

              <button
                onClick={handleExecute}
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Execute'
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Output Section */}
      <div className="space-y-4">
        <div>
          <label className="block font-medium text-foreground mb-3">Output</label>

          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {result && typeof result === 'object' && !Array.isArray(result) && (
            <div className="mb-4 space-y-2 max-h-64 overflow-auto">
              {Object.entries(result).map(([key, val]) => (
                <div key={key} className="bg-secondary rounded-lg p-3 flex justify-between items-center text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground capitalize font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p className="font-mono text-sm mt-1 break-all">{String(val)}</p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(String(val))
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }}
                    className="p-2 hover:bg-primary/10 rounded transition-colors flex-shrink-0 ml-2"
                  >
                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                </div>
              ))}
            </div>
          )}

          {result && (typeof result === 'string' || Array.isArray(result)) && (
            <div className="bg-secondary rounded-lg p-4 font-mono text-sm mb-4 max-h-96 overflow-auto">
              <pre className="whitespace-pre-wrap break-words">
                {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
              </pre>
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
    </div>
  )
}
