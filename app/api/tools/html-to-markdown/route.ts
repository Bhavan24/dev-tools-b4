import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { html } = await request.json()
    if (!html || typeof html !== 'string' || !html.trim()) {
      return NextResponse.json({ error: 'html is required' }, { status: 400 })
    }

    const TurndownService = (await import('turndown')).default
    const { gfm } = await import('turndown-plugin-gfm')

    const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' })
    turndown.use(gfm)
    const markdown = turndown.turndown(html)

    return NextResponse.json({
      result: {
        markdown,
        wordCount: markdown.split(/\s+/).filter(Boolean).length,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Conversion failed' }, { status: 400 })
  }
}
