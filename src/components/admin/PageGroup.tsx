'use client'

import { ChevronDown, ChevronRight, Globe } from 'lucide-react'
import ConversationSessionItem from './ConversationSessionItem'
import type { ConversationSession, WidgetPage } from './types'

interface PageGroupProps {
  pageKey: string
  sessions: ConversationSession[]
  page: WidgetPage | undefined
  isExpanded: boolean
  expandedSessions: Set<string>
  selectedSessions: Set<string>
  onTogglePageGroup: () => void
  onToggleSession: (sessionId: string, session: ConversationSession) => void
  onToggleSessionSelection: (sessionId: string, e: React.MouseEvent) => void
  onToggleBookmark: (sessionId: string, currentValue: boolean, e: React.MouseEvent) => void
  onToggleUnread: (sessionId: string, currentlyUnread: boolean, e: React.MouseEvent) => void
}

export default function PageGroup({
  pageKey,
  sessions,
  page,
  isExpanded,
  expandedSessions,
  selectedSessions,
  onTogglePageGroup,
  onToggleSession,
  onToggleSessionSelection,
  onToggleBookmark,
  onToggleUnread,
}: PageGroupProps): React.ReactElement {
  const pageTitle = page?.page_title || (pageKey !== 'unknown' ? 'Unknown Page' : 'Demo/Test Sessions')
  const displayUrl = page?.page_url || (pageKey !== 'unknown' ? pageKey : null)
  const unreadCount = sessions.filter((s) => s.is_unread).length

  return (
    <div className="border-b border-gray-700 last:border-b-0">
      <div
        className="bg-gray-900/80 px-6 py-3 cursor-pointer hover:bg-gray-800/80 transition-colors"
        onClick={onTogglePageGroup}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
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

      {isExpanded && (
        <div className="divide-y divide-gray-700">
          {sessions.map((session) => (
            <ConversationSessionItem
              key={session.id}
              session={session}
              isExpanded={expandedSessions.has(session.id)}
              isSelected={selectedSessions.has(session.session_id)}
              onToggleExpand={() => onToggleSession(session.id, session)}
              onToggleSelect={(e) => onToggleSessionSelection(session.session_id, e)}
              onToggleBookmark={(e) => onToggleBookmark(session.session_id, session.is_bookmarked, e)}
              onToggleUnread={(e) => onToggleUnread(session.session_id, session.is_unread, e)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
