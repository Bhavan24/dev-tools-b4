'use client'

import { useState } from 'react'
import { Trash2, Plus, Search } from 'lucide-react'

interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'JSON Formatting Tips',
      content: 'Always beautify JSON for readability. Use the JSON formatter tool to organize complex data structures.',
      tags: ['tips', 'json'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      title: 'Developer Tools Usage',
      content: 'The DevTools application provides quick access to essential utilities. Bookmark frequently used tools.',
      tags: ['tools', 'workflow'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')

  const handleCreateNote = () => {
    if (!title.trim() || !content.trim()) return

    const newNote: Note = {
      id: Date.now().toString(),
      title,
      content,
      tags: tags.split(',').map((t) => t.trim()).filter((t) => t),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setNotes([newNote, ...notes])
    resetForm()
  }

  const handleUpdateNote = () => {
    if (!selectedNote || !title.trim() || !content.trim()) return

    setNotes(
      notes.map((note) =>
        note.id === selectedNote.id
          ? {
              ...note,
              title,
              content,
              tags: tags.split(',').map((t) => t.trim()).filter((t) => t),
              updatedAt: new Date(),
            }
          : note
      )
    )
    resetForm()
  }

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id))
    resetForm()
  }

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note)
    setTitle(note.title)
    setContent(note.content)
    setTags(note.tags.join(', '))
  }

  const resetForm = () => {
    setSelectedNote(null)
    setTitle('')
    setContent('')
    setTags('')
  }

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-6 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Notes List */}
        <div className="lg:col-span-1">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-foreground mb-4">My Notes</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-base pl-10"
              />
            </div>
          </div>

          {/* Notes Count */}
          <div className="card-base mb-4 text-center">
            <p className="text-sm text-muted-foreground">Total Notes</p>
            <p className="text-2xl font-bold text-primary">{notes.length}</p>
          </div>

          {/* Notes List */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => handleSelectNote(note)}
                  className={`w-full text-left p-4 rounded-lg transition-all ${
                    selectedNote?.id === note.id
                      ? 'bg-primary/20 border-2 border-primary'
                      : 'bg-secondary hover:bg-muted border border-border'
                  }`}
                >
                  <p className="font-medium text-foreground line-clamp-1">{note.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {note.content}
                  </p>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {note.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 rounded bg-primary/20 text-primary"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </button>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No notes found</p>
            )}
          </div>

          {/* Empty State */}
          {notes.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No notes yet</p>
            </div>
          )}
        </div>

        {/* Note Editor */}
        <div className="lg:col-span-2">
          <div className="card-base">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              {selectedNote ? 'Edit Note' : 'Create New Note'}
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Note title..."
                  className="input-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your note here..."
                  className="input-base h-64"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tags</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Separate tags with commas"
                  className="input-base"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {selectedNote ? (
                <>
                  <button onClick={handleUpdateNote} className="btn-primary flex-1">
                    Update Note
                  </button>
                  <button
                    onClick={() => handleDeleteNote(selectedNote.id)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Trash2 size={20} />
                    Delete
                  </button>
                  <button onClick={resetForm} className="btn-secondary flex-1">
                    New Note
                  </button>
                </>
              ) : (
                <button
                  onClick={handleCreateNote}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  Create Note
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
