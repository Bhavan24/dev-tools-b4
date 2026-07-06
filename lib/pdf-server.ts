import path from 'path'
import { pathToFileURL } from 'url'

let initialized = false

async function ensureWorker() {
  if (initialized) return
  initialized = true
  const { PDFParse } = await import('pdf-parse')
  const workerPath = path.join(
    process.cwd(),
    'node_modules',
    'pdf-parse',
    'dist',
    'pdf-parse',
    'esm',
    'pdf.worker.mjs',
  )
  const workerUrl = pathToFileURL(workerPath).href
  ;(PDFParse as any).setWorker(workerUrl)
}

export async function pdfToText(base64: string): Promise<{ text: string; numpages: number }> {
  await ensureWorker()
  const { PDFParse } = await import('pdf-parse')
  const buffer = Buffer.from(base64, 'base64')
  const data = new Uint8Array(buffer)
  const parser = new (PDFParse as any)({ data })
  const result = await parser.getText()
  return { text: result.text as string, numpages: (result.total ?? 0) as number }
}
