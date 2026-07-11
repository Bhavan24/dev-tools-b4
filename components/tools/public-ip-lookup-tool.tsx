'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useToolApi, OutputPanel } from './base/tool-layout'

export function PublicIpLookupTool() {
  const [result, setResult] = useState<unknown>(null)
  const { loading, error, copied, call, copy } = useToolApi('public-ip-lookup')

  const handleLookup = async () => {
    const res = await call({})
    if (res !== null) setResult(res)
  }

  const handleCopy = () => {
    if (!result) return
    copy(typeof result === 'string' ? result : JSON.stringify(result, null, 2))
  }

  return (
    <div className="space-y-4 max-w-lg">
      <button
        onClick={handleLookup}
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2 py-3"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Looking up...
          </>
        ) : (
          'Look Up My IP'
        )}
      </button>
      <OutputPanel result={result} error={error} copied={copied} onCopy={handleCopy} />
    </div>
  )
}
