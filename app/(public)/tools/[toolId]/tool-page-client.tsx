'use client'

import { useState } from 'react'
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
} from '@/lib/helpers'

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
                  const data = generateMockData(input, parseInt(secondInput) || 5)
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
