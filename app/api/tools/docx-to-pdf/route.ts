import { NextRequest, NextResponse } from 'next/server'

const MAX_BYTES = 50 * 1024 * 1024 // 50 MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const isDocx =
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.toLowerCase().endsWith('.docx')

    if (!isDocx) {
      return NextResponse.json({ error: 'Only .docx files are supported' }, { status: 400 })
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File exceeds the 50 MB limit' }, { status: 413 })
    }

    const arrayBuffer = await file.arrayBuffer()

    // Convert DOCX to HTML via mammoth
    const mammoth = await import('mammoth')
    const buffer = Buffer.from(arrayBuffer)
    const { value: html } = await mammoth.convertToHtml({ buffer })

    // Strip HTML tags to get plain text, then render via PDFKit
    const pdfBuffer = await docxHtmlToPdf(html)

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${file.name.replace(/\.docx$/i, '.pdf')}"`,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Conversion failed' }, { status: 400 })
  }
}

async function docxHtmlToPdf(html: string): Promise<Buffer> {
  const PDFDocument = (await import('pdfkit')).default

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 60, size: 'LETTER', autoFirstPage: true })
    const chunks: Buffer[] = []

    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    // Parse HTML into structured blocks for rendering
    const blocks = parseHtmlBlocks(html)
    const PAGE_W = 612
    const MARGIN = 60
    const textWidth = PAGE_W - MARGIN * 2

    for (const block of blocks) {
      switch (block.type) {
        case 'h1':
          doc.font('Helvetica-Bold').fontSize(22).fillColor('#111111')
          doc.text(block.text, { width: textWidth })
          doc.moveDown(0.5)
          break
        case 'h2':
          doc.font('Helvetica-Bold').fontSize(18).fillColor('#222222')
          doc.text(block.text, { width: textWidth })
          doc.moveDown(0.4)
          break
        case 'h3':
          doc.font('Helvetica-Bold').fontSize(15).fillColor('#333333')
          doc.text(block.text, { width: textWidth })
          doc.moveDown(0.3)
          break
        case 'p':
          doc.font('Helvetica').fontSize(11).fillColor('#222222')
          doc.text(block.text, { width: textWidth })
          doc.moveDown(0.5)
          break
        case 'li':
          doc.font('Helvetica').fontSize(11).fillColor('#222222')
          doc.text(`• ${block.text}`, MARGIN + 12, doc.y, { width: textWidth - 12 })
          doc.moveDown(0.2)
          break
        case 'hr':
          doc
            .moveTo(MARGIN, doc.y)
            .lineTo(PAGE_W - MARGIN, doc.y)
            .strokeColor('#cccccc')
            .lineWidth(0.5)
            .stroke()
          doc.moveDown(0.5)
          break
        default:
          if (block.text) {
            doc.font('Helvetica').fontSize(11).fillColor('#222222')
            doc.text(block.text, { width: textWidth })
            doc.moveDown(0.3)
          }
      }
    }

    doc.end()
  })
}

interface HtmlBlock {
  type: 'h1' | 'h2' | 'h3' | 'p' | 'li' | 'hr' | 'text'
  text: string
}

function parseHtmlBlocks(html: string): HtmlBlock[] {
  const blocks: HtmlBlock[] = []

  // Normalize line endings
  const normalized = html.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  // Match block-level elements
  const tagPattern = /<(h[1-6]|p|li|hr|div|blockquote|pre)[^>]*>([\s\S]*?)<\/\1>|<hr\s*\/?>/gi

  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = tagPattern.exec(normalized)) !== null) {
    // Capture any text before this tag as plain text
    const before = normalized.slice(lastIndex, match.index).trim()
    if (before) {
      const stripped = stripTags(before)
      if (stripped) blocks.push({ type: 'text', text: stripped })
    }

    const tag = match[1]?.toLowerCase() ?? 'p'
    const inner = match[2] ?? ''
    const text = stripTags(inner)
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .trim()

    if (tag === 'hr') {
      blocks.push({ type: 'hr', text: '' })
    } else if (tag.startsWith('h')) {
      const level = parseInt(tag[1]!, 10)
      const type = level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3'
      if (text) blocks.push({ type, text })
    } else if (tag === 'li') {
      if (text) blocks.push({ type: 'li', text })
    } else {
      if (text) blocks.push({ type: 'p', text })
    }

    lastIndex = match.index + match[0].length
  }

  // Remaining text
  const remaining = normalized.slice(lastIndex).trim()
  if (remaining) {
    const stripped = stripTags(remaining)
    if (stripped) blocks.push({ type: 'text', text: stripped })
  }

  return blocks
}

function stripTags(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .trim()
}
