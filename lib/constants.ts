export const TOOLS_CATEGORIES = {
  AI_TOOLS: 'ai-tools',
  DEVELOPER: 'developer',
  FORMATTER: 'formatter',
  CONVERTER: 'converter',
  VALIDATION: 'validation',
  UTILITIES: 'utilities',
} as const

export interface Tool {
  id: string
  name: string
  category: (typeof TOOLS_CATEGORIES)[keyof typeof TOOLS_CATEGORIES]
  description: string
  shortDescription: string
  comingSoon?: boolean
}

export const CATEGORY_INFO = {
  [TOOLS_CATEGORIES.AI_TOOLS]: {
    name: 'AI Tools',
    description: 'AI-powered utilities for enhanced productivity',
    icon: 'Sparkles',
  },
  [TOOLS_CATEGORIES.DEVELOPER]: {
    name: 'Developer Tools',
    description: 'Essential utilities for development and debugging',
    icon: 'Code',
  },
  [TOOLS_CATEGORIES.FORMATTER]: {
    name: 'Formatter Tools',
    description: 'Format and beautify code and data',
    icon: 'Wand2',
  },
  [TOOLS_CATEGORIES.CONVERTER]: {
    name: 'Converter Tools',
    description: 'Convert between different formats and encodings',
    icon: 'Zap',
  },
  [TOOLS_CATEGORIES.VALIDATION]: {
    name: 'Validation Tools',
    description: 'Validate and parse code and data formats',
    icon: 'CheckCircle',
  },
  [TOOLS_CATEGORIES.UTILITIES]: {
    name: 'Utilities',
    description: 'Personal productivity tools for everyday tasks',
    icon: 'Wrench',
  },
} as const

export const TOOLS = [
  // AI Tools
  {
    id: 'workflow-builder',
    name: 'Workflow Builder',
    category: TOOLS_CATEGORIES.AI_TOOLS,
    description: 'Design and automate complex AI-powered workflows with visual editor',
    shortDescription: 'Build AI workflows',
  },
  {
    id: 'researcher-agent',
    name: 'Researcher Agent',
    category: TOOLS_CATEGORIES.AI_TOOLS,
    description: 'AI-powered research assistant for deep analysis and information gathering',
    shortDescription: 'AI research assistant',
  },
  {
    id: 'ai-chat',
    name: 'AI Chat',
    category: TOOLS_CATEGORIES.AI_TOOLS,
    description:
      'Chat with any AI model using your own API credentials. Supports OpenAI, Anthropic, Google Gemini, Groq, Mistral, Azure, AWS Bedrock, and Ollama.',
    shortDescription: 'Chat with AI models',
  },
  {
    id: 'code-generator',
    name: 'Code Generator',
    category: TOOLS_CATEGORIES.AI_TOOLS,
    description:
      'Generate production-ready code from natural language descriptions using AI. Supports all major programming languages.',
    shortDescription: 'Generate code with AI',
  },
  {
    id: 'ai-code-reviewer',
    name: 'AI Code Reviewer',
    category: TOOLS_CATEGORIES.AI_TOOLS,
    description:
      'Automated code review with AI-powered suggestions for bugs, security vulnerabilities, performance issues, and maintainability.',
    shortDescription: 'AI code review',
  },
  {
    id: 'ai-doc-generator',
    name: 'AI Documentation Generator',
    category: TOOLS_CATEGORIES.AI_TOOLS,
    description:
      'Generate comprehensive API docs, README files, and inline comments from source code using AI.',
    shortDescription: 'Generate docs with AI',
  },
  {
    id: 'ai-test-generator',
    name: 'AI Test Generator',
    category: TOOLS_CATEGORIES.AI_TOOLS,
    description:
      'Automatically generate unit tests and test suites from your code using AI. Covers happy path, edge cases, and error scenarios.',
    shortDescription: 'Generate tests with AI',
  },
  {
    id: 'ai-sql-builder',
    name: 'AI SQL Query Builder',
    category: TOOLS_CATEGORIES.AI_TOOLS,
    description:
      'Build complex SQL queries from natural language descriptions using AI. Supports PostgreSQL, MySQL, SQLite, MSSQL, and more.',
    shortDescription: 'Build SQL with AI',
  },
  {
    id: 'ai-schema-generator',
    name: 'AI Schema Generator',
    category: TOOLS_CATEGORIES.AI_TOOLS,
    description:
      'Generate JSON Schema, database schemas, or OpenAPI specs from sample data or natural language descriptions with AI.',
    shortDescription: 'Generate schemas with AI',
  },
  {
    id: 'content-summarizer',
    name: 'Content Summarizer',
    category: TOOLS_CATEGORIES.AI_TOOLS,
    description:
      'Automatically summarize long documents, articles, and transcripts using AI with configurable summary length.',
    shortDescription: 'Summarize content with AI',
  },
  {
    id: 'sentiment-analyzer',
    name: 'Sentiment Analyzer',
    category: TOOLS_CATEGORIES.AI_TOOLS,
    description:
      'Analyze sentiment and emotion from text using AI. Returns overall sentiment, confidence score, and key emotional signals.',
    shortDescription: 'Analyze sentiment with AI',
  },

  // Developer Tools
  {
    id: 'rest-api-tester',
    name: 'REST API Tester',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description: 'Test REST APIs with custom headers, authentication, and request body',
    shortDescription: 'Test REST APIs',
  },
  {
    id: 'diff-checker',
    name: 'Diff Checker',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description: 'Compare two texts and highlight differences',
    shortDescription: 'Check differences',
  },
  {
    id: 'jwt-decoder',
    name: 'JWT Decoder',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description: 'Decode and inspect JWT tokens',
    shortDescription: 'Decode JWT',
  },
  {
    id: 'base64-encoder-decoder',
    name: 'Base64 Encoder/Decoder',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description: 'Encode text to Base64 format or decode Base64 back to plain text',
    shortDescription: 'Encode/decode Base64',
  },
  {
    id: 'color-code-picker',
    name: 'Color Code Picker',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description: 'Convert between HEX, RGB, and HSL color formats',
    shortDescription: 'Pick color codes',
  },
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description: 'Generate cryptographic hashes (MD5, SHA1, SHA256, SHA512) from text',
    shortDescription: 'Generate hashes',
  },
  {
    id: 'uuid-generator',
    name: 'UUID Generator',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description: 'Generate UUID v4 identifiers for your applications',
    shortDescription: 'Generate UUIDs',
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description: 'Generate strong and secure passwords with customizable options',
    shortDescription: 'Generate passwords',
  },
  {
    id: 'qr-code-generator',
    name: 'QR Code Generator',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description: 'Generate QR codes from any text, URL, or data instantly',
    shortDescription: 'Generate QR codes',
  },
  {
    id: 'favicon-generator',
    name: 'Favicon Generator',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description:
      'Upload a PNG, JPEG, JPG, or WebP image and generate favicons in all standard sizes',
    shortDescription: 'Generate favicons from image',
  },
  {
    id: 'mock-data-generator',
    name: 'Mock Data Generator',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description:
      'Generate realistic mock data for testing across multiple categories (Person, Text, Web, Location, Time, Finance, Miscellaneous)',
    shortDescription: 'Generate mock test data',
  },
  {
    id: 'json-generator',
    name: 'JSON Generator',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description: 'Generate valid JSON with random data',
    shortDescription: 'Generate JSON',
  },
  {
    id: 'svg-viewer',
    name: 'SVG Viewer',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description: 'Paste or upload SVG code and see a live rendered preview with source editing',
    shortDescription: 'View and edit SVG',
  },
  {
    id: 'url-splitter',
    name: 'URL Splitter',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description: 'Parse and decompose URLs into components',
    shortDescription: 'Split URLs',
  },
  {
    id: 'code-cleaner',
    name: 'Code Cleaner',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description: 'Remove comments and unnecessary whitespace from code',
    shortDescription: 'Clean code',
  },
  {
    id: 'mime-type-checker',
    name: 'MIME Type Checker',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description: 'Identify MIME types by file extension',
    shortDescription: 'Check MIME types',
  },
  {
    id: 'public-ip-lookup',
    name: 'Public IP Lookup',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description: 'Get your public IP address instantly with geolocation details',
    shortDescription: 'Find your public IP',
  },
  {
    id: 'cron-expression-builder',
    name: 'Cron Expression Builder',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description:
      'Build, parse, and describe cron expressions visually. Enter fields or use the visual selector, get a human-readable description, and see the next N run times.',
    shortDescription: 'Build and parse cron expressions',
  },
  {
    id: 'jwt-generator',
    name: 'JWT Generator',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description:
      'Generate signed JWT tokens with custom payload using HS256 or HS512 algorithms. Complement to the existing JWT Decoder.',
    shortDescription: 'Generate signed JWTs',
  },
  {
    id: 'url-builder',
    name: 'URL Builder',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description:
      'Build URLs visually by filling in protocol, host, path, and query parameters as key-value rows. Live URL preview updates as fields change.',
    shortDescription: 'Build URLs from components',
  },
  {
    id: 'query-string-parser',
    name: 'Query String Parser',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description:
      'Parse a raw query string or full URL into a formatted key-value table. Handles arrays, encoded values, and duplicate keys.',
    shortDescription: 'Parse query strings',
  },
  {
    id: 'word-counter',
    name: 'Word & Character Counter',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description:
      'Live text statistics: word count, character count, characters without spaces, sentence count, paragraph count, and estimated reading time.',
    shortDescription: 'Count words and characters',
  },
  {
    id: 'lorem-ipsum-generator',
    name: 'Lorem Ipsum Generator',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description:
      'Generate lorem ipsum placeholder text by paragraph, sentence, or word count. Choose classic latin or random English words.',
    shortDescription: 'Generate placeholder text',
  },

  // Formatter Tools
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    category: TOOLS_CATEGORIES.FORMATTER,
    description: 'Format and beautify JSON with custom indentation',
    shortDescription: 'Format JSON',
  },
  {
    id: 'json-minifier',
    name: 'JSON Minifier',
    category: TOOLS_CATEGORIES.FORMATTER,
    description: 'Minify JSON to reduce file size',
    shortDescription: 'Minify JSON',
  },
  {
    id: 'sql-formatter',
    name: 'SQL Formatter',
    category: TOOLS_CATEGORIES.FORMATTER,
    description: 'Format SQL queries with proper indentation',
    shortDescription: 'Format SQL',
  },
  {
    id: 'xml-formatter',
    name: 'XML Formatter',
    category: TOOLS_CATEGORIES.FORMATTER,
    description: 'Format and indent XML code',
    shortDescription: 'Format XML',
  },
  {
    id: 'html-formatter',
    name: 'HTML Formatter',
    category: TOOLS_CATEGORIES.FORMATTER,
    description: 'Format and beautify HTML with consistent indentation',
    shortDescription: 'Format HTML',
  },
  {
    id: 'js-beautifier',
    name: 'JavaScript Beautifier',
    category: TOOLS_CATEGORIES.FORMATTER,
    description: 'Format and beautify JavaScript code',
    shortDescription: 'Beautify JavaScript',
  },
  {
    id: 'js-minifier',
    name: 'JavaScript Minifier',
    category: TOOLS_CATEGORIES.FORMATTER,
    description: 'Minify JavaScript code to reduce file size',
    shortDescription: 'Minify JavaScript',
  },
  {
    id: 'css-beautifier',
    name: 'CSS Beautifier',
    category: TOOLS_CATEGORIES.FORMATTER,
    description: 'Format and beautify CSS code',
    shortDescription: 'Beautify CSS',
  },
  {
    id: 'css-minifier',
    name: 'CSS Minifier',
    category: TOOLS_CATEGORIES.FORMATTER,
    description: 'Minify CSS code to reduce file size',
    shortDescription: 'Minify CSS',
  },

  // Converter Tools
  {
    id: 'html-to-markdown',
    name: 'HTML / Markdown Converter',
    category: TOOLS_CATEGORIES.CONVERTER,
    description:
      'Convert HTML pages or snippets to clean Markdown text, or render Markdown to styled HTML',
    shortDescription: 'HTML <-> Markdown converter',
  },
  {
    id: 'docx-to-markdown',
    name: 'DOCX / Markdown Converter',
    category: TOOLS_CATEGORIES.CONVERTER,
    description:
      'Convert Microsoft Word (.docx) documents to Markdown format, or render Markdown source to a downloadable DOCX file',
    shortDescription: 'DOCX <-> Markdown converter',
  },
  {
    id: 'excel-to-markdown',
    name: 'Excel / CSV to Markdown',
    category: TOOLS_CATEGORIES.CONVERTER,
    description:
      'Convert Excel (.xlsx, .xls) or CSV files to Markdown tables. Supports multi-sheet workbooks with configurable header row counts per sheet.',
    shortDescription: 'Excel/CSV to Markdown tables',
  },
  {
    id: 'docx-to-pdf',
    name: 'DOCX to PDF',
    category: TOOLS_CATEGORIES.CONVERTER,
    description: 'Convert Microsoft Word (.docx) documents to PDF files server-side.',
    shortDescription: 'DOCX → PDF',
  },
  {
    id: 'image-to-pdf',
    name: 'Image to PDF',
    category: TOOLS_CATEGORIES.CONVERTER,
    description:
      'Convert PNG, JPG, or WebP images to a PDF file. Arrange multiple images, choose page size, and download as PDF.',
    shortDescription: 'Images → PDF',
  },
  {
    id: 'pdf-to-images',
    name: 'PDF to Images',
    category: TOOLS_CATEGORIES.CONVERTER,
    description:
      'Convert each page of a PDF to PNG or JPEG images. Choose output scale/resolution and download all pages.',
    shortDescription: 'PDF → PNG/JPEG images',
  },
  {
    id: 'pdf-to-markdown',
    name: 'PDF / Markdown Converter',
    category: TOOLS_CATEGORIES.CONVERTER,
    description:
      'Convert PDF files to Markdown text, or render Markdown source to a styled HTML preview and download as PDF',
    shortDescription: 'PDF ↔ Markdown converter',
  },
  {
    id: 'image-to-data-uri',
    name: 'Image / Data URI Converter',
    category: TOOLS_CATEGORIES.CONVERTER,
    description:
      'Convert image files to Base64 Data URI strings, or decode a Data URI back to a downloadable image',
    shortDescription: 'Image <-> Data URI',
  },
  {
    id: 'json-to-yaml',
    name: 'JSON to YAML',
    category: TOOLS_CATEGORIES.CONVERTER,
    description: 'Convert JSON to YAML format',
    shortDescription: 'JSON to YAML',
  },
  {
    id: 'excel-to-json',
    name: 'Excel / CSV to JSON',
    category: TOOLS_CATEGORIES.CONVERTER,
    description:
      'Convert Excel (.xlsx, .xls) or CSV files to structured JSON. Supports multi-sheet workbooks with configurable header row counts per sheet.',
    shortDescription: 'Excel/CSV to JSON',
  },
  {
    id: 'yaml-to-json',
    name: 'YAML to JSON',
    category: TOOLS_CATEGORIES.CONVERTER,
    description: 'Convert YAML to JSON format',
    shortDescription: 'YAML to JSON',
  },
  {
    id: 'json-to-xml',
    name: 'JSON to XML',
    category: TOOLS_CATEGORIES.CONVERTER,
    description: 'Convert JSON data to XML format',
    shortDescription: 'JSON to XML',
  },
  {
    id: 'xml-to-json',
    name: 'XML to JSON',
    category: TOOLS_CATEGORIES.CONVERTER,
    description: 'Convert XML data to JSON format',
    shortDescription: 'XML to JSON',
  },
  {
    id: 'xml-to-yaml',
    name: 'XML to YAML',
    category: TOOLS_CATEGORIES.CONVERTER,
    description: 'Convert XML data to YAML format',
    shortDescription: 'XML to YAML',
  },
  {
    id: 'csv-converter',
    name: 'CSV Converter',
    category: TOOLS_CATEGORIES.CONVERTER,
    description: 'Convert CSV data to JSON, XML, YAML, or SQL INSERT statements',
    shortDescription: 'Convert CSV to any format',
  },
  {
    id: 'json-to-java',
    name: 'JSON to Java',
    category: TOOLS_CATEGORIES.CONVERTER,
    description: 'Convert JSON to Java POJO classes',
    shortDescription: 'JSON to Java',
  },
  {
    id: 'json-to-php',
    name: 'JSON to PHP',
    category: TOOLS_CATEGORIES.CONVERTER,
    description: 'Convert JSON to PHP array syntax',
    shortDescription: 'JSON to PHP',
  },
  {
    id: 'json-to-csharp',
    name: 'JSON to C#',
    category: TOOLS_CATEGORIES.CONVERTER,
    description: 'Convert JSON to C# class definitions',
    shortDescription: 'JSON to C#',
  },
  {
    id: 'sql-to-mongodb',
    name: 'SQL to MongoDB',
    category: TOOLS_CATEGORIES.CONVERTER,
    description:
      'Convert SQL SELECT, INSERT, UPDATE, and DELETE queries to equivalent MongoDB operations',
    shortDescription: 'SQL to MongoDB query',
  },

  {
    id: 'ini-converter',
    name: 'INI Converter',
    category: TOOLS_CATEGORIES.CONVERTER,
    description: 'Convert INI configuration to JSON, XML, or YAML',
    shortDescription: 'Convert INI to any format',
  },

  {
    id: 'timestamp-converter',
    name: 'Timestamp Converter',
    category: TOOLS_CATEGORIES.CONVERTER,
    description: 'Convert between Unix timestamps and readable dates',
    shortDescription: 'Convert timestamps',
  },
  {
    id: 'unit-converter',
    name: 'Unit Converter',
    category: TOOLS_CATEGORIES.CONVERTER,
    description:
      'Convert between different units of measurement (length, weight, temperature, etc.)',
    shortDescription: 'Convert units',
  },
  {
    id: 'currency-converter',
    name: 'Currency Converter',
    category: TOOLS_CATEGORIES.CONVERTER,
    description: 'Convert between different currencies with real-time exchange rates',
    shortDescription: 'Convert currency',
  },
  {
    id: 'text-case-converter',
    name: 'Text Case Converter',
    category: TOOLS_CATEGORIES.CONVERTER,
    description:
      'Convert text between different cases (uppercase, lowercase, camelCase, snake_case, etc.)',
    shortDescription: 'Convert text case',
  },
  {
    id: 'url-encoder-decoder',
    name: 'URL Encoder/Decoder',
    category: TOOLS_CATEGORIES.CONVERTER,
    description: 'Encode and decode URLs and special characters',
    shortDescription: 'Encode/decode URLs',
  },
  {
    id: 'html-encoder-decoder',
    name: 'HTML Encoder/Decoder',
    category: TOOLS_CATEGORIES.CONVERTER,
    description: 'Encode and decode HTML entities',
    shortDescription: 'Encode/decode HTML',
  },
  {
    id: 'js-string-escaper',
    name: 'JavaScript String Escaper',
    category: TOOLS_CATEGORIES.CONVERTER,
    description: 'Escape special characters in JavaScript strings',
    shortDescription: 'Escape JS strings',
  },
  {
    id: 'xml-string-escaper',
    name: 'XML String Escaper',
    category: TOOLS_CATEGORIES.CONVERTER,
    description: 'Escape special characters in XML strings',
    shortDescription: 'Escape XML strings',
  },
  {
    id: 'idn-converter',
    name: 'IDN Converter',
    category: TOOLS_CATEGORIES.CONVERTER,
    description: 'Convert between Unicode and Punycode domain names',
    shortDescription: 'Convert IDN',
  },

  // Validation Tools
  {
    id: 'json-schema-validator',
    name: 'JSON Schema Validator',
    category: TOOLS_CATEGORIES.VALIDATION,
    description:
      'Validate a JSON document against a JSON Schema. Shows all validation errors with property paths.',
    shortDescription: 'Validate JSON against schema',
  },
  {
    id: 'json-schema-generator',
    name: 'JSON Schema Generator',
    category: TOOLS_CATEGORIES.VALIDATION,
    description:
      'Infer a JSON Schema from a sample JSON document. Produces a draft-07 schema with types, required fields, and nested object definitions.',
    shortDescription: 'Generate schema from JSON',
  },
  {
    id: 'regex-parser',
    name: 'Regex Parser',
    category: TOOLS_CATEGORIES.VALIDATION,
    description: 'Test and validate regular expressions',
    shortDescription: 'Parse regex',
  },
  {
    id: 'json-path-evaluator',
    name: 'JSONPath Evaluator',
    category: TOOLS_CATEGORIES.VALIDATION,
    description: 'Query JSON data using JSONPath expressions and see all matching results',
    shortDescription: 'Evaluate JSONPath',
  },
  {
    id: 'jsonpath-finder',
    name: 'JSONPath Finder',
    category: TOOLS_CATEGORIES.VALIDATION,
    description:
      'Find and extract all matching values and their paths from a JSON document using JSONPath expressions',
    shortDescription: 'Find JSONPath matches',
  },
  {
    id: 'xpath-evaluator',
    name: 'XPath Evaluator',
    category: TOOLS_CATEGORIES.VALIDATION,
    description: 'Query XML documents using XPath expressions and see all matching nodes',
    shortDescription: 'Evaluate XPath',
  },
  {
    id: 'html-validator',
    name: 'HTML Validator',
    category: TOOLS_CATEGORIES.VALIDATION,
    description: 'Validate HTML markup and check for errors',
    shortDescription: 'Validate HTML',
  },
  {
    id: 'yaml-validator',
    name: 'YAML Validator',
    category: TOOLS_CATEGORIES.VALIDATION,
    description: 'Validate YAML syntax and structure',
    shortDescription: 'Validate YAML',
  },
  {
    id: 'js-validator',
    name: 'JavaScript Validator',
    category: TOOLS_CATEGORIES.VALIDATION,
    description: 'Validate JavaScript code syntax',
    shortDescription: 'Validate JavaScript',
  },
  {
    id: 'redirection-checker',
    name: 'Redirection Checker',
    category: TOOLS_CATEGORIES.VALIDATION,
    description: 'Follow HTTP redirects and check final URL',
    shortDescription: 'Check redirects',
  },
  {
    id: 'link-checker',
    name: 'Link Checker',
    category: TOOLS_CATEGORIES.VALIDATION,
    description:
      'Check if a list of URLs are reachable and see their HTTP status codes and response times',
    shortDescription: 'Check links',
  },

  // Utilities
  {
    id: 'pdf-editor',
    name: 'PDF Editor',
    category: TOOLS_CATEGORIES.UTILITIES,
    description:
      'Edit PDF files: add text and image annotations, rotate or delete pages, merge multiple PDFs into one, or split a PDF by page ranges.',
    shortDescription: 'Edit, merge, and split PDFs',
  },
  {
    id: 'notes',
    name: 'Notes',
    category: TOOLS_CATEGORIES.UTILITIES,
    description: 'Simple text notes that persist in your browser using local storage',
    shortDescription: 'Save notes locally',
  },
  {
    id: 'stopwatch',
    name: 'Stopwatch',
    category: TOOLS_CATEGORIES.UTILITIES,
    description:
      'Stopwatch with lap tracking, fastest/slowest lap highlights, and local storage persistence',
    shortDescription: 'Stopwatch with laps',
  },
  {
    id: 'counter',
    name: 'Counter',
    category: TOOLS_CATEGORIES.UTILITIES,
    description:
      'Multiple counters with custom names, configurable step size, increment/decrement/reset, saved to local storage',
    shortDescription: 'Multi-counter with persistence',
  },
] as const satisfies Tool[]
