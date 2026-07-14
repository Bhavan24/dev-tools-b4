import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { endpoint, headers: reqHeaders = {}, query, variables } = await request.json()

    if (!endpoint || typeof endpoint !== 'string') {
      return NextResponse.json({ error: 'endpoint is required' }, { status: 400 })
    }

    let url: URL
    try {
      url = new URL(endpoint)
    } catch {
      return NextResponse.json({ error: `Invalid endpoint URL: ${endpoint}` }, { status: 400 })
    }

    if (!['https:', 'http:'].includes(url.protocol)) {
      return NextResponse.json({ error: 'Endpoint must use http or https' }, { status: 400 })
    }

    const body: Record<string, any> = { query }
    if (variables) body.variables = variables

    const mergedHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...reqHeaders,
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: mergedHeaders,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
    })

    let data: any
    const ct = res.headers.get('content-type') ?? ''
    if (ct.includes('json')) {
      data = await res.json()
    } else {
      const text = await res.text()
      data = { raw: text }
    }

    return NextResponse.json({ result: data })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'GraphQL request failed' },
      { status: 400 }
    )
  }
}
