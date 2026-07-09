'use client'

import { useState, useEffect } from 'react'
import { Trash2, Plus, Copy, Check } from 'lucide-react'

const STORAGE_KEY = 'dev-tools-notes'

interface Note {
  id: string
  text: string
  createdAt: number
}

interface NotesToolProps {
  toolId?: string
}

export function NotesTool({ toolId }: NotesToolProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [input, setInput] = useState('')
  const [isHydrated, setIsHydrated] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    const savedNotes = localStorage.getItem(STORAGE_KEY)
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes))
      } catch {
        setNotes([])
      }
    }
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
    }
  }, [notes, isHydrated])

  const handleAddNote = () => {
    if (!input.trim()) return

    const newNote: Note = {
      id: Date.now().toString(),
      text: input.trim(),
      createdAt: Date.now(),
    }

    setNotes([newNote, ...notes])
    setInput('')
  }

  const handleCopyNote = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id))
  }

  const handleClearAll = () => {
    if (
      notes.length &&
      window.confirm('Are you sure you want to delete all notes? This cannot be undone.')
    ) {
      setNotes([])
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  if (!isHydrated) {
    return <div className="h-96 bg-muted animate-pulse rounded-lg" />
  }

  return (
    <div className="max-w-full space-y-6">
      {/* Input Section */}
      <div className="space-y-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
              handleAddNote()
            }
          }}
          placeholder="Add a new note... (Ctrl+Enter to add)"
          className="input-base w-full resize-none h-24"
        />
        <button
          onClick={handleAddNote}
          className="btn-primary w-full flex items-center justify-center gap-2 py-2"
        >
          <Plus size={18} />
          <span>Add Note</span>
        </button>
      </div>

      {/* Statistics */}
      {notes.length > 0 && (
        <div className="card-base p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Total Notes</p>
          <p className="text-2xl font-bold text-foreground">{notes.length}</p>
        </div>
      )}

      {/* Notes List */}
      {notes.length > 0 ? (
        <div className="space-y-2">
          {notes.map((note) => (
            <div
              key={note.id}
              className="card-base p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-foreground wrap-break-word whitespace-pre-wrap">{note.text}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(note.createdAt).toLocaleDateString()}{' '}
                  {new Date(note.createdAt).toLocaleTimeString()}
                </p>
              </div>

              <div className="shrink-0 flex gap-2">
                <button
                  onClick={() => handleCopyNote(note.text, note.id)}
                  className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors"
                  aria-label="Copy note"
                >
                  {copied === note.id ? <Check size={18} /> : <Copy size={18} />}
                </button>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"
                  aria-label="Delete note"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-base p-8 text-center">
          <p className="text-muted-foreground">No notes yet. Add one to get started!</p>
        </div>
      )}

      {/* Clear All Button */}
      {notes.length > 0 && (
        <button
          onClick={handleClearAll}
          className="w-full btn-secondary flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
        >
          <Trash2 size={18} /> Clear All Notes
        </button>
      )}
    </div>
  )
}
