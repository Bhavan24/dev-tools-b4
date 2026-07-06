'use client'

import { Suspense, useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { TOOLS, TOOLS_CATEGORIES, CATEGORY_INFO } from '@/lib/constants'
import { ToolCard } from '@/components/tools/tool-card'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { usePinnedTools } from '@/hooks/use-pinned-tools'
import * as LucideIcons from 'lucide-react'

interface HomeClientProps {
  mcpToolIds: readonly string[]
}

function HomePageContent({ mcpToolIds }: HomeClientProps) {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const { pinnedIds, togglePin, isPinned, isHydrated } = usePinnedTools()

  const mcpSet = useMemo(() => new Set(mcpToolIds), [mcpToolIds])

  useEffect(() => {
    const categoryParam = searchParams.get('category')
    if (categoryParam) {
      setSelectedCategory(categoryParam)
    }
  }, [searchParams])

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
                    mcpEnabled={mcpSet.has(tool.id)}
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
                  mcpEnabled={mcpSet.has(tool.id)}
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

export function HomeClient({ mcpToolIds }: HomeClientProps) {
  return (
    <Suspense fallback={null}>
      <HomePageContent mcpToolIds={mcpToolIds} />
    </Suspense>
  )
}
