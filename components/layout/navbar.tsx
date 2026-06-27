'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Code2, Menu, X, Sun, Moon, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/auth-provider'

export function Navbar() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check initial theme
    const isDarkMode = document.documentElement.classList.contains('dark')
    setIsDark(isDarkMode)
  }, [])

  const toggleTheme = () => {
    const html = document.documentElement
    const newIsDark = !isDark
    if (newIsDark) {
      html.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      html.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
    setIsDark(newIsDark)
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container-main flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <Code2 size={24} />
          <span className="hidden sm:inline">DevTools</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/tools"
            className="text-foreground transition-colors hover:text-primary"
          >
            Public Tools
          </Link>
          {user && (
            <Link
              href="/dashboard"
              className="text-foreground transition-colors hover:text-primary"
            >
              Dashboard
            </Link>
          )}
          <Link
            href="#"
            className="text-foreground transition-colors hover:text-primary"
          >
            Docs
          </Link>
        </div>

        {/* Right Section */}
        <div className="hidden md:flex items-center gap-4">
          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          )}

          {/* Auth Buttons */}
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="btn-secondary text-sm flex items-center gap-2"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="btn-secondary text-sm">
                Sign In
              </Link>
              <Link href="/register" className="btn-primary text-sm">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-card animate-in fade-in slide-in-from-top duration-200">
          <div className="container-main py-4 flex flex-col gap-4">
            <Link
              href="/tools"
              className="text-foreground transition-colors hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              Public Tools
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className="text-foreground transition-colors hover:text-primary"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
            )}
            <Link
              href="#"
              className="text-foreground transition-colors hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              Docs
            </Link>

            {/* Mobile Theme Toggle */}
            {mounted && (
              <button
                onClick={() => {
                  toggleTheme()
                  setIsOpen(false)
                }}
                className="flex items-center gap-2 text-foreground hover:text-primary transition-colors py-2"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </button>
            )}

            <div className="flex gap-3 pt-4 flex-col">
              {user ? (
                <>
                  <div className="text-sm px-4 py-2 bg-secondary rounded-lg">
                    <p className="font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsOpen(false)
                    }}
                    className="btn-secondary text-sm flex items-center justify-center gap-2"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn-secondary text-sm text-center">
                    Sign In
                  </Link>
                  <Link href="/register" className="btn-primary text-sm text-center">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
