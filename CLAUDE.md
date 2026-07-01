# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ai-developer-tools** is a Next.js 16 web application that provides **80+ free developer tools** organized by category (Developer, Validation, Formatter, Converter, AI Tools). The site features a catalog interface for browsing tools, and integrates with an MCP (Model Context Protocol) server for tool availability via Claude API.

The app is built with v0, uses React 19, Tailwind CSS 4, and is deployed automatically on merge to `main`.

**See `README.md` for the current list of all tools, their status, and complete tool statistics.** This CLAUDE.md file provides technical architecture; README.md is the source of truth for tool inventory and features.

## Development Commands

This project uses **pnpm** as the package manager (not npm or yarn).

```bash
# Install dependencies
pnpm install

# Start development server (runs on http://localhost:3000)
pnpm run dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm run lint

# Type-check with TypeScript
pnpm tsc --noEmit

# Type-check and lint together (recommended before committing)
pnpm run lint && pnpm tsc --noEmit
```

## Architecture & Key Concepts

### Directory Structure

- **`app/`** — Next.js App Router with two main sections:
  - `app/page.tsx` — Landing page with hero, category grid, featured tools
  - `app/(public)/tools/` — Tools listing and individual tool pages
  - `app/api/` — Backend endpoints for tool execution and MCP protocol

- **`lib/`** — Core logic:
  - `constants.ts` — Tool definitions (TOOLS array) and category info (TOOLS_CATEGORIES, CATEGORY_INFO)
  - `tool-handlers.ts` — Tool execution logic with handler pattern (description, schema, handler function)
  - `utils.ts` — UI utility functions
  - `helpers.ts` — General helpers

- **`components/`** — React components organized by domain:
  - `layout/` — Navbar, footer
  - `tools/` — ToolCard, tool-specific UI components
  - `ui/` — Base UI components (buttons, inputs, etc.)
  - `shared/` — Shared components (e.g., loaders)
  - `providers/` — Context providers (e.g., theme)

### Tool System

Tools are defined as objects in `constants.ts` with:
- `id` — unique identifier used in URLs and API routes
- `name` — display name
- `category` — one of: `developer`, `validation`, `formatter`, `converter`
- `description` — long description
- `shortDescription` — brief text
- `comingSoon` — optional flag for UI only

Each tool has a corresponding handler in `tool-handlers.ts` with:
- `description` — what the tool does
- `schema` — JSON Schema for input validation (type, properties, required fields)
- `handler` — async function that receives typed input and returns result

### API Routes

- **`POST /api/tools/[toolId]`** — Execute a specific tool
  - Body: tool-specific input object matching the handler schema
  - Response: `{ result: any }` or `{ error: string }`
  - Input validation uses Zod schemas defined in handlers

- **`POST /api/mcp`** — MCP protocol endpoint
  - Supports `tools/list` method (returns all tools with schemas)
  - Supports `tools/call` method (execute tool by name)
  - Used by Claude via `@vercel/mcp-adapter`
  - Automatically converts handler JSON schemas to Zod validation

### Frontend Patterns

- **Page filtering** — `/tools` page uses `useSearchParams` to read `?category=X` and filters TOOLS array client-side
- **Dynamic tool pages** — `/tools/[toolId]` looks up tool in TOOLS array, renders `ToolPageClient` (client component that calls `/api/tools/[toolId]`)
- **Icons** — Tool category icons are dynamically loaded from lucide-react by name stored in CATEGORY_INFO

### Configuration

- **TypeScript** — Strict mode, paths alias `@/*` maps to project root
- **Tailwind CSS 4** — With PostCSS plugin
- **Next.js 16** — App Router, server components by default, dynamic imports for MCP
- **Zod** — Schema validation for MCP handler inputs (v4.4.3)

## Adding a New Tool

**CRITICAL: When adding, updating, or removing tools, you MUST update both the code AND the README.md file simultaneously.**

### Key Requirements

- **MCP Support**: All new tool implementations MUST work as an API with MCP (Model Context Protocol) support, following the same patterns as existing tools. Tools must include a handler in `tool-handlers.ts` with proper schema definition so they are automatically exposed via `/api/mcp`.
- **Documentation Sync**: Any update to current tools or their behavior MUST be reflected in README.md simultaneously with code changes. This keeps the tool catalog and user-facing documentation in sync with the actual implementation.

### Implementation Steps

1. Add entry to `TOOLS` array in `lib/constants.ts`:
   ```ts
   {
     id: 'my-tool',
     name: 'My Tool',
     category: TOOLS_CATEGORIES.DEVELOPER,
     description: 'What it does',
     shortDescription: 'Brief desc',
     comingSoon: false, // or true if planned but not built
   }
   ```

2. If the tool is **not** marked as `comingSoon`, add handler to `lib/tool-handlers.ts`:
   ```ts
   'my-tool': {
     description: 'What it does',
     schema: {
       type: 'object',
       properties: { input: { type: 'string' } },
       required: ['input'],
     },
     handler: async (input) => {
       // implement logic
       return result
     },
   }
   ```

3. Create client component in `components/tools/my-tool.tsx` (or inline in `tool-page-client.tsx` with conditional rendering)

4. Wire up in `tool-page-client.tsx` to render the right component based on `toolId`

### Documentation Updates (REQUIRED)

In **`README.md`**, you MUST:

1. **Add tool row** to the appropriate category table (Developer, Validation, Formatter, Converter, or AI Tools):
   ```markdown
   | **My Tool** | ✅ Built | What it does |
   ```
   or for planned tools:
   ```markdown
   | **My Tool** | 🏗️ Coming Soon | What it does |
   ```

2. **Update statistics** in the "📊 Stats" section:
   - `Total Tools`: increment count
   - `Built & Ready`: increment if not `comingSoon`
   - `Coming Soon`: increment if `comingSoon`

3. **Update feature list** if tool adds new capability (in "🚀 Features" section)

See `README.md` § "🛠️ Development Rules" for the checklist.

### Verification

The tool becomes immediately available at `/tools/my-tool` and in the MCP server at `/api/mcp`.

## Tool Implementation Patterns

### Schema Validation

Tool handlers receive input that has been validated against the JSON Schema defined in the handler. The schema must:
- Have complete `properties` object listing all input fields
- Include `required` array specifying mandatory fields
- Include `description` for each property to explain what it accepts

Example:
```ts
schema: {
  type: 'object',
  properties: {
    input: { type: 'string', description: 'The text to process' },
    format: { type: 'string', enum: ['json', 'yaml'], description: 'Output format' },
  },
  required: ['input', 'format'],
  additionalProperties: false,
}
```

The MCP endpoint validates inputs using these schemas before calling handlers. Handlers assume input is valid after schema validation.

### Error Handling

Always provide descriptive error messages:

```ts
handler: async (input) => {
  const { value, format } = input
  
  if (!format || !['hex', 'rgb', 'hsl'].includes(format)) {
    throw new Error('Invalid format. Use: hex, rgb, or hsl')
  }
  
  if (value < 0) {
    throw new Error('Value cannot be negative')
  }
  
  // Implementation...
}
```

### Return Format

Return simple JSON-serializable objects:

```ts
return {
  success: true,
  result: processedData,
  stats: {
    inputLength: input.length,
    outputLength: output.length,
  },
}
```

### Helper Functions

For complex logic, create helper functions in the same handler file:

```ts
function parseCustomFormat(input: string) {
  // parsing logic
  return parsed
}

'my-tool': {
  // ...
  handler: async (input) => {
    const parsed = parseCustomFormat(input.data)
    return { result: parsed }
  }
}
```

## Testing Tools

### Manual API Test

Test your tool via the REST endpoint:

```bash
curl -X POST http://localhost:3000/api/tools/tool-id \
  -H "Content-Type: application/json" \
  -d '{
    "inputField": "test value",
    "numberField": 42
  }'
```

### Browser Testing

1. Run `pnpm run dev`
2. Navigate to `http://localhost:3000`
3. Search for your tool or filter by category
4. Click on the tool card
5. Test with various inputs and edge cases
6. Verify results are correct

### MCP Testing

Test tool availability via the MCP endpoint:

```bash
# List all tools
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"method":"tools/list"}' | grep "tool-id"

# Call tool via MCP
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "method":"tools/call",
    "name":"tool-id",
    "arguments":{"inputField":"value"}
  }'
```

## Checklist Before Committing

Before committing a new or updated tool:

- [ ] Tool defined in `lib/constants.ts`
- [ ] Handler implemented in `lib/tool-handlers.ts` (or `comingSoon: true`)
- [ ] Tool added to README.md category table
- [ ] Statistics updated in README.md ("📊 Stats" section)
- [ ] Tool tested via API endpoint (curl)
- [ ] Tool tested in browser UI
- [ ] Edge cases tested
- [ ] No TypeScript errors (`pnpm tsc --noEmit`)
- [ ] Commit message includes tool identifier (e.g., `[tool: tool-name]`)

**Example Commit:**

```
[tool: text-case-converter] Add text case conversion utility

- Implement camelCase, snake_case, PascalCase conversions
- Add handler with input validation
- Update README with tool documentation
- Test all case conversion types
```

## Tool Categories & Patterns

### Developer Tools
**Purpose**: Code utilities, encoders/decoders, converters, ID generators
**Examples**: JSON beautifier, UUID generator, Hash generator, Text case converter
**Icon**: Code

### Validation Tools
**Purpose**: Syntax/format validation, parsing
**Examples**: JSON validator, Regex parser, YAML validator
**Icon**: CheckCircle

### Formatter Tools
**Purpose**: Code and data formatting
**Examples**: JSON formatter, HTML beautifier, SQL formatter
**Icon**: Wand2

### Converter Tools
**Purpose**: Format conversion between different data types
**Examples**: JSON to XML, CSV to JSON, Unit converter
**Icon**: Zap

### AI Tools
**Purpose**: AI-powered utilities
**Examples**: Chatbot builder, Code generator, Sentiment analyzer
**Icon**: Sparkles

## Implementation Examples

### Example 1: Simple Tool (Text Case Converter)

**`lib/constants.ts`:**
```ts
{
  id: 'text-case-converter',
  name: 'Text Case Converter',
  category: TOOLS_CATEGORIES.DEVELOPER,
  description: 'Convert text between different cases',
  shortDescription: 'Convert text case',
}
```

**`lib/tool-handlers.ts`:**
```ts
'text-case-converter': {
  description: 'Convert text between different cases',
  schema: {
    type: 'object',
    properties: {
      text: { type: 'string', description: 'Text to convert' },
      case: { 
        type: 'string', 
        enum: ['upper', 'lower', 'camel', 'snake'],
        description: 'Target case type'
      }
    },
    required: ['text', 'case']
  },
  handler: async (input) => {
    const { text, case: caseType } = input
    let result
    
    switch(caseType) {
      case 'upper': result = text.toUpperCase(); break;
      case 'lower': result = text.toLowerCase(); break;
      case 'camel': result = toCamelCase(text); break;
      case 'snake': result = toSnakeCase(text); break;
      default: throw new Error('Invalid case type')
    }
    
    return { converted: result }
  }
}
```

**`README.md`:**
```markdown
| **Text Case Converter** | ✅ Built | Convert text between uppercase, lowercase, camelCase, snake_case |
```

### Example 2: Coming Soon Tool

No handler needed—just define in constants:

**`lib/constants.ts`:**
```ts
{
  id: 'code-minifier',
  name: 'Code Minifier',
  category: TOOLS_CATEGORIES.FORMATTER,
  description: 'Minify JavaScript, CSS, and HTML code',
  shortDescription: 'Minify code',
  comingSoon: true,  // Flag for future implementation
}
```

**`README.md`:**
```markdown
| **Code Minifier** | 🏗️ Coming Soon | Minify JavaScript, CSS, and HTML code |
```

## Best Practices

### Do's ✅

- **Implement with MCP support** — All tools must have a handler in `tool-handlers.ts` with complete schema definition for MCP exposure
- Keep handlers simple and focused on their core function
- Provide clear, actionable error messages
- Test edge cases thoroughly
- Document all inputs thoroughly in schema with descriptions
- Return consistent JSON objects
- **Always update README.md simultaneously with code changes** — Keep tool catalog, statistics, and descriptions in sync
- Use helper functions for complex logic
- Use descriptive variable names
- Follow existing patterns in tool-handlers.ts

### Don'ts ❌

- Don't modify authentication/database code
- Don't add external dependencies without approval
- Don't return HTML or large binary objects
- **Don't skip README updates** — this breaks documentation sync
- Don't hardcode configuration values
- Don't forget required fields in JSON schema
- Don't change existing tool behavior without discussion
- Don't make tools do too much — keep them focused

## Styling

- **Tailwind 4 with custom utilities** — See `globals.css` for theme variables and custom classes like `btn-primary`, `btn-secondary`, `card-base`, `input-base`, `container-main`
- **Responsive** — Mobile-first design with `sm:`, `md:`, `lg:` breakpoints
- **Icons** — lucide-react 1.21.0 (import as `<IconName />` or dynamically via `LucideIcons[name]`)

## Known Patterns to Maintain

- Tools are primarily **client-side** in the browser; handlers do basic transformations (no heavy compute or file I/O)
- **Error handling** — Handlers throw descriptive errors; API routes catch and return `{ error: string }` with 400 status
- **Async/await** — All handlers are async functions even if they don't use await
- **JSON Schema** — Tool input schemas must be complete and match handler input shape
- **No authentication** — App is public; no user or session logic
- **No database** — Tools are stateless; state comes from URL params and form inputs

## Environment Setup

This project uses `.env.local` for local configuration. Currently:
- `JWT_SECRET` is defined but not used in current code (legacy from prior auth refactor)

No other environment variables are required for local development.

## v0 Integration

This project is linked to a **v0** project for AI-driven development. Updates can be pushed directly to this repo from v0. When seeing recent commits from v0, be aware that future changes may come from AI-generated code and should be reviewed for consistency with established patterns.

v0 project: https://v0.app/chat/projects/prj_ZIv3DDVpyezX1FJHY0Gu5kBttIpT

## Deployment

- Deployed on Vercel; auto-deploys on push to `main`
- MCP adapter enabled via `@vercel/mcp-adapter` dependency for Claude API integration
- Live site: https://ai-developer-tools.vercel.app

## Documentation & Reference

- **`README.md`** — Primary user-facing documentation, tool catalog, features, roadmap, and development rules
- **`CLAUDE.md`** — This file; technical architecture, code patterns, and implementation guidance for Claude Code
- **Tool List** — See README.md for current tool inventory and status. Always cross-reference README.md when checking tool counts or categories.

### Updating Documentation

When you modify the tool system:
- Code changes go to `lib/constants.ts` and `lib/tool-handlers.ts`
- Documentation updates go to `README.md` simultaneously (see "Adding a New Tool" section above)
- This CLAUDE.md should only be updated for architectural changes or new code patterns
