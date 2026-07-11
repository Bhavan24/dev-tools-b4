'use client'

import { GripVertical } from 'lucide-react'
import {
  NODE_PALETTE,
  PALETTE_CATEGORY_LABELS,
  type NodePaletteItem,
  type NodeType,
} from '@/lib/workflow-types'

interface WorkflowSidebarProps {
  onAddNode: (type: NodeType) => void
}

const CATEGORY_ORDER = ['io', 'ai', 'logic', 'data'] as const

export function WorkflowSidebar({ onAddNode }: WorkflowSidebarProps) {
  const grouped = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: NODE_PALETTE.filter((p) => p.category === cat),
  }))

  const handleDragStart = (e: React.DragEvent, type: NodeType) => {
    e.dataTransfer.setData('application/workflow-node-type', type)
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <div className="w-52 shrink-0 border-r border-border bg-card flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-secondary">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nodes</p>
        <p className="text-xs text-muted-foreground mt-0.5">Drag or click to add</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {grouped.map(({ cat, items }) => (
          <div key={cat}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
              {PALETTE_CATEGORY_LABELS[cat]}
            </p>
            <div className="space-y-1.5">
              {items.map((item) => (
                <PaletteItem
                  key={item.type}
                  item={item}
                  onDragStart={(e) => handleDragStart(e, item.type)}
                  onClick={() => onAddNode(item.type)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PaletteItem({
  item,
  onDragStart,
  onClick,
}: {
  item: NodePaletteItem
  onDragStart: (e: React.DragEvent) => void
  onClick: () => void
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="flex items-center gap-2 px-2 py-2 rounded-lg border border-border bg-background hover:bg-secondary cursor-grab active:cursor-grabbing transition-colors select-none"
      title={item.description}
    >
      <div className={`w-2 h-2 rounded-full shrink-0 ${item.color}`} />
      <span className="text-sm font-medium text-foreground flex-1 truncate">{item.label}</span>
      <GripVertical size={12} className="text-muted-foreground shrink-0" />
    </div>
  )
}
