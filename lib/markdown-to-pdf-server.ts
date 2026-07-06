import PDFDocument from 'pdfkit'
import { marked, type Token, type Tokens } from 'marked'

const MARGIN = 60
const PAGE_WIDTH = 612 // US Letter

// ─── Inline text rendering ────────────────────────────────────────────────────

interface Span {
  text: string
  bold?: boolean
  italic?: boolean
  code?: boolean
  link?: string
}

function parseInlineTokens(tokens: Token[]): Span[] {
  const spans: Span[] = []
  for (const tok of tokens) {
    if (tok.type === 'text') {
      spans.push({ text: (tok as any).text })
    } else if (tok.type === 'strong') {
      for (const child of parseInlineTokens((tok as any).tokens ?? [])) {
        spans.push({ ...child, bold: true })
      }
    } else if (tok.type === 'em') {
      for (const child of parseInlineTokens((tok as any).tokens ?? [])) {
        spans.push({ ...child, italic: true })
      }
    } else if (tok.type === 'codespan') {
      spans.push({ text: (tok as any).text, code: true })
    } else if (tok.type === 'link') {
      const url = (tok as any).href as string
      for (const child of parseInlineTokens((tok as any).tokens ?? [])) {
        spans.push({ ...child, link: url })
      }
    } else if (tok.type === 'escape') {
      spans.push({ text: (tok as any).text })
    } else if ('raw' in tok) {
      spans.push({ text: (tok as any).raw })
    }
  }
  return spans
}

function renderSpans(doc: PDFKit.PDFDocument, spans: Span[], baseSize: number) {
  const maxWidth = PAGE_WIDTH - MARGIN * 2
  for (const span of spans) {
    const size = span.code ? baseSize - 1 : baseSize
    const font = span.code
      ? 'Courier'
      : span.bold && span.italic
        ? 'Helvetica-BoldOblique'
        : span.bold
          ? 'Helvetica-Bold'
          : span.italic
            ? 'Helvetica-Oblique'
            : 'Helvetica'

    doc.font(font).fontSize(size)

    if (span.link) {
      doc.fillColor('#0066cc').text(span.text, { continued: true, link: span.link, width: maxWidth, lineBreak: false })
    } else if (span.code) {
      doc.fillColor('#c0392b').text(span.text, { continued: true, width: maxWidth, lineBreak: false })
    } else {
      doc.fillColor('#222222').text(span.text, { continued: true, width: maxWidth, lineBreak: false })
    }
  }
  // end the line
  doc.text('', { lineBreak: true })
  doc.fillColor('#222222').font('Helvetica')
}

// ─── Main converter ───────────────────────────────────────────────────────────

export function markdownToPdfBuffer(markdown: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: MARGIN, size: 'LETTER', autoFirstPage: true })
    const chunks: Buffer[] = []

    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const tokens = marked.lexer(markdown)
    let firstBlock = true

    const gap = (px: number) => { doc.moveDown(px / 12) }

    for (const token of tokens) {
      if (!firstBlock) gap(6)
      firstBlock = false

      switch (token.type) {
        case 'heading': {
          const t = token as Tokens.Heading
          const sizes: Record<number, number> = { 1: 26, 2: 22, 3: 18, 4: 15, 5: 13, 6: 12 }
          const size = sizes[t.depth] ?? 13
          doc.font('Helvetica-Bold').fontSize(size).fillColor('#111111')
          doc.text(t.text, { width: PAGE_WIDTH - MARGIN * 2 })
          // underline rule for h1/h2
          if (t.depth <= 2) {
            const y = doc.y
            doc.moveTo(MARGIN, y).lineTo(PAGE_WIDTH - MARGIN, y).strokeColor('#cccccc').lineWidth(0.5).stroke()
            gap(4)
          }
          doc.font('Helvetica').fillColor('#222222').fontSize(11)
          break
        }

        case 'paragraph': {
          const t = token as Tokens.Paragraph
          const spans = parseInlineTokens(t.tokens ?? [])
          doc.font('Helvetica').fontSize(11).fillColor('#222222')
          renderSpans(doc, spans, 11)
          break
        }

        case 'list': {
          const t = token as Tokens.List
          renderList(doc, t, 0)
          break
        }

        case 'code': {
          const t = token as Tokens.Code
          const boxWidth = PAGE_WIDTH - MARGIN * 2
          // measure height
          doc.font('Courier').fontSize(9)
          const lines = t.text.split('\n')
          const lineH = 13
          const boxH = lines.length * lineH + 16

          const x = doc.page.margins.left
          const y = doc.y
          doc.rect(x, y, boxWidth, boxH).fill('#f4f4f4').stroke('#dddddd')
          doc.fillColor('#333333').text(t.text, x + 8, y + 8, {
            width: boxWidth - 16,
            lineBreak: true,
            lineGap: 2,
          })
          doc.fillColor('#222222').font('Helvetica').fontSize(11)
          gap(4)
          break
        }

        case 'blockquote': {
          const t = token as Tokens.Blockquote
          const x = doc.page.margins.left
          const startY = doc.y
          doc.save()
          doc.font('Helvetica-Oblique').fontSize(11).fillColor('#555555')
          const inner = t.tokens.map((tok) => ('text' in tok ? (tok as any).text : '')).join(' ')
          doc.text(inner, x + 16, startY, { width: PAGE_WIDTH - MARGIN * 2 - 16 })
          const endY = doc.y
          doc.moveTo(x, startY).lineTo(x, endY).strokeColor('#cccccc').lineWidth(3).stroke()
          doc.restore()
          doc.font('Helvetica').fontSize(11).fillColor('#222222')
          break
        }

        case 'hr': {
          gap(4)
          doc.moveTo(MARGIN, doc.y).lineTo(PAGE_WIDTH - MARGIN, doc.y).strokeColor('#cccccc').lineWidth(0.5).stroke()
          gap(4)
          break
        }

        case 'table': {
          const t = token as Tokens.Table
          renderTable(doc, t)
          break
        }

        case 'space':
          gap(6)
          break

        default:
          break
      }
    }

    doc.end()
  })
}

// ─── List renderer ────────────────────────────────────────────────────────────

function renderList(doc: PDFKit.PDFDocument, list: Tokens.List, depth: number) {
  const indent = MARGIN + depth * 16
  const textWidth = PAGE_WIDTH - indent - MARGIN

  list.items.forEach((item, i) => {
    const bullet = list.ordered ? `${i + 1}.` : '•'
    const y = doc.y
    doc.font('Helvetica').fontSize(11).fillColor('#222222')
    doc.text(bullet, indent, y, { width: 14, lineBreak: false })
    doc.text(item.text, indent + 16, y, { width: textWidth })

    // nested list
    for (const tok of item.tokens) {
      if (tok.type === 'list') {
        renderList(doc, tok as Tokens.List, depth + 1)
      }
    }
  })
}

// ─── Table renderer ───────────────────────────────────────────────────────────

function renderTable(doc: PDFKit.PDFDocument, table: Tokens.Table) {
  const colCount = table.header.length
  const colWidth = (PAGE_WIDTH - MARGIN * 2) / colCount
  const rowHeight = 20
  const x0 = doc.page.margins.left

  // header
  let y = doc.y
  table.header.forEach((cell, ci) => {
    doc.rect(x0 + ci * colWidth, y, colWidth, rowHeight).fill('#f0f0f0').stroke('#cccccc')
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#111111')
    doc.text(cell.text, x0 + ci * colWidth + 4, y + 5, { width: colWidth - 8, lineBreak: false })
  })
  y += rowHeight

  // rows
  table.rows.forEach((row, ri) => {
    const bg = ri % 2 === 0 ? '#ffffff' : '#fafafa'
    row.forEach((cell, ci) => {
      doc.rect(x0 + ci * colWidth, y, colWidth, rowHeight).fill(bg).stroke('#cccccc')
      doc.font('Helvetica').fontSize(9).fillColor('#222222')
      doc.text(cell.text, x0 + ci * colWidth + 4, y + 5, { width: colWidth - 8, lineBreak: false })
    })
    y += rowHeight
  })

  doc.y = y + 4
  doc.font('Helvetica').fontSize(11).fillColor('#222222')
}
