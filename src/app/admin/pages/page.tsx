'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/Header'
import { Plus, Trash2, Copy, CheckCircle, Code } from 'lucide-react'

interface WidgetPage {
  id: string
  user_id: string
  page_url: string
  page_title: string
  created_at: string
  updated_at: string
}

interface UserInfo {
  id: string
  email: string | null
  organization_name: string | null
  website_url: string | null
  file_search_store_name: string | null
}

export default function PagesPage() {
  const [pages, setPages] = useState<WidgetPage[]>([])
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    page_url: '',
    page_title: ''
  })
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showEmbedCode, setShowEmbedCode] = useState<string | null>(null)

  useEffect(() => {
    fetchUserInfo()
    fetchPages()
  }, [])

  const fetchUserInfo = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from('users')
        .select('id, email, organization_name, website_url, file_search_store_name')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setUserInfo(data)
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
      setFormData({ page_url: '', page_title: '' })
      setShowAddForm(false)
      await fetchPages()
    } catch (error) {
      console.error('Error adding page:', error)
      setError(error instanceof Error ? error.message : 'Failed to add page')
    } finally {
      setAdding(false)
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

  const generateEmbedCode = (pageUrl: string) => {
    return `<!-- Conversion Helper Widget -->
<script>
  window.ConversionHelperConfig = {
    pageUrl: "${pageUrl}"
  };
</script>
<script src="${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/widget.js" async></script>`
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Widget Pages</h1>
          <p className="text-gray-400">
            Manage the pages where your widget is deployed. Each page gets its own widget instance with filtered content.
          </p>
        </div>

        {/* Organization Info */}
        {userInfo && (
          <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-4">Organization Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400 font-medium">Organization:</span>
                <p className="text-white mt-1">{userInfo.organization_name || 'Not set'}</p>
              </div>
              <div>
                <span className="text-gray-400 font-medium">Website:</span>
                <p className="text-white mt-1">{userInfo.website_url || 'Not set'}</p>
              </div>
              <div className="md:col-span-2">
                <span className="text-gray-400 font-medium">File Search Store:</span>
                <code className="block bg-gray-700 px-3 py-2 rounded text-xs mt-1 text-gray-300 break-all">
                  {userInfo.file_search_store_name || 'Not created'}
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
            Add Widget Page
          </button>
        </div>

        {/* Add Page Form */}
        {showAddForm && (
          <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Add New Widget Page</h2>

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
                  Full URL of the page where you want to add the widget
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
            <p className="text-gray-400">No widget pages yet. Add your first page to get started!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pages.map((page) => (
              <div
                key={page.id}
                className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700 hover:border-blue-500 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {page.page_title}
                    </h3>
                    <p className="text-sm text-blue-400 break-all">
                      {page.page_url}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowEmbedCode(showEmbedCode === page.id ? null : page.id)}
                      className="p-2 text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Show embed code"
                    >
                      <Code className="w-5 h-5" />
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

                {/* Embed Code */}
                {showEmbedCode === page.id && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-300">Embed Code</span>
                      <button
                        onClick={() => copyToClipboard(generateEmbedCode(page.page_url), page.id + '-embed')}
                        className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
                      >
                        {copiedId === page.id + '-embed' ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy Code
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-xs text-gray-300 border border-gray-700">
                      <code>{generateEmbedCode(page.page_url)}</code>
                    </pre>
                    <p className="text-xs text-gray-400 mt-2">
                      Add this code to your page's HTML, preferably before the closing &lt;/body&gt; tag.
                    </p>
                  </div>
                )}

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
