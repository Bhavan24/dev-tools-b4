'use client'

import { useState, useMemo } from 'react'
import { TOOLS, TOOLS_CATEGORIES, CATEGORY_INFO } from '@/lib/constants'
import { ToolCard } from '@/components/tools/tool-card'
import { Search } from 'lucide-react'
import * as LucideIcons from 'lucide-react'

export default function ToolsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredTools = useMemo(() => {
    return TOOLS.filter((tool) => {
      const matchesSearch =
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory =
        !selectedCategory || tool.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])

  const categories = Object.values(TOOLS_CATEGORIES)

  return (
    <div className="container-main py-12 md:py-16">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
          Developer Tools
        </h1>
        <p className="text-lg text-muted-foreground text-balance">
          {TOOLS.length}+ free tools to boost your development workflow
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-base pl-12 py-3 text-base"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-12">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              selectedCategory === null
                ? 'btn-primary'
                : 'btn-secondary'
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
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'btn-primary'
                    : 'btn-secondary'
                }`}
              >
                {info.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tools Grid */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => {
            const iconName = CATEGORY_INFO[tool.category].icon as keyof typeof LucideIcons
            const Icon = LucideIcons[iconName] as React.ComponentType<{ size: number }>
            return (
              <ToolCard
                key={tool.id}
                id={tool.id}
                name={tool.name}
                description={tool.description}
                icon={Icon}
              />
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground mb-4">
            No tools found matching your search.
          </p>
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
    </div>
  )
}
