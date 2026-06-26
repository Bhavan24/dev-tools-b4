import { BarChart3, FileText, CheckSquare, Code2 } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const stats = [
    { icon: CheckSquare, label: 'Active Tasks', value: '12', color: 'text-blue-500' },
    { icon: FileText, label: 'Notes', value: '24', color: 'text-green-500' },
    { icon: BarChart3, label: 'Tools Used', value: '156', color: 'text-purple-500' },
    { icon: Code2, label: 'Conversion Runs', value: '1.2K', color: 'text-orange-500' },
  ]

  const recentTools = [
    { id: 'json-formatter', name: 'JSON Formatter' },
    { id: 'text-case', name: 'Text Case Converter' },
    { id: 'uuid-generator', name: 'UUID Generator' },
    { id: 'base64', name: 'Base64 Encoder' },
  ]

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Welcome back, Developer!</h1>
        <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your account</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="card-base">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-secondary ${stat.color}`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recently Used Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card-base">
          <h2 className="text-xl font-semibold text-foreground mb-6">Recently Used Tools</h2>
          <div className="space-y-3">
            {recentTools.map((tool) => (
              <Link
                key={tool.id}
                href={`/tools/${tool.id}`}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary hover:bg-muted transition-colors group"
              >
                <span className="text-foreground group-hover:text-primary transition-colors">
                  {tool.name}
                </span>
                <span className="text-muted-foreground group-hover:text-primary transition-colors">
                  →
                </span>
              </Link>
            ))}
          </div>
          <Link href="/tools" className="btn-secondary w-full mt-6">
            View All Tools
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="card-base">
          <h2 className="text-xl font-semibold text-foreground mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/dashboard/todo" className="btn-secondary block text-center">
              Create New Task
            </Link>
            <Link href="/dashboard/notes" className="btn-secondary block text-center">
              Write a Note
            </Link>
            <Link href="/tools" className="btn-primary block text-center">
              Explore Tools
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
