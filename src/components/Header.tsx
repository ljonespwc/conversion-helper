'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogIn, Menu, X } from 'lucide-react'

interface HeaderProps {
  user: { email?: string | null; id: string } | null
  loading?: boolean
}

const NAV_ITEMS = [
  { href: '/test', label: 'Test Page' },
  { href: '/admin', label: 'Conversations' },
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/escalations', label: 'Escalations' },
  { href: '/admin/pages', label: 'Pages' },
  { href: '/admin/content', label: 'Content' },
  { href: '/admin/settings', label: 'Settings' },
] as const

function isActiveLink(pathname: string, href: string): boolean {
  if (href === '/admin') return pathname === '/admin'
  return pathname.startsWith(href)
}

export function Header({ user, loading = false }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

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
            <Link href="/" className="min-w-0 flex items-center gap-2.5" onClick={closeMobileMenu}>
              <img
                src="/images/main-logo.png"
                alt="EasyAsk"
                className="h-[42px] w-[42px] block"
              />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-gray-900 tracking-tight leading-none">
                  EasyAsk
                </span>
                <span className="text-[0.65rem] text-gray-800 mt-1 hidden sm:block">
                  Your content. No hallucinations.
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation (hidden on mobile/tablet) */}
          {!loading && user && (
            <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
              {NAV_ITEMS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl backdrop-blur transition-all duration-200 text-gray-900 text-sm font-medium whitespace-nowrap ${
                    isActiveLink(pathname, href)
                      ? 'bg-white/40'
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  {label}
                </Link>
              ))}

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="px-3 py-2.5 text-gray-900 text-sm font-medium opacity-75 hover:opacity-100 hover:underline underline-offset-[3px] transition-all duration-200 whitespace-nowrap"
              >
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
            {NAV_ITEMS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={closeMobileMenu}
                className={`block w-full text-left px-4 py-3 rounded-xl backdrop-blur transition-all duration-200 text-gray-900 text-sm font-medium ${
                  isActiveLink(pathname, href)
                    ? 'bg-white/40'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                {label}
              </Link>
            ))}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-3 text-gray-900 text-sm font-medium opacity-75 hover:opacity-100 hover:underline underline-offset-[3px] transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
