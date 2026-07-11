# AI Developer Tools

A comprehensive collection of **80+ free developer and AI-powered tools** for developers and creators. All tools are instant, require no signup, and work completely in your browser.

[Visit Live](ai-developer-tools.vercel.app/)

---

## 🤖 MCP Server Integration

This application includes a **Model Context Protocol (MCP) server** that exposes tools to Claude AI and other MCP-compatible applications.

### What is MCP?
MCP is a standardized protocol that allows AI models like Claude to discover and execute tools through a unified interface.

### How to Use with Claude
- **Access**: MCP-enabled tools are available via `/api/mcp` endpoint
- **Authentication**: Public access - no API keys required
- **Integration**: Connect Claude to this MCP server to use any supported tool programmatically
- **Methods**: 
  - `tools/list` - Get all MCP-enabled tools with schemas
  - `tools/call` - Execute any MCP-enabled tool with parameters

### Quick Start
```bash
# List all available MCP tools
curl -X POST https://ai-developer-tools.vercel.app/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"method":"tools/list"}'

# Call a tool via MCP
curl -X POST https://ai-developer-tools.vercel.app/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "method":"tools/call",
    "name":"json-beautifier",
    "arguments":{"json":"{\"key\":\"value\"}","indent":2}
  }'
```

---

## 🚀 Features

- **83 Tools** across multiple categories
- **77 MCP-Enabled Tools** callable by Claude AI via `/api/mcp`
- **Pinnable Tools** - Pin your frequently used tools for quick access
- **Search & Filter** - Find tools by name, description, or category
- **9 AI Tools** - Bring your own API key; supports OpenAI, Anthropic, Google, Groq, Mistral, Azure, Bedrock, and Ollama
- **Dark Mode** - Full light/dark theme support
- **No Signup Required** - Works instantly in your browser
- **Fully Responsive** - Works perfectly on mobile, tablet, and desktop

---

## 📁 Tool Categories

> **MCP column key:** `✅` = callable via `/api/mcp` · `—` = browser-only or coming soon

### Developer Tools (31 tools)

| Tool | Status | MCP | Description |
|------|--------|-----|-------------|
| **JavaScript Minifier** | ✅ Built | ✅ | Minify JavaScript code to reduce file size |
| **JavaScript Beautifier** | ✅ Built | ✅ | Format and beautify JavaScript code |
| **CSS Minifier** | ✅ Built | ✅ | Minify CSS code to reduce file size |
| **CSS Beautifier** | ✅ Built | ✅ | Format and beautify CSS code |
| **JSON Minifier** | ✅ Built | ✅ | Minify JSON to reduce file size |
| **JSON Beautifier** | ✅ Built | ✅ | Format and beautify JSON data |
| **JSON Generator** | ✅ Built | ✅ | Generate valid JSON with random mock data |
| **Timestamp Converter** | ✅ Built | ✅ | Convert between Unix timestamps and readable dates |
| **Color Code Picker** | ✅ Built | ✅ | Convert between HEX, RGB, and HSL color formats |
| **URL Splitter** | ✅ Built | ✅ | Parse and decompose URLs into components |
| **URL Encoder/Decoder** | ✅ Built | ✅ | Encode and decode URLs and special characters |
| **MIME Type Checker** | ✅ Built | ✅ | Identify MIME types by file extension |
| **HTML Encoder/Decoder** | ✅ Built | ✅ | Encode and decode HTML entities |
| **JavaScript String Escaper** | ✅ Built | ✅ | Escape special characters in JavaScript strings |
| **Base64 Encoder** | ✅ Built | ✅ | Encode data to Base64 format |
| **Base64 Decoder** | ✅ Built | ✅ | Decode Base64 encoded data |
| **JWT Decoder** | ✅ Built | ✅ | Decode and inspect JWT tokens |
| **XML String Escaper** | ✅ Built | ✅ | Escape special characters in XML strings |
| **Public IP Lookup** | ✅ Built | ✅ | Get your public IP address instantly with geolocation |
| **Text Case Converter** | ✅ Built | ✅ | Convert text between different cases (uppercase, camelCase, snake_case, etc.) |
| **UUID Generator** | ✅ Built | ✅ | Generate UUID v4 identifiers for your applications |
| **Hash Generator** | ✅ Built | ✅ | Generate cryptographic hashes (MD5, SHA1, SHA256, SHA512) |
| **Password Generator** | ✅ Built | ✅ | Generate strong and secure passwords with custom options |
| **Mock Data Generator** | ✅ Built | ✅ | Generate realistic test data across multiple categories (Person, Text, Web, Location, Time, Finance, Miscellaneous) |
| **Code Cleaner** | ✅ Built | ✅ | Remove comments and unnecessary whitespace from code |
| **Diff Checker** | ✅ Built | ✅ | Compare two texts and highlight differences |
| **QR Code Generator** | ✅ Built | ✅ | Generate QR codes from any text or URL instantly |
| **REST API Tester** | ✅ Built | ✅ | Test REST APIs with custom headers, authentication, and request body |
| **Notes** | ✅ Built | — | Simple text notes with local storage persistence (browser-only) |
| **Stopwatch** | ✅ Built | — | Stopwatch with lap tracking, fastest/slowest highlights, local storage (browser-only) |
| **Counter** | ✅ Built | — | Multiple counters with custom names, step size, increment/decrement/reset, local storage (browser-only) |
| **Favicon Generator** | ✅ Built | — | Upload an image and generate favicons in all standard sizes + .ico + ZIP (browser-only) |
| **SVG Viewer** | ✅ Built | — | Paste or upload SVG code and see a live rendered preview with source editing |

### Validation Tools (9 tools)

| Tool | Status | MCP | Description |
|------|--------|-----|-------------|
| **Regex Parser** | ✅ Built | ✅ | Test and debug regular expressions |
| **YAML Validator** | ✅ Built | ✅ | Validate YAML syntax and structure |
| **JavaScript Validator** | ✅ Built | ✅ | Validate JavaScript syntax |
| **HTML Validator** | ✅ Built | ✅ | Validate HTML5 markup and detect syntax errors |
| **Redirection Checker** | ✅ Built | ✅ | Follow HTTP redirects and check final URL |
| **JSONPath Evaluator** | ✅ Built | ✅ | Query JSON data using JSONPath expressions |
| **XPath Evaluator** | ✅ Built | ✅ | Query XML documents using XPath expressions |
| **Link Checker** | ✅ Built | ✅ | Check if URLs are reachable, see HTTP status and response time |
| **JSONPath Finder** | ✅ Built | ✅ | Find all matches and paths in JSON using JSONPath expressions |

### Formatter Tools (5 tools)

| Tool | Status | MCP | Description |
|------|--------|-----|-------------|
| **JSON Formatter** | ✅ Built | ✅ | Format and validate JSON with custom indentation |
| **XML Formatter** | ✅ Built | ✅ | Format and pretty-print XML |
| **SQL Formatter** | ✅ Built | ✅ | Format SQL queries with proper indentation |
| **HTML Formatter** | ✅ Built | ✅ | Format and beautify HTML markup |
| **HTML Beautifier** | ✅ Built | ✅ | Alias to HTML Formatter with preset options |

### Converter Tools (28 tools)

| Tool | Status | MCP | Description |
|------|--------|-----|-------------|
| **JSON to Java** | ✅ Built | ✅ | Generate Java POJO classes from JSON |
| **JSON to XML** | ✅ Built | ✅ | Convert JSON to XML format |
| **JSON to PHP** | ✅ Built | ✅ | Generate PHP array syntax from JSON |
| **JSON to C#** | ✅ Built | ✅ | Generate C# classes from JSON |
| **XML to YAML** | ✅ Built | ✅ | Convert XML to YAML format |
| **XML to JSON** | ✅ Built | ✅ | Convert XML to JSON format |
| **INI to JSON** | ✅ Built | ✅ | Convert INI configuration to JSON |
| **INI to XML** | ✅ Built | ✅ | Convert INI to XML format |
| **INI to YAML** | ✅ Built | ✅ | Convert INI to YAML format |
| **CSV to JSON** | ✅ Built | ✅ | Convert CSV data to JSON |
| **CSV to XML** | ✅ Built | ✅ | Convert CSV to XML format |
| **CSV to YAML** | ✅ Built | ✅ | Convert CSV to YAML format |
| **CSV to SQL** | ✅ Built | ✅ | Generate SQL INSERT statements from CSV |
| **YAML to JSON** | ✅ Built | ✅ | Convert YAML to JSON format |
| **JSON to YAML** | ✅ Built | ✅ | Convert JSON to YAML format |
| **RGB to HEX** | ✅ Built | ✅ | Convert RGB color values to HEX format |
| **HEX to RGB** | ✅ Built | ✅ | Convert HEX color values to RGB format |
| **IDN Converter** | ✅ Built | ✅ | Convert between Unicode and Punycode domains |
| **Unit Converter** | ✅ Built | ✅ | Convert between different units (length, weight, temperature) |
| **Currency Converter** | ✅ Built | ✅ | Convert between different currencies with real-time exchange rates |
| **Image / Data URI Converter** | ✅ Built | — | Convert images to Base64 Data URI strings, or decode a Data URI back to an image |
| **SQL to MongoDB** | ✅ Built | ✅ | Convert SQL SELECT/INSERT/UPDATE/DELETE to MongoDB operations |
| **PDF / Markdown Converter** | ✅ Built | ✅ | Convert PDF files to Markdown, or Markdown source to a styled PDF |
| **DOCX / Markdown Converter** | ✅ Built | ✅ | Convert DOCX files to Markdown, or Markdown source to a downloadable DOCX |
| **HTML / Markdown Converter** | ✅ Built | ✅ | Convert HTML to clean Markdown, or render Markdown to styled HTML |
| **Excel / CSV to JSON** | ✅ Built | ✅ | Convert Excel (.xlsx, .xls) or CSV files to JSON; multi-sheet with per-sheet header row config |
| **Excel / CSV to Markdown** | ✅ Built | ✅ | Convert Excel (.xlsx, .xls) or CSV files to Markdown tables; multi-sheet with per-sheet header row config |

### AI Tools (11 tools)

All AI tools require you to supply your own API credentials.
Credentials are passed in each request body and never stored server-side.
Supported providers: OpenAI, Anthropic, Google Gemini, Groq, Mistral, Azure OpenAI, AWS Bedrock, and Ollama (local).

| Tool | Status | MCP | Description |
|------|--------|-----|-------------|
| **AI Chat** | ✅ Built | ✅ | Chat with any supported AI model using your own credentials. Optional custom system prompt. |
| **Code Generator** | ✅ Built | ✅ | Generate production-ready code from natural language descriptions. Supports all major languages. |
| **Content Summarizer** | ✅ Built | ✅ | Summarize long documents, articles, and transcripts with configurable summary length. |
| **Sentiment Analyzer** | ✅ Built | ✅ | Analyze sentiment and emotion from text. Returns overall sentiment, confidence score, and key signals. |
| **AI Code Reviewer** | ✅ Built | ✅ | Automated code review covering bugs, security vulnerabilities, performance, and maintainability. |
| **AI Documentation Generator** | ✅ Built | ✅ | Generate Markdown docs, JSDoc comments, or inline comments from source code. |
| **AI Test Generator** | ✅ Built | ✅ | Generate unit tests covering happy path, edge cases, and error scenarios from source code. |
| **AI SQL Query Builder** | ✅ Built | ✅ | Build SQL queries from natural language. Supports PostgreSQL, MySQL, SQLite, MSSQL, BigQuery, and more. |
| **AI Schema Generator** | ✅ Built | ✅ | Generate JSON Schema, OpenAPI specs, SQL CREATE TABLE, or Prisma schemas from sample data or descriptions. |
| **Workflow Builder** | ✅ Built | ✅ | ReactFlow-based visual workflow builder. Drag-and-drop LLM, conditional, loop, transform, and tool-call nodes. Export/import workflows as JSON. MCP-callable for server-side execution. |
| **Researcher Agent** | ✅ Built | ✅ | Multi-step AI research with optional Tavily web search (BYOK). Streams search progress, collects sources with citations, and synthesizes a Markdown report. Supports quick/standard/deep depth modes. |

---

## 📊 Stats

- **Total Tools**: 85
- **Built & Ready**: 85 ✅
- **Coming Soon**: 0 🏗️
- **MCP Enabled**: 79 ✅ (callable via `/api/mcp`)
- **Categories**: 5 (Developer, Validation, Formatter, Converter, AI Tools)

---

## 🎯 Status Legend

| Symbol | Meaning | Action |
|--------|---------|--------|
| ✅ | Built and fully functional | Use it now! |
| 🏗️ | Coming soon - in development | Check back soon |
| 🚧 | Planned - scheduled for development | Watch this space |

**MCP column:** `✅` = tool is callable via the `/api/mcp` endpoint · `—` = browser-only feature or not yet built

---

## 🔧 Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Backend**: Next.js API Routes, Node.js
- **Integration**: MCP (Model Context Protocol) for Claude AI integration
- **Deployment**: Vercel (auto-deploys on push to `main`)
- **Package Manager**: pnpm

---

## 🚀 Getting Started

### Local Development

```bash
# Install dependencies
pnpm install

# Start development server (http://localhost:3000)
pnpm run dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm run lint
```

### Usage

1. **Visit the dashboard** at `http://localhost:3000`
2. **Search** for tools by name or description
3. **Filter** by category (Developer, Validation, Formatter, Converter, AI Tools)
4. **Pin your favorites** - Click the pin icon to save frequently used tools
5. **Use a tool** - Click any tool card to open it and start using immediately

---

## 🎨 Features

### Pinned Tools
- Click the pin icon (📌) on any tool card to save it
- Pinned tools appear at the top of the dashboard
- Your pins are saved in browser localStorage
- Pin status shows with a yellow/gold icon when pinned

### Dark Mode
- Toggle between light and dark themes using the sun/moon icon
- Theme preference is saved to localStorage
- All tools support both themes

### Responsive Design
- **Mobile**: 1-column grid
- **Tablet**: 2-column grid
- **Desktop**: 3-column grid
- **Large Screen**: 4-column grid

### MCP Integration
- 57 tools are exposed via the `/api/mcp` endpoint
- Claude AI can access and use any MCP-enabled tool programmatically
- Perfect for AI-powered automation and chaining tools together
- Browser-only tools (Notes, Favicon Generator, QR Scanner) are not available via MCP

---

## 📝 API

### REST API

**Execute a tool:**
```bash
POST /api/tools/[toolId]
Content-Type: application/json

{
  "input": "value",
  "options": {}
}
```

Example:
```bash
curl -X POST http://localhost:3000/api/tools/json-beautifier \
  -H "Content-Type: application/json" \
  -d '{"json":"{\"key\":\"value\"}","indent":2}'
```

### MCP API

**List all tools:**
```bash
POST /api/mcp
{
  "method": "tools/list"
}
```

**Call a tool:**
```bash
POST /api/mcp
{
  "method": "tools/call",
  "name": "json-beautifier",
  "arguments": {
    "json": "{\"key\":\"value\"}",
    "indent": 2
  }
}
```

---

## 🛣️ Roadmap

### Phase 1: Core Developer Tools ✅ Complete
- JSON, JavaScript, CSS utilities
- URL and encoding tools
- Color code conversion

### Phase 2: Validation & Formatting ✅ Complete
- Regex and YAML validation
- Code formatters for multiple languages
- JSON Path and XPath evaluation

### Phase 3: Advanced Converters ✅ Complete
- Multi-format conversion (JSON, XML, YAML, CSV, INI)
- Code generation (Java, PHP, C#)
- Protocol and schema conversions

### Phase 4: AI-Powered Tools ✅ Complete
- AI Chat - talk to any supported model with your own credentials
- Code Generator - natural language to production code
- Content Summarizer - summarize long documents and articles
- Sentiment Analyzer - emotion and tone detection
- AI Code Reviewer - bug, security, and maintainability review
- AI Documentation Generator - README and API docs from source
- AI Test Generator - unit tests from source code
- AI SQL Query Builder - natural language to SQL
- AI Schema Generator - JSON Schema, OpenAPI, Prisma from data

### Phase 5: Advanced AI Tools ✅ Shipped
- Workflow Builder - ReactFlow visual AI workflow editor with LLM/conditional/loop nodes
- Researcher Agent - multi-step research with Tavily search, citations, and streaming progress

---

## 🤝 Contributing

This project is currently maintained by Bhavan. Feel free to report issues or suggest new tools!

---

## 📄 License

All tools are free to use. No license restrictions.

---

## 🛠️ Development Rules

### **IMPORTANT: README Update Rule**

**When adding or modifying tools, ALWAYS update this README file simultaneously.**

This ensures the documentation stays accurate and in sync with the codebase.

#### Files to Update When Adding a Tool:

1. **`lib/constants.ts`** - Add tool definition to TOOLS array
   ```typescript
   {
     id: 'tool-id',
     name: 'Tool Name',
     category: TOOLS_CATEGORIES.DEVELOPER,
     description: 'What the tool does',
     shortDescription: 'Brief description',
     comingSoon: false, // or true if not yet built
   }
   ```

2. **`lib/tool-handlers.ts`** - Add handler implementation (if not coming soon)
   ```typescript
   'tool-id': {
     description: 'What the tool does',
     schema: { type: 'object', properties: {...}, required: [...] },
     handler: async (input) => { /* implementation */ }
   }
   ```

3. **`README.md` - Update:**
   - **Tool table** - Add row to appropriate category table with MCP column (`✅` if handler exists, `—` if browser-only or coming soon)
   - **Statistics** - Update tool counts (Total, Built & Ready, Coming Soon, MCP Enabled)
   - **Description** - Update feature list if adding new capability

#### Status Indicators:

- `✅ Built` - Tool is fully implemented and working
- `🏗️ Coming Soon` - Tool is planned but not yet built

#### MCP Column:
- `✅` - Tool has a server-side handler in `tool-handlers.ts` and is callable via `/api/mcp`
- `—` - Tool is browser-only (e.g. uses Canvas, camera, localStorage) or not yet built

---

## 🙋 Support

- **Issues**: Report bugs or request features
- **Questions**: Check the tool descriptions for usage details
- **Feedback**: Your suggestions help us improve!

---

## 🌟 Credits

**Made by Bhavan**

Built with love for developers who want quick, powerful utilities without the hassle.
