'use client'

import { Suspense } from 'react'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function ToolsPageContent() {
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

export default function ToolsPage() {
  return (
    <Suspense fallback={null}>
      <ToolsPageContent />
    </Suspense>
  )
}
