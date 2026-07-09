export const TOOLS_CATEGORIES = {
  DEVELOPER: 'developer',
  VALIDATION: 'validation',
  FORMATTER: 'formatter',
  CONVERTER: 'converter',
  AI_TOOLS: 'ai-tools',
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
  [TOOLS_CATEGORIES.DEVELOPER]: {
    name: 'Developer Tools',
    description: 'Essential utilities for development and debugging',
    icon: 'Code',
  },
  [TOOLS_CATEGORIES.VALIDATION]: {
    name: 'Validation Tools',
    description: 'Validate and parse code and data formats',
    icon: 'CheckCircle',
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
  [TOOLS_CATEGORIES.AI_TOOLS]: {
    name: 'AI Tools',
    description: 'AI-powered utilities for enhanced productivity',
    icon: 'Sparkles',
  },
} as const

export const TOOLS = [
  // Developer Tools
  {
    id: 'rest-api-tester',
    name: 'REST API Tester',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description: 'Test REST APIs with custom headers, authentication, and request body',
    shortDescription: 'Test REST APIs',
  },
  {
    id: 'js-minifier',
    name: 'JavaScript Minifier',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description: 'Minify JavaScript code to reduce file size',
    shortDescription: 'Minify JavaScript',
  },
  {
    id: 'js-beautifier',
    name: 'JavaScript Beautifier',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description: 'Format and beautify JavaScript code',
    shortDescription: 'Beautify JavaScript',
  },
  {
    id: 'css-minifier',
    name: 'CSS Minifier',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description: 'Minify CSS code to reduce file size',
    shortDescription: 'Minify CSS',
  },
  {
    id: 'css-beautifier',
    name: 'CSS Beautifier',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description: 'Format and beautify CSS code',
    shortDescription: 'Beautify CSS',
  },
  {
    id: 'json-minifier',
    name: 'JSON Minifier',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description: 'Minify JSON to reduce file size',
    shortDescription: 'Minify JSON',
  },
  {
    id: 'json-beautifier',
    name: 'JSON Beautifier',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description: 'Format and beautify JSON data',
    shortDescription: 'Beautify JSON',
  },
  {
    id: 'timestamp-converter',
    name: 'Timestamp Converter',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description: 'Convert between Unix timestamps and readable dates',
    shortDescription: 'Convert timestamps',
  },
  {
    id: 'json-generator',
    name: 'JSON Generator',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description: 'Generate valid JSON with random data',
    shortDescription: 'Generate JSON',
  },
  {
    id: 'color-code-picker',
    name: 'Color Code Picker',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description: 'Convert between HEX, RGB, and HSL color formats',
    shortDescription: 'Pick color codes',
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
    id: 'diff-checker',
    name: 'Diff Checker',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description: 'Compare two texts and highlight differences',
    shortDescription: 'Check differences',
  },
  {
    id: 'url-encoder-decoder',
    name: 'URL Encoder/Decoder',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description: 'Encode and decode URLs and special characters',
    shortDescription: 'Encode/decode URLs',
  },
  {
    id: 'mime-type-checker',
    name: 'MIME Type Checker',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description: 'Identify MIME types by file extension',
    shortDescription: 'Check MIME types',
  },
  {
    id: 'html-encoder-decoder',
    name: 'HTML Encoder/Decoder',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description: 'Encode and decode HTML entities',
    shortDescription: 'Encode/decode HTML',
  },
  {
    id: 'js-string-escaper',
    name: 'JavaScript String Escaper',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description: 'Escape special characters in JavaScript strings',
    shortDescription: 'Escape JS strings',
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
    id: 'jwt-decoder',
    name: 'JWT Decoder',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description: 'Decode and inspect JWT tokens',
    shortDescription: 'Decode JWT',
  },
  {
    id: 'xml-string-escaper',
    name: 'XML String Escaper',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description: 'Escape special characters in XML strings',
    shortDescription: 'Escape XML strings',
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
    id: 'jsonpath-finder',
    name: 'JSONPath Finder',
    category: TOOLS_CATEGORIES.VALIDATION,
    description:
      'Find and extract all matching values and their paths from a JSON document using JSONPath expressions',
    shortDescription: 'Find JSONPath matches',
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

  // Formatter Tools
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    category: TOOLS_CATEGORIES.FORMATTER,
    description: 'Format JSON with custom indentation',
    shortDescription: 'Format JSON',
  },
  {
    id: 'xml-formatter',
    name: 'XML Formatter',
    category: TOOLS_CATEGORIES.FORMATTER,
    description: 'Format and indent XML code',
    shortDescription: 'Format XML',
  },
  {
    id: 'sql-formatter',
    name: 'SQL Formatter',
    category: TOOLS_CATEGORIES.FORMATTER,
    description: 'Format SQL queries with proper indentation',
    shortDescription: 'Format SQL',
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

  // Converter Tools
  {
    id: 'json-to-java',
    name: 'JSON to Java',
    category: TOOLS_CATEGORIES.CONVERTER,
    description: 'Convert JSON to Java POJO classes',
    shortDescription: 'JSON to Java',
  },
  {
    id: 'json-to-xml',
    name: 'JSON to XML',
    category: TOOLS_CATEGORIES.CONVERTER,
    description: 'Convert JSON data to XML format',
    shortDescription: 'JSON to XML',
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
    id: 'xml-to-yaml',
    name: 'XML to YAML',
    category: TOOLS_CATEGORIES.CONVERTER,
    description: 'Convert XML data to YAML format',
    shortDescription: 'XML to YAML',
  },
  {
    id: 'xml-to-json',
    name: 'XML to JSON',
    category: TOOLS_CATEGORIES.CONVERTER,
    description: 'Convert XML data to JSON format',
    shortDescription: 'XML to JSON',
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
    id: 'image-to-data-uri',
    name: 'Image / Data URI Converter',
    category: TOOLS_CATEGORIES.CONVERTER,
    description:
      'Convert image files to Base64 Data URI strings, or decode a Data URI back to a downloadable image',
    shortDescription: 'Image <-> Data URI',
  },
  {
    id: 'yaml-to-json',
    name: 'YAML to JSON',
    category: TOOLS_CATEGORIES.CONVERTER,
    description: 'Convert YAML to JSON format',
    shortDescription: 'YAML to JSON',
  },
  {
    id: 'json-to-yaml',
    name: 'JSON to YAML',
    category: TOOLS_CATEGORIES.CONVERTER,
    description: 'Convert JSON to YAML format',
    shortDescription: 'JSON to YAML',
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
    id: 'idn-converter',
    name: 'IDN Converter',
    category: TOOLS_CATEGORIES.CONVERTER,
    description: 'Convert between Unicode and Punycode domain names',
    shortDescription: 'Convert IDN',
  },

  // Document Converter Tools
  {
    id: 'image-to-pdf',
    name: 'Image to PDF',
    category: TOOLS_CATEGORIES.CONVERTER,
    description: 'Convert PNG, JPG, or WebP images to a PDF file. Arrange multiple images, choose page size, and download as PDF.',
    shortDescription: 'Images → PDF',
  },
  {
    id: 'pdf-to-images',
    name: 'PDF to Images',
    category: TOOLS_CATEGORIES.CONVERTER,
    description: 'Convert each page of a PDF to PNG or JPEG images. Choose output scale/resolution and download all pages.',
    shortDescription: 'PDF → PNG/JPEG images',
  },
  {
    id: 'docx-to-pdf',
    name: 'DOCX to PDF',
    category: TOOLS_CATEGORIES.CONVERTER,
    description: 'Convert Microsoft Word (.docx) documents to PDF files server-side.',
    shortDescription: 'DOCX → PDF',
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
    id: 'docx-to-markdown',
    name: 'DOCX / Markdown Converter',
    category: TOOLS_CATEGORIES.CONVERTER,
    description:
      'Convert Microsoft Word (.docx) documents to Markdown format, or render Markdown source to a downloadable DOCX file',
    shortDescription: 'DOCX <-> Markdown converter',
  },
  {
    id: 'html-to-markdown',
    name: 'HTML / Markdown Converter',
    category: TOOLS_CATEGORIES.CONVERTER,
    description:
      'Convert HTML pages or snippets to clean Markdown text, or render Markdown to styled HTML',
    shortDescription: 'HTML <-> Markdown converter',
  },

  // AI Tools
  {
    id: 'chatbot-builder',
    name: 'Chatbot Builder',
    category: TOOLS_CATEGORIES.AI_TOOLS,
    description: 'Create intelligent conversational AI chatbots with custom training data',
    shortDescription: 'Build AI chatbots',
    comingSoon: true,
  },
  {
    id: 'workflow-builder',
    name: 'Workflow Builder',
    category: TOOLS_CATEGORIES.AI_TOOLS,
    description: 'Design and automate complex AI-powered workflows with visual editor',
    shortDescription: 'Build AI workflows',
    comingSoon: true,
  },
  {
    id: 'researcher-agent',
    name: 'Researcher Agent',
    category: TOOLS_CATEGORIES.AI_TOOLS,
    description: 'AI-powered research assistant for deep analysis and information gathering',
    shortDescription: 'AI research assistant',
    comingSoon: true,
  },
  {
    id: 'code-generator',
    name: 'Code Generator',
    category: TOOLS_CATEGORIES.AI_TOOLS,
    description: 'Generate production-ready code from natural language descriptions',
    shortDescription: 'Generate code with AI',
    comingSoon: true,
  },
  {
    id: 'content-summarizer',
    name: 'Content Summarizer',
    category: TOOLS_CATEGORIES.AI_TOOLS,
    description: 'Automatically summarize long documents, articles, and transcripts',
    shortDescription: 'Summarize content',
    comingSoon: true,
  },
  {
    id: 'sentiment-analyzer',
    name: 'Sentiment Analyzer',
    category: TOOLS_CATEGORIES.AI_TOOLS,
    description: 'Analyze sentiment and emotion from text data with AI',
    shortDescription: 'Analyze sentiment',
    comingSoon: true,
  },
  {
    id: 'image-analyzer',
    name: 'Image Analyzer',
    category: TOOLS_CATEGORIES.AI_TOOLS,
    description: 'Extract insights and descriptions from images using AI vision',
    shortDescription: 'Analyze images',
    comingSoon: true,
  },
  {
    id: 'data-insights',
    name: 'Data Insights',
    category: TOOLS_CATEGORIES.AI_TOOLS,
    description: 'Gain AI-powered insights from datasets with automated analysis',
    shortDescription: 'AI data insights',
    comingSoon: true,
  },
  {
    id: 'ai-code-reviewer',
    name: 'AI Code Reviewer',
    category: TOOLS_CATEGORIES.AI_TOOLS,
    description:
      'Automated code review with AI-powered suggestions for improvements, bug detection, and security issues',
    shortDescription: 'AI code review',
    comingSoon: true,
  },
  {
    id: 'ai-doc-generator',
    name: 'AI Documentation Generator',
    category: TOOLS_CATEGORIES.AI_TOOLS,
    description:
      'Generate comprehensive API docs, README files, and inline comments from source code with AI',
    shortDescription: 'Generate docs with AI',
    comingSoon: true,
  },
  {
    id: 'ai-test-generator',
    name: 'AI Test Generator',
    category: TOOLS_CATEGORIES.AI_TOOLS,
    description: 'Automatically generate unit tests and test suites from your code using AI',
    shortDescription: 'Generate tests with AI',
    comingSoon: true,
  },
  {
    id: 'ai-regex-generator',
    name: 'AI Regex Generator',
    category: TOOLS_CATEGORIES.AI_TOOLS,
    description:
      'Describe what you want to match in plain English and get a working regular expression with AI',
    shortDescription: 'Generate regex with AI',
    comingSoon: true,
  },
  {
    id: 'ai-sql-builder',
    name: 'AI SQL Query Builder',
    category: TOOLS_CATEGORIES.AI_TOOLS,
    description: 'Build complex SQL queries from natural language descriptions using AI',
    shortDescription: 'Build SQL with AI',
    comingSoon: true,
  },
  {
    id: 'ai-commit-message',
    name: 'AI Commit Message Generator',
    category: TOOLS_CATEGORIES.AI_TOOLS,
    description:
      'Paste your git diff and get meaningful, conventional commit messages generated by AI',
    shortDescription: 'Generate commit messages',
    comingSoon: true,
  },
  {
    id: 'ai-schema-generator',
    name: 'AI Schema Generator',
    category: TOOLS_CATEGORIES.AI_TOOLS,
    description:
      'Generate JSON Schema, database schemas, or OpenAPI specs from sample data or natural language descriptions with AI',
    shortDescription: 'Generate schemas with AI',
    comingSoon: true,
  },

  // Spreadsheet Converter Tools
  {
    id: 'excel-to-json',
    name: 'Excel / CSV to JSON',
    category: TOOLS_CATEGORIES.CONVERTER,
    description:
      'Convert Excel (.xlsx, .xls) or CSV files to structured JSON. Supports multi-sheet workbooks with configurable header row counts per sheet.',
    shortDescription: 'Excel/CSV to JSON',
  },
  {
    id: 'excel-to-markdown',
    name: 'Excel / CSV to Markdown',
    category: TOOLS_CATEGORIES.CONVERTER,
    description:
      'Convert Excel (.xlsx, .xls) or CSV files to Markdown tables. Supports multi-sheet workbooks with configurable header row counts per sheet.',
    shortDescription: 'Excel/CSV to Markdown tables',
  },

  // Additional Developer Tools
  {
    id: 'public-ip-lookup',
    name: 'Public IP Lookup',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description: 'Get your public IP address instantly with geolocation details',
    shortDescription: 'Find your public IP',
  },
  {
    id: 'text-case-converter',
    name: 'Text Case Converter',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description:
      'Convert text between different cases (uppercase, lowercase, camelCase, snake_case, etc.)',
    shortDescription: 'Convert text case',
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
    id: 'uuid-generator',
    name: 'UUID Generator',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description: 'Generate UUID v4 identifiers for your applications',
    shortDescription: 'Generate UUIDs',
  },
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description: 'Generate cryptographic hashes (MD5, SHA1, SHA256, SHA512) from text',
    shortDescription: 'Generate hashes',
  },
  {
    id: 'currency-converter',
    name: 'Currency Converter',
    category: TOOLS_CATEGORIES.CONVERTER,
    description: 'Convert between different currencies with real-time exchange rates',
    shortDescription: 'Convert currency',
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description: 'Generate strong and secure passwords with customizable options',
    shortDescription: 'Generate passwords',
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
    id: 'notes',
    name: 'Notes',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description: 'Simple text notes that persist in your browser using local storage',
    shortDescription: 'Save notes locally',
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
    id: 'pdf-editor',
    name: 'PDF Editor',
    category: TOOLS_CATEGORIES.DEVELOPER,
    description:
      'Edit PDF files: add text and image annotations, rotate or delete pages, merge multiple PDFs into one, or split a PDF by page ranges.',
    shortDescription: 'Edit, merge, and split PDFs',
  },
] as const satisfies Tool[]
