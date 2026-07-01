'use client'

import { Suspense, useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, ChevronDown } from 'lucide-react'
import { TOOLS, TOOLS_CATEGORIES, CATEGORY_INFO } from '@/lib/constants'
import { ToolCard } from '@/components/tools/tool-card'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { usePinnedTools } from '@/hooks/use-pinned-tools'
import * as LucideIcons from 'lucide-react'

function HomePageContent() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [copiedEndpoint, setCopiedEndpoint] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [mcpOpen, setMcpOpen] = useState(false)
  const { pinnedIds, togglePin, isPinned, isHydrated } = usePinnedTools()

  useEffect(() => {
    const categoryParam = searchParams.get('category')
    if (categoryParam) {
      setSelectedCategory(categoryParam)
    }
  }, [searchParams])

  const mcpEndpoint = typeof window !== 'undefined'
    ? `${window.location.origin}/api/mcp`
    : 'https://ai-developer-tools.vercel.app/api/mcp'

  const handleCopyEndpoint = () => {
    navigator.clipboard.writeText(mcpEndpoint)
    setCopiedEndpoint(true)
    setTimeout(() => setCopiedEndpoint(false), 2000)
  }

  const handleCopyCode = () => {
    const code = `{
  "mcpServers": {
    "dev-tools": {
      "url": "${mcpEndpoint}"
    }
  }
}`
    navigator.clipboard.writeText(code)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const filteredTools = useMemo(() => {
    return TOOLS.filter((tool) => {
      const matchesSearch =
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = !selectedCategory || tool.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])

  const pinnedTools = useMemo(
    () => filteredTools.filter((tool) => pinnedIds.includes(tool.id)),
    [filteredTools, pinnedIds]
  )

  const categories = Object.values(TOOLS_CATEGORIES)

  const handleTogglePin = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    togglePin(id)
  }

  return (
    <>
      <Navbar />
      <main className="container-main py-8 md:py-12">
        {/* MCP Setup Accordion */}
        <div className="mb-8 border border-border rounded-lg">
          <button
            onClick={() => setMcpOpen(!mcpOpen)}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
          >
            <span className="text-sm font-semibold text-foreground">MCP Endpoint Setup</span>
            <ChevronDown
              size={18}
              className={`text-muted-foreground transition-transform duration-200 ${mcpOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {mcpOpen && (
            <div className="border-t border-border px-4 py-4 space-y-4 bg-muted/30">
              {/* MCP Endpoint */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Endpoint</p>
                <div className="flex items-center gap-2 bg-background rounded border border-border p-3">
                  <code className="flex-1 text-xs md:text-sm text-foreground font-mono break-all">
                    {mcpEndpoint}
                  </code>
                  <button
                    onClick={handleCopyEndpoint}
                    className="px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors bg-muted rounded hover:bg-muted/80 whitespace-nowrap"
                  >
                    {copiedEndpoint ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Configuration */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Configuration</p>
                <div className="relative bg-slate-900 text-slate-100 rounded-lg overflow-hidden text-xs md:text-sm">
                  <pre className="p-3 font-mono overflow-x-auto">
                    {`{
  "mcpServers": {
    "dev-tools": {
      "url": "${mcpEndpoint}"
    }
  }
}`}
                  </pre>
                  <button
                    onClick={handleCopyCode}
                    className="absolute top-2 right-2 px-2 py-1 text-xs font-medium text-slate-100 bg-slate-800 rounded hover:bg-slate-700 transition-colors"
                  >
                    {copiedCode ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search and Filter Section */}
        <div className="mb-12 space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="Search tools by name or function..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-base pl-12 py-3 text-base rounded-lg shadow-sm focus:shadow-md w-full"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-200 text-sm ${
                selectedCategory === null
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-secondary text-foreground hover:bg-muted'
              }`}
            >
              All Tools
            </button>
            {categories.map((category) => {
              const info = CATEGORY_INFO[category]
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-200 text-sm ${
                    selectedCategory === category
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'bg-secondary text-foreground hover:bg-muted'
                  }`}
                >
                  {info.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* Pinned Tools Section */}
        {isHydrated && pinnedTools.length > 0 && (
          <div className="mb-12">
            <h2 className="text-lg font-semibold text-foreground mb-4">📌 Pinned Tools ({pinnedTools.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8 pb-8 border-b border-border">
              {pinnedTools.map((tool) => {
                const iconName = CATEGORY_INFO[tool.category].icon as keyof typeof LucideIcons
                const Icon = LucideIcons[iconName] as any
                return (
                  <ToolCard
                    key={tool.id}
                    id={tool.id}
                    name={tool.name}
                    description={tool.description}
                    icon={Icon}
                    category={tool.category}
                    isPinned={isPinned(tool.id)}
                    onTogglePin={handleTogglePin}
                    comingSoon={(tool as any).comingSoon}
                  />
                )
              })}
            </div>
          </div>
        )}

        {/* All Tools Grid */}
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTools.map((tool) => {
              const iconName = CATEGORY_INFO[tool.category].icon as keyof typeof LucideIcons
              const Icon = LucideIcons[iconName] as any
              return (
                <ToolCard
                  key={tool.id}
                  id={tool.id}
                  name={tool.name}
                  description={tool.description}
                  icon={Icon}
                  category={tool.category}
                  isPinned={isPinned(tool.id)}
                  onTogglePin={handleTogglePin}
                  comingSoon={(tool as any).comingSoon}
                />
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground mb-4">No tools found matching your search.</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory(null)
              }}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomePageContent />
    </Suspense>
  )
}
