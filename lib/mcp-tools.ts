/**
 * MCP tool utilities — safe to import on both server and client.
 *
 * The actual source of truth is toolHandlers in tool-handlers.ts (server-only).
 * The MCP docs page imports toolHandlers directly (server component).
 * This file re-exports a pre-computed ID set for use in client components.
 *
 * NOTE: If you add a handler to tool-handlers.ts you MUST add its id here too.
 * This is the only file that needs updating when adding a new MCP tool.
 */

export const MCP_TOOL_IDS: readonly string[] = [
  'js-minifier',
  'js-beautifier',
  'css-minifier',
  'css-beautifier',
  'json-minifier',
  'json-beautifier',
  'json-formatter',
  'xml-formatter',
  'html-formatter',
  'html-beautifier',
  'sql-formatter',
  'timestamp-converter',
  'json-generator',
  'url-encoder-decoder',
  'html-encoder-decoder',
  'js-string-escaper',
  'xml-string-escaper',
  'base64-encoder',
  'base64-decoder',
  'jwt-decoder',
  'url-splitter',
  'mime-type-checker',
  'code-cleaner',
  'diff-checker',
  'regex-parser',
  'yaml-validator',
  'js-validator',
  'html-validator',
  'redirection-checker',
  'json-to-java',
  'json-to-xml',
  'json-to-php',
  'json-to-csharp',
  'xml-to-yaml',
  'xml-to-json',
  'ini-to-json',
  'ini-to-xml',
  'ini-to-yaml',
  'csv-to-json',
  'csv-to-xml',
  'csv-to-yaml',
  'csv-to-sql',
  'yaml-to-json',
  'json-to-yaml',
  'rgb-to-hex',
  'hex-to-rgb',
  'idn-converter',
  'public-ip-lookup',
  'text-case-converter',
  'unit-converter',
  'uuid-generator',
  'hash-generator',
  'password-generator',
  'mock-data-generator',
  'qr-code-generator',
  'favicon-generator',
  'currency-converter',
  'rest-api-tester',
  'link-checker',
  'jsonpath-finder',
  'sql-to-mongodb',
  'json-path-evaluator',
  'xpath-evaluator',
  'pdf-to-markdown',
  'docx-to-markdown',
  'html-to-markdown',
  'markdown-to-html',
] as const

export const MCP_TOOL_ID_SET: ReadonlySet<string> = new Set(MCP_TOOL_IDS)

export function isMcpEnabled(toolId: string): boolean {
  return MCP_TOOL_ID_SET.has(toolId)
}
