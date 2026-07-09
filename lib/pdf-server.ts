// Import this before importing "pdf-parse"
import { getPath, getData } from 'pdf-parse/worker'
import { PDFParse } from 'pdf-parse'
import type {} from 'pdf-parse'

function installDOMMatrixPolyfill() {
  if (typeof globalThis.DOMMatrix !== 'undefined') return

  class DOMMatrixPolyfill {
    a = 1
    b = 0
    c = 0
    d = 1
    e = 0
    f = 0
    m11 = 1
    m12 = 0
    m13 = 0
    m14 = 0
    m21 = 0
    m22 = 1
    m23 = 0
    m24 = 0
    m31 = 0
    m32 = 0
    m33 = 1
    m34 = 0
    m41 = 0
    m42 = 0
    m43 = 0
    m44 = 1
    is2D = true
    isIdentity = true
    constructor(_init?: string | number[]) {}
    invertSelf() {
      return this
    }
    multiplySelf() {
      return this
    }
    preMultiplySelf() {
      return this
    }
    translate(_tx?: number, _ty?: number, _tz?: number) {
      return new DOMMatrixPolyfill()
    }
    scale(_sx?: number, _sy?: number, _sz?: number) {
      return new DOMMatrixPolyfill()
    }
    getTransform() {
      return this
    }
  }

  ;(globalThis as any).DOMMatrix = DOMMatrixPolyfill
}

let initialized = false

function ensureInit() {
  if (initialized) return
  initialized = true
  installDOMMatrixPolyfill()

  // Let the package resolve its own worker instead of hand-rolling a path —
  // this is what actually breaks on Vercel's file tracing/pnpm symlinks.
  try {
    PDFParse.setWorker(getPath())
  } catch {
    // Fallback: inline the worker source directly if the path isn't
    // resolvable in the deployed bundle.
    PDFParse.setWorker(getData())
  }
}

export async function pdfToText(base64: string): Promise<{ text: string; numpages: number }> {
  ensureInit()
  const buffer = Buffer.from(base64, 'base64')
  const parser = new PDFParse({ data: new Uint8Array(buffer) })
  try {
    const result = await parser.getText()
    return { text: result.text as string, numpages: (result.total ?? 0) as number }
  } finally {
    await parser.destroy()
  }
}
