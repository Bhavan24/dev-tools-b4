import { NextRequest, NextResponse } from 'next/server'

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const MAX_BYTES = 50 * 1024 * 1024 // 50 MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }
    if (file.type !== DOCX_MIME && !file.name.endsWith('.docx')) {
      return NextResponse.json({ error: 'Only .docx files are supported' }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File exceeds the 50 MB limit' }, { status: 413 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')

    const { docxToHtml } = await import('@/lib/docx-server')
    const TurndownService = (await import('turndown')).default
    const { gfm } = await import('turndown-plugin-gfm')

    const { html } = await docxToHtml(base64)

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
