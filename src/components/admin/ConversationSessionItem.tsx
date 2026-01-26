'use client'

import { ChevronDown, ChevronRight, Bookmark, Circle, ThumbsUp, ThumbsDown } from 'lucide-react'
import ConversationMessageView from './ConversationMessageView'
import type { ConversationSession } from './types'

interface ConversationSessionItemProps {
  session: ConversationSession
  isExpanded: boolean
  isSelected: boolean
  onToggleExpand: () => void
  onToggleSelect: (e: React.MouseEvent) => void
  onToggleBookmark: (e: React.MouseEvent) => void
  onToggleUnread: (e: React.MouseEvent) => void
}

function calculateDuration(session: ConversationSession): number {
  if (session.messages && session.messages.length >= 2) {
    const timestamps = session.messages
      .map((m) => m.timestamp)
      .filter((t): t is number => t !== null)
      .sort((a, b) => a - b)

    if (timestamps.length >= 2) {
      return Math.round((timestamps[timestamps.length - 1] - timestamps[0]) / 1000)
    }
  }

  if (session.ended_at) {
    return Math.round(
      (new Date(session.ended_at).getTime() -
        new Date(session.started_at).getTime()) /
        1000
    )
  }

  return 0
}

function formatSessionTime(startedAt: string): string {
  const date = new Date(startedAt)
  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
  return `${time} - ${dateStr}`
}

function RatingDisplay({ rating }: { rating: number | null }): React.ReactElement | null {
  if (!rating) return null

  if (rating === 5) {
    return (
      <span className="inline-flex items-center gap-1 text-green-600" title="Helpful">
        <ThumbsUp className="w-3 h-3" />
      </span>
    )
  }

  if (rating === 1) {
    return (
      <span className="inline-flex items-center gap-1 text-red-600" title="Not helpful">
        <ThumbsDown className="w-3 h-3" />
      </span>
    )
  }

  return (
    <span
      className="inline-flex items-center gap-1 text-orange-500"
      title={`Legacy rating: ${rating}/5`}
    >
      {rating}&#9733;
    </span>
  )
}

export default function ConversationSessionItem({
  session,
  isExpanded,
  isSelected,
  onToggleExpand,
  onToggleSelect,
  onToggleBookmark,
  onToggleUnread,
}: ConversationSessionItemProps): React.ReactElement {
  const duration = calculateDuration(session)
  const assistantMessages = session.messages?.filter((m) => m.role === 'assistant') || []
  const userMessages = session.messages?.filter((m) => m.role === 'user') || []
  const assistantCount = assistantMessages.length
  const userCount = userMessages.length

  return (
    <div>
      <div
        className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleBookmark}
            className={`p-1 rounded transition-colors ${
              session.is_bookmarked
                ? 'text-amber-500 hover:text-amber-400'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title={session.is_bookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            <Bookmark
              className={`w-4 h-4 ${session.is_bookmarked ? 'fill-current' : ''}`}
            />
          </button>

          <button
            onClick={onToggleUnread}
            className={`p-0.5 rounded transition-colors ${
              session.is_unread
                ? 'text-orange-500'
                : 'text-gray-300 hover:text-gray-500'
            }`}
            title={session.is_unread ? 'Mark as read' : 'Mark as unread'}
          >
            <Circle
              className={`w-2.5 h-2.5 ${session.is_unread ? 'fill-current' : ''}`}
            />
          </button>

          <input
            type="checkbox"
            checked={isSelected}
            onClick={onToggleSelect}
            onChange={() => {}}
            className="w-4 h-4 rounded border-gray-300 bg-white text-orange-500 focus:ring-orange-400 focus:ring-offset-white cursor-pointer"
          />

          <button className="text-gray-400 hover:text-gray-600">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>

          <div>
            <div
              className={`text-sm font-medium ${
                session.is_unread ? 'text-gray-900' : 'text-gray-600'
              }`}
            >
              {formatSessionTime(session.started_at)}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {assistantCount} Assistant message{assistantCount !== 1 ? 's' : ''}
              {' \u2022 '}
              {userCount} User message{userCount !== 1 ? 's' : ''}
              {duration > 0 && ` \u2022 ${duration}s duration`}
              {session.user_rating && (
                <>
                  {' \u2022 '}
                  <RatingDisplay rating={session.user_rating} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {isExpanded && session.messages && session.messages.length > 0 && (
        <div className="bg-gray-50/80 px-6 py-3 border-t border-gray-200">
          <div className="space-y-3">
            {session.messages.map((message) => (
              <ConversationMessageView key={message.id} message={message} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
