import Link from 'next/link'
import { LucideIcon } from 'lucide-react'
import { ArrowRight } from 'lucide-react'
import { CATEGORY_INFO } from '@/lib/constants'

interface ToolCardProps {
  id: string
  name: string
  description: string
  icon: LucideIcon
  category?: string
}

const categoryGradients: Record<string, string> = {
  utility: 'from-purple-500 to-purple-600',
  json: 'from-cyan-500 to-cyan-600',
  testing: 'from-amber-500 to-amber-600',
  text: 'from-pink-500 to-pink-600',
  time: 'from-green-500 to-green-600',
  finance: 'from-violet-500 to-violet-600',
  links: 'from-indigo-500 to-indigo-600',
  notes: 'from-blue-500 to-blue-600',
  miscellaneous: 'from-indigo-500 to-indigo-600',
}

export function ToolCard({ id, name, description, icon: Icon, category = 'utility' }: ToolCardProps) {
  const gradient = categoryGradients[category] || categoryGradients.utility
  const categoryInfo = CATEGORY_INFO[category as keyof typeof CATEGORY_INFO]

  return (
    <Link href={`/tools/${id}`}>
      <div className="group bg-white/70 dark:bg-slate-800/70 backdrop-blur border border-white/30 dark:border-white/10 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:border-primary/50 cursor-pointer min-h-56 flex flex-col justify-between">
        <div>
          <div className={`p-3 rounded-lg bg-linear-to-br ${gradient} w-fit mb-4 group-hover:scale-110 transition-transform`}>
            <Icon size={28} className="text-white" />
          </div>
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors flex-1">
              {name}
            </h3>
            <span className={`text-xs font-semibold bg-linear-to-r ${gradient} text-white px-2 py-1 rounded whitespace-nowrap ml-2`}>
              {categoryInfo?.name || category}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {description}
          </p>
        </div>
        <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all mt-4">
          <span>Open Tool</span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  )
}
