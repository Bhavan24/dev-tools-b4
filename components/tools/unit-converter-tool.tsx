'use client'

import { useState } from 'react'
import { useToolApi, ToolShell, OutputPanel, ExecuteButton, InlineError } from './base/tool-layout'

const UNIT_OPTIONS: Record<string, string[]> = {
  Length: ['m', 'km', 'ft', 'mi'],
  Weight: ['kg', 'lb', 'g', 'oz'],
}

const ALL_UNITS = Object.values(UNIT_OPTIONS).flat()

export function UnitConverterTool() {
  const [value, setValue] = useState('1')
  const [fromUnit, setFromUnit] = useState('m')
  const [toUnit, setToUnit] = useState('km')
  const [result, setResult] = useState<unknown>(null)
  const { loading, error, copied, call, copy } = useToolApi('unit-converter')

  const handleConvert = async () => {
    const num = parseFloat(value)
    if (isNaN(num)) return
    const res = await call({ value: num, fromUnit, toUnit })
    if (res !== null) setResult(res)
  }

  const handleCopy = () => {
    if (!result) return
    copy(typeof result === 'string' ? result : JSON.stringify(result, null, 2))
  }

  return (
    <ToolShell
      left={
        <div className="space-y-4">
          <div>
            <label className="block font-medium text-foreground mb-2">Value</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="input-base"
              placeholder="Enter value"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-foreground mb-2">From</label>
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="input-base"
              >
                {ALL_UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-foreground mb-2">To</label>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="input-base"
              >
                {ALL_UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>
          <ExecuteButton onClick={handleConvert} loading={loading} label="Convert" />
        </div>
      }
      right={
        <OutputPanel result={result} error={error} copied={copied} onCopy={handleCopy} />
      }
    />
  )
}
