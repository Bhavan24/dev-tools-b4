'use client'

import { useState, useEffect } from 'react'
import { Plus, Minus, RotateCcw, Trash2, PencilLine, Check, X } from 'lucide-react'

const STORAGE_KEY = 'dev-tools-counters'

interface Counter {
  id: string
  name: string
  value: number
  step: number
}

function makeCounter(name = 'Counter', step = 1): Counter {
  return { id: Date.now().toString(), name, value: 0, step }
}

export function CounterTool() {
  const [counters, setCounters] = useState<Counter[]>([])
  const [isHydrated, setIsHydrated] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setCounters(parsed.length ? parsed : [makeCounter()])
      } catch {
        setCounters([makeCounter()])
      }
    } else {
      setCounters([makeCounter()])
    }
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(counters))
    }
  }, [counters, isHydrated])

  const update = (id: string, fn: (c: Counter) => Counter) => {
    setCounters((prev) => prev.map((c) => (c.id === id ? fn(c) : c)))
  }

  const handleIncrement = (id: string) => update(id, (c) => ({ ...c, value: c.value + c.step }))

  const handleDecrement = (id: string) => update(id, (c) => ({ ...c, value: c.value - c.step }))

  const handleReset = (id: string) => update(id, (c) => ({ ...c, value: 0 }))

  const handleDelete = (id: string) => setCounters((prev) => prev.filter((c) => c.id !== id))

  const handleAdd = () =>
    setCounters((prev) => [...prev, makeCounter(`Counter ${prev.length + 1}`)])

  const handleStepChange = (id: string, raw: string) => {
    const step = parseInt(raw, 10)
    if (!isNaN(step) && step > 0) {
      update(id, (c) => ({ ...c, step }))
    }
  }

  const startEdit = (c: Counter) => {
    setEditingId(c.id)
    setEditName(c.name)
  }

  const confirmEdit = (id: string) => {
    if (editName.trim()) {
      update(id, (c) => ({ ...c, name: editName.trim() }))
    }
    setEditingId(null)
  }

  const cancelEdit = () => setEditingId(null)

  if (!isHydrated) {
    return <div className="h-48 bg-muted animate-pulse rounded-lg" />
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {counters.map((counter) => (
          <div key={counter.id} className="card-base p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
              {editingId === counter.id ? (
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') confirmEdit(counter.id)
                      if (e.key === 'Escape') cancelEdit()
                    }}
                    className="input-base flex-1 min-w-0 py-1 text-sm"
                  />
                  <button
                    onClick={() => confirmEdit(counter.id)}
                    className="p-1 text-green-600 hover:text-green-700"
                    aria-label="Confirm"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-1 text-muted-foreground hover:text-foreground"
                    aria-label="Cancel"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startEdit(counter)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-primary transition-colors group"
                >
                  <span className="truncate">{counter.name}</span>
                  <PencilLine
                    size={13}
                    className="opacity-0 group-hover:opacity-60 transition-opacity shrink-0"
                  />
                </button>
              )}

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleReset(counter.id)}
                  className="p-1.5 rounded text-muted-foreground hover:text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
                  aria-label="Reset"
                >
                  <RotateCcw size={15} />
                </button>
                {counters.length > 1 && (
                  <button
                    onClick={() => handleDelete(counter.id)}
                    className="p-1.5 rounded text-muted-foreground hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    aria-label="Delete counter"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* Value display */}
            <div className="text-center">
              <span
                className={`text-6xl font-mono font-bold tabular-nums ${
                  counter.value < 0
                    ? 'text-red-500 dark:text-red-400'
                    : counter.value > 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-foreground'
                }`}
              >
                {counter.value}
              </span>
            </div>

            {/* Increment / Decrement */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleDecrement(counter.id)}
                className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40 font-semibold transition-colors"
              >
                <Minus size={18} />
                <span>-{counter.step}</span>
              </button>
              <button
                onClick={() => handleIncrement(counter.id)}
                className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40 font-semibold transition-colors"
              >
                <Plus size={18} />
                <span>+{counter.step}</span>
              </button>
            </div>

            {/* Step */}
            <div className="flex items-center gap-2 text-sm">
              <label className="text-muted-foreground shrink-0">Step:</label>
              <input
                type="number"
                min="1"
                value={counter.step}
                onChange={(e) => handleStepChange(counter.id, e.target.value)}
                className="input-base w-20 py-1 text-sm text-center"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleAdd}
        className="btn-secondary w-full flex items-center justify-center gap-2 py-2.5"
      >
        <Plus size={18} />
        Add Counter
      </button>
    </div>
  )
}
