import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
} from 'docx'
import { marked, type Token, type Tokens } from 'marked'

interface Span {
  text: string
  bold?: boolean
  italic?: boolean
  code?: boolean
}

function parseInline(tokens: Token[]): Span[] {
  const spans: Span[] = []
  for (const tok of tokens) {
    if (tok.type === 'text') {
      spans.push({ text: (tok as any).text })
    } else if (tok.type === 'strong') {
      for (const child of parseInline((tok as any).tokens ?? [])) {
        spans.push({ ...child, bold: true })
      }
    } else if (tok.type === 'em') {
      for (const child of parseInline((tok as any).tokens ?? [])) {
        spans.push({ ...child, italic: true })
      }
    } else if (tok.type === 'codespan') {
      spans.push({ text: (tok as any).text, code: true })
    } else if (tok.type === 'link') {
      for (const child of parseInline((tok as any).tokens ?? [])) {
        spans.push(child)
      }
    } else if ('raw' in tok) {
      spans.push({ text: (tok as any).raw })
    }
  }
  return spans
}

function spansToRuns(spans: Span[]): TextRun[] {
  return spans.map(
    (s) =>
      new TextRun({
        text: s.text,
        bold: s.bold,
        italics: s.italic,
        font: s.code ? 'Courier New' : undefined,
      })
  )
}

const HEADING_LEVEL_MAP: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
  1: HeadingLevel.HEADING_1,
  2: HeadingLevel.HEADING_2,
  3: HeadingLevel.HEADING_3,
  4: HeadingLevel.HEADING_4,
  5: HeadingLevel.HEADING_5,
  6: HeadingLevel.HEADING_6,
}

function tokensToParagraphs(tokens: Token[]): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = []

  for (const token of tokens) {
    switch (token.type) {
      case 'heading': {
        const t = token as Tokens.Heading
        const spans = parseInline(t.tokens ?? [])
        elements.push(
          new Paragraph({
            heading: HEADING_LEVEL_MAP[t.depth] ?? HeadingLevel.HEADING_6,
            children: spansToRuns(spans),
          })
        )
        break
      }

      case 'paragraph': {
        const t = token as Tokens.Paragraph
        const spans = parseInline(t.tokens ?? [])
        elements.push(new Paragraph({ children: spansToRuns(spans) }))
        break
      }

      case 'code': {
        const t = token as Tokens.Code
        for (const line of t.text.split('\n')) {
          elements.push(
            new Paragraph({
              children: [new TextRun({ text: line, font: 'Courier New' })],
              shading: { type: ShadingType.SOLID, color: 'F4F4F4', fill: 'F4F4F4' },
            })
          )
        }
        break
      }

      case 'blockquote': {
        const t = token as Tokens.Blockquote
        const inner = t.tokens.map((tok) => ('text' in tok ? (tok as any).text : '')).join(' ')
        elements.push(
          new Paragraph({
            children: [new TextRun({ text: inner, italics: true, color: '555555' })],
            indent: { left: 720 },
          })
        )
        break
      }

      case 'list': {
        const t = token as Tokens.List
        t.items.forEach((item, i) => {
          const spans = parseInline(
            item.tokens
              .filter((tok) => tok.type !== 'list')
              .flatMap((tok) => (tok.type === 'text' ? [tok] : ((tok as any).tokens ?? [tok])))
          )
          elements.push(
            new Paragraph({
              children: spansToRuns(spans.length ? spans : [{ text: item.text }]),
              bullet: t.ordered ? undefined : { level: 0 },
              numbering: t.ordered ? { reference: 'default-numbering', level: 0 } : undefined,
            })
          )
        })
        break
      }

      case 'hr': {
        elements.push(
          new Paragraph({
            children: [],
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC', space: 1 } },
          })
        )
        break
      }

      case 'table': {
        const t = token as Tokens.Table
        const rows: TableRow[] = []

        // Header row
        rows.push(
          new TableRow({
            children: t.header.map(
              (cell) =>
                new TableCell({
                  children: [
                    new Paragraph({ children: [new TextRun({ text: cell.text, bold: true })] }),
                  ],
                  shading: { type: ShadingType.SOLID, color: 'F0F0F0', fill: 'F0F0F0' },
                  width: { size: Math.floor(9000 / t.header.length), type: WidthType.DXA },
                })
            ),
            tableHeader: true,
          })
        )

        // Data rows
        for (const row of t.rows) {
          rows.push(
            new TableRow({
              children: row.map(
                (cell) =>
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: cell.text })] })],
                    width: { size: Math.floor(9000 / t.header.length), type: WidthType.DXA },
                  })
              ),
            })
          )
        }

        elements.push(new Table({ rows, alignment: AlignmentType.LEFT }))
        break
      }

      case 'space':
        elements.push(new Paragraph({ children: [] }))
        break

      default:
        break
    }
  }

  return elements
}

export async function markdownToDocxBuffer(markdown: string): Promise<Buffer> {
  const tokens = marked.lexer(markdown)
  const children = tokensToParagraphs(tokens)

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: 'default-numbering',
          levels: [
            {
              level: 0,
              format: 'decimal',
              text: '%1.',
              alignment: AlignmentType.START,
            },
          ],
        },
      ],
    },
    sections: [{ children }],
  })

  return Packer.toBuffer(doc)
}
