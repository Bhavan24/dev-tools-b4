'use client'

import Link from 'next/link'
import { Code2, Menu, X, Sun, Moon } from 'lucide-react'
import { useState, useEffect } from 'react'

export function Navbar() {
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
            Tools
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
              Tools
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
          </div>
        </div>
      )}
    </nav>
  )
}
