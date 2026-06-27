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
