import { describe, it, expect, vi } from 'vitest'
import { toolHandlers } from '../lib/tool-handlers'

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function run(id: string, input: Record<string, unknown>) {
  const handler = toolHandlers[id]
  if (!handler) throw new Error(`No handler for: ${id}`)
  return handler.handler(input)
}

// ─── js-minifier ──────────────────────────────────────────────────────────────

describe('js-minifier', () => {
  it('removes extra whitespace from JS', async () => {
    const result = await run('js-minifier', { code: 'function   hello()  {\n  return 1\n}' })
    expect(result).toBeTypeOf('string')
    expect(result.length).toBeLessThan('function   hello()  {\n  return 1\n}'.length)
  })
})

// ─── json-minifier ────────────────────────────────────────────────────────────

describe('json-minifier', () => {
  it('strips whitespace from JSON', async () => {
    const result = await run('json-minifier', { json: '{ "a": 1,  "b": 2 }' })
    expect(result).toBe('{"a":1,"b":2}')
  })

  it('throws on invalid JSON', async () => {
    await expect(run('json-minifier', { json: '{bad}' })).rejects.toThrow('Invalid JSON')
  })
})

// ─── json-beautifier ──────────────────────────────────────────────────────────

describe('json-beautifier', () => {
  it('formats JSON with default 2-space indent', async () => {
    const result = await run('json-beautifier', { json: '{"a":1}' })
    expect(result).toBe('{\n  "a": 1\n}')
  })

  it('respects custom indent', async () => {
    const result = await run('json-beautifier', { json: '{"a":1}', indent: 4 })
    expect(result).toBe('{\n    "a": 1\n}')
  })

  it('throws on invalid JSON', async () => {
    await expect(run('json-beautifier', { json: 'notjson' })).rejects.toThrow('Invalid JSON')
  })
})

// ─── json-formatter ───────────────────────────────────────────────────────────

describe('json-formatter', () => {
  it('formats valid JSON', async () => {
    const result = await run('json-formatter', { json: '{"x":true}' })
    expect(result).toContain('"x": true')
  })

  it('throws on invalid JSON', async () => {
    await expect(run('json-formatter', { json: '' })).rejects.toThrow('Invalid JSON')
  })
})

// ─── timestamp-converter ──────────────────────────────────────────────────────

describe('timestamp-converter', () => {
  it('converts unix timestamp to ISO', async () => {
    const result = await run('timestamp-converter', { input: '1700000000' })
    expect(result).toMatchObject({ unix: 1700000000, iso: expect.stringContaining('2023') })
  })

  it('converts ISO date to unix', async () => {
    const result = await run('timestamp-converter', { input: '2000-01-01T00:00:00Z' })
    expect(result).toMatchObject({ unix: 946684800 })
  })

  it('throws on invalid input', async () => {
    await expect(run('timestamp-converter', { input: 'notadate' })).rejects.toThrow()
  })
})

// ─── url-splitter ─────────────────────────────────────────────────────────────

describe('url-splitter', () => {
  it('parses URL components', async () => {
    const result = await run('url-splitter', { url: 'https://example.com:8080/path?q=1#hash' })
    expect(result).toMatchObject({
      protocol: 'https:',
      hostname: 'example.com',
      port: '8080',
      pathname: '/path',
      search: '?q=1',
      hash: '#hash',
    })
  })

  it('throws on invalid URL', async () => {
    await expect(run('url-splitter', { url: 'not-a-url' })).rejects.toThrow('Invalid URL')
  })
})

// ─── url-encoder-decoder ──────────────────────────────────────────────────────

describe('url-encoder-decoder', () => {
  it('encodes special characters', async () => {
    const result = await run('url-encoder-decoder', { input: 'hello world!', action: 'encode' })
    expect(result).toBe('hello%20world!')
  })

  it('decodes encoded string', async () => {
    const result = await run('url-encoder-decoder', {
      input: 'hello%20world!',
      action: 'decode',
    })
    expect(result).toBe('hello world!')
  })
})

// ─── html-encoder-decoder ────────────────────────────────────────────────────

describe('html-encoder-decoder', () => {
  it('encodes HTML entities', async () => {
    const result = await run('html-encoder-decoder', {
      input: '<div class="test">',
      action: 'encode',
    })
    expect(result).toBe('&lt;div class=&quot;test&quot;&gt;')
  })

  it('decodes HTML entities', async () => {
    const result = await run('html-encoder-decoder', {
      input: '&lt;div&gt;',
      action: 'decode',
    })
    expect(result).toBe('<div>')
  })
})

// ─── base64-encoder ───────────────────────────────────────────────────────────

describe('base64-encoder', () => {
  it('encodes text to base64', async () => {
    const result = await run('base64-encoder', { text: 'hello' })
    expect(result).toBe('aGVsbG8=')
  })
})

// ─── base64-decoder ───────────────────────────────────────────────────────────

describe('base64-decoder', () => {
  it('decodes base64 to text', async () => {
    const result = await run('base64-decoder', { base64: 'aGVsbG8=' })
    expect(result).toBe('hello')
  })
})

// ─── jwt-decoder ──────────────────────────────────────────────────────────────

describe('jwt-decoder', () => {
  const sampleJwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

  it('decodes header, payload and signature', async () => {
    const result = await run('jwt-decoder', { token: sampleJwt })
    expect(result).toMatchObject({
      header: { alg: 'HS256', typ: 'JWT' },
      payload: { sub: '1234567890', name: 'John Doe' },
    })
    expect(result.signature).toBeTruthy()
  })

  it('throws on non-JWT string', async () => {
    await expect(run('jwt-decoder', { token: 'not.a.jwt.at.all' })).rejects.toThrow()
  })
})

// ─── xml-string-escaper ───────────────────────────────────────────────────────

describe('xml-string-escaper', () => {
  it('escapes XML special chars', async () => {
    const result = await run('xml-string-escaper', {
      input: '<tag attr="v">',
      action: 'escape',
    })
    expect(result).toBe('&lt;tag attr=&quot;v&quot;&gt;')
  })

  it('unescapes XML entities', async () => {
    const result = await run('xml-string-escaper', {
      input: '&lt;tag&gt;',
      action: 'unescape',
    })
    expect(result).toBe('<tag>')
  })
})

// ─── js-string-escaper ───────────────────────────────────────────────────────

describe('js-string-escaper', () => {
  it('escapes backslashes and quotes', async () => {
    const result = await run('js-string-escaper', { input: 'say "hello"\nworld' })
    expect(result).toBe('say \\"hello\\"\\nworld')
  })
})

// ─── regex-parser ────────────────────────────────────────────────────────────

describe('regex-parser', () => {
  it('finds matches', async () => {
    const result = await run('regex-parser', {
      pattern: '\\d+',
      flags: 'g',
      testString: 'abc 123 def 456',
    })
    expect(result.hasMatch).toBe(true)
    expect(result.matches).toContain('123')
    expect(result.matches).toContain('456')
  })

  it('reports no match', async () => {
    const result = await run('regex-parser', {
      pattern: 'xyz',
      flags: '',
      testString: 'hello world',
    })
    expect(result.hasMatch).toBe(false)
    expect(result.matches).toHaveLength(0)
  })

  it('throws on invalid pattern', async () => {
    await expect(run('regex-parser', { pattern: '[invalid', testString: 'test' })).rejects.toThrow(
      'Invalid regex pattern'
    )
  })
})

// ─── yaml-validator ──────────────────────────────────────────────────────────

describe('yaml-validator', () => {
  it('validates correct YAML', async () => {
    const result = await run('yaml-validator', { yaml: 'key: value\nlist:\n  - a\n  - b' })
    expect(result).toMatchObject({ isValid: true })
  })

  it('rejects invalid YAML', async () => {
    await expect(run('yaml-validator', { yaml: '{bad: yaml: here' })).rejects.toThrow()
  })
})

// ─── js-validator ────────────────────────────────────────────────────────────

describe('js-validator', () => {
  it('validates correct JS', async () => {
    const result = await run('js-validator', { code: 'const x = 1 + 2;' })
    expect(result).toMatchObject({ isValid: true })
  })

  it('rejects invalid JS', async () => {
    await expect(run('js-validator', { code: 'function( {' })).rejects.toThrow()
  })
})

// ─── mime-type-checker ────────────────────────────────────────────────────────

describe('mime-type-checker', () => {
  it('returns correct MIME for json', async () => {
    expect(await run('mime-type-checker', { filename: 'data.json' })).toBe('application/json')
  })

  it('returns correct MIME for png', async () => {
    expect(await run('mime-type-checker', { filename: 'image.png' })).toBe('image/png')
  })

  it('returns octet-stream for unknown ext', async () => {
    expect(await run('mime-type-checker', { filename: 'file.xyz' })).toBe(
      'application/octet-stream'
    )
  })
})

// ─── rgb-to-hex ───────────────────────────────────────────────────────────────

describe('rgb-to-hex', () => {
  it('converts rgb(255,0,0) to #FF0000', async () => {
    expect(await run('rgb-to-hex', { r: 255, g: 0, b: 0 })).toBe('#FF0000')
  })

  it('converts rgb(0,0,0) to #000000', async () => {
    expect(await run('rgb-to-hex', { r: 0, g: 0, b: 0 })).toBe('#000000')
  })

  it('clamps out-of-range values', async () => {
    const result = await run('rgb-to-hex', { r: 300, g: 0, b: 0 })
    expect(result).toBe('#FF0000')
  })
})

// ─── hex-to-rgb ───────────────────────────────────────────────────────────────

describe('hex-to-rgb', () => {
  it('converts #FF0000 to rgb(255,0,0)', async () => {
    const result = await run('hex-to-rgb', { hex: '#FF0000' })
    expect(result).toMatchObject({ r: 255, g: 0, b: 0 })
  })

  it('throws on invalid hex', async () => {
    await expect(run('hex-to-rgb', { hex: '#GGGGGG' })).rejects.toThrow('Invalid HEX color')
  })
})

// ─── text-case-converter ──────────────────────────────────────────────────────

describe('text-case-converter', () => {
  it('converts to uppercase', async () => {
    const result = await run('text-case-converter', { text: 'hello world', case: 'uppercase' })
    expect(result.converted).toBe('HELLO WORLD')
  })

  it('converts to lowercase', async () => {
    const result = await run('text-case-converter', { text: 'HELLO', case: 'lowercase' })
    expect(result.converted).toBe('hello')
  })

  it('converts to camelCase', async () => {
    const result = await run('text-case-converter', { text: 'hello world', case: 'camelCase' })
    expect(result.converted).toBe('helloWorld')
  })

  it('converts to snake_case', async () => {
    const result = await run('text-case-converter', { text: 'hello world', case: 'snake_case' })
    expect(result.converted).toBe('hello_world')
  })

  it('converts to kebab-case', async () => {
    const result = await run('text-case-converter', { text: 'hello world', case: 'kebab-case' })
    expect(result.converted).toBe('hello-world')
  })

  it('converts to PascalCase', async () => {
    const result = await run('text-case-converter', { text: 'hello world', case: 'PascalCase' })
    expect(result.converted).toBe('HelloWorld')
  })

  it('throws on unknown case', async () => {
    await expect(run('text-case-converter', { text: 'hi', case: 'unknownCase' })).rejects.toThrow()
  })
})

// ─── unit-converter ───────────────────────────────────────────────────────────

describe('unit-converter', () => {
  it('converts km to m', async () => {
    const result = await run('unit-converter', { value: 1, fromUnit: 'km', toUnit: 'm' })
    expect(result.value).toBe(1000)
  })

  it('converts kg to lb', async () => {
    const result = await run('unit-converter', { value: 1, fromUnit: 'kg', toUnit: 'lb' })
    expect(result.value).toBeCloseTo(2.2046, 2)
  })

  it('throws on unknown unit', async () => {
    await expect(
      run('unit-converter', { value: 1, fromUnit: 'xyz', toUnit: 'm' })
    ).rejects.toThrow()
  })

  it('throws on incompatible units', async () => {
    await expect(
      run('unit-converter', { value: 1, fromUnit: 'km', toUnit: 'kg' })
    ).rejects.toThrow()
  })
})

// ─── uuid-generator ───────────────────────────────────────────────────────────

describe('uuid-generator', () => {
  it('generates requested count of UUIDs', async () => {
    const result = await run('uuid-generator', { count: 5 })
    expect(result.uuids).toHaveLength(5)
  })

  it('each UUID matches v4 format', async () => {
    const result = await run('uuid-generator', { count: 3 })
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    result.uuids.forEach((id: string) => expect(id).toMatch(uuidRegex))
  })

  it('caps count at 100', async () => {
    const result = await run('uuid-generator', { count: 200 })
    expect(result.uuids).toHaveLength(100)
  })
})

// ─── hash-generator ───────────────────────────────────────────────────────────

describe('hash-generator', () => {
  it('generates sha256 hash', async () => {
    const result = await run('hash-generator', { text: 'hello', algorithm: 'sha256' })
    expect(result.hash).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824')
  })

  it('generates md5 hash', async () => {
    const result = await run('hash-generator', { text: 'hello', algorithm: 'md5' })
    expect(result.hash).toBe('5d41402abc4b2a76b9719d911017c592')
  })

  it('throws on invalid algorithm', async () => {
    await expect(run('hash-generator', { text: 'x', algorithm: 'sha999' })).rejects.toThrow()
  })
})

// ─── password-generator ───────────────────────────────────────────────────────

describe('password-generator', () => {
  it('generates password of specified length', async () => {
    const result = await run('password-generator', {
      length: 24,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: false,
    })
    expect(result.password).toHaveLength(24)
  })

  it('only uses numbers when requested', async () => {
    const result = await run('password-generator', {
      length: 10,
      uppercase: false,
      lowercase: false,
      numbers: true,
      symbols: false,
    })
    expect(result.password).toMatch(/^\d+$/)
  })

  it('throws when length is out of range', async () => {
    await expect(run('password-generator', { length: 4 })).rejects.toThrow()
  })

  it('throws when no character types selected', async () => {
    await expect(
      run('password-generator', {
        length: 16,
        uppercase: false,
        lowercase: false,
        numbers: false,
        symbols: false,
      })
    ).rejects.toThrow()
  })
})

// ─── json-to-xml ─────────────────────────────────────────────────────────────

describe('json-to-xml', () => {
  it('converts simple JSON to XML', async () => {
    const result = await run('json-to-xml', { json: '{"name":"Alice","age":30}' })
    expect(result).toContain('<name>Alice</name>')
    expect(result).toContain('<age>30</age>')
  })

  it('throws on invalid JSON', async () => {
    await expect(run('json-to-xml', { json: 'bad' })).rejects.toThrow('Invalid JSON')
  })
})

// ─── json-to-java ────────────────────────────────────────────────────────────

describe('json-to-java', () => {
  it('generates Java class from JSON', async () => {
    const result = await run('json-to-java', {
      json: '{"name":"Alice","age":30}',
      className: 'Person',
    })
    expect(result).toContain('class Person')
    expect(result).toContain('name')
    expect(result).toContain('age')
  })
})

// ─── json-to-csharp ──────────────────────────────────────────────────────────

describe('json-to-csharp', () => {
  it('generates C# class from JSON', async () => {
    const result = await run('json-to-csharp', {
      json: '{"name":"Alice"}',
      className: 'Person',
    })
    expect(result).toContain('class Person')
  })
})

// ─── json-to-php ─────────────────────────────────────────────────────────────

describe('json-to-php', () => {
  it('generates PHP array from JSON', async () => {
    const result = await run('json-to-php', { json: '{"key":"val"}' })
    expect(result).toContain("'key'")
    expect(result).toContain("'val'")
  })

  it('throws on invalid JSON', async () => {
    await expect(run('json-to-php', { json: 'bad' })).rejects.toThrow('Invalid JSON')
  })
})

// ─── xml-to-json ─────────────────────────────────────────────────────────────

describe('xml-to-json', () => {
  it('converts simple XML to JSON', async () => {
    const result = await run('xml-to-json', { xml: '<root><name>Alice</name></root>' })
    const parsed = JSON.parse(result)
    expect(parsed).toBeDefined()
  })

  it('returns something for invalid XML (parser is lenient)', async () => {
    // fast-xml-parser is lenient and may return {} for malformed input
    const result = await run('xml-to-json', { xml: '<unclosed>' })
    expect(result).toBeTypeOf('string')
  })
})

// ─── csv-to-json ─────────────────────────────────────────────────────────────

describe('csv-to-json', () => {
  it('converts CSV with headers to JSON array', async () => {
    const csv = 'name,age\nAlice,30\nBob,25'
    const result = await run('csv-to-json', { csv, hasHeader: true })
    const parsed = JSON.parse(result)
    expect(parsed).toHaveLength(2)
    expect(parsed[0]).toMatchObject({ name: 'Alice', age: '30' })
  })

  it('converts CSV without headers to array of arrays', async () => {
    const csv = 'Alice,30\nBob,25'
    const result = await run('csv-to-json', { csv, hasHeader: false })
    const parsed = JSON.parse(result)
    expect(parsed).toHaveLength(2)
    expect(parsed[0]).toContain('Alice')
  })
})

// ─── csv-to-sql ──────────────────────────────────────────────────────────────

describe('csv-to-sql', () => {
  it('generates INSERT statements', async () => {
    const csv = 'name,age\nAlice,30'
    const result = await run('csv-to-sql', { csv, tableName: 'users' })
    expect(result).toContain('INSERT INTO users')
    expect(result).toContain("'Alice'")
    expect(result).toContain("'30'")
  })
})

// ─── yaml-to-json ────────────────────────────────────────────────────────────

describe('yaml-to-json', () => {
  it('converts YAML to JSON', async () => {
    const result = await run('yaml-to-json', { yaml: 'name: Alice\nage: 30' })
    const parsed = JSON.parse(result)
    expect(parsed).toMatchObject({ name: 'Alice', age: 30 })
  })

  it('throws on invalid YAML', async () => {
    await expect(run('yaml-to-json', { yaml: '{bad: yaml:' })).rejects.toThrow()
  })
})

// ─── json-to-yaml ────────────────────────────────────────────────────────────

describe('json-to-yaml', () => {
  it('converts JSON to YAML', async () => {
    const result = await run('json-to-yaml', { json: '{"name":"Alice","age":30}' })
    expect(result).toContain('name: Alice')
    expect(result).toContain('age: 30')
  })

  it('throws on invalid JSON', async () => {
    await expect(run('json-to-yaml', { json: 'bad' })).rejects.toThrow()
  })
})

// ─── idn-converter ───────────────────────────────────────────────────────────

describe('idn-converter', () => {
  it('converts domain to ASCII representation', async () => {
    const result = await run('idn-converter', { input: 'hello world', action: 'toAscii' })
    expect(result).toBeTypeOf('string')
    expect(result).not.toContain(' ')
  })

  it('converts ASCII back toward unicode', async () => {
    const encoded = await run('idn-converter', { input: 'hello world', action: 'toAscii' })
    const decoded = await run('idn-converter', { input: encoded, action: 'toUnicode' })
    expect(decoded).toBe('hello world')
  })
})

// ─── ini-to-json ─────────────────────────────────────────────────────────────

describe('ini-to-json', () => {
  it('converts INI to JSON', async () => {
    const ini = '[section]\nkey=value'
    const result = await run('ini-to-json', { ini })
    const parsed = JSON.parse(result)
    expect(parsed).toBeDefined()
  })
})

// ─── ini-to-yaml ─────────────────────────────────────────────────────────────

describe('ini-to-yaml', () => {
  it('converts INI to YAML', async () => {
    const ini = '[section]\nkey=value'
    const result = await run('ini-to-yaml', { ini })
    expect(result).toBeTypeOf('string')
    expect(result.length).toBeGreaterThan(0)
  })
})

// ─── csv-to-xml ──────────────────────────────────────────────────────────────

describe('csv-to-xml', () => {
  it('wraps CSV rows in XML elements', async () => {
    const csv = 'name,age\nAlice,30'
    const result = await run('csv-to-xml', { csv })
    expect(result).toContain('<name>Alice</name>')
    expect(result).toContain('<rows>')
  })
})

// ─── csv-to-yaml ─────────────────────────────────────────────────────────────

describe('csv-to-yaml', () => {
  it('converts CSV to YAML list', async () => {
    const csv = 'name,age\nAlice,30'
    const result = await run('csv-to-yaml', { csv })
    expect(result).toContain('name: Alice')
  })
})
