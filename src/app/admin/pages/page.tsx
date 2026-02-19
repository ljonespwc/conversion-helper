'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/Header'
import { Plus, Trash2, Edit2, Check, X, ChevronDown, ChevronUp } from 'lucide-react'

// =============================================================================
// Types
// =============================================================================

interface WidgetPage {
  id: string
  user_id: string
  page_url: string
  page_title: string
  page_goal: string | null
  is_active: boolean
  widget_line1: string | null
  widget_line2: string | null
  escalation_email: string | null
  show_email_in_fallback: boolean
  created_at: string
  updated_at: string
}

interface Organization {
  name: string
  website_url: string | null
  file_search_store_name: string | null
  show_branding: boolean
  publishable_key?: string | null
  widget_line1?: string | null
  widget_line2?: string | null
  notification_email?: string | null
  widget_position?: 'bottom-left' | 'bottom-right'
}

interface UserInfo {
  id: string
  email: string | null
  organization_id: string
  organization?: Organization
  organizations: Organization
}

interface PageSettingsState {
  widget_line1: string
  widget_line2: string
  escalation_email: string
  show_email_in_fallback: boolean
}

// =============================================================================
// Helper Functions
// =============================================================================

const PAGE_GOAL_CONFIG: Record<string, { label: string; style: string }> = {
  sell: { label: 'Sell', style: 'bg-green-50 text-green-700 border border-green-200' },
  lead: { label: 'Lead', style: 'bg-blue-50 text-blue-700 border border-blue-200' },
  support: { label: 'Support', style: 'bg-purple-50 text-purple-700 border border-purple-200' },
}

function getPageGoalStyle(goal: string): string {
  return PAGE_GOAL_CONFIG[goal]?.style ?? 'bg-gray-100 text-gray-600'
}

function getPageGoalLabel(goal: string): string {
  return PAGE_GOAL_CONFIG[goal]?.label ?? goal
}

// =============================================================================
// Reusable Sub-Components
// =============================================================================

interface ToggleSwitchProps {
  enabled: boolean
  onToggle: () => void
  title?: string
}

function ToggleSwitch({ enabled, onToggle, title }: ToggleSwitchProps): JSX.Element {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-orange-500' : 'bg-gray-300'
      }`}
      title={title}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

interface BadgeProps {
  children: React.ReactNode
  className?: string
}

function Badge({ children, className = '' }: BadgeProps): JSX.Element {
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${className}`}>
      {children}
    </span>
  )
}

// =============================================================================
// Main Component
// =============================================================================

export default function PagesPage(): JSX.Element {
  // Core data state
  const [pages, setPages] = useState<WidgetPage[]>([])
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // UI state
  const [showAddForm, setShowAddForm] = useState(false)
  const [expandedPageId, setExpandedPageId] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({ page_url: '', page_title: '', page_goal: '' })
  const [adding, setAdding] = useState(false)

  // Title editing state
  const [editingPageId, setEditingPageId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [savingTitle, setSavingTitle] = useState(false)

  // Page settings editing state
  const [editingPageSettings, setEditingPageSettings] = useState<PageSettingsState | null>(null)
  const [savingPageSettings, setSavingPageSettings] = useState(false)

  useEffect(() => {
    fetchUserInfo()
    fetchPages()
  }, [])

  // ===========================================================================
  // API Functions
  // ===========================================================================

  async function patchWidgetPage(id: string, body: Record<string, unknown>): Promise<void> {
    const response = await fetch(`/api/admin/widget-pages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to update page')
    }
  }

  function showError(err: unknown, fallback: string): void {
    alert(err instanceof Error ? err.message : fallback)
  }

  async function fetchUserInfo(): Promise<void> {
    try {
      const response = await fetch('/api/admin/user-info')
      const data = await response.json()
      if (data.user) {
        setUserInfo(data.user as UserInfo)
      }
    } catch (err) {
      console.error('Error fetching user info:', err)
    }
  }

  async function fetchPages(): Promise<void> {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/widget-pages')
      const data = await response.json()
      setPages(data.pages || [])
    } catch (err) {
      console.error('Error fetching pages:', err)
    } finally {
      setLoading(false)
    }
  }

  // ===========================================================================
  // Event Handlers
  // ===========================================================================

  async function handleAddPage(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    setAdding(true)
    setError(null)

    try {
      // Validate: must be either a URL (http/https) or a group ID (no ://)
      const isUrl = formData.page_url.match(/^https?:\/\//)
      const isGroupId = !formData.page_url.includes('://')

      if (!isUrl && !isGroupId) {
        throw new Error('Enter a full URL (https://...) or a group ID (e.g., "93")')
      }

      // URL-specific validation: wildcards only in path
      if (isUrl && formData.page_url.includes('*')) {
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

      setFormData({ page_url: '', page_title: '', page_goal: '' })
      setShowAddForm(false)
      await fetchPages()
    } catch (err) {
      console.error('Error adding page:', err)
      setError(err instanceof Error ? err.message : 'Failed to add page')
    } finally {
      setAdding(false)
    }
  }

  async function handleToggleActive(id: string, currentStatus: boolean): Promise<void> {
    try {
      // Optimistic update
      setPages(prevPages =>
        prevPages.map(p => p.id === id ? { ...p, is_active: !currentStatus } : p)
      )

      await patchWidgetPage(id, { is_active: !currentStatus })
      await fetchPages()
    } catch (err) {
      console.error('Error toggling page status:', err)
      showError(err, 'Failed to toggle page status')
      await fetchPages()
    }
  }

  async function handleDeletePage(id: string): Promise<void> {
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
    } catch (err) {
      console.error('Error deleting page:', err)
      showError(err, 'Failed to delete page')
    }
  }

  function handleStartEditTitle(page: WidgetPage): void {
    setEditingPageId(page.id)
    setEditingTitle(page.page_title)
  }

  function handleCancelEditTitle(): void {
    setEditingPageId(null)
    setEditingTitle('')
  }

  async function handleSaveTitle(pageId: string): Promise<void> {
    if (editingTitle.trim().length < 2) {
      alert('Page title must be at least 2 characters')
      return
    }

    setSavingTitle(true)
    try {
      await patchWidgetPage(pageId, { page_title: editingTitle.trim() })
      setPages(prevPages =>
        prevPages.map(p => p.id === pageId ? { ...p, page_title: editingTitle.trim() } : p)
      )
      setEditingPageId(null)
      setEditingTitle('')
    } catch (err) {
      console.error('Error updating page title:', err)
      showError(err, 'Failed to update page title')
    } finally {
      setSavingTitle(false)
    }
  }

  function handleToggleExpand(page: WidgetPage): void {
    if (expandedPageId === page.id) {
      setExpandedPageId(null)
      setEditingPageSettings(null)
    } else {
      setExpandedPageId(page.id)
      setEditingPageSettings({
        widget_line1: page.widget_line1 || '',
        widget_line2: page.widget_line2 || '',
        escalation_email: page.escalation_email || '',
        show_email_in_fallback: page.show_email_in_fallback
      })
    }
  }

  async function handleSavePageSettings(pageId: string): Promise<void> {
    if (!editingPageSettings) return

    // Validate escalation email if provided
    const email = editingPageSettings.escalation_email.trim()
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address')
      return
    }

    setSavingPageSettings(true)
    try {
      await patchWidgetPage(pageId, {
        widget_line1: editingPageSettings.widget_line1 || null,
        widget_line2: editingPageSettings.widget_line2 || null,
        escalation_email: email || null,
        show_email_in_fallback: editingPageSettings.show_email_in_fallback
      })
      setPages(prevPages =>
        prevPages.map(p => p.id === pageId ? {
          ...p,
          widget_line1: editingPageSettings.widget_line1 || null,
          widget_line2: editingPageSettings.widget_line2 || null,
          escalation_email: email || null,
          show_email_in_fallback: editingPageSettings.show_email_in_fallback
        } : p)
      )
      setExpandedPageId(null)
      setEditingPageSettings(null)
    } catch (err) {
      console.error('Error updating page settings:', err)
      showError(err, 'Failed to update page settings')
    } finally {
      setSavingPageSettings(false)
    }
  }

  // ===========================================================================
  // Render
  // ===========================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header user={userInfo ? { id: userInfo.id, email: userInfo.email } : null} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Pages</h1>
          <p className="text-gray-500 text-sm sm:text-base">
            Manage the pages where your assistant is active
          </p>
        </div>

        {/* Add Page Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Assistant Page
          </button>
        </div>

        {/* Add Page Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Assistant Page</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleAddPage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Page URL, Wildcard Pattern, or Single Page Application Group ID *
                </label>
                <input
                  type="text"
                  value={formData.page_url}
                  onChange={(e) => setFormData({ ...formData, page_url: e.target.value })}
                  placeholder="https://example.com/pricing, https://example.com/blog/*, or 93"
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900 placeholder-gray-400"
                  required
                />
                <div className="text-xs text-gray-500 mt-1 space-y-1">
                  <p>Full URL of the page, or use <code className="bg-gray-200 px-1 rounded">*</code> for patterns:</p>
                  <ul className="list-disc list-inside ml-2 text-gray-500">
                    <li><code className="bg-gray-200 px-1 rounded">https://example.com/blog/*</code> - matches all blog posts</li>
                    <li><code className="bg-gray-200 px-1 rounded">https://example.com/*/pricing</code> - matches pricing pages in any section</li>
                  </ul>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Page Title *
                </label>
                <input
                  type="text"
                  value={formData.page_title}
                  onChange={(e) => setFormData({ ...formData, page_title: e.target.value })}
                  placeholder="Pricing Page"
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900 placeholder-gray-400"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Descriptive name for this page (for your reference)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Page Goal (Optional)
                </label>
                <select
                  value={formData.page_goal}
                  onChange={(e) => setFormData({ ...formData, page_goal: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900"
                >
                  <option value="">No specific goal</option>
                  <option value="sell">Sell a product or service</option>
                  <option value="lead">Generate a lead</option>
                  <option value="support">Educate and support a customer</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  How should the assistant guide conversations on this page?
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={adding}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 transition-colors"
                >
                  {adding ? 'Adding...' : 'Add Page'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setError(null)
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Pages List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center border border-gray-200">
            <p className="text-gray-500">Loading pages...</p>
          </div>
        ) : pages.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center border border-gray-200">
            <p className="text-gray-500">No assistant pages yet. Add your first page to get started!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pages.map((page) => (
              <div
                key={page.id}
                className={`bg-white rounded-lg shadow-md p-6 border transition-colors ${
                  page.is_active
                    ? 'border-gray-200 hover:border-orange-400'
                    : 'border-gray-200 opacity-60'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {editingPageId === page.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900 text-lg font-semibold"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveTitle(page.id)
                              if (e.key === 'Escape') handleCancelEditTitle()
                            }}
                          />
                          <button
                            onClick={() => handleSaveTitle(page.id)}
                            disabled={savingTitle}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Save"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelEditTitle}
                            disabled={savingTitle}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <h3 className={`text-xl font-semibold ${page.is_active ? 'text-gray-900' : 'text-gray-500'}`}>
                            {page.page_title}
                          </h3>
                          <button
                            onClick={() => handleStartEditTitle(page)}
                            className="p-1 text-gray-400 hover:text-orange-500 hover:bg-gray-100 rounded transition-colors"
                            title="Edit page title"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {page.page_url.includes('*') && (
                        <Badge className="bg-amber-50 text-amber-700 border border-amber-200">
                          Pattern
                        </Badge>
                      )}
                      {!page.is_active && (
                        <Badge className="bg-gray-100 text-gray-500 border border-gray-200">
                          Inactive
                        </Badge>
                      )}
                      {page.page_goal && (
                        <Badge className={getPageGoalStyle(page.page_goal)}>
                          {getPageGoalLabel(page.page_goal)}
                        </Badge>
                      )}
                    </div>
                    <p className={`text-sm break-all ${page.is_active ? 'text-orange-600' : 'text-gray-500'}`}>
                      {page.page_url}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ToggleSwitch
                      enabled={page.is_active}
                      onToggle={() => handleToggleActive(page.id, page.is_active)}
                      title={page.is_active ? 'Click to disable widget' : 'Click to enable widget'}
                    />
                    <button
                      onClick={() => handleDeletePage(page.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-orange-500 transition-colors"
                  >
                    {expandedPageId === page.id ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        <span>Hide page settings</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        <span>Page settings</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Expanded Page Settings */}
                {expandedPageId === page.id && editingPageSettings && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-600 mb-3">Widget Button Text</h4>
                    <p className="text-xs text-gray-500 mb-3">
                      Customize the text shown on the widget button for this page. Leave blank to use your organization defaults.
                    </p>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Line 1 (Primary text)
                        </label>
                        <input
                          type="text"
                          value={editingPageSettings.widget_line1}
                          onChange={(e) => setEditingPageSettings({ ...editingPageSettings, widget_line1: e.target.value })}
                          placeholder={userInfo?.organizations?.widget_line1 || 'e.g., Questions?'}
                          className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900 text-sm placeholder-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Line 2 (Secondary text)
                        </label>
                        <input
                          type="text"
                          value={editingPageSettings.widget_line2}
                          onChange={(e) => setEditingPageSettings({ ...editingPageSettings, widget_line2: e.target.value })}
                          placeholder={userInfo?.organizations?.widget_line2 || 'e.g., Ask our AI assistant'}
                          className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900 text-sm placeholder-gray-500"
                        />
                      </div>
                    </div>

                    {/* Escalation Email Settings */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-600 mb-3">Escalation Email</h4>
                      <p className="text-xs text-gray-500 mb-3">
                        Escalation notifications are sent to this address. Overrides the default from Settings. Toggle on to also show it to visitors when the AI can&apos;t answer.
                      </p>
                      <div className="space-y-3">
                        <input
                          type="email"
                          value={editingPageSettings.escalation_email}
                          onChange={(e) => setEditingPageSettings({ ...editingPageSettings, escalation_email: e.target.value })}
                          placeholder={userInfo?.organizations?.notification_email || 'support@yourcompany.com'}
                          className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900 text-sm placeholder-gray-500"
                        />
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-gray-600">Show email in fallback message</label>
                          <ToggleSwitch
                            enabled={editingPageSettings.show_email_in_fallback}
                            onToggle={() => setEditingPageSettings({ ...editingPageSettings, show_email_in_fallback: !editingPageSettings.show_email_in_fallback })}
                            title={editingPageSettings.show_email_in_fallback ? 'Email shown in fallback' : 'Email hidden from fallback'}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Save / Cancel */}
                    <div className="flex items-center gap-2 mt-6">
                      <button
                        onClick={() => handleSavePageSettings(page.id)}
                        disabled={savingPageSettings}
                        className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                      >
                        {savingPageSettings ? 'Saving...' : (
                          <>
                            <Check className="w-4 h-4" />
                            Save
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setExpandedPageId(null)
                          setEditingPageSettings(null)
                        }}
                        disabled={savingPageSettings}
                        className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
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
