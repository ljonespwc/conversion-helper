'use client'

import { AlertCircle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
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
    if (isFlagged) return 'bg-red-50 border border-red-200'
    if (isUser) return 'bg-blue-50'
    return 'bg-purple-50'
  }

  return (
    <div className={`p-4 rounded-lg ${getBackgroundClass()}`}>
      <div className="flex items-start justify-between mb-2">
        <span
          className={`text-xs font-semibold uppercase ${
            isUser ? 'text-blue-700' : 'text-purple-700'
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
      <div className="text-gray-700 text-sm">
        {isUser ? (
          message.message
        ) : (
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <p className="mb-2 last:mb-0">{children}</p>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-orange-700">
                  {children}
                </strong>
              ),
              em: ({ children }) => (
                <em className="italic text-gray-600">{children}</em>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside mb-2 space-y-1">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside mb-2 space-y-1">
                  {children}
                </ol>
              ),
              li: ({ children }) => <li>{children}</li>,
              code: ({ children }) => (
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-orange-700 text-xs">
                  {children}
                </code>
              ),
            }}
          >
            {message.message}
          </ReactMarkdown>
        )}
      </div>
      {isFlagged && message.followup_reason && (
        <div className="mt-2 flex items-center gap-2 text-xs text-red-600">
          <AlertCircle className="w-3 h-3" />
          <span>{message.followup_reason}</span>
        </div>
      )}
    </div>
  )
}
