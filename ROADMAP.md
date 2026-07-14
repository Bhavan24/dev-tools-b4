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

### Phase 2 - Encoding, Text & Color

**Goal:** Round out the encoding and text manipulation utilities, and expand color tooling.
All are deterministic and client-side; most are MCP-callable.

| Tool | Category | Notes |
|---|---|---|
| **Color Contrast Checker** | Developer | Foreground + background input; WCAG AA/AAA pass/fail ratios |
| **Color Palette Generator** | Developer | Base color input; complementary/analogous/triadic palettes with hex/rgb/hsl output |
| **CSS Gradient Builder** | Developer | Visual gradient editor; outputs `linear-gradient(...)` CSS string |
| **Random String Generator** | Developer | Length, charset (alphanumeric, hex, base58, custom), count |
| **Slug Generator** | Developer | Convert any string to a URL-safe slug; separator and case options |
| **Line Utilities** | Developer | Sort, deduplicate, reverse, pick random line - single tool with action tabs |
| **Hex <-> Text Converter** | Converter | Encode any string to hex bytes and decode back |
| **Unicode Escape Converter** | Converter | Literal characters <-> `\uXXXX` / `U+XXXX` forms |
| **ROT13** | Converter | Simple Caesar cipher, MCP-callable |

---

### Phase 3 - Date, Time & DevOps

**Goal:** Address the date/time gaps and add DevOps config tools that are high-value and require no external services.

| Tool | Category | Notes |
|---|---|---|
| **Timezone Converter** | Converter | Convert a datetime between any two IANA timezones; DST-aware |
| **ISO 8601 Converter** | Converter | Convert between ISO 8601, RFC 2822, and human-readable forms |
| **Business Day Calculator** | Developer | Add/subtract N business days from a date; optional holiday list |
| **Relative Date Calculator** | Developer | Days between two dates; "what date is 90 days from today" |
| **Age Calculator** | Developer | Input birthdate, output exact age in years/months/days |
| **Env File Parser** | Developer | Parse a `.env` file into a key-value table; detect duplicates, empty values, quoted strings |
| **Gitignore Generator** | Developer | Select languages/frameworks, generate `.gitignore` from curated templates; MCP-callable |
| **Conventional Commit Generator** | Developer | Form: type/scope/description/body/breaking change; outputs formatted commit message |
| **Semantic Version Comparator** | Validation | Input two semver strings; show which is higher and what changed |

---

### Phase 4 - Security & Cryptography

**Goal:** Add the missing crypto tools that developers reach for when building or testing APIs.
Most are MCP-callable; File Hash Checker is browser-only.

| Tool | Category | Notes |
|---|---|---|
| **HMAC Generator** | Developer | Key + message + algorithm (SHA256/SHA512); hex/base64 output; covers AWS/Stripe/webhook signing |
| **BCrypt Generator/Verifier** | Developer | Hash a password; verify a hash against a plain-text input |
| **File Hash Checker** | Developer | Upload a file, compute MD5/SHA1/SHA256/SHA512 in the browser (no upload to server); browser-only |
| **RSA/AES Encrypt/Decrypt** | Developer | Generate key pairs, encrypt/decrypt text payloads for local testing |

---

### Phase 5 - Networking & Infrastructure

**Goal:** Add server-side networking lookup tools.
These require backend fetch/DNS calls; they are MCP-callable but not pure client-side.

| Tool | Category | Notes |
|---|---|---|
| **DNS Lookup** | Developer | Query A, AAAA, MX, TXT, CNAME records for a domain via a DNS-over-HTTPS API |
| **WHOIS Lookup** | Developer | Domain registration info via a WHOIS proxy API |
| **SSL Certificate Checker** | Developer | Inspect TLS cert for any domain: issuer, expiry, SANs via server-side fetch |
| **CIDR Calculator** | Developer | Input CIDR block; show network address, broadcast, host range, usable count |
| **IP Range Calculator** | Developer | Input start/end IPs; compute covering CIDR blocks |

---

### Phase 6 - Markdown & Diagram Tools

**Goal:** Fill the Markdown authoring gap, including diagram preview that pairs naturally with AI tools.

| Tool | Category | Notes |
|---|---|---|
| **Markdown Table Generator** | Developer | Visual row/column editor outputting a GFM Markdown table |
| **Mermaid Preview** | Developer | Paste Mermaid source, render live in browser; browser-only |
| **Markdown Formatter** | Formatter | Normalize heading spacing, list indentation, blank lines |
| **Markdown Linter** | Validation | Surface common Markdown issues: inconsistent headings, missing blank lines |

---

### Phase 7 - API Protocol Tools

**Goal:** Expand the API testing surface beyond REST, and add OpenAPI/GraphQL tooling.
WebSocket and SSE testers are browser-only; OpenAPI and GraphQL tools are MCP-callable.

| Tool | Category | Notes |
|---|---|---|
| **OpenAPI Validator** | Validation | Validate a YAML/JSON spec against the OpenAPI 3.x schema; surface errors with line numbers |
| **OpenAPI Viewer** | Developer | Upload or paste a spec, render an interactive endpoint browser |
| **GraphQL Formatter** | Formatter | Format a GraphQL query string; deterministic, MCP-callable |
| **GraphQL Explorer** | Developer | Connect to a GraphQL endpoint, browse schema, run queries; browser-only |
| **WebSocket Tester** | Developer | Connect to a WS URL, send messages, view incoming frames; browser-only |
| **SSE Tester** | Developer | Connect to an SSE endpoint, display streamed events; browser-only |
| **SQL Validator** | Validation | Parse and validate SQL syntax for Postgres/MySQL/SQLite |
| **SQL Minifier** | Formatter | Strip whitespace and comments from SQL; complements existing SQL Formatter |

---

### Phase 8 - Image Tools

**Goal:** Browser-side image utilities.
All are browser-only (Canvas API); none need MCP.

| Tool | Category | Notes |
|---|---|---|
| **Image Compressor** | Utilities | Drag-and-drop lossy/lossless compression; before/after size comparison |
| **Image Resizer** | Utilities | Resize to exact dimensions or scale by percentage |
| **SVG Optimizer** | Developer | Strip unnecessary attributes, inline styles, and metadata from SVG |
| **SVG to PNG** | Converter | Render SVG at a chosen resolution and download as PNG |
| **EXIF Viewer** | Developer | Display all EXIF metadata from a JPEG/TIFF file |

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
