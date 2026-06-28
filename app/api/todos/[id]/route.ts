import { NextRequest, NextResponse } from 'next/server'
import { updateTodo, deleteTodo } from '@/lib/db'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'

function getAuthUserId(request: NextRequest): number | null {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) {
    return null
  }

  const token = extractTokenFromHeader(authHeader)
  if (!token) {
    return null
  }

  const payload = verifyToken(token)
  return payload?.userId ?? null
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = getAuthUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { text, completed, priority } = await request.json()

    const todo = await updateTodo(parseInt(id), userId, text, completed, priority)
    if (!todo) {
      return NextResponse.json({ error: 'Todo not found or unauthorized' }, { status: 404 })
    }

    return NextResponse.json({ todo })
  } catch (error) {
    console.error('Update todo error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = getAuthUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const success = await deleteTodo(parseInt(id), userId)
    if (!success) {
      return NextResponse.json({ error: 'Todo not found or unauthorized' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete todo error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
