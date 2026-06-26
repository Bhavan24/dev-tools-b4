'use client'

import Link from 'next/link'
import { Code2, Menu, X } from 'lucide-react'
import { useState } from 'react'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
          <Link
            href="/dashboard"
            className="text-foreground transition-colors hover:text-primary"
          >
            Dashboard
          </Link>
          <Link
            href="#"
            className="text-foreground transition-colors hover:text-primary"
          >
            Docs
          </Link>
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="#"
            className="btn-secondary text-sm"
          >
            Sign In
          </Link>
          <Link
            href="#"
            className="btn-primary text-sm"
          >
            Sign Up
          </Link>
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
            <Link
              href="/dashboard"
              className="text-foreground transition-colors hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="#"
              className="text-foreground transition-colors hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              Docs
            </Link>
            <div className="flex gap-3 pt-4">
              <Link href="#" className="btn-secondary text-sm flex-1 text-center">
                Sign In
              </Link>
              <Link href="#" className="btn-primary text-sm flex-1 text-center">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
