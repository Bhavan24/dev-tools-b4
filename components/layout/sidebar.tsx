'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Code2,
} from 'lucide-react'
import { useAuth } from '@/components/providers/auth-provider'

export function Sidebar() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/todo', label: 'Todo', icon: CheckSquare },
    { href: '/dashboard/notes', label: 'Notes', icon: FileText },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 md:hidden p-3 rounded-lg bg-primary text-primary-foreground shadow-lg z-40"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 z-30 md:relative md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-primary w-full">
            <Code2 size={24} />
            <span>DevTools</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-secondary transition-colors group"
              >
                <Icon size={20} className="group-hover:text-primary transition-colors" />
                <span className="group-hover:text-primary transition-colors">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-4">
          {user && (
            <div className="px-4 py-3 bg-secondary rounded-lg">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          )}
          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-secondary transition-colors group"
            onClick={() => {
              logout()
              router.push('/')
              setIsOpen(false)
            }}
          >
            <LogOut size={20} className="group-hover:text-red-500 transition-colors" />
            <span className="group-hover:text-red-500 transition-colors">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <button
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 md:hidden z-20"
        />
      )}
    </>
  )
}
