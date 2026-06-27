import { NextRequest, NextResponse } from 'next/server'
import { getTodosByUser, createTodo } from '@/lib/db'
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

export async function GET(request: NextRequest) {
  try {
    const userId = getAuthUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const todos = getTodosByUser(userId)
    return NextResponse.json({ todos })
  } catch (error) {
    console.error('Get todos error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getAuthUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { text, priority } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'Text required' }, { status: 400 })
    }

    const todo = createTodo(userId, text, priority || 'low')
    return NextResponse.json({ todo })
  } catch (error) {
    console.error('Create todo error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
