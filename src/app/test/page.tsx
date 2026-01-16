'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Globe, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/Header'

// Dynamically import VoiceWidget (client-only component)
const VoiceWidget = dynamic(() => import('@/components/widget/VoiceWidget'), {
  ssr: false
})

interface WidgetPage {
  id: string
  page_url: string
  page_title: string
  created_at: string
}

export default function TestPage() {
  const [user, setUser] = useState<{ email?: string | null; id: string } | null>(null)
  const [widgetPages, setWidgetPages] = useState<WidgetPage[]>([])
  const [selectedPage, setSelectedPage] = useState<WidgetPage | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [organizationName, setOrganizationName] = useState<string>('')
  const [publishableKey, setPublishableKey] = useState<string>('')

  useEffect(() => {
    checkUser()
    fetchWidgetPages()
    fetchOrganization()
  }, [])

  const checkUser = async () => {
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (authUser) {
      setUser({ id: authUser.id, email: authUser.email })
    }
  }

  const fetchOrganization = async () => {
    try {
      const response = await fetch('/api/admin/user-info')
      const data = await response.json()
      if (data.organization?.name) {
        setOrganizationName(data.organization.name)
      }
      if (data.organization?.publishable_key) {
        setPublishableKey(data.organization.publishable_key)
      }
    } catch (error) {
      console.error('Error fetching organization:', error)
    }
  }

  const fetchWidgetPages = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/widget-pages?_t=${Date.now()}`, {
        cache: 'no-store'
      })
      const data = await response.json()
      const pages = data.pages || []
      setWidgetPages(pages)

      // Auto-select first page
      if (pages.length > 0) {
        setSelectedPage(pages[0])
      }
    } catch (error) {
      console.error('Error fetching widget pages:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      {/* Header */}
      <Header user={user} loading={loading} />

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Assistant Page Selector */}
        <div className="mb-6">
          <div className="bg-gray-800 rounded-lg shadow-lg px-4 py-3 border border-gray-700 max-w-md">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-medium text-gray-300">Testing Assistant Page</span>
            </div>

            {loading ? (
              <p className="text-sm text-gray-400">Loading pages...</p>
            ) : widgetPages.length === 0 ? (
              <div>
                <p className="text-sm text-red-400 mb-2">No assistant pages found</p>
                <a href="/admin/pages" className="text-xs text-blue-400 hover:text-blue-300">
                  Add a page →
                </a>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg flex items-center justify-between hover:border-gray-500 transition-colors"
                >
                  {selectedPage ? (
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{selectedPage.page_title}</p>
                      <p className="text-xs text-gray-400 truncate">{selectedPage.page_url}</p>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Select page...</span>
                  )}
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ml-2 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {widgetPages.map((page) => (
                      <button
                        key={page.id}
                        onClick={() => {
                          setSelectedPage(page)
                          setIsDropdownOpen(false)
                        }}
                        className={`w-full px-3 py-2 text-left hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0 ${
                          selectedPage?.id === page.id ? 'bg-gray-700' : ''
                        }`}
                      >
                        <p className="text-sm font-medium text-white truncate">{page.page_title}</p>
                        <p className="text-xs text-gray-400 truncate">{page.page_url}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedPage && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <p className="text-xs text-gray-400">
                  <span className="font-medium">Page URL:</span>
                  <br />
                  <code className="text-xs bg-gray-700 px-1 py-0.5 rounded mt-1 inline-block text-gray-300 break-all">
                    {selectedPage.page_url}
                  </code>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Test Instructions */}
        <div className="text-center mb-6">
          {selectedPage ? (
            <p className="text-gray-400 text-sm">
              Simulating the <span className="text-blue-400 font-medium">{selectedPage.page_title}</span> for <span className="text-purple-400 font-medium">{organizationName || 'your'}</span> website
            </p>
          ) : (
            <p className="text-gray-400 text-sm">Select a page to test the assistant</p>
          )}
        </div>
      </div>

      {/* Widget - Centered */}
      <div className="flex items-center justify-center">
        <VoiceWidget
          key={selectedPage?.page_url || 'no-page'}
          embedded={true}
          pageUrl={selectedPage?.page_url}
          apiKey={publishableKey}
        />
      </div>
    </div>
  )
}
