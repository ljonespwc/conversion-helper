'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Check, MessageCircle, Users, TrendingUp, Activity, ChevronDown, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/Header'
import StatsCard from '@/components/admin/StatsCard'

interface ConversationMessage {
  id: string
  question: string
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

export default function AdminDashboard() {
  const [copied, setCopied] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set())
  const [user, setUser] = useState<{ email?: string | null; id: string } | null>(null)
  const router = useRouter()

  const embedCode = `<script src="${process.env.NEXT_PUBLIC_APP_URL || 'https://conversion-helper.vercel.app'}/widget.js"></script>`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    checkUser()
    fetchStats()
  }, [])

  const checkUser = async () => {
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (authUser) {
      setUser({ id: authUser.id, email: authUser.email })
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
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
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Reports & Analytics</h1>
          <p className="text-gray-400 mt-2">Embed code and usage analytics</p>
        </div>

        {/* Embed Code Section */}
        <div className="bg-gray-800 rounded-3xl shadow-xl border border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Quick Install</h2>
          <p className="text-gray-300 mb-4">Add this single line of code to any page where you want the voice assistant:</p>

          <div className="relative">
            <pre className="bg-gray-950 text-gray-100 p-4 rounded-lg overflow-x-auto border border-gray-700">
              <code>{embedCode}</code>
            </pre>
            <button
              onClick={copyToClipboard}
              className="absolute top-2 right-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg px-3 py-1.5 text-sm font-medium transition-all flex items-center gap-2 shadow-lg"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>

          <p className="text-sm text-gray-400 mt-4">
            The widget will appear as a chat button in the bottom-right corner of the page.
          </p>
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
                const duration = session.ended_at
                  ? Math.round((new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 1000)
                  : 0

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
                                  <p className="text-sm text-gray-200">
                                    {message.question}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(message.created_at).toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                      second: '2-digit',
                                      hour12: true
                                    })}
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
              No conversations yet. The widget will start tracking when users interact with it.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}