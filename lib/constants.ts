export const TOOLS_CATEGORIES = {
  UTILITY: 'utility',
  TESTING: 'testing',
  JSON: 'json',
  TEXT: 'text',
  TIME: 'time',
  FINANCE: 'finance',
  MISCELLANEOUS: 'miscellaneous',
} as const

export const CATEGORY_INFO = {
  [TOOLS_CATEGORIES.UTILITY]: {
    name: 'Utility',
    description: 'Essential utilities for everyday development tasks',
    icon: 'Zap',
  },
  [TOOLS_CATEGORIES.TESTING]: {
    name: 'Testing',
    description: 'Mock data generation and testing utilities',
    icon: 'Beaker',
  },
  [TOOLS_CATEGORIES.JSON]: {
    name: 'JSON',
    description: 'JSON formatting, parsing, and validation tools',
    icon: 'Code2',
  },
  [TOOLS_CATEGORIES.TEXT]: {
    name: 'Text',
    description: 'Text manipulation and conversion utilities',
    icon: 'Type',
  },
  [TOOLS_CATEGORIES.TIME]: {
    name: 'Time',
    description: 'Timestamp and date conversion tools',
    icon: 'Clock',
  },
  [TOOLS_CATEGORIES.FINANCE]: {
    name: 'Finance',
    description: 'Currency and financial calculation tools',
    icon: 'DollarSign',
  },
  [TOOLS_CATEGORIES.MISCELLANEOUS]: {
    name: 'Miscellaneous',
    description: 'Other useful developer tools',
    icon: 'MoreHorizontal',
  },
} as const

export const TOOLS = [
  {
    id: 'public-ip',
    name: 'Public IP Lookup',
    category: TOOLS_CATEGORIES.UTILITY,
    description: 'Get your public IP address instantly',
    shortDescription: 'Find your public IP',
  },
  {
    id: 'timestamp',
    name: 'Timestamp Converter',
    category: TOOLS_CATEGORIES.TIME,
    description: 'Convert between Unix timestamp and human readable date',
    shortDescription: 'Convert timestamps',
  },
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    category: TOOLS_CATEGORIES.JSON,
    description: 'Stringify, parse, beautify, and minify JSON',
    shortDescription: 'Format JSON data',
  },
  {
    id: 'text-case',
    name: 'Text Case Converter',
    category: TOOLS_CATEGORIES.TEXT,
    description: 'Convert text between different cases',
    shortDescription: 'Change text case',
  },
  {
    id: 'color-converter',
    name: 'Color Converter',
    category: TOOLS_CATEGORIES.UTILITY,
    description: 'Convert colors between HEX, RGB, HSL formats',
    shortDescription: 'Convert color formats',
  },
  {
    id: 'unit-converter',
    name: 'Unit Converter',
    category: TOOLS_CATEGORIES.UTILITY,
    description: 'Convert between different units of measurement',
    shortDescription: 'Convert units',
  },
  {
    id: 'data-generator',
    name: 'Mock Data Generator',
    category: TOOLS_CATEGORIES.TESTING,
    description: 'Generate realistic mock data for testing',
    shortDescription: 'Generate test data',
  },
  {
    id: 'uuid-generator',
    name: 'UUID Generator',
    category: TOOLS_CATEGORIES.UTILITY,
    description: 'Generate UUID v4 identifiers',
    shortDescription: 'Generate UUIDs',
  },
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    category: TOOLS_CATEGORIES.UTILITY,
    description: 'Generate MD5, SHA1, SHA256 hashes',
    shortDescription: 'Generate hashes',
  },
  {
    id: 'url-encoder',
    name: 'URL Encoder/Decoder',
    category: TOOLS_CATEGORIES.TEXT,
    description: 'Encode and decode URLs and special characters',
    shortDescription: 'Encode/decode URLs',
  },
  {
    id: 'base64',
    name: 'Base64 Encoder/Decoder',
    category: TOOLS_CATEGORIES.TEXT,
    description: 'Encode text to Base64 or decode Base64',
    shortDescription: 'Base64 encoding',
  },
  {
    id: 'currency-converter',
    name: 'Currency Converter',
    category: TOOLS_CATEGORIES.FINANCE,
    description: 'Convert between different currencies',
    shortDescription: 'Convert currency',
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    category: TOOLS_CATEGORIES.UTILITY,
    description: 'Generate secure passwords with customizable options',
    shortDescription: 'Generate passwords',
  },
] as const
