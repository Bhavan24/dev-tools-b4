export function copyToClipboard(text: string): Promise<boolean> {
  if (!navigator?.clipboard) {
    return Promise.resolve(false)
  }
  return navigator.clipboard.writeText(text).then(() => true).catch(() => false)
}

export function formatJSON(json: string, beautify: boolean = true): string {
  try {
    const parsed = JSON.parse(json)
    return JSON.stringify(parsed, null, beautify ? 2 : 0)
  } catch {
    return json
  }
}

export function stringifyJSON(json: string): string {
  try {
    const parsed = JSON.parse(json)
    return JSON.stringify(parsed)
  } catch {
    return json
  }
}

export function parseJSON(json: string): Record<string, unknown> | null {
  try {
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function convertTimestamp(
  input: string,
  toTimestamp: boolean
): string {
  try {
    if (toTimestamp) {
      const date = new Date(input)
      return Math.floor(date.getTime() / 1000).toString()
    } else {
      const timestamp = parseInt(input, 10)
      const date = new Date(timestamp * 1000)
      return date.toISOString()
    }
  } catch {
    return ''
  }
}

export function convertCase(text: string, targetCase: string): string {
  switch (targetCase) {
    case 'uppercase':
      return text.toUpperCase()
    case 'lowercase':
      return text.toLowerCase()
    case 'capitalize':
      return text.charAt(0).toUpperCase() + text.slice(1)
    case 'titlecase':
      return text.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    case 'camelcase':
      return text.split(' ').map((word, i) => 
        i === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1)
      ).join('')
    case 'snakecase':
      return text.toLowerCase().replace(/\s+/g, '_')
    case 'kebabcase':
      return text.toLowerCase().replace(/\s+/g, '-')
    default:
      return text
  }
}

export function encodeBase64(text: string): string {
  try {
    return btoa(text)
  } catch {
    return ''
  }
}

export function decodeBase64(base64: string): string {
  try {
    return atob(base64)
  } catch {
    return ''
  }
}

export function encodeURL(text: string): string {
  try {
    return encodeURIComponent(text)
  } catch {
    return ''
  }
}

export function decodeURL(encoded: string): string {
  try {
    return decodeURIComponent(encoded)
  } catch {
    return ''
  }
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360
  s /= 100
  l /= 100

  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  }
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  return rgbToHsl(rgb.r, rgb.g, rgb.b)
}

export function hslToHex(h: number, s: number, l: number): string {
  const rgb = hslToRgb(h, s, l)
  return rgbToHex(rgb.r, rgb.g, rgb.b)
}

export function convertUnits(
  value: number,
  fromUnit: string,
  toUnit: string,
  type: string
): number {
  const conversions: Record<string, Record<string, number>> = {
    length: {
      'm-to-ft': 3.28084,
      'ft-to-m': 0.3048,
      'km-to-mi': 0.621371,
      'mi-to-km': 1.60934,
      'm-to-km': 0.001,
      'km-to-m': 1000,
      'm-to-cm': 100,
      'cm-to-m': 0.01,
      'in-to-cm': 2.54,
      'cm-to-in': 0.393701,
      'yd-to-m': 0.9144,
      'm-to-yd': 1.09361,
    },
    weight: {
      'kg-to-lb': 2.20462,
      'lb-to-kg': 0.453592,
      'g-to-oz': 0.035274,
      'oz-to-g': 28.3495,
      'kg-to-g': 1000,
      'g-to-kg': 0.001,
      't-to-kg': 1000,
      'kg-to-t': 0.001,
    },
    temperature: {
      'c-to-f': (c: number) => (c * 9/5) + 32,
      'f-to-c': (f: number) => (f - 32) * 5/9,
      'c-to-k': (c: number) => c + 273.15,
      'k-to-c': (k: number) => k - 273.15,
    },
    area: {
      'm2-to-ft2': 10.7639,
      'ft2-to-m2': 0.092903,
      'km2-to-mi2': 0.386102,
      'mi2-to-km2': 2.58999,
      'hectare-to-m2': 10000,
      'm2-to-hectare': 0.0001,
    },
    volume: {
      'l-to-gal': 0.264172,
      'gal-to-l': 3.78541,
      'l-to-ml': 1000,
      'ml-to-l': 0.001,
      'm3-to-l': 1000,
      'l-to-m3': 0.001,
    },
    speed: {
      'kmh-to-ms': 0.27778,
      'ms-to-kmh': 3.6,
      'mph-to-kmh': 1.60934,
      'kmh-to-mph': 0.621371,
      'knot-to-kmh': 1.852,
      'kmh-to-knot': 0.539957,
    },
  }

  // Handle temperature conversions with function
  if (type === 'temperature') {
    const tempFunc = conversions[type][`${fromUnit}-to-${toUnit}`]
    if (typeof tempFunc === 'function') {
      return tempFunc(value)
    }
  }

  const key = `${fromUnit}-to-${toUnit}`
  const factor = conversions[type]?.[key]

  return factor ? value * factor : value
}

const firstNames = [
  'James', 'Mary', 'Robert', 'Patricia', 'Michael', 'Jennifer', 'William', 'Linda',
  'David', 'Barbara', 'Richard', 'Elizabeth', 'Joseph', 'Susan', 'Thomas', 'Jessica',
  'Charles', 'Sarah', 'Christopher', 'Karen', 'Daniel', 'Nancy', 'Matthew', 'Lisa'
]

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson'
]

const companies = [
  'Google', 'Microsoft', 'Apple', 'Amazon', 'Facebook', 'Netflix', 'Tesla',
  'Adobe', 'Salesforce', 'IBM', 'Oracle', 'Intel', 'Cisco', 'Nvidia'
]

const jobTitles = [
  'Software Engineer', 'Product Manager', 'Data Scientist', 'UX Designer',
  'DevOps Engineer', 'QA Engineer', 'Frontend Developer', 'Backend Developer',
  'Full Stack Developer', 'Manager', 'Director', 'Analyst'
]

const productCategories = [
  'Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys',
  'Food & Beverage', 'Health & Beauty', 'Automotive', 'Office Supplies'
]

const cities = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
  'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Seattle'
]

const states = ['CA', 'TX', 'FL', 'NY', 'PA', 'IL', 'OH', 'GA', 'NC', 'MI']

const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF']

const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function generateMockData(type: string, count: number = 10): unknown[] {
  const data: unknown[] = []

  switch (type) {
    case 'person':
      for (let i = 0; i < count; i++) {
        const firstName = getRandomItem(firstNames)
        const lastName = getRandomItem(lastNames)
        data.push({
          id: generateUUID(),
          firstName,
          lastName,
          name: `${firstName} ${lastName}`,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
          phone: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
          age: Math.floor(Math.random() * 60 + 18),
          company: getRandomItem(companies),
          jobTitle: getRandomItem(jobTitles),
          address: `${Math.floor(Math.random() * 9999) + 1} Main St, ${getRandomItem(cities)}, ${getRandomItem(states)}`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}`,
        })
      }
      break
    case 'product':
      for (let i = 0; i < count; i++) {
        const price = Math.floor(Math.random() * 1000 + 10)
        data.push({
          id: generateUUID(),
          sku: `SKU${Math.floor(Math.random() * 999999) + 100000}`,
          name: `Product ${i + 1}`,
          category: getRandomItem(productCategories),
          description: 'High-quality product with excellent features',
          price,
          discount: Math.floor(Math.random() * 50),
          inStock: Math.random() > 0.3,
          rating: Math.floor(Math.random() * 5) + 1,
          reviews: Math.floor(Math.random() * 1000),
        })
      }
      break
    case 'address':
      for (let i = 0; i < count; i++) {
        data.push({
          id: generateUUID(),
          street: `${Math.floor(Math.random() * 9999) + 1} ${getRandomItem(['Oak', 'Main', 'elm', 'Pine'])} Street`,
          city: getRandomItem(cities),
          state: getRandomItem(states),
          country: 'United States',
          zip: String(Math.floor(Math.random() * 90000 + 10000)),
          latitude: (Math.random() * 180 - 90).toFixed(6),
          longitude: (Math.random() * 360 - 180).toFixed(6),
        })
      }
      break
    case 'company':
      for (let i = 0; i < count; i++) {
        data.push({
          id: generateUUID(),
          name: `${getRandomItem(firstNames)}'s ${getRandomItem(['Tech', 'Solutions', 'Services', 'Labs'])}`,
          domain: `company${i}.com`,
          industry: getRandomItem(productCategories),
          employees: Math.floor(Math.random() * 5000 + 10),
          founded: Math.floor(Math.random() * 30 + 1995),
          headquarters: `${getRandomItem(cities)}, ${getRandomItem(states)}`,
        })
      }
      break
    case 'transaction':
      for (let i = 0; i < count; i++) {
        data.push({
          id: generateUUID(),
          amount: (Math.random() * 5000 + 10).toFixed(2),
          currency: getRandomItem(currencies),
          status: getRandomItem(orderStatuses),
          merchant: getRandomItem(companies),
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          description: `Transaction ${i + 1}`,
        })
      }
      break
    default:
      for (let i = 0; i < count; i++) {
        data.push({ id: i + 1, value: `Item ${i + 1}` })
      }
  }

  return data
}

export interface PasswordGeneratorOptions {
  length: number
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
}

export function generatePassword(options: PasswordGeneratorOptions): string {
  let chars = ''
  if (options.uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (options.lowercase) chars += 'abcdefghijklmnopqrstuvwxyz'
  if (options.numbers) chars += '0123456789'
  if (options.symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'

  if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz'

  let password = ''
  for (let i = 0; i < options.length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export function calculatePasswordStrength(password: string): 'weak' | 'medium' | 'strong' | 'very strong' {
  let strength = 0
  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[a-z]/.test(password)) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) strength++

  if (strength <= 2) return 'weak'
  if (strength <= 4) return 'medium'
  if (strength <= 5) return 'strong'
  return 'very strong'
}
