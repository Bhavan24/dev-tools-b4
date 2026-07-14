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
    id: 'base64-encoder',
    name: 'Base64 Encoder',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description: 'Encode text to Base64 format',
    shortDescription: 'Encode to Base64',
  },
  {
    id: 'base64-decoder',
    name: 'Base64 Decoder',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description: 'Decode Base64 text back to plain text',
    shortDescription: 'Decode Base64',
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
    id: 'business-day-calculator',
    name: 'Business Day Calculator',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description:
      'Add or subtract N business days from a start date, with optional holiday list to skip. Returns the result date and calendar day count.',
    shortDescription: 'Add/subtract business days',
  },
  {
    id: 'relative-date-calculator',
    name: 'Relative Date Calculator',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description:
      'Calculate the difference between two dates, or find what date is N days from a given date. Outputs days, weeks, months, and years.',
    shortDescription: 'Calculate date differences',
  },
  {
    id: 'age-calculator',
    name: 'Age Calculator',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description:
      'Input a birthdate and get exact age in years, months, and days, plus total days lived and days until the next birthday.',
    shortDescription: 'Calculate exact age',
  },
  {
    id: 'env-file-parser',
    name: 'Env File Parser',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description:
      'Parse a .env file into a key-value table. Detects duplicates, empty values, missing equals signs, and quoted strings.',
    shortDescription: 'Parse .env files',
  },
  {
    id: 'gitignore-generator',
    name: 'Gitignore Generator',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description:
      'Select languages, frameworks, and editors to generate a .gitignore file from curated templates. Supports Node, Python, Go, Rust, VSCode, JetBrains, and more.',
    shortDescription: 'Generate .gitignore from templates',
  },
  {
    id: 'conventional-commit-generator',
    name: 'Conventional Commit Generator',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description:
      'Fill in type, scope, description, body, breaking change, and issue references; outputs a properly formatted Conventional Commit message.',
    shortDescription: 'Generate conventional commit messages',
  },

  // Phase 4 - Security & Cryptography
  {
    id: 'hmac-generator',
    name: 'HMAC Generator',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description:
      'Generate HMAC signatures using a secret key and algorithm (SHA-256, SHA-512, SHA-1, MD5). Supports hex and base64 output. Useful for API request signing (AWS, Stripe, webhooks).',
    shortDescription: 'Generate HMAC signatures',
  },
  {
    id: 'bcrypt-tool',
    name: 'BCrypt Generator/Verifier',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description:
      'Hash a plain-text password using bcrypt with a configurable cost factor, or verify a password against an existing bcrypt hash.',
    shortDescription: 'Hash and verify passwords with bcrypt',
  },
  {
    id: 'file-hash-checker',
    name: 'File Hash Checker',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description:
      'Drop a file to compute its MD5, SHA-1, SHA-256, and SHA-512 hashes directly in the browser. No file is uploaded to the server.',
    shortDescription: 'Compute file hashes in-browser',
  },
  {
    id: 'rsa-aes-tool',
    name: 'RSA / AES Encrypt & Decrypt',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description:
      'Generate RSA key pairs and encrypt/decrypt text with RSA-OAEP, or encrypt/decrypt with AES-GCM using a passphrase. All operations run client-side in the browser.',
    shortDescription: 'RSA and AES encrypt/decrypt',
  },

  // Phase 5 - Networking & Infrastructure
  {
    id: 'dns-lookup',
    name: 'DNS Lookup',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description:
      'Query DNS records (A, AAAA, MX, TXT, CNAME, NS, SOA) for any domain using Cloudflare DNS-over-HTTPS. Supports querying individual record types or all at once.',
    shortDescription: 'Query DNS records for a domain',
  },
  {
    id: 'whois-lookup',
    name: 'WHOIS Lookup',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description:
      'Look up domain registration information via RDAP: registrar, creation/expiry dates, nameservers, and status flags.',
    shortDescription: 'Domain registration info via RDAP',
  },
  {
    id: 'ssl-checker',
    name: 'SSL Certificate Checker',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description:
      'Inspect the TLS/SSL certificate for any domain: issuer, subject, validity dates, days until expiry, SANs, and fingerprint.',
    shortDescription: 'Inspect TLS certificate details',
  },
  {
    id: 'cidr-calculator',
    name: 'CIDR Calculator',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description:
      'Input a CIDR block and get the network address, broadcast address, subnet mask, wildcard mask, first/last host, usable host count, and IP class.',
    shortDescription: 'Calculate CIDR network details',
  },
  {
    id: 'ip-range-calculator',
    name: 'IP Range Calculator',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description:
      'Input a start and end IP address and compute the minimal set of CIDR blocks that exactly covers that range.',
    shortDescription: 'Convert IP range to CIDR blocks',
  },

  // Formatter Tools
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    category: TOOLS_CATEGORIES.FORMATTER,
    description: 'Format JSON with custom indentation',
    shortDescription: 'Format JSON',
  },
  {
    id: 'json-beautifier',
    name: 'JSON Beautifier',
    category: TOOLS_CATEGORIES.FORMATTER,
    description: 'Format and beautify JSON data',
    shortDescription: 'Beautify JSON',
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
    description: 'Format HTML with consistent indentation',
    shortDescription: 'Format HTML',
  },
  {
    id: 'html-beautifier',
    name: 'HTML Beautifier',
    category: TOOLS_CATEGORIES.FORMATTER,
    description: 'Beautify and clean up HTML code',
    shortDescription: 'Beautify HTML',
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
    id: 'csv-to-json',
    name: 'CSV to JSON',
    category: TOOLS_CATEGORIES.CONVERTER,
    description: 'Convert CSV data to JSON array',
    shortDescription: 'CSV to JSON',
  },
  {
    id: 'csv-to-xml',
    name: 'CSV to XML',
    category: TOOLS_CATEGORIES.CONVERTER,
    description: 'Convert CSV data to XML format',
    shortDescription: 'CSV to XML',
  },
  {
    id: 'csv-to-yaml',
    name: 'CSV to YAML',
    category: TOOLS_CATEGORIES.CONVERTER,
    description: 'Convert CSV data to YAML format',
    shortDescription: 'CSV to YAML',
  },
  {
    id: 'csv-to-sql',
    name: 'CSV to SQL',
    category: TOOLS_CATEGORIES.CONVERTER,
    description: 'Convert CSV data to SQL INSERT statements',
    shortDescription: 'CSV to SQL',
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
    id: 'ini-to-json',
    name: 'INI to JSON',
    category: TOOLS_CATEGORIES.CONVERTER,
    description: 'Convert INI configuration to JSON',
    shortDescription: 'INI to JSON',
  },
  {
    id: 'ini-to-xml',
    name: 'INI to XML',
    category: TOOLS_CATEGORIES.CONVERTER,
    description: 'Convert INI configuration to XML',
    shortDescription: 'INI to XML',
  },
  {
    id: 'ini-to-yaml',
    name: 'INI to YAML',
    category: TOOLS_CATEGORIES.CONVERTER,
    description: 'Convert INI configuration to YAML',
    shortDescription: 'INI to YAML',
  },

  {
    id: 'rgb-to-hex',
    name: 'RGB to HEX',
    category: TOOLS_CATEGORIES.CONVERTER,
    description: 'Convert RGB color values to HEX format',
    shortDescription: 'RGB to HEX',
  },
  {
    id: 'hex-to-rgb',
    name: 'HEX to RGB',
    category: TOOLS_CATEGORIES.CONVERTER,
    description: 'Convert HEX color values to RGB format',
    shortDescription: 'HEX to RGB',
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
    id: 'timezone-converter',
    name: 'Timezone Converter',
    category: TOOLS_CATEGORIES.CONVERTER,
    description:
      'Convert a datetime between any two IANA timezones with full DST-awareness. Outputs the converted time, UTC offset, and ISO 8601 UTC time.',
    shortDescription: 'Convert between timezones',
  },
  {
    id: 'iso8601-converter',
    name: 'ISO 8601 Converter',
    category: TOOLS_CATEGORIES.CONVERTER,
    description:
      'Convert any date/time string between ISO 8601, RFC 2822, human-readable, and Unix timestamp formats.',
    shortDescription: 'Convert date/time formats',
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
  {
    id: 'semver-comparator',
    name: 'Semver Comparator',
    category: TOOLS_CATEGORIES.VALIDATION,
    description:
      'Compare two semantic version strings and see which is higher and what changed (major, minor, patch, pre-release).',
    shortDescription: 'Compare semver versions',
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
