import { NextRequest, NextResponse } from 'next/server'
import { marked } from 'marked'

export async function POST(request: NextRequest) {
  try {
    const { markdown } = await request.json()
    if (!markdown || typeof markdown !== 'string' || !markdown.trim()) {
      return NextResponse.json({ error: 'markdown is required' }, { status: 400 })
    }

    const html = await marked.parse(markdown)

    return NextResponse.json({ result: { html } })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Conversion failed' }, { status: 400 })
  }
}
