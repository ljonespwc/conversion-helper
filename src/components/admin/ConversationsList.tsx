'use client'

import { Archive, Bookmark } from 'lucide-react'
import PageGroup from './PageGroup'
import { findMatchingPattern } from '@/lib/url-matching'
import type { ConversationSession, WidgetPage } from './types'

interface ConversationsListProps {
  sessions: ConversationSession[]
  widgetPages: WidgetPage[]
  loading: boolean
  showBookmarkedOnly: boolean
  expandedSessions: Set<string>
  expandedPageGroups: Set<string>
  selectedSessions: Set<string>
  onToggleBookmarkedFilter: () => void
  onShowArchiveConfirm: () => void
  onToggleSession: (sessionId: string, session: ConversationSession) => void
  onTogglePageGroup: (pageKey: string) => void
  onToggleSessionSelection: (sessionId: string, e: React.MouseEvent) => void
  onToggleBookmark: (sessionId: string, currentValue: boolean, e: React.MouseEvent) => void
  onToggleUnread: (sessionId: string, currentlyUnread: boolean, e: React.MouseEvent) => void
  onShare: (sessionId: string, e: React.MouseEvent) => void
}

function groupSessionsByPage(
  sessions: ConversationSession[],
  pagePatterns: string[]
): Map<string | null, ConversationSession[]> {
  const sessionsByPage = new Map<string | null, ConversationSession[]>()

  sessions.forEach((session) => {
    const pageUrl = session.page_url || null
    const matchedPattern = pageUrl ? findMatchingPattern(pageUrl, pagePatterns) : null
    const groupKey = matchedPattern || pageUrl

    if (!sessionsByPage.has(groupKey)) {
      sessionsByPage.set(groupKey, [])
    }
    sessionsByPage.get(groupKey)!.push(session)
  })

  return sessionsByPage
}

function sortGroups(
  groups: Map<string | null, ConversationSession[]>
): Array<[string | null, ConversationSession[]]> {
  return Array.from(groups.entries()).sort(([urlA], [urlB]) => {
    if (urlA === null) return 1
    if (urlB === null) return -1
    return urlA.localeCompare(urlB)
  })
}

export default function ConversationsList({
  sessions,
  widgetPages,
  loading,
  showBookmarkedOnly,
  expandedSessions,
  expandedPageGroups,
  selectedSessions,
  onToggleBookmarkedFilter,
  onShowArchiveConfirm,
  onToggleSession,
  onTogglePageGroup,
  onToggleSessionSelection,
  onToggleBookmark,
  onToggleUnread,
  onShare,
}: ConversationsListProps): React.ReactElement {
  const filteredSessions = showBookmarkedOnly
    ? sessions.filter((s) => s.is_bookmarked)
    : sessions

  const pagePatterns = widgetPages.map((p) => p.page_url)
  const sessionsByPage = groupSessionsByPage(filteredSessions, pagePatterns)
  const sortedGroups = sortGroups(sessionsByPage)

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Recent Conversations</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleBookmarkedFilter}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              showBookmarkedOnly
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
          >
            <Bookmark
              className={`w-4 h-4 ${showBookmarkedOnly ? 'fill-current' : ''}`}
            />
            {showBookmarkedOnly ? 'Bookmarked' : 'Show Bookmarked'}
          </button>
          {selectedSessions.size > 0 && (
            <button
              onClick={onShowArchiveConfirm}
              className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Archive className="w-4 h-4" />
              Archive Selected ({selectedSessions.size})
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="px-6 py-8 text-center text-gray-500">
          Loading conversations...
        </div>
      ) : sessions.length === 0 ? (
        <div className="px-6 py-8 text-center text-gray-500">
          No conversations yet. The assistant will start tracking when users
          interact with it.
        </div>
      ) : sortedGroups.length === 0 && showBookmarkedOnly ? (
        <div className="px-6 py-8 text-center text-gray-500">
          No bookmarked conversations. Click the bookmark icon on a conversation
          to save it for later.
        </div>
      ) : (
        <div>
          {sortedGroups.map(([groupKey, groupSessions]) => {
            const page = widgetPages.find((p) => p.page_url === groupKey)
            const pageKey = groupKey || 'unknown'

            return (
              <PageGroup
                key={pageKey}
                pageKey={pageKey}
                sessions={groupSessions}
                page={page}
                isExpanded={expandedPageGroups.has(pageKey)}
                expandedSessions={expandedSessions}
                selectedSessions={selectedSessions}
                onTogglePageGroup={() => onTogglePageGroup(pageKey)}
                onToggleSession={onToggleSession}
                onToggleSessionSelection={onToggleSessionSelection}
                onToggleBookmark={onToggleBookmark}
                onToggleUnread={onToggleUnread}
                onShare={onShare}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
