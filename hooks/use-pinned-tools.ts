'use client'

import { useState, useEffect } from 'react'

export function usePinnedTools() {
  const [pinnedIds, setPinnedIds] = useState<string[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('ai-dev-tools-pinned')
    if (stored) {
      try {
        setPinnedIds(JSON.parse(stored))
      } catch {
        setPinnedIds([])
      }
    }
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('ai-dev-tools-pinned', JSON.stringify(pinnedIds))
    }
  }, [pinnedIds, isHydrated])

  const togglePin = (id: string) => {
    setPinnedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const isPinned = (id: string) => pinnedIds.includes(id)

  return { pinnedIds, togglePin, isPinned, isHydrated }
}
