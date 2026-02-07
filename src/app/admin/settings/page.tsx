'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/Header'
import { Copy, CheckCircle, Edit2, Check, X } from 'lucide-react'

// =============================================================================
// Types
// =============================================================================

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

interface WidgetTextState {
  widget_line1: string
  widget_line2: string
}

// =============================================================================
// Sub-Components
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

interface CopyButtonProps {
  text: string
  id: string
  copiedId: string | null
  onCopy: (text: string, id: string) => void
  className?: string
  showLabel?: boolean
}

function CopyButton({ text, id, copiedId, onCopy, className, showLabel = true }: CopyButtonProps): JSX.Element {
  const isCopied = copiedId === id
  return (
    <button
      onClick={() => onCopy(text, id)}
      className={className || 'p-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors flex-shrink-0'}
      title="Copy"
    >
      {isCopied ? (
        <>
          <CheckCircle className="w-4 h-4 text-green-400" />
          {showLabel && <span className="hidden sm:inline ml-1">Copied!</span>}
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          {showLabel && <span className="hidden sm:inline ml-1">Copy</span>}
        </>
      )}
    </button>
  )
}

interface WidgetTextEditorProps {
  widgetText: WidgetTextState
  onChange: (text: WidgetTextState) => void
  onSave: () => void
  onCancel: () => void
  saving: boolean
  line1Placeholder?: string
  line2Placeholder?: string
}

function WidgetTextEditor({
  widgetText,
  onChange,
  onSave,
  onCancel,
  saving,
  line1Placeholder = 'e.g., Questions?',
  line2Placeholder = 'e.g., Ask our AI assistant'
}: WidgetTextEditorProps): JSX.Element {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Line 1 (Primary text)
        </label>
        <input
          type="text"
          value={widgetText.widget_line1}
          onChange={(e) => onChange({ ...widgetText, widget_line1: e.target.value })}
          placeholder={line1Placeholder}
          className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900 text-sm placeholder-gray-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Line 2 (Secondary text)
        </label>
        <input
          type="text"
          value={widgetText.widget_line2}
          onChange={(e) => onChange({ ...widgetText, widget_line2: e.target.value })}
          placeholder={line2Placeholder}
          className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900 text-sm placeholder-gray-500"
        />
      </div>
      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={onSave}
          disabled={saving}
          className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
        >
          {saving ? 'Saving...' : (
            <>
              <Check className="w-4 h-4" />
              Save
            </>
          )}
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// =============================================================================
// Main Component
// =============================================================================

export default function SettingsPage(): JSX.Element {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Widget text editing
  const [editingOrgWidgetText, setEditingOrgWidgetText] = useState(false)
  const [orgWidgetText, setOrgWidgetText] = useState<WidgetTextState>({ widget_line1: '', widget_line2: '' })
  const [savingOrgWidgetText, setSavingOrgWidgetText] = useState(false)

  // Notification email
  const [editingNotificationEmail, setEditingNotificationEmail] = useState(false)
  const [notificationEmail, setNotificationEmail] = useState('')
  const [savingNotificationEmail, setSavingNotificationEmail] = useState(false)

  useEffect(() => {
    fetchUserInfo()
  }, [])

  async function fetchUserInfo(): Promise<void> {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/user-info')
      const data = await response.json()
      if (data.user) {
        setUserInfo(data.user as UserInfo)
      }
    } catch (err) {
      console.error('Error fetching user info:', err)
    } finally {
      setLoading(false)
    }
  }

  async function patchOrganization(body: Record<string, unknown>): Promise<void> {
    const response = await fetch('/api/admin/organization', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to update organization')
    }
  }

  function showError(err: unknown, fallback: string): void {
    alert(err instanceof Error ? err.message : fallback)
  }

  async function copyToClipboard(text: string, id: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  async function handleToggleBranding(currentStatus: boolean): Promise<void> {
    try {
      await patchOrganization({ show_branding: !currentStatus })
      await fetchUserInfo()
    } catch (err) {
      console.error('Error toggling branding:', err)
      showError(err, 'Failed to toggle branding visibility')
    }
  }

  async function handleTogglePosition(): Promise<void> {
    const current = userInfo?.organizations?.widget_position ?? 'bottom-right'
    const next = current === 'bottom-right' ? 'bottom-left' : 'bottom-right'
    try {
      await patchOrganization({ widget_position: next })
      await fetchUserInfo()
    } catch (err) {
      console.error('Error toggling widget position:', err)
      showError(err, 'Failed to toggle widget position')
    }
  }

  function handleStartEditOrgWidgetText(): void {
    setOrgWidgetText({
      widget_line1: userInfo?.organizations?.widget_line1 || '',
      widget_line2: userInfo?.organizations?.widget_line2 || ''
    })
    setEditingOrgWidgetText(true)
  }

  async function handleSaveOrgWidgetText(): Promise<void> {
    setSavingOrgWidgetText(true)
    try {
      await patchOrganization({
        widget_line1: orgWidgetText.widget_line1 || null,
        widget_line2: orgWidgetText.widget_line2 || null
      })
      await fetchUserInfo()
      setEditingOrgWidgetText(false)
    } catch (err) {
      console.error('Error updating org widget text:', err)
      showError(err, 'Failed to update widget text')
    } finally {
      setSavingOrgWidgetText(false)
    }
  }

  function handleStartEditNotificationEmail(): void {
    setNotificationEmail(userInfo?.organizations?.notification_email || '')
    setEditingNotificationEmail(true)
  }

  async function handleSaveNotificationEmail(): Promise<void> {
    setSavingNotificationEmail(true)
    try {
      await patchOrganization({ notification_email: notificationEmail.trim() || null })
      await fetchUserInfo()
      setEditingNotificationEmail(false)
    } catch (err) {
      console.error('Error updating notification email:', err)
      showError(err, 'Failed to update notification email')
    } finally {
      setSavingNotificationEmail(false)
    }
  }

  // Derived values
  const widgetPosition = userInfo?.organizations?.widget_position ?? 'bottom-right'
  const publishableKey = userInfo?.organization?.publishable_key || userInfo?.organizations?.publishable_key
  const embedCode = publishableKey
    ? `<script src="https://www.easyask.io/widget.js" data-key="${publishableKey}"></script>`
    : `<script src="https://www.easyask.io/widget.js" data-key="YOUR_API_KEY"></script>`

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Header user={null} loading />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header user={userInfo ? { id: userInfo.id, email: userInfo.email } : null} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-500 text-sm sm:text-base">
            Configure your widget, embed code, and organization details
          </p>
        </div>

        {/* Quick Install - Universal Embed Code */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Quick Install</h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            Add this single line of code to <span className="font-semibold">all pages</span> where you want the assistant.
            The assistant automatically detects which page it&apos;s on and shows the right content.
          </p>

          <div className="relative">
            <pre className="bg-gray-950 text-gray-100 p-3 sm:p-4 rounded-lg overflow-x-auto border border-gray-700 text-xs sm:text-sm">
              <code>{embedCode}</code>
            </pre>
            <CopyButton
              text={embedCode}
              id="universal-embed"
              copiedId={copiedId}
              onCopy={copyToClipboard}
              className="absolute top-2 right-2 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium transition-all flex items-center gap-1 sm:gap-2 shadow-lg"
            />
          </div>

          <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
            Place this code before the closing <code className="text-gray-600 bg-gray-200 px-1.5 py-0.5 rounded">&lt;/body&gt;</code> tag.
            The assistant will appear as a chat button in the position configured below.
          </p>
        </div>

        {/* Organization Details */}
        {userInfo && (
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Organization Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 font-medium">Organization:</span>
                <p className="text-gray-900 mt-1">{userInfo.organizations.name || 'Not set'}</p>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Website:</span>
                <p className="text-gray-900 mt-1">{userInfo.organizations.website_url || 'Not set'}</p>
              </div>
              <div className="md:col-span-2">
                <span className="text-gray-500 font-medium">File Search Store:</span>
                <code className="block bg-gray-100 px-3 py-2 rounded text-xs mt-1 text-gray-600 break-all">
                  {userInfo.organizations.file_search_store_name || 'Not created'}
                </code>
              </div>
              <div className="md:col-span-2">
                <span className="text-gray-500 font-medium">API Key:</span>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-xs text-gray-600 break-all font-mono">
                    {publishableKey || 'Not generated'}
                  </code>
                  {publishableKey && (
                    <CopyButton
                      text={publishableKey}
                      id="api-key"
                      copiedId={copiedId}
                      onCopy={copyToClipboard}
                      showLabel={false}
                    />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This key is included in your embed code. It&apos;s safe to use in client-side code.
                </p>
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center justify-between py-2 px-3 bg-gray-100 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium">Show EasyAsk branding:</span>
                    <span className="text-xs text-gray-500">
                      ({userInfo.organizations.show_branding ? 'Footer visible on all widgets' : 'Footer hidden on all widgets'})
                    </span>
                  </div>
                  <ToggleSwitch
                    enabled={userInfo.organizations.show_branding}
                    onToggle={() => handleToggleBranding(userInfo.organizations.show_branding)}
                    title={userInfo.organizations.show_branding ? 'Hide "Powered by EasyAsk" footer' : 'Show "Powered by EasyAsk" footer'}
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center justify-between py-2 px-3 bg-gray-100 rounded-lg">
                  <span className="text-gray-600 font-medium">Widget position:</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${widgetPosition === 'bottom-left' ? 'text-gray-900' : 'text-gray-400'}`}>Left</span>
                    <ToggleSwitch
                      enabled={widgetPosition !== 'bottom-left'}
                      onToggle={handleTogglePosition}
                      title="Toggle widget position"
                    />
                    <span className={`text-xs font-medium ${widgetPosition !== 'bottom-left' ? 'text-gray-900' : 'text-gray-400'}`}>Right</span>
                  </div>
                </div>
              </div>

              {/* Widget Button Text Defaults */}
              <div className="md:col-span-2 mt-2">
                <div className="py-3 px-4 bg-gray-100 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 font-medium">Widget Button Text (Default for all pages)</span>
                    {!editingOrgWidgetText && (
                      <button
                        onClick={handleStartEditOrgWidgetText}
                        className="text-xs text-orange-600 hover:text-orange-500 flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        Edit
                      </button>
                    )}
                  </div>

                  {editingOrgWidgetText ? (
                    <WidgetTextEditor
                      widgetText={orgWidgetText}
                      onChange={setOrgWidgetText}
                      onSave={handleSaveOrgWidgetText}
                      onCancel={() => setEditingOrgWidgetText(false)}
                      saving={savingOrgWidgetText}
                    />
                  ) : (
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-900">
                        <span className="text-gray-500">Line 1:</span> {userInfo.organizations.widget_line1 || <span className="text-gray-400 italic">Not set</span>}
                      </p>
                      <p className="text-gray-900">
                        <span className="text-gray-500">Line 2:</span> {userInfo.organizations.widget_line2 || <span className="text-gray-400 italic">Not set</span>}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Individual pages can override these defaults.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Purchase Tracking */}
              <div className="md:col-span-2 mt-2">
                <div className="py-3 px-4 bg-gray-100 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 font-medium">Purchase Tracking</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    Place this on your purchase confirmation/success page to attribute sales to AI conversations.
                  </p>
                  <div className="relative">
                    <pre className="bg-gray-950 text-gray-100 p-3 rounded-lg overflow-x-auto border border-gray-700 text-xs whitespace-pre-wrap">
                      <code>{`<script>
(function() {
  var match = document.cookie.match(/(?:^|; )easyask_vid=([^;]*)/);
  if (!match) return;
  fetch('https://www.easyask.io/api/attribution/purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: '${publishableKey || 'YOUR_API_KEY'}',
      visitor_id: decodeURIComponent(match[1]),
      external_order_id: '', // Replace with your order ID
      amount: 0,             // Replace with order total
      product_name: ''       // Replace with product name
    })
  });
})();
</script>`}</code>
                    </pre>
                    <CopyButton
                      text={`<script>
(function() {
  var match = document.cookie.match(/(?:^|; )easyask_vid=([^;]*)/);
  if (!match) return;
  fetch('https://www.easyask.io/api/attribution/purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: '${publishableKey || 'YOUR_API_KEY'}',
      visitor_id: decodeURIComponent(match[1]),
      external_order_id: '', // Replace with your order ID
      amount: 0,             // Replace with order total
      product_name: ''       // Replace with product name
    })
  });
})();
</script>`}
                      id="purchase-snippet"
                      copiedId={copiedId}
                      onCopy={copyToClipboard}
                      className="absolute top-2 right-2 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white rounded-lg px-2 py-1 text-xs font-medium transition-all flex items-center gap-1 shadow-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Escalation Notification Email */}
              <div className="md:col-span-2 mt-2">
                <div className="py-3 px-4 bg-gray-100 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 font-medium">Escalation Notification Email</span>
                    {!editingNotificationEmail && (
                      <button
                        onClick={handleStartEditNotificationEmail}
                        className="text-xs text-orange-600 hover:text-orange-500 flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        Edit
                      </button>
                    )}
                  </div>

                  {editingNotificationEmail ? (
                    <div className="space-y-3">
                      <input
                        type="email"
                        value={notificationEmail}
                        onChange={(e) => setNotificationEmail(e.target.value)}
                        placeholder="support@yourcompany.com"
                        className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900 text-sm placeholder-gray-500"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSaveNotificationEmail}
                          disabled={savingNotificationEmail}
                          className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                        >
                          {savingNotificationEmail ? 'Saving...' : (
                            <>
                              <Check className="w-4 h-4" />
                              Save
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setEditingNotificationEmail(false)}
                          disabled={savingNotificationEmail}
                          className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-900">
                        {userInfo.organizations.notification_email || <span className="text-gray-400 italic">Not set</span>}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        When a visitor submits their email for follow-up, you&apos;ll receive the conversation transcript at this address.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
