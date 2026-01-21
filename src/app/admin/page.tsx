'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, Users, TrendingUp, Activity, ChevronDown, ChevronRight, Globe, Star, Archive, Bookmark, Circle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/Header'
import { findMatchingPattern } from '@/lib/url-matching'
import StatsCard from '@/components/admin/StatsCard'
import { usePostHog } from 'posthog-js/react'

// Force dynamic rendering - prevent page caching
export const dynamic = 'force-dynamic'

interface ConversationMessage {
  id: string
  role: 'user' | 'assistant'
  message: string
  timestamp: number | null
  matched: boolean
  category: string | null
  created_at: string
}

interface ConversationSession {
  id: string
  session_id: string
  started_at: string
  ended_at: string | null
  total_questions: number
  matched_responses: number
  page_url: string | null
  user_rating: number | null
  messages: ConversationMessage[]
  is_bookmarked: boolean
  bookmarked_at: string | null
  last_viewed_at: string | null
  is_unread: boolean
}

interface Stats {
  total: number
  today: number
  avgDuration: number
  activeNow: number
  avgRating: number
  totalRatings: number
  recentSessions: ConversationSession[]
}

interface WidgetPage {
  id: string
  page_url: string
  page_title: string
}

export default function AdminDashboard() {
  const posthog = usePostHog()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set())
  const [expandedPageGroups, setExpandedPageGroups] = useState<Set<string>>(new Set())
  const [user, setUser] = useState<{ email?: string | null; id: string } | null>(null)
  const [widgetPages, setWidgetPages] = useState<WidgetPage[]>([])
  const [selectedPage, setSelectedPage] = useState<WidgetPage | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set())
  const [isArchiving, setIsArchiving] = useState(false)
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false)
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkUser()
    fetchWidgetPages()
    // Track admin dashboard view
    posthog?.capture('admin_dashboard_viewed')
  }, [posthog])

  // Fetch stats when selected page changes or widget pages are loaded
  useEffect(() => {
    // Always fetch stats - API will handle empty pages case
    fetchStats()
  }, [selectedPage, widgetPages.length])

  const checkUser = async () => {
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (authUser) {
      setUser({ id: authUser.id, email: authUser.email })
      // Identify admin user in PostHog
      posthog?.identify(authUser.id, {
        email: authUser.email,
        user_type: 'admin'
      })
    }
  }

  const fetchWidgetPages = async () => {
    try {
      const response = await fetch('/api/admin/widget-pages', {
        cache: 'no-store'
      })
      const data = await response.json()
      const pages = data.pages || []
      setWidgetPages(pages)

      // Default to "All Pages" (selectedPage = null)
      // User can select specific page if needed
    } catch (error) {
      console.error('Error fetching widget pages:', error)
    }
  }

  const fetchStats = async () => {
    try {
      setLoading(true)
      const url = selectedPage
        ? `/api/stats?pageUrl=${encodeURIComponent(selectedPage.page_url)}&_t=${Date.now()}`
        : `/api/stats?_t=${Date.now()}`
      const response = await fetch(url, {
        cache: 'no-store'
      })
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSession = (sessionId: string, session?: ConversationSession) => {
    setExpandedSessions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId)
      } else {
        newSet.add(sessionId)
        // Track conversation expansion
        posthog?.capture('conversation_expanded', {
          session_id: sessionId
        })
        // Auto-mark as read when expanding
        if (session?.is_unread) {
          markAsRead(session.session_id)
        }
      }
      return newSet
    })
  }

  const togglePageGroup = (pageKey: string) => {
    setExpandedPageGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(pageKey)) {
        newSet.delete(pageKey)
      } else {
        newSet.add(pageKey)
      }
      return newSet
    })
  }

  const toggleSessionSelection = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Don't expand/collapse on checkbox click
    setSelectedSessions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId)
      } else {
        newSet.add(sessionId)
      }
      return newSet
    })
  }

  const handleArchive = async () => {
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

      // Track archive action
      posthog?.capture('conversations_archived', {
        count: result.archived,
        auto_resolved: result.autoResolved
      })

      // Clear selection and refresh
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

  const toggleBookmark = async (sessionId: string, currentValue: boolean, e: React.MouseEvent) => {
    e.stopPropagation() // Don't expand/collapse on bookmark click

    // Optimistically update the UI
    setStats(prevStats => {
      if (!prevStats) return prevStats
      return {
        ...prevStats,
        recentSessions: prevStats.recentSessions.map(session =>
          session.session_id === sessionId
            ? { ...session, is_bookmarked: !currentValue, bookmarked_at: !currentValue ? new Date().toISOString() : null }
            : session
        )
      }
    })

    try {
      const response = await fetch(`/api/admin/conversations/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_bookmarked: !currentValue })
      })

      if (!response.ok) {
        throw new Error('Failed to update bookmark')
      }

      // Track bookmark action
      posthog?.capture('conversation_bookmark_toggled', {
        session_id: sessionId,
        is_bookmarked: !currentValue
      })
    } catch (error) {
      console.error('Error toggling bookmark:', error)
      // Revert on error
      setStats(prevStats => {
        if (!prevStats) return prevStats
        return {
          ...prevStats,
          recentSessions: prevStats.recentSessions.map(session =>
            session.session_id === sessionId
              ? { ...session, is_bookmarked: currentValue, bookmarked_at: currentValue ? session.bookmarked_at : null }
              : session
          )
        }
      })
    }
  }

  const markAsRead = async (sessionId: string) => {
    const now = new Date().toISOString()

    // Optimistically update the UI
    setStats(prevStats => {
      if (!prevStats) return prevStats
      return {
        ...prevStats,
        recentSessions: prevStats.recentSessions.map(session =>
          session.session_id === sessionId
            ? { ...session, is_unread: false, last_viewed_at: now }
            : session
        )
      }
    })

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

  const toggleUnread = async (sessionId: string, currentlyUnread: boolean, e: React.MouseEvent) => {
    e.stopPropagation() // Don't expand/collapse

    if (currentlyUnread) {
      // Mark as read
      await markAsRead(sessionId)
    } else {
      // Mark as unread by setting last_viewed_at to a past date
      const pastDate = new Date(0).toISOString()

      setStats(prevStats => {
        if (!prevStats) return prevStats
        return {
          ...prevStats,
          recentSessions: prevStats.recentSessions.map(session =>
            session.session_id === sessionId
              ? { ...session, is_unread: true, last_viewed_at: pastDate }
              : session
          )
        }
      })

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
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header with Assistant Page Selector */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Reports & Analytics</h1>
              <p className="text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">Embed code and usage analytics</p>
            </div>

            {/* Assistant Page Selector */}
            {widgetPages.length > 0 && (
              <div className="relative w-full sm:w-auto">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 bg-gray-800 border border-gray-700 hover:border-blue-500 rounded-lg px-4 py-3 w-full sm:min-w-[250px] transition-colors"
                >
                  <Globe className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-xs text-gray-400">Viewing Stats For:</p>
                    <p className="text-sm font-medium text-white truncate">
                      {selectedPage ? selectedPage.page_title : 'All Pages'}
                    </p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-full sm:min-w-[300px] bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-[300px] overflow-y-auto">
                    {/* All Pages Option */}
                    <button
                      onClick={() => {
                        setSelectedPage(null)
                        setIsDropdownOpen(false)
                        // Track page filter change
                        posthog?.capture('admin_page_filtered', {
                          page_title: 'All Pages',
                          page_url: null
                        })
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors border-b border-gray-700 ${
                        !selectedPage ? 'bg-blue-900/30' : ''
                      }`}
                    >
                      <p className="text-sm font-medium text-white">All Pages</p>
                      <p className="text-xs text-gray-400 mt-1">View combined stats from all assistant pages</p>
                    </button>

                    {/* Individual Pages */}
                    {widgetPages.map((page) => (
                      <button
                        key={page.id}
                        onClick={() => {
                          setSelectedPage(page)
                          setIsDropdownOpen(false)
                          // Track page filter change
                          posthog?.capture('admin_page_filtered', {
                            page_title: page.page_title,
                            page_url: page.page_url
                          })
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0 ${
                          selectedPage?.id === page.id ? 'bg-blue-900/30' : ''
                        }`}
                      >
                        <p className="text-sm font-medium text-white">{page.page_title}</p>
                        <p className="text-xs text-gray-400 mt-1 truncate">{page.page_url}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatsCard
            title="Total Conversations"
            value={loading ? '...' : stats?.total || 0}
            icon={<MessageCircle className="w-5 h-5" />}
          />
          <StatsCard
            title="Today's Conversations"
            value={loading ? '...' : stats?.today || 0}
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <StatsCard
            title="Avg Session Duration"
            value={loading ? '...' : stats?.avgDuration ? `${Math.floor((stats.avgDuration || 0) / 60)}m ${(stats.avgDuration || 0) % 60}s` : '0s'}
            icon={<Activity className="w-5 h-5" />}
          />
          <StatsCard
            title="Active Now"
            value={loading ? '...' : stats?.activeNow || 0}
            icon={<Users className="w-5 h-5" />}
          />
          <StatsCard
            title="User Ratings"
            value={
              loading ? '...' : (
                <div className="flex flex-col items-center leading-tight">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                    <span>{stats?.avgRating?.toFixed(1) || '0.0'}</span>
                  </div>
                  <div className="text-xs text-gray-400">{stats?.totalRatings || 0} ratings</div>
                </div>
              )
            }
            icon={<Star className="w-5 h-5" />}
          />
        </div>

        {/* Recent Conversations */}
        <div className="bg-gray-800 rounded-3xl shadow-xl border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700 bg-gray-900 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Recent Conversations</h2>
            <div className="flex items-center gap-3">
              {/* Bookmark Filter Toggle */}
              <button
                onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  showBookmarkedOnly
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${showBookmarkedOnly ? 'fill-current' : ''}`} />
                {showBookmarkedOnly ? 'Bookmarked' : 'Show Bookmarked'}
              </button>
              {selectedSessions.size > 0 && (
                <button
                  onClick={() => setShowArchiveConfirm(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Archive className="w-4 h-4" />
                  Archive Selected ({selectedSessions.size})
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-8 text-center text-gray-400">
              Loading conversations...
            </div>
          ) : stats?.recentSessions?.length ? (
            <div>
              {(() => {
                // Filter sessions if bookmark filter is active
                const filteredSessions = showBookmarkedOnly
                  ? stats.recentSessions.filter(s => s.is_bookmarked)
                  : stats.recentSessions

                // Get page patterns for matching
                const pagePatterns = widgetPages.map(p => p.page_url)

                // Group sessions by MATCHED PATTERN (not raw URL) to consolidate URLs with different query params
                const sessionsByPage = new Map<string | null, ConversationSession[]>()

                filteredSessions.forEach(session => {
                  const pageUrl = session.page_url || null
                  // Find the matching pattern for this URL (strips query params, handles wildcards)
                  const matchedPattern = pageUrl ? findMatchingPattern(pageUrl, pagePatterns) : null
                  // Use matched pattern as the group key, or fall back to raw URL if no match
                  const groupKey = matchedPattern || pageUrl

                  if (!sessionsByPage.has(groupKey)) {
                    sessionsByPage.set(groupKey, [])
                  }
                  sessionsByPage.get(groupKey)!.push(session)
                })

                // Convert to array and sort: known pages first (alphabetically), then unknown
                const sortedGroups = Array.from(sessionsByPage.entries()).sort(([urlA], [urlB]) => {
                  if (urlA === null) return 1 // Unknown pages last
                  if (urlB === null) return -1
                  return urlA.localeCompare(urlB)
                })

                // Show message if no sessions after filtering
                if (sortedGroups.length === 0 && showBookmarkedOnly) {
                  return (
                    <div className="px-6 py-8 text-center text-gray-400">
                      No bookmarked conversations. Click the bookmark icon on a conversation to save it for later.
                    </div>
                  )
                }

                return sortedGroups.map(([groupKey, sessions]) => {
                  // groupKey is either a matched pattern or a raw URL (for unmatched sessions)
                  const page = widgetPages.find(p => p.page_url === groupKey)
                  const pageTitle = page?.page_title || (groupKey ? 'Unknown Page' : 'Demo/Test Sessions')
                  const displayUrl = page?.page_url || groupKey
                  const pageKey = groupKey || 'unknown'
                  const isPageExpanded = expandedPageGroups.has(pageKey)

                  // Count unread sessions in this group
                  const unreadCount = sessions.filter(s => s.is_unread).length

                  return (
                    <div key={pageKey} className="border-b border-gray-700 last:border-b-0">
                      {/* Page Group Header - Clickable */}
                      <div
                        className="bg-gray-900/80 px-6 py-3 cursor-pointer hover:bg-gray-800/80 transition-colors"
                        onClick={() => togglePageGroup(pageKey)}
                      >
                        <div className="flex items-center gap-2">
                          {isPageExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )}
                          <Globe className="w-4 h-4 text-blue-400" />
                          <h3 className="text-sm font-semibold text-white">{pageTitle}</h3>
                          <span className="text-xs text-gray-500">({sessions.length})</span>
                          {unreadCount > 0 && (
                            <span className="text-xs text-blue-400 font-medium">
                              {unreadCount} unread
                            </span>
                          )}
                        </div>
                        {displayUrl && (
                          <p className="text-xs text-gray-500 mt-0.5 ml-6 truncate">{displayUrl}</p>
                        )}
                      </div>

                      {/* Sessions in this group - Only show when expanded */}
                      {isPageExpanded && (
                      <div className="divide-y divide-gray-700">
                        {sessions.map((session) => {
                const isExpanded = expandedSessions.has(session.id)

                // Calculate duration from message timestamps (more accurate than session start/end)
                let duration = 0
                if (session.messages && session.messages.length >= 2) {
                  const timestamps = session.messages
                    .map(m => m.timestamp)
                    .filter((t): t is number => t !== null)
                    .sort((a, b) => a - b)

                  if (timestamps.length >= 2) {
                    duration = Math.round((timestamps[timestamps.length - 1] - timestamps[0]) / 1000)
                  }
                } else if (session.ended_at) {
                  // Fallback to session times if no message timestamps
                  duration = Math.round((new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 1000)
                }

                // Count message types
                const assistantMessages = session.messages?.filter(m => m.role === 'assistant') || []
                const userMessages = session.messages?.filter(m => m.role === 'user') || []
                const assistantMessageCount = assistantMessages.length
                const userMessageCount = userMessages.length

                // Session-level rating
                const hasRating = !!session.user_rating

                return (
                  <div key={session.id}>
                    {/* Session Header */}
                    <div
                      className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-700/50 transition-colors"
                      onClick={() => toggleSession(session.id, session)}
                    >
                      <div className="flex items-center space-x-3">
                        {/* Bookmark icon */}
                        <button
                          onClick={(e) => toggleBookmark(session.session_id, session.is_bookmarked, e)}
                          className={`p-1 rounded transition-colors ${
                            session.is_bookmarked
                              ? 'text-yellow-400 hover:text-yellow-300'
                              : 'text-gray-500 hover:text-gray-300'
                          }`}
                          title={session.is_bookmarked ? 'Remove bookmark' : 'Add bookmark'}
                        >
                          <Bookmark className={`w-4 h-4 ${session.is_bookmarked ? 'fill-current' : ''}`} />
                        </button>
                        {/* Unread indicator */}
                        <button
                          onClick={(e) => toggleUnread(session.session_id, session.is_unread, e)}
                          className={`p-0.5 rounded transition-colors ${
                            session.is_unread
                              ? 'text-blue-400'
                              : 'text-gray-600 hover:text-gray-400'
                          }`}
                          title={session.is_unread ? 'Mark as read' : 'Mark as unread'}
                        >
                          <Circle className={`w-2.5 h-2.5 ${session.is_unread ? 'fill-current' : ''}`} />
                        </button>
                        {/* Selection checkbox */}
                        <input
                          type="checkbox"
                          checked={selectedSessions.has(session.session_id)}
                          onClick={(e) => toggleSessionSelection(session.session_id, e)}
                          onChange={() => {}} // Controlled by onClick
                          className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800 cursor-pointer"
                        />
                        <button className="text-gray-500 hover:text-gray-300">
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </button>
                        <div>
                          <div className={`text-sm font-medium ${session.is_unread ? 'text-white' : 'text-gray-300'}`}>
                            {new Date(session.started_at).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                            {' - '}
                            {new Date(session.started_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {assistantMessageCount} Assistant message{assistantMessageCount !== 1 ? 's' : ''}
                            {' • '}
                            {userMessageCount} User message{userMessageCount !== 1 ? 's' : ''}
                            {duration > 0 && ` • ${duration}s duration`}
                            {hasRating && (
                              <>
                                {' • '}
                                <span className="inline-flex text-orange-400" title={`User rating: ${session.user_rating}/5`}>
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className="w-3 h-3"
                                      fill={i < (session.user_rating || 0) ? 'currentColor' : 'none'}
                                    />
                                  ))}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Session Messages (Expandable) */}
                    {isExpanded && session.messages && session.messages.length > 0 && (
                      <div className="bg-gray-900/50 px-6 py-3 border-t border-gray-700">
                        <div className="space-y-3">
                          {session.messages.map((message, idx) => (
                              <div
                                key={message.id}
                                className="bg-gray-800/50 rounded-lg px-4 py-3 border border-gray-700"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded ${
                                        message.role === 'user'
                                          ? 'bg-blue-900/30 text-blue-400'
                                          : 'bg-purple-900/30 text-purple-400'
                                      }`}>
                                        {message.role === 'user' ? '👤 User' : '🤖 Assistant'}
                                      </span>
                                    </div>
                                    <div className="text-sm text-gray-200">
                                      {message.role === 'assistant' ? (
                                        <ReactMarkdown
                                          components={{
                                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                            strong: ({ children }) => <strong className="font-semibold text-purple-300">{children}</strong>,
                                            em: ({ children }) => <em className="italic text-gray-300">{children}</em>,
                                            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                                            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                                            li: ({ children }) => <li>{children}</li>,
                                            code: ({ children }) => <code className="bg-gray-700 px-1.5 py-0.5 rounded text-purple-300 text-xs">{children}</code>,
                                          }}
                                        >
                                          {message.message}
                                        </ReactMarkdown>
                                      ) : (
                                        message.message
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {message.timestamp
                                        ? new Date(message.timestamp).toLocaleTimeString('en-US', {
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            second: '2-digit',
                                            hour12: true
                                          })
                                        : new Date(message.created_at).toLocaleTimeString('en-US', {
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            second: '2-digit',
                                            hour12: true
                                          })
                                      }
                                      {message.category && ` • ${message.category}`}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
                      </div>
                      )}
                    </div>
                  )
                })
              })()}
            </div>
          ) : (
            <div className="px-6 py-8 text-center text-gray-400">
              No conversations yet. The assistant will start tracking when users interact with it.
            </div>
          )}
        </div>
      </div>

      {/* Archive Confirmation Modal */}
      {showArchiveConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-2">Archive Conversations</h3>
            <p className="text-gray-300 mb-4">
              Archive {selectedSessions.size} conversation{selectedSessions.size !== 1 ? 's' : ''}?
            </p>
            <p className="text-sm text-gray-400 mb-6">
              This will hide them from the dashboard. Any unresolved escalations will be automatically marked as resolved.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowArchiveConfirm(false)}
                disabled={isArchiving}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleArchive}
                disabled={isArchiving}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isArchiving ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Archiving...
                  </>
                ) : (
                  <>
                    <Archive className="w-4 h-4" />
                    Archive
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}