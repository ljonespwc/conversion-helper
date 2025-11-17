'use client'

import { useState, useEffect } from 'react'
import {
  Mail, ChevronDown, ChevronRight, Copy, Check,
  Filter, ArrowUpDown, AlertCircle, CheckCircle2, Clock
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/Header'

interface EscalationMessage {
  id: string
  role: 'user' | 'assistant'
  message: string
  timestamp: number | null
  needs_followup: boolean
  followup_reason: string | null
}

interface Escalation {
  id: string
  session_id: string
  user_email: string
  page_url: string | null
  total_questions: number
  started_at: string
  ended_at: string | null
  escalation_timestamp: string
  resolved: boolean
  resolved_at: string | null
  messages: EscalationMessage[]
  flagged_count: number
  flagged_messages: EscalationMessage[]
}

interface Stats {
  total: number
  unresolved: number
  resolved: number
  total_flagged_messages: number
}

export default function EscalationsPage() {
  const [escalations, setEscalations] = useState<Escalation[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set())
  const [user, setUser] = useState<{ email?: string | null; id: string } | null>(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'unresolved' | 'resolved'>('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'most_flagged'>('newest')
  const [pageUrlFilter, setPageUrlFilter] = useState<string>('')

  // Copy states
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)
  const [copiedConversation, setCopiedConversation] = useState<string | null>(null)

  // Loading state for status updates
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    fetchEscalations()
  }, [statusFilter, sortOrder, pageUrlFilter])

  const checkUser = async () => {
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (authUser) {
      setUser({ id: authUser.id, email: authUser.email })
    }
  }

  async function fetchEscalations() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (sortOrder) params.append('sort', sortOrder)
      if (pageUrlFilter) params.append('page_url', pageUrlFilter)

      const response = await fetch(`/api/admin/escalations?${params}`)
      const data = await response.json()

      setEscalations(data.escalations || [])
      setStats(data.stats)
    } catch (error) {
      console.error('Failed to fetch escalations:', error)
    } finally {
      setLoading(false)
    }
  }

  async function toggleResolved(sessionId: string, currentStatus: boolean) {
    try {
      setUpdatingStatus(sessionId)
      const response = await fetch(`/api/admin/escalations/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolved: !currentStatus })
      })

      if (response.ok) {
        await fetchEscalations() // Refresh list
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setUpdatingStatus(null)
    }
  }

  function toggleExpanded(sessionId: string) {
    setExpandedSessions(prev => {
      const next = new Set(prev)
      if (next.has(sessionId)) {
        next.delete(sessionId)
      } else {
        next.add(sessionId)
      }
      return next
    })
  }

  function copyEmail(email: string) {
    navigator.clipboard.writeText(email)
    setCopiedEmail(email)
    setTimeout(() => setCopiedEmail(null), 2000)
  }

  function copyConversation(escalation: Escalation) {
    const transcript = escalation.messages
      .map(m => `${m.role.toUpperCase()}: ${m.message}`)
      .join('\n\n')

    const formatted = `Email: ${escalation.user_email}\nPage: ${escalation.page_url || 'N/A'}\nFlagged Questions: ${escalation.flagged_count}\n\n--- CONVERSATION ---\n\n${transcript}`

    navigator.clipboard.writeText(formatted)
    setCopiedConversation(escalation.session_id)
    setTimeout(() => setCopiedConversation(null), 2000)
  }

  function formatTimeAgo(timestamp: string) {
    const diff = Date.now() - new Date(timestamp).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return 'Just now'
  }

  // Get unique page URLs for filter dropdown
  const uniquePages = Array.from(new Set(escalations.map(e => e.page_url).filter(Boolean)))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Email Escalations
          </h1>
          <p className="mt-2 text-gray-400">
            Manage customer escalations and unanswered questions
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Escalations</p>
                  <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-br from-blue-600/20 to-purple-600/20">
                  <Mail className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Unresolved</p>
                  <p className="text-3xl font-bold text-red-400 mt-2">{stats.unresolved}</p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-br from-red-600/20 to-orange-600/20">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Resolved</p>
                  <p className="text-3xl font-bold text-green-400 mt-2">{stats.resolved}</p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-br from-green-600/20 to-emerald-600/20">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Flagged Messages</p>
                  <p className="text-3xl font-bold text-orange-400 mt-2">{stats.total_flagged_messages}</p>
                </div>
                <div className="p-3 rounded-full bg-gradient-to-br from-orange-600/20 to-yellow-600/20">
                  <AlertCircle className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mt-8 bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-gray-400 font-medium">Filters:</span>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="unresolved">Unresolved Only</option>
              <option value="resolved">Resolved Only</option>
            </select>

            {/* Sort Order */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5 text-gray-400" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="most_flagged">Most Flagged</option>
              </select>
            </div>

            {/* Page URL Filter */}
            {uniquePages.length > 0 && (
              <select
                value={pageUrlFilter}
                onChange={(e) => setPageUrlFilter(e.target.value)}
                className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Pages</option>
                {uniquePages.map(page => (
                  <option key={page} value={page!}>
                    {new URL(page!).pathname}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Escalations List */}
        <div className="mt-8 bg-gray-800 border border-gray-700 rounded-3xl shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700 bg-gray-900">
            <h2 className="text-xl font-bold text-white">
              {loading ? 'Loading...' : `${escalations.length} Escalation${escalations.length !== 1 ? 's' : ''}`}
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-4">Loading escalations...</p>
            </div>
          ) : escalations.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No escalations found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {escalations.map((escalation) => {
                const isExpanded = expandedSessions.has(escalation.session_id)

                return (
                  <div key={escalation.session_id}>
                    {/* Row Header */}
                    <div
                      className="px-6 py-4 hover:bg-gray-700/50 transition-colors cursor-pointer"
                      onClick={() => toggleExpanded(escalation.session_id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  copyEmail(escalation.user_email)
                                }}
                                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium group"
                              >
                                {escalation.user_email}
                                {copiedEmail === escalation.user_email ? (
                                  <Check className="w-4 h-4 text-green-400" />
                                ) : (
                                  <Copy className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                              </button>

                              <span className="text-gray-500">•</span>
                              <span className="text-gray-400 text-sm">
                                {formatTimeAgo(escalation.escalation_timestamp)}
                              </span>

                              {escalation.flagged_count > 0 && (
                                <>
                                  <span className="text-gray-500">•</span>
                                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-red-900/30 text-red-400">
                                    <AlertCircle className="w-3 h-3" />
                                    {escalation.flagged_count} flagged
                                  </span>
                                </>
                              )}

                              {escalation.resolved ? (
                                <>
                                  <span className="text-gray-500">•</span>
                                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-900/30 text-green-400">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Resolved
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="text-gray-500">•</span>
                                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-red-900/30 text-red-400">
                                    <Clock className="w-3 h-3" />
                                    Unresolved
                                  </span>
                                </>
                              )}
                            </div>

                            <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                              <span>{escalation.page_url ? new URL(escalation.page_url).pathname : 'No page'}</span>
                              <span>•</span>
                              <span>{escalation.messages.length} messages</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="px-6 pb-6 bg-gray-900/50">
                            {/* Action Buttons */}
                            <div className="flex gap-3 mb-4 pt-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  copyConversation(escalation)
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                              >
                                {copiedConversation === escalation.session_id ? (
                                  <>
                                    <Check className="w-4 h-4 text-green-400" />
                                    Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-4 h-4" />
                                    Copy Conversation
                                  </>
                                )}
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleResolved(escalation.session_id, escalation.resolved)
                                }}
                                disabled={updatingStatus === escalation.session_id}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                  updatingStatus === escalation.session_id
                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                    : escalation.resolved
                                    ? 'bg-orange-900/30 hover:bg-orange-900/50 text-orange-400'
                                    : 'bg-green-900/30 hover:bg-green-900/50 text-green-400'
                                }`}
                              >
                                {updatingStatus === escalation.session_id ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                                    Updating...
                                  </>
                                ) : escalation.resolved ? (
                                  <>
                                    <Clock className="w-4 h-4" />
                                    Reopen
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    Mark as Handled
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Messages */}
                            <div className="space-y-3">
                              {escalation.messages.map((msg) => {
                                const isFlagged = msg.needs_followup

                                return (
                                  <div
                                    key={msg.id}
                                    className={`p-4 rounded-lg ${
                                      isFlagged
                                        ? 'bg-red-900/20 border border-red-700/50'
                                        : msg.role === 'user'
                                        ? 'bg-blue-900/20'
                                        : 'bg-purple-900/20'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between mb-2">
                                      <span className={`text-xs font-semibold uppercase ${
                                        msg.role === 'user' ? 'text-blue-400' : 'text-purple-400'
                                      }`}>
                                        {msg.role}
                                      </span>
                                      {msg.timestamp && (
                                        <span className="text-xs text-gray-500">
                                          {new Date(msg.timestamp).toLocaleTimeString()}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-white text-sm">{msg.message}</p>
                                    {isFlagged && msg.followup_reason && (
                                      <div className="mt-2 flex items-center gap-2 text-xs text-red-400">
                                        <AlertCircle className="w-3 h-3" />
                                        <span>{msg.followup_reason}</span>
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
