'use client'

import { useState } from 'react'
import {
  GripVertical,
  Bot,
  Wrench,
  Play,
  Square,
  Layers,
  Copy,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import {
  NODE_PALETTE,
  PALETTE_CATEGORY_LABELS,
  type NodePaletteItem,
  type NodeType,
  type WorkflowDefinition,
} from '@/lib/workflow-types'
import { WORKFLOW_TEMPLATES, type WorkflowTemplate } from '@/lib/workflow-templates'

interface WorkflowSidebarProps {
  onAddNode: (type: NodeType) => void
  onLoadTemplate: (def: WorkflowDefinition) => void
}

type Tab = 'nodes' | 'templates'

const CATEGORY_ORDER = ['flow', 'ai', 'tools'] as const

const ACCENT_DOT: Record<string, string> = {
  emerald: 'bg-emerald-500',
  slate: 'bg-slate-400',
  violet: 'bg-violet-500',
  sky: 'bg-sky-500',
}

const NODE_ICONS: Record<NodeType, React.ElementType> = {
  start: Play,
  end: Square,
  agent: Bot,
  tool: Wrench,
}

const TEMPLATE_CATEGORY_COLORS: Record<WorkflowTemplate['category'], string> = {
  basic: 'bg-emerald-500/15 text-emerald-500',
  routing: 'bg-amber-500/15 text-amber-500',
  'multi-agent': 'bg-violet-500/15 text-violet-400',
  tools: 'bg-sky-500/15 text-sky-500',
  advanced: 'bg-rose-500/15 text-rose-400',
}

const TEMPLATE_CATEGORY_ORDER: WorkflowTemplate['category'][] = [
  'basic',
  'routing',
  'tools',
  'multi-agent',
  'advanced',
]
const TEMPLATE_CATEGORY_LABELS: Record<WorkflowTemplate['category'], string> = {
  basic: 'Basic',
  routing: 'Routing',
  'multi-agent': 'Multi-Agent',
  tools: 'Tools',
  advanced: 'Advanced',
}

export function WorkflowSidebar({ onAddNode, onLoadTemplate }: WorkflowSidebarProps) {
  const [tab, setTab] = useState<Tab>('nodes')

  return (
    <div className="w-52 shrink-0 border-r border-border bg-card flex flex-col h-full overflow-hidden">
      {/* Tab switcher */}
      <div className="flex border-b border-border shrink-0">
        {(['nodes', 'templates'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              'flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors',
              tab === t
                ? 'text-foreground border-b-2 border-foreground bg-secondary/30'
                : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            {t === 'nodes' ? 'Nodes' : 'Templates'}
          </button>
        ))}
      </div>

      {tab === 'nodes' ? (
        <NodesPanel onAddNode={onAddNode} />
      ) : (
        <TemplatesPanel onLoadTemplate={onLoadTemplate} />
      )}
    </div>
  )
}

// ---- Nodes tab ----

function NodesPanel({ onAddNode }: { onAddNode: (type: NodeType) => void }) {
  const grouped = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: NODE_PALETTE.filter((p) => p.category === cat),
  }))

  const handleDragStart = (e: React.DragEvent, type: NodeType) => {
    e.dataTransfer.setData('application/workflow-node-type', type)
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto p-2.5 space-y-3.5">
        {grouped.map(({ cat, items }) => (
          <div key={cat}>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 px-1">
              {PALETTE_CATEGORY_LABELS[cat]}
            </p>
            <div className="space-y-1">
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
      <div className="px-3 py-2.5 border-t border-border shrink-0">
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Graphs follow <span className="font-semibold text-foreground/70">LangGraph</span>{' '}
          semantics. Click an edge to add a TypeScript condition.
        </p>
      </div>
    </>
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
  const Icon = NODE_ICONS[item.type]
  const dot = ACCENT_DOT[item.accentColor] ?? 'bg-muted-foreground'

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="flex items-center gap-2 px-2 py-2 rounded-xl border border-border bg-background hover:bg-secondary cursor-grab active:cursor-grabbing transition-colors select-none group"
      title={item.description}
    >
      <div className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
      <Icon size={12} className="text-muted-foreground shrink-0" />
      <span className="text-xs font-semibold text-foreground flex-1 truncate">{item.label}</span>
      <GripVertical
        size={10}
        className="text-muted-foreground/30 shrink-0 group-hover:text-muted-foreground transition-colors"
      />
    </div>
  )
}

// ---- Templates tab ----

function TemplatesPanel({ onLoadTemplate }: { onLoadTemplate: (def: WorkflowDefinition) => void }) {
  const [expandedCat, setExpandedCat] = useState<WorkflowTemplate['category'] | null>('basic')

  const grouped = TEMPLATE_CATEGORY_ORDER.map((cat) => ({
    cat,
    items: WORKFLOW_TEMPLATES.filter((t) => t.category === cat),
  })).filter(({ items }) => items.length > 0)

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-1">
      {grouped.map(({ cat, items }) => {
        const isOpen = expandedCat === cat
        return (
          <div key={cat}>
            <button
              onClick={() => setExpandedCat(isOpen ? null : cat)}
              className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-secondary transition-colors text-left"
            >
              {isOpen ? (
                <ChevronDown size={11} className="text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight size={11} className="text-muted-foreground shrink-0" />
              )}
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex-1">
                {TEMPLATE_CATEGORY_LABELS[cat]}
              </span>
              <span className="text-[9px] text-muted-foreground/60">{items.length}</span>
            </button>
            {isOpen && (
              <div className="space-y-1 mt-0.5 pl-1">
                {items.map((tpl) => (
                  <TemplateCard key={tpl.id} template={tpl} onLoad={onLoadTemplate} />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function TemplateCard({
  template,
  onLoad,
}: {
  template: WorkflowTemplate
  onLoad: (def: WorkflowDefinition) => void
}) {
  const [dragging, setDragging] = useState(false)
  const colorClass = TEMPLATE_CATEGORY_COLORS[template.category]

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/workflow-template-id', template.id)
    e.dataTransfer.effectAllowed = 'copy'
    setDragging(true)
  }

  const handleLoad = () => {
    onLoad({
      id: `wf-${Date.now()}`,
      name: template.definition.name,
      version: '2.0',
      nodes: template.definition.nodes,
      edges: template.definition.edges,
    })
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={() => setDragging(false)}
      className={[
        'px-2.5 py-2 rounded-xl border border-border bg-background',
        'hover:border-foreground/20 hover:bg-secondary/50 transition-colors select-none',
        'cursor-grab active:cursor-grabbing',
        dragging ? 'opacity-50' : '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-1 mb-1">
        <p className="text-[11px] font-semibold text-foreground leading-tight flex-1">
          {template.name}
        </p>
        <button
          onClick={handleLoad}
          title="Load template"
          className="shrink-0 p-0.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          <Copy size={10} />
        </button>
      </div>
      <p className="text-[10px] text-muted-foreground leading-relaxed mb-1.5 line-clamp-2">
        {template.description}
      </p>
      <div className="flex flex-wrap gap-1">
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${colorClass}`}>
          {TEMPLATE_CATEGORY_LABELS[template.category]}
        </span>
        <span className="text-[9px] text-muted-foreground/60 px-1 py-0.5">
          {template.definition.nodes.length} nodes
        </span>
      </div>
    </div>
  )
}
