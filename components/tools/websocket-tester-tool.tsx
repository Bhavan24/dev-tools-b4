'use client'
import { useState, useRef, useEffect } from 'react'
import { Play, Square, Send, Trash2 } from 'lucide-react'

interface Message {
  id: number
  direction: 'in' | 'out' | 'system'
  data: string
  ts: string
}

let msgId = 0

export function WebSocketTesterTool() {
  const [url, setUrl] = useState('')
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const wsRef = useRef<WebSocket | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const addMessage = (direction: Message['direction'], data: string) => {
    const ts = new Date().toLocaleTimeString('en-US', { hour12: false })
    setMessages((prev) => [...prev, { id: ++msgId, direction, data, ts }])
  }

  const handleConnect = () => {
    if (!url.trim()) return
    setConnecting(true)
    addMessage('system', `Connecting to ${url}...`)

    let ws: WebSocket
    try {
      ws = new WebSocket(url.trim())
    } catch (e: any) {
      addMessage('system', `Error: ${e.message}`)
      setConnecting(false)
      return
    }

    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      setConnecting(false)
      addMessage('system', 'Connected')
    }
    ws.onmessage = (ev) => {
      addMessage('in', typeof ev.data === 'string' ? ev.data : '[binary frame]')
    }
    ws.onerror = () => {
      addMessage('system', 'Connection error')
    }
    ws.onclose = (ev) => {
      setConnected(false)
      setConnecting(false)
      addMessage('system', `Disconnected (code ${ev.code}${ev.reason ? `: ${ev.reason}` : ''})`)
      wsRef.current = null
    }
  }

  const handleDisconnect = () => {
    wsRef.current?.close(1000, 'User closed connection')
  }

  const handleSend = () => {
    if (!input.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
    wsRef.current.send(input)
    addMessage('out', input)
    setInput('')
  }

  const directionStyle: Record<Message['direction'], string> = {
    in: 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300',
    out: 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300',
    system: 'bg-muted border-border text-muted-foreground',
  }

  const directionLabel: Record<Message['direction'], string> = {
    in: '↓ recv',
    out: '↑ sent',
    system: '-- sys',
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => !connected && !connecting && e.key === 'Enter' && handleConnect()}
          placeholder="wss://echo.websocket.org"
          disabled={connected || connecting}
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
            disabled={!url.trim() || connecting}
            className="btn-primary flex items-center gap-2 shrink-0"
          >
            <Play size={14} />
            {connecting ? 'Connecting...' : 'Connect'}
          </button>
        )}
      </div>

      <div className="border border-border rounded-lg h-72 overflow-auto p-3 space-y-1.5 font-mono text-xs bg-muted/20">
        {messages.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Connect to a WebSocket URL to see messages here.
          </p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex items-start gap-2 p-2 rounded border ${directionStyle[m.direction]}`}>
              <span className="shrink-0 opacity-60">{m.ts}</span>
              <span className="shrink-0 font-bold">{directionLabel[m.direction]}</span>
              <span className="flex-1 break-all whitespace-pre-wrap">{m.data}</span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={connected ? 'Type a message and press Enter...' : 'Connect first to send messages'}
          disabled={!connected}
          className="input-base flex-1 text-sm font-mono"
        />
        <button
          onClick={handleSend}
          disabled={!connected || !input.trim()}
          className="btn-primary flex items-center gap-2 shrink-0"
        >
          <Send size={14} />
          Send
        </button>
        <button
          onClick={() => setMessages([])}
          className="btn-secondary flex items-center gap-2 shrink-0"
          title="Clear messages"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        Messages are handled entirely in your browser. Try{' '}
        <button
          onClick={() => setUrl('wss://echo.websocket.org')}
          className="text-primary hover:underline"
        >
          wss://echo.websocket.org
        </button>{' '}
        as a test endpoint.
      </p>
    </div>
  )
}
