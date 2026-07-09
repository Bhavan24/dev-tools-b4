import { TOOLS } from '@/lib/constants'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ToolPageClient } from './tool-page-client'

export default async function ToolPage({ params }: { params: Promise<{ toolId: string }> }) {
  const { toolId } = await params
  const tool = TOOLS.find((t) => t.id === toolId)

  if (!tool) {
    return (
      <div className="container-main py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Tool not found</h1>
        <Link href="/tools" className="btn-primary">
          Back to Tools
        </Link>
      </div>
    )
  }

  return (
    <div className="container-main py-12">
      {/* Breadcrumb */}
      <Link
        href="/tools"
        className="inline-flex items-center gap-2 text-primary hover:text-accent mb-8 transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Tools
      </Link>

      {/* Tool Header */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{tool.name}</h1>
        <p className="text-lg text-muted-foreground">{tool.description}</p>
      </div>

      {/* Tool Interface */}
      <div className="card-base mb-8">
        <ToolPageClient toolId={toolId} />
      </div>
    </div>
  )
}
