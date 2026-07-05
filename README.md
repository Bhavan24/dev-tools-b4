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

- **80+ Tools** across multiple categories
- **57 MCP-Enabled Tools** callable by Claude AI via `/api/mcp`
- **Pinnable Tools** - Pin your frequently used tools for quick access
- **Search & Filter** - Find tools by name, description, or category
- **AI Tools** - Coming soon (8 AI-powered utilities in development)
- **Dark Mode** - Full light/dark theme support
- **No Signup Required** - Works instantly in your browser
- **Fully Responsive** - Works perfectly on mobile, tablet, and desktop

---

## 📁 Tool Categories

> **MCP column key:** `✅` = callable via `/api/mcp` · `—` = browser-only or coming soon

### Developer Tools (33 tools)

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
| **Favicon Generator** | ✅ Built | — | Upload an image and generate favicons in all standard sizes + .ico + ZIP (browser-only) |
| **SVG Viewer** | 🏗️ Coming Soon | — | View and edit SVG code with live preview |
| **HAR Viewer** | 🏗️ Coming Soon | — | View and analyze HTTP Archive (HAR) files |
| **HAR Sanitizer** | 🏗️ Coming Soon | — | Remove sensitive data from HAR files |

### Validation Tools (9 tools)

| Tool | Status | MCP | Description |
|------|--------|-----|-------------|
| **Regex Parser** | ✅ Built | ✅ | Test and debug regular expressions |
| **YAML Validator** | ✅ Built | ✅ | Validate YAML syntax and structure |
| **JavaScript Validator** | ✅ Built | ✅ | Validate JavaScript syntax |
| **HTML Validator** | ✅ Built | ✅ | Validate HTML5 markup and detect syntax errors |
| **Redirection Checker** | ✅ Built | ✅ | Follow HTTP redirects and check final URL |
| **JSON Path Evaluator** | 🏗️ Coming Soon | — | Test JSONPath queries |
| **XPath Evaluator** | 🏗️ Coming Soon | — | Test and debug XPath expressions |
| **Link Checker** | 🏗️ Coming Soon | — | Validate links in documents |
| **JSONPath Finder** | 🏗️ Coming Soon | — | Find and extract JSONPath values |

### Formatter Tools (5 tools)

| Tool | Status | MCP | Description |
|------|--------|-----|-------------|
| **JSON Formatter** | ✅ Built | ✅ | Format and validate JSON with custom indentation |
| **XML Formatter** | ✅ Built | ✅ | Format and pretty-print XML |
| **SQL Formatter** | ✅ Built | ✅ | Format SQL queries with proper indentation |
| **HTML Formatter** | ✅ Built | ✅ | Format and beautify HTML markup |
| **HTML Beautifier** | ✅ Built | ✅ | Alias to HTML Formatter with preset options |

### Converter Tools (29 tools)

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
| **JSON to Protobuf** | 🏗️ Coming Soon | — | Convert JSON schema to Protocol Buffers |
| **XML to XSD** | 🏗️ Coming Soon | — | Generate XSD schema from XML |
| **SQL to MongoDB** | 🏗️ Coming Soon | — | Convert SQL queries to MongoDB aggregation |
| **Image to Data URI** | 🏗️ Coming Soon | — | Convert image files to Data URI format |
| **Data URI to Image** | 🏗️ Coming Soon | — | Convert Data URI back to downloadable image |

### AI Tools (8 tools - Coming Soon)

| Tool | Status | MCP | Description |
|------|--------|-----|-------------|
| **Chatbot Builder** | 🏗️ Coming Soon | — | Create intelligent conversational AI chatbots with custom training data |
| **Workflow Builder** | 🏗️ Coming Soon | — | Design and automate complex AI-powered workflows with visual editor |
| **Researcher Agent** | 🏗️ Coming Soon | — | AI-powered research assistant for deep analysis and information gathering |
| **Code Generator** | 🏗️ Coming Soon | — | Generate production-ready code from natural language descriptions |
| **Content Summarizer** | 🏗️ Coming Soon | — | Automatically summarize long documents, articles, and transcripts |
| **Sentiment Analyzer** | 🏗️ Coming Soon | — | Analyze sentiment and emotion from text data with AI |
| **Image Analyzer** | 🏗️ Coming Soon | — | Extract insights and descriptions from images using AI vision |
| **Data Insights** | 🏗️ Coming Soon | — | Gain AI-powered insights from datasets with automated analysis |

---

## 📊 Stats

- **Total Tools**: 84
- **Built & Ready**: 59 ✅
- **Coming Soon**: 25 🏗️
- **MCP Enabled**: 57 ✅ (callable via `/api/mcp`)
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

### Phase 4: AI-Powered Tools 🏗️ In Progress
- Chatbot builder with training support
- Workflow automation engine
- AI research assistant
- Natural language code generation
- Content summarization and analysis
- Sentiment and emotion detection
- Vision-based image analysis

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
