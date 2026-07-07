import mammoth from 'mammoth'
import type { Message } from 'mammoth'

export async function docxToHtml(base64: string): Promise<{ html: string; messages: Message[] }> {
  const buffer = Buffer.from(base64, 'base64')
  const result = await mammoth.convertToHtml({ buffer })
  return { html: result.value, messages: result.messages }
}
