'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface ModelComboboxProps {
  value: string
  onChange: (value: string) => void
  suggestions: string[]
  placeholder?: string
}

export function ModelCombobox({ value, onChange, suggestions, placeholder = 'Enter or select a model...' }: ModelComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value)
  const containerRef = useRef<HTMLDivElement>(null)

  // Keep query in sync when value changes externally (e.g. provider switch)
  useEffect(() => {
    setQuery(value)
  }, [value])

  const filtered = query.trim()
    ? suggestions.filter((m) => m.toLowerCase().includes(query.toLowerCase()))
    : suggestions

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setQuery(v)
    onChange(v)
    setOpen(true)
  }

  const handleSelect = (model: string) => {
    setQuery(model)
    onChange(model)
    setOpen(false)
  }

  const handleBlur = (e: React.FocusEvent) => {
    // Close only if focus leaves the container entirely
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative" onBlur={handleBlur}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="input-base font-mono text-sm pr-8"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="button"
          tabIndex={-1}
          onMouseDown={(e) => {
            e.preventDefault()
            setOpen((o) => !o)
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronDown size={14} className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-auto py-1">
          {filtered.map((model) => (
            <li key={model}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleSelect(model)
                }}
                className={`w-full text-left px-3 py-2 text-sm font-mono hover:bg-secondary transition-colors ${
                  model === value ? 'text-primary font-medium bg-primary/5' : 'text-foreground'
                }`}
              >
                {model}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
