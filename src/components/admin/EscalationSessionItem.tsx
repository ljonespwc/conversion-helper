'use client'

import {
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Escalation } from './types'
import EscalationMessageView from './EscalationMessageView'

interface EscalationSessionItemProps {
  escalation: Escalation
  isExpanded: boolean
  isSelected: boolean
  copiedEmail: string | null
  copiedConversation: string | null
  updatingStatus: string | null
  onToggleExpand: () => void
  onToggleSelect: () => void
  onCopyEmail: (email: string) => void
  onCopyConversation: (escalation: Escalation) => void
  onToggleResolved: (sessionId: string, currentStatus: boolean) => void
  formatTimeAgo: (timestamp: string) => string
}

function StatusBadge({
  resolved,
}: {
  resolved: boolean
}): React.ReactElement {
  if (resolved) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-50 text-green-700 border border-green-200">
        <CheckCircle2 className="w-3 h-3" />
        Resolved
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-700 border border-red-200">
      <Clock className="w-3 h-3" />
      Unresolved
    </span>
  )
}

function FlaggedBadge({ count }: { count: number }): React.ReactElement | null {
  if (count === 0) return null

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-700 border border-red-200">
      <AlertCircle className="w-3 h-3" />
      {count} flagged
    </span>
  )
}

export default function EscalationSessionItem({
  escalation,
  isExpanded,
  isSelected,
  copiedEmail,
  copiedConversation,
  updatingStatus,
  onToggleExpand,
  onToggleSelect,
  onCopyEmail,
  onCopyConversation,
  onToggleResolved,
  formatTimeAgo,
}: EscalationSessionItemProps): React.ReactElement {
  const ChevronIcon = isExpanded ? ChevronDown : ChevronRight
  const isUpdating = updatingStatus === escalation.session_id

  function getPagePath(): string {
    if (!escalation.page_url) return 'No page'
    return new URL(escalation.page_url).pathname
  }

  function getToggleButtonClass(): string {
    if (isUpdating) {
      return 'bg-gray-200 text-gray-400 cursor-not-allowed'
    }
    if (escalation.resolved) {
      return 'bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200'
    }
    return 'bg-green-50 hover:bg-green-100 text-green-700 border border-green-200'
  }

  return (
    <div>
      <div
        className="px-6 py-4 hover:bg-gray-100 transition-colors cursor-pointer"
        onClick={onToggleExpand}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation()
                onToggleSelect()
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400 flex-shrink-0"
            />
            <ChevronIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onCopyEmail(escalation.user_email)
                  }}
                  className="flex items-center gap-2 text-orange-600 hover:text-orange-500 font-medium group"
                >
                  {escalation.user_email}
                  {copiedEmail === escalation.user_email ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>

                <span className="text-gray-400">•</span>
                <span className="text-gray-500 text-sm">
                  {formatTimeAgo(escalation.escalation_timestamp)}
                </span>

                {escalation.flagged_count > 0 && (
                  <>
                    <span className="text-gray-500">•</span>
                    <FlaggedBadge count={escalation.flagged_count} />
                  </>
                )}

                <span className="text-gray-500">•</span>
                <StatusBadge resolved={escalation.resolved} />
              </div>

              <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                <span>{getPagePath()}</span>
                <span>•</span>
                <span>{escalation.messages.length} messages</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-6 pb-6 bg-gray-50/80">
              <div className="flex gap-3 mb-4 pt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onCopyConversation(escalation)
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
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
                    onToggleResolved(escalation.session_id, escalation.resolved)
                  }}
                  disabled={isUpdating}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${getToggleButtonClass()}`}
                >
                  {isUpdating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
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

              <div className="space-y-3">
                {escalation.messages.map((msg) => (
                  <EscalationMessageView key={msg.id} message={msg} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
