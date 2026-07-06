import { Buffer } from 'buffer'
import { generateMockData, rgbToHex, hexToRgb, rgbToHsl, hexToHsl, hslToRgb, hslToHex } from './helpers'
import QRCode from 'qrcode'

interface ToolHandler {
  description: string
  schema: {
    type: string
    properties: Record<string, any>
    required?: string[]
  }
  handler: (input: any) => Promise<any>
}

export const toolHandlers: Record<string, ToolHandler> = {
  'js-minifier': {
    description: 'Minify JavaScript code',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'JavaScript code to minify' },
      },
      required: ['code'],
    },
    handler: async (input) => {
      const { code } = input
      return minifyCode(code, 'js')
    },
  },

  'js-beautifier': {
    description: 'Beautify JavaScript code',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'JavaScript code to beautify' },
        indent: { type: 'number', description: 'Indentation spaces (default: 2)', default: 2 },
      },
      required: ['code'],
    },
    handler: async (input) => {
      const { code, indent = 2 } = input
      return beautifyCode(code, indent)
    },
  },

  'css-minifier': {
    description: 'Minify CSS code',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'CSS code to minify' },
      },
      required: ['code'],
    },
    handler: async (input) => {
      const { code } = input
      return minifyCode(code, 'css')
    },
  },

  'css-beautifier': {
    description: 'Beautify CSS code',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'CSS code to beautify' },
        indent: { type: 'number', description: 'Indentation spaces (default: 2)', default: 2 },
      },
      required: ['code'],
    },
    handler: async (input) => {
      const { code, indent = 2 } = input
      return beautifyCode(code, indent)
    },
  },

  'json-minifier': {
    description: 'Minify JSON',
    schema: {
      type: 'object',
      properties: {
        json: { type: 'string', description: 'JSON string to minify' },
      },
      required: ['json'],
    },
    handler: async (input) => {
      const { json } = input
      try {
        const parsed = JSON.parse(json)
        return JSON.stringify(parsed)
      } catch (e) {
        throw new Error('Invalid JSON')
      }
    },
  },

  'json-beautifier': {
    description: 'Beautify JSON',
    schema: {
      type: 'object',
      properties: {
        json: { type: 'string', description: 'JSON string to beautify' },
        indent: { type: 'number', description: 'Indentation spaces (default: 2)', default: 2 },
      },
      required: ['json'],
    },
    handler: async (input) => {
      const { json, indent = 2 } = input
      try {
        const parsed = JSON.parse(json)
        return JSON.stringify(parsed, null, indent)
      } catch (e) {
        throw new Error('Invalid JSON')
      }
    },
  },

  'json-generator': {
    description: 'Generate valid JSON with random data',
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string', description: 'Data type: person, product, todo, note (default: person)' },
        count: { type: 'number', description: 'Number of records to generate (default: 10)', default: 10 },
      },
      required: ['type'],
    },
    handler: async (input) => {
      const { type, count = 10 } = input
      const data = generateMockData(type, count)
      return JSON.stringify(data, null, 2)
    },
  },

  'timestamp-converter': {
    description: 'Convert between Unix timestamps and dates',
    schema: {
      type: 'object',
      properties: {
        input: { type: 'string', description: 'Unix timestamp or ISO date string' },
      },
      required: ['input'],
    },
    handler: async (input) => {
      const { input: value } = input
      const num = Number(value)
      if (!isNaN(num) && num > 0) {
        const date = new Date(num * 1000)
        return {
          unix: num,
          iso: date.toISOString(),
          readable: date.toLocaleString(),
        }
      }
      try {
        const date = new Date(value)
        if (isNaN(date.getTime())) throw new Error('Invalid date')
        return {
          unix: Math.floor(date.getTime() / 1000),
          iso: date.toISOString(),
          readable: date.toLocaleString(),
        }
      } catch (e) {
        throw new Error('Invalid timestamp or date')
      }
    },
  },

  'url-splitter': {
    description: 'Parse and decompose URLs',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to parse' },
      },
      required: ['url'],
    },
    handler: async (input) => {
      const { url } = input
      try {
        const parsed = new URL(url)
        return {
          protocol: parsed.protocol,
          hostname: parsed.hostname,
          port: parsed.port || 'default',
          pathname: parsed.pathname,
          search: parsed.search,
          hash: parsed.hash,
          origin: parsed.origin,
          href: parsed.href,
        }
      } catch (e) {
        throw new Error('Invalid URL')
      }
    },
  },

  'url-encoder-decoder': {
    description: 'Encode and decode URLs',
    schema: {
      type: 'object',
      properties: {
        input: { type: 'string', description: 'Text to encode/decode' },
        action: { type: 'string', enum: ['encode', 'decode'], description: 'Action to perform' },
      },
      required: ['input', 'action'],
    },
    handler: async (input) => {
      const { input: value, action } = input
      try {
        if (action === 'encode') {
          return encodeURIComponent(value)
        } else {
          return decodeURIComponent(value)
        }
      } catch (e) {
        throw new Error('Invalid input for URL operation')
      }
    },
  },

  'html-encoder-decoder': {
    description: 'Encode and decode HTML entities',
    schema: {
      type: 'object',
      properties: {
        input: { type: 'string', description: 'Text to encode/decode' },
        action: { type: 'string', enum: ['encode', 'decode'], description: 'Action to perform' },
      },
      required: ['input', 'action'],
    },
    handler: async (input) => {
      const { input: value, action } = input
      const htmlEntities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      }
      if (action === 'encode') {
        return value.replace(/[&<>"']/g, (char) => htmlEntities[char])
      } else {
        return value
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
      }
    },
  },

  'base64-encoder': {
    description: 'Encode text to Base64',
    schema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Text to encode' },
      },
      required: ['text'],
    },
    handler: async (input) => {
      const { text } = input
      return Buffer.from(text).toString('base64')
    },
  },

  'base64-decoder': {
    description: 'Decode Base64 text',
    schema: {
      type: 'object',
      properties: {
        base64: { type: 'string', description: 'Base64 string to decode' },
      },
      required: ['base64'],
    },
    handler: async (input) => {
      const { base64 } = input
      try {
        return Buffer.from(base64, 'base64').toString('utf-8')
      } catch (e) {
        throw new Error('Invalid Base64 string')
      }
    },
  },

  'jwt-decoder': {
    description: 'Decode JWT tokens',
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'JWT token to decode' },
      },
      required: ['token'],
    },
    handler: async (input) => {
      const { token } = input
      const parts = token.split('.')
      if (parts.length !== 3) throw new Error('Invalid JWT format')
      try {
        const header = JSON.parse(Buffer.from(parts[0], 'base64').toString())
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
        return {
          header,
          payload,
          signature: parts[2],
        }
      } catch (e) {
        throw new Error('Failed to decode JWT')
      }
    },
  },

  'color-code-picker': {
    description: 'Convert between HEX, RGB, and HSL color formats',
    schema: {
      type: 'object',
      properties: {
        color: { type: 'string', description: 'Color code (HEX, RGB, or HSL format)' },
        to: { type: 'string', description: 'Target format: hex, rgb, hsl' },
      },
      required: ['color', 'to'],
    },
    handler: async (input) => {
      const { color, to } = input
      const trimmed = color.trim()
      const result: Record<string, any> = { original: color }

      try {
        if (trimmed.startsWith('#')) {
          const hex = trimmed
          result.hex = hex
          const rgb = hexToRgb(hex)
          if (rgb) {
            result.rgb = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
            result.hsl = `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`
          }
        } else if (trimmed.startsWith('rgb')) {
          const match = trimmed.match(/\d+/g)
          if (match && match.length >= 3) {
            const r = parseInt(match[0])
            const g = parseInt(match[1])
            const b = parseInt(match[2])
            result.rgb = `rgb(${r}, ${g}, ${b})`
            result.hex = rgbToHex(r, g, b)
            const hsl = rgbToHsl(r, g, b)
            result.hsl = `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`
          }
        } else if (trimmed.startsWith('hsl')) {
          const match = trimmed.match(/\d+/g)
          if (match && match.length >= 3) {
            const h = parseInt(match[0])
            const s = parseInt(match[1])
            const l = parseInt(match[2])
            const rgb = hslToRgb(h, s, l)
            result.hsl = `hsl(${h}, ${s}%, ${l}%)`
            result.rgb = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
            result.hex = hslToHex(h, s, l)
          }
        } else {
          throw new Error('Invalid color format. Use HEX (#fff), RGB (255,255,255), or HSL (0,0%,100%)')
        }

        return result
      } catch (e) {
        throw new Error('Invalid color format')
      }
    },
  },

  'mime-type-checker': {
    description: 'Check MIME type by file extension',
    schema: {
      type: 'object',
      properties: {
        filename: { type: 'string', description: 'Filename to check' },
      },
      required: ['filename'],
    },
    handler: async (input) => {
      const { filename } = input
      const mimeTypes: Record<string, string> = {
        'json': 'application/json',
        'xml': 'application/xml',
        'html': 'text/html',
        'css': 'text/css',
        'js': 'application/javascript',
        'txt': 'text/plain',
        'pdf': 'application/pdf',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'svg': 'image/svg+xml',
        'mp4': 'video/mp4',
        'mp3': 'audio/mpeg',
        'zip': 'application/zip',
        'yaml': 'application/yaml',
        'yml': 'application/yaml',
        'csv': 'text/csv',
      }
      const ext = filename.split('.').pop()?.toLowerCase() || ''
      return mimeTypes[ext] || 'application/octet-stream'
    },
  },

  'xml-string-escaper': {
    description: 'Escape special characters in XML strings',
    schema: {
      type: 'object',
      properties: {
        input: { type: 'string', description: 'Text to escape' },
        action: { type: 'string', enum: ['escape', 'unescape'], description: 'Action' },
      },
      required: ['input', 'action'],
    },
    handler: async (input) => {
      const { input: value, action } = input
      if (action === 'escape') {
        return value
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;')
      } else {
        return value
          .replace(/&apos;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/&gt;/g, '>')
          .replace(/&lt;/g, '<')
          .replace(/&amp;/g, '&')
      }
    },
  },

  'js-string-escaper': {
    description: 'Escape JavaScript strings',
    schema: {
      type: 'object',
      properties: {
        input: { type: 'string', description: 'Text to escape' },
      },
      required: ['input'],
    },
    handler: async (input) => {
      const { input: value } = input
      return JSON.stringify(value).slice(1, -1)
    },
  },

  'regex-parser': {
    description: 'Test regular expressions',
    schema: {
      type: 'object',
      properties: {
        pattern: { type: 'string', description: 'Regex pattern' },
        flags: { type: 'string', description: 'Regex flags (g, i, m, etc.)', default: '' },
        testString: { type: 'string', description: 'String to test' },
      },
      required: ['pattern', 'testString'],
    },
    handler: async (input) => {
      const { pattern, flags = '', testString } = input
      try {
        const regex = new RegExp(pattern, flags)
        const matches = testString.match(regex)
        return {
          isValid: true,
          matches: matches || [],
          hasMatch: regex.test(testString),
        }
      } catch (e) {
        throw new Error('Invalid regex pattern')
      }
    },
  },

  'yaml-validator': {
    description: 'Validate YAML syntax',
    schema: {
      type: 'object',
      properties: {
        yaml: { type: 'string', description: 'YAML content to validate' },
      },
      required: ['yaml'],
    },
    handler: async (input) => {
      const { yaml } = input
      try {
        const jsYaml = await import('js-yaml')
        jsYaml.load(yaml)
        return { isValid: true, message: 'Valid YAML' }
      } catch (e: any) {
        throw new Error(`Invalid YAML: ${e.message}`)
      }
    },
  },

  'js-validator': {
    description: 'Validate JavaScript code',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'JavaScript code to validate' },
      },
      required: ['code'],
    },
    handler: async (input) => {
      const { code } = input
      try {
        new Function(code)
        return { isValid: true, message: 'Valid JavaScript' }
      } catch (e: any) {
        throw new Error(`Invalid JavaScript: ${e.message}`)
      }
    },
  },

  'json-formatter': {
    description: 'Format JSON with indentation',
    schema: {
      type: 'object',
      properties: {
        json: { type: 'string', description: 'JSON to format' },
        indent: { type: 'number', description: 'Indent spaces', default: 2 },
      },
      required: ['json'],
    },
    handler: async (input) => {
      const { json, indent = 2 } = input
      try {
        const parsed = JSON.parse(json)
        return JSON.stringify(parsed, null, indent)
      } catch (e) {
        throw new Error('Invalid JSON')
      }
    },
  },

  'xml-formatter': {
    description: 'Format XML with indentation',
    schema: {
      type: 'object',
      properties: {
        xml: { type: 'string', description: 'XML to format' },
        indent: { type: 'number', description: 'Indent spaces', default: 2 },
      },
      required: ['xml'],
    },
    handler: async (input) => {
      const { xml, indent = 2 } = input
      return formatXml(xml, indent)
    },
  },

  'sql-formatter': {
    description: 'Format SQL queries',
    schema: {
      type: 'object',
      properties: {
        sql: { type: 'string', description: 'SQL to format' },
      },
      required: ['sql'],
    },
    handler: async (input) => {
      const { sql } = input
      return formatSql(sql)
    },
  },

  'html-formatter': {
    description: 'Format HTML with indentation',
    schema: {
      type: 'object',
      properties: {
        html: { type: 'string', description: 'HTML to format' },
        indent: { type: 'number', description: 'Indent spaces', default: 2 },
      },
      required: ['html'],
    },
    handler: async (input) => {
      const { html, indent = 2 } = input
      return formatHtml(html, indent)
    },
  },

  'html-beautifier': {
    description: 'Beautify HTML code',
    schema: {
      type: 'object',
      properties: {
        html: { type: 'string', description: 'HTML to beautify' },
      },
      required: ['html'],
    },
    handler: async (input) => {
      const { html } = input
      return formatHtml(html, 2)
    },
  },

  'json-to-java': {
    description: 'Convert JSON to Java POJO',
    schema: {
      type: 'object',
      properties: {
        json: { type: 'string', description: 'JSON to convert' },
        className: { type: 'string', description: 'Class name', default: 'Data' },
      },
      required: ['json'],
    },
    handler: async (input) => {
      const { json, className = 'Data' } = input
      try {
        const obj = JSON.parse(json)
        return generateJavaClass(obj, className)
      } catch (e) {
        throw new Error('Invalid JSON')
      }
    },
  },

  'json-to-xml': {
    description: 'Convert JSON to XML',
    schema: {
      type: 'object',
      properties: {
        json: { type: 'string', description: 'JSON to convert' },
        rootElement: { type: 'string', description: 'Root element name', default: 'root' },
      },
      required: ['json'],
    },
    handler: async (input) => {
      const { json, rootElement = 'root' } = input
      try {
        const obj = JSON.parse(json)
        return jsonToXml(obj, rootElement)
      } catch (e) {
        throw new Error('Invalid JSON')
      }
    },
  },

  'json-to-php': {
    description: 'Convert JSON to PHP array',
    schema: {
      type: 'object',
      properties: {
        json: { type: 'string', description: 'JSON to convert' },
      },
      required: ['json'],
    },
    handler: async (input) => {
      const { json } = input
      try {
        const obj = JSON.parse(json)
        return generatePhpArray(obj)
      } catch (e) {
        throw new Error('Invalid JSON')
      }
    },
  },

  'json-to-csharp': {
    description: 'Convert JSON to C# classes',
    schema: {
      type: 'object',
      properties: {
        json: { type: 'string', description: 'JSON to convert' },
        className: { type: 'string', description: 'Class name', default: 'Data' },
      },
      required: ['json'],
    },
    handler: async (input) => {
      const { json, className = 'Data' } = input
      try {
        const obj = JSON.parse(json)
        return generateCSharpClass(obj, className)
      } catch (e) {
        throw new Error('Invalid JSON')
      }
    },
  },

  'xml-to-yaml': {
    description: 'Convert XML to YAML',
    schema: {
      type: 'object',
      properties: {
        xml: { type: 'string', description: 'XML to convert' },
      },
      required: ['xml'],
    },
    handler: async (input) => {
      const { xml } = input
      try {
        const obj = xmlToJson(xml)
        const jsYaml = await import('js-yaml')
        return jsYaml.dump(obj, { lineWidth: -1 })
      } catch (e) {
        throw new Error('Invalid XML or conversion failed')
      }
    },
  },

  'xml-to-json': {
    description: 'Convert XML to JSON',
    schema: {
      type: 'object',
      properties: {
        xml: { type: 'string', description: 'XML to convert' },
      },
      required: ['xml'],
    },
    handler: async (input) => {
      const { xml } = input
      try {
        const obj = xmlToJson(xml)
        return JSON.stringify(obj, null, 2)
      } catch (e) {
        throw new Error('Invalid XML')
      }
    },
  },

  'ini-to-json': {
    description: 'Convert INI to JSON',
    schema: {
      type: 'object',
      properties: {
        ini: { type: 'string', description: 'INI content to convert' },
      },
      required: ['ini'],
    },
    handler: async (input) => {
      const { ini } = input
      return JSON.stringify(parseIni(ini), null, 2)
    },
  },

  'ini-to-xml': {
    description: 'Convert INI to XML',
    schema: {
      type: 'object',
      properties: {
        ini: { type: 'string', description: 'INI content to convert' },
      },
      required: ['ini'],
    },
    handler: async (input) => {
      const { ini } = input
      const obj = parseIni(ini)
      return jsonToXml(obj, 'config')
    },
  },

  'ini-to-yaml': {
    description: 'Convert INI to YAML',
    schema: {
      type: 'object',
      properties: {
        ini: { type: 'string', description: 'INI content to convert' },
      },
      required: ['ini'],
    },
    handler: async (input) => {
      const { ini } = input
      const obj = parseIni(ini)
      const jsYaml = await import('js-yaml')
      return jsYaml.dump(obj, { lineWidth: -1 })
    },
  },

  'csv-to-json': {
    description: 'Convert CSV to JSON',
    schema: {
      type: 'object',
      properties: {
        csv: { type: 'string', description: 'CSV content to convert' },
        hasHeader: { type: 'boolean', description: 'First row is header', default: true },
      },
      required: ['csv'],
    },
    handler: async (input) => {
      const { csv, hasHeader = true } = input
      const lines = csv.trim().split('\n')
      if (lines.length === 0) throw new Error('Empty CSV')

      const rows = lines.map((line: string) => parseCSVLine(line))
      const result = hasHeader
        ? rows.slice(1).map((row: string[]) => {
            const obj: Record<string, any> = {}
            rows[0]!.forEach((header: string, i: number) => {
              obj[header] = row[i]
            })
            return obj
          })
        : rows

      return JSON.stringify(result, null, 2)
    },
  },

  'csv-to-xml': {
    description: 'Convert CSV to XML',
    schema: {
      type: 'object',
      properties: {
        csv: { type: 'string', description: 'CSV content to convert' },
      },
      required: ['csv'],
    },
    handler: async (input) => {
      const { csv } = input
      const lines = csv.trim().split('\n')
      if (lines.length === 0) throw new Error('Empty CSV')

      const headers = parseCSVLine(lines[0]!)
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<rows>\n'

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]!)
        xml += '  <row>\n'
        headers.forEach((header: string, idx: number) => {
          xml += `    <${header}>${escapeXml(values[idx] || '')}</${header}>\n`
        })
        xml += '  </row>\n'
      }
      xml += '</rows>'
      return xml
    },
  },

  'csv-to-yaml': {
    description: 'Convert CSV to YAML',
    schema: {
      type: 'object',
      properties: {
        csv: { type: 'string', description: 'CSV content to convert' },
      },
      required: ['csv'],
    },
    handler: async (input) => {
      const { csv } = input
      const lines = csv.trim().split('\n')
      if (lines.length === 0) throw new Error('Empty CSV')

      const headers = parseCSVLine(lines[0]!)
      const rows: Record<string, any>[] = []

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]!)
        const obj: Record<string, any> = {}
        headers.forEach((header: string, idx: number) => {
          obj[header] = values[idx]
        })
        rows.push(obj)
      }

      const jsYaml = await import('js-yaml')
      return jsYaml.dump(rows, { lineWidth: -1 })
    },
  },

  'csv-to-sql': {
    description: 'Convert CSV to SQL INSERT',
    schema: {
      type: 'object',
      properties: {
        csv: { type: 'string', description: 'CSV content to convert' },
        tableName: { type: 'string', description: 'Table name', default: 'table1' },
      },
      required: ['csv'],
    },
    handler: async (input) => {
      const { csv, tableName = 'table1' } = input
      const lines = csv.trim().split('\n')
      if (lines.length === 0) throw new Error('Empty CSV')

      const headers = parseCSVLine(lines[0])
      let sql = ''

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i])
        const cols = headers.map((h: string) => h).join(', ')
        const vals = values.map((v: string) => `'${v.replace(/'/g, "''")}'`).join(', ')
        sql += `INSERT INTO ${tableName} (${cols}) VALUES (${vals});\n`
      }

      return sql.trim()
    },
  },

  'yaml-to-json': {
    description: 'Convert YAML to JSON',
    schema: {
      type: 'object',
      properties: {
        yaml: { type: 'string', description: 'YAML to convert' },
      },
      required: ['yaml'],
    },
    handler: async (input) => {
      const { yaml } = input
      try {
        const jsYaml = await import('js-yaml')
        const obj = jsYaml.load(yaml)
        return JSON.stringify(obj, null, 2)
      } catch (e) {
        throw new Error('Invalid YAML')
      }
    },
  },

  'json-to-yaml': {
    description: 'Convert JSON to YAML',
    schema: {
      type: 'object',
      properties: {
        json: { type: 'string', description: 'JSON to convert' },
      },
      required: ['json'],
    },
    handler: async (input) => {
      const { json } = input
      try {
        const obj = JSON.parse(json)
        const jsYaml = await import('js-yaml')
        return jsYaml.dump(obj, { lineWidth: -1 })
      } catch (e) {
        throw new Error('Invalid JSON')
      }
    },
  },

  'rgb-to-hex': {
    description: 'Convert RGB to HEX',
    schema: {
      type: 'object',
      properties: {
        r: { type: 'number', description: 'Red value (0-255)' },
        g: { type: 'number', description: 'Green value (0-255)' },
        b: { type: 'number', description: 'Blue value (0-255)' },
      },
      required: ['r', 'g', 'b'],
    },
    handler: async (input) => {
      const { r, g, b } = input
      const toHex = (n: number) => {
        const hex = Math.max(0, Math.min(255, n)).toString(16)
        return hex.length === 1 ? '0' + hex : hex
      }
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
    },
  },

  'hex-to-rgb': {
    description: 'Convert HEX to RGB',
    schema: {
      type: 'object',
      properties: {
        hex: { type: 'string', description: 'HEX color code' },
      },
      required: ['hex'],
    },
    handler: async (input) => {
      const { hex } = input
      const cleanHex = hex.replace('#', '').toLowerCase()
      if (!/^[0-9a-f]{6}$/.test(cleanHex)) throw new Error('Invalid HEX color')

      const r = parseInt(cleanHex.substring(0, 2), 16)
      const g = parseInt(cleanHex.substring(2, 4), 16)
      const b = parseInt(cleanHex.substring(4, 6), 16)

      return { r, g, b, rgb: `rgb(${r}, ${g}, ${b})` }
    },
  },

  'idn-converter': {
    description: 'Convert between IDN and Punycode',
    schema: {
      type: 'object',
      properties: {
        input: { type: 'string', description: 'Domain to convert' },
        action: { type: 'string', enum: ['toAscii', 'toUnicode'], description: 'Conversion direction' },
      },
      required: ['input', 'action'],
    },
    handler: async (input) => {
      const { input: domain, action } = input
      if (action === 'toAscii') {
        return encodeURIComponent(domain).replace(/%/g, '-')
      } else {
        return decodeURIComponent(domain.replace(/-/g, '%'))
      }
    },
  },

  'public-ip-lookup': {
    description: 'Get your public IP address',
    schema: {
      type: 'object',
      properties: {},
      required: [],
    },
    handler: async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json')
        const data = await response.json()
        return { ip: data.ip, message: `Your public IP address is: ${data.ip}` }
      } catch (error) {
        throw new Error('Failed to fetch public IP address')
      }
    },
  },

  'text-case-converter': {
    description: 'Convert text between different cases',
    schema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Text to convert' },
        case: { type: 'string', description: 'Target case: uppercase, lowercase, capitalize, camelCase, snake_case, kebab-case, PascalCase' },
      },
      required: ['text', 'case'],
    },
    handler: async (input) => {
      const { text, case: targetCase } = input
      const result: Record<string, any> = { original: text }

      switch (targetCase) {
        case 'uppercase':
          result.converted = text.toUpperCase()
          break
        case 'lowercase':
          result.converted = text.toLowerCase()
          break
        case 'capitalize':
          result.converted = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
          break
        case 'camelCase':
          result.converted = text.replace(/[\s_-]+(.)/g, (_: string, char: string) => char.toUpperCase()).replace(/^(.)/, (match: string) => match.toLowerCase())
          break
        case 'snake_case':
          result.converted = text.replace(/([a-z])([A-Z])/g, '$1_$2').replace(/[\s-]+/g, '_').toLowerCase()
          break
        case 'kebab-case':
          result.converted = text.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[\s_]+/g, '-').toLowerCase()
          break
        case 'PascalCase':
          result.converted = text.split(/[\s_-]+/).map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('')
          break
        default:
          throw new Error('Invalid case type')
      }
      return result
    },
  },

  'unit-converter': {
    description: 'Convert between different units of measurement',
    schema: {
      type: 'object',
      properties: {
        value: { type: 'number', description: 'Value to convert' },
        fromUnit: { type: 'string', description: 'Source unit (m, km, ft, mi, kg, lb, g, oz, C, F)' },
        toUnit: { type: 'string', description: 'Target unit' },
      },
      required: ['value', 'fromUnit', 'toUnit'],
    },
    handler: async (input) => {
      const { value, fromUnit, toUnit } = input
      const conversions: Record<string, Record<string, any>> = {
        m: { km: 0.001, ft: 3.28084, mi: 0.000621371 },
        km: { m: 1000, ft: 3280.84, mi: 0.621371 },
        ft: { m: 0.3048, km: 0.0003048, mi: 0.000189394 },
        mi: { m: 1609.34, km: 1.60934, ft: 5280 },
        kg: { lb: 2.20462, g: 1000, oz: 35.274 },
        lb: { kg: 0.453592, g: 453.592, oz: 16 },
        g: { kg: 0.001, lb: 0.00220462, oz: 0.035274 },
        oz: { kg: 0.0283495, lb: 0.0625, g: 28.3495 },
      }
      if (!conversions[fromUnit]) throw new Error(`Unknown unit: ${fromUnit}`)
      const conversion = conversions[fromUnit][toUnit]
      if (!conversion) throw new Error(`Cannot convert from ${fromUnit} to ${toUnit}`)
      const converted = value * conversion
      return { original: `${value} ${fromUnit}`, converted: `${converted.toFixed(4)} ${toUnit}`, value: parseFloat(converted.toFixed(4)) }
    },
  },

  'uuid-generator': {
    description: 'Generate UUID v4 identifiers',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number', description: 'Number of UUIDs to generate (default: 1, max: 100)', default: 1 },
      },
      required: [],
    },
    handler: async (input) => {
      const { count = 1 } = input
      const limit = Math.min(Math.max(count, 1), 100)
      const generateUUID = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: string) => { const r = (Math.random() * 16) | 0; const v = c === 'x' ? r : (r & 0x3) | 0x8; return v.toString(16) })
      const uuids = Array.from({ length: limit }, generateUUID)
      return { count: uuids.length, uuids }
    },
  },

  'hash-generator': {
    description: 'Generate cryptographic hashes from text',
    schema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Text to hash' },
        algorithm: { type: 'string', description: 'Hash algorithm: md5, sha1, sha256, sha512' },
      },
      required: ['text', 'algorithm'],
    },
    handler: async (input) => {
      const { text, algorithm } = input
      const crypto = require('crypto')
      const validAlgorithms = ['md5', 'sha1', 'sha256', 'sha512']
      if (!validAlgorithms.includes(algorithm)) throw new Error(`Invalid algorithm. Use: ${validAlgorithms.join(', ')}`)
      const hash = crypto.createHash(algorithm).update(text).digest('hex')
      return { text, algorithm, hash }
    },
  },

  'password-generator': {
    description: 'Generate strong and secure passwords',
    schema: {
      type: 'object',
      properties: {
        length: { type: 'number', description: 'Password length (8-128, default: 16)', default: 16 },
        uppercase: { type: 'boolean', description: 'Include uppercase letters', default: true },
        lowercase: { type: 'boolean', description: 'Include lowercase letters', default: true },
        numbers: { type: 'boolean', description: 'Include numbers', default: true },
        symbols: { type: 'boolean', description: 'Include symbols', default: true },
      },
      required: [],
    },
    handler: async (input) => {
      const { length = 16, uppercase = true, lowercase = true, numbers = true, symbols = true } = input
      if (length < 8 || length > 128) throw new Error('Password length must be between 8 and 128')
      let chars = ''
      if (uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      if (lowercase) chars += 'abcdefghijklmnopqrstuvwxyz'
      if (numbers) chars += '0123456789'
      if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'
      if (!chars) throw new Error('At least one character type must be selected')
      let password = ''
      for (let i = 0; i < length; i++) password += chars.charAt(Math.floor(Math.random() * chars.length))
      return { password, length, hasUppercase: uppercase, hasLowercase: lowercase, hasNumbers: numbers, hasSymbols: symbols }
    },
  },

  'mock-data-generator': {
    description: 'Generate realistic mock data for testing',
    schema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Data category: person, text, web, location, time, finance, miscellaneous (default: person)', default: 'person' },
      },
      required: [],
    },
    handler: async (input) => {
      const { category = 'person' } = input
      const Chance = require('chance')
      const chance = new Chance()

      const mockData: Record<string, Record<string, any>> = {
        person: {
          namePrefix: chance.prefix(),
          firstName: chance.first(),
          lastName: chance.last(),
          fullName: chance.name(),
          gender: chance.gender(),
          age: chance.age(),
          birthDate: chance.birthday(),
          phone: chance.phone(),
          profession: chance.profession(),
        },
        text: {
          word: chance.word(),
          sentence: chance.sentence(),
          paragraph: chance.paragraph(),
          randomString: chance.string({ length: 20 }),
          syllable: chance.syllable(),
        },
        web: {
          email: chance.email(),
          domain: chance.domain(),
          url: chance.url(),
          ipAddress: chance.ip(),
          hexColor: chance.color(),
          company: chance.company(),
          twitterHandle: chance.twitter(),
          securePassword: chance.string({ length: 12, alpha: true, numeric: true, symbols: true }),
        },
        location: {
          address: chance.address(),
          street: chance.street(),
          city: chance.city(),
          state: chance.state(),
          country: chance.country({ full: true }),
          postalCode: chance.zip(),
          latitude: chance.latitude(),
          longitude: chance.longitude(),
        },
        time: {
          dateString: chance.date({ string: true }),
          unixTimestamp: Math.floor(Math.random() * 1000000000),
          year: chance.year(),
          month: chance.month(),
          hour: Math.floor(Math.random() * 24),
          minute: Math.floor(Math.random() * 60),
          second: Math.floor(Math.random() * 60),
        },
        finance: {
          creditCard: chance.cc(),
          currency: chance.currency(),
          amount: Math.round(chance.floating({ min: 10, max: 10000, fixed: 2 }) * 100) / 100,
          accountNumber: chance.string({ length: 10, numeric: true }),
        },
        miscellaneous: {
          uuid: chance.guid(),
          md5Hash: chance.md5(),
          hashValue: chance.hash(),
          androidId: chance.android_id(),
          appleToken: chance.apple_token(),
        },
      }

      const categoryData = mockData[category]
      if (!categoryData) {
        throw new Error(`Invalid category. Use: ${Object.keys(mockData).join(', ')}`)
      }

      return categoryData
    },
  },

  'code-cleaner': {
    description: 'Remove comments and unnecessary whitespace from code',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Code to clean' },
        language: { type: 'string', description: 'Language: js, css, html, py, java (default: js)', default: 'js' },
      },
      required: ['code'],
    },
    handler: async (input) => {
      const { code, language = 'js' } = input
      return cleanCode(code, language)
    },
  },

  'diff-checker': {
    description: 'Compare two texts and highlight differences',
    schema: {
      type: 'object',
      properties: {
        text1: { type: 'string', description: 'First text to compare' },
        text2: { type: 'string', description: 'Second text to compare' },
      },
      required: ['text1', 'text2'],
    },
    handler: async (input) => {
      const { text1, text2 } = input
      const lines1 = text1.split('\n')
      const lines2 = text2.split('\n')
      const diff = computeDiff(lines1, lines2)

      return {
        text1_lines: lines1.length,
        text2_lines: lines2.length,
        diff,
        similarity: calculateSimilarity(text1, text2),
      }
    },
  },

  'html-validator': {
    description: 'Validate HTML markup and check for errors',
    schema: {
      type: 'object',
      properties: {
        html: { type: 'string', description: 'HTML to validate' },
      },
      required: ['html'],
    },
    handler: async (input) => {
      const { html } = input
      const errors = validateHtml(html)

      return {
        isValid: errors.length === 0,
        errorCount: errors.length,
        errors,
      }
    },
  },

  'redirection-checker': {
    description: 'Follow HTTP redirects and check final URL',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to check for redirects' },
        maxRedirects: { type: 'number', description: 'Maximum redirects to follow (default: 10)', default: 10 },
      },
      required: ['url'],
    },
    handler: async (input) => {
      const { url, maxRedirects = 10 } = input
      return checkRedirects(url, maxRedirects)
    },
  },

  'currency-converter': {
    description: 'Convert between currencies with real-time exchange rates',
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', description: 'Amount to convert' },
        from: { type: 'string', description: 'Source currency code (e.g., USD, EUR, GBP)' },
        to: { type: 'string', description: 'Target currency code (e.g., USD, EUR, GBP)' },
      },
      required: ['amount', 'from', 'to'],
    },
    handler: async (input) => {
      const { amount, from, to } = input
      return convertCurrency(amount, from.toUpperCase(), to.toUpperCase())
    },
  },

  'rest-api-tester': {
    description: 'Test REST APIs with custom headers and request body',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'API endpoint URL' },
        method: { type: 'string', description: 'HTTP method (GET, POST, PUT, DELETE, PATCH)', default: 'GET' },
        headers: { type: 'string', description: 'JSON string of headers (e.g., {"Authorization": "Bearer token"})', default: '{}' },
        body: { type: 'string', description: 'Request body as JSON string (for POST/PUT/PATCH)', default: '' },
      },
      required: ['url'],
    },
    handler: async (input) => {
      const { url, method = 'GET', headers = '{}', body = '' } = input
      return testRestApi(url, method, headers, body)
    },
  },

  'qr-code-generator': {
    description: 'Generate a QR code from text or URL',
    schema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Text or URL to encode in the QR code' },
        size: { type: 'number', description: 'Size of the QR code in pixels (default: 256)', default: 256 },
        errorCorrectionLevel: {
          type: 'string',
          enum: ['L', 'M', 'Q', 'H'],
          description: 'Error correction level: L (7%), M (15%), Q (25%), H (30%)',
          default: 'M',
        },
      },
      required: ['text'],
    },
    handler: async (input) => {
      const { text, size = 256, errorCorrectionLevel = 'M' } = input
      if (!text || text.trim().length === 0) {
        throw new Error('Text cannot be empty')
      }
      const dataUrl = await QRCode.toDataURL(text, {
        width: size,
        errorCorrectionLevel,
        margin: 1,
      })
      return { dataUrl, text, size, errorCorrectionLevel }
    },
  },

  'pdf-to-markdown': {
    description: 'Convert a PDF (supplied as base64) to Markdown text',
    schema: {
      type: 'object',
      properties: {
        pdfBase64: { type: 'string', description: 'Base64-encoded PDF file content' },
      },
      required: ['pdfBase64'],
    },
    handler: async (input) => {
      const { pdfBase64 } = input
      const { pdfToText } = await import('./pdf-server')
      const data = await pdfToText(pdfBase64)

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
        // Heuristic: short all-caps lines likely to be section headers
        if (trimmed.length < 80 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed)) {
          mdLines.push(`## ${trimmed}`)
        } else {
          mdLines.push(trimmed)
        }
      }

      // Collapse multiple blank lines into one
      const markdown = mdLines
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim()

      const pageCount: number = data.numpages ?? (data as any).total ?? 0

      return {
        markdown,
        pageCount,
        wordCount: markdown.split(/\s+/).filter(Boolean).length,
      }
    },
  },

  'favicon-generator': {
    description: 'Generate favicon sizes from an uploaded image',
    schema: {
      type: 'object',
      properties: {
        imageBase64: { type: 'string', description: 'Base64-encoded image (PNG, JPEG, JPG, or WebP)' },
        mimeType: { type: 'string', description: 'MIME type of the image (image/png, image/jpeg, image/webp)' },
      },
      required: ['imageBase64', 'mimeType'],
    },
    handler: async (input) => {
      const { imageBase64, mimeType } = input
      const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
      if (!allowed.includes(mimeType)) {
        throw new Error('Unsupported image type. Use PNG, JPEG, JPG, or WebP.')
      }
      return {
        imageBase64,
        mimeType,
        message: 'Image received. Use the browser UI to download favicon sizes.',
      }
    },
  },
}

// Helper functions
function minifyCode(code: string, type: 'js' | 'css'): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}():;,])\s*/g, '$1')
    .trim()
}

function beautifyCode(code: string, indent: number): string {
  const spaces = ' '.repeat(indent)
  let result = ''
  let level = 0
  let inString = false
  let stringChar = ''

  for (let i = 0; i < code.length; i++) {
    const char: string = code[i]!
    const nextChar = code[i + 1]

    if ((char === '"' || char === "'") && code[i - 1] !== '\\') {
      inString = !inString
      stringChar = char
    }

    if (!inString) {
      if (char === '{' || char === '[' || char === '(') {
        result += char
        if (nextChar && nextChar !== ';' && nextChar !== ',') {
          level++
          result += '\n' + spaces.repeat(level)
        }
      } else if (char === '}' || char === ']' || char === ')') {
        level = Math.max(0, level - 1)
        if (result.endsWith(' ') || result.endsWith('\n' + spaces.repeat(level))) {
          result = result.trimEnd()
        }
        result += '\n' + spaces.repeat(level) + char
        if (nextChar !== ';' && nextChar !== ',' && nextChar !== '}') {
          result += '\n' + spaces.repeat(level)
        }
      } else if (char === ';' || char === ',') {
        result += char
        if (nextChar && nextChar !== '\n') {
          result += '\n' + spaces.repeat(level)
        }
      } else {
        result += char
      }
    } else {
      result += char
    }
  }

  return result.trim()
}

function formatXml(xml: string, indent: number): string {
  const spaces = ' '.repeat(indent)
  let level = 0
  let result = ''
  let inTag = false
  let tag = ''

  for (let i = 0; i < xml.length; i++) {
    const char = xml[i]

    if (char === '<') {
      inTag = true
      if (tag.trim()) {
        result += tag.trim() + '\n'
        tag = ''
      }
      tag = char
    } else if (char === '>') {
      tag += char
      inTag = false

      const isClosing = tag.includes('</')
      const isSelfClosing = tag.includes('/>')

      if (isClosing) {
        level = Math.max(0, level - 1)
        result += spaces.repeat(level) + tag + '\n'
      } else {
        result += spaces.repeat(level) + tag + '\n'
        if (!isSelfClosing) {
          level++
        }
      }
      tag = ''
    } else if (inTag) {
      tag += char
    } else if (char.trim()) {
      tag += char
    }
  }

  return result.trim()
}

function formatSql(sql: string): string {
  const keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'GROUP', 'BY', 'ORDER', 'LIMIT', 'OFFSET', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'ALTER', 'DROP']
  let result = sql.toUpperCase()

  keywords.forEach((kw) => {
    result = result.replace(new RegExp(`\\b${kw}\\b`, 'gi'), `\n${kw}`)
  })

  return result.trim()
}

function formatHtml(html: string, indent: number): string {
  const spaces = ' '.repeat(indent)
  let level = 0
  let result = ''
  let inTag = false
  let tag = ''

  for (let i = 0; i < html.length; i++) {
    const char = html[i]

    if (char === '<') {
      inTag = true
      if (tag.trim()) {
        result += tag.trim() + '\n' + spaces.repeat(level)
      }
      tag = char
    } else if (char === '>') {
      tag += char
      inTag = false

      if (tag.includes('</')) {
        level = Math.max(0, level - 1)
        result = result.trimEnd() + '\n' + spaces.repeat(level)
      }

      result += tag
      tag = ''

      if (!tag.includes('/>')) {
        result += '\n' + spaces.repeat(level)
      }

      if (!tag.includes('</') && !tag.includes('/>')) {
        level++
      }
    } else if (inTag) {
      tag += char
    } else if (char.trim()) {
      tag += char
    }
  }

  return result.trim()
}

function generateJavaClass(obj: any, className: string): string {
  let code = `public class ${className} {\n`

  Object.entries(obj).forEach(([key, value]) => {
    const type = typeof value === 'number' ? 'int' : typeof value === 'boolean' ? 'boolean' : 'String'
    code += `  private ${type} ${key};\n`
  })

  code += `\n  public ${className}() {}\n\n`

  Object.entries(obj).forEach(([key]) => {
    const getter = 'get' + key.charAt(0).toUpperCase() + key.slice(1)
    code += `  public ${typeof obj[key] === 'number' ? 'int' : typeof obj[key] === 'boolean' ? 'boolean' : 'String'} ${getter}() {\n    return this.${key};\n  }\n\n`
  })

  code += '}\n'
  return code
}

function jsonToXml(obj: any, rootName: string): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>\n`

  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      xml += `  <${key}>\n`
      Object.entries(value).forEach(([k, v]) => {
        xml += `    <${k}>${escapeXml(String(v))}</${k}>\n`
      })
      xml += `  </${key}>\n`
    } else {
      xml += `  <${key}>${escapeXml(String(value))}</${key}>\n`
    }
  })

  xml += `</${rootName}>`
  return xml
}

function generatePhpArray(obj: any): string {
  let php = '$data = array(\n'

  Object.entries(obj).forEach(([key, value]) => {
    php += `  '${key}' => '${String(value).replace(/'/g, "\\'")}'`
    php += ',\n'
  })

  php += ');\n'
  return php
}

function generateCSharpClass(obj: any, className: string): string {
  let code = `public class ${className}\n{\n`

  Object.entries(obj).forEach(([key, value]) => {
    const type = typeof value === 'number' ? 'int' : typeof value === 'boolean' ? 'bool' : 'string'
    const propName = key.charAt(0).toUpperCase() + key.slice(1)
    code += `  public ${type} ${propName} { get; set; }\n`
  })

  code += '}\n'
  return code
}

function xmlToJson(xml: string): any {
  const regex = /<([^\s/>]+)(?:\s[^>]*)?>([^<]*)<\/\1>|<([^\s/>]+)(?:\s[^>]*)?\/>/g
  const result: any = {}
  let match

  while ((match = regex.exec(xml)) !== null) {
    const tagName = match[1] || match[3]
    const content = match[2] || ''
    result[tagName] = content || null
  }

  return result || { raw: xml }
}

function parseIni(ini: string): Record<string, any> {
  const result: Record<string, any> = {}
  const lines = ini.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith(';') && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=')
      if (key && valueParts.length > 0) {
        result[key.trim()] = valueParts.join('=').trim()
      }
    }
  }

  return result
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }

  result.push(current)
  return result
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function cleanCode(code: string, language: string): string {
  let cleaned = code

  if (language === 'js') {
    cleaned = cleaned
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*/g, '')
  } else if (language === 'css') {
    cleaned = cleaned
      .replace(/\/\*[\s\S]*?\*\//g, '')
  } else if (language === 'html') {
    cleaned = cleaned
      .replace(/<!--[\s\S]*?-->/g, '')
  } else if (language === 'py') {
    cleaned = cleaned
      .replace(/#.*/g, '')
      .replace(/'''[\s\S]*?'''/g, '')
      .replace(/"""[\s\S]*?"""/g, '')
  } else if (language === 'java') {
    cleaned = cleaned
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*/g, '')
  }

  cleaned = cleaned
    .replace(/^\s*[\r\n]/gm, '')
    .replace(/\s+/g, ' ')
    .trim()

  return cleaned
}

function computeDiff(lines1: string[], lines2: string[]): Array<{ type: string; lineNum: number; content: string }> {
  const diff: Array<{ type: string; lineNum: number; content: string }> = []
  const maxLines = Math.max(lines1.length, lines2.length)

  for (let i = 0; i < maxLines; i++) {
    const line1 = lines1[i] || ''
    const line2 = lines2[i] || ''

    if (line1 !== line2) {
      if (line1) diff.push({ type: 'removed', lineNum: i + 1, content: line1 })
      if (line2) diff.push({ type: 'added', lineNum: i + 1, content: line2 })
    }
  }

  return diff
}

function calculateSimilarity(text1: string, text2: string): number {
  const len1 = text1.length
  const len2 = text2.length
  const maxLen = Math.max(len1, len2)
  if (maxLen === 0) return 100

  let matches = 0
  for (let i = 0; i < Math.min(len1, len2); i++) {
    if (text1[i] === text2[i]) matches++
  }

  return Math.round((matches / maxLen) * 100)
}

function validateHtml(html: string): Array<{ line: number; message: string }> {
  const errors: Array<{ line: number; message: string }> = []
  const lines = html.split('\n')
  const tagStack: string[] = []
  const selfClosing = ['br', 'hr', 'img', 'input', 'link', 'meta', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr']

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const tagMatches = line.match(/<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g) || []

    for (const match of tagMatches) {
      if (match.startsWith('</')) {
        const tagName = match.slice(2, -1).trim().toLowerCase()
        if (tagStack.length === 0 || tagStack[tagStack.length - 1] !== tagName) {
          errors.push({ line: i + 1, message: `Unexpected closing tag: ${match}` })
        } else {
          tagStack.pop()
        }
      } else if (!match.endsWith('/>')) {
        const tagMatch = match.match(/<([a-zA-Z][a-zA-Z0-9]*)/i)
        if (tagMatch) {
          const tagName = tagMatch[1]!.toLowerCase()
          if (!selfClosing.includes(tagName)) {
            tagStack.push(tagName)
          }
        }
      }
    }
  }

  if (tagStack.length > 0) {
    errors.push({ line: lines.length, message: `Unclosed tags: ${tagStack.join(', ')}` })
  }

  return errors
}

async function checkRedirects(url: string, maxRedirects: number): Promise<any> {
  const chain = []
  let currentUrl = url
  let redirectCount = 0

  try {
    while (redirectCount < maxRedirects) {
      const response = await fetch(currentUrl, {
        redirect: 'manual',
        headers: { 'User-Agent': 'Mozilla/5.0' },
      })

      chain.push({
        url: currentUrl,
        status: response.status,
        statusText: response.statusText,
      })

      const location = response.headers.get('location')
      if (!location || response.status < 300 || response.status >= 400) {
        break
      }

      currentUrl = new URL(location, currentUrl).toString()
      redirectCount++
    }
  } catch (error: any) {
    throw new Error(`Failed to check redirects: ${error.message}`)
  }

  return {
    finalUrl: currentUrl,
    redirectCount,
    chain,
    isRedirected: chain.length > 1,
  }
}

async function convertCurrency(amount: number, from: string, to: string): Promise<any> {
  try {
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`)

    if (!response.ok) {
      throw new Error(`Currency API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.rates[to]) {
      throw new Error(`Unknown currency: ${to}`)
    }

    const rate = data.rates[to]
    const converted = amount * rate

    return {
      amount,
      from,
      to,
      rate: parseFloat(rate.toFixed(6)),
      converted: parseFloat(converted.toFixed(2)),
      timestamp: new Date().toISOString(),
    }
  } catch (error: any) {
    throw new Error(`Currency conversion failed: ${error.message}`)
  }
}

async function testRestApi(url: string, method: string, headersStr: string, bodyStr: string): Promise<any> {
  try {
    let headers: Record<string, string> = {}
    try {
      headers = JSON.parse(headersStr || '{}')
    } catch {
      throw new Error('Invalid headers JSON')
    }

    const options: RequestInit = {
      method: method.toUpperCase(),
      headers,
    }

    if (bodyStr && (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT' || method.toUpperCase() === 'PATCH')) {
      try {
        JSON.parse(bodyStr)
        options.body = bodyStr
        headers['Content-Type'] = 'application/json'
      } catch {
        throw new Error('Invalid request body JSON')
      }
    }

    const response = await fetch(url, options)
    const responseBody = await response.text()

    let parsedBody
    try {
      parsedBody = JSON.parse(responseBody)
    } catch {
      parsedBody = responseBody
    }

    return {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: parsedBody,
      size: responseBody.length,
    }
  } catch (error: any) {
    throw new Error(`API request failed: ${error.message}`)
  }
}
