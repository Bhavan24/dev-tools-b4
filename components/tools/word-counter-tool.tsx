'use client'

import { useState, useEffect } from 'react'

export function WordCounterTool() {
  const [text, setText] = useState('')
  const [stats, setStats] = useState({
    words: 0,
    chars: 0,
    charsNoSpaces: 0,
    sentences: 0,
    paragraphs: 0,
    readingTimeMin: 0,
  })

  useEffect(() => {
    const chars = text.length
    const charsNoSpaces = text.replace(/\s/g, '').length
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length
    const sentences = text.trim() === '' ? 0 : (text.match(/[^.!?]+[.!?]+/g) ?? []).length
    const paragraphs =
      text.trim() === '' ? 0 : text.split(/\n\s*\n/).filter((p) => p.trim()).length
    const readingTimeMin = Math.ceil(words / 200)
    setStats({ words, chars, charsNoSpaces, sentences, paragraphs, readingTimeMin })
  }, [text])

  const statItems = [
    { label: 'Words', value: stats.words },
    { label: 'Characters', value: stats.chars },
    { label: 'Chars (no spaces)', value: stats.charsNoSpaces },
    { label: 'Sentences', value: stats.sentences },
    { label: 'Paragraphs', value: stats.paragraphs },
    { label: 'Reading time', value: `~${stats.readingTimeMin} min` },
  ]

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-medium text-foreground mb-3">Text</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type your text here..."
          className="input-base h-64 font-mono text-sm resize-none"
        />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {statItems.map((item) => (
          <div key={item.label} className="bg-secondary rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-primary">{item.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
