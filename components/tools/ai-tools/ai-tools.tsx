'use client'

import { useState } from 'react'
import { AIToolShell } from './ai-tool-shell'

interface AIToolsProps {
  toolId: string
}

export function AITools({ toolId }: AIToolsProps) {
  if (toolId === 'ai-chat') return <AIChatTool />
  if (toolId === 'code-generator') return <CodeGeneratorTool />
  if (toolId === 'content-summarizer') return <ContentSummarizerTool />
  if (toolId === 'sentiment-analyzer') return <SentimentAnalyzerTool />
  if (toolId === 'ai-code-reviewer') return <AICodeReviewerTool />
  if (toolId === 'ai-doc-generator') return <AIDocGeneratorTool />
  if (toolId === 'ai-test-generator') return <AITestGeneratorTool />
  if (toolId === 'ai-sql-builder') return <AISqlBuilderTool />
  if (toolId === 'ai-schema-generator') return <AISchemaGeneratorTool />
  return null
}

function AIChatTool() {
  return (
    <AIToolShell
      toolId="ai-chat"
      systemPromptKey="ai-chat"
      inputLabel="Your message"
      inputPlaceholder="Ask anything..."
      submitLabel="Send"
      buildToolFields={(input) => ({ message: input })}
    />
  )
}

function CodeGeneratorTool() {
  const [language, setLanguage] = useState('TypeScript')

  const languages = [
    'TypeScript',
    'JavaScript',
    'Python',
    'Rust',
    'Go',
    'Java',
    'C#',
    'C++',
    'Ruby',
    'PHP',
    'Swift',
    'Kotlin',
    'SQL',
    'Shell',
  ]

  return (
    <AIToolShell
      toolId="code-generator"
      systemPromptKey="code-generator"
      inputLabel="Describe the code you want"
      inputPlaceholder="e.g. A function that validates an email address and returns true/false..."
      submitLabel="Generate Code"
      buildToolFields={(input) => ({ prompt: input, language })}
      extraFields={
        <div>
          <label className="block font-medium text-foreground mb-2">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="input-base"
          >
            {languages.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      }
    />
  )
}

function ContentSummarizerTool() {
  const [length, setLength] = useState('medium')

  return (
    <AIToolShell
      toolId="content-summarizer"
      systemPromptKey="content-summarizer"
      inputLabel="Content to summarize"
      inputPlaceholder="Paste the text, article, or document you want summarized..."
      submitLabel="Summarize"
      buildToolFields={(input) => ({ text: input, length })}
      extraFields={
        <div>
          <label className="block font-medium text-foreground mb-2">Summary length</label>
          <select value={length} onChange={(e) => setLength(e.target.value)} className="input-base">
            <option value="short">Short (1-2 paragraphs)</option>
            <option value="medium">Medium (3-5 bullet points)</option>
            <option value="detailed">Detailed (comprehensive breakdown)</option>
          </select>
        </div>
      }
    />
  )
}

function SentimentAnalyzerTool() {
  return (
    <AIToolShell
      toolId="sentiment-analyzer"
      systemPromptKey="sentiment-analyzer"
      inputLabel="Text to analyze"
      inputPlaceholder="Paste the text you want to analyze for sentiment and emotion..."
      submitLabel="Analyze Sentiment"
      buildToolFields={(input) => ({ text: input })}
    />
  )
}

function AICodeReviewerTool() {
  const [language, setLanguage] = useState('')

  const languages = [
    '',
    'TypeScript',
    'JavaScript',
    'Python',
    'Rust',
    'Go',
    'Java',
    'C#',
    'C++',
    'Ruby',
    'PHP',
    'Swift',
    'Kotlin',
  ]

  return (
    <AIToolShell
      toolId="ai-code-reviewer"
      systemPromptKey="ai-code-reviewer"
      inputLabel="Code to review"
      inputPlaceholder="Paste your code here..."
      inputType="code"
      submitLabel="Review Code"
      buildToolFields={(input) => ({ code: input, language })}
      extraFields={
        <div>
          <label className="block font-medium text-foreground mb-2">
            Language <span className="text-muted-foreground text-xs font-normal">(optional)</span>
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="input-base"
          >
            <option value="">Auto-detect</option>
            {languages.filter(Boolean).map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      }
    />
  )
}

function AIDocGeneratorTool() {
  const [format, setFormat] = useState('markdown')

  return (
    <AIToolShell
      toolId="ai-doc-generator"
      systemPromptKey="ai-doc-generator"
      inputLabel="Source code to document"
      inputPlaceholder="Paste your source code here..."
      inputType="code"
      submitLabel="Generate Docs"
      buildToolFields={(input) => ({ code: input, format })}
      extraFields={
        <div>
          <label className="block font-medium text-foreground mb-2">Output format</label>
          <select value={format} onChange={(e) => setFormat(e.target.value)} className="input-base">
            <option value="markdown">Markdown (README / API docs)</option>
            <option value="jsdoc">JSDoc comments</option>
            <option value="inline">Inline comments</option>
          </select>
        </div>
      }
    />
  )
}

function AITestGeneratorTool() {
  const [framework, setFramework] = useState('')

  return (
    <AIToolShell
      toolId="ai-test-generator"
      systemPromptKey="ai-test-generator"
      inputLabel="Source code to test"
      inputPlaceholder="Paste your source code here..."
      inputType="code"
      submitLabel="Generate Tests"
      buildToolFields={(input) => ({ code: input, framework })}
      extraFields={
        <div>
          <label className="block font-medium text-foreground mb-2">
            Testing framework{' '}
            <span className="text-muted-foreground text-xs font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={framework}
            onChange={(e) => setFramework(e.target.value)}
            placeholder="e.g. Jest, pytest, JUnit, RSpec..."
            className="input-base"
          />
        </div>
      }
    />
  )
}

function AISqlBuilderTool() {
  const [dialect, setDialect] = useState('PostgreSQL')
  const [schema, setSchema] = useState('')

  return (
    <AIToolShell
      toolId="ai-sql-builder"
      systemPromptKey="ai-sql-builder"
      inputLabel="Describe the query in plain English"
      inputPlaceholder="e.g. Get all users who signed up in the last 30 days, ordered by signup date descending..."
      submitLabel="Build SQL"
      buildToolFields={(input) => ({ description: input, dialect, schema })}
      extraFields={
        <div className="space-y-4">
          <div>
            <label className="block font-medium text-foreground mb-2">SQL dialect</label>
            <select
              value={dialect}
              onChange={(e) => setDialect(e.target.value)}
              className="input-base"
            >
              {['PostgreSQL', 'MySQL', 'SQLite', 'MSSQL', 'Oracle', 'BigQuery', 'Snowflake'].map(
                (d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                )
              )}
            </select>
          </div>
          <div>
            <label className="block font-medium text-foreground mb-2">
              Schema context{' '}
              <span className="text-muted-foreground text-xs font-normal">(optional)</span>
            </label>
            <textarea
              value={schema}
              onChange={(e) => setSchema(e.target.value)}
              placeholder="Paste your table definitions here to help the AI generate accurate queries..."
              className="input-base h-28 font-mono text-xs resize-none"
            />
          </div>
        </div>
      }
    />
  )
}

function AISchemaGeneratorTool() {
  const [format, setFormat] = useState('json-schema')

  return (
    <AIToolShell
      toolId="ai-schema-generator"
      systemPromptKey="ai-schema-generator"
      inputLabel="Sample data or description"
      inputPlaceholder="Paste sample JSON data, describe your data structure in plain English, or provide a natural language description..."
      submitLabel="Generate Schema"
      buildToolFields={(input) => ({ input, format })}
      extraFields={
        <div>
          <label className="block font-medium text-foreground mb-2">Output format</label>
          <select value={format} onChange={(e) => setFormat(e.target.value)} className="input-base">
            <option value="json-schema">JSON Schema (draft-07)</option>
            <option value="openapi">OpenAPI 3.0 spec</option>
            <option value="sql">SQL CREATE TABLE</option>
            <option value="prisma">Prisma schema</option>
          </select>
        </div>
      }
    />
  )
}
