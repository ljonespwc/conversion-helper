'use client'

import { AlertCircle } from 'lucide-react'
import type { EscalationMessage } from './types'

interface EscalationMessageViewProps {
  message: EscalationMessage
}

export default function EscalationMessageView({
  message,
}: EscalationMessageViewProps): React.ReactElement {
  const isUser = message.role === 'user'
  const isFlagged = message.needs_followup

  function getBackgroundClass(): string {
    if (isFlagged) return 'bg-red-900/20 border border-red-700/50'
    if (isUser) return 'bg-blue-900/20'
    return 'bg-purple-900/20'
  }

  return (
    <div className={`p-4 rounded-lg ${getBackgroundClass()}`}>
      <div className="flex items-start justify-between mb-2">
        <span
          className={`text-xs font-semibold uppercase ${
            isUser ? 'text-blue-400' : 'text-purple-400'
          }`}
        >
          {message.role}
        </span>
        {message.timestamp && (
          <span className="text-xs text-gray-500">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        )}
      </div>
      <p className="text-white text-sm">{message.message}</p>
      {isFlagged && message.followup_reason && (
        <div className="mt-2 flex items-center gap-2 text-xs text-red-400">
          <AlertCircle className="w-3 h-3" />
          <span>{message.followup_reason}</span>
        </div>
      )}
    </div>
  )
}
