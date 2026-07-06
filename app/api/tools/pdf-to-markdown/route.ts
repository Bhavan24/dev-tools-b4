import { NextRequest, NextResponse } from 'next/server'

// No body-size config needed — FormData is streamed, not buffered by Next.js JSON parser

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 })
    }

    const MAX_BYTES = 100 * 1024 * 1024 // 100 MB
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File exceeds the 100 MB limit' }, { status: 413 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')

    const { pdfToText } = await import('@/lib/pdf-server')
    const data = await pdfToText(base64)

    const rawText: string = data.text
    const lines = rawText.split('\n')
    const mdLines: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!.trimEnd()
      const trimmed = line.trimStart()
      if (!trimmed) {
        if (mdLines.length > 0 && mdLines[mdLines.length - 1] !== '') {
          mdLines.push('')
        }
        continue
      }
      // Heuristic: short all-caps lines are likely section headers
      if (trimmed.length < 80 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed)) {
        mdLines.push(`## ${trimmed}`)
      } else {
        mdLines.push(trimmed)
      }
    }

    const markdown = mdLines.join('\n').replace(/\n{3,}/g, '\n\n').trim()

    return NextResponse.json({
      result: {
        markdown,
        pageCount: data.numpages,
        wordCount: markdown.split(/\s+/).filter(Boolean).length,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Conversion failed' }, { status: 400 })
  }
}
