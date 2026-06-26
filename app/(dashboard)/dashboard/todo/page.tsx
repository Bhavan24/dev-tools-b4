'use client'

import { useState } from 'react'
import { Trash2, Plus, CheckCircle2, Circle } from 'lucide-react'

interface Todo {
  id: string
  text: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  createdAt: Date
}

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([
    {
      id: '1',
      text: 'Learn about new tools',
      completed: false,
      priority: 'high',
      createdAt: new Date(),
    },
    {
      id: '2',
      text: 'Organize developer utilities',
      completed: true,
      priority: 'medium',
      createdAt: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')

  const handleAddTodo = () => {
    if (!inputValue.trim()) return

    const newTodo: Todo = {
      id: Date.now().toString(),
      text: inputValue,
      completed: false,
      priority,
      createdAt: new Date(),
    }

    setTodos([newTodo, ...todos])
    setInputValue('')
  }

  const handleToggleTodo = (id: string) => {
    setTodos(todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const handleDeleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  const activeTodos = todos.filter((t) => !t.completed)
  const completedTodos = todos.filter((t) => t.completed)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500 bg-red-500/10'
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10'
      case 'low':
        return 'text-green-500 bg-green-500/10'
      default:
        return ''
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">My Tasks</h1>
        <p className="text-muted-foreground">Keep track of your development tasks</p>
      </div>

      {/* Add Todo Section */}
      <div className="card-base mb-8">
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
            placeholder="Add a new task..."
            className="input-base flex-1"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Todo['priority'])}
            className="input-base"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button onClick={handleAddTodo} className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            Add
          </button>
        </div>
      </div>

      {/* Todo Stats */}
      {todos.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card-base text-center">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-primary">{activeTodos.length}</p>
          </div>
          <div className="card-base text-center">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-green-500">{completedTodos.length}</p>
          </div>
          <div className="card-base text-center">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold text-foreground">{todos.length}</p>
          </div>
        </div>
      )}

      {/* Active Todos */}
      {activeTodos.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Active Tasks</h2>
          <div className="space-y-3">
            {activeTodos.map((todo) => (
              <div
                key={todo.id}
                className="card-base flex items-center gap-4 group"
              >
                <button
                  onClick={() => handleToggleTodo(todo.id)}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Circle size={24} />
                </button>
                <div className="flex-1">
                  <p className="text-foreground">{todo.text}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(todo.priority)}`}>
                  {todo.priority}
                </span>
                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Todos */}
      {completedTodos.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Completed</h2>
          <div className="space-y-3">
            {completedTodos.map((todo) => (
              <div
                key={todo.id}
                className="card-base flex items-center gap-4 opacity-60 group"
              >
                <button
                  onClick={() => handleToggleTodo(todo.id)}
                  className="text-green-500 transition-colors"
                >
                  <CheckCircle2 size={24} />
                </button>
                <div className="flex-1">
                  <p className="text-foreground line-through">{todo.text}</p>
                </div>
                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {todos.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">No tasks yet. Create your first one!</p>
        </div>
      )}
    </div>
  )
}
