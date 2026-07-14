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
  if (toolId === 'ai-commit-generator') return <AICommitGeneratorTool />
  if (toolId === 'ai-regex-generator') return <AIRegexGeneratorTool />
  if (toolId === 'ai-error-explainer') return <AIErrorExplainerTool />
  if (toolId === 'ai-log-analyzer') return <AILogAnalyzerTool />
  if (toolId === 'ai-dockerfile-generator') return <AIDockerfileGeneratorTool />
  if (toolId === 'ai-architecture-diagram') return <AIArchitectureDiagramTool />
  if (toolId === 'ai-prompt-optimizer') return <AIPromptOptimizerTool />
  if (toolId === 'ai-release-notes') return <AIReleaseNotesTool />
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

function AICommitGeneratorTool() {
  const [scope, setScope] = useState('')

  return (
    <AIToolShell
      toolId="ai-commit-generator"
      systemPromptKey="ai-commit-generator"
      inputLabel="Git diff or changed files"
      inputPlaceholder={`Paste your git diff output, or describe the changes:\n\n- Added user authentication with JWT\n- Fixed login form validation\n- Updated README with setup instructions`}
      inputType="code"
      submitLabel="Generate Commit Message"
      buildToolFields={(input) => ({ diff: input, scope })}
      extraFields={
        <div>
          <label className="block font-medium text-foreground mb-2">
            Scope <span className="text-muted-foreground text-xs font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            placeholder="e.g. auth, api, ui, db..."
            className="input-base"
          />
        </div>
      }
    />
  )
}

function AIRegexGeneratorTool() {
  const [language, setLanguage] = useState('JavaScript')

  return (
    <AIToolShell
      toolId="ai-regex-generator"
      systemPromptKey="ai-regex-generator"
      inputLabel="Describe what to match"
      inputPlaceholder="e.g. A valid email address that allows plus signs in the local part but rejects consecutive dots..."
      submitLabel="Generate Regex"
      buildToolFields={(input) => ({ description: input, language })}
      extraFields={
        <div>
          <label className="block font-medium text-foreground mb-2">Target language / engine</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="input-base"
          >
            {['JavaScript', 'Python', 'PCRE', 'Java', 'Go', 'Ruby', 'Rust', '.NET'].map((l) => (
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

function AIErrorExplainerTool() {
  const [context, setContext] = useState('')

  return (
    <AIToolShell
      toolId="ai-error-explainer"
      systemPromptKey="ai-error-explainer"
      inputLabel="Stack trace or error message"
      inputPlaceholder={`Paste your error or stack trace here:\n\nTypeError: Cannot read properties of undefined (reading 'map')\n    at UserList (/app/components/UserList.tsx:12:20)\n    ...`}
      inputType="code"
      submitLabel="Explain Error"
      buildToolFields={(input) => ({ error: input, context })}
      extraFields={
        <div>
          <label className="block font-medium text-foreground mb-2">
            Context <span className="text-muted-foreground text-xs font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g. React 18 app, Node.js server, calling an API endpoint..."
            className="input-base"
          />
        </div>
      }
    />
  )
}

function AILogAnalyzerTool() {
  const [focus, setFocus] = useState('')

  return (
    <AIToolShell
      toolId="ai-log-analyzer"
      systemPromptKey="ai-log-analyzer"
      inputLabel="Log content"
      inputPlaceholder={`Paste your server or application logs here:\n\n2024-01-15 10:23:45 INFO  Server started on port 3000\n2024-01-15 10:24:12 ERROR Database connection failed: ETIMEDOUT\n...`}
      inputType="code"
      submitLabel="Analyze Logs"
      buildToolFields={(input) => ({ logs: input, focus })}
      extraFields={
        <div>
          <label className="block font-medium text-foreground mb-2">
            Focus area <span className="text-muted-foreground text-xs font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            placeholder="e.g. errors only, slow queries, authentication failures..."
            className="input-base"
          />
        </div>
      }
    />
  )
}

function AIDockerfileGeneratorTool() {
  const [baseImage, setBaseImage] = useState('')

  return (
    <AIToolShell
      toolId="ai-dockerfile-generator"
      systemPromptKey="ai-dockerfile-generator"
      inputLabel="Describe your application stack"
      inputPlaceholder="e.g. A Node.js 20 Express API with TypeScript, pnpm, and a build step that outputs to dist/. Listens on port 3000. Needs a non-root user."
      submitLabel="Generate Dockerfile"
      buildToolFields={(input) => ({ description: input, baseImage })}
      extraFields={
        <div>
          <label className="block font-medium text-foreground mb-2">
            Preferred base image{' '}
            <span className="text-muted-foreground text-xs font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={baseImage}
            onChange={(e) => setBaseImage(e.target.value)}
            placeholder="e.g. node:20-alpine, python:3.12-slim, ubuntu:24.04..."
            className="input-base"
          />
        </div>
      }
    />
  )
}

function AIArchitectureDiagramTool() {
  const [diagramType, setDiagramType] = useState('')

  return (
    <AIToolShell
      toolId="ai-architecture-diagram"
      systemPromptKey="ai-architecture-diagram"
      inputLabel="Describe your system"
      inputPlaceholder="e.g. A web app with a React frontend, Node.js API, PostgreSQL database, Redis cache, and an S3 bucket for file storage. Users authenticate via OAuth. The API calls a third-party payment service."
      submitLabel="Generate Diagram"
      buildToolFields={(input) => ({ description: input, diagramType })}
      extraFields={
        <div>
          <label className="block font-medium text-foreground mb-2">
            Diagram type{' '}
            <span className="text-muted-foreground text-xs font-normal">(optional - auto if blank)</span>
          </label>
          <select
            value={diagramType}
            onChange={(e) => setDiagramType(e.target.value)}
            className="input-base"
          >
            <option value="">Auto-select</option>
            <option value="flowchart">Flowchart (components & data flow)</option>
            <option value="sequence">Sequence (request/response flow)</option>
            <option value="class">Class diagram</option>
            <option value="C4">C4 Context diagram</option>
            <option value="ER">Entity Relationship</option>
          </select>
        </div>
      }
    />
  )
}

function AIPromptOptimizerTool() {
  const [targetModel, setTargetModel] = useState('')

  return (
    <AIToolShell
      toolId="ai-prompt-optimizer"
      systemPromptKey="ai-prompt-optimizer"
      inputLabel="Prompt to optimize"
      inputPlaceholder="Paste the prompt you want to improve here..."
      submitLabel="Optimize Prompt"
      buildToolFields={(input) => ({ prompt: input, targetModel })}
      extraFields={
        <div>
          <label className="block font-medium text-foreground mb-2">
            Target model{' '}
            <span className="text-muted-foreground text-xs font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={targetModel}
            onChange={(e) => setTargetModel(e.target.value)}
            placeholder="e.g. Claude, GPT-4o, Gemini 1.5 Pro..."
            className="input-base"
          />
        </div>
      }
    />
  )
}

function AIReleaseNotesTool() {
  const [version, setVersion] = useState('')

  return (
    <AIToolShell
      toolId="ai-release-notes"
      systemPromptKey="ai-release-notes"
      inputLabel="Commit log or PR titles"
      inputPlaceholder={`Paste one commit message or PR title per line:\n\nfeat(auth): add OAuth2 login with Google\nfix(api): resolve rate limit race condition\nchore(deps): upgrade React to 19.1\ndocs: update API reference for v2 endpoints`}
      submitLabel="Generate Release Notes"
      buildToolFields={(input) => ({ commits: input, version })}
      extraFields={
        <div>
          <label className="block font-medium text-foreground mb-2">
            Version <span className="text-muted-foreground text-xs font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="e.g. v2.1.0, 1.5.3..."
            className="input-base"
          />
        </div>
      }
    />
  )
}
