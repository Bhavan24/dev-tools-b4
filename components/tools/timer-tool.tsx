'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Flag, Trash2 } from 'lucide-react'

const STORAGE_KEY = 'dev-tools-timer-laps'

interface Lap {
  id: number
  lapTime: number
  totalTime: number
}

function formatTime(ms: number, showMs = true): string {
  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  const centiseconds = Math.floor((ms % 1000) / 10)

  const hh = String(hours).padStart(2, '0')
  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')
  const cs = String(centiseconds).padStart(2, '0')

  if (!showMs) return `${hh}:${mm}:${ss}`
  return `${hh}:${mm}:${ss}.${cs}`
}

export function TimerTool() {
  const [elapsed, setElapsed] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [laps, setLaps] = useState<Lap[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  const startTimeRef = useRef<number | null>(null)
  const elapsedAtPauseRef = useRef(0)
  const animFrameRef = useRef<number | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setLaps(JSON.parse(saved))
      } catch {
        setLaps([])
      }
    }
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(laps))
    }
  }, [laps, isHydrated])

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now() - elapsedAtPauseRef.current

      const tick = () => {
        setElapsed(performance.now() - startTimeRef.current!)
        animFrameRef.current = requestAnimationFrame(tick)
      }
      animFrameRef.current = requestAnimationFrame(tick)
    } else {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current)
        animFrameRef.current = null
      }
      elapsedAtPauseRef.current = elapsed
    }

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [isRunning])

  const handleStartStop = () => {
    setIsRunning((r) => !r)
  }

  const handleReset = () => {
    setIsRunning(false)
    setElapsed(0)
    elapsedAtPauseRef.current = 0
    startTimeRef.current = null
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
  }

  const handleLap = () => {
    if (!isRunning && elapsed === 0) return
    const lastTotal = laps.length > 0 ? laps[laps.length - 1].totalTime : 0
    const lapTime = elapsed - lastTotal
    setLaps((prev) => [
      ...prev,
      { id: prev.length + 1, lapTime, totalTime: elapsed },
    ])
  }

  const handleClearLaps = () => {
    setLaps([])
    localStorage.removeItem(STORAGE_KEY)
  }

  const fastestLap = laps.length > 1
    ? Math.min(...laps.map((l) => l.lapTime))
    : null
  const slowestLap = laps.length > 1
    ? Math.max(...laps.map((l) => l.lapTime))
    : null

  if (!isHydrated) {
    return <div className="h-64 bg-muted animate-pulse rounded-lg" />
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Display */}
      <div className="card-base p-8 text-center">
        <div className="text-5xl md:text-6xl font-mono font-bold tracking-tight text-foreground tabular-nums">
          {formatTime(elapsed)}
        </div>
        {laps.length > 0 && (
          <div className="mt-2 text-sm text-muted-foreground font-mono">
            Lap {laps.length + 1} - {formatTime(elapsed - laps[laps.length - 1].totalTime)}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={handleLap}
          disabled={!isRunning && elapsed === 0}
          className="btn-secondary flex items-center justify-center gap-2 py-3 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Flag size={18} />
          <span>Lap</span>
        </button>

        <button
          onClick={handleStartStop}
          className={`flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${
            isRunning
              ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isRunning ? <Pause size={18} /> : <Play size={18} />}
          <span>{isRunning ? 'Pause' : elapsed > 0 ? 'Resume' : 'Start'}</span>
        </button>

        <button
          onClick={handleReset}
          disabled={elapsed === 0 && !isRunning}
          className="btn-secondary flex items-center justify-center gap-2 py-3 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RotateCcw size={18} />
          <span>Reset</span>
        </button>
      </div>

      {/* Laps */}
      {laps.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Laps ({laps.length})
            </h3>
            <button
              onClick={handleClearLaps}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors"
            >
              <Trash2 size={14} />
              Clear
            </button>
          </div>

          <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
            {[...laps].reverse().map((lap) => {
              const isFastest = fastestLap !== null && lap.lapTime === fastestLap
              const isSlowest = slowestLap !== null && lap.lapTime === slowestLap

              return (
                <div
                  key={lap.id}
                  className={`flex items-center justify-between px-4 py-3 text-sm font-mono ${
                    isFastest
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : isSlowest
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                      : 'bg-background'
                  }`}
                >
                  <span className="font-medium">
                    Lap {lap.id}
                    {isFastest && (
                      <span className="ml-2 text-xs font-normal opacity-70">fastest</span>
                    )}
                    {isSlowest && (
                      <span className="ml-2 text-xs font-normal opacity-70">slowest</span>
                    )}
                  </span>
                  <div className="flex gap-6 text-right">
                    <div>
                      <div className="text-xs text-muted-foreground mb-0.5">Lap</div>
                      <div>{formatTime(lap.lapTime)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-0.5">Total</div>
                      <div>{formatTime(lap.totalTime)}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
