import { NextRequest, NextResponse } from 'next/server'
import { markdownToDocxBuffer } from '@/lib/markdown-to-docx-server'

export async function POST(request: NextRequest) {
  try {
    const { markdown, filename } = await request.json()
    if (!markdown || typeof markdown !== 'string' || !markdown.trim()) {
      return NextResponse.json({ error: 'markdown is required' }, { status: 400 })
    }

    const docxBuffer = await markdownToDocxBuffer(markdown)
    const safeName = (filename || 'document').replace(/[^a-zA-Z0-9_\-. ]/g, '_').replace(/\.docx$/i, '')

    return new NextResponse(docxBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${safeName}.docx"`,
        'Content-Length': String(docxBuffer.byteLength),
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'DOCX generation failed' }, { status: 400 })
  }
}
