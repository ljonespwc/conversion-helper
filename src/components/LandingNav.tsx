'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { LogOut, User, Menu, X } from 'lucide-react'
import { EarlyAccessModal } from '@/components/landing/EarlyAccessModal'

interface LandingNavProps {
  user: { email?: string | null; id: string } | null
  loading?: boolean
}

export function LandingNav({ user, loading = false }: LandingNavProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    const response = await fetch('/auth/logout', { method: 'POST' })
    if (response.ok) {
      window.location.href = '/'
    }
  }

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <nav className={`landing-nav ${isScrolled ? 'scrolled' : ''}`}>
      <div className="landing-nav-container">
        <div className="landing-nav-content">
          {/* Logo */}
          <div className="landing-logo">
            <Link href="/" onClick={closeMobileMenu} className="landing-logo-link">
              <img
                src="/images/main-logo.png"
                alt="EasyAsk"
                className="landing-logo-img"
              />
              <div className="landing-logo-text-block">
                <span className="landing-logo-wordmark">EasyAsk</span>
                <span className="landing-logo-tagline">Your content. Your closer.</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {!loading && (
            <div className="landing-nav-desktop">
              {user ? (
                <>
                  <Link href="/test" className="landing-nav-link">
                    Test Page
                  </Link>
                  <Link href="/admin" className="landing-nav-link">
                    Reports
                  </Link>
                  <Link href="/admin/analytics" className="landing-nav-link">
                    Analytics
                  </Link>
                  <Link href="/admin/escalations" className="landing-nav-link">
                    Escalations
                  </Link>
                  <Link href="/admin/pages" className="landing-nav-link">
                    Pages
                  </Link>
                  <Link href="/admin/content" className="landing-nav-link">
                    Knowledgebase
                  </Link>

                  {/* User Email Display */}
                  <div className="landing-nav-user">
                    <User className="w-4 h-4" />
                    <span className="landing-nav-email">{user.email}</span>
                  </div>

                  {/* Logout Button */}
                  <button onClick={handleLogout} className="landing-nav-link">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/examples" className="landing-nav-link">
                    👀 Eavesdrop
                  </Link>
                  <Link href="/pricing" className="landing-nav-link">
                    Pricing
                  </Link>
                  <div className="landing-nav-spacer" />
                  <button onClick={() => setIsModalOpen(true)} className="landing-nav-cta-primary">
                    Get Early Access
                  </button>
                  <Link href="/login" className="landing-nav-link-login">
                    Login
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Mobile/Tablet Controls */}
          <div className="landing-nav-mobile-controls">
            {!loading && (
              <>
                {user ? (
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="landing-nav-hamburger"
                    aria-label="Toggle menu"
                  >
                    {isMobileMenuOpen ? (
                      <X className="w-5 h-5" />
                    ) : (
                      <Menu className="w-5 h-5" />
                    )}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                      className="landing-nav-hamburger"
                      aria-label="Toggle menu"
                    >
                      {isMobileMenuOpen ? (
                        <X className="w-5 h-5" />
                      ) : (
                        <Menu className="w-5 h-5" />
                      )}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Early Access Modal */}
      <EarlyAccessModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Mobile/Tablet Menu Dropdown - Logged In */}
      {!loading && user && isMobileMenuOpen && (
        <div className="landing-nav-mobile-menu">
          <div className="landing-nav-mobile-menu-content">
            <Link href="/test" onClick={closeMobileMenu} className="landing-nav-mobile-link">
              Test Page
            </Link>
            <Link href="/admin" onClick={closeMobileMenu} className="landing-nav-mobile-link">
              Reports
            </Link>
            <Link href="/admin/analytics" onClick={closeMobileMenu} className="landing-nav-mobile-link">
              Analytics
            </Link>
            <Link href="/admin/escalations" onClick={closeMobileMenu} className="landing-nav-mobile-link">
              Escalations
            </Link>
            <Link href="/admin/pages" onClick={closeMobileMenu} className="landing-nav-mobile-link">
              Pages
            </Link>
            <Link href="/admin/content" onClick={closeMobileMenu} className="landing-nav-mobile-link">
              Knowledgebase
            </Link>

            {/* User Email */}
            <div className="landing-nav-mobile-user">
              <User className="w-4 h-4" />
              <span>{user.email}</span>
            </div>

            {/* Logout Button */}
            <button onClick={handleLogout} className="landing-nav-mobile-link">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Mobile/Tablet Menu Dropdown - Logged Out */}
      {!loading && !user && isMobileMenuOpen && (
        <div className="landing-nav-mobile-menu">
          <div className="landing-nav-mobile-menu-content">
            <Link href="/examples" onClick={closeMobileMenu} className="landing-nav-mobile-link">
              👀 Eavesdrop
            </Link>
            <Link href="/pricing" onClick={closeMobileMenu} className="landing-nav-mobile-link">
              Pricing
            </Link>
            <button
              onClick={() => {
                closeMobileMenu()
                setIsModalOpen(true)
              }}
              className="landing-nav-mobile-cta-primary"
            >
              Get Early Access
            </button>
            <Link href="/login" onClick={closeMobileMenu} className="landing-nav-mobile-link-login">
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
