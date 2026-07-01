import Link from 'next/link'
import { LucideIcon } from 'lucide-react'
import { ArrowRight, Pin, PinOff } from 'lucide-react'
import { CATEGORY_INFO } from '@/lib/constants'

interface ToolCardProps {
  id: string
  name: string
  description: string
  icon: LucideIcon
  category?: string
  isPinned?: boolean
  onTogglePin?: (e: React.MouseEvent, id: string) => void
  comingSoon?: boolean
}

const categoryGradients: Record<string, string> = {
  developer: 'from-blue-500 to-blue-600',
  validation: 'from-purple-500 to-purple-600',
  formatter: 'from-cyan-500 to-cyan-600',
  converter: 'from-orange-500 to-orange-600',
}

export function ToolCard({ id, name, description, icon: Icon, category = 'developer', isPinned, onTogglePin, comingSoon = false }: ToolCardProps) {
  const gradient = categoryGradients[category] || 'from-blue-500 to-blue-600'
  const categoryInfo = CATEGORY_INFO[category as keyof typeof CATEGORY_INFO]

  const handlePinClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onTogglePin?.(e, id)
  }

  return (
    <div className="relative h-full">
      <Link href={`/tools/${id}`} className="h-full block">
        <div className="group bg-white/70 dark:bg-slate-800/70 backdrop-blur border border-white/30 dark:border-white/10 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer h-full flex flex-col">
          {/* Pin Button - Always Visible */}
          {onTogglePin && (
            <button
              onClick={handlePinClick}
              className="absolute top-3 right-3 z-20 p-1.5 rounded-lg bg-white/80 dark:bg-slate-700/80 hover:bg-white dark:hover:bg-slate-600 text-muted-foreground hover:text-primary transition-all"
              title={isPinned ? 'Unpin tool' : 'Pin tool'}
            >
              {isPinned ? <PinOff size={18} className="text-yellow-500" /> : <Pin size={18} />}
            </button>
          )}

          {/* Icon */}
          <div className={`p-2.5 rounded-lg bg-linear-to-br ${gradient} w-fit mb-3 group-hover:scale-110 transition-transform`}>
            <Icon size={24} className="text-white" />
          </div>

          {/* Title and Category */}
          <div className="mb-2 flex-1">
            <div className="flex items-start gap-2">
              <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {name}
              </h3>
              {comingSoon && (
                <span className="text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-1 rounded whitespace-nowrap mt-0.5">
                  Coming Soon
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">
            {description}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold bg-linear-to-r ${gradient} text-white px-2 py-1 rounded`}>
              {categoryInfo?.name || category}
            </span>
            <ArrowRight size={16} className="text-primary group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </div>
  )
}
