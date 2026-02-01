'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import ConversationMessageView from '@/components/admin/ConversationMessageView'
import { calculateDuration } from '@/lib/conversation-utils'
import type { ConversationMessage } from '@/components/admin/types'

interface SharedConversation {
  started_at: string
  ended_at: string | null
  page_url: string | null
  total_questions: number
  matched_responses: number
  user_rating: number | null
  messages: ConversationMessage[]
}

export default function SharedConversationPage(): React.ReactElement | null {
  const params = useParams()
  const token = params.token as string
  const [conversation, setConversation] = useState<SharedConversation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchConversation() {
      try {
        const response = await fetch(`/api/share/${token}`)
        if (!response.ok) {
          setError('Conversation not found')
          return
        }
        const data = await response.json()
        setConversation(data)
      } catch {
        setError('Failed to load conversation')
      } finally {
        setLoading(false)
      }
    }

    fetchConversation()
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading conversation...</p>
      </div>
    )
  }

  if (error || !conversation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Not Found</h1>
          <p className="text-gray-500">This conversation link is invalid or has been removed.</p>
        </div>
      </div>
    )
  }

  const date = new Date(conversation.started_at)
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  const userCount = conversation.messages.filter((m) => m.role === 'user').length
  const assistantCount = conversation.messages.filter((m) => m.role === 'assistant').length
  const duration = calculateDuration(conversation.messages, conversation.started_at, conversation.ended_at)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <img
              src="/images/main-logo.png"
              alt="EasyAsk"
              className="h-8 w-8"
            />
            <span className="text-lg font-bold text-gray-900">EasyAsk</span>
          </Link>

          <h1 className="text-xl font-bold text-gray-900">
            Shared Conversation
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {formattedDate} at {formattedTime}
          </p>
          {conversation.page_url && (
            <p className="text-xs text-gray-400 mt-1 truncate">
              {conversation.page_url}
            </p>
          )}
        </div>

        {/* Messages */}
        <div className="space-y-3 mb-8">
          {conversation.messages.map((message) => (
            <ConversationMessageView key={message.id} message={message} variant="white" />
          ))}
        </div>

        {/* Footer stats */}
        <div className="border-t border-gray-200 pt-4 text-xs text-gray-400">
          {userCount} user message{userCount !== 1 ? 's' : ''}
          {' \u2022 '}
          {assistantCount} assistant message{assistantCount !== 1 ? 's' : ''}
          {duration > 0 && ` \u2022 ${duration}s duration`}
        </div>
      </div>
    </div>
  )
}
