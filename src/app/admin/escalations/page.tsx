'use client'

import { useState, useEffect } from 'react'
import { Mail, Filter, ArrowUpDown, AlertCircle, CheckCircle2, Archive } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/Header'
import StatsCard from '@/components/admin/StatsCard'
import EscalationSessionItem from '@/components/admin/EscalationSessionItem'
import ArchiveConfirmModal from '@/components/admin/ArchiveConfirmModal'
import type { Escalation, EscalationStats } from '@/components/admin/types'

export const dynamic = 'force-dynamic'

type StatusFilter = 'all' | 'unresolved' | 'resolved'
type SortOrder = 'newest' | 'oldest' | 'most_flagged'

export default function EscalationsPage(): React.ReactElement {
  const [escalations, setEscalations] = useState<Escalation[]>([])
  const [stats, setStats] = useState<EscalationStats | null>(null)
  const [availablePages, setAvailablePages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set())
  const [user, setUser] = useState<{ email?: string | null; id: string } | null>(null)

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [pageUrlFilter, setPageUrlFilter] = useState<string>('')

  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)
  const [copiedConversation, setCopiedConversation] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set())
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)

  useEffect(() => {
    checkUser()
    fetchEscalations()
  }, [])

  useEffect(() => {
    fetchEscalations()
  }, [statusFilter, sortOrder, pageUrlFilter])

  async function checkUser(): Promise<void> {
    const supabase = createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    if (authUser) {
      setUser({ id: authUser.id, email: authUser.email })
    }
  }

  async function fetchEscalations(): Promise<void> {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter !== 'all') params.append('status', statusFilter)
    if (sortOrder) params.append('sort', sortOrder)
    if (pageUrlFilter) params.append('page_url', pageUrlFilter)
    params.append('_t', Date.now().toString())

    const response = await fetch(`/api/admin/escalations?${params}`, {
      cache: 'no-store',
    })
    const data = await response.json()

    setEscalations(data.escalations || [])
    setStats(data.stats)
    setAvailablePages(data.availablePages || [])
    setLoading(false)
  }

  async function toggleResolved(
    sessionId: string,
    currentStatus: boolean
  ): Promise<void> {
    setUpdatingStatus(sessionId)
    const response = await fetch(`/api/admin/escalations/${sessionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolved: !currentStatus }),
    })

    if (response.ok) {
      await fetchEscalations()
    }
    setUpdatingStatus(null)
  }

  function toggleExpanded(sessionId: string): void {
    setExpandedSessions((prev) => {
      const next = new Set(prev)
      if (next.has(sessionId)) {
        next.delete(sessionId)
      } else {
        next.add(sessionId)
      }
      return next
    })
  }

  function copyEmail(email: string): void {
    navigator.clipboard.writeText(email)
    setCopiedEmail(email)
    setTimeout(() => setCopiedEmail(null), 2000)
  }

  function copyConversation(escalation: Escalation): void {
    const transcript = escalation.messages
      .map((m) => `${m.role.toUpperCase()}: ${m.message}`)
      .join('\n\n')

    const formatted = `Email: ${escalation.user_email}\nPage: ${escalation.page_url || 'N/A'}\nFlagged Questions: ${escalation.flagged_count}\n\n--- CONVERSATION ---\n\n${transcript}`

    navigator.clipboard.writeText(formatted)
    setCopiedConversation(escalation.session_id)
    setTimeout(() => setCopiedConversation(null), 2000)
  }

  function toggleSelectSession(sessionId: string): void {
    setSelectedSessions((prev) => {
      const next = new Set(prev)
      if (next.has(sessionId)) {
        next.delete(sessionId)
      } else {
        next.add(sessionId)
      }
      return next
    })
  }

  async function handleArchive(): Promise<void> {
    if (selectedSessions.size === 0) return
    setIsArchiving(true)
    try {
      const response = await fetch('/api/admin/conversations/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_ids: Array.from(selectedSessions) }),
      })
      if (response.ok) {
        setSelectedSessions(new Set())
        setShowArchiveConfirm(false)
        await fetchEscalations()
      }
    } catch (err) {
      console.error('Error archiving escalations:', err)
    } finally {
      setIsArchiving(false)
    }
  }

  function formatTimeAgo(timestamp: string): string {
    const diff = Date.now() - new Date(timestamp).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return 'Just now'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Escalations
          </h1>
          <p className="mt-2 text-gray-500">
            Review customer escalations and flagged AI responses
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Escalations"
              value={stats.total}
              icon={<Mail className="w-6 h-6" />}
            />
            <StatsCard
              title="Unresolved"
              value={<span className="text-red-600">{stats.unresolved}</span>}
              icon={<AlertCircle className="w-6 h-6 text-red-600" />}
            />
            <StatsCard
              title="Resolved"
              value={<span className="text-green-600">{stats.resolved}</span>}
              icon={<CheckCircle2 className="w-6 h-6 text-green-600" />}
            />
            <StatsCard
              title="Flagged Messages"
              value={<span className="text-orange-600">{stats.total_flagged_messages}</span>}
              icon={<AlertCircle className="w-6 h-6 text-orange-600" />}
            />
          </div>
        )}

        <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-gray-500 font-medium">Filters:</span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="all">All Status</option>
              <option value="unresolved">Unresolved Only</option>
              <option value="resolved">Resolved Only</option>
            </select>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5 text-gray-500" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="most_flagged">Most Flagged</option>
              </select>
            </div>

            {availablePages.length > 0 && (
              <select
                value={pageUrlFilter}
                onChange={(e) => setPageUrlFilter(e.target.value)}
                className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="">All Pages</option>
                {availablePages.map((page) => (
                  <option key={page} value={page}>
                    {page}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="mt-8 bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {loading
                ? 'Loading...'
                : `${escalations.length} Escalation${escalations.length !== 1 ? 's' : ''}`}
            </h2>
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

          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
              <p className="mt-4">Loading escalations...</p>
            </div>
          ) : escalations.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No escalations found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {escalations.map((escalation) => (
                <EscalationSessionItem
                  key={escalation.session_id}
                  escalation={escalation}
                  isExpanded={expandedSessions.has(escalation.session_id)}
                  isSelected={selectedSessions.has(escalation.session_id)}
                  copiedEmail={copiedEmail}
                  copiedConversation={copiedConversation}
                  updatingStatus={updatingStatus}
                  onToggleExpand={() => toggleExpanded(escalation.session_id)}
                  onToggleSelect={() => toggleSelectSession(escalation.session_id)}
                  onCopyEmail={copyEmail}
                  onCopyConversation={copyConversation}
                  onToggleResolved={toggleResolved}
                  formatTimeAgo={formatTimeAgo}
                />
              ))}
            </div>
          )}
        </div>
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
