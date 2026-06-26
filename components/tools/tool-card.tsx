import Link from 'next/link'
import { LucideIcon } from 'lucide-react'
import { ArrowRight } from 'lucide-react'

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
}

export function ToolCard({ id, name, description, icon: Icon, category = 'utility' }: ToolCardProps) {
  const gradient = categoryGradients[category] || categoryGradients.utility
  
  return (
    <Link href={`/tools/${id}`}>
      <div className={`group bg-gradient-to-br ${gradient} rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer min-h-56 flex flex-col justify-between`}>
        <div>
          <div className="p-3 rounded-lg bg-white/20 backdrop-blur-sm w-fit mb-4 group-hover:bg-white/30 transition-all group-hover:scale-110">
            <Icon size={28} className="text-white" />
          </div>
          <h3 className="font-bold text-lg text-white mb-3">
            {name}
          </h3>
          <p className="text-sm text-white/90 line-clamp-3">
            {description}
          </p>
        </div>
        <div className="flex items-center gap-2 text-white/90 text-sm font-semibold group-hover:gap-3 transition-all">
          <span>Open Tool</span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  )
}
