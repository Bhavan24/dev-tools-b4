'use client'

import { TOOLS } from '@/lib/constants'
import { MockDataGenerator } from '@/components/tools/mock-data-generator'
import { EncodeDecodeTool } from '@/components/tools/encode-decode-tool'
import { IndentFormatterTool } from '@/components/tools/indent-formatter-tool'
import { JsonClassConverterTool } from '@/components/tools/json-class-converter-tool'
import { CsvOptionsConverterTool } from '@/components/tools/csv-options-converter-tool'
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
import { Base64EncoderTool } from '@/components/tools/base64-encoder-tool'
import { Base64DecoderTool } from '@/components/tools/base64-decoder-tool'
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
import { HtmlBeautifierTool } from '@/components/tools/html-beautifier-tool'
import { SqlFormatterTool } from '@/components/tools/sql-formatter-tool'
import { IniConverterTool } from '@/components/tools/ini-converter-tool'
import { CsvToXmlTool, CsvToYamlTool } from '@/components/tools/csv-extra-converter-tool'
import { UnitConverterTool } from '@/components/tools/unit-converter-tool'
import { TimestampConverterTool } from '@/components/tools/timestamp-converter-tool'
import { UrlSplitterTool } from '@/components/tools/url-splitter-tool'
import { MimeTypeCheckerTool } from '@/components/tools/mime-type-checker-tool'
import { PublicIpLookupTool } from '@/components/tools/public-ip-lookup-tool'
import { TimezoneConverterTool } from '@/components/tools/timezone-converter-tool'
import { Iso8601ConverterTool } from '@/components/tools/iso8601-converter-tool'
import { BusinessDayCalculatorTool } from '@/components/tools/business-day-calculator-tool'
import { RelativeDateCalculatorTool } from '@/components/tools/relative-date-calculator-tool'
import { AgeCalculatorTool } from '@/components/tools/age-calculator-tool'
import { EnvFileParserTool } from '@/components/tools/env-file-parser-tool'
import { GitignoreGeneratorTool } from '@/components/tools/gitignore-generator-tool'
import { ConventionalCommitTool } from '@/components/tools/conventional-commit-tool'
import { SemverComparatorTool } from '@/components/tools/semver-comparator-tool'
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
  'base64-encoder': () => <Base64EncoderTool />,
  'base64-decoder': () => <Base64DecoderTool />,
  'js-string-escaper': () => <JsStringEscaperTool />,

  // Formatters
  'js-beautifier': () => <IndentFormatterTool toolId="js-beautifier" />,
  'css-beautifier': () => <IndentFormatterTool toolId="css-beautifier" />,
  'json-beautifier': () => <IndentFormatterTool toolId="json-beautifier" />,
  'json-formatter': () => <IndentFormatterTool toolId="json-formatter" />,
  'xml-formatter': () => <IndentFormatterTool toolId="xml-formatter" />,
  'html-formatter': () => <IndentFormatterTool toolId="html-formatter" />,
  'html-beautifier': () => <HtmlBeautifierTool />,
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

  // CSV converters
  'csv-to-json': () => <CsvOptionsConverterTool toolId="csv-to-json" />,
  'csv-to-sql': () => <CsvOptionsConverterTool toolId="csv-to-sql" />,
  'csv-to-xml': () => <CsvToXmlTool />,
  'csv-to-yaml': () => <CsvToYamlTool />,

  // XML / YAML / INI converters
  'xml-to-json': () => <XmlToJsonTool />,
  'xml-to-yaml': () => <XmlToYamlTool />,
  'yaml-to-json': () => <YamlToJsonTool />,
  'ini-to-json': () => <IniConverterTool />,
  'ini-to-xml': () => <IniConverterTool />,
  'ini-to-yaml': () => <IniConverterTool />,

  // Colors
  'color-code-picker': () => <ColorTools toolId="color-code-picker" />,
  'rgb-to-hex': () => <ColorTools toolId="rgb-to-hex" />,
  'hex-to-rgb': () => <ColorTools toolId="hex-to-rgb" />,

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

  // Phase 3 tools
  'timezone-converter': () => <TimezoneConverterTool />,
  'iso8601-converter': () => <Iso8601ConverterTool />,
  'business-day-calculator': () => <BusinessDayCalculatorTool />,
  'relative-date-calculator': () => <RelativeDateCalculatorTool />,
  'age-calculator': () => <AgeCalculatorTool />,
  'env-file-parser': () => <EnvFileParserTool />,
  'gitignore-generator': () => <GitignoreGeneratorTool />,
  'conventional-commit-generator': () => <ConventionalCommitTool />,
  'semver-comparator': () => <SemverComparatorTool />,

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

const FULL_WIDTH_TOOLS = new Set(['workflow-builder'])

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

  return <div className={FULL_WIDTH_TOOLS.has(toolId) ? 'w-full' : 'max-w-4xl'}>{factory()}</div>
}
