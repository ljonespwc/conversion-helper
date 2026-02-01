'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/Header'
import PageSelector from '@/components/admin/PageSelector'
import QuestionThemes from '@/components/admin/QuestionThemes'
import ConversationsList from '@/components/admin/ConversationsList'
import ArchiveConfirmModal from '@/components/admin/ArchiveConfirmModal'
import { usePostHog } from 'posthog-js/react'
import type { Stats, WidgetPage, ConversationSession } from '@/components/admin/types'

export const dynamic = 'force-dynamic'

function toggleSetItem(setter: React.Dispatch<React.SetStateAction<Set<string>>>, key: string): void {
  setter(prev => {
    const next = new Set(prev)
    if (next.has(key)) {
      next.delete(key)
    } else {
      next.add(key)
    }
    return next
  })
}

export default function AdminDashboard(): React.ReactElement {
  const posthog = usePostHog()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set())
  const [expandedPageGroups, setExpandedPageGroups] = useState<Set<string>>(new Set())
  const [user, setUser] = useState<{ email?: string | null; id: string } | null>(null)
  const [widgetPages, setWidgetPages] = useState<WidgetPage[]>([])
  const [selectedPage, setSelectedPage] = useState<WidgetPage | null>(null)
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set())
  const [isArchiving, setIsArchiving] = useState(false)
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false)
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false)

  useEffect(() => {
    checkUser()
    fetchWidgetPages()
    posthog?.capture('admin_dashboard_viewed')
  }, [posthog])

  useEffect(() => {
    fetchStats()
  }, [selectedPage, widgetPages.length])

  async function checkUser(): Promise<void> {
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (authUser) {
      setUser({ id: authUser.id, email: authUser.email })
      posthog?.identify(authUser.id, {
        email: authUser.email,
        user_type: 'admin'
      })
    }
  }

  async function fetchWidgetPages(): Promise<void> {
    try {
      const response = await fetch('/api/admin/widget-pages', { cache: 'no-store' })
      const data = await response.json()
      setWidgetPages(data.pages || [])
    } catch (error) {
      console.error('Error fetching widget pages:', error)
    }
  }

  async function fetchStats(): Promise<void> {
    try {
      setLoading(true)
      const timestamp = Date.now()
      const url = selectedPage
        ? `/api/stats?pageUrl=${encodeURIComponent(selectedPage.page_url)}&_t=${timestamp}`
        : `/api/stats?_t=${timestamp}`
      const response = await fetch(url, { cache: 'no-store' })
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  function toggleSession(sessionId: string, session?: ConversationSession): void {
    setExpandedSessions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId)
      } else {
        newSet.add(sessionId)
        posthog?.capture('conversation_expanded', { session_id: sessionId })
        if (session?.is_unread) {
          markAsRead(session.session_id)
        }
      }
      return newSet
    })
  }

  function togglePageGroup(pageKey: string): void {
    toggleSetItem(setExpandedPageGroups, pageKey)
  }

  function toggleSessionSelection(sessionId: string, e: React.MouseEvent): void {
    e.stopPropagation()
    toggleSetItem(setSelectedSessions, sessionId)
  }

  async function handleArchive(): Promise<void> {
    if (selectedSessions.size === 0) return

    setIsArchiving(true)
    try {
      const response = await fetch('/api/admin/conversations/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_ids: Array.from(selectedSessions) })
      })

      if (!response.ok) {
        throw new Error('Failed to archive conversations')
      }

      const result = await response.json()
      console.log(`Archived ${result.archived} conversations, auto-resolved ${result.autoResolved} escalations`)

      posthog?.capture('conversations_archived', {
        count: result.archived,
        auto_resolved: result.autoResolved
      })

      setSelectedSessions(new Set())
      setShowArchiveConfirm(false)
      fetchStats()
    } catch (error) {
      console.error('Error archiving conversations:', error)
      alert('Failed to archive conversations. Please try again.')
    } finally {
      setIsArchiving(false)
    }
  }

  function updateSessionInStats(
    sessionId: string,
    updates: Partial<ConversationSession>
  ): void {
    setStats(prevStats => {
      if (!prevStats) return prevStats
      return {
        ...prevStats,
        recentSessions: prevStats.recentSessions.map(session =>
          session.session_id === sessionId
            ? { ...session, ...updates }
            : session
        )
      }
    })
  }

  async function toggleBookmark(
    sessionId: string,
    currentValue: boolean,
    e: React.MouseEvent
  ): Promise<void> {
    e.stopPropagation()

    const newValue = !currentValue
    updateSessionInStats(sessionId, {
      is_bookmarked: newValue,
      bookmarked_at: newValue ? new Date().toISOString() : null
    })

    try {
      const response = await fetch(`/api/admin/conversations/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_bookmarked: newValue })
      })

      if (!response.ok) {
        throw new Error('Failed to update bookmark')
      }

      posthog?.capture('conversation_bookmark_toggled', {
        session_id: sessionId,
        is_bookmarked: newValue
      })
    } catch (error) {
      console.error('Error toggling bookmark:', error)
      updateSessionInStats(sessionId, {
        is_bookmarked: currentValue,
        bookmarked_at: currentValue ? stats?.recentSessions.find(s => s.session_id === sessionId)?.bookmarked_at ?? null : null
      })
    }
  }

  async function markAsRead(sessionId: string): Promise<void> {
    const now = new Date().toISOString()
    updateSessionInStats(sessionId, { is_unread: false, last_viewed_at: now })

    try {
      await fetch(`/api/admin/conversations/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ last_viewed_at: now })
      })
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  async function toggleUnread(
    sessionId: string,
    currentlyUnread: boolean,
    e: React.MouseEvent
  ): Promise<void> {
    e.stopPropagation()

    if (currentlyUnread) {
      await markAsRead(sessionId)
      return
    }

    const pastDate = new Date(0).toISOString()
    updateSessionInStats(sessionId, { is_unread: true, last_viewed_at: pastDate })

    try {
      await fetch(`/api/admin/conversations/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ last_viewed_at: pastDate })
      })
    } catch (error) {
      console.error('Error marking as unread:', error)
    }
  }

  async function handleShare(sessionId: string, e: React.MouseEvent): Promise<void> {
    e.stopPropagation()

    try {
      const response = await fetch(`/api/admin/conversations/${sessionId}/share`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to generate share link')
      }

      const { token, url } = await response.json()
      await navigator.clipboard.writeText(url)

      updateSessionInStats(sessionId, { share_token: token })

      posthog?.capture('conversation_shared', { session_id: sessionId })
    } catch (error) {
      console.error('Error sharing conversation:', error)
      alert('Failed to generate share link. Please try again.')
    }
  }

  function handlePageSelect(page: WidgetPage | null): void {
    setSelectedPage(page)
    posthog?.capture('admin_page_filtered', {
      page_title: page?.page_title ?? 'All Pages',
      page_url: page?.page_url ?? null
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Reports
              </h1>
              <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">
                Monitor conversations and visitor engagement
              </p>
            </div>

            <PageSelector
              pages={widgetPages}
              selectedPage={selectedPage}
              onPageSelect={handlePageSelect}
            />
          </div>
        </div>

        <ConversationsList
          sessions={stats?.recentSessions || []}
          widgetPages={widgetPages}
          loading={loading}
          showBookmarkedOnly={showBookmarkedOnly}
          expandedSessions={expandedSessions}
          expandedPageGroups={expandedPageGroups}
          selectedSessions={selectedSessions}
          onToggleBookmarkedFilter={() => setShowBookmarkedOnly(prev => !prev)}
          onShowArchiveConfirm={() => setShowArchiveConfirm(true)}
          onToggleSession={toggleSession}
          onTogglePageGroup={togglePageGroup}
          onToggleSessionSelection={toggleSessionSelection}
          onToggleBookmark={toggleBookmark}
          onToggleUnread={toggleUnread}
          onShare={handleShare}
        />

        <QuestionThemes
          pageUrl={selectedPage?.page_url || null}
          widgetPages={widgetPages}
        />
      </div>

      {showArchiveConfirm && (
        <ArchiveConfirmModal
          selectedCount={selectedSessions.size}
          isArchiving={isArchiving}
          onConfirm={handleArchive}
          onCancel={() => setShowArchiveConfirm(false)}
        />
      )}
    </div>
  )
}
