import { streamText, generateText, tool, stepCountIs } from 'ai'
import { z } from 'zod'
import { resolveModel } from './ai-client'
import type { AIConfig } from './ai-client'

export interface ResearchConfig {
  aiConfig: AIConfig
  tavilyApiKey?: string
  query: string
  depth: 'quick' | 'standard' | 'deep'
}

export interface ResearchSource {
  title: string
  url: string
  snippet: string
  score?: number
}

export interface ResearchResult {
  report: string
  sources: ResearchSource[]
  steps: string[]
}

const DEPTH_MAX_STEPS: Record<string, number> = {
  quick: 3,
  standard: 6,
  deep: 10,
}

export const RESEARCH_SYSTEM_PROMPT = `You are a rigorous research analyst. Your task is to produce a comprehensive, well-cited research report.

Instructions:
1. Break the research question into 2-4 specific sub-questions.
2. For each sub-question, call web_search with a targeted query.
3. If a search result looks important but lacks detail, call extract_content to get the full text.
4. After gathering information, cross-reference key claims across sources.
5. Synthesize findings into a well-structured Markdown report.

Report format:
# [Title]

## Summary
[2-3 sentence executive summary]

## Key Findings
[Bullet points with [n] citation markers]

## Analysis
[Detailed discussion organized by subtopic, with [n] citations inline]

## Sources
[Numbered list: n. Title - URL]

Rules:
- Always cite sources with [n] inline markers matching the Sources list.
- Only include information found in searches - do not hallucinate facts.
- If no Tavily key is provided, clearly note findings are based on training data only.
- Be accurate, balanced, and thorough.`

async function tavilySearch(query: string, apiKey: string): Promise<ResearchSource[]> {
  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      query,
      search_depth: 'advanced',
      max_results: 5,
      include_answer: false,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Tavily search failed: ${err}`)
  }

  const data = await res.json()
  return (data.results || []).map((r: any) => ({
    title: r.title || '',
    url: r.url || '',
    snippet: r.content || r.snippet || '',
    score: r.score,
  }))
}

async function extractContent(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ResearchBot/1.0)' },
      signal: AbortSignal.timeout(8000),
    })
    const html = await res.text()
    return html
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .slice(0, 3000)
  } catch {
    return 'Could not extract content from this URL.'
  }
}

const webSearchParams = z.object({ query: z.string().describe('The search query') })
const extractParams = z.object({ url: z.string().describe('URL to extract content from') })

function buildResearchTools(tavilyApiKey: string | undefined, sources: ResearchSource[]) {
  return {
    web_search: tool({
      description: 'Search the web for information on a topic',
      inputSchema: webSearchParams,
      execute: async (
        input: z.infer<typeof webSearchParams>
      ): Promise<{
        results: Array<{ title: string; url: string; snippet: string }>
        note?: string
      }> => {
        const { query } = input
        if (!tavilyApiKey) {
          return {
            results: [],
            note: 'No Tavily API key provided. Proceeding with model knowledge only.',
          }
        }
        const results = await tavilySearch(query, tavilyApiKey)
        for (const r of results) {
          if (!sources.find((s) => s.url === r.url)) {
            sources.push(r)
          }
        }
        return { results: results.map((r) => ({ title: r.title, url: r.url, snippet: r.snippet })) }
      },
    }),
    extract_content: tool({
      description: 'Extract the full text content from a URL for deeper analysis',
      inputSchema: extractParams,
      execute: async (input: z.infer<typeof extractParams>): Promise<{ content: string }> => {
        const content = await extractContent(input.url)
        return { content }
      },
    }),
  }
}

export async function executeResearch(config: ResearchConfig): Promise<ResearchResult> {
  const model = resolveModel(config.aiConfig)
  const sources: ResearchSource[] = []
  const maxSteps = DEPTH_MAX_STEPS[config.depth] ?? 6

  const { text, steps: execSteps } = await generateText({
    model,
    system: RESEARCH_SYSTEM_PROMPT,
    prompt: `Research question: ${config.query}`,
    tools: buildResearchTools(config.tavilyApiKey, sources),
    stopWhen: stepCountIs(maxSteps),
    maxOutputTokens: 8192,
  })

  const steps = execSteps.flatMap((s) =>
    (s.toolCalls ?? []).map((tc: any) => {
      const inp = tc.input ?? tc.args ?? {}
      if (tc.toolName === 'web_search') return `Searched: "${inp.query}"`
      if (tc.toolName === 'extract_content') return `Extracted: ${inp.url}`
      return tc.toolName
    })
  )

  return { report: text, sources, steps }
}

export function streamResearch(config: ResearchConfig) {
  const model = resolveModel(config.aiConfig)
  const sources: ResearchSource[] = []
  const maxSteps = DEPTH_MAX_STEPS[config.depth] ?? 6

  return {
    stream: streamText({
      model,
      system: RESEARCH_SYSTEM_PROMPT,
      prompt: `Research question: ${config.query}`,
      tools: buildResearchTools(config.tavilyApiKey, sources),
      stopWhen: stepCountIs(maxSteps),
      maxOutputTokens: 8192,
    }),
    sources,
  }
}
