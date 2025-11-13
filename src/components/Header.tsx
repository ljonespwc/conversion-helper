'use client'

import Link from 'next/link'
import { LogIn, LogOut, User } from 'lucide-react'

interface HeaderProps {
  user: { email?: string | null; id: string } | null
  loading?: boolean
}

export function Header({ user, loading = false }: HeaderProps) {
  const handleLogout = async () => {
    const response = await fetch('/auth/logout', { method: 'POST' })
    if (response.ok) {
      window.location.href = '/'
    }
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link href="/" className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                EasyAsk
              </h1>
              <p className="text-white/90 text-sm sm:text-base mt-0.5">
                AI-powered assistant for your website
              </p>
            </Link>
          </div>

          {/* Navigation & Auth Controls */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {!loading && (
              <>
                {user ? (
                  <>
                    {/* Navigation links when logged in */}
                    <Link
                      href="/test"
                      className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur transition-all duration-200 text-white text-sm font-medium"
                    >
                      Test Page
                    </Link>
                    <Link
                      href="/admin"
                      className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur transition-all duration-200 text-white text-sm font-medium"
                    >
                      Analytics
                    </Link>
                    <Link
                      href="/admin/pages"
                      className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur transition-all duration-200 text-white text-sm font-medium"
                    >
                      Settings
                    </Link>
                    <Link
                      href="/admin/content"
                      className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur transition-all duration-200 text-white text-sm font-medium"
                    >
                      AI Content
                    </Link>

                    {/* User Email Display (desktop) */}
                    <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/20 backdrop-blur text-white text-sm">
                      <User className="w-4 h-4" />
                      <span className="max-w-[150px] truncate">{user.email}</span>
                    </div>

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur transition-all duration-200 text-white text-sm font-medium"
                      aria-label="Logout"
                    >
                      <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline">Logout</span>
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur transition-all duration-200 text-white text-sm font-medium"
                    aria-label="Login"
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
    </div>
  )
}
