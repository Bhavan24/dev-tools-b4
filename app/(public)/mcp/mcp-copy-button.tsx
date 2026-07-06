'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

interface McpCopyButtonProps {
  text: string
  label?: string
  className?: string
}

export function McpCopyButton({ text, label = 'Copy', className = '' }: McpCopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors ${className || 'text-muted-foreground bg-muted hover:bg-muted/80'}`}
    >
      {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
      {copied ? 'Copied' : label}
    </button>
  )
}
