'use client'

import ReactMarkdown from 'react-markdown'
import type { ConversationMessage } from './types'

interface ConversationMessageViewProps {
  message: ConversationMessage
  variant?: 'default' | 'white'
}

export default function ConversationMessageView({
  message,
  variant = 'default',
}: ConversationMessageViewProps): React.ReactElement {
  const isUser = message.role === 'user'
  const timestamp = message.timestamp
    ? new Date(message.timestamp)
    : new Date(message.created_at)

  const formattedTime = timestamp.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })

  return (
    <div className={`${variant === 'white' ? 'bg-white' : 'bg-gray-50'} rounded-lg px-4 py-3 border border-gray-200`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded ${
                isUser
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-purple-50 text-purple-700'
              }`}
            >
              {isUser ? 'User' : 'Assistant'}
            </span>
          </div>
          <div className="text-sm text-gray-700">
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
          <p className="text-xs text-gray-500 mt-1">
            {formattedTime}
            {message.category && ` \u2022 ${message.category}`}
            {!isUser && message.grounded !== null && message.grounded !== undefined && (
              <span
                className={`ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                  message.grounded
                    ? 'bg-green-50 text-green-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {message.grounded ? '\u2713 Grounded' : '\u26A0 Fallback'}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
