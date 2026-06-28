import path from 'path'

let db: any = null
let initError: Error | null = null

async function getDb() {
  if (initError) {
    throw initError
  }

  if (!db) {
    try {
      const Database = (await import('better-sqlite3')).default
      const dbPath = path.join(process.cwd(), 'database.sqlite')
      db = new Database(dbPath)
      db.pragma('foreign_keys = ON')

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
    } catch (error) {
      initError = error instanceof Error ? error : new Error(String(error))
      throw initError
    }
  }
  return db
}

export interface User {
  id: number
  email: string
  password_hash: string
  name: string
  created_at: string
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const database = await getDb()
  const stmt = database.prepare('SELECT * FROM users WHERE email = ?')
  return stmt.get(email) as User | undefined
}

export async function getUserById(id: number): Promise<User | undefined> {
  const database = await getDb()
  const stmt = database.prepare('SELECT * FROM users WHERE id = ?')
  return stmt.get(id) as User | undefined
}

export async function createUser(email: string, passwordHash: string, name: string): Promise<User> {
  const database = await getDb()
  const stmt = database.prepare(
    'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)'
  )
  const result = stmt.run(email, passwordHash, name)
  return (await getUserById(result.lastInsertRowid as number))!
}

export interface Note {
  id: number
  user_id: number
  title: string
  content: string
  tags: string
  created_at: string
  updated_at: string
}

export async function getNotesByUser(userId: number): Promise<Note[]> {
  const database = await getDb()
  const stmt = database.prepare(
    'SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC'
  )
  return stmt.all(userId) as Note[]
}

export async function getNoteById(id: number, userId: number): Promise<Note | undefined> {
  const database = await getDb()
  const stmt = database.prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?')
  return stmt.get(id, userId) as Note | undefined
}

export async function createNote(
  userId: number,
  title: string,
  content: string,
  tags: string[] = []
): Promise<Note> {
  const database = await getDb()
  const stmt = database.prepare(
    'INSERT INTO notes (user_id, title, content, tags) VALUES (?, ?, ?, ?)'
  )
  const result = stmt.run(userId, title, content, JSON.stringify(tags))
  return (await getNoteById(result.lastInsertRowid as number, userId))!
}

export async function updateNote(
  id: number,
  userId: number,
  title: string,
  content: string,
  tags: string[]
): Promise<Note | undefined> {
  const database = await getDb()
  const stmt = database.prepare(
    'UPDATE notes SET title = ?, content = ?, tags = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?'
  )
  stmt.run(title, content, JSON.stringify(tags), id, userId)
  return await getNoteById(id, userId)
}

export async function deleteNote(id: number, userId: number): Promise<boolean> {
  const database = await getDb()
  const stmt = database.prepare('DELETE FROM notes WHERE id = ? AND user_id = ?')
  const result = stmt.run(id, userId)
  return (result.changes ?? 0) > 0
}

export interface Todo {
  id: number
  user_id: number
  text: string
  completed: number
  priority: 'low' | 'medium' | 'high'
  created_at: string
}

export async function getTodosByUser(userId: number): Promise<Todo[]> {
  const database = await getDb()
  const stmt = database.prepare(
    'SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC'
  )
  return stmt.all(userId) as Todo[]
}

export async function getTodoById(id: number, userId: number): Promise<Todo | undefined> {
  const database = await getDb()
  const stmt = database.prepare('SELECT * FROM todos WHERE id = ? AND user_id = ?')
  return stmt.get(id, userId) as Todo | undefined
}

export async function createTodo(
  userId: number,
  text: string,
  priority: 'low' | 'medium' | 'high' = 'low'
): Promise<Todo> {
  const database = await getDb()
  const stmt = database.prepare(
    'INSERT INTO todos (user_id, text, priority) VALUES (?, ?, ?)'
  )
  const result = stmt.run(userId, text, priority)
  return (await getTodoById(result.lastInsertRowid as number, userId))!
}

export async function updateTodo(
  id: number,
  userId: number,
  text?: string,
  completed?: number,
  priority?: 'low' | 'medium' | 'high'
): Promise<Todo | undefined> {
  const database = await getDb()
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

  if (updates.length === 0) return await getTodoById(id, userId)

  const stmt = database.prepare(
    `UPDATE todos SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`
  )
  stmt.run(...params, id, userId)
  return await getTodoById(id, userId)
}

export async function deleteTodo(id: number, userId: number): Promise<boolean> {
  const database = await getDb()
  const stmt = database.prepare('DELETE FROM todos WHERE id = ? AND user_id = ?')
  const result = stmt.run(id, userId)
  return (result.changes ?? 0) > 0
}
