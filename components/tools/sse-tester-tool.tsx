'use client'
import { useState, useRef, useEffect } from 'react'
import { Play, Square, Trash2 } from 'lucide-react'

interface SseEvent {
  id: number
  type: string
  data: string
  ts: string
}

let evtId = 0

export function SseTesterTool() {
  const [url, setUrl] = useState('')
  const [connected, setConnected] = useState(false)
  const [events, setEvents] = useState<SseEvent[]>([])
  const [eventCount, setEventCount] = useState(0)
  const esRef = useRef<EventSource | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [events])

  const addEvent = (type: string, data: string) => {
    const ts = new Date().toLocaleTimeString('en-US', { hour12: false })
    setEvents((prev) => [...prev, { id: ++evtId, type, data, ts }])
    setEventCount((c) => c + 1)
  }

  const handleConnect = () => {
    if (!url.trim()) return
    addEvent('system', `Connecting to ${url}...`)

    let es: EventSource
    try {
      es = new EventSource(url.trim())
    } catch (e: any) {
      addEvent('system', `Error: ${e.message}`)
      return
    }

    esRef.current = es
    setConnected(true)

    es.onopen = () => {
      addEvent('system', 'Connection established')
    }

    es.onmessage = (ev) => {
      addEvent('message', ev.data)
    }

    es.onerror = () => {
      if (es.readyState === EventSource.CLOSED) {
        addEvent('system', 'Connection closed by server')
        setConnected(false)
        esRef.current = null
      } else {
        addEvent('system', 'Connection error - retrying...')
      }
    }

    // Catch named events - common patterns
    ;['ping', 'update', 'data', 'event', 'close', 'error', 'heartbeat'].forEach((name) => {
      es.addEventListener(name, (ev: MessageEvent) => {
        addEvent(name, ev.data)
      })
    })
  }

  const handleDisconnect = () => {
    esRef.current?.close()
    esRef.current = null
    setConnected(false)
    addEvent('system', 'Disconnected by user')
  }

  const typeStyle = (type: string) => {
    if (type === 'system') return 'bg-muted border-border text-muted-foreground'
    if (type === 'message') return 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300'
    return 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300'
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => !connected && e.key === 'Enter' && handleConnect()}
          placeholder="https://your-api.com/events"
          disabled={connected}
          className="input-base flex-1 font-mono text-sm"
        />
        {connected ? (
          <button onClick={handleDisconnect} className="btn-secondary flex items-center gap-2 shrink-0">
            <Square size={14} />
            Disconnect
          </button>
        ) : (
          <button
            onClick={handleConnect}
            disabled={!url.trim()}
            className="btn-primary flex items-center gap-2 shrink-0"
          >
            <Play size={14} />
            Connect
          </button>
        )}
      </div>

      {connected && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Listening - {eventCount} event{eventCount !== 1 ? 's' : ''} received
        </div>
      )}

      <div className="border border-border rounded-lg h-96 overflow-auto p-3 space-y-1.5 font-mono text-xs bg-muted/20">
        {events.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">
            Connect to an SSE endpoint to see events here.
          </p>
        ) : (
          events.map((e) => (
            <div key={e.id} className={`flex items-start gap-2 p-2 rounded border ${typeStyle(e.type)}`}>
              <span className="shrink-0 opacity-60">{e.ts}</span>
              <span className="shrink-0 font-bold min-w-[4rem]">{e.type}</span>
              <span className="flex-1 break-all whitespace-pre-wrap">{e.data}</span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => { setEvents([]); setEventCount(0) }}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <Trash2 size={14} />
          Clear
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        Uses the browser's native EventSource API.
        The endpoint must serve{' '}
        <span className="font-mono">text/event-stream</span> and allow CORS from this origin.
        Named events (ping, update, data, heartbeat, etc.) are captured automatically.
      </p>
    </div>
  )
}
