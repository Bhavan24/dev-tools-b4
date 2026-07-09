import { NextRequest, NextResponse } from 'next/server'
import { markdownToPdfBuffer } from '@/lib/markdown-to-pdf-server'

export async function POST(request: NextRequest) {
  try {
    const { markdown, filename } = await request.json()
    if (!markdown || typeof markdown !== 'string' || !markdown.trim()) {
      return NextResponse.json({ error: 'markdown is required' }, { status: 400 })
    }

    const pdfBuffer = await markdownToPdfBuffer(markdown)
    const safeName = (filename || 'document')
      .replace(/[^a-zA-Z0-9_\-. ]/g, '_')
      .replace(/\.pdf$/i, '')

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeName}.pdf"`,
        'Content-Length': String(pdfBuffer.byteLength),
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'PDF generation failed' }, { status: 400 })
  }
}
