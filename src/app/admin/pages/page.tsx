'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/Header'
import { Plus, Trash2, Copy, CheckCircle } from 'lucide-react'

// Force dynamic rendering - prevent page caching
export const dynamic = 'force-dynamic'

interface WidgetPage {
  id: string
  user_id: string
  page_url: string
  page_title: string
  page_goal: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface UserInfo {
  id: string
  email: string | null
  organization_id: string
  organizations: {
    name: string
    website_url: string | null
    file_search_store_name: string | null
  }
}

export default function PagesPage() {
  const [pages, setPages] = useState<WidgetPage[]>([])
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    page_url: '',
    page_title: '',
    page_goal: ''
  })
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    fetchUserInfo()
    fetchPages()
  }, [])

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/admin/user-info')
      const data = await response.json()

      if (data.user) {
        setUserInfo(data.user as UserInfo)
      }
    } catch (error) {
      console.error('Error fetching user info:', error)
    }
  }

  const fetchPages = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/widget-pages')
      const data = await response.json()
      setPages(data.pages || [])
    } catch (error) {
      console.error('Error fetching pages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPage = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdding(true)
    setError(null)

    try {
      // Validate URL format
      if (!formData.page_url.match(/^https?:\/\//)) {
        throw new Error('Page URL must start with http:// or https://')
      }

      const response = await fetch('/api/admin/widget-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add page')
      }

      // Reset form and refresh list
      setFormData({ page_url: '', page_title: '', page_goal: '' })
      setShowAddForm(false)
      await fetchPages()
    } catch (error) {
      console.error('Error adding page:', error)
      setError(error instanceof Error ? error.message : 'Failed to add page')
    } finally {
      setAdding(false)
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      // Optimistic update
      setPages(prevPages =>
        prevPages.map(p => p.id === id ? { ...p, is_active: !currentStatus } : p)
      )

      const response = await fetch(`/api/admin/widget-pages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to toggle page status')
      }

      // Refresh to ensure consistency
      await fetchPages()
    } catch (error) {
      console.error('Error toggling page status:', error)
      alert('Failed to toggle page status')
      // Revert optimistic update
      await fetchPages()
    }
  }

  const handleDeletePage = async (id: string) => {
    if (!confirm('Are you sure you want to remove this page? The widget will no longer work on this page.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/widget-pages/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete page')
      }

      await fetchPages()
    } catch (error) {
      console.error('Error deleting page:', error)
      alert('Failed to delete page')
    }
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      <Header user={userInfo ? { id: userInfo.id, email: userInfo.email } : null} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Assistant Pages</h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Manage the pages where your assistant is deployed. Each page gets its own assistant instance with filtered content.
          </p>
        </div>

        {/* Quick Install - Universal Embed Code */}
        <div className="bg-gray-800 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-700 p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-2">Quick Install</h2>
          <p className="text-gray-300 mb-4 text-sm sm:text-base">
            Add this single line of code to <span className="font-semibold">all pages</span> where you want the assistant.
            The assistant automatically detects which page it's on and shows the right content.
          </p>

          <div className="relative">
            <pre className="bg-gray-950 text-gray-100 p-3 sm:p-4 rounded-lg overflow-x-auto border border-gray-700 text-xs sm:text-sm">
              <code>{`<script src="${process.env.NEXT_PUBLIC_APP_URL || 'https://easyask.io'}/widget.js"></script>`}</code>
            </pre>
            <button
              onClick={() => copyToClipboard(
                `<script src="${process.env.NEXT_PUBLIC_APP_URL || 'https://easyask.io'}/widget.js"></script>`,
                'universal-embed'
              )}
              className="absolute top-2 right-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium transition-all flex items-center gap-1 sm:gap-2 shadow-lg"
            >
              {copiedId === 'universal-embed' ? (
                <>
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs sm:text-sm text-gray-400 mt-3 sm:mt-4">
            Place this code before the closing <code className="text-gray-300 bg-gray-700 px-1.5 py-0.5 rounded">&lt;/body&gt;</code> tag.
            The assistant will appear as a chat button in the bottom-right corner.
          </p>
        </div>

        {/* Organization Info */}
        {userInfo && (
          <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-4">Organization Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400 font-medium">Organization:</span>
                <p className="text-white mt-1">{userInfo.organizations.name || 'Not set'}</p>
              </div>
              <div>
                <span className="text-gray-400 font-medium">Website:</span>
                <p className="text-white mt-1">{userInfo.organizations.website_url || 'Not set'}</p>
              </div>
              <div className="md:col-span-2">
                <span className="text-gray-400 font-medium">File Search Store:</span>
                <code className="block bg-gray-700 px-3 py-2 rounded text-xs mt-1 text-gray-300 break-all">
                  {userInfo.organizations.file_search_store_name || 'Not created'}
                </code>
              </div>
            </div>
          </div>
        )}

        {/* Add Page Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Assistant Page
          </button>
        </div>

        {/* Add Page Form */}
        {showAddForm && (
          <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Add New Assistant Page</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleAddPage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Page URL *
                </label>
                <input
                  type="url"
                  value={formData.page_url}
                  onChange={(e) => setFormData({ ...formData, page_url: e.target.value })}
                  placeholder="https://example.com/pricing"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Full URL of the page where you want to add the assistant
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Page Title *
                </label>
                <input
                  type="text"
                  value={formData.page_title}
                  onChange={(e) => setFormData({ ...formData, page_title: e.target.value })}
                  placeholder="Pricing Page"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Descriptive name for this page (for your reference)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Page Goal (Optional)
                </label>
                <select
                  value={formData.page_goal}
                  onChange={(e) => setFormData({ ...formData, page_goal: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                >
                  <option value="">No specific goal</option>
                  <option value="sell">Sell a product or service</option>
                  <option value="lead">Generate a lead</option>
                  <option value="support">Educate and support a customer</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  How should the assistant guide conversations on this page?
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={adding}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 transition-colors"
                >
                  {adding ? 'Adding...' : 'Add Page'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setError(null)
                  }}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Pages List */}
        {loading ? (
          <div className="bg-gray-800 rounded-lg shadow-md p-8 text-center border border-gray-700">
            <p className="text-gray-400">Loading pages...</p>
          </div>
        ) : pages.length === 0 ? (
          <div className="bg-gray-800 rounded-lg shadow-md p-8 text-center border border-gray-700">
            <p className="text-gray-400">No assistant pages yet. Add your first page to get started!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pages.map((page) => (
              <div
                key={page.id}
                className={`bg-gray-800 rounded-lg shadow-md p-6 border transition-colors ${
                  page.is_active
                    ? 'border-gray-700 hover:border-blue-500'
                    : 'border-gray-700 opacity-60'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className={`text-xl font-semibold ${page.is_active ? 'text-white' : 'text-gray-400'}`}>
                        {page.page_title}
                      </h3>
                      {!page.is_active && (
                        <span className="text-xs px-2 py-1 rounded-full font-medium bg-gray-700 text-gray-400 border border-gray-600">
                          Inactive
                        </span>
                      )}
                      {page.page_goal && (
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          page.page_goal === 'sell' ? 'bg-green-900/40 text-green-300 border border-green-700' :
                          page.page_goal === 'lead' ? 'bg-blue-900/40 text-blue-300 border border-blue-700' :
                          page.page_goal === 'support' ? 'bg-purple-900/40 text-purple-300 border border-purple-700' :
                          'bg-gray-700 text-gray-300'
                        }`}>
                          {page.page_goal === 'sell' ? 'Sell' :
                           page.page_goal === 'lead' ? 'Lead' :
                           page.page_goal === 'support' ? 'Support' : page.page_goal}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm break-all ${page.is_active ? 'text-blue-400' : 'text-gray-500'}`}>
                      {page.page_url}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Toggle Switch */}
                    <button
                      onClick={() => handleToggleActive(page.id, page.is_active)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        page.is_active ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                      title={page.is_active ? 'Click to disable widget' : 'Click to enable widget'}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          page.is_active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => handleDeletePage(page.id)}
                      className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Delete page"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mt-3">
                  Added: {new Date(page.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
