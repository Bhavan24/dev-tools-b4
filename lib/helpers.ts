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

export function convertUnits(
  value: number,
  fromUnit: string,
  toUnit: string,
  type: string
): number {
  // Simplified unit conversion
  const conversions: Record<string, Record<string, number>> = {
    length: {
      'm-to-ft': 3.28084,
      'ft-to-m': 0.3048,
      'km-to-mi': 0.621371,
      'mi-to-km': 1.60934,
    },
    weight: {
      'kg-to-lb': 2.20462,
      'lb-to-kg': 0.453592,
      'g-to-oz': 0.035274,
      'oz-to-g': 28.3495,
    },
  }

  const key = `${fromUnit}-to-${toUnit}`
  const factor = conversions[type]?.[key]

  return factor ? value * factor : value
}

export function generateMockData(type: string, count: number = 10): unknown[] {
  const data: unknown[] = []

  switch (type) {
    case 'person':
      for (let i = 0; i < count; i++) {
        data.push({
          id: generateUUID(),
          name: `Person ${i + 1}`,
          email: `person${i + 1}@example.com`,
          age: Math.floor(Math.random() * 60 + 18),
        })
      }
      break
    case 'product':
      for (let i = 0; i < count; i++) {
        data.push({
          id: generateUUID(),
          name: `Product ${i + 1}`,
          price: Math.floor(Math.random() * 1000 + 10),
          inStock: Math.random() > 0.5,
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
