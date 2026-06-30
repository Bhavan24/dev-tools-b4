'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ToolsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Redirect to home and preserve category filter if present
    const category = searchParams.get('category')
    if (category) {
      router.replace(`/?category=${category}`)
    } else {
      router.replace('/')
    }
  }, [router, searchParams])

  // Show nothing while redirecting
  return null
}
