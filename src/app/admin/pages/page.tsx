'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/Header'
import { Plus, Trash2, Copy, CheckCircle, Edit2, Check, X, ChevronDown, ChevronUp } from 'lucide-react'

// Force dynamic rendering - prevent page caching
export const dynamic = 'force-dynamic'

interface WidgetPage {
  id: string
  user_id: string
  page_url: string
  page_title: string
  page_goal: string | null
  is_active: boolean
  widget_line1: string | null
  widget_line2: string | null
  created_at: string
  updated_at: string
}

interface UserInfo {
  id: string
  email: string | null
  organization_id: string
  organization?: {
    name: string
    website_url: string | null
    file_search_store_name: string | null
    show_branding: boolean
    publishable_key: string | null
    widget_line1: string | null
    widget_line2: string | null
  }
  organizations: {
    name: string
    website_url: string | null
    file_search_store_name: string | null
    show_branding: boolean
    publishable_key?: string | null
    widget_line1?: string | null
    widget_line2?: string | null
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
  const [editingPageId, setEditingPageId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [savingTitle, setSavingTitle] = useState(false)
  const [expandedPageId, setExpandedPageId] = useState<string | null>(null)
  const [editingWidgetText, setEditingWidgetText] = useState<{
    widget_line1: string
    widget_line2: string
  } | null>(null)
  const [savingWidgetText, setSavingWidgetText] = useState(false)
  const [editingOrgWidgetText, setEditingOrgWidgetText] = useState(false)
  const [orgWidgetText, setOrgWidgetText] = useState({ widget_line1: '', widget_line2: '' })
  const [savingOrgWidgetText, setSavingOrgWidgetText] = useState(false)

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
      // Validate URL format (allow * for patterns)
      if (!formData.page_url.match(/^https?:\/\//)) {
        throw new Error('Page URL must start with http:// or https://')
      }

      // Validate pattern syntax: * only allowed in path, not domain
      if (formData.page_url.includes('*')) {
        const testUrl = formData.page_url.replace(/\*/g, 'placeholder')
        try {
          const parsed = new URL(testUrl)
          if (parsed.hostname.includes('placeholder')) {
            throw new Error('Wildcards (*) can only be used in the URL path, not in the domain')
          }
        } catch (urlError) {
          if (urlError instanceof Error && urlError.message.includes('Wildcards')) {
            throw urlError
          }
          throw new Error('Invalid URL format')
        }
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

  const handleToggleBranding = async (currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/organization', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ show_branding: !currentStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to toggle branding visibility')
      }

      // Refresh user info to get updated branding setting
      await fetchUserInfo()
    } catch (error) {
      console.error('Error toggling branding:', error)
      alert('Failed to toggle branding visibility')
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

  const handleStartEditTitle = (page: WidgetPage) => {
    setEditingPageId(page.id)
    setEditingTitle(page.page_title)
  }

  const handleCancelEditTitle = () => {
    setEditingPageId(null)
    setEditingTitle('')
  }

  const handleSaveTitle = async (pageId: string) => {
    if (editingTitle.trim().length < 2) {
      alert('Page title must be at least 2 characters')
      return
    }

    setSavingTitle(true)
    try {
      const response = await fetch(`/api/admin/widget-pages/${pageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page_title: editingTitle.trim() })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update page title')
      }

      // Update local state
      setPages(prevPages =>
        prevPages.map(p => p.id === pageId ? { ...p, page_title: editingTitle.trim() } : p)
      )

      // Clear editing state
      setEditingPageId(null)
      setEditingTitle('')
    } catch (error) {
      console.error('Error updating page title:', error)
      alert(error instanceof Error ? error.message : 'Failed to update page title')
    } finally {
      setSavingTitle(false)
    }
  }

  const handleToggleExpand = (page: WidgetPage) => {
    if (expandedPageId === page.id) {
      // Collapse
      setExpandedPageId(null)
      setEditingWidgetText(null)
    } else {
      // Expand and populate editing state
      setExpandedPageId(page.id)
      setEditingWidgetText({
        widget_line1: page.widget_line1 || '',
        widget_line2: page.widget_line2 || ''
      })
    }
  }

  const handleSaveWidgetText = async (pageId: string) => {
    if (!editingWidgetText) return

    setSavingWidgetText(true)
    try {
      const response = await fetch(`/api/admin/widget-pages/${pageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          widget_line1: editingWidgetText.widget_line1 || null,
          widget_line2: editingWidgetText.widget_line2 || null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update widget text')
      }

      // Update local state
      setPages(prevPages =>
        prevPages.map(p => p.id === pageId ? {
          ...p,
          widget_line1: editingWidgetText.widget_line1 || null,
          widget_line2: editingWidgetText.widget_line2 || null
        } : p)
      )

      // Collapse after saving
      setExpandedPageId(null)
      setEditingWidgetText(null)
    } catch (error) {
      console.error('Error updating widget text:', error)
      alert(error instanceof Error ? error.message : 'Failed to update widget text')
    } finally {
      setSavingWidgetText(false)
    }
  }

  const handleStartEditOrgWidgetText = () => {
    setOrgWidgetText({
      widget_line1: userInfo?.organizations?.widget_line1 || '',
      widget_line2: userInfo?.organizations?.widget_line2 || ''
    })
    setEditingOrgWidgetText(true)
  }

  const handleSaveOrgWidgetText = async () => {
    setSavingOrgWidgetText(true)
    try {
      const response = await fetch('/api/admin/organization', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          widget_line1: orgWidgetText.widget_line1 || null,
          widget_line2: orgWidgetText.widget_line2 || null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update widget text')
      }

      // Refresh user info to get updated values
      await fetchUserInfo()
      setEditingOrgWidgetText(false)
    } catch (error) {
      console.error('Error updating org widget text:', error)
      alert(error instanceof Error ? error.message : 'Failed to update widget text')
    } finally {
      setSavingOrgWidgetText(false)
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

          {(() => {
            const publishableKey = userInfo?.organization?.publishable_key || userInfo?.organizations?.publishable_key
            const embedCode = publishableKey
              ? `<script src="https://www.easyask.io/widget.js" data-key="${publishableKey}"></script>`
              : `<script src="https://www.easyask.io/widget.js" data-key="YOUR_API_KEY"></script>`

            return (
              <div className="relative">
                <pre className="bg-gray-950 text-gray-100 p-3 sm:p-4 rounded-lg overflow-x-auto border border-gray-700 text-xs sm:text-sm">
                  <code>{embedCode}</code>
                </pre>
                <button
                  onClick={() => copyToClipboard(embedCode, 'universal-embed')}
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
            )
          })()}

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
              <div className="md:col-span-2">
                <span className="text-gray-400 font-medium">API Key:</span>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 bg-gray-700 px-3 py-2 rounded text-xs text-gray-300 break-all font-mono">
                    {userInfo.organization?.publishable_key || userInfo.organizations.publishable_key || 'Not generated'}
                  </code>
                  {(userInfo.organization?.publishable_key || userInfo.organizations.publishable_key) && (
                    <button
                      onClick={() => copyToClipboard(
                        userInfo.organization?.publishable_key || userInfo.organizations.publishable_key || '',
                        'api-key'
                      )}
                      className="p-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors flex-shrink-0"
                      title="Copy API key"
                    >
                      {copiedId === 'api-key' ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Use this key in your widget embed code. Keep it safe but note it's designed to be public-facing.
                </p>
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center justify-between py-2 px-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300 font-medium">Show EasyAsk branding:</span>
                    <span className="text-xs text-gray-400">
                      ({userInfo.organizations.show_branding ? 'Footer visible on all widgets' : 'Footer hidden on all widgets'})
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggleBranding(userInfo.organizations.show_branding)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      userInfo.organizations.show_branding ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                    title={userInfo.organizations.show_branding ? 'Hide "Powered by EasyAsk" footer' : 'Show "Powered by EasyAsk" footer'}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        userInfo.organizations.show_branding ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Widget Button Text Defaults */}
              <div className="md:col-span-2 mt-2">
                <div className="py-3 px-4 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 font-medium">Widget Button Text (Default for all pages)</span>
                    {!editingOrgWidgetText && (
                      <button
                        onClick={handleStartEditOrgWidgetText}
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        Edit
                      </button>
                    )}
                  </div>

                  {editingOrgWidgetText ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                          Line 1 (Primary text)
                        </label>
                        <input
                          type="text"
                          value={orgWidgetText.widget_line1}
                          onChange={(e) => setOrgWidgetText({ ...orgWidgetText, widget_line1: e.target.value })}
                          placeholder="e.g., Questions?"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white text-sm placeholder-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                          Line 2 (Secondary text)
                        </label>
                        <input
                          type="text"
                          value={orgWidgetText.widget_line2}
                          onChange={(e) => setOrgWidgetText({ ...orgWidgetText, widget_line2: e.target.value })}
                          placeholder="e.g., Ask our AI assistant"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white text-sm placeholder-gray-500"
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={handleSaveOrgWidgetText}
                          disabled={savingOrgWidgetText}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                        >
                          {savingOrgWidgetText ? 'Saving...' : (
                            <>
                              <Check className="w-4 h-4" />
                              Save
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setEditingOrgWidgetText(false)}
                          disabled={savingOrgWidgetText}
                          className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-gray-300 text-sm rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 text-sm">
                      <p className="text-white">
                        <span className="text-gray-400">Line 1:</span> {userInfo.organizations.widget_line1 || <span className="text-gray-500 italic">Not set</span>}
                      </p>
                      <p className="text-white">
                        <span className="text-gray-400">Line 2:</span> {userInfo.organizations.widget_line2 || <span className="text-gray-500 italic">Not set</span>}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Individual pages can override these defaults.
                      </p>
                    </div>
                  )}
                </div>
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
                  Page URL or Pattern *
                </label>
                <input
                  type="text"
                  value={formData.page_url}
                  onChange={(e) => setFormData({ ...formData, page_url: e.target.value })}
                  placeholder="https://example.com/pricing or https://example.com/blog/*"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  required
                />
                <div className="text-xs text-gray-400 mt-1 space-y-1">
                  <p>Full URL of the page, or use <code className="bg-gray-600 px-1 rounded">*</code> for patterns:</p>
                  <ul className="list-disc list-inside ml-2 text-gray-500">
                    <li><code className="bg-gray-600 px-1 rounded">https://example.com/blog/*</code> - matches all blog posts</li>
                    <li><code className="bg-gray-600 px-1 rounded">https://example.com/*/pricing</code> - matches pricing pages in any section</li>
                  </ul>
                </div>
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
                      {editingPageId === page.id ? (
                        // Edit mode
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white text-lg font-semibold"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveTitle(page.id)
                              if (e.key === 'Escape') handleCancelEditTitle()
                            }}
                          />
                          <button
                            onClick={() => handleSaveTitle(page.id)}
                            disabled={savingTitle}
                            className="p-1.5 text-green-400 hover:bg-green-900/30 rounded-lg transition-colors disabled:opacity-50"
                            title="Save"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelEditTitle}
                            disabled={savingTitle}
                            className="p-1.5 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        // Display mode
                        <>
                          <h3 className={`text-xl font-semibold ${page.is_active ? 'text-white' : 'text-gray-400'}`}>
                            {page.page_title}
                          </h3>
                          <button
                            onClick={() => handleStartEditTitle(page)}
                            className="p-1 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded transition-colors"
                            title="Edit page title"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {page.page_url.includes('*') && (
                        <span className="text-xs px-2 py-1 rounded-full font-medium bg-amber-900/40 text-amber-300 border border-amber-700">
                          Pattern
                        </span>
                      )}
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

                <div className="flex items-center justify-between mt-3">
                  <div className="text-xs text-gray-500">
                    Added: {new Date(page.created_at).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => handleToggleExpand(page)}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    {expandedPageId === page.id ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        <span>Hide widget text settings</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        <span>Customize widget button text</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Expanded Widget Text Settings */}
                {expandedPageId === page.id && editingWidgetText && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Widget Button Text</h4>
                    <p className="text-xs text-gray-500 mb-3">
                      Customize the text shown on the widget button for this page. Leave blank to use your organization defaults.
                    </p>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                          Line 1 (Primary text)
                        </label>
                        <input
                          type="text"
                          value={editingWidgetText.widget_line1}
                          onChange={(e) => setEditingWidgetText({
                            ...editingWidgetText,
                            widget_line1: e.target.value
                          })}
                          placeholder={userInfo?.organizations?.widget_line1 || 'e.g., Questions?'}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white text-sm placeholder-gray-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                          Line 2 (Secondary text)
                        </label>
                        <input
                          type="text"
                          value={editingWidgetText.widget_line2}
                          onChange={(e) => setEditingWidgetText({
                            ...editingWidgetText,
                            widget_line2: e.target.value
                          })}
                          placeholder={userInfo?.organizations?.widget_line2 || 'e.g., Ask our AI assistant'}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white text-sm placeholder-gray-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-4">
                      <button
                        onClick={() => handleSaveWidgetText(page.id)}
                        disabled={savingWidgetText}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                      >
                        {savingWidgetText ? (
                          'Saving...'
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            Save
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setExpandedPageId(null)
                          setEditingWidgetText(null)
                        }}
                        disabled={savingWidgetText}
                        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      {(page.widget_line1 || page.widget_line2) && (
                        <span className="text-xs text-amber-400 ml-auto">
                          Custom text active
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
