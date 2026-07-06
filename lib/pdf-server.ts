/**
 * Server-side PDF text extraction.
 * This module sets up the pdfjs worker before importing pdf-parse,
 * ensuring `globalThis.pdfjsWorker` is populated before pdfjs caches
 * its fake-worker loader.
 */

import path from 'path'
import { pathToFileURL } from 'url'

let initialized = false

async function ensureWorker() {
  if (initialized) return
  initialized = true
  const workerPath = path.join(
    process.cwd(),
    'node_modules',
    'pdf-parse',
    'dist',
    'worker',
    'pdf.worker.mjs',
  )
  const workerUrl = pathToFileURL(workerPath).href
  // Use indirect eval so Turbopack doesn't try to statically bundle this import
  if (!(globalThis as any).pdfjsWorker) {
    ;(globalThis as any).pdfjsWorker = await (0, eval)(`import('${workerUrl}')`)
  }
}

export async function pdfToText(base64: string): Promise<{ text: string; numpages: number }> {
  await ensureWorker()
  const { PDFParse } = await import('pdf-parse')
  const buffer = Buffer.from(base64, 'base64')
  const parser = new (PDFParse as any)({ data: buffer })
  const data = await parser.getText()
  return { text: data.text as string, numpages: (data.numpages ?? data.total ?? 0) as number }
}
