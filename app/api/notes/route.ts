import { NextRequest, NextResponse } from 'next/server'
import { getNotesByUser, createNote } from '@/lib/db'
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

    const notes = getNotesByUser(userId)
    return NextResponse.json({ notes })
  } catch (error) {
    console.error('Get notes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getAuthUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, content, tags } = await request.json()

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content required' }, { status: 400 })
    }

    const note = createNote(userId, title, content, tags || [])
    return NextResponse.json({ note })
  } catch (error) {
    console.error('Create note error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
