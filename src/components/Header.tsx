'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LogIn, LogOut, User, Menu, X } from 'lucide-react'

interface HeaderProps {
  user: { email?: string | null; id: string } | null
  loading?: boolean
}

export function Header({ user, loading = false }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    const response = await fetch('/auth/logout', { method: 'POST' })
    if (response.ok) {
      window.location.href = '/'
    }
  }

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <div className="bg-gradient-to-r from-rose-400 via-orange-400 to-amber-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="min-w-0" onClick={closeMobileMenu}>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
                EasyAsk
              </h1>
              <p className="text-gray-800 text-xs sm:text-sm mt-0.5 hidden sm:block">
                Your content. Your rules. Zero hallucinations.
              </p>
            </Link>
          </div>

          {/* Desktop Navigation (hidden on mobile/tablet) */}
          {!loading && user && (
            <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
              <Link
                href="/test"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur transition-all duration-200 text-gray-900 text-sm font-medium whitespace-nowrap"
              >
                Test Page
              </Link>
              <Link
                href="/admin"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur transition-all duration-200 text-gray-900 text-sm font-medium whitespace-nowrap"
              >
                Reports
              </Link>
              <Link
                href="/admin/escalations"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur transition-all duration-200 text-gray-900 text-sm font-medium whitespace-nowrap"
              >
                Escalations
              </Link>
              <Link
                href="/admin/pages"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur transition-all duration-200 text-gray-900 text-sm font-medium whitespace-nowrap"
              >
                Pages
              </Link>
              <Link
                href="/admin/content"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur transition-all duration-200 text-gray-900 text-sm font-medium whitespace-nowrap"
              >
                Knowledgebase
              </Link>

              {/* User Email Display */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/20 backdrop-blur text-gray-900 text-sm">
                <User className="w-4 h-4" />
                <span className="max-w-[150px] truncate">{user.email}</span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur transition-all duration-200 text-gray-900 text-sm font-medium whitespace-nowrap"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}

          {/* Mobile/Tablet Controls */}
          <div className="flex items-center gap-2 lg:hidden">
            {!loading && (
              <>
                {user ? (
                  <>
                    {/* Hamburger Menu Button */}
                    <button
                      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur transition-all duration-200 text-gray-900"
                      aria-label="Toggle menu"
                    >
                      {isMobileMenuOpen ? (
                        <X className="w-5 h-5" />
                      ) : (
                        <Menu className="w-5 h-5" />
                      )}
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur transition-all duration-200 text-gray-900 text-sm font-medium"
                  >
                    <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Login</span>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Menu Dropdown */}
      {!loading && user && isMobileMenuOpen && (
        <div className="lg:hidden border-t border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-2">
            <Link
              href="/test"
              onClick={closeMobileMenu}
              className="block w-full text-left px-4 py-3 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur transition-all duration-200 text-gray-900 text-sm font-medium"
            >
              Test Page
            </Link>
            <Link
              href="/admin"
              onClick={closeMobileMenu}
              className="block w-full text-left px-4 py-3 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur transition-all duration-200 text-gray-900 text-sm font-medium"
            >
              Reports
            </Link>
            <Link
              href="/admin/escalations"
              onClick={closeMobileMenu}
              className="block w-full text-left px-4 py-3 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur transition-all duration-200 text-gray-900 text-sm font-medium"
            >
              Escalations
            </Link>
            <Link
              href="/admin/pages"
              onClick={closeMobileMenu}
              className="block w-full text-left px-4 py-3 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur transition-all duration-200 text-gray-900 text-sm font-medium"
            >
              Pages
            </Link>
            <Link
              href="/admin/content"
              onClick={closeMobileMenu}
              className="block w-full text-left px-4 py-3 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur transition-all duration-200 text-gray-900 text-sm font-medium"
            >
              Knowledgebase
            </Link>

            {/* User Email */}
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/20 backdrop-blur text-gray-900 text-sm">
              <User className="w-4 h-4" />
              <span className="truncate">{user.email}</span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-3 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur transition-all duration-200 text-gray-900 text-sm font-medium"
            >
              <span className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
