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
  const [viewportWidth, setViewportWidth] = useState<number>(0)

  useEffect(() => {
    checkUser()
    fetchWidgetPages()
    fetchOrganization()

    // Track viewport width for expand button visibility
    setViewportWidth(window.innerWidth)
    const handleResize = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header user={user} loading={loading} />

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Assistant Page Selector */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-lg px-4 py-3 border border-gray-200 max-w-md">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-medium text-gray-600">Testing Assistant Page</span>
            </div>

            {loading ? (
              <p className="text-sm text-gray-500">Loading pages...</p>
            ) : widgetPages.length === 0 ? (
              <div>
                <p className="text-sm text-red-600 mb-2">No assistant pages found</p>
                <a href="/admin/pages" className="text-xs text-orange-600 hover:text-orange-500">
                  Add a page →
                </a>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-between hover:border-gray-400 transition-colors"
                >
                  {selectedPage ? (
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{selectedPage.page_title}</p>
                      <p className="text-xs text-gray-500 truncate">{selectedPage.page_url}</p>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Select page...</span>
                  )}
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ml-2 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {widgetPages.map((page) => (
                      <button
                        key={page.id}
                        onClick={() => {
                          setSelectedPage(page)
                          setIsDropdownOpen(false)
                        }}
                        className={`w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors border-b border-gray-200 last:border-b-0 ${
                          selectedPage?.id === page.id ? 'bg-gray-100' : ''
                        }`}
                      >
                        <p className="text-sm font-medium text-gray-900 truncate">{page.page_title}</p>
                        <p className="text-xs text-gray-500 truncate">{page.page_url}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedPage && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  <span className="font-medium">Page URL:</span>
                  <br />
                  <code className="text-xs bg-gray-100 px-1 py-0.5 rounded mt-1 inline-block text-gray-600 break-all">
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
            <p className="text-gray-500 text-sm">
              Simulating the <span className="text-orange-600 font-medium">{selectedPage.page_title}</span> for <span className="text-orange-500 font-medium">{organizationName || 'your'}</span> website
            </p>
          ) : (
            <p className="text-gray-500 text-sm">Select a page to test the assistant</p>
          )}
        </div>
      </div>

      {/* Lorem Ipsum for testing blur effect */}
      <div className="max-w-4xl mx-auto px-8 py-12 text-gray-500 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Lorem Ipsum Dolor Sit Amet</h1>
        <p className="text-lg leading-relaxed">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
        <p className="leading-relaxed">Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
        <h2 className="text-2xl font-semibold text-gray-700 pt-4">Nemo Enim Ipsam Voluptatem</h2>
        <p className="leading-relaxed">Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.</p>
        <p className="leading-relaxed">Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?</p>
        <h2 className="text-2xl font-semibold text-gray-700 pt-4">At Vero Eos Et Accusamus</h2>
        <p className="leading-relaxed">At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.</p>
        <p className="leading-relaxed">Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.</p>
        <h2 className="text-2xl font-semibold text-gray-700 pt-4">Itaque Earum Rerum</h2>
        <p className="leading-relaxed">Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        <p className="leading-relaxed">Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        <p className="leading-relaxed">Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.</p>
      </div>

      {/* Widget - Centered */}
      <div className="flex items-center justify-center">
        <VoiceWidget
          key={selectedPage?.page_url || 'no-page'}
          embedded={true}
          pageUrl={selectedPage?.page_url}
          apiKey={publishableKey}
          viewportWidth={viewportWidth}
          forceActive={true}
          isTest={true}
        />
      </div>
    </div>
  )
}
