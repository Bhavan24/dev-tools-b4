import Database from 'better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'database.sqlite')
const db = new Database(dbPath)

// Enable foreign keys
db.pragma('foreign_keys = ON')

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    priority TEXT DEFAULT 'low',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
  CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
`)

// User functions
export interface User {
  id: number
  email: string
  password_hash: string
  name: string
  created_at: string
}

export function getUserByEmail(email: string): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?')
  return stmt.get(email) as User | undefined
}

export function getUserById(id: number): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?')
  return stmt.get(id) as User | undefined
}

export function createUser(email: string, passwordHash: string, name: string): User {
  const stmt = db.prepare(
    'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)'
  )
  const result = stmt.run(email, passwordHash, name)
  return getUserById(result.lastInsertRowid as number)!
}

// Note functions
export interface Note {
  id: number
  user_id: number
  title: string
  content: string
  tags: string
  created_at: string
  updated_at: string
}

export function getNotesByUser(userId: number): Note[] {
  const stmt = db.prepare(
    'SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC'
  )
  return stmt.all(userId) as Note[]
}

export function getNoteById(id: number, userId: number): Note | undefined {
  const stmt = db.prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?')
  return stmt.get(id, userId) as Note | undefined
}

export function createNote(
  userId: number,
  title: string,
  content: string,
  tags: string[] = []
): Note {
  const stmt = db.prepare(
    'INSERT INTO notes (user_id, title, content, tags) VALUES (?, ?, ?, ?)'
  )
  const result = stmt.run(userId, title, content, JSON.stringify(tags))
  return getNoteById(result.lastInsertRowid as number, userId)!
}

export function updateNote(
  id: number,
  userId: number,
  title: string,
  content: string,
  tags: string[]
): Note | undefined {
  const stmt = db.prepare(
    'UPDATE notes SET title = ?, content = ?, tags = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?'
  )
  stmt.run(title, content, JSON.stringify(tags), id, userId)
  return getNoteById(id, userId)
}

export function deleteNote(id: number, userId: number): boolean {
  const stmt = db.prepare('DELETE FROM notes WHERE id = ? AND user_id = ?')
  const result = stmt.run(id, userId)
  return (result.changes ?? 0) > 0
}

// Todo functions
export interface Todo {
  id: number
  user_id: number
  text: string
  completed: number
  priority: 'low' | 'medium' | 'high'
  created_at: string
}

export function getTodosByUser(userId: number): Todo[] {
  const stmt = db.prepare(
    'SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC'
  )
  return stmt.all(userId) as Todo[]
}

export function getTodoById(id: number, userId: number): Todo | undefined {
  const stmt = db.prepare('SELECT * FROM todos WHERE id = ? AND user_id = ?')
  return stmt.get(id, userId) as Todo | undefined
}

export function createTodo(
  userId: number,
  text: string,
  priority: 'low' | 'medium' | 'high' = 'low'
): Todo {
  const stmt = db.prepare(
    'INSERT INTO todos (user_id, text, priority) VALUES (?, ?, ?)'
  )
  const result = stmt.run(userId, text, priority)
  return getTodoById(result.lastInsertRowid as number, userId)!
}

export function updateTodo(
  id: number,
  userId: number,
  text?: string,
  completed?: number,
  priority?: 'low' | 'medium' | 'high'
): Todo | undefined {
  const updates: string[] = []
  const params: (string | number)[] = []

  if (text !== undefined) {
    updates.push('text = ?')
    params.push(text)
  }
  if (completed !== undefined) {
    updates.push('completed = ?')
    params.push(completed)
  }
  if (priority !== undefined) {
    updates.push('priority = ?')
    params.push(priority)
  }

  if (updates.length === 0) return getTodoById(id, userId)

  const stmt = db.prepare(
    `UPDATE todos SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`
  )
  stmt.run(...params, id, userId)
  return getTodoById(id, userId)
}

export function deleteTodo(id: number, userId: number): boolean {
  const stmt = db.prepare('DELETE FROM todos WHERE id = ? AND user_id = ?')
  const result = stmt.run(id, userId)
  return (result.changes ?? 0) > 0
}

export default db
