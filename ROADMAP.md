# Dev Tools - Roadmap & Improvement Ideas

This document captures planned additions, tool consolidations, and application-level improvements.
It is a living document - priorities and groupings will shift as the project evolves.

---

## Application-Level Refactoring

### Tool Consolidations (reduce the catalog surface area)

Several tools are logically one bidirectional tool and should be merged:

| Current Tools | Proposed Single Tool | Notes |
|---|---|---|
| Base64 Encoder + Base64 Decoder | **Base64 Encoder/Decoder** | Already in Developer; combine into one tab-based UI like URL Encoder/Decoder |
| RGB to HEX + HEX to RGB | **Color Converter** | Merge into Color Code Picker or a dedicated bidirectional color tool |
| JSON Beautifier + JSON Formatter | **JSON Formatter** | These are nearly identical; one tool with an indent selector covers both |
| HTML Formatter + HTML Beautifier | **HTML Formatter** | Same situation as JSON; one tool with preset options is enough |
| JSON to YAML + YAML to JSON | **JSON / YAML Converter** | One tool, two-pane with direction toggle |
| XML to JSON + JSON to XML | **JSON / XML Converter** | Same pattern |
| XML to YAML + (YAML to XML missing) | **XML / YAML Converter** | Round-trip tool |
| INI to JSON + INI to XML + INI to YAML | **INI Converter** | One source pane, output format selector |
| CSV to JSON + CSV to XML + CSV to YAML + CSV to SQL | **CSV Converter** | One source pane, output format selector (4 targets) |
| JS String Escaper + XML String Escaper + HTML Encoder/Decoder + URL Encoder/Decoder | Consider grouping under **String Encoders** | Or keep separate - these are well-differentiated |

Doing these merges would reduce the catalog from 89 tools to roughly 79-80 distinct entries while improving discoverability.

### REST API Tester - Expand Rather Than Add Separate Tools

The existing REST API Tester should absorb several planned tools instead of adding them independently:

- **Curl Generator** - add a "Copy as cURL" button to every request made in REST API Tester (already common in Postman/Insomnia)
- **Curl Importer** - add an "Import from cURL" input to pre-fill method, URL, headers, and body
- **HTTP Header Inspector** - display full request/response headers in the tester's response panel (already partially there)
- **OAuth Token Inspector** - add an "Auth" tab that decodes Bearer tokens inline (pairs with the existing JWT Decoder)

This keeps the API testing workflow in one place rather than fragmenting it across four separate tools.

### Category Review

- **Base64 Encoder/Decoder** should stay in Developer (it's a developer utility, not a format converter)
- **Color Code Picker** should stay in Developer or get its own section when color tools expand
- **PDF Editor** is correctly placed in Utilities

---

## Tier 1 - Highest Priority Additions

These fill obvious gaps and get daily use.

### Cron Expression Builder
- Visual builder (select minute/hour/day fields) + free-text expression input
- Parse an existing expression back to human-readable description
- Show next N run times
- MCP-callable for the parse and describe directions

### JWT Generator
- Complement to the existing JWT Decoder
- Input: algorithm (HS256/RS256), payload (JSON editor), secret or key
- Output: signed token + decoded verification view
- MCP-callable

### JSON Schema Tools (non-AI)
- **JSON Schema Validator** - paste a JSON document and a JSON Schema, get validation errors with paths
- **JSON Schema Generator** - infer a schema from a sample JSON document
- Both MCP-callable
- These are distinct from the AI Schema Generator which uses an LLM; these are deterministic

### URL Builder
- Visual form: protocol, host, path segments, query params as key-value rows
- Live URL preview that updates as fields change
- "Copy URL" and "Copy as cURL" buttons
- MCP-callable (build URL from structured input)

### Query String Parser
- Parse a raw query string or full URL into a formatted key-value table
- Handle arrays (`?foo[]=1&foo[]=2`), encoded values, duplicates
- MCP-callable

---

## Tier 2 - Encoding & Text Utilities

### Text Tools (new category or extend Developer)
- **Lorem Ipsum Generator** - choose paragraph/word/sentence count, lorem or random English
- **Word & Character Counter** - live stats (words, chars, chars without spaces, sentences, paragraphs, reading time)
- **Random String Generator** - length, charset (alphanumeric, hex, base58, custom), count
- **Slug Generator** - convert any string to a URL-safe slug, with separator and case options
- **Line Utilities** - sort lines, remove duplicates, reverse, pick random line (could be one tool with action tabs)

### Encoding Additions
- **URL-safe Base64** - variant of existing Base64 with `+`/`/` → `-`/`_` and no padding
- **Hex <-> Text** - encode any string to hex bytes and back
- **Binary / Decimal / Hex Converter** - numeric base conversion
- **Unicode Escape Converter** - convert between literal characters and `\uXXXX` / `U+XXXX` forms
- **ROT13** - trivial but frequently searched

---

## Tier 3 - API & Protocol Tools

### WebSocket Tester
- Connect to a WS URL, send messages, view incoming frames
- Browser-only (no MCP needed)

### SSE Tester
- Connect to a Server-Sent Events endpoint, display streamed events
- Browser-only

### Webhook Tester
- Generate a unique endpoint URL, display incoming payloads in real time
- Requires a backend (needs infrastructure consideration)

### OpenAPI Tools
- **OpenAPI Viewer** - upload or paste a YAML/JSON spec, render an interactive endpoint browser
- **OpenAPI Validator** - validate a spec against the OpenAPI 3.x schema, surface errors with line numbers
- Both MCP-callable

### GraphQL Tools
- **GraphQL Formatter** - format a query string (deterministic, MCP-callable)
- **GraphQL Explorer** - connect to a GraphQL endpoint, browse schema, run queries (browser-only)

---

## Tier 4 - DevOps & Config Tools

- **Env File Parser** - parse a `.env` file into a key-value table; detect duplicates, empty values, quoted strings
- **Gitignore Generator** - select languages/frameworks, generate a `.gitignore` (uses a curated template set, no LLM needed)
- **Conventional Commit Generator** - form-based: type, scope, description, body, breaking change; outputs a formatted commit message
- **Semantic Version Comparator** - input two semver strings, show which is higher, what changed (major/minor/patch/pre)
- **Docker Compose Validator** - parse and validate a `docker-compose.yml` for structural errors
- **Kubernetes YAML Validator** - validate a k8s manifest against the schema for a chosen k8s version

---

## Tier 5 - SQL Additions

The existing SQL Formatter and AI SQL Builder are good anchors. Gaps:

- **SQL Validator** - parse a SQL statement and report syntax errors (dialect-aware: Postgres, MySQL, SQLite)
- **SQL Minifier** - strip whitespace and comments from SQL (complement to the formatter)
- **SQL Diff** - compare two SQL statements or schema files and show structural differences

---

## Tier 6 - Color Tools

The existing Color Code Picker handles basic conversion. Additions:

- **Color Contrast Checker** - input foreground + background, show WCAG AA/AAA pass/fail ratios
- **Color Palette Generator** - input a base color, generate complementary/analogous/triadic palettes
- **CSS Gradient Builder** - visual gradient editor outputting a `background: linear-gradient(...)` string

---

## Tier 7 - Date & Time Tools

The existing Timestamp Converter handles Unix time. Additions:

- **Timezone Converter** - convert a datetime between any two IANA timezones with DST awareness
- **ISO 8601 Converter** - convert between ISO 8601, RFC 2822, and human-readable forms
- **Business Day Calculator** - add/subtract N business days from a date, respecting optional holidays
- **Relative Date Calculator** - "how many days between X and Y", "what date is 90 days from today"
- **Age Calculator** - input a birthdate, get exact age (years, months, days)

Note: The Cron Expression Builder (Tier 1) fits here thematically too.

---

## Tier 8 - Cryptography & Security

- **HMAC Generator** - key + message + algorithm (SHA256, SHA512), output hex/base64 - directly useful for API signing
- **BCrypt Generator/Verifier** - hash a password with bcrypt, verify a hash
- **File Hash Checker** - upload a file, compute MD5/SHA1/SHA256/SHA512 (browser-only, no upload needed)
- **RSA/AES Encrypt/Decrypt** - generate key pairs, encrypt/decrypt payloads for local testing

---

## Tier 9 - Networking Tools

- **DNS Lookup** - query A, AAAA, MX, TXT, CNAME records for a domain (server-side via DNS API)
- **WHOIS Lookup** - domain registration info (server-side)
- **SSL Certificate Checker** - inspect the TLS cert for any domain: issuer, expiry, SANs (server-side)
- **CIDR Calculator** - input a CIDR block, show network address, broadcast, host range, usable count
- **IP Range Calculator** - input start/end IPs, compute the covering CIDR blocks

---

## Tier 10 - Markdown Tools

- **Markdown Formatter** - format and normalize Markdown (consistent heading spacing, list indentation)
- **Markdown Table Generator** - visual table editor (rows/columns) that outputs a GFM table
- **Mermaid Preview** - paste Mermaid diagram source, render it live in the browser
- **Markdown Linter** - surface common Markdown issues (missing blank lines, inconsistent heading levels)

---

## Tier 11 - Image Tools

All browser-only (Canvas API); no MCP.

- **Image Compressor** - drag-and-drop lossy/lossless compression, before/after size comparison
- **Image Resizer** - resize to exact dimensions or scale by percentage
- **SVG Optimizer** - remove unnecessary attributes, inline styles, metadata from SVG (uses SVGO logic)
- **SVG to PNG** - render an SVG at a chosen resolution and download as PNG
- **EXIF Viewer** - display all EXIF metadata from a JPEG/TIFF file

---

## Tier 12 - AI Tool Additions

These extend the existing AI suite naturally.

| Tool | Description |
|---|---|
| **AI Commit Message Generator** | Paste a diff or list of changed files, get a conventional commit message |
| **AI Regex Generator** | Describe what you want to match, get a regex with explanation (complement to the existing Regex Parser) |
| **AI Error Explainer** | Paste a stack trace or error message, get a plain-language explanation and fix suggestions |
| **AI Log Analyzer** | Paste server/app logs, get a summary of errors, anomalies, and patterns |
| **AI Dockerfile Generator** | Describe your app stack, get a production-ready Dockerfile |
| **AI Architecture Diagram Generator** | Describe your system, get Mermaid diagram source (pairs with Mermaid Preview) |
| **AI Prompt Optimizer** | Paste a prompt, get suggestions for making it clearer and more effective |
| **AI Release Notes Generator** | Paste commit log or PR titles, get formatted release notes |

---

## Implementation Phases

Phases are ordered so that each one ships a coherent, self-contained improvement.
Cleanups come first because they reduce the catalog surface before new tools are added, and enhancements to existing tools deliver value with less scope than net-new tools.

---

### Phase 0 - Cleanup & Consolidation ✅ COMPLETED (2026-07-14)

**Goal:** Reduce tool count from duplicate/inverse pairs without removing any functionality.
No new backend handlers needed; just UI merges.

| Work Item | Type | Status | Details |
|---|---|---|---|
| Merge JSON Beautifier into JSON Formatter | Refactor | ✅ Done | One tool with indent selector; `/tools/json-beautifier` redirects to `/tools/json-formatter` |
| Merge HTML Beautifier into HTML Formatter | Refactor | ✅ Done | Same pattern; `/tools/html-beautifier` redirects to `/tools/html-formatter` |
| Merge Base64 Encoder + Decoder into Base64 Encoder/Decoder | Refactor | ✅ Done | Tab-based UI at `/tools/base64-encoder-decoder`; old routes redirect |
| Merge RGB to HEX + HEX to RGB into Color Code Picker | Refactor | ✅ Done | Both routes redirect to `/tools/color-code-picker` |
| Merge INI to JSON + INI to XML + INI to YAML into INI Converter | Refactor | ✅ Done | One source pane with JSON/XML/YAML format selector at `/tools/ini-converter` |
| Merge CSV to JSON + CSV to XML + CSV to YAML + CSV to SQL into CSV Converter | Refactor | ✅ Done | One source pane with JSON/XML/YAML/SQL format selector at `/tools/csv-converter` |
| Add cURL Generator to REST API Tester | Enhancement | ✅ Done | "Copy as cURL" button next to "Send Request" button |
| Add cURL Importer to REST API Tester | Enhancement | ✅ Done | "Import cURL" toggle above the request form; pre-fills method, URL, headers, body |

After Phase 0 the catalog shrank from 89 to 79 entries and the REST API Tester became significantly more capable.

---

### Phase 1 - Core Developer Gaps ✅ COMPLETED (2026-07-14)

**Goal:** Fill the most-searched gaps in day-to-day developer workflow.
All tools in this phase are deterministic (no LLM), stateless, and MCP-callable.

| Tool | Category | Status | Notes |
|---|---|---|---|
| **Cron Expression Builder** | Developer | ✅ Done | Visual presets + free-text; parse expression -> description; show next N run times at `/tools/cron-expression-builder` |
| **JWT Generator** | Developer | ✅ Done | HS256/HS512, custom payload, secret, configurable expiry at `/tools/jwt-generator` |
| **URL Builder** | Developer | ✅ Done | Visual form for protocol/host/path/query params; live URL preview at `/tools/url-builder` |
| **Query String Parser** | Developer | ✅ Done | Parse raw query string or full URL into key-value table; handles arrays at `/tools/query-string-parser` |
| **JSON Schema Validator** | Validation | ✅ Done | Validate a JSON document against a JSON Schema; shows errors with paths at `/tools/json-schema-validator` |
| **JSON Schema Generator** | Validation | ✅ Done | Infer a draft-07 schema from a sample JSON document at `/tools/json-schema-generator` |
| **Word & Character Counter** | Developer | ✅ Done | Live stats: words, chars, chars-without-spaces, sentences, paragraphs, reading time at `/tools/word-counter` |
| **Lorem Ipsum Generator** | Developer | ✅ Done | Paragraph/word/sentence count; classic latin or random English at `/tools/lorem-ipsum-generator` |

After Phase 1 the catalog grew from 79 to 87 entries and added 8 new MCP-callable tools.

---

### Phase 2 - Encoding, Text & Color ✅ COMPLETED (2026-07-14)

**Goal:** Round out the encoding and text manipulation utilities, and expand color tooling.
All are deterministic and client-side; most are MCP-callable.

| Tool | Category | Status | Notes |
|---|---|---|---|
| **Color Contrast Checker** | Developer | ✅ Done | Foreground + background input; WCAG AA/AAA pass/fail ratios at `/tools/color-contrast-checker` |
| **Color Palette Generator** | Developer | ✅ Done | Base color input; complementary/analogous/triadic/tetradic palettes + shades at `/tools/color-palette-generator` |
| **CSS Gradient Builder** | Developer | ✅ Done | Visual stop editor; linear/radial; outputs ready CSS string at `/tools/css-gradient-builder` |
| **Random String Generator** | Developer | ✅ Done | Length, charset (alphanumeric, hex, base58, custom), count at `/tools/random-string-generator` |
| **Slug Generator** | Developer | ✅ Done | Separator and case options; live preview at `/tools/slug-generator` |
| **Line Utilities** | Developer | ✅ Done | Sort, deduplicate, reverse, shuffle, number, trim, remove-empty at `/tools/line-utilities` |
| **Hex / Text Converter** | Converter | ✅ Done | Encode any string to hex bytes and decode back at `/tools/hex-text-converter` |
| **Unicode Escape Converter** | Converter | ✅ Done | Text ↔ \\uXXXX / \\UXXXXXXXX / U+XXXX / HTML entities at `/tools/unicode-escape-converter` |
| **ROT13** | Converter | ✅ Done | ROT13 cipher with swap button at `/tools/rot13` |

After Phase 2 the catalog grew from 87 to 96 entries and added 9 new MCP-callable tools.

---

### Phase 3 - Date, Time & DevOps ✅ COMPLETED (2026-07-14)

**Goal:** Address the date/time gaps and add DevOps config tools that are high-value and require no external services.

| Tool | Category | Status | Notes |
|---|---|---|---|
| **Timezone Converter** | Converter | ✅ Done | Convert datetime between IANA timezones; DST-aware at `/tools/timezone-converter` |
| **ISO 8601 Converter** | Converter | ✅ Done | Convert between ISO 8601, RFC 2822, and human-readable forms at `/tools/iso8601-converter` |
| **Business Day Calculator** | Developer | ✅ Done | Add/subtract N business days; optional holiday list at `/tools/business-day-calculator` |
| **Relative Date Calculator** | Developer | ✅ Done | Days between two dates; add/subtract days from a date at `/tools/relative-date-calculator` |
| **Age Calculator** | Developer | ✅ Done | Exact age in years/months/days; next birthday countdown at `/tools/age-calculator` |
| **Env File Parser** | Developer | ✅ Done | Parse `.env` files; detect duplicates, empty values, quoted strings at `/tools/env-file-parser` |
| **Gitignore Generator** | Developer | ✅ Done | 25 templates (languages, editors, OS, frameworks); MCP-callable at `/tools/gitignore-generator` |
| **Conventional Commit Generator** | Developer | ✅ Done | Form-based commit message builder with breaking change and issue refs at `/tools/conventional-commit-generator` |
| **Semantic Version Comparator** | Validation | ✅ Done | Compare two semver strings; shows major/minor/patch diff at `/tools/semver-comparator` |

After Phase 3 the catalog grew from 96 to 105 entries and added 9 new MCP-callable tools.

---

### Phase 4 - Security & Cryptography ✅ COMPLETED (2026-07-14)

**Goal:** Add the missing crypto tools that developers reach for when building or testing APIs.
Most are MCP-callable; File Hash Checker and RSA/AES are browser-only.

| Tool | Category | Status | Notes |
|---|---|---|---|
| **HMAC Generator** | Developer | ✅ Done | Key + message + algorithm (SHA-256/SHA-512/SHA-1/MD5); hex/base64 output; covers AWS/Stripe/webhook signing at `/tools/hmac-generator` |
| **BCrypt Generator/Verifier** | Developer | ✅ Done | Hash a password with configurable cost rounds (4-14); verify a password against an existing hash at `/tools/bcrypt-tool` |
| **File Hash Checker** | Developer | ✅ Done | Drop any file, compute MD5/SHA-1/SHA-256/SHA-512 in the browser; no upload to server at `/tools/file-hash-checker` |
| **RSA / AES Encrypt & Decrypt** | Developer | ✅ Done | Generate RSA-2048 key pairs, encrypt/decrypt with RSA-OAEP; AES-256-GCM with PBKDF2 passphrase; browser-only via Web Crypto API at `/tools/rsa-aes-tool` |

After Phase 4 the catalog grew from 105 to 109 entries and added 3 new MCP-callable tools (HMAC Generator, BCrypt, File Hash Checker).

---

### Phase 5 - Networking & Infrastructure ✅ COMPLETED (2026-07-14)

**Goal:** Add server-side networking lookup tools.
These require backend fetch/DNS/TLS calls; all are MCP-callable.

| Tool | Category | Status | Notes |
|---|---|---|---|
| **DNS Lookup** | Developer | ✅ Done | Query A, AAAA, MX, TXT, CNAME, NS records via Cloudflare DNS-over-HTTPS; supports ALL or individual type at `/tools/dns-lookup` |
| **WHOIS Lookup** | Developer | ✅ Done | Domain registration info via RDAP: registrar, dates, nameservers, status at `/tools/whois-lookup` |
| **SSL Certificate Checker** | Developer | ✅ Done | TLS socket inspection: subject, issuer, expiry, SANs, SHA-256 fingerprint, days remaining at `/tools/ssl-checker` |
| **CIDR Calculator** | Developer | ✅ Done | Network/broadcast address, subnet mask, wildcard mask, host range, usable count, class, private flag at `/tools/cidr-calculator` |
| **IP Range Calculator** | Developer | ✅ Done | Input start/end IPs; outputs minimal covering CIDR set at `/tools/ip-range-calculator` |

After Phase 5 the catalog grew from 109 to 114 entries and added 5 new MCP-callable tools.

---

### Phase 6 - Markdown & Diagram Tools ✅ COMPLETED (2026-07-14)

**Goal:** Fill the Markdown authoring gap, including diagram preview that pairs naturally with AI tools.

| Tool | Category | Status | Notes |
|---|---|---|---|
| **Markdown Table Generator** | Developer | ✅ Done | Visual row/column editor with reorder, alignment selector; outputs GFM table; MCP-callable at `/tools/markdown-table-generator` |
| **Mermaid Preview** | Developer | ✅ Done | Live diagram rendering with DOMPurify SVG sanitization; 5 built-in examples; download SVG; browser-only at `/tools/mermaid-preview` |
| **Markdown Formatter** | Formatter | ✅ Done | Normalize heading spacing, collapse blank lines, trim trailing whitespace, ATX heading style; MCP-callable at `/tools/markdown-formatter` |
| **Markdown Linter** | Validation | ✅ Done | Rules MD001/018/022/009/010/013/034/047; configurable line-length limit; MCP-callable at `/tools/markdown-linter` |

After Phase 6 the catalog grew from 114 to 118 entries and added 3 new MCP-callable tools (Markdown Table Generator, Markdown Formatter, Markdown Linter).

---

### Phase 7 - API Protocol Tools ✅ COMPLETED (2026-07-14)

**Goal:** Expand the API testing surface beyond REST, and add OpenAPI/GraphQL tooling.
WebSocket and SSE testers are browser-only; OpenAPI and GraphQL tools are MCP-callable.

| Tool | Category | Status | Notes |
|---|---|---|---|
| **OpenAPI Validator** | Validation | ✅ Done | Validate YAML/JSON spec against OpenAPI 3.x schema; surfaces errors with paths; MCP-callable at `/tools/openapi-validator` |
| **OpenAPI Viewer** | Developer | ✅ Done | Paste or upload a spec; browse all endpoints, parameters, and response schemas in an interactive panel; browser-only at `/tools/openapi-viewer` |
| **GraphQL Formatter** | Formatter | ✅ Done | Format GraphQL queries, mutations, subscriptions, and schema documents; MCP-callable at `/tools/graphql-formatter` |
| **GraphQL Explorer** | Developer | ✅ Done | Connect to any GraphQL endpoint, browse schema by introspection, run queries/mutations; server-proxied at `/tools/graphql-explorer` |
| **WebSocket Tester** | Developer | ✅ Done | Connect to any WS URL, send messages, view incoming frames with timestamps; browser-only at `/tools/websocket-tester` |
| **SSE Tester** | Developer | ✅ Done | Connect to an SSE endpoint, display streamed events with type and timestamp; browser-only at `/tools/sse-tester` |
| **SQL Validator** | Validation | ✅ Done | Validate SQL syntax for Postgres/MySQL/SQLite; reports errors with line/column; MCP-callable at `/tools/sql-validator` |
| **SQL Minifier** | Formatter | ✅ Done | Strip comments and whitespace from SQL; MCP-callable at `/tools/sql-minifier` |

After Phase 7 the catalog grew from 118 to 126 entries and added 4 new MCP-callable tools (OpenAPI Validator, GraphQL Formatter, SQL Validator, SQL Minifier).

---

### Phase 8 - Image Tools ✅ COMPLETED (2026-07-14)

**Goal:** Browser-side image utilities.
All are browser-only (Canvas API); none need MCP.

| Tool | Category | Status | Notes |
|---|---|---|---|
| **Image Compressor** | Utilities | ✅ Done | Quality slider (1-100%); before/after size comparison; side-by-side preview; JPEG/PNG/WebP support at `/tools/image-compressor` |
| **Image Resizer** | Utilities | ✅ Done | Exact pixel dimensions or percentage scale; aspect ratio lock toggle; JPEG/PNG/WebP output at `/tools/image-resizer` |
| **SVG Optimizer** | Developer | ✅ Done | Configurable passes: remove comments, metadata, editor attributes (Inkscape/Sodipodi), empty attrs, collapse whitespace; shows byte savings at `/tools/svg-optimizer` |
| **SVG to PNG** | Converter | ✅ Done | 1×/2×/3×/4× scale presets; optional transparent background; rendered via Canvas API; download PNG at `/tools/svg-to-png` |
| **EXIF Viewer** | Developer | ✅ Done | Pure JS EXIF/TIFF parser (no npm package); Camera, Exposure, GPS, Other groups; copy all to clipboard at `/tools/exif-viewer` |

After Phase 8 the catalog grew from 126 to 131 entries. All 5 tools are browser-only; no new MCP-callable tools added.

---

### Phase 9 - AI Suite Extensions

**Goal:** Extend the existing AI Tools category with targeted additions that don't duplicate existing tools.
All require BYOK (bring your own API key) like the rest of the AI suite.

| Tool | Category | Notes |
|---|---|---|
| **AI Commit Message Generator** | AI Tools | Paste a diff or changed file list; get a conventional commit message |
| **AI Regex Generator** | AI Tools | Describe what to match; get a regex with explanation; pairs with existing Regex Parser |
| **AI Error Explainer** | AI Tools | Paste a stack trace; get plain-language explanation and fix suggestions |
| **AI Log Analyzer** | AI Tools | Paste server/app logs; get a summary of errors, anomalies, and patterns |
| **AI Dockerfile Generator** | AI Tools | Describe your stack; get a production-ready Dockerfile |
| **AI Architecture Diagram Generator** | AI Tools | Describe your system; get Mermaid source (pairs with Phase 6 Mermaid Preview) |
| **AI Prompt Optimizer** | AI Tools | Paste a prompt; get suggestions for clarity and effectiveness |
| **AI Release Notes Generator** | AI Tools | Paste commit log or PR titles; get formatted release notes |
