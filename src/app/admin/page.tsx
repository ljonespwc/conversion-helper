'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, Users, TrendingUp, Activity, ChevronDown, ChevronRight, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/Header'
import StatsCard from '@/components/admin/StatsCard'

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
  matched_questions: number
  page_url: string | null
  messages: ConversationMessage[]
}

interface Stats {
  total: number
  today: number
  matchRate: number
  activeNow: number
  recentSessions: ConversationSession[]
}

interface WidgetPage {
  id: string
  page_url: string
  page_title: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set())
  const [user, setUser] = useState<{ email?: string | null; id: string } | null>(null)
  const [widgetPages, setWidgetPages] = useState<WidgetPage[]>([])
  const [selectedPage, setSelectedPage] = useState<WidgetPage | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkUser()
    fetchWidgetPages()
  }, [])

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
    }
  }

  const fetchWidgetPages = async () => {
    try {
      const response = await fetch('/api/admin/widget-pages')
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
        ? `/api/stats?pageUrl=${encodeURIComponent(selectedPage.page_url)}`
        : '/api/stats'
      const response = await fetch(url)
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSession = (sessionId: string) => {
    setExpandedSessions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId)
      } else {
        newSet.add(sessionId)
      }
      return newSet
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header with Assistant Page Selector */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Reports & Analytics</h1>
              <p className="text-gray-400 mt-2">Embed code and usage analytics</p>
            </div>

            {/* Assistant Page Selector */}
            {widgetPages.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 bg-gray-800 border border-gray-700 hover:border-blue-500 rounded-lg px-4 py-3 min-w-[250px] transition-colors"
                >
                  <Globe className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <p className="text-xs text-gray-400">Viewing Stats For:</p>
                    <p className="text-sm font-medium text-white truncate">
                      {selectedPage ? selectedPage.page_title : 'All Pages'}
                    </p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-full min-w-[300px] bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-[300px] overflow-y-auto">
                    {/* All Pages Option */}
                    <button
                      onClick={() => {
                        setSelectedPage(null)
                        setIsDropdownOpen(false)
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Conversations"
            value={loading ? '...' : stats?.total || 0}
            subtitle="All time"
            icon={<MessageCircle className="w-5 h-5" />}
          />
          <StatsCard
            title="Today's Conversations"
            value={loading ? '...' : stats?.today || 0}
            subtitle="Last 24 hours"
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <StatsCard
            title="FAQ Match Rate"
            value={loading ? '...' : `${stats?.matchRate || 0}%`}
            subtitle="Questions answered"
            icon={<Activity className="w-5 h-5" />}
          />
          <StatsCard
            title="Active Now"
            value={loading ? '...' : stats?.activeNow || 0}
            subtitle="Last 5 minutes"
            icon={<Users className="w-5 h-5" />}
          />
        </div>

        {/* Recent Conversations */}
        <div className="bg-gray-800 rounded-3xl shadow-xl border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700 bg-gray-900">
            <h2 className="text-xl font-bold text-white">Recent Conversations</h2>
          </div>

          {loading ? (
            <div className="px-6 py-8 text-center text-gray-400">
              Loading conversations...
            </div>
          ) : stats?.recentSessions?.length ? (
            <div className="divide-y divide-gray-700">
              {stats.recentSessions.map((session) => {
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

                return (
                  <div key={session.id}>
                    {/* Session Header */}
                    <div
                      className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-700/50 transition-colors"
                      onClick={() => toggleSession(session.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <button className="text-gray-500 hover:text-gray-300">
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </button>
                        <div>
                          <div className="text-sm font-medium text-white">
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
                            {session.total_questions} question{session.total_questions !== 1 ? 's' : ''}
                            {duration > 0 && ` • ${duration}s duration`}
                            {' • '}
                            {session.matched_questions}/{session.total_questions} matched
                            {session.page_url && (
                              <>
                                <br />
                                <span className="text-gray-500">
                                  {session.page_url.replace(/^https?:\/\//, '').substring(0, 50)}
                                  {session.page_url.length > 50 && '...'}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div>
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                            session.matched_questions > 0
                              ? 'bg-green-900/30 text-green-400'
                              : 'bg-gray-900/30 text-gray-400'
                          }`}
                        >
                          {session.total_questions > 0
                            ? `${Math.round((session.matched_questions / session.total_questions) * 100)}% Match`
                            : 'No Match'}
                        </span>
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
                                  <p className="text-sm text-gray-200">
                                    {message.message}
                                  </p>
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
                                <span
                                  className={`ml-4 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    message.matched
                                      ? 'bg-green-900/30 text-green-400'
                                      : 'bg-gray-900/30 text-gray-400'
                                  }`}
                                >
                                  {message.matched ? 'Matched' : 'No Match'}
                                </span>
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
          ) : (
            <div className="px-6 py-8 text-center text-gray-400">
              No conversations yet. The assistant will start tracking when users interact with it.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}