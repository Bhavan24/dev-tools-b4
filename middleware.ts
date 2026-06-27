import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Only protect dashboard routes, not API routes (API routes handle auth themselves)
  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next()
  }

  // Dashboard auth check
  const authHeader = request.headers.get('Authorization') || request.cookies.get('auth_token')?.value

  let token: string | null = null

  if (authHeader) {
    if (typeof authHeader === 'string') {
      token = extractTokenFromHeader(authHeader)
    } else {
      token = authHeader
    }
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const payload = verifyToken(token)
  if (!payload) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
