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

// Phase 3 helper functions

function parseSemver(v: string) {
  const s = v.trim().replace(/^v/, '')
  const match = s.match(/^(\d+)\.(\d+)\.(\d+)(?:-([\w.]+))?(?:\+([\w.]+))?$/)
  if (!match) throw new Error(`Invalid semver: ${v}`)
  return {
    major: parseInt(match[1]!),
    minor: parseInt(match[2]!),
    patch: parseInt(match[3]!),
    prerelease: match[4] ?? null,
    build: match[5] ?? null,
  }
}

const GITIGNORE_TEMPLATES: Record<string, string> = {
  Node: `node_modules/
dist/
build/
.env
.env.local
.env.*.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
.pnpm-store/
*.tsbuildinfo
.next/
.nuxt/
.cache/
coverage/
.nyc_output/`,
  Python: `__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
share/python-wheels/
*.egg-info/
.installed.cfg
*.egg
MANIFEST
.env
.venv
env/
venv/
ENV/
env.bak/
venv.bak/
.pytest_cache/
.mypy_cache/
.ruff_cache/
htmlcov/
.coverage
.coverage.*
*.cover
*.py,cover`,
  Ruby: `*.gem
*.rbc
/.config
/coverage/
/InstalledFiles
/pkg/
/spec/reports/
/spec/examples.txt
/test/tmp/
/test/version_tmp/
/tmp/
.bundle/
.yardoc/
_yardoc/
doc/
/Gemfile.lock
vendor/bundle
.ruby-version
.rbenv-vars
*.log`,
  Java: `*.class
*.log
*.jar
*.war
*.ear
*.nar
*.zip
*.tar.gz
*.rar
hs_err_pid*
.mtj.tmp/
target/
.classpath
.project
.settings/
.springBeans
.sts4-cache
.gradle/
build/
!gradle/wrapper/gradle-wrapper.jar
!**/src/main/**/build/
!**/src/test/**/build/`,
  Go: `*.exe
*.exe~
*.dll
*.so
*.dylib
*.test
*.out
go.work
vendor/
bin/
dist/`,
  Rust: `debug/
target/
Cargo.lock
**/*.rs.bk
*.pdb`,
  PHP: `vendor/
.env
.phpunit.result.cache
.phpunit.cache/
storage/framework/
storage/logs/
bootstrap/cache/
composer.phar
*.log`,
  CSharp: `*.suo
*.user
*.userosscache
*.sln.docstates
*.userprefs
[Dd]ebug/
[Dd]ebugPublic/
[Rr]elease/
[Rr]eleases/
x64/
x86/
[Ww][Ii][Nn]32/
[Aa][Rr][Mm]/
[Aa][Rr][Mm]64/
bld/
[Bb]in/
[Oo]bj/
[Ll]og/
[Ll]ogs/
project.lock.json
project.fragment.lock.json
artifacts/
.vs/
*.nupkg
*.snupkg
*.nuspec
*.dll
*.exe
*.pdb`,
  Swift: `.DS_Store
/.build
/Packages
/*.xcodeproj
xcuserdata/
DerivedData/
.swiftpm/
*.resolved`,
  Kotlin: `*.class
*.log
*.jar
*.war
.gradle/
build/
!gradle/wrapper/gradle-wrapper.jar
.idea/
*.iml
out/
*.hprof`,
  macOS: `.DS_Store
.AppleDouble
.LSOverride
Icon
._*
.DocumentRevisions-V100
.fseventsd
.Spotlight-V100
.TemporaryItems
.Trashes
.VolumeIcon.icns
.com.apple.timemachine.donotpresent
.AppleDB
.AppleDesktop
Network Trash Folder
Temporary Items
.apdisk`,
  Windows: `Thumbs.db
Thumbs.db:encryptable
ehthumbs.db
ehthumbs_vista.db
*.tmp
*.stackdump
[Dd]esktop.ini
$RECYCLE.BIN/
*.cab
*.msi
*.msix
*.msm
*.msp
*.lnk`,
  Linux: `*~
.fuse_hidden*
.directory
.Trash-*
.nfs*`,
  VSCode: `.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
!.vscode/*.code-snippets
.history/
*.vsix`,
  JetBrains: `.idea/
*.iws
out/
.idea_modules/
atlassian-ide-plugin.xml
com_crashlytics_export_strings.xml
crashlytics.properties
crashlytics-build.properties
fabric.properties`,
  Vim: `[._]*.s[a-v][a-z]
!*.svg
[._]*.sw[a-p]
[._]s[a-rt-v][a-z]
[._]ss[a-gi-z]
[._]sw[a-p]
Session.vim
Sessionx.vim
.netrwhist
*~
tags
[._]*.un~`,
  Xcode: `build/
*.pbxuser
!default.pbxuser
*.mode1v3
!default.mode1v3
*.mode2v3
!default.mode2v3
*.perspectivev3
!default.perspectivev3
xcuserdata/
*.xccheckout
*.moved-aside
DerivedData
*.hmap
*.ipa
*.xcuserstate
.DS_Store`,
  Django: `*.log
*.pot
*.pyc
__pycache__/
local_settings.py
db.sqlite3
db.sqlite3-journal
media/
staticfiles/
.env`,
  Rails: `.bundle/
db/*.sqlite3
db/*.sqlite3-journal
db/*.sqlite3-shm
db/*.sqlite3-wal
log/
tmp/
storage/
.byebug_history
public/packs
public/packs-test
node_modules/
yarn-error.log
coverage/
.env`,
  Laravel: `vendor/
node_modules/
public/hot
public/storage
storage/*.key
.env
.env.backup
.phpunit.result.cache
Homestead.json
Homestead.yaml
npm-debug.log
yarn-error.log
/.idea
/.vscode`,
  NextJS: `.next/
out/
build/
node_modules/
.env*.local
.vercel
*.tsbuildinfo
next-env.d.ts`,
  React: `node_modules/
build/
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*`,
  Angular: `dist/
tmp/
out-tsc/
bazel-out/
node_modules/
npm-debug.log
yarn-error.log
testem.log
.DS_Store
.angular/cache
.sass-cache/
/connect.lock
/coverage
/libpeerconnection.log
/typings`,
  Vue: `node_modules/
dist/
.env.local
.env.*.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
.idea
.DS_Store`,
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
        action: { type: 'string', enum: ['encode', 'decode'], description: 'encode or decode' },
      },
      required: ['input', 'action'],
    },
    handler: async (input) => {
      const { input: text, action } = input
      if (action === 'encode') {
        return Buffer.from(text).toString('base64')
      }
      try {
        return Buffer.from(text, 'base64').toString('utf-8')
      } catch {
        throw new Error('Invalid Base64 string')
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

  'csv-converter': {
    description: 'Convert CSV to JSON, XML, YAML, or SQL',
    schema: {
      type: 'object',
      properties: {
        csv: { type: 'string', description: 'CSV content to convert' },
        format: { type: 'string', enum: ['json', 'xml', 'yaml', 'sql'], description: 'Output format' },
        hasHeader: { type: 'boolean', description: 'First row is header (JSON only)', default: true },
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
              rows[0]!.forEach((header: string, i: number) => { obj[header] = row[i] })
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
          headers.forEach((header: string, idx: number) => { obj[header] = values[idx] })
          rows.push(obj)
        }
        const jsYaml = await import('js-yaml')
        return jsYaml.dump(rows, { lineWidth: -1 })
      }

      if (format === 'sql') {
        const headers = parseCSVLine(lines[0]!)
        let sql = ''
        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]!)
          const cols = headers.join(', ')
          const vals = values.map((v: string) => `'${v.replace(/'/g, "''")}'`).join(', ')
          sql += `INSERT INTO ${tableName} (${cols}) VALUES (${vals});\n`
        }
        return sql.trim()
      }

      throw new Error('Invalid format. Use: json, xml, yaml, sql')
    },
  },

  'ini-converter': {
    description: 'Convert INI to JSON, XML, or YAML',
    schema: {
      type: 'object',
      properties: {
        ini: { type: 'string', description: 'INI content to convert' },
        format: { type: 'string', enum: ['json', 'xml', 'yaml'], description: 'Output format' },
      },
      required: ['ini', 'format'],
    },
    handler: async (input) => {
      const { ini, format } = input
      const obj = parseIni(ini)

      if (format === 'json') return JSON.stringify(obj, null, 2)
      if (format === 'xml') return jsonToXml(obj, 'config')
      if (format === 'yaml') {
        const jsYaml = await import('js-yaml')
        return jsYaml.dump(obj, { lineWidth: -1 })
      }
      throw new Error('Invalid format. Use: json, xml, yaml')
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

  // Phase 3 tools
  'timezone-converter': {
    description: 'Convert a datetime between any two IANA timezones with DST-awareness',
    schema: {
      type: 'object',
      properties: {
        datetime: { type: 'string', description: 'The datetime to convert (ISO 8601 or any parseable format)' },
        fromTimezone: { type: 'string', description: 'Source IANA timezone (e.g. America/New_York)' },
        toTimezone: { type: 'string', description: 'Target IANA timezone (e.g. Europe/London)' },
      },
      required: ['datetime', 'fromTimezone', 'toTimezone'],
    },
    handler: async (input) => {
      const { datetime, fromTimezone, toTimezone } = input
      const inputDate = new Date(datetime)
      if (isNaN(inputDate.getTime())) throw new Error('Invalid datetime format')

      try {
        new Intl.DateTimeFormat('en-US', { timeZone: fromTimezone })
      } catch {
        throw new Error(`Invalid timezone: ${fromTimezone}`)
      }
      try {
        new Intl.DateTimeFormat('en-US', { timeZone: toTimezone })
      } catch {
        throw new Error(`Invalid timezone: ${toTimezone}`)
      }

      const formatOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false,
      }

      const outputFormatted = new Intl.DateTimeFormat('en-US', { ...formatOptions, timeZone: toTimezone }).format(inputDate)
      const inputFormatted = new Intl.DateTimeFormat('en-US', { ...formatOptions, timeZone: fromTimezone }).format(inputDate)

      const offsetFormatter = new Intl.DateTimeFormat('en-US', { timeZone: toTimezone, timeZoneName: 'shortOffset' })
      const offsetParts = offsetFormatter.formatToParts(inputDate)
      const utcOffset = offsetParts.find((p) => p.type === 'timeZoneName')?.value ?? ''

      return {
        input: inputFormatted,
        inputTimezone: fromTimezone,
        outputDatetime: outputFormatted,
        outputTimezone: toTimezone,
        utcOffset,
        utcTime: inputDate.toISOString(),
      }
    },
  },

  'iso8601-converter': {
    description: 'Convert between ISO 8601, RFC 2822, and human-readable date/time formats',
    schema: {
      type: 'object',
      properties: {
        input: { type: 'string', description: 'Date/time string in any parseable format' },
        outputFormat: { type: 'string', enum: ['all', 'iso8601', 'rfc2822', 'human'], description: 'Output format (default: all)' },
      },
      required: ['input'],
    },
    handler: async (input) => {
      const { input: value, outputFormat = 'all' } = input
      const date = new Date(value)
      if (isNaN(date.getTime())) throw new Error('Invalid date/time string')

      const iso8601 = date.toISOString()
      const rfc2822 = date.toUTCString().replace('GMT', '+0000')
      const human = new Intl.DateTimeFormat('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short',
      }).format(date)
      const unix = Math.floor(date.getTime() / 1000)

      if (outputFormat === 'iso8601') return { result: iso8601, iso8601, rfc2822, human, unix }
      if (outputFormat === 'rfc2822') return { result: rfc2822, iso8601, rfc2822, human, unix }
      if (outputFormat === 'human') return { result: human, iso8601, rfc2822, human, unix }
      return { iso8601, rfc2822, human, unix }
    },
  },

  'business-day-calculator': {
    description: 'Add or subtract N business days from a date, with optional holiday exclusions',
    schema: {
      type: 'object',
      properties: {
        startDate: { type: 'string', description: 'Start date in YYYY-MM-DD format' },
        days: { type: 'number', description: 'Number of business days to add (positive) or subtract (negative)' },
        holidays: { type: 'string', description: 'Optional comma-separated holiday dates in YYYY-MM-DD format to skip' },
      },
      required: ['startDate', 'days'],
    },
    handler: async (input) => {
      const { startDate, days, holidays = '' } = input
      const start = new Date(startDate + 'T00:00:00Z')
      if (isNaN(start.getTime())) throw new Error('Invalid start date. Use YYYY-MM-DD format.')

      const holidaySet = new Set(
        holidays.split(',').map((h: string) => h.trim()).filter(Boolean)
      )

      const direction = days >= 0 ? 1 : -1
      const target = Math.abs(days)
      let current = new Date(start)
      let count = 0
      let holidaysSkipped = 0

      while (count < target) {
        current = new Date(current.getTime() + direction * 86400000)
        const dayOfWeek = current.getUTCDay()
        const dateStr = current.toISOString().split('T')[0]!
        if (dayOfWeek === 0 || dayOfWeek === 6) continue
        if (holidaySet.has(dateStr)) { holidaysSkipped++; continue }
        count++
      }

      const totalCalendarDays = Math.round(Math.abs(current.getTime() - start.getTime()) / 86400000)

      return {
        startDate: start.toISOString().split('T')[0],
        endDate: current.toISOString().split('T')[0],
        businessDaysAdded: days,
        totalCalendarDays,
        holidaysSkipped,
      }
    },
  },

  'relative-date-calculator': {
    description: 'Calculate the difference between two dates or add/subtract days from a date',
    schema: {
      type: 'object',
      properties: {
        date1: { type: 'string', description: 'First date in YYYY-MM-DD format or "today"' },
        date2: { type: 'string', description: 'Second date in YYYY-MM-DD format or "today" (used for diff operation)' },
        operation: { type: 'string', enum: ['diff', 'add'], description: 'Operation: diff (default) or add' },
        addDays: { type: 'number', description: 'Number of days to add (required when operation=add, can be negative)' },
      },
      required: ['date1'],
    },
    handler: async (input) => {
      const { date1, date2, operation = 'diff', addDays } = input
      const today = new Date().toISOString().split('T')[0]!
      const d1str = date1 === 'today' ? today : date1
      const d1 = new Date(d1str + 'T00:00:00Z')
      if (isNaN(d1.getTime())) throw new Error('Invalid date1. Use YYYY-MM-DD.')

      if (operation === 'add') {
        if (typeof addDays !== 'number') throw new Error('addDays is required for operation=add')
        const result = new Date(d1.getTime() + addDays * 86400000)
        return {
          startDate: d1str,
          addDays,
          resultDate: result.toISOString().split('T')[0],
          resultReadable: new Intl.DateTimeFormat('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(result),
        }
      }

      const d2str = date2 === 'today' ? today : (date2 ?? today)
      const d2 = new Date(d2str + 'T00:00:00Z')
      if (isNaN(d2.getTime())) throw new Error('Invalid date2. Use YYYY-MM-DD.')

      const diffMs = d2.getTime() - d1.getTime()
      const diffDays = Math.round(diffMs / 86400000)
      const weeks = Math.floor(Math.abs(diffDays) / 7)
      const remainingDays = Math.abs(diffDays) % 7
      const months = Math.floor(Math.abs(diffDays) / 30.4375)
      const years = Math.floor(Math.abs(diffDays) / 365.25)

      return {
        date1: d1str,
        date2: d2str,
        days: diffDays,
        absoluteDays: Math.abs(diffDays),
        weeks,
        remainingDaysAfterWeeks: remainingDays,
        months,
        years,
        direction: diffDays > 0 ? 'future' : diffDays < 0 ? 'past' : 'same',
      }
    },
  },

  'age-calculator': {
    description: 'Calculate exact age in years, months, and days from a birthdate',
    schema: {
      type: 'object',
      properties: {
        birthdate: { type: 'string', description: 'Birthdate in YYYY-MM-DD format' },
        referenceDate: { type: 'string', description: 'Reference date in YYYY-MM-DD format (default: today)' },
      },
      required: ['birthdate'],
    },
    handler: async (input) => {
      const { birthdate, referenceDate } = input
      const birth = new Date(birthdate + 'T00:00:00Z')
      if (isNaN(birth.getTime())) throw new Error('Invalid birthdate. Use YYYY-MM-DD.')

      const today = new Date().toISOString().split('T')[0]!
      const refStr = referenceDate ?? today
      const ref = new Date(refStr + 'T00:00:00Z')
      if (isNaN(ref.getTime())) throw new Error('Invalid reference date.')
      if (birth > ref) throw new Error('Birthdate cannot be in the future relative to reference date.')

      const totalDays = Math.round((ref.getTime() - birth.getTime()) / 86400000)

      let years = ref.getUTCFullYear() - birth.getUTCFullYear()
      let months = ref.getUTCMonth() - birth.getUTCMonth()
      let days = ref.getUTCDate() - birth.getUTCDate()

      if (days < 0) {
        months--
        const prevMonth = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), 0))
        days += prevMonth.getUTCDate()
      }
      if (months < 0) { years--; months += 12 }

      let nextBirthdayYear = ref.getUTCFullYear()
      const birthdayThisYear = new Date(Date.UTC(nextBirthdayYear, birth.getUTCMonth(), birth.getUTCDate()))
      if (birthdayThisYear <= ref) nextBirthdayYear++
      const nextBirthday = new Date(Date.UTC(nextBirthdayYear, birth.getUTCMonth(), birth.getUTCDate()))
      const daysUntilNextBirthday = Math.round((nextBirthday.getTime() - ref.getTime()) / 86400000)

      return {
        birthdate,
        referenceDate: refStr,
        years,
        months,
        days,
        totalDays,
        nextBirthday: nextBirthday.toISOString().split('T')[0],
        daysUntilNextBirthday,
      }
    },
  },

  'env-file-parser': {
    description: 'Parse a .env file into a structured key-value table with issue detection',
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'The full .env file content to parse' },
      },
      required: ['content'],
    },
    handler: async (input) => {
      const { content } = input
      const lines = content.split('\n')
      const entries: Array<{ key: string; value: string; rawValue: string; lineNumber: number; hasIssue: boolean; issue: string }> = []
      const seen = new Map<string, number>()

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!.trim()
        if (!line || line.startsWith('#')) continue

        const eqIdx = line.indexOf('=')
        if (eqIdx === -1) {
          entries.push({ key: line, value: '', rawValue: '', lineNumber: i + 1, hasIssue: true, issue: 'Missing = sign' })
          continue
        }

        const key = line.slice(0, eqIdx).trim()
        const rawValue = line.slice(eqIdx + 1)
        let value = rawValue.trim()
        let issue = ''

        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1)
        }

        if (!key) { issue = 'Empty key' }
        else if (!rawValue.trim()) { issue = 'Empty value' }
        else if (seen.has(key)) { issue = `Duplicate key (first at line ${seen.get(key)})` }

        if (!seen.has(key)) seen.set(key, i + 1)

        entries.push({ key, value, rawValue: rawValue.trim(), lineNumber: i + 1, hasIssue: !!issue, issue })
      }

      const duplicateKeys = new Set(entries.filter((e) => e.issue.startsWith('Duplicate')).map((e) => e.key))
      return {
        entries,
        stats: {
          total: entries.length,
          empty: entries.filter((e) => e.issue === 'Empty value').length,
          duplicates: duplicateKeys.size,
          quoted: entries.filter((e) => (e.rawValue.startsWith('"') && e.rawValue.endsWith('"')) || (e.rawValue.startsWith("'") && e.rawValue.endsWith("'"))).length,
        },
      }
    },
  },

  'gitignore-generator': {
    description: 'Generate a .gitignore file from curated templates for popular languages, frameworks, and editors',
    schema: {
      type: 'object',
      properties: {
        templates: { type: 'array', items: { type: 'string' }, description: 'List of template names to include (e.g. ["Node", "Python", "VSCode"])' },
        customEntries: { type: 'string', description: 'Optional additional .gitignore entries to append' },
      },
      required: ['templates'],
    },
    handler: async (input) => {
      const { templates, customEntries = '' } = input
      const sections: string[] = []

      for (const tplName of templates) {
        const key = Object.keys(GITIGNORE_TEMPLATES).find(
          (k) => k.toLowerCase() === tplName.toLowerCase()
        )
        if (!key) throw new Error(`Unknown template: ${tplName}. Available: ${Object.keys(GITIGNORE_TEMPLATES).join(', ')}`)
        sections.push(`# ${key}\n${GITIGNORE_TEMPLATES[key as keyof typeof GITIGNORE_TEMPLATES]}`)
      }

      if (customEntries.trim()) {
        sections.push(`# Custom\n${customEntries.trim()}`)
      }

      const gitignore = sections.join('\n\n')
      const lineCount = gitignore.split('\n').length

      return {
        gitignore,
        templates: templates,
        lineCount,
      }
    },
  },

  'conventional-commit-generator': {
    description: 'Generate a properly formatted Conventional Commit message',
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'], description: 'Commit type' },
        scope: { type: 'string', description: 'Optional scope (component/module affected)' },
        description: { type: 'string', description: 'Short description of the change' },
        body: { type: 'string', description: 'Optional longer description' },
        breakingChange: { type: 'string', description: 'Optional breaking change description' },
        issueRefs: { type: 'string', description: 'Optional issue references (e.g. "Closes #123")' },
      },
      required: ['type', 'description'],
    },
    handler: async (input) => {
      const { type, scope, description, body, breakingChange, issueRefs } = input
      if (!description?.trim()) throw new Error('Description is required')

      const scopePart = scope?.trim() ? `(${scope.trim()})` : ''
      const breakingMark = breakingChange?.trim() ? '!' : ''
      const subject = `${type}${scopePart}${breakingMark}: ${description.trim()}`

      const parts = [subject]
      if (body?.trim()) parts.push('', body.trim())
      if (breakingChange?.trim()) parts.push('', `BREAKING CHANGE: ${breakingChange.trim()}`)
      if (issueRefs?.trim()) parts.push('', issueRefs.trim())

      return {
        message: parts.join('\n'),
        subject,
        hasBody: !!(body?.trim() || breakingChange?.trim() || issueRefs?.trim()),
      }
    },
  },

  'semver-comparator': {
    description: 'Compare two semantic version strings and show what changed',
    schema: {
      type: 'object',
      properties: {
        version1: { type: 'string', description: 'First semantic version (e.g. 1.2.3 or v2.0.0-beta.1)' },
        version2: { type: 'string', description: 'Second semantic version to compare against' },
      },
      required: ['version1', 'version2'],
    },
    handler: async (input) => {
      const { version1, version2 } = input
      const p1 = parseSemver(version1)
      const p2 = parseSemver(version2)

      let comparison: 'greater' | 'less' | 'equal' = 'equal'
      if (p1.major !== p2.major) comparison = p1.major > p2.major ? 'greater' : 'less'
      else if (p1.minor !== p2.minor) comparison = p1.minor > p2.minor ? 'greater' : 'less'
      else if (p1.patch !== p2.patch) comparison = p1.patch > p2.patch ? 'greater' : 'less'
      else if (p1.prerelease !== p2.prerelease) {
        if (!p1.prerelease && p2.prerelease) comparison = 'greater'
        else if (p1.prerelease && !p2.prerelease) comparison = 'less'
        else comparison = (p1.prerelease! < p2.prerelease!) ? 'less' : 'greater'
      }

      return {
        version1: version1.trim(),
        version2: version2.trim(),
        comparison,
        winner: comparison === 'equal' ? null : comparison === 'greater' ? version1.trim() : version2.trim(),
        diff: {
          major: p1.major - p2.major,
          minor: p1.minor - p2.minor,
          patch: p1.patch - p2.patch,
          prerelease: p1.prerelease !== p2.prerelease ? `${p1.prerelease ?? 'stable'} vs ${p2.prerelease ?? 'stable'}` : null,
        },
        parsed: { v1: p1, v2: p2 },
      }
    },
  },

  // ─── Phase 4 – Security & Cryptography ───────────────────────────────────────

  'hmac-generator': {
    description: 'Generate an HMAC signature using a secret key and a chosen hash algorithm',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'The message to sign' },
        key: { type: 'string', description: 'The secret key' },
        algorithm: {
          type: 'string',
          enum: ['sha256', 'sha512', 'sha1', 'md5'],
          description: 'HMAC algorithm: sha256 (default), sha512, sha1, md5',
        },
        encoding: {
          type: 'string',
          enum: ['hex', 'base64'],
          description: 'Output encoding: hex (default) or base64',
        },
      },
      required: ['message', 'key'],
    },
    handler: async (input) => {
      const { message, key, algorithm = 'sha256', encoding = 'hex' } = input
      const crypto = require('crypto')
      const validAlgorithms = ['sha256', 'sha512', 'sha1', 'md5']
      const validEncodings = ['hex', 'base64']
      if (!validAlgorithms.includes(algorithm))
        throw new Error(`Invalid algorithm. Use: ${validAlgorithms.join(', ')}`)
      if (!validEncodings.includes(encoding))
        throw new Error(`Invalid encoding. Use: ${validEncodings.join(', ')}`)
      const hmac = crypto.createHmac(algorithm, key).update(message).digest(encoding)
      return { message, algorithm, encoding, hmac }
    },
  },

  'bcrypt-tool': {
    description: 'Hash a password with bcrypt or verify a plain-text password against a bcrypt hash',
    schema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['hash', 'verify'],
          description: 'hash - generate a bcrypt hash; verify - compare a password to a hash',
        },
        password: { type: 'string', description: 'Plain-text password' },
        hash: {
          type: 'string',
          description: 'Existing bcrypt hash (required when action is verify)',
        },
        rounds: {
          type: 'number',
          description: 'Cost factor / salt rounds for hashing (4-14, default: 10)',
        },
      },
      required: ['action', 'password'],
    },
    handler: async (input) => {
      const { action, password, hash, rounds = 10 } = input
      const bcrypt = require('bcryptjs')
      if (action === 'hash') {
        if (rounds < 4 || rounds > 14)
          throw new Error('Rounds must be between 4 and 14')
        const generated = await bcrypt.hash(password, rounds)
        return { action, rounds, hash: generated }
      }
      if (action === 'verify') {
        if (!hash) throw new Error('hash is required for verify action')
        const match = await bcrypt.compare(password, hash)
        return { action, match }
      }
      throw new Error('action must be hash or verify')
    },
  },

  'file-hash-checker': {
    description: 'Compute MD5, SHA-1, SHA-256, and SHA-512 hashes from base64-encoded file content',
    schema: {
      type: 'object',
      properties: {
        fileBase64: {
          type: 'string',
          description: 'Base64-encoded file content to hash',
        },
        filename: {
          type: 'string',
          description: 'Original file name (used for display only)',
        },
      },
      required: ['fileBase64'],
    },
    handler: async (input) => {
      const { fileBase64, filename = 'file' } = input
      const crypto = require('crypto')
      const buf = Buffer.from(fileBase64, 'base64')
      const algorithms = ['md5', 'sha1', 'sha256', 'sha512'] as const
      const hashes: Record<string, string> = {}
      for (const algo of algorithms) {
        hashes[algo] = crypto.createHash(algo).update(buf).digest('hex')
      }
      return { filename, sizeBytes: buf.length, hashes }
    },
  },

  // ─── Phase 5 – Networking & Infrastructure ───────────────────────────────────

  'dns-lookup': {
    description: 'Query DNS records (A, AAAA, MX, TXT, CNAME, NS, SOA) for a domain using Cloudflare DNS-over-HTTPS',
    schema: {
      type: 'object',
      properties: {
        domain: { type: 'string', description: 'Domain name to query (e.g. example.com)' },
        type: {
          type: 'string',
          enum: ['A', 'AAAA', 'MX', 'TXT', 'CNAME', 'NS', 'SOA', 'ALL'],
          description: 'DNS record type to query, or ALL to fetch all common types',
        },
      },
      required: ['domain'],
    },
    handler: async (input) => {
      const { domain, type = 'ALL' } = input
      const cleaned = domain.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0]!
      if (!cleaned) throw new Error('Invalid domain')

      const TYPES = type === 'ALL' ? ['A', 'AAAA', 'MX', 'TXT', 'CNAME', 'NS'] : [type]
      const results: Record<string, any[]> = {}

      await Promise.all(
        TYPES.map(async (t) => {
          try {
            const res = await fetch(
              `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(cleaned)}&type=${t}`,
              { headers: { Accept: 'application/dns-json' } }
            )
            if (!res.ok) { results[t] = []; return }
            const data = await res.json()
            results[t] = (data.Answer ?? []).map((r: any) => ({
              name: r.name,
              ttl: r.TTL,
              data: r.data,
            }))
          } catch {
            results[t] = []
          }
        })
      )

      const flat = Object.entries(results).flatMap(([recordType, records]) =>
        records.map((r) => ({ type: recordType, ...r }))
      )

      return {
        domain: cleaned,
        queried: TYPES,
        totalRecords: flat.length,
        records: type === 'ALL' ? flat : (results[type] ?? []),
        byType: type === 'ALL' ? results : undefined,
      }
    },
  },

  'whois-lookup': {
    description: 'Look up domain registration information (registrar, dates, nameservers, status) via RDAP',
    schema: {
      type: 'object',
      properties: {
        domain: { type: 'string', description: 'Domain name to query (e.g. example.com)' },
      },
      required: ['domain'],
    },
    handler: async (input) => {
      const { domain } = input
      const cleaned = domain.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0]!
      if (!cleaned) throw new Error('Invalid domain')

      const res = await fetch(`https://rdap.iana.org/domain/${encodeURIComponent(cleaned)}`, {
        headers: { Accept: 'application/rdap+json' },
        redirect: 'follow',
      })
      if (!res.ok) {
        if (res.status === 404) throw new Error(`Domain "${cleaned}" not found in RDAP registry`)
        throw new Error(`RDAP query failed with status ${res.status}`)
      }
      const data = await res.json()

      const getEntity = (role: string) =>
        (data.entities ?? []).find((e: any) => (e.roles ?? []).includes(role))
      const registrar = getEntity('registrar')
      const registrant = getEntity('registrant')

      const registrarName =
        registrar?.vcardArray?.[1]?.find((v: any) => v[0] === 'fn')?.[3] ??
        registrar?.publicIds?.[0]?.identifier ??
        null

      const getDate = (type: string) =>
        (data.events ?? []).find((e: any) => e.eventAction === type)?.eventDate ?? null

      return {
        domain: cleaned,
        status: (data.status ?? []).join(', ') || 'unknown',
        registrar: registrarName,
        registrantOrg:
          registrant?.vcardArray?.[1]?.find((v: any) => v[0] === 'org')?.[3] ?? null,
        created: getDate('registration'),
        updated: getDate('last changed'),
        expires: getDate('expiration'),
        nameservers: (data.nameservers ?? []).map((ns: any) => ns.ldhName ?? ns.unicodeName),
        handle: data.handle ?? null,
        ldhName: data.ldhName ?? cleaned,
      }
    },
  },

  'ssl-checker': {
    description: 'Inspect the TLS/SSL certificate for any domain: issuer, expiry, SANs, and validity',
    schema: {
      type: 'object',
      properties: {
        domain: { type: 'string', description: 'Domain to check (e.g. example.com)' },
        port: {
          type: 'number',
          description: 'HTTPS port to connect on (default: 443)',
        },
      },
      required: ['domain'],
    },
    handler: async (input) => {
      const { domain, port = 443 } = input
      const cleaned = domain.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0]!
      if (!cleaned) throw new Error('Invalid domain')

      // tls.connect is the right API for cert inspection: we open a raw TLS
      // socket solely to read the peer certificate, no HTTP data flows over it.
      // rejectUnauthorized:false is intentional here - the tool's job is to
      // *show* whatever cert the server presents (including expired/self-signed
      // ones), not to trust the connection for data exchange.
      const cert: any = await new Promise((resolve, reject) => {
        const tls = require('tls')
        const socket = tls.connect(
          { host: cleaned, port, servername: cleaned, rejectUnauthorized: false, timeout: 8000 },
          () => {
            const c = socket.getPeerCertificate(false)
            socket.destroy()
            if (!c || !c.subject) reject(new Error('No certificate returned'))
            else resolve(c)
          }
        )
        socket.on('error', (err: Error) => {
          socket.destroy()
          reject(new Error(`Connection failed: ${err.message}`))
        })
        socket.on('timeout', () => {
          socket.destroy()
          reject(new Error('Connection timed out'))
        })
      })

      const sans = (cert.subjectaltname ?? '')
        .split(', ')
        .filter(Boolean)
        .map((s: string) => s.replace(/^DNS:/, ''))
        .filter((s: string) => !s.startsWith('IP:'))

      const validFrom = new Date(cert.valid_from)
      const validTo = new Date(cert.valid_to)
      const now = new Date()
      const daysRemaining = Math.ceil((validTo.getTime() - now.getTime()) / 86_400_000)

      return {
        domain: cleaned,
        valid: daysRemaining > 0,
        daysRemaining,
        subject: {
          cn: cert.subject?.CN ?? null,
          o: cert.subject?.O ?? null,
          c: cert.subject?.C ?? null,
        },
        issuer: {
          cn: cert.issuer?.CN ?? null,
          o: cert.issuer?.O ?? null,
          c: cert.issuer?.C ?? null,
        },
        validFrom: validFrom.toISOString(),
        validTo: validTo.toISOString(),
        serialNumber: cert.serialNumber ?? null,
        fingerprint256: cert.fingerprint256 ?? null,
        sans,
        sanCount: sans.length,
      }
    },
  },

  'cidr-calculator': {
    description: 'Calculate network details from a CIDR block: network address, broadcast, host range, subnet mask, and usable host count',
    schema: {
      type: 'object',
      properties: {
        cidr: {
          type: 'string',
          description: 'CIDR notation, e.g. 192.168.1.0/24 or 10.0.0.0/8',
        },
      },
      required: ['cidr'],
    },
    handler: async (input) => {
      const { cidr } = input
      const match = cidr.trim().match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/)
      if (!match) throw new Error('Invalid CIDR notation. Expected format: x.x.x.x/prefix (e.g. 192.168.1.0/24)')

      const ipStr = match[1]!
      const prefix = parseInt(match[2]!, 10)
      if (prefix < 0 || prefix > 32) throw new Error('Prefix must be between 0 and 32')

      const ipToInt = (ip: string) => {
        const parts = ip.split('.').map(Number)
        if (parts.some((p) => p < 0 || p > 255)) throw new Error(`Invalid IP address: ${ip}`)
        return ((parts[0]! << 24) | (parts[1]! << 16) | (parts[2]! << 8) | parts[3]!) >>> 0
      }
      const intToIp = (n: number) =>
        `${(n >>> 24) & 0xff}.${(n >>> 16) & 0xff}.${(n >>> 8) & 0xff}.${n & 0xff}`

      const ipInt = ipToInt(ipStr)
      const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0
      const network = (ipInt & mask) >>> 0
      const broadcast = (network | (~mask >>> 0)) >>> 0
      const totalHosts = Math.pow(2, 32 - prefix)
      const usableHosts = prefix >= 31 ? totalHosts : Math.max(0, totalHosts - 2)
      const firstHost = prefix >= 31 ? network : network + 1
      const lastHost = prefix >= 31 ? broadcast : broadcast - 1

      const maskInt = mask
      const wildcardInt = (~mask) >>> 0

      return {
        cidr: `${intToIp(network)}/${prefix}`,
        inputIp: ipStr,
        networkAddress: intToIp(network),
        broadcastAddress: intToIp(broadcast),
        subnetMask: intToIp(maskInt),
        wildcardMask: intToIp(wildcardInt),
        firstHost: intToIp(firstHost),
        lastHost: intToIp(lastHost),
        totalHosts,
        usableHosts,
        prefixLength: prefix,
        ipClass:
          network < 0x80000000 ? 'A' :
          network < 0xc0000000 ? 'B' :
          network < 0xe0000000 ? 'C' : 'D/E',
        isPrivate:
          (network >>> 24) === 10 ||
          ((network >>> 16) & 0xfff0) === 0xac10 ||
          ((network >>> 16) === 0xc0a8),
      }
    },
  },

  'ip-range-calculator': {
    description: 'Compute the minimal set of CIDR blocks that exactly covers a given start-to-end IP range',
    schema: {
      type: 'object',
      properties: {
        startIp: { type: 'string', description: 'First IP in the range (e.g. 192.168.1.0)' },
        endIp: { type: 'string', description: 'Last IP in the range (e.g. 192.168.1.255)' },
      },
      required: ['startIp', 'endIp'],
    },
    handler: async (input) => {
      const { startIp, endIp } = input

      const ipToInt = (ip: string) => {
        const parts = ip.trim().split('.').map(Number)
        if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255))
          throw new Error(`Invalid IP address: ${ip}`)
        return ((parts[0]! << 24) | (parts[1]! << 16) | (parts[2]! << 8) | parts[3]!) >>> 0
      }
      const intToIp = (n: number) =>
        `${(n >>> 24) & 0xff}.${(n >>> 16) & 0xff}.${(n >>> 8) & 0xff}.${n & 0xff}`

      let start = ipToInt(startIp)
      const end = ipToInt(endIp)
      if (start > end) throw new Error('Start IP must be less than or equal to end IP')

      const totalIps = end - start + 1
      const cidrs: string[] = []

      while (start <= end) {
        let prefix = 32
        while (prefix > 0) {
          const mask = (~0 << (32 - (prefix - 1))) >>> 0
          const blockStart = (start & mask) >>> 0
          if (blockStart !== start) break
          const blockEnd = (blockStart | (~mask >>> 0)) >>> 0
          if (blockEnd > end) break
          prefix--
        }
        const blockEnd = (start | (~((~0 << (32 - prefix)) >>> 0) >>> 0)) >>> 0
        cidrs.push(`${intToIp(start)}/${prefix}`)
        start = blockEnd + 1
        if (start > 0xffffffff) break
      }

      return {
        startIp: intToIp(ipToInt(startIp)),
        endIp: intToIp(ipToInt(endIp)),
        totalIps,
        cidrCount: cidrs.length,
        cidrs,
      }
    },
  },

  // ─── Phase 6 – Markdown & Diagram Tools ──────────────────────────────────────

  'markdown-table-generator': {
    description: 'Generate a GitHub-Flavored Markdown table from a JSON array of objects or a 2D array of rows',
    schema: {
      type: 'object',
      properties: {
        headers: {
          type: 'array',
          items: { type: 'string' },
          description: 'Column header names',
        },
        rows: {
          type: 'array',
          items: { type: 'array', items: { type: 'string' } },
          description: '2D array of cell values (each inner array is one row)',
        },
        alignment: {
          type: 'string',
          enum: ['left', 'center', 'right', 'none'],
          description: 'Column alignment applied to all columns (default: none)',
        },
      },
      required: ['headers', 'rows'],
    },
    handler: async (input) => {
      const { headers, rows, alignment = 'none' } = input
      if (!headers.length) throw new Error('headers must not be empty')

      const sep = { left: ':---', center: ':---:', right: '---:', none: '---' }[alignment] ?? '---'
      const escape = (s: string) => String(s ?? '').replace(/\|/g, '\\|')

      const colWidths = headers.map((h: string, i: number) => {
        const maxRow = rows.reduce((m: number, r: string[]) => Math.max(m, (r[i] ?? '').length), 0)
        return Math.max(h.length, sep.length, maxRow)
      })

      const pad = (s: string, w: number) => escape(s).padEnd(w)

      const headerLine = '| ' + headers.map((h: string, i: number) => pad(h, colWidths[i]!)).join(' | ') + ' |'
      const sepLine = '| ' + colWidths.map((w: number) => sep.padEnd(w, sep.endsWith(':') ? '-' : '-').slice(0, w).padEnd(w, '-')).join(' | ') + ' |'
      const dataLines = rows.map((row: string[]) =>
        '| ' + headers.map((_: string, i: number) => pad(row[i] ?? '', colWidths[i]!)).join(' | ') + ' |'
      )

      const table = [headerLine, sepLine, ...dataLines].join('\n')
      return { table, columns: headers.length, rows: rows.length }
    },
  },

  'markdown-formatter': {
    description: 'Format and normalize a Markdown document: consistent heading spacing, list indentation, blank lines, and trailing whitespace',
    schema: {
      type: 'object',
      properties: {
        markdown: { type: 'string', description: 'Markdown source to format' },
        headingStyle: {
          type: 'string',
          enum: ['atx', 'preserve'],
          description: 'atx = normalize all headings to # style; preserve = keep as-is (default: atx)',
        },
      },
      required: ['markdown'],
    },
    handler: async (input) => {
      const { markdown, headingStyle = 'atx' } = input
      const lines = markdown.split('\n')
      const out: string[] = []
      let prevWasBlank = false
      let prevWasHeading = false
      let prevWasList = false
      let inFence = false

      for (let i = 0; i < lines.length; i++) {
        const raw = lines[i]!
        const trimmed = raw.trimEnd()

        // Track fenced code blocks - don't touch their contents
        if (/^```|^~~~/.test(trimmed)) {
          inFence = !inFence
          out.push(trimmed)
          prevWasBlank = false
          prevWasHeading = false
          prevWasList = false
          continue
        }
        if (inFence) {
          out.push(raw.trimEnd())
          continue
        }

        const isBlank = trimmed === ''
        const isHeading = /^#{1,6}\s/.test(trimmed)
        const isList = /^(\s*[-*+]|\s*\d+\.)\s/.test(trimmed)
        const isHr = /^[-*_]{3,}\s*$/.test(trimmed)
        const isBlockquote = /^>/.test(trimmed)

        // Normalize ATX headings spacing
        let line = trimmed
        if (headingStyle === 'atx' && isHeading) {
          line = line.replace(/^(#{1,6})\s+/, '$1 ')
        }

        // Ensure blank line before heading (not at doc start)
        if (isHeading && out.length > 0 && !prevWasBlank) {
          out.push('')
        }

        // Ensure blank line after heading
        if (prevWasHeading && !isBlank) {
          if (out[out.length - 1] !== '') out.push('')
        }

        // Collapse multiple blank lines into one
        if (isBlank) {
          if (!prevWasBlank && out.length > 0) out.push('')
          prevWasBlank = true
          prevWasHeading = false
          prevWasList = false
          continue
        }

        out.push(line)
        prevWasBlank = false
        prevWasHeading = isHeading
        prevWasList = isList
      }

      // Strip leading/trailing blank lines from output
      while (out.length && out[0] === '') out.shift()
      while (out.length && out[out.length - 1] === '') out.pop()

      const result = out.join('\n')
      const linesBefore = lines.length
      const linesAfter = result.split('\n').length

      return {
        formatted: result,
        linesBefore,
        linesAfter,
        changed: result !== markdown.split('\n').map((l) => l.trimEnd()).join('\n'),
      }
    },
  },

  // ─── Phase 7 – API Protocol Tools ───────────────────────────────────────────

  'openapi-validator': {
    description: 'Validate an OpenAPI 3.x specification (YAML or JSON) against the schema and surface errors with line numbers',
    schema: {
      type: 'object',
      properties: {
        spec: {
          type: 'string',
          description: 'OpenAPI 3.x specification as a YAML or JSON string',
        },
      },
      required: ['spec'],
    },
    handler: async (input) => {
      const { spec } = input
      const yaml = await import('js-yaml')

      let parsed: any
      let format: 'yaml' | 'json' = 'json'
      try {
        parsed = JSON.parse(spec)
      } catch {
        try {
          parsed = yaml.load(spec)
          format = 'yaml'
        } catch (e: any) {
          throw new Error(`Could not parse spec as JSON or YAML: ${e.message}`)
        }
      }

      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Spec must be a JSON object or YAML mapping')
      }

      const errors: Array<{ path: string; message: string }> = []

      // Check required top-level fields
      if (!parsed.openapi) {
        errors.push({ path: 'openapi', message: 'Missing required field "openapi"' })
      } else if (typeof parsed.openapi !== 'string' || !parsed.openapi.startsWith('3.')) {
        errors.push({ path: 'openapi', message: `"openapi" must be a 3.x version string, got: ${parsed.openapi}` })
      }

      if (!parsed.info) {
        errors.push({ path: 'info', message: 'Missing required field "info"' })
      } else {
        if (!parsed.info.title) errors.push({ path: 'info.title', message: 'Missing required field "info.title"' })
        if (!parsed.info.version) errors.push({ path: 'info.version', message: 'Missing required field "info.version"' })
      }

      if (!parsed.paths && !parsed.components) {
        errors.push({ path: 'paths', message: 'Spec must contain at least "paths" or "components"' })
      }

      // Validate paths structure
      if (parsed.paths && typeof parsed.paths === 'object') {
        const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace']
        for (const [pathKey, pathItem] of Object.entries(parsed.paths as Record<string, any>)) {
          if (!pathKey.startsWith('/')) {
            errors.push({ path: `paths.${pathKey}`, message: `Path must start with "/": ${pathKey}` })
          }
          if (typeof pathItem !== 'object' || pathItem === null) continue
          for (const method of HTTP_METHODS) {
            const op = pathItem[method]
            if (!op) continue
            if (typeof op !== 'object') {
              errors.push({ path: `paths.${pathKey}.${method}`, message: 'Operation must be an object' })
              continue
            }
            if (!op.responses) {
              errors.push({ path: `paths.${pathKey}.${method}.responses`, message: 'Operation is missing required field "responses"' })
            }
          }
        }
      }

      // Check $ref targets exist
      const allRefs: string[] = []
      function collectRefs(obj: any, path: string) {
        if (typeof obj !== 'object' || obj === null) return
        if (Array.isArray(obj)) { obj.forEach((v, i) => collectRefs(v, `${path}[${i}]`)); return }
        for (const [k, v] of Object.entries(obj)) {
          if (k === '$ref' && typeof v === 'string' && v.startsWith('#/')) {
            allRefs.push(v)
          }
          collectRefs(v, `${path}.${k}`)
        }
      }
      collectRefs(parsed, '$')

      for (const ref of allRefs) {
        const parts = ref.replace('#/', '').split('/')
        let cur = parsed
        let valid = true
        for (const p of parts) {
          if (typeof cur !== 'object' || cur === null || !(p in cur)) { valid = false; break }
          cur = cur[p]
        }
        if (!valid) {
          errors.push({ path: ref, message: `Unresolvable $ref: ${ref}` })
        }
      }

      const pathCount = parsed.paths ? Object.keys(parsed.paths).length : 0
      const operationCount = parsed.paths
        ? Object.values(parsed.paths as Record<string, any>).reduce((n: number, pi: any) => {
            const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace']
            return n + HTTP_METHODS.filter((m) => pi && typeof pi[m] === 'object').length
          }, 0)
        : 0

      return {
        valid: errors.length === 0,
        errorCount: errors.length,
        errors,
        format,
        info: parsed.info ? { title: parsed.info.title, version: parsed.info.version } : null,
        openapi: parsed.openapi ?? null,
        pathCount,
        operationCount,
      }
    },
  },

  'graphql-formatter': {
    description: 'Format and pretty-print a GraphQL query, mutation, subscription, or schema document',
    schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'GraphQL document string to format',
        },
        indentWidth: {
          type: 'number',
          description: 'Number of spaces per indent level (default: 2)',
        },
      },
      required: ['query'],
    },
    handler: async (input) => {
      const { query, indentWidth = 2 } = input
      const { parse, print } = await import('graphql')
      let doc: any
      try {
        doc = parse(query)
      } catch (e: any) {
        throw new Error(`GraphQL parse error: ${e.message}`)
      }
      let formatted = print(doc)
      // graphql-js print() always uses 2-space indent; re-indent if different width requested
      if (indentWidth !== 2) {
        const target = ' '.repeat(indentWidth)
        formatted = formatted
          .split('\n')
          .map((line) => {
            const match = line.match(/^( *)/)
            const spaces = match ? match[1]! : ''
            const level = Math.floor(spaces.length / 2)
            return target.repeat(level) + line.trimStart()
          })
          .join('\n')
      }
      return { formatted, originalLength: query.length, formattedLength: formatted.length }
    },
  },

  'sql-validator': {
    description: 'Validate SQL syntax for Postgres, MySQL, and SQLite dialects and report errors',
    schema: {
      type: 'object',
      properties: {
        sql: {
          type: 'string',
          description: 'SQL statement or script to validate',
        },
        dialect: {
          type: 'string',
          enum: ['generic', 'postgresql', 'mysql', 'sqlite'],
          description: 'SQL dialect for dialect-specific keyword checking (default: generic)',
        },
      },
      required: ['sql'],
    },
    handler: async (input) => {
      const { sql, dialect = 'generic' } = input
      const errors: Array<{ line: number; column: number; message: string }> = []

      // Tokenise and do structural validation
      const lines = sql.split('\n')

      // Remove comments for analysis
      const stripped = sql
        .replace(/--[^\n]*/g, ' ')
        .replace(/\/\*[\s\S]*?\*\//g, ' ')
        .trim()

      if (!stripped) {
        errors.push({ line: 1, column: 1, message: 'Empty SQL statement' })
        return { valid: false, errorCount: 1, errors, dialect }
      }

      // Check balanced parentheses
      let depth = 0
      let inString = false
      let stringChar = ''
      for (let i = 0; i < stripped.length; i++) {
        const ch = stripped[i]!
        if (inString) {
          if (ch === stringChar && stripped[i - 1] !== '\\') inString = false
          continue
        }
        if (ch === "'" || ch === '"' || ch === '`') { inString = true; stringChar = ch; continue }
        if (ch === '(') depth++
        else if (ch === ')') {
          depth--
          if (depth < 0) {
            const linesUpTo = stripped.slice(0, i).split('\n')
            errors.push({ line: linesUpTo.length, column: linesUpTo[linesUpTo.length - 1]!.length + 1, message: 'Unexpected closing parenthesis ")"' })
            depth = 0
          }
        }
      }
      if (depth > 0) {
        errors.push({ line: lines.length, column: 1, message: `${depth} unclosed parenthesis${depth > 1 ? 'es' : ''}` })
      }

      // Check that statement starts with a known keyword
      const firstToken = stripped.match(/^(\w+)/)?.[1]?.toUpperCase() ?? ''
      const TOP_LEVEL = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP', 'TRUNCATE', 'MERGE', 'WITH', 'EXPLAIN', 'SHOW', 'DESCRIBE', 'SET', 'BEGIN', 'COMMIT', 'ROLLBACK', 'GRANT', 'REVOKE', 'CALL', 'PRAGMA', 'VACUUM', 'ANALYZE', 'COPY', 'DO']
      if (firstToken && !TOP_LEVEL.includes(firstToken)) {
        errors.push({ line: 1, column: 1, message: `Unexpected token "${firstToken}" - expected a SQL keyword like SELECT, INSERT, UPDATE, etc.` })
      }

      // Dialect-specific checks
      if (dialect === 'postgresql') {
        // PostgreSQL doesn't support backtick identifiers
        if (/`/.test(stripped)) {
          const idx = stripped.indexOf('`')
          const linesUpTo = stripped.slice(0, idx).split('\n')
          errors.push({ line: linesUpTo.length, column: linesUpTo[linesUpTo.length - 1]!.length + 1, message: 'Backtick identifiers are not valid in PostgreSQL; use double quotes instead' })
        }
      } else if (dialect === 'mysql') {
        // MySQL doesn't use $1 style params
        if (/\$\d+/.test(stripped)) {
          errors.push({ line: 1, column: 1, message: 'Positional parameters ($1, $2, ...) are a PostgreSQL feature; MySQL uses "?" placeholders' })
        }
      } else if (dialect === 'sqlite') {
        const unsupported = ['FULL OUTER JOIN', 'RIGHT JOIN', 'STORED GENERATED', 'TABLESPACE']
        for (const kw of unsupported) {
          if (stripped.toUpperCase().includes(kw)) {
            errors.push({ line: 1, column: 1, message: `"${kw}" is not supported in SQLite` })
          }
        }
      }

      // Detect common mistakes
      const upper = stripped.toUpperCase()
      if (/SELECT\s+\*\s+FROM\s+\w+\s+WHERE\s*$/.test(upper)) {
        errors.push({ line: lines.length, column: 1, message: 'WHERE clause appears to be incomplete' })
      }
      if (/(?:^|\s)FROM\s*(?:WHERE|GROUP|ORDER|HAVING|LIMIT|$)/i.test(stripped)) {
        errors.push({ line: 1, column: 1, message: 'FROM clause is missing a table name' })
      }

      return {
        valid: errors.length === 0,
        errorCount: errors.length,
        errors,
        dialect,
        statementCount: stripped.split(/;(?!\s*$)/).filter((s) => s.trim()).length,
      }
    },
  },

  'sql-minifier': {
    description: 'Strip comments and unnecessary whitespace from SQL to produce compact output',
    schema: {
      type: 'object',
      properties: {
        sql: {
          type: 'string',
          description: 'SQL statement or script to minify',
        },
        preserveNewlines: {
          type: 'boolean',
          description: 'If true, keep statement-separating newlines before semicolons (default: false)',
        },
      },
      required: ['sql'],
    },
    handler: async (input) => {
      const { sql, preserveNewlines = false } = input
      if (!sql.trim()) throw new Error('Input SQL is empty')

      // Remove single-line comments
      let result = sql.replace(/--[^\n]*/g, '')
      // Remove block comments
      result = result.replace(/\/\*[\s\S]*?\*\//g, ' ')
      // Collapse whitespace (but preserve string literals)
      const parts: string[] = []
      let i = 0
      let inString = false
      let stringChar = ''
      let buf = ''

      while (i < result.length) {
        const ch = result[i]!
        if (inString) {
          buf += ch
          if (ch === stringChar && result[i - 1] !== '\\') inString = false
          i++
          continue
        }
        if (ch === "'" || ch === '"' || ch === '`') {
          // flush non-string buf
          parts.push(buf.replace(/\s+/g, ' ').trim())
          buf = ''
          inString = true
          stringChar = ch
          buf += ch
          i++
          continue
        }
        buf += ch
        i++
      }
      parts.push(buf.replace(/\s+/g, ' ').trim())
      result = parts.join('').trim()

      // Clean up spaces around punctuation
      result = result
        .replace(/\s*,\s*/g, ', ')
        .replace(/\s*\(\s*/g, '(')
        .replace(/\s*\)\s*/g, ')')
        .replace(/\s*;\s*/g, preserveNewlines ? ';\n' : '; ')
        .replace(/\s+/g, ' ')
        .trim()

      return {
        minified: result,
        originalLength: sql.length,
        minifiedLength: result.length,
        savedBytes: sql.length - result.length,
        savedPercent: Math.round(((sql.length - result.length) / sql.length) * 100),
      }
    },
  },

  'markdown-linter': {
    description: 'Lint a Markdown document and report common issues: inconsistent headings, missing blank lines, long lines, bare URLs, and more',
    schema: {
      type: 'object',
      properties: {
        markdown: { type: 'string', description: 'Markdown source to lint' },
        maxLineLength: {
          type: 'number',
          description: 'Maximum line length before a warning is raised (default: 120, 0 to disable)',
        },
      },
      required: ['markdown'],
    },
    handler: async (input) => {
      const { markdown, maxLineLength = 120 } = input
      const lines = markdown.split('\n')

      interface Issue {
        line: number
        rule: string
        message: string
        severity: 'error' | 'warning'
      }
      const issues: Issue[] = []
      const warn = (line: number, rule: string, message: string, severity: 'error' | 'warning' = 'warning') =>
        issues.push({ line, rule, message, severity })

      let inFence = false
      let prevHeadingLevel = 0
      let prevLineBlank = true
      let prevLineWasHeading = false

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!
        const lineNum = i + 1
        const trimmed = line.trimEnd()

        if (/^```|^~~~/.test(trimmed)) { inFence = !inFence }
        if (inFence) { prevLineBlank = false; continue }

        const isBlank = trimmed === ''
        const headingMatch = trimmed.match(/^(#{1,6})\s/)
        const isHeading = !!headingMatch
        const headingLevel = headingMatch ? headingMatch[1]!.length : 0
        const isList = /^(\s*[-*+]|\s*\d+\.)\s/.test(trimmed)

        // MD001: Heading levels should only increment by one
        if (isHeading && prevHeadingLevel > 0 && headingLevel > prevHeadingLevel + 1) {
          warn(lineNum, 'MD001', `Heading level skipped: h${prevHeadingLevel} → h${headingLevel}`, 'error')
        }

        // MD018: No space after # in ATX heading
        if (/^#{1,6}[^ #\n]/.test(trimmed)) {
          warn(lineNum, 'MD018', 'No space after # in ATX heading', 'error')
        }

        // MD022: Headings should be surrounded by blank lines
        if (isHeading && !prevLineBlank && i > 0) {
          warn(lineNum, 'MD022', 'Heading not preceded by a blank line', 'warning')
        }
        if (prevLineWasHeading && !isBlank) {
          warn(lineNum, 'MD022', 'Heading not followed by a blank line', 'warning')
        }

        // MD009: Trailing spaces (more than 2 - 2 is intentional line break)
        const trailingSpaces = line.length - line.trimEnd().length
        if (trailingSpaces > 2) {
          warn(lineNum, 'MD009', `Trailing whitespace (${trailingSpaces} spaces)`, 'warning')
        }

        // MD010: Hard tabs
        if (line.includes('\t')) {
          warn(lineNum, 'MD010', 'Hard tab character found', 'warning')
        }

        // MD013: Line too long
        if (maxLineLength > 0 && !isHeading && trimmed.length > maxLineLength) {
          warn(lineNum, 'MD013', `Line length ${trimmed.length} exceeds ${maxLineLength}`, 'warning')
        }

        // MD034: Bare URL
        if (/(?<![(\[`])(https?:\/\/[^\s)>\]]+)/.test(trimmed) && !/^\[.*\]:/.test(trimmed)) {
          warn(lineNum, 'MD034', 'Bare URL found - consider wrapping in angle brackets or a link', 'warning')
        }

        // MD047: File should end with a newline (checked after loop)

        prevLineBlank = isBlank
        prevLineWasHeading = isHeading
        if (isHeading) prevHeadingLevel = headingLevel
      }

      // MD047: File should end with a single newline
      if (markdown.length > 0 && !markdown.endsWith('\n')) {
        warn(lines.length, 'MD047', 'File should end with a newline', 'warning')
      }

      const errors = issues.filter((i) => i.severity === 'error').length
      const warnings = issues.filter((i) => i.severity === 'warning').length

      return {
        valid: errors === 0,
        issueCount: issues.length,
        errors,
        warnings,
        issues,
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
