import { Buffer } from 'buffer'
import {
  generateMockData,
  rgbToHex,
  hexToRgb,
  rgbToHsl,
  hexToHsl,
  hslToRgb,
  hslToHex,
} from './helpers'
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

  'json-generator': {
    description: 'Generate valid JSON with random data',
    schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description: 'Data type: person, product, todo, note (default: person)',
        },
        count: {
          type: 'number',
          description: 'Number of records to generate (default: 10)',
          default: 10,
        },
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

  'base64-encoder-decoder': {
    description: 'Encode text to Base64 or decode Base64 back to plain text',
    schema: {
      type: 'object',
      properties: {
        input: { type: 'string', description: 'Text to encode or Base64 string to decode' },
        action: { type: 'string', enum: ['encode', 'decode'], description: 'Action to perform' },
      },
      required: ['input', 'action'],
    },
    handler: async (input) => {
      const { input: value, action } = input
      if (action === 'encode') {
        return Buffer.from(value).toString('base64')
      } else {
        try {
          return Buffer.from(value, 'base64').toString('utf-8')
        } catch (e) {
          throw new Error('Invalid Base64 string')
        }
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
          throw new Error(
            'Invalid color format. Use HEX (#fff), RGB (255,255,255), or HSL (0,0%,100%)'
          )
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
        json: 'application/json',
        xml: 'application/xml',
        html: 'text/html',
        css: 'text/css',
        js: 'application/javascript',
        txt: 'text/plain',
        pdf: 'application/pdf',
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        gif: 'image/gif',
        svg: 'image/svg+xml',
        mp4: 'video/mp4',
        mp3: 'audio/mpeg',
        zip: 'application/zip',
        yaml: 'application/yaml',
        yml: 'application/yaml',
        csv: 'text/csv',
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

  'ini-converter': {
    description: 'Convert INI configuration to JSON, XML, or YAML',
    schema: {
      type: 'object',
      properties: {
        ini: { type: 'string', description: 'INI content to convert' },
        format: {
          type: 'string',
          enum: ['json', 'xml', 'yaml'],
          description: 'Output format: json, xml, or yaml',
        },
      },
      required: ['ini', 'format'],
    },
    handler: async (input) => {
      const { ini, format } = input
      const obj = parseIni(ini)
      if (format === 'json') return JSON.stringify(obj, null, 2)
      if (format === 'xml') return jsonToXml(obj, 'config')
      const jsYaml = await import('js-yaml')
      return jsYaml.dump(obj, { lineWidth: -1 })
    },
  },

  'csv-converter': {
    description: 'Convert CSV data to JSON, XML, YAML, or SQL INSERT statements',
    schema: {
      type: 'object',
      properties: {
        csv: { type: 'string', description: 'CSV content to convert' },
        format: {
          type: 'string',
          enum: ['json', 'xml', 'yaml', 'sql'],
          description: 'Output format: json, xml, yaml, or sql',
        },
        hasHeader: { type: 'boolean', description: 'First row is header (used for json/xml/yaml/sql output)', default: true },
        tableName: { type: 'string', description: 'Table name for SQL output', default: 'table1' },
      },
      required: ['csv', 'format'],
    },
    handler: async (input) => {
      const { csv, format, hasHeader = true, tableName = 'table1' } = input
      const lines = csv.trim().split('\n')
      if (lines.length === 0) throw new Error('Empty CSV')

      if (format === 'json') {
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
      }

      if (format === 'xml') {
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
      }

      if (format === 'yaml') {
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
      }

      // sql
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
        action: {
          type: 'string',
          enum: ['toAscii', 'toUnicode'],
          description: 'Conversion direction',
        },
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
        case: {
          type: 'string',
          description:
            'Target case: uppercase, lowercase, capitalize, camelCase, snake_case, kebab-case, PascalCase',
        },
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
          result.converted = text
            .replace(/[\s_-]+(.)/g, (_: string, char: string) => char.toUpperCase())
            .replace(/^(.)/, (match: string) => match.toLowerCase())
          break
        case 'snake_case':
          result.converted = text
            .replace(/([a-z])([A-Z])/g, '$1_$2')
            .replace(/[\s-]+/g, '_')
            .toLowerCase()
          break
        case 'kebab-case':
          result.converted = text
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .replace(/[\s_]+/g, '-')
            .toLowerCase()
          break
        case 'PascalCase':
          result.converted = text
            .split(/[\s_-]+/)
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('')
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
        fromUnit: {
          type: 'string',
          description: 'Source unit (m, km, ft, mi, kg, lb, g, oz, C, F)',
        },
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
      return {
        original: `${value} ${fromUnit}`,
        converted: `${converted.toFixed(4)} ${toUnit}`,
        value: parseFloat(converted.toFixed(4)),
      }
    },
  },

  'uuid-generator': {
    description: 'Generate UUID v4 identifiers',
    schema: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          description: 'Number of UUIDs to generate (default: 1, max: 100)',
          default: 1,
        },
      },
      required: [],
    },
    handler: async (input) => {
      const { count = 1 } = input
      const limit = Math.min(Math.max(count, 1), 100)
      const generateUUID = () =>
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: string) => {
          const r = (Math.random() * 16) | 0
          const v = c === 'x' ? r : (r & 0x3) | 0x8
          return v.toString(16)
        })
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
      if (!validAlgorithms.includes(algorithm))
        throw new Error(`Invalid algorithm. Use: ${validAlgorithms.join(', ')}`)
      const hash = crypto.createHash(algorithm).update(text).digest('hex')
      return { text, algorithm, hash }
    },
  },

  'password-generator': {
    description: 'Generate strong and secure passwords',
    schema: {
      type: 'object',
      properties: {
        length: {
          type: 'number',
          description: 'Password length (8-128, default: 16)',
          default: 16,
        },
        uppercase: { type: 'boolean', description: 'Include uppercase letters', default: true },
        lowercase: { type: 'boolean', description: 'Include lowercase letters', default: true },
        numbers: { type: 'boolean', description: 'Include numbers', default: true },
        symbols: { type: 'boolean', description: 'Include symbols', default: true },
      },
      required: [],
    },
    handler: async (input) => {
      const {
        length = 16,
        uppercase = true,
        lowercase = true,
        numbers = true,
        symbols = true,
      } = input
      if (length < 8 || length > 128) throw new Error('Password length must be between 8 and 128')
      let chars = ''
      if (uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      if (lowercase) chars += 'abcdefghijklmnopqrstuvwxyz'
      if (numbers) chars += '0123456789'
      if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'
      if (!chars) throw new Error('At least one character type must be selected')
      let password = ''
      for (let i = 0; i < length; i++)
        password += chars.charAt(Math.floor(Math.random() * chars.length))
      return {
        password,
        length,
        hasUppercase: uppercase,
        hasLowercase: lowercase,
        hasNumbers: numbers,
        hasSymbols: symbols,
      }
    },
  },

  'mock-data-generator': {
    description: 'Generate realistic mock data for testing',
    schema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description:
            'Data category: person, text, web, location, time, finance, miscellaneous (default: person)',
          default: 'person',
        },
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
        language: {
          type: 'string',
          description: 'Language: js, css, html, py, java (default: js)',
          default: 'js',
        },
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
        maxRedirects: {
          type: 'number',
          description: 'Maximum redirects to follow (default: 10)',
          default: 10,
        },
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
        method: {
          type: 'string',
          description: 'HTTP method (GET, POST, PUT, DELETE, PATCH)',
          default: 'GET',
        },
        headers: {
          type: 'string',
          description: 'JSON string of headers (e.g., {"Authorization": "Bearer token"})',
          default: '{}',
        },
        body: {
          type: 'string',
          description: 'Request body as JSON string (for POST/PUT/PATCH)',
          default: '',
        },
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
        size: {
          type: 'number',
          description: 'Size of the QR code in pixels (default: 256)',
          default: 256,
        },
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

  'link-checker': {
    description: 'Check if a list of URLs are reachable and return their HTTP status',
    schema: {
      type: 'object',
      properties: {
        urls: { type: 'array', items: { type: 'string' }, description: 'Array of URLs to check' },
      },
      required: ['urls'],
    },
    handler: async (input) => {
      const { urls } = input as { urls: string[] }
      if (!Array.isArray(urls) || urls.length === 0)
        throw new Error('urls must be a non-empty array')
      if (urls.length > 20) throw new Error('Maximum 20 URLs per request')

      const results = await Promise.all(
        urls.map(async (url) => {
          const start = Date.now()
          try {
            const res = await fetch(url, {
              method: 'HEAD',
              redirect: 'follow',
              signal: AbortSignal.timeout(10000),
              headers: { 'User-Agent': 'Mozilla/5.0' },
            })
            return {
              url,
              status: res.status,
              statusText: res.statusText,
              ok: res.ok,
              latencyMs: Date.now() - start,
            }
          } catch (e: any) {
            return {
              url,
              status: null,
              statusText: '',
              ok: false,
              latencyMs: Date.now() - start,
              error: e.message || 'Request failed',
            }
          }
        })
      )
      const reachable = results.filter((r) => r.ok).length
      return { results, reachable, failed: results.length - reachable, total: results.length }
    },
  },

  'jsonpath-finder': {
    description:
      'Find all matches for a JSONPath expression in a JSON document, returning results and matched paths',
    schema: {
      type: 'object',
      properties: {
        json: { type: 'string', description: 'JSON document to search (as a string)' },
        path: {
          type: 'string',
          description: 'JSONPath expression (e.g. $.users[?(@.active==true)].name)',
        },
      },
      required: ['json', 'path'],
    },
    handler: async (input) => {
      const { json, path } = input
      let parsed: any
      try {
        parsed = JSON.parse(json)
      } catch {
        throw new Error('Invalid JSON: could not parse input')
      }
      const { JSONPath } = await import('jsonpath-plus')
      const results = JSONPath({ path, json: parsed, wrap: true })
      const paths = JSONPath({ path, json: parsed, resultType: 'path', wrap: true }) as string[]
      return { results, paths, count: results.length }
    },
  },

  'sql-to-mongodb': {
    description:
      'Convert a SQL SELECT/INSERT/UPDATE/DELETE query to the equivalent MongoDB operation',
    schema: {
      type: 'object',
      properties: {
        sql: {
          type: 'string',
          description: 'SQL query to convert (SELECT, INSERT, UPDATE, or DELETE)',
        },
      },
      required: ['sql'],
    },
    handler: async (input) => {
      const { sql } = input
      return convertSqlToMongodb(sql.trim())
    },
  },

  'json-path-evaluator': {
    description: 'Evaluate a JSONPath expression against a JSON document',
    schema: {
      type: 'object',
      properties: {
        json: { type: 'string', description: 'JSON document to query (as a string)' },
        path: { type: 'string', description: 'JSONPath expression (e.g. $.store.books[*].title)' },
      },
      required: ['json', 'path'],
    },
    handler: async (input) => {
      const { json, path } = input
      let parsed: any
      try {
        parsed = JSON.parse(json)
      } catch {
        throw new Error('Invalid JSON: could not parse input')
      }
      const { JSONPath } = await import('jsonpath-plus')
      const results = JSONPath({ path, json: parsed, wrap: true })
      return { results, count: results.length }
    },
  },

  'xpath-evaluator': {
    description: 'Evaluate an XPath expression against an XML document',
    schema: {
      type: 'object',
      properties: {
        xml: { type: 'string', description: 'XML document to query' },
        xpath: { type: 'string', description: 'XPath expression (e.g. //book/title/text())' },
      },
      required: ['xml', 'xpath'],
    },
    handler: async (input) => {
      const { xml, xpath } = input
      const xpathLib = await import('xpath-ts2')
      const { DOMParser } = await import('@xmldom/xmldom')

      let doc: any
      try {
        const parser = new DOMParser()
        doc = parser.parseFromString(xml, 'text/xml')
        const parseError = doc.getElementsByTagName('parsererror')
        if (parseError.length > 0) {
          throw new Error('XML parse error: ' + (parseError[0]?.textContent ?? 'invalid XML'))
        }
      } catch (e: any) {
        throw new Error(e.message || 'Invalid XML')
      }

      let nodes: any[]
      try {
        nodes = xpathLib.select(xpath, doc) as any[]
      } catch (e: any) {
        throw new Error('Invalid XPath expression: ' + (e.message || String(e)))
      }

      const results = nodes.map((node: any) => {
        if (typeof node === 'string' || typeof node === 'number' || typeof node === 'boolean') {
          return node
        }
        if (node.nodeType === 3 || node.nodeType === 4) return node.nodeValue
        if (node.toString) return node.toString()
        return String(node)
      })

      return { results, count: results.length }
    },
  },

  'docx-to-markdown': {
    description: 'Convert a DOCX file (supplied as base64) to Markdown text',
    schema: {
      type: 'object',
      properties: {
        docxBase64: { type: 'string', description: 'Base64-encoded DOCX file content' },
      },
      required: ['docxBase64'],
    },
    handler: async (input) => {
      const { docxBase64 } = input
      const { docxToHtml } = await import('./docx-server')
      const TurndownService = (await import('turndown')).default
      const { gfm } = await import('turndown-plugin-gfm')
      const { html } = await docxToHtml(docxBase64)
      const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' })
      turndown.use(gfm)
      const markdown = turndown.turndown(html)
      return {
        markdown,
        wordCount: markdown.split(/\s+/).filter(Boolean).length,
      }
    },
  },

  'html-to-markdown': {
    description: 'Convert HTML to Markdown text',
    schema: {
      type: 'object',
      properties: {
        html: { type: 'string', description: 'HTML content to convert to Markdown' },
      },
      required: ['html'],
    },
    handler: async (input) => {
      const { html } = input
      const TurndownService = (await import('turndown')).default
      const { gfm } = await import('turndown-plugin-gfm')
      const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' })
      turndown.use(gfm)
      const markdown = turndown.turndown(html)
      return {
        markdown,
        wordCount: markdown.split(/\s+/).filter(Boolean).length,
      }
    },
  },

  'markdown-to-html': {
    description: 'Convert Markdown to HTML',
    schema: {
      type: 'object',
      properties: {
        markdown: { type: 'string', description: 'Markdown content to convert to HTML' },
      },
      required: ['markdown'],
    },
    handler: async (input) => {
      const { markdown } = input
      const { marked } = await import('marked')
      const html = await marked.parse(markdown)
      return { html }
    },
  },

  'favicon-generator': {
    description: 'Generate favicon sizes from an uploaded image',
    schema: {
      type: 'object',
      properties: {
        imageBase64: {
          type: 'string',
          description: 'Base64-encoded image (PNG, JPEG, JPG, or WebP)',
        },
        mimeType: {
          type: 'string',
          description: 'MIME type of the image (image/png, image/jpeg, image/webp)',
        },
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

  'excel-to-json': {
    description: 'Convert CSV text to JSON array (use the browser UI for Excel/CSV file uploads)',
    schema: {
      type: 'object',
      properties: {
        csv: {
          type: 'string',
          description: 'CSV text to convert to JSON',
        },
        headerRows: {
          type: 'number',
          description: 'Number of header rows (default: 1)',
          default: 1,
        },
      },
      required: ['csv'],
    },
    handler: async (input) => {
      const { csv, headerRows = 1 } = input
      const rows = parseCsvText(csv)
      if (rows.length === 0) throw new Error('No data found in CSV')
      const headers = mergeHeaderRows(rows.slice(0, headerRows))
      const dataRows = rows.slice(headerRows)
      const records = dataRows.map((row) => {
        const obj: Record<string, any> = {}
        headers.forEach((h, i) => {
          const key = h || `col${i + 1}`
          const val = row[i] ?? ''
          obj[key] = val === '' ? null : isNaN(Number(val)) || val.trim() === '' ? val : Number(val)
        })
        return obj
      })
      return { records, rowCount: records.length, columnCount: headers.length }
    },
  },

  'excel-to-markdown': {
    description:
      'Convert CSV text to a Markdown table (use the browser UI for Excel/CSV file uploads)',
    schema: {
      type: 'object',
      properties: {
        csv: {
          type: 'string',
          description: 'CSV text to convert to a Markdown table',
        },
        headerRows: {
          type: 'number',
          description: 'Number of header rows (default: 1)',
          default: 1,
        },
      },
      required: ['csv'],
    },
    handler: async (input) => {
      const { csv, headerRows = 1 } = input
      const rows = parseCsvText(csv)
      if (rows.length === 0) throw new Error('No data found in CSV')
      const headers = mergeHeaderRows(rows.slice(0, headerRows))
      const dataRows = rows.slice(headerRows)
      const colCount = Math.max(headers.length, ...dataRows.map((r) => r.length))
      const pad = (s: string) => ` ${s.replace(/\|/g, '\\|')} `
      const headerLine = '|' + headers.map((h) => pad(h || '')).join('|') + '|'
      const sepLine = '|' + Array(colCount).fill(' --- ').join('|') + '|'
      const dataLines = dataRows.map(
        (row) => '|' + Array.from({ length: colCount }, (_, i) => pad(row[i] ?? '')).join('|') + '|'
      )
      const markdown = [headerLine, sepLine, ...dataLines].join('\n')
      return { markdown, rowCount: dataRows.length, columnCount: colCount }
    },
  },

  'cron-expression-builder': {
    description: 'Parse a cron expression and return a human-readable description and the next N run times',
    schema: {
      type: 'object',
      properties: {
        expression: { type: 'string', description: 'Cron expression (5 or 6 fields)' },
        nextCount: { type: 'number', description: 'Number of upcoming run times to return (default: 5)', default: 5 },
      },
      required: ['expression'],
    },
    handler: async (input) => {
      const { expression, nextCount = 5 } = input
      return parseCronExpression(expression, nextCount)
    },
  },

  'jwt-generator': {
    description: 'Generate a signed JWT token with a custom payload using HS256 or HS512',
    schema: {
      type: 'object',
      properties: {
        payload: { type: 'string', description: 'JSON payload object' },
        secret: { type: 'string', description: 'Signing secret key' },
        algorithm: { type: 'string', enum: ['HS256', 'HS512'], description: 'Signing algorithm: HS256 or HS512', default: 'HS256' },
        expiresIn: { type: 'string', description: 'Expiry (e.g. "1h", "7d", "3600"). Leave empty for no expiry.' },
      },
      required: ['payload', 'secret'],
    },
    handler: async (input) => {
      const { payload, secret, algorithm = 'HS256', expiresIn } = input
      let parsed: Record<string, unknown>
      try {
        parsed = JSON.parse(payload)
      } catch {
        throw new Error('Payload must be valid JSON')
      }
      return generateJwt(parsed, secret, algorithm, expiresIn)
    },
  },

  'url-builder': {
    description: 'Build a URL from protocol, host, path, and query parameters',
    schema: {
      type: 'object',
      properties: {
        protocol: { type: 'string', description: 'Protocol: http or https', default: 'https' },
        host: { type: 'string', description: 'Hostname (e.g. example.com)' },
        port: { type: 'string', description: 'Port number (optional)' },
        path: { type: 'string', description: 'Path (e.g. /api/users)' },
        params: {
          type: 'array',
          description: 'Query parameters as key-value pairs',
          items: {
            type: 'object',
            properties: {
              key: { type: 'string' },
              value: { type: 'string' },
            },
          },
        },
        hash: { type: 'string', description: 'Fragment / hash (optional)' },
      },
      required: ['host'],
    },
    handler: async (input) => {
      const { protocol = 'https', host, port, path = '', params = [], hash = '' } = input
      const base = `${protocol}://${host}${port ? ':' + port : ''}${path || '/'}`
      const url = new URL(base)
      for (const p of params as Array<{ key: string; value: string }>) {
        if (p.key) url.searchParams.append(p.key, p.value ?? '')
      }
      if (hash) url.hash = hash
      return { url: url.toString() }
    },
  },

  'query-string-parser': {
    description: 'Parse a query string or full URL into a key-value table',
    schema: {
      type: 'object',
      properties: {
        input: { type: 'string', description: 'Query string (e.g. foo=1&bar=2) or full URL' },
      },
      required: ['input'],
    },
    handler: async (input) => {
      const { input: raw } = input
      let qs = raw.trim()
      if (qs.startsWith('http://') || qs.startsWith('https://') || qs.includes('://')) {
        try {
          qs = new URL(qs).search.replace(/^\?/, '')
        } catch {
          qs = qs.split('?')[1] ?? qs
        }
      } else {
        qs = qs.replace(/^\?/, '')
      }
      const params = new URLSearchParams(qs)
      const result: Record<string, string | string[]> = {}
      for (const key of new Set(params.keys())) {
        const vals = params.getAll(key)
        result[key] = vals.length === 1 ? vals[0]! : vals
      }
      return { params: result, count: Object.keys(result).length }
    },
  },

  'word-counter': {
    description: 'Count words, characters, sentences, paragraphs, and estimate reading time',
    schema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Text to analyze' },
      },
      required: ['text'],
    },
    handler: async (input) => {
      const { text } = input
      const chars = text.length
      const charsNoSpaces = text.replace(/\s/g, '').length
      const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length
      const sentences = text.trim() === '' ? 0 : (text.match(/[^.!?]+[.!?]+/g) ?? []).length
      const paragraphs = text.trim() === '' ? 0 : text.split(/\n\s*\n/).filter((p) => p.trim()).length
      const readingTimeMin = Math.ceil(words / 200)
      return { words, chars, charsNoSpaces, sentences, paragraphs, readingTimeMin }
    },
  },

  'lorem-ipsum-generator': {
    description: 'Generate lorem ipsum placeholder text',
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['paragraphs', 'sentences', 'words'], description: 'Unit: paragraphs, sentences, or words' },
        count: { type: 'number', description: 'Number of units to generate (default: 3)' },
        style: { type: 'string', enum: ['lorem', 'english'], description: 'Style: classic lorem ipsum or random English words', default: 'lorem' },
      },
      required: ['type', 'count'],
    },
    handler: async (input) => {
      const { type, count, style = 'lorem' } = input
      return { text: generateLoremIpsum(type, count, style) }
    },
  },

  'json-schema-validator': {
    description: 'Validate a JSON document against a JSON Schema',
    schema: {
      type: 'object',
      properties: {
        json: { type: 'string', description: 'JSON document to validate' },
        schema: { type: 'string', description: 'JSON Schema to validate against' },
      },
      required: ['json', 'schema'],
    },
    handler: async (input) => {
      const { json, schema: schemaStr } = input
      let doc: unknown
      let schema: unknown
      try { doc = JSON.parse(json) } catch { throw new Error('Invalid JSON document') }
      try { schema = JSON.parse(schemaStr) } catch { throw new Error('Invalid JSON Schema') }
      const errors = validateJsonSchema(doc, schema as Record<string, unknown>, '')
      return { valid: errors.length === 0, errors }
    },
  },

  'json-schema-generator': {
    description: 'Infer a JSON Schema (draft-07) from a sample JSON document',
    schema: {
      type: 'object',
      properties: {
        json: { type: 'string', description: 'Sample JSON document to infer schema from' },
      },
      required: ['json'],
    },
    handler: async (input) => {
      const { json } = input
      let doc: unknown
      try { doc = JSON.parse(json) } catch { throw new Error('Invalid JSON') }
      const schema = inferJsonSchema(doc)
      return JSON.stringify(schema, null, 2)
    },
  },

  'color-contrast-checker': {
    description: 'Check WCAG AA and AAA contrast ratios between two colors',
    schema: {
      type: 'object',
      properties: {
        foreground: { type: 'string', description: 'Foreground color in HEX, rgb(), or hsl()' },
        background: { type: 'string', description: 'Background color in HEX, rgb(), or hsl()' },
      },
      required: ['foreground', 'background'],
    },
    handler: async (input) => {
      const { foreground, background } = input
      const fg = parseColorToRgb(foreground)
      const bg = parseColorToRgb(background)
      if (!fg) throw new Error(`Cannot parse foreground color: "${foreground}"`)
      if (!bg) throw new Error(`Cannot parse background color: "${background}"`)
      const ratio = contrastRatio(fg, bg)
      return {
        ratio: parseFloat(ratio.toFixed(2)),
        ratioDisplay: `${ratio.toFixed(2)}:1`,
        wcagAA: { normal: ratio >= 4.5, large: ratio >= 3, ui: ratio >= 3 },
        wcagAAA: { normal: ratio >= 7, large: ratio >= 4.5 },
        foreground,
        background,
      }
    },
  },

  'color-palette-generator': {
    description: 'Generate complementary, analogous, triadic, and tetradic color palettes from a base color',
    schema: {
      type: 'object',
      properties: {
        color: { type: 'string', description: 'Base color in HEX, rgb(), or hsl()' },
      },
      required: ['color'],
    },
    handler: async (input) => {
      const { color } = input
      const rgb = parseColorToRgb(color)
      if (!rgb) throw new Error(`Cannot parse color: "${color}"`)
      const hsl = rgbToHslValues(rgb.r, rgb.g, rgb.b)
      return generatePalettes(hsl)
    },
  },

  'css-gradient-builder': {
    description: 'Build a CSS linear or radial gradient from color stops',
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['linear', 'radial'], description: 'Gradient type', default: 'linear' },
        angle: { type: 'number', description: 'Angle in degrees for linear gradient (default: 90)', default: 90 },
        stops: {
          type: 'array',
          description: 'Color stops as objects with color and position (0-100)',
          items: {
            type: 'object',
            properties: {
              color: { type: 'string' },
              position: { type: 'number' },
            },
          },
        },
      },
      required: ['stops'],
    },
    handler: async (input) => {
      const { type = 'linear', angle = 90, stops } = input
      if (!Array.isArray(stops) || stops.length < 2) throw new Error('At least 2 color stops required')
      const stopStr = (stops as Array<{ color: string; position: number }>)
        .map((s) => `${s.color} ${s.position}%`)
        .join(', ')
      const css =
        type === 'radial'
          ? `background: radial-gradient(circle, ${stopStr});`
          : `background: linear-gradient(${angle}deg, ${stopStr});`
      return { css, gradient: css.replace('background: ', '').replace(';', '') }
    },
  },

  'random-string-generator': {
    description: 'Generate random strings with configurable length, count, and character set',
    schema: {
      type: 'object',
      properties: {
        length: { type: 'number', description: 'Length of each string (default: 16)', default: 16 },
        count: { type: 'number', description: 'Number of strings to generate (default: 1)', default: 1 },
        charset: {
          type: 'string',
          enum: ['alphanumeric', 'alpha', 'numeric', 'hex', 'base58', 'custom'],
          description: 'Character set to use',
          default: 'alphanumeric',
        },
        custom: { type: 'string', description: 'Custom character set when charset is "custom"' },
      },
      required: ['length'],
    },
    handler: async (input) => {
      const { length = 16, count = 1, charset = 'alphanumeric', custom } = input
      const charsets: Record<string, string> = {
        alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
        numeric: '0123456789',
        hex: '0123456789abcdef',
        base58: '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',
        custom: custom || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
      }
      const pool = charsets[charset] ?? charsets.alphanumeric
      const len = Math.max(1, Math.min(length, 1024))
      const n = Math.max(1, Math.min(count, 100))
      const strings = Array.from({ length: n }, () =>
        Array.from({ length: len }, () => pool[Math.floor(Math.random() * pool.length)]).join('')
      )
      return { strings, count: strings.length, length: len }
    },
  },

  'slug-generator': {
    description: 'Convert any string to a URL-safe slug',
    schema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Input text to slugify' },
        separator: { type: 'string', enum: ['-', '_', '.'], description: 'Separator character (default: -)', default: '-' },
        case: { type: 'string', enum: ['lower', 'upper', 'title'], description: 'Case style (default: lower)', default: 'lower' },
      },
      required: ['text'],
    },
    handler: async (input) => {
      const { text, separator = '-', case: caseStyle = 'lower' } = input
      let slug = text
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-zA-Z0-9\s-_]/g, '')
        .trim()
        .replace(/[\s-_]+/g, separator)
      if (caseStyle === 'lower') slug = slug.toLowerCase()
      else if (caseStyle === 'upper') slug = slug.toUpperCase()
      else if (caseStyle === 'title')
        slug = slug.replace(/\w+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      return { slug }
    },
  },

  'line-utilities': {
    description: 'Sort, reverse, deduplicate, shuffle, or number lines of text',
    schema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Multi-line text to process' },
        action: {
          type: 'string',
          enum: ['sort-asc', 'sort-desc', 'reverse', 'deduplicate', 'shuffle', 'number', 'trim', 'remove-empty'],
          description: 'Operation to perform on lines',
        },
      },
      required: ['text', 'action'],
    },
    handler: async (input) => {
      const { text, action } = input
      let lines = text.split('\n')
      switch (action) {
        case 'sort-asc':
          lines = [...lines].sort((a, b) => a.localeCompare(b))
          break
        case 'sort-desc':
          lines = [...lines].sort((a, b) => b.localeCompare(a))
          break
        case 'reverse':
          lines = [...lines].reverse()
          break
        case 'deduplicate':
          lines = [...new Set(lines)]
          break
        case 'shuffle':
          for (let i = lines.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[lines[i], lines[j]] = [lines[j]!, lines[i]!]
          }
          break
        case 'number':
          lines = lines.map((l, i) => `${i + 1}. ${l}`)
          break
        case 'trim':
          lines = lines.map((l) => l.trim())
          break
        case 'remove-empty':
          lines = lines.filter((l) => l.trim() !== '')
          break
        default:
          throw new Error(`Unknown action: ${action}`)
      }
      return { result: lines.join('\n'), lineCount: lines.length }
    },
  },

  'hex-text-converter': {
    description: 'Encode text to hexadecimal or decode hex to text',
    schema: {
      type: 'object',
      properties: {
        input: { type: 'string', description: 'Text to encode or hex string to decode' },
        action: { type: 'string', enum: ['encode', 'decode'], description: 'encode: text→hex, decode: hex→text' },
        separator: { type: 'string', description: 'Separator between hex bytes for encoding (default: space)', default: ' ' },
      },
      required: ['input', 'action'],
    },
    handler: async (input) => {
      const { input: value, action, separator = ' ' } = input
      if (action === 'encode') {
        const bytes = new TextEncoder().encode(value)
        const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join(separator)
        return { result: hex }
      } else {
        const clean = value.replace(/\s+/g, '').replace(/0x/gi, '')
        if (!/^[0-9a-fA-F]*$/.test(clean) || clean.length % 2 !== 0)
          throw new Error('Invalid hex string - must be even number of hex digits')
        const bytes = new Uint8Array(clean.length / 2)
        for (let i = 0; i < clean.length; i += 2) bytes[i / 2] = parseInt(clean.slice(i, i + 2), 16)
        return { result: new TextDecoder().decode(bytes) }
      }
    },
  },

  'unicode-escape-converter': {
    description: 'Convert between literal Unicode characters and escape sequences',
    schema: {
      type: 'object',
      properties: {
        input: { type: 'string', description: 'Text or escape sequences to convert' },
        action: {
          type: 'string',
          enum: ['to-js', 'to-python', 'to-codepoints', 'to-html', 'unescape'],
          description: 'to-js: text→\\uXXXX, to-python: text→\\UXXXXXXXX, to-codepoints: text→U+XXXX, to-html: text→&#DDDD;, unescape: any escapes→text',
        },
      },
      required: ['input', 'action'],
    },
    handler: async (input) => {
      const { input: value, action } = input
      let result: string
      switch (action) {
        case 'to-js':
          result = [...value].map((c) => {
            const cp = c.codePointAt(0)!
            return cp > 0xffff
              ? `\\u{${cp.toString(16).toUpperCase()}}`
              : cp < 128 ? c : `\\u${cp.toString(16).padStart(4, '0').toUpperCase()}`
          }).join('')
          break
        case 'to-python':
          result = [...value].map((c) => {
            const cp = c.codePointAt(0)!
            return cp < 128 ? c : `\\U${cp.toString(16).padStart(8, '0').toUpperCase()}`
          }).join('')
          break
        case 'to-codepoints':
          result = [...value].map((c) => `U+${c.codePointAt(0)!.toString(16).padStart(4, '0').toUpperCase()}`).join(' ')
          break
        case 'to-html':
          result = [...value].map((c) => {
            const cp = c.codePointAt(0)!
            return cp < 128 ? c : `&#${cp};`
          }).join('')
          break
        case 'unescape':
          result = value
            .replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
            .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
            .replace(/\\U([0-9a-fA-F]{8})/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
            .replace(/&#([0-9]+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
            .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
          break
        default:
          throw new Error(`Unknown action: ${action}`)
      }
      return { result }
    },
  },

  rot13: {
    description: 'Apply ROT13 cipher to text - also reverses a previous ROT13',
    schema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Text to apply ROT13 to' },
      },
      required: ['text'],
    },
    handler: async (input) => {
      const { text } = input
      const result = text.replace(/[a-zA-Z]/g, (c) => {
        const base = c <= 'Z' ? 65 : 97
        return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base)
      })
      return { result }
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
  const keywords = [
    'SELECT',
    'FROM',
    'WHERE',
    'AND',
    'OR',
    'JOIN',
    'LEFT',
    'RIGHT',
    'INNER',
    'OUTER',
    'ON',
    'GROUP',
    'BY',
    'ORDER',
    'LIMIT',
    'OFFSET',
    'INSERT',
    'INTO',
    'VALUES',
    'UPDATE',
    'SET',
    'DELETE',
    'CREATE',
    'TABLE',
    'ALTER',
    'DROP',
  ]
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
    const type =
      typeof value === 'number' ? 'int' : typeof value === 'boolean' ? 'boolean' : 'String'
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
    cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '')
  } else if (language === 'css') {
    cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '')
  } else if (language === 'html') {
    cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '')
  } else if (language === 'py') {
    cleaned = cleaned
      .replace(/#.*/g, '')
      .replace(/'''[\s\S]*?'''/g, '')
      .replace(/"""[\s\S]*?"""/g, '')
  } else if (language === 'java') {
    cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '')
  }

  cleaned = cleaned
    .replace(/^\s*[\r\n]/gm, '')
    .replace(/\s+/g, ' ')
    .trim()

  return cleaned
}

function computeDiff(
  lines1: string[],
  lines2: string[]
): Array<{ type: string; lineNum: number; content: string }> {
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
  const selfClosing = [
    'br',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'area',
    'base',
    'col',
    'embed',
    'source',
    'track',
    'wbr',
  ]

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

async function testRestApi(
  url: string,
  method: string,
  headersStr: string,
  bodyStr: string
): Promise<any> {
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

    if (
      bodyStr &&
      (method.toUpperCase() === 'POST' ||
        method.toUpperCase() === 'PUT' ||
        method.toUpperCase() === 'PATCH')
    ) {
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

// ─── SQL to MongoDB converter ─────────────────────────────────────────────────

function convertSqlToMongodb(sql: string): {
  operation: string
  collection: string
  query: string
  explanation: string
} {
  const upper = sql.toUpperCase().trimStart()

  if (upper.startsWith('SELECT')) return convertSelect(sql)
  if (upper.startsWith('INSERT')) return convertInsert(sql)
  if (upper.startsWith('UPDATE')) return convertUpdate(sql)
  if (upper.startsWith('DELETE')) return convertDelete(sql)

  throw new Error(
    'Unsupported SQL statement. Only SELECT, INSERT, UPDATE, and DELETE are supported.'
  )
}

function sqlWhereToMongo(where: string): Record<string, any> {
  const filter: Record<string, any> = {}
  if (!where.trim()) return filter

  const conditions = where.split(/\bAND\b/i).map((c) => c.trim())
  for (const cond of conditions) {
    const m = cond.match(
      /^([`'"]?\w+[`'"]?)\s*(=|!=|<>|>=|<=|>|<|LIKE|IS NULL|IS NOT NULL)\s*(.*)$/i
    )
    if (!m) continue
    const [, rawField, op, rawVal] = m
    const field = rawField!.replace(/[`'"]/g, '')
    const val = rawVal ? rawVal.trim().replace(/^['"]|['"]$/g, '') : ''
    const upperOp = op!.toUpperCase()

    if (upperOp === '=' || upperOp === 'IS NOT NULL') {
      if (upperOp === 'IS NOT NULL') {
        filter[field!] = { $exists: true, $ne: null }
        continue
      }
      const coerced =
        val === 'true' ? true : val === 'false' ? false : isNaN(Number(val)) ? val : Number(val)
      filter[field!] = coerced
    } else if (upperOp === '!=' || upperOp === '<>') {
      filter[field!] = { $ne: isNaN(Number(val)) ? val : Number(val) }
    } else if (upperOp === '>') {
      filter[field!] = { $gt: isNaN(Number(val)) ? val : Number(val) }
    } else if (upperOp === '>=') {
      filter[field!] = { $gte: isNaN(Number(val)) ? val : Number(val) }
    } else if (upperOp === '<') {
      filter[field!] = { $lt: isNaN(Number(val)) ? val : Number(val) }
    } else if (upperOp === '<=') {
      filter[field!] = { $lte: isNaN(Number(val)) ? val : Number(val) }
    } else if (upperOp === 'IS NULL') {
      filter[field!] = null
    } else if (upperOp === 'LIKE') {
      const pattern = val.replace(/%/g, '.*').replace(/_/g, '.')
      filter[field!] = { $regex: pattern, $options: 'i' }
    }
  }
  return filter
}

function convertSelect(sql: string): ReturnType<typeof convertSqlToMongodb> {
  const m = sql.match(
    /SELECT\s+([\s\S]*?)\s+FROM\s+(\w+)(?:\s+WHERE\s+([\s\S]*?))?(?:\s+ORDER\s+BY\s+([\s\S]*?))?(?:\s+LIMIT\s+(\d+))?(?:\s+OFFSET\s+(\d+))?$/i
  )
  if (!m) throw new Error('Could not parse SELECT statement')
  const [, cols, table, where, orderBy, limit, offset] = m
  const collection = table!
  const filter = sqlWhereToMongo(where || '')

  const parts: string[] = [`db.${collection}.find(`]
  parts.push(`  ${JSON.stringify(filter, null, 2).replace(/\n/g, '\n  ')}`)

  const colList = cols!.trim()
  if (colList !== '*') {
    const proj: Record<string, number> = {}
    colList.split(',').forEach((c) => {
      proj[c.trim().replace(/[`'"]/g, '')] = 1
    })
    parts.push(`,\n  ${JSON.stringify(proj)}`)
  }
  parts.push(')')

  if (orderBy) {
    const sort: Record<string, number> = {}
    orderBy.split(',').forEach((s) => {
      const [col, dir] = s.trim().split(/\s+/)
      sort[col!.replace(/[`'"]/g, '')] = dir?.toUpperCase() === 'DESC' ? -1 : 1
    })
    parts.push(`\n  .sort(${JSON.stringify(sort)})`)
  }
  if (limit) parts.push(`\n  .limit(${limit})`)
  if (offset) parts.push(`\n  .skip(${offset})`)

  const filterKeys = Object.keys(filter)
  return {
    operation: 'find',
    collection,
    query: parts.join(''),
    explanation: `Queries the "${collection}" collection${filterKeys.length ? ` filtering on ${filterKeys.join(', ')}` : ''}${colList !== '*' ? ` and projecting ${colList}` : ''}${limit ? `, limited to ${limit} results` : ''}.`,
  }
}

function convertInsert(sql: string): ReturnType<typeof convertSqlToMongodb> {
  const m = sql.match(/INSERT\s+INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i)
  if (!m) throw new Error('Could not parse INSERT statement')
  const [, table, cols, vals] = m
  const collection = table!
  const keys = cols!.split(',').map((c) => c.trim().replace(/[`'"]/g, ''))
  const values = vals!.split(',').map((v) => {
    const t = v.trim().replace(/^['"]|['"]$/g, '')
    return t === 'true' ? true : t === 'false' ? false : isNaN(Number(t)) ? t : Number(t)
  })
  const doc: Record<string, any> = {}
  keys.forEach((k, i) => {
    doc[k] = values[i]
  })

  return {
    operation: 'insertOne',
    collection,
    query: `db.${collection}.insertOne(\n  ${JSON.stringify(doc, null, 2).replace(/\n/g, '\n  ')}\n)`,
    explanation: `Inserts one document into the "${collection}" collection with ${keys.length} field${keys.length !== 1 ? 's' : ''}.`,
  }
}

function convertUpdate(sql: string): ReturnType<typeof convertSqlToMongodb> {
  const m = sql.match(/UPDATE\s+(\w+)\s+SET\s+([\s\S]*?)\s+WHERE\s+([\s\S]*)/i)
  if (!m) throw new Error('Could not parse UPDATE statement. A WHERE clause is required.')
  const [, table, setClause, where] = m
  const collection = table!

  const update: Record<string, any> = {}
  setClause!.split(',').forEach((pair) => {
    const [col, val] = pair.split('=').map((s) => s.trim())
    const clean = col!.replace(/[`'"]/g, '')
    const v = val!.replace(/^['"]|['"]$/g, '')
    update[clean] = v === 'true' ? true : v === 'false' ? false : isNaN(Number(v)) ? v : Number(v)
  })

  const filter = sqlWhereToMongo(where || '')
  return {
    operation: 'updateMany',
    collection,
    query: `db.${collection}.updateMany(\n  ${JSON.stringify(filter, null, 2).replace(/\n/g, '\n  ')},\n  { $set: ${JSON.stringify(update, null, 2).replace(/\n/g, '\n  ')} }\n)`,
    explanation: `Updates documents in "${collection}" that match the filter, setting ${Object.keys(update).join(', ')}.`,
  }
}

function convertDelete(sql: string): ReturnType<typeof convertSqlToMongodb> {
  const m = sql.match(/DELETE\s+FROM\s+(\w+)(?:\s+WHERE\s+([\s\S]*))?$/i)
  if (!m) throw new Error('Could not parse DELETE statement')
  const [, table, where] = m
  const collection = table!
  const filter = sqlWhereToMongo(where || '')
  const hasFilter = Object.keys(filter).length > 0

  return {
    operation: hasFilter ? 'deleteMany' : 'deleteMany (ALL documents)',
    collection,
    query: `db.${collection}.deleteMany(\n  ${JSON.stringify(filter, null, 2).replace(/\n/g, '\n  ')}\n)`,
    explanation: hasFilter
      ? `Deletes all documents in "${collection}" matching the filter.`
      : `WARNING: No WHERE clause - this will delete ALL documents in "${collection}".`,
  }
}


function parseCsvText(csv: string): string[][] {
  const rows: string[][] = []
  const lines = csv.split(/\r?\n/)
  for (const line of lines) {
    if (line.trim() === '') continue
    const cells: string[] = []
    let cur = ''
    let inQuote = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuote && line[i + 1] === '"') {
          cur += '"'
          i++
        } else {
          inQuote = !inQuote
        }
      } else if (ch === ',' && !inQuote) {
        cells.push(cur)
        cur = ''
      } else {
        cur += ch
      }
    }
    cells.push(cur)
    rows.push(cells)
  }
  return rows
}

function mergeHeaderRows(headerRows: string[][]): string[] {
  if (headerRows.length === 0) return []
  if (headerRows.length === 1) return headerRows[0]!
  const colCount = Math.max(...headerRows.map((r) => r.length))
  return Array.from({ length: colCount }, (_, i) => {
    const parts = headerRows.map((r) => (r[i] ?? '').trim()).filter(Boolean)
    return parts.join(' - ')
  })
}

// ─── Cron helpers ─────────────────────────────────────────────────────────────

function parseCronExpression(expression: string, nextCount: number) {
  const parts = expression.trim().split(/\s+/)
  if (parts.length < 5 || parts.length > 6) {
    throw new Error('Cron expression must have 5 or 6 fields: [second] minute hour day month weekday')
  }
  const is6 = parts.length === 6
  const [secOrMin, minOrHour, hourOrDay, dayOrMonth, monthOrWeekday, weekday] = parts
  const fields = is6
    ? { second: secOrMin!, minute: minOrHour!, hour: hourOrDay!, day: hourOrDay!, month: dayOrMonth!, weekday: monthOrWeekday! }
    : { minute: secOrMin!, hour: minOrHour!, day: hourOrDay!, month: dayOrMonth!, weekday: monthOrWeekday! }

  const normalize = (p: string, is6field: boolean) => ({
    second: is6field ? parts[0]! : '0',
    minute: is6field ? parts[1]! : parts[0]!,
    hour: is6field ? parts[2]! : parts[1]!,
    day: is6field ? parts[3]! : parts[2]!,
    month: is6field ? parts[4]! : parts[3]!,
    weekday: is6field ? parts[5]! : parts[4]!,
  })

  const f = normalize(expression, is6)
  const description = describeCron(f)
  const next = getNextCronRuns(f, nextCount)
  return { expression, description, nextRuns: next, fields: f }
}

function describeCron(f: { second: string; minute: string; hour: string; day: string; month: string; weekday: string }) {
  const parts: string[] = []
  const descField = (v: string, unit: string) => {
    if (v === '*') return `every ${unit}`
    if (v.startsWith('*/')) return `every ${v.slice(2)} ${unit}s`
    if (v.includes('-')) return `${unit}s ${v}`
    if (v.includes(',')) return `${unit}s ${v}`
    return `at ${unit} ${v}`
  }
  parts.push(descField(f.minute, 'minute'))
  if (f.hour !== '*') parts.push(descField(f.hour, 'hour'))
  if (f.day !== '*') parts.push(`on day-of-month ${f.day}`)
  if (f.month !== '*') parts.push(`in month ${f.month}`)
  if (f.weekday !== '*') {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const d = parseInt(f.weekday)
    parts.push(`on ${!isNaN(d) && days[d] ? days[d] : f.weekday}`)
  }
  return parts.join(', ')
}

function cronFieldMatches(value: number, field: string, min: number, max: number): boolean {
  if (field === '*') return true
  for (const part of field.split(',')) {
    if (part.startsWith('*/')) {
      const step = parseInt(part.slice(2))
      if ((value - min) % step === 0) return true
    } else if (part.includes('-')) {
      const [lo, hi] = part.split('-').map(Number)
      if (value >= lo! && value <= hi!) return true
    } else if (parseInt(part) === value) {
      return true
    }
  }
  return false
}

function getNextCronRuns(f: { second: string; minute: string; hour: string; day: string; month: string; weekday: string }, count: number): string[] {
  const results: string[] = []
  const now = new Date()
  now.setSeconds(now.getSeconds() + 1, 0)
  let cur = new Date(now)
  const limit = 10000
  let iter = 0
  while (results.length < count && iter < limit) {
    iter++
    const min = cur.getMinutes()
    const hour = cur.getHours()
    const day = cur.getDate()
    const month = cur.getMonth() + 1
    const weekday = cur.getDay()
    if (
      cronFieldMatches(min, f.minute, 0, 59) &&
      cronFieldMatches(hour, f.hour, 0, 23) &&
      cronFieldMatches(day, f.day, 1, 31) &&
      cronFieldMatches(month, f.month, 1, 12) &&
      cronFieldMatches(weekday, f.weekday, 0, 6)
    ) {
      results.push(cur.toISOString())
    }
    cur = new Date(cur.getTime() + 60000)
  }
  return results
}

// ─── JWT generator ─────────────────────────────────────────────────────────────

async function generateJwt(
  payload: Record<string, unknown>,
  secret: string,
  algorithm: string,
  expiresIn?: string
) {
  const header = { alg: algorithm, typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const claims: Record<string, unknown> = { iat: now, ...payload }
  if (expiresIn) {
    const match = expiresIn.match(/^(\d+)([smhd]?)$/)
    if (match) {
      const n = parseInt(match[1]!)
      const unit = match[2] || 's'
      const mult: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 }
      claims.exp = now + n * (mult[unit] ?? 1)
    } else {
      const secs = parseInt(expiresIn)
      if (!isNaN(secs)) claims.exp = now + secs
    }
  }
  const enc = (obj: unknown) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url')
  const headerB64 = enc(header)
  const payloadB64 = enc(claims)
  const signingInput = `${headerB64}.${payloadB64}`

  const hashName = algorithm === 'HS512' ? 'SHA-512' : 'SHA-256'
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: hashName },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signingInput))
  const sigB64 = Buffer.from(sig).toString('base64url')
  const token = `${signingInput}.${sigB64}`
  return { token, header, payload: claims }
}

// ─── Lorem ipsum ──────────────────────────────────────────────────────────────

const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'eu', 'fugiat', 'nulla', 'pariatur', 'excepteur',
  'sint', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui',
  'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum',
]

const ENGLISH_WORDS = [
  'the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog', 'developer',
  'builds', 'creates', 'designs', 'tests', 'deploys', 'application', 'system',
  'function', 'component', 'module', 'service', 'database', 'network', 'cloud',
  'platform', 'interface', 'library', 'framework', 'software', 'hardware',
  'performance', 'security', 'scalable', 'reliable', 'efficient', 'robust',
  'flexible', 'maintainable', 'readable', 'elegant', 'simple', 'complex',
  'modern', 'legacy', 'innovative', 'standard', 'custom', 'dynamic', 'static',
]

let _loremSeed = 0
function seededWord(pool: string[]): string {
  return pool[_loremSeed++ % pool.length]!
}

function generateLoremIpsum(type: string, count: number, style: string): string {
  _loremSeed = 0
  const pool = style === 'english' ? ENGLISH_WORDS : LOREM_WORDS
  const n = Math.max(1, Math.min(count, 200))

  const randomWord = () => seededWord(pool)
  const sentence = (len = 8) => {
    const words = Array.from({ length: len + Math.floor(_loremSeed % 5) }, randomWord)
    words[0] = words[0]!.charAt(0).toUpperCase() + words[0]!.slice(1)
    return words.join(' ') + '.'
  }
  const paragraph = () =>
    Array.from({ length: 4 + (_loremSeed % 3) }, () => sentence(7 + (_loremSeed % 4))).join(' ')

  if (type === 'words') return Array.from({ length: n }, randomWord).join(' ')
  if (type === 'sentences') return Array.from({ length: n }, () => sentence()).join(' ')
  return Array.from({ length: n }, paragraph).join('\n\n')
}

// ─── JSON Schema validator ─────────────────────────────────────────────────────

function validateJsonSchema(
  doc: unknown,
  schema: Record<string, unknown>,
  path: string
): string[] {
  const errors: string[] = []
  const at = path || 'root'

  if (schema.type) {
    const expected = schema.type as string
    const actual = Array.isArray(doc) ? 'array' : doc === null ? 'null' : typeof doc
    if (expected !== actual) {
      errors.push(`${at}: expected type "${expected}" but got "${actual}"`)
      return errors
    }
  }

  if (schema.enum && Array.isArray(schema.enum)) {
    if (!schema.enum.includes(doc)) {
      errors.push(`${at}: value must be one of [${schema.enum.map((v) => JSON.stringify(v)).join(', ')}]`)
    }
  }

  if (typeof doc === 'string') {
    if (typeof schema.minLength === 'number' && doc.length < schema.minLength)
      errors.push(`${at}: length ${doc.length} is less than minLength ${schema.minLength}`)
    if (typeof schema.maxLength === 'number' && doc.length > schema.maxLength)
      errors.push(`${at}: length ${doc.length} exceeds maxLength ${schema.maxLength}`)
    if (schema.pattern) {
      try {
        if (!new RegExp(schema.pattern as string).test(doc))
          errors.push(`${at}: does not match pattern "${schema.pattern}"`)
      } catch {}
    }
  }

  if (typeof doc === 'number') {
    if (typeof schema.minimum === 'number' && doc < schema.minimum)
      errors.push(`${at}: ${doc} is less than minimum ${schema.minimum}`)
    if (typeof schema.maximum === 'number' && doc > schema.maximum)
      errors.push(`${at}: ${doc} exceeds maximum ${schema.maximum}`)
  }

  if (Array.isArray(doc)) {
    if (typeof schema.minItems === 'number' && doc.length < schema.minItems)
      errors.push(`${at}: array length ${doc.length} is less than minItems ${schema.minItems}`)
    if (typeof schema.maxItems === 'number' && doc.length > schema.maxItems)
      errors.push(`${at}: array length ${doc.length} exceeds maxItems ${schema.maxItems}`)
    if (schema.items && typeof schema.items === 'object') {
      doc.forEach((item, i) =>
        errors.push(...validateJsonSchema(item, schema.items as Record<string, unknown>, `${at}[${i}]`))
      )
    }
  }

  if (doc !== null && typeof doc === 'object' && !Array.isArray(doc)) {
    const obj = doc as Record<string, unknown>
    if (Array.isArray(schema.required)) {
      for (const req of schema.required as string[]) {
        if (!(req in obj)) errors.push(`${at}: missing required property "${req}"`)
      }
    }
    if (schema.properties && typeof schema.properties === 'object') {
      for (const [key, propSchema] of Object.entries(schema.properties as Record<string, unknown>)) {
        if (key in obj) {
          errors.push(...validateJsonSchema(obj[key], propSchema as Record<string, unknown>, `${at}.${key}`))
        }
      }
    }
    if (schema.additionalProperties === false && schema.properties) {
      const allowed = new Set(Object.keys(schema.properties as object))
      for (const key of Object.keys(obj)) {
        if (!allowed.has(key)) errors.push(`${at}: additional property "${key}" is not allowed`)
      }
    }
  }

  return errors
}

// ─── JSON Schema generator ─────────────────────────────────────────────────────

function inferJsonSchema(value: unknown): Record<string, unknown> {
  if (value === null) return { type: 'null' }
  if (Array.isArray(value)) {
    const itemSchemas = value.map(inferJsonSchema)
    const types = [...new Set(itemSchemas.map((s) => s.type as string))]
    const items = types.length === 1 && itemSchemas.length > 0 ? itemSchemas[0] : {}
    return { type: 'array', items }
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    const properties: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(obj)) {
      properties[k] = inferJsonSchema(v)
    }
    return {
      type: 'object',
      properties,
      required: Object.keys(obj),
      additionalProperties: false,
    }
  }
  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}(T[\d:.Z+-]+)?$/.test(value)) return { type: 'string', format: 'date-time' }
    if (/^[^@]+@[^@]+\.[^@]+$/.test(value)) return { type: 'string', format: 'email' }
    if (/^https?:\/\//.test(value)) return { type: 'string', format: 'uri' }
    return { type: 'string' }
  }
  if (typeof value === 'number') return Number.isInteger(value) ? { type: 'integer' } : { type: 'number' }
  if (typeof value === 'boolean') return { type: 'boolean' }
  return {}
}

// ─── Color contrast helpers ────────────────────────────────────────────────────

function parseColorToRgb(color: string): { r: number; g: number; b: number } | null {
  const s = color.trim()
  if (s.startsWith('#')) {
    const hex = s.slice(1)
    if (hex.length === 3) {
      const [r, g, b] = hex.split('').map((c) => parseInt(c + c, 16))
      return { r: r!, g: g!, b: b! }
    }
    if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      }
    }
  }
  const rgb = s.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i)
  if (rgb) return { r: parseInt(rgb[1]!), g: parseInt(rgb[2]!), b: parseInt(rgb[3]!) }
  const hsl = s.match(/^hsl\(\s*(\d+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)$/i)
  if (hsl) {
    const h = parseInt(hsl[1]!) / 360
    const sl = parseFloat(hsl[2]!) / 100
    const l = parseFloat(hsl[3]!) / 100
    const q = l < 0.5 ? l * (1 + sl) : l + sl - l * sl
    const p = 2 * l - q
    const hue2rgb = (t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    return {
      r: Math.round(hue2rgb(h + 1 / 3) * 255),
      g: Math.round(hue2rgb(h) * 255),
      b: Math.round(hue2rgb(h - 1 / 3) * 255),
    }
  }
  return null
}

function relativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const chan = (c: number) => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * chan(rgb.r) + 0.7152 * chan(rgb.g) + 0.0722 * chan(rgb.b)
}

function contrastRatio(fg: { r: number; g: number; b: number }, bg: { r: number; g: number; b: number }): number {
  const l1 = relativeLuminance(fg)
  const l2 = relativeLuminance(bg)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

function rgbToHslValues(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rr = r / 255, gg = g / 255, bb = b / 255
  const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === rr) h = ((gg - bb) / d + (gg < bb ? 6 : 0)) / 6
  else if (max === gg) h = ((bb - rr) / d + 2) / 6
  else h = ((rr - gg) / d + 4) / 6
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function hslToHexValue(h: number, s: number, l: number): string {
  const sl = s / 100, ll = l / 100
  const q = ll < 0.5 ? ll * (1 + sl) : ll + sl - ll * sl
  const p = 2 * ll - q
  const hue2rgb = (t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  const hh = h / 360
  const r = Math.round(hue2rgb(hh + 1 / 3) * 255)
  const g = Math.round(hue2rgb(hh) * 255)
  const b = Math.round(hue2rgb(hh - 1 / 3) * 255)
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

function colorEntry(h: number, s: number, l: number) {
  const hex = hslToHexValue(h, s, l)
  const rgb = parseColorToRgb(hex)!
  return { hex, rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, hsl: `hsl(${h}, ${s}%, ${l}%)` }
}

function generatePalettes(base: { h: number; s: number; l: number }) {
  const { h, s, l } = base
  const mod = (n: number, m: number) => ((n % m) + m) % m
  return {
    base: colorEntry(h, s, l),
    complementary: [colorEntry(h, s, l), colorEntry(mod(h + 180, 360), s, l)],
    analogous: [
      colorEntry(mod(h - 30, 360), s, l),
      colorEntry(h, s, l),
      colorEntry(mod(h + 30, 360), s, l),
    ],
    triadic: [
      colorEntry(h, s, l),
      colorEntry(mod(h + 120, 360), s, l),
      colorEntry(mod(h + 240, 360), s, l),
    ],
    tetradic: [
      colorEntry(h, s, l),
      colorEntry(mod(h + 90, 360), s, l),
      colorEntry(mod(h + 180, 360), s, l),
      colorEntry(mod(h + 270, 360), s, l),
    ],
    shades: Array.from({ length: 5 }, (_, i) => colorEntry(h, s, 20 + i * 15)),
  }
}
