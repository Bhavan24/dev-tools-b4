import { NextRequest, NextResponse } from 'next/server'
import { updateNote, deleteNote } from '@/lib/db'
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

    const { title, content, tags } = await request.json()
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content required' }, { status: 400 })
    }

    const note = await updateNote(parseInt(id), userId, title, content, tags || [])
    if (!note) {
      return NextResponse.json({ error: 'Note not found or unauthorized' }, { status: 404 })
    }

    return NextResponse.json({ note })
  } catch (error) {
    console.error('Update note error:', error)
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

    const success = await deleteNote(parseInt(id), userId)
    if (!success) {
      return NextResponse.json({ error: 'Note not found or unauthorized' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete note error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
