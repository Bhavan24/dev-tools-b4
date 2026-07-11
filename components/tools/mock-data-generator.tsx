'use client'

import { useState, useEffect } from 'react'
import { Copy, Check } from 'lucide-react'

interface MockDataGeneratorProps {
  toolId: string
}

const CATEGORIES = [
  { id: 'person', name: 'Person' },
  { id: 'text', name: 'Text' },
  { id: 'web', name: 'Web' },
  { id: 'location', name: 'Location' },
  { id: 'time', name: 'Time' },
  { id: 'finance', name: 'Finance' },
  { id: 'miscellaneous', name: 'Miscellaneous' },
]

export function MockDataGenerator({ toolId }: MockDataGeneratorProps) {
  const [activeCategory, setActiveCategory] = useState('person')
  const [data, setData] = useState<Record<string, any> | null>(null)
  const [loading, setLoading] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [error, setError] = useState('')

  const generateData = async (category: string) => {
    setLoading(true)
    setError('')
    setActiveCategory(category)

    try {
      const response = await fetch(`/api/tools/${toolId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to generate data')
      }

      const result = await response.json()
      setData(result.result)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    generateData('person')
  }, [])

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => generateData(cat.id)}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
              activeCategory === cat.id
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-secondary text-foreground hover:bg-secondary/80'
            } disabled:opacity-50`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Generate Button */}
      <button
        onClick={() => generateData(activeCategory)}
        disabled={loading}
        className="w-full btn-primary py-3 flex items-center justify-center gap-2"
      >
        {loading ? 'Generating...' : 'Generate New Data'}
      </button>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Data Grid */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(data).map(([key, value]) => (
            <div
              key={key}
              className="bg-secondary rounded-lg p-4 border border-border hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <label className="font-semibold text-sm text-foreground capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <button
                  onClick={() => copyToClipboard(String(value), key)}
                  className="p-1.5 rounded-md text-muted-foreground hover:bg-primary/20 hover:text-primary transition-all"
                  title="Copy to clipboard"
                >
                  {copiedField === key ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
              <div
                className="font-mono text-sm bg-background p-2 rounded border border-border wrap-break-word"
                title={String(value)}
              >
                {String(value)}
              </div>
            </div>
          ))}
        </div>
      )}

      {!data && !error && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Click a category or "Generate New Data" to create mock data</p>
        </div>
      )}
    </div>
  )
}
