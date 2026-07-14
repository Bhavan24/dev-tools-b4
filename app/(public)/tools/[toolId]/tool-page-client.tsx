'use client'

import { TOOLS } from '@/lib/constants'
import { MockDataGenerator } from '@/components/tools/mock-data-generator'
import { EncodeDecodeTool } from '@/components/tools/encode-decode-tool'
import { IndentFormatterTool } from '@/components/tools/indent-formatter-tool'
import { JsonClassConverterTool } from '@/components/tools/json-class-converter-tool'
import { ColorTools } from '@/components/tools/color-tools'
import { GeneratorTools } from '@/components/tools/generator-tools'
import { SpecialtyTools } from '@/components/tools/specialty-tools'
import { CodeTools } from '@/components/tools/code-tools'
import { DiffCheckerTool } from '@/components/tools/diff-checker-tool'
import { ValidationTools } from '@/components/tools/validation-tools'
import { ConverterTools } from '@/components/tools/converter-tools'
import { ApiTesterTool } from '@/components/tools/api-tester-tool'
import { NotesTool } from '@/components/tools/notes-tool'
import { TimerTool } from '@/components/tools/timer-tool'
import { CounterTool } from '@/components/tools/counter-tool'
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
import { PdfEditorTool } from '@/components/tools/pdf-editor-tool'
import { PdfConverterTool } from '@/components/tools/pdf-converter-tool'
import { ExcelConverterTool } from '@/components/tools/excel-converter-tool'
import { AITools } from '@/components/tools/ai-tools/ai-tools'
import { ResearcherAgentTool } from '@/components/tools/ai-tools/researcher-agent/researcher-agent-tool'
import { IniConverterTool } from '@/components/tools/ini-converter-tool'
import { CsvConverterTool } from '@/components/tools/csv-converter-tool'
import { JsStringEscaperTool } from '@/components/tools/js-string-escaper-tool'
import { YamlValidatorTool } from '@/components/tools/yaml-validator-tool'
import { JsValidatorTool } from '@/components/tools/js-validator-tool'
import { JsonMinifierTool } from '@/components/tools/json-minifier-tool'
import { JsMinifierTool } from '@/components/tools/js-minifier-tool'
import { CssMinifierTool } from '@/components/tools/css-minifier-tool'
import { XmlToJsonTool } from '@/components/tools/xml-to-json-tool'
import { XmlToYamlTool } from '@/components/tools/xml-to-yaml-tool'
import { YamlToJsonTool } from '@/components/tools/yaml-to-json-tool'
import { JsonToYamlTool } from '@/components/tools/json-to-yaml-tool'
import { JsonToPhpTool } from '@/components/tools/json-to-php-tool'
import { SqlFormatterTool } from '@/components/tools/sql-formatter-tool'
import { UnitConverterTool } from '@/components/tools/unit-converter-tool'
import { TimestampConverterTool } from '@/components/tools/timestamp-converter-tool'
import { UrlSplitterTool } from '@/components/tools/url-splitter-tool'
import { MimeTypeCheckerTool } from '@/components/tools/mime-type-checker-tool'
import { PublicIpLookupTool } from '@/components/tools/public-ip-lookup-tool'
import dynamic from 'next/dynamic'

const WorkflowBuilderTool = dynamic(
  () =>
    import('@/components/tools/ai-tools/workflow-builder/workflow-builder-tool').then(
      (m) => m.WorkflowBuilderTool
    ),
  { ssr: false }
)

interface ToolPageClientProps {
  toolId: string
}

// Each tool maps directly to its own component - no generic fallback.
const TOOL_REGISTRY: Record<string, () => React.ReactElement> = {
  // Encode / Decode
  'url-encoder-decoder': () => <EncodeDecodeTool toolId="url-encoder-decoder" />,
  'html-encoder-decoder': () => <EncodeDecodeTool toolId="html-encoder-decoder" />,
  'xml-string-escaper': () => <EncodeDecodeTool toolId="xml-string-escaper" />,
  'idn-converter': () => <EncodeDecodeTool toolId="idn-converter" />,
  'base64-encoder-decoder': () => <EncodeDecodeTool toolId="base64-encoder-decoder" />,
  'js-string-escaper': () => <JsStringEscaperTool />,

  // Formatters
  'js-beautifier': () => <IndentFormatterTool toolId="js-beautifier" />,
  'css-beautifier': () => <IndentFormatterTool toolId="css-beautifier" />,
  'json-formatter': () => <IndentFormatterTool toolId="json-formatter" />,
  'xml-formatter': () => <IndentFormatterTool toolId="xml-formatter" />,
  'html-formatter': () => <IndentFormatterTool toolId="html-formatter" />,
  'sql-formatter': () => <SqlFormatterTool />,
  'js-minifier': () => <JsMinifierTool />,
  'css-minifier': () => <CssMinifierTool />,
  'json-minifier': () => <JsonMinifierTool />,

  // JSON converters
  'json-to-java': () => <JsonClassConverterTool toolId="json-to-java" />,
  'json-to-csharp': () => <JsonClassConverterTool toolId="json-to-csharp" />,
  'json-to-xml': () => <JsonClassConverterTool toolId="json-to-xml" />,
  'json-to-php': () => <JsonToPhpTool />,
  'json-to-yaml': () => <JsonToYamlTool />,

  // CSV converter
  'csv-converter': () => <CsvConverterTool />,

  // XML / YAML / INI converters
  'xml-to-json': () => <XmlToJsonTool />,
  'xml-to-yaml': () => <XmlToYamlTool />,
  'yaml-to-json': () => <YamlToJsonTool />,
  'ini-converter': () => <IniConverterTool />,

  // Colors
  'color-code-picker': () => <ColorTools toolId="color-code-picker" />,

  // Generators
  'uuid-generator': () => <GeneratorTools toolId="uuid-generator" />,
  'password-generator': () => <GeneratorTools toolId="password-generator" />,
  'hash-generator': () => <GeneratorTools toolId="hash-generator" />,
  'json-generator': () => <GeneratorTools toolId="json-generator" />,
  'mock-data-generator': () => <MockDataGenerator toolId="mock-data-generator" />,

  // Specialty
  'jwt-decoder': () => <SpecialtyTools toolId="jwt-decoder" />,
  'text-case-converter': () => <SpecialtyTools toolId="text-case-converter" />,
  'regex-parser': () => <SpecialtyTools toolId="regex-parser" />,

  // Code tools
  'code-cleaner': () => <CodeTools toolId="code-cleaner" />,
  'diff-checker': () => <DiffCheckerTool />,

  // Validation
  'html-validator': () => <ValidationTools toolId="html-validator" />,
  'redirection-checker': () => <ValidationTools toolId="redirection-checker" />,
  'yaml-validator': () => <YamlValidatorTool />,
  'js-validator': () => <JsValidatorTool />,

  // Converters
  'currency-converter': () => <ConverterTools toolId="currency-converter" />,
  'unit-converter': () => <UnitConverterTool />,

  // Single-line / no-input
  'timestamp-converter': () => <TimestampConverterTool />,
  'url-splitter': () => <UrlSplitterTool />,
  'mime-type-checker': () => <MimeTypeCheckerTool />,
  'public-ip-lookup': () => <PublicIpLookupTool />,

  // API / Network
  'rest-api-tester': () => <ApiTesterTool toolId="rest-api-tester" />,
  'link-checker': () => <LinkCheckerTool toolId="link-checker" />,

  // Path evaluators
  'json-path-evaluator': () => <PathEvaluatorTool toolId="json-path-evaluator" />,
  'xpath-evaluator': () => <PathEvaluatorTool toolId="xpath-evaluator" />,
  'jsonpath-finder': () => <JsonpathFinderTool toolId="jsonpath-finder" />,

  // SQL
  'sql-to-mongodb': () => <SqlToMongodbTool toolId="sql-to-mongodb" />,

  // Image / media
  'qr-code-generator': () => <ImageTools toolId="qr-code-generator" />,
  'favicon-generator': () => <ImageTools toolId="favicon-generator" />,
  'image-to-data-uri': () => <ImageDataUriTool toolId="image-to-data-uri" />,
  'svg-viewer': () => <SvgViewerTool toolId="svg-viewer" />,

  // PDF / Doc
  'pdf-to-markdown': () => <PdfMarkdownTool toolId="pdf-to-markdown" />,
  'docx-to-markdown': () => <DocxMarkdownTool toolId="docx-to-markdown" />,
  'html-to-markdown': () => <HtmlMarkdownTool toolId="html-to-markdown" />,
  'pdf-editor': () => <PdfEditorTool />,
  'image-to-pdf': () => <PdfConverterTool toolId="image-to-pdf" />,
  'pdf-to-images': () => <PdfConverterTool toolId="pdf-to-images" />,
  'docx-to-pdf': () => <PdfConverterTool toolId="docx-to-pdf" />,

  // Excel
  'excel-to-json': () => <ExcelConverterTool toolId="excel-to-json" />,
  'excel-to-markdown': () => <ExcelConverterTool toolId="excel-to-markdown" />,

  // Utilities
  notes: () => <NotesTool toolId="notes" />,
  stopwatch: () => <TimerTool />,
  counter: () => <CounterTool />,

  // AI tools
  'ai-chat': () => <AITools toolId="ai-chat" />,
  'code-generator': () => <AITools toolId="code-generator" />,
  'content-summarizer': () => <AITools toolId="content-summarizer" />,
  'sentiment-analyzer': () => <AITools toolId="sentiment-analyzer" />,
  'ai-code-reviewer': () => <AITools toolId="ai-code-reviewer" />,
  'ai-doc-generator': () => <AITools toolId="ai-doc-generator" />,
  'ai-test-generator': () => <AITools toolId="ai-test-generator" />,
  'ai-sql-builder': () => <AITools toolId="ai-sql-builder" />,
  'ai-schema-generator': () => <AITools toolId="ai-schema-generator" />,
  'researcher-agent': () => <ResearcherAgentTool />,
  'workflow-builder': () => <WorkflowBuilderTool />,
}

export function ToolPageClient({ toolId }: ToolPageClientProps) {
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

  const factory = TOOL_REGISTRY[toolId]
  if (!factory) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">Tool not yet implemented</p>
        </div>
      </div>
    )
  }

  return <div className="w-full">{factory()}</div>
}
