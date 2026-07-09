'use client'

import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { copyToClipboard } from '@/lib/helpers'

interface CopyButtonProps {
  text: string
  className?: string
}

export function CopyButton({ text, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const success = await copyToClipboard(text)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground ${className}`}
      title="Copy to clipboard"
    >
      {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
    </button>
  )
}
