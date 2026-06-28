'use client'

import { useState, useEffect } from 'react'
import md5 from 'js-md5'
import { CopyButton } from '@/components/shared/copy-button'
import {
  formatJSON,
  convertTimestamp,
  convertCase,
  encodeBase64,
  decodeBase64,
  encodeURL,
  decodeURL,
  generateUUID,
  generateMockData,
  rgbToHex,
  hexToRgb,
  hexToHsl,
  hslToHex,
  rgbToHsl,
  hslToRgb,
  convertUnits,
  generatePassword,
  calculatePasswordStrength,
  PasswordGeneratorOptions,
  generateBulkMockData,
} from '@/lib/helpers'
import { Check, Copy } from 'lucide-react'

interface ToolPageClientProps {
  toolId: string
}

export function ToolPageClient({ toolId }: ToolPageClientProps) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [secondInput, setSecondInput] = useState('')

  const renderTool = () => {
    switch (toolId) {
      case 'public-ip':
        return <PublicIPTool />

      case 'json-formatter':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <label className="block font-medium text-foreground mb-3">Input JSON</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='{"key": "value"}'
                className="input-base h-64 font-mono text-sm mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setOutput(formatJSON(input, true))}
                  className="btn-primary flex-1"
                >
                  Beautify
                </button>
                <button
                  onClick={() => setOutput(formatJSON(input, false))}
                  className="btn-secondary flex-1"
                >
                  Minify
                </button>
              </div>
            </div>
            <div>
              <label className="block font-medium text-foreground mb-3">Output JSON</label>
              <textarea
                value={output}
                readOnly
                className="input-base h-64 font-mono text-sm mb-4 bg-secondary"
              />
              {output && <CopyButton text={output} />}
            </div>
          </div>
        )

      case 'timestamp':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <label className="block font-medium text-foreground mb-3">Unix Timestamp</label>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="1234567890"
                className="input-base mb-4"
              />
              <button
                onClick={() => setOutput(convertTimestamp(input, false))}
                className="btn-primary"
              >
                Convert to Date
              </button>
            </div>
            <div>
              <label className="block font-medium text-foreground mb-3">Readable Date</label>
              <input
                type="text"
                value={secondInput}
                onChange={(e) => setSecondInput(e.target.value)}
                placeholder="2024-01-01T00:00:00Z"
                className="input-base mb-4"
              />
              <button
                onClick={() => setOutput(convertTimestamp(secondInput, true))}
                className="btn-primary"
              >
                Convert to Timestamp
              </button>
              {output && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Result:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-secondary rounded text-foreground break-all">
                      {output}
                    </code>
                    <CopyButton text={output} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 'text-case':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <label className="block font-medium text-foreground mb-3">Input Text</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter text to convert"
                className="input-base h-64 mb-4"
              />
              <div className="grid grid-cols-2 gap-2">
                {['uppercase', 'lowercase', 'capitalize', 'titlecase', 'camelcase', 'snakecase', 'kebabcase'].map(
                  (caseType) => (
                    <button
                      key={caseType}
                      onClick={() => setOutput(convertCase(input, caseType))}
                      className="btn-secondary text-sm py-2"
                    >
                      {caseType}
                    </button>
                  )
                )}
              </div>
            </div>
            <div>
              <label className="block font-medium text-foreground mb-3">Output Text</label>
              <textarea
                value={output}
                readOnly
                className="input-base h-64 font-mono text-sm bg-secondary mb-4"
              />
              {output && <CopyButton text={output} />}
            </div>
          </div>
        )

      case 'base64':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <label className="block font-medium text-foreground mb-3">Input Text</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter text to encode/decode"
                className="input-base h-64 mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setOutput(encodeBase64(input))}
                  className="btn-primary flex-1"
                >
                  Encode
                </button>
                <button
                  onClick={() => setOutput(decodeBase64(input))}
                  className="btn-secondary flex-1"
                >
                  Decode
                </button>
              </div>
            </div>
            <div>
              <label className="block font-medium text-foreground mb-3">Output</label>
              <textarea
                value={output}
                readOnly
                className="input-base h-64 font-mono text-sm bg-secondary mb-4"
              />
              {output && <CopyButton text={output} />}
            </div>
          </div>
        )

      case 'url-encoder':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <label className="block font-medium text-foreground mb-3">Input Text</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter text to encode/decode"
                className="input-base h-64 mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setOutput(encodeURL(input))}
                  className="btn-primary flex-1"
                >
                  Encode
                </button>
                <button
                  onClick={() => setOutput(decodeURL(input))}
                  className="btn-secondary flex-1"
                >
                  Decode
                </button>
              </div>
            </div>
            <div>
              <label className="block font-medium text-foreground mb-3">Output</label>
              <textarea
                value={output}
                readOnly
                className="input-base h-64 font-mono text-sm bg-secondary mb-4"
              />
              {output && <CopyButton text={output} />}
            </div>
          </div>
        )

      case 'uuid-generator':
        return (
          <div>
            <div className="flex gap-3 mb-8">
              <button
                onClick={() => setOutput(generateUUID())}
                className="btn-primary"
              >
                Generate 1 UUID
              </button>
              <button
                onClick={() =>
                  setOutput(
                    Array.from({ length: 10 }, () => generateUUID()).join('\n')
                  )
                }
                className="btn-secondary"
              >
                Generate 10 UUIDs
              </button>
            </div>

            {output && (
              <div className="card-base">
                <div className="space-y-2">
                  {output.split('\n').map((uuid, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                      <code className="text-sm font-mono text-foreground break-all">
                        {uuid}
                      </code>
                      <CopyButton text={uuid} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 'data-generator':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <label className="block font-medium text-foreground mb-3">Data Type</label>
              <select
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="input-base mb-6"
              >
                <option value="person">Person</option>
                <option value="product">Product</option>
                <option value="address">Address</option>
                <option value="company">Company</option>
                <option value="transaction">Transaction</option>
                <option value="generic">Generic</option>
              </select>

              <label className="block font-medium text-foreground mb-3">Number of Records</label>
              <input
                type="number"
                min="1"
                max="100"
                value={secondInput}
                onChange={(e) => setSecondInput(e.target.value)}
                className="input-base mb-6"
                defaultValue="5"
              />

              <button
                onClick={() => {
                  const data = generateMockData(input || 'generic', parseInt(secondInput) || 5)
                  setOutput(JSON.stringify(data, null, 2))
                }}
                className="btn-primary w-full"
              >
                Generate Data
              </button>
            </div>

            {output && (
              <div>
                <label className="block font-medium text-foreground mb-3">Generated Data</label>
                <textarea
                  value={output}
                  readOnly
                  className="input-base h-64 font-mono text-sm bg-secondary mb-4"
                />
                <CopyButton text={output} />
              </div>
            )}
          </div>
        )

      case 'color-converter':
        return <ColorConverterTool />

      case 'unit-converter':
        return <UnitConverterTool />

      case 'hash-generator':
        return <HashGeneratorTool />

      case 'currency-converter':
        return <CurrencyConverterTool />

      case 'password-generator':
        return <PasswordGeneratorTool />

      case 'bulk-data-generator':
        return <BulkDataGeneratorTool />

      case 'prompt-templates':
        return <PromptTemplatesTool />

      case 'token-counter':
        return <TokenCounterTool />

      case 'link-library':
        return <LinkLibraryTool />

      case 'quick-search':
        return <QuickSearchTool />

      default:
        return (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Tool interface coming soon...</p>
          </div>
        )
    }
  }

  return renderTool()
}

function PublicIPTool() {
  const [ip, setIp] = useState('')

  const handleGetIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      setIp(data.ip)
    } catch {
      setIp('Error fetching IP')
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <label className="block font-medium text-foreground mb-3">Your Public IP</label>
        <input
          type="text"
          value={ip}
          readOnly
          placeholder="Click 'Get IP' to fetch your public IP"
          className="input-base mb-4"
        />
        <button onClick={handleGetIP} className="btn-primary">
          Get IP Address
        </button>
      </div>
      {ip && (
        <div>
          <label className="block font-medium text-foreground mb-3">IP Details</label>
          <div className="card-base">
            <p className="text-foreground break-words">{ip}</p>
            <div className="mt-4">
              <CopyButton text={ip} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ColorConverterTool() {
  const [hex, setHex] = useState('#2563eb')
  const [r, setR] = useState(37)
  const [g, setG] = useState(99)
  const [b, setB] = useState(235)
  const [h, setH] = useState(217)
  const [s, setS] = useState(98)
  const [l, setL] = useState(53)

  const handleHexChange = (newHex: string) => {
    setHex(newHex)
    const rgb = hexToRgb(newHex)
    if (rgb) {
      setR(rgb.r)
      setG(rgb.g)
      setB(rgb.b)
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
      setH(hsl.h)
      setS(hsl.s)
      setL(hsl.l)
    }
  }

  const handleRGBChange = () => {
    const newHex = rgbToHex(r, g, b)
    setHex(newHex)
    const hsl = rgbToHsl(r, g, b)
    setH(hsl.h)
    setS(hsl.s)
    setL(hsl.l)
  }

  const handleHSLChange = () => {
    const newHex = hslToHex(h, s, l)
    setHex(newHex)
    const rgb = hslToRgb(h, s, l)
    setR(rgb.r)
    setG(rgb.g)
    setB(rgb.b)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* HEX */}
        <div className="card-base">
          <label className="block font-medium text-foreground mb-3">HEX</label>
          <div className="flex gap-2 mb-4">
            <input
              type="color"
              value={hex}
              onChange={(e) => handleHexChange(e.target.value)}
              className="w-16 h-12 rounded cursor-pointer"
            />
            <input
              type="text"
              value={hex}
              onChange={(e) => handleHexChange(e.target.value)}
              className="input-base flex-1"
            />
          </div>
          <CopyButton text={hex} />
        </div>

        {/* RGB */}
        <div className="card-base">
          <label className="block font-medium text-foreground mb-3">RGB</label>
          <div className="space-y-2 mb-4">
            <div>
              <input
                type="range"
                min="0"
                max="255"
                value={r}
                onChange={(e) => {
                  setR(Number(e.target.value))
                  handleRGBChange()
                }}
                className="w-full"
              />
              <span className="text-sm text-muted-foreground">R: {r}</span>
            </div>
            <div>
              <input
                type="range"
                min="0"
                max="255"
                value={g}
                onChange={(e) => {
                  setG(Number(e.target.value))
                  handleRGBChange()
                }}
                className="w-full"
              />
              <span className="text-sm text-muted-foreground">G: {g}</span>
            </div>
            <div>
              <input
                type="range"
                min="0"
                max="255"
                value={b}
                onChange={(e) => {
                  setB(Number(e.target.value))
                  handleRGBChange()
                }}
                className="w-full"
              />
              <span className="text-sm text-muted-foreground">B: {b}</span>
            </div>
          </div>
          <CopyButton text={`rgb(${r}, ${g}, ${b})`} />
        </div>

        {/* HSL */}
        <div className="card-base">
          <label className="block font-medium text-foreground mb-3">HSL</label>
          <div className="space-y-2 mb-4">
            <div>
              <input
                type="range"
                min="0"
                max="360"
                value={h}
                onChange={(e) => {
                  setH(Number(e.target.value))
                  handleHSLChange()
                }}
                className="w-full"
              />
              <span className="text-sm text-muted-foreground">H: {h}°</span>
            </div>
            <div>
              <input
                type="range"
                min="0"
                max="100"
                value={s}
                onChange={(e) => {
                  setS(Number(e.target.value))
                  handleHSLChange()
                }}
                className="w-full"
              />
              <span className="text-sm text-muted-foreground">S: {s}%</span>
            </div>
            <div>
              <input
                type="range"
                min="0"
                max="100"
                value={l}
                onChange={(e) => {
                  setL(Number(e.target.value))
                  handleHSLChange()
                }}
                className="w-full"
              />
              <span className="text-sm text-muted-foreground">L: {l}%</span>
            </div>
          </div>
          <CopyButton text={`hsl(${h}, ${s}%, ${l}%)`} />
        </div>
      </div>

      <div className="card-base flex items-center justify-center h-32 rounded-xl" style={{ backgroundColor: hex }}>
        <div className="text-center">
          <p className="text-white/80 text-sm mb-2">Live Preview</p>
          <p className="text-white font-mono">{hex}</p>
        </div>
      </div>
    </div>
  )
}

function UnitConverterTool() {
  const [category, setCategory] = useState('length')
  const [value, setValue] = useState('1')
  const [fromUnit, setFromUnit] = useState('m')
  const [toUnit, setToUnit] = useState('ft')
  const [result, setResult] = useState('')

  const categories: Record<string, string[]> = {
    length: ['m', 'ft', 'km', 'mi', 'cm', 'in', 'yd'],
    weight: ['kg', 'lb', 'g', 'oz', 't'],
    temperature: ['c', 'f', 'k'],
    area: ['m2', 'ft2', 'km2', 'mi2', 'hectare'],
    volume: ['l', 'gal', 'ml', 'm3'],
    speed: ['kmh', 'ms', 'mph', 'knot'],
  }

  const convert = () => {
    const converted = convertUnits(Number(value), fromUnit, toUnit, category)
    setResult(converted.toFixed(6))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div>
          <label className="block font-medium text-foreground mb-2">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-base">
            {Object.keys(categories).map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium text-foreground mb-2">Value</label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="input-base"
            placeholder="Enter value"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-foreground mb-2">From</label>
            <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)} className="input-base">
              {categories[category].map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium text-foreground mb-2">To</label>
            <select value={toUnit} onChange={(e) => setToUnit(e.target.value)} className="input-base">
              {categories[category].map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button onClick={convert} className="btn-primary w-full">
          Convert
        </button>
      </div>

      {result && (
        <div className="card-base">
          <p className="text-sm text-muted-foreground mb-2">Result</p>
          <p className="text-3xl font-bold text-foreground mb-4">
            {value} {fromUnit} = {result} {toUnit}
          </p>
          <CopyButton text={result} />
        </div>
      )}
    </div>
  )
}

function HashGeneratorTool() {
  const [input, setInput] = useState('')
  const [algorithm, setAlgorithm] = useState('md5')
  const [output, setOutput] = useState('')

  const generateHash = () => {
    let hash = ''
    try {
      if (algorithm === 'md5') {
        hash = md5(input)
      } else if (algorithm === 'sha1') {
        hash = 'SHA1 requires Web Crypto API'
      } else if (algorithm === 'sha256') {
        hash = 'SHA256 requires Web Crypto API'
      }
      setOutput(hash)
    } catch (err) {
      setOutput('Error generating hash')
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <label className="block font-medium text-foreground mb-3">Input Text</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to hash"
          className="input-base h-64 mb-4"
        />

        <div className="mb-4">
          <label className="block font-medium text-foreground mb-2">Algorithm</label>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            className="input-base mb-4"
          >
            <option value="md5">MD5</option>
            <option value="sha1">SHA1 (Client-side only)</option>
            <option value="sha256">SHA256 (Client-side only)</option>
          </select>
        </div>

        <button onClick={generateHash} className="btn-primary w-full">
          Generate Hash
        </button>
      </div>

      {output && (
        <div>
          <label className="block font-medium text-foreground mb-3">Hash Output</label>
          <textarea value={output} readOnly className="input-base h-64 font-mono text-sm bg-secondary mb-4" />
          <CopyButton text={output} />
        </div>
      )}
    </div>
  )
}

function CurrencyConverterTool() {
  const [amount, setAmount] = useState('100')
  const [baseCurrency, setBaseCurrency] = useState('USD')
  const [targetCurrency, setTargetCurrency] = useState('EUR')
  const [result, setResult] = useState('')
  const [rate, setRate] = useState('')
  const [loading, setLoading] = useState(false)

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'CNY', 'INR', 'MXN']

  const convert = async () => {
    setLoading(true)
    try {
      const res = await fetch(`https://open.er-api.com/v6/latest/${baseCurrency}`)
      const data = await res.json()
      const exchangeRate = data.rates[targetCurrency]
      const converted = (Number(amount) * exchangeRate).toFixed(2)
      setResult(converted)
      setRate(exchangeRate.toFixed(6))
    } catch {
      setResult('Error fetching rates')
      setRate('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div>
          <label className="block font-medium text-foreground mb-2">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input-base"
            placeholder="Enter amount"
          />
        </div>

        <div>
          <label className="block font-medium text-foreground mb-2">From Currency</label>
          <select
            value={baseCurrency}
            onChange={(e) => setBaseCurrency(e.target.value)}
            className="input-base"
          >
            {currencies.map((curr) => (
              <option key={curr} value={curr}>
                {curr}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium text-foreground mb-2">To Currency</label>
          <select
            value={targetCurrency}
            onChange={(e) => setTargetCurrency(e.target.value)}
            className="input-base"
          >
            {currencies.map((curr) => (
              <option key={curr} value={curr}>
                {curr}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={convert}
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? 'Converting...' : 'Convert'}
        </button>
      </div>

      {result && (
        <div className="card-base space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Converted Amount</p>
            <p className="text-3xl font-bold text-foreground">
              {result} {targetCurrency}
            </p>
          </div>
          {rate && (
            <div>
              <p className="text-sm text-muted-foreground">Exchange Rate</p>
              <p className="text-lg text-foreground">
                1 {baseCurrency} = {rate} {targetCurrency}
              </p>
            </div>
          )}
          <CopyButton text={result} />
        </div>
      )}
    </div>
  )
}

function PasswordGeneratorTool() {
  const [options, setOptions] = useState<PasswordGeneratorOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  })
  const [passwords, setPasswords] = useState<string[]>([])

  const generateOne = () => {
    const pwd = generatePassword(options)
    setPasswords([pwd])
  }

  const generateMultiple = () => {
    const newPasswords = Array.from({ length: 5 }, () => generatePassword(options))
    setPasswords(newPasswords)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div>
          <label className="block font-medium text-foreground mb-3">
            Password Length: {options.length}
          </label>
          <input
            type="range"
            min="8"
            max="128"
            value={options.length}
            onChange={(e) =>
              setOptions({ ...options, length: Number(e.target.value) })
            }
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={options.uppercase}
              onChange={(e) =>
                setOptions({ ...options, uppercase: e.target.checked })
              }
              className="w-4 h-4"
            />
            <span className="text-foreground">Uppercase (A-Z)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={options.lowercase}
              onChange={(e) =>
                setOptions({ ...options, lowercase: e.target.checked })
              }
              className="w-4 h-4"
            />
            <span className="text-foreground">Lowercase (a-z)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={options.numbers}
              onChange={(e) =>
                setOptions({ ...options, numbers: e.target.checked })
              }
              className="w-4 h-4"
            />
            <span className="text-foreground">Numbers (0-9)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={options.symbols}
              onChange={(e) =>
                setOptions({ ...options, symbols: e.target.checked })
              }
              className="w-4 h-4"
            />
            <span className="text-foreground">Symbols (!@#$...)</span>
          </label>
        </div>

        <div className="flex gap-3">
          <button onClick={generateOne} className="btn-primary flex-1">
            Generate 1
          </button>
          <button onClick={generateMultiple} className="btn-secondary flex-1">
            Generate 5
          </button>
        </div>
      </div>

      {passwords.length > 0 && (
        <div>
          <label className="block font-medium text-foreground mb-3">Generated Passwords</label>
          <div className="space-y-2">
            {passwords.map((pwd, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <code className="font-mono text-sm text-foreground break-all">
                  {pwd}
                </code>
                <CopyButton text={pwd} />
              </div>
            ))}
          </div>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">Strength: {calculatePasswordStrength(passwords[0])}</p>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  calculatePasswordStrength(passwords[0]) === 'very strong'
                    ? 'bg-green-500'
                    : calculatePasswordStrength(passwords[0]) === 'strong'
                      ? 'bg-blue-500'
                      : calculatePasswordStrength(passwords[0]) === 'medium'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                }`}
                style={{
                  width:
                    calculatePasswordStrength(passwords[0]) === 'very strong'
                      ? '100%'
                      : calculatePasswordStrength(passwords[0]) === 'strong'
                        ? '75%'
                        : calculatePasswordStrength(passwords[0]) === 'medium'
                          ? '50%'
                          : '25%',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function BulkDataGeneratorTool() {
  const [count, setCount] = useState('10')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['person', 'web'])
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)

  const categories = ['person', 'text', 'web', 'location', 'time', 'finance', 'miscellaneous']

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category))
    } else {
      setSelectedCategories([...selectedCategories, category])
    }
  }

  const generateData = () => {
    if (selectedCategories.length === 0) {
      alert('Please select at least one category')
      return
    }
    setLoading(true)
    const data = generateBulkMockData(selectedCategories, parseInt(count) || 10)
    setOutput(JSON.stringify(data, null, 2))
    setLoading(false)
  }

  const downloadJSON = () => {
    if (!output) {
      alert('Please generate data first')
      return
    }
    const dataBlob = new Blob([output], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `bulk-data-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block font-medium text-foreground mb-3">Number of Records</label>
            <input
              type="number"
              min="1"
              max="10000"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className="input-base"
            />
          </div>

          <div>
            <label className="block font-medium text-foreground mb-3">Data Categories</label>
            <div className="space-y-2">
              {categories.map(category => (
                <label key={category} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                    className="w-4 h-4"
                  />
                  <span className="text-foreground capitalize">{category}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={generateData}
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Generating...' : 'Generate Data'}
            </button>
            <button
              onClick={downloadJSON}
              disabled={!output}
              className="btn-secondary flex-1"
            >
              Download JSON
            </button>
          </div>
        </div>

        {output && (
          <div>
            <label className="block font-medium text-foreground mb-3">Generated Data Preview</label>
            <textarea
              value={output.substring(0, 500)}
              readOnly
              className="input-base h-64 font-mono text-sm bg-secondary mb-4"
            />
            <CopyButton text={output} />
          </div>
        )}
      </div>
    </div>
  )
}

function PromptTemplatesTool() {
  const [prompts, setPrompts] = useState<Array<{ id: string; title: string; content: string; category: string }>>([])
  const [selectedPrompt, setSelectedPrompt] = useState<typeof prompts[0] | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('development')

  const savePrompt = () => {
    if (!title || !content) {
      alert('Please fill in all fields')
      return
    }
    const newPrompt = {
      id: Date.now().toString(),
      title,
      content,
      category,
    }
    const updated = [...prompts, newPrompt]
    setPrompts(updated)
    localStorage.setItem('prompts', JSON.stringify(updated))
    setTitle('')
    setContent('')
    setCategory('development')
    setShowForm(false)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="space-y-4">
        <button onClick={() => setShowForm(!showForm)} className="btn-primary w-full">
          Add New Template
        </button>

        {showForm && (
          <div className="card-base space-y-4">
            <input
              type="text"
              placeholder="Template title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-base"
            />
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-base">
              <option value="development">Development</option>
              <option value="documentation">Documentation</option>
              <option value="debugging">Debugging</option>
              <option value="explanation">Explanation</option>
            </select>
            <textarea
              placeholder="Template content..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input-base h-40"
            />
            <div className="flex gap-2">
              <button onClick={savePrompt} className="btn-primary flex-1">
                Save
              </button>
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {prompts.map(prompt => (
            <div
              key={prompt.id}
              onClick={() => setSelectedPrompt(prompt)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedPrompt?.id === prompt.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-muted'
              }`}
            >
              <p className="font-medium text-sm">{prompt.title}</p>
              <p className="text-xs opacity-70">{prompt.category}</p>
            </div>
          ))}
        </div>
      </div>

      {selectedPrompt && (
        <div className="lg:col-span-2">
          <label className="block font-medium text-foreground mb-3">{selectedPrompt.title}</label>
          <textarea
            value={selectedPrompt.content}
            readOnly
            className="input-base h-64 font-mono text-sm bg-secondary mb-4"
          />
          <CopyButton text={selectedPrompt.content} />
        </div>
      )}
    </div>
  )
}

function TokenCounterTool() {
  const [text, setText] = useState('')
  const [tokenCount, setTokenCount] = useState(0)

  const estimateTokens = (str: string) => {
    const words = str.trim().split(/\s+/).length
    const tokens = Math.ceil(words * 1.3)
    setTokenCount(tokens)
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-medium text-foreground mb-3">Paste your text</label>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            estimateTokens(e.target.value)
          }}
          placeholder="Paste text here to estimate token count..."
          className="input-base h-64 mb-4"
        />
      </div>

      <div className="card-base p-6 flex items-center justify-between">
        <p className="text-lg font-medium text-foreground">Estimated Token Count</p>
        <p className="text-4xl font-bold text-primary">{tokenCount}</p>
      </div>

      <p className="text-sm text-muted-foreground">
        Note: This is an approximation. Actual token count may vary based on the model and encoding method. Typically: ~1 token per 4 characters or ~1.3 tokens per word.
      </p>
    </div>
  )
}

function LinkLibraryTool() {
  const [links, setLinks] = useState<Array<{ id: string; title: string; url: string }>>([])
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')

  const addLink = () => {
    if (!title || !url) {
      alert('Please fill in all fields')
      return
    }
    const newLink = {
      id: Date.now().toString(),
      title,
      url,
    }
    const updated = [...links, newLink]
    setLinks(updated)
    localStorage.setItem('links', JSON.stringify(updated))
    setTitle('')
    setUrl('')
  }

  const removeLink = (id: string) => {
    const updated = links.filter(l => l.id !== id)
    setLinks(updated)
    localStorage.setItem('links', JSON.stringify(updated))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div>
          <label className="block font-medium text-foreground mb-2">Link Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., React Documentation"
            className="input-base mb-4"
          />
        </div>

        <div>
          <label className="block font-medium text-foreground mb-2">URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="input-base mb-4"
          />
        </div>

        <button onClick={addLink} className="btn-primary w-full">
          Add Link
        </button>
      </div>

      <div>
        <label className="block font-medium text-foreground mb-3">Saved Links</label>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {links.map(link => (
            <div key={link.id} className="p-3 bg-secondary rounded-lg flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium text-sm text-foreground">{link.title}</p>
                <p className="text-xs text-muted-foreground truncate">{link.url}</p>
              </div>
              <button
                onClick={() => removeLink(link.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function QuickSearchTool() {
  const [query, setQuery] = useState('')
  const [engine, setEngine] = useState('stackoverflow')

  const searchEngines: Record<string, string> = {
    stackoverflow: 'https://stackoverflow.com/search?q=',
    github: 'https://github.com/search?q=',
    npm: 'https://www.npmjs.com/search?q=',
    mdn: 'https://developer.mozilla.org/en-US/search?q=',
    google: 'https://google.com/search?q=',
  }

  const search = () => {
    if (!query.trim()) {
      alert('Please enter a search query')
      return
    }
    const searchUrl = searchEngines[engine] + encodeURIComponent(query)
    window.open(searchUrl, '_blank')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div>
          <label className="block font-medium text-foreground mb-3">Search Engine</label>
          <select value={engine} onChange={(e) => setEngine(e.target.value)} className="input-base">
            <option value="stackoverflow">Stack Overflow</option>
            <option value="github">GitHub</option>
            <option value="npm">NPM Registry</option>
            <option value="mdn">MDN Web Docs</option>
            <option value="google">Google</option>
          </select>
        </div>

        <div>
          <label className="block font-medium text-foreground mb-3">Search Query</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search()}
            placeholder="Enter your search..."
            className="input-base mb-4"
          />
        </div>

        <button onClick={search} className="btn-primary w-full">
          Search
        </button>
      </div>

      <div className="card-base">
        <p className="font-medium text-foreground mb-4">Quick Search Tips</p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Stack Overflow: Search for questions and solutions</li>
          <li>• GitHub: Find repositories and code examples</li>
          <li>• NPM: Discover and search npm packages</li>
          <li>• MDN: Access comprehensive web documentation</li>
          <li>• Google: General web search</li>
        </ul>
      </div>
    </div>
  )
}
