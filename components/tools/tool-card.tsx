import Link from 'next/link'
import { LucideIcon } from 'lucide-react'
import { ArrowRight } from 'lucide-react'

interface ToolCardProps {
  id: string
  name: string
  description: string
  icon: LucideIcon
}

export function ToolCard({ id, name, description, icon: Icon }: ToolCardProps) {
  return (
    <Link href={`/tools/${id}`}>
      <div className="card-base group cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Icon size={24} className="text-primary" />
          </div>
          <ArrowRight size={20} className="text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
        </div>
        <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          {name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
      </div>
    </Link>
  )
}
