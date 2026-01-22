'use client'

import ReactMarkdown from 'react-markdown'
import type { ConversationMessage } from './types'

interface ConversationMessageViewProps {
  message: ConversationMessage
}

export default function ConversationMessageView({
  message,
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
    <div className="bg-gray-800/50 rounded-lg px-4 py-3 border border-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded ${
                isUser
                  ? 'bg-blue-900/30 text-blue-400'
                  : 'bg-purple-900/30 text-purple-400'
              }`}
            >
              {isUser ? 'User' : 'Assistant'}
            </span>
          </div>
          <div className="text-sm text-gray-200">
            {isUser ? (
              message.message
            ) : (
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p className="mb-2 last:mb-0">{children}</p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-purple-300">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-gray-300">{children}</em>
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
                    <code className="bg-gray-700 px-1.5 py-0.5 rounded text-purple-300 text-xs">
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
          </p>
        </div>
      </div>
    </div>
  )
}
