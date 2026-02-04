'use client'

import { useState, useEffect, useCallback } from 'react'
import { MessageSquare, ArrowRight, X } from 'lucide-react'
import ConversationMessageView from '@/components/admin/ConversationMessageView'
import type { ConversationMessage } from '@/components/admin/types'
import {
  type BusinessType,
  type ExampleConversation,
  BUSINESS_TYPE_LABELS,
  GOAL_LABELS,
  getExamplesByBusinessType,
} from '@/config/examples'

const BUSINESS_TYPES: BusinessType[] = ['saas', 'ecommerce', 'smb']

interface ConversationData {
  started_at: string
  page_url: string | null
  messages: ConversationMessage[]
}

export function ExamplesClient() {
  const [activeTab, setActiveTab] = useState<BusinessType>('saas')
  const [selectedExample, setSelectedExample] = useState<ExampleConversation | null>(null)
  const [conversationData, setConversationData] = useState<ConversationData | null>(null)
  const [loading, setLoading] = useState(false)

  const examples = getExamplesByBusinessType(activeTab)

  const closeModal = useCallback(() => {
    setSelectedExample(null)
    setConversationData(null)
  }, [])

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeModal()
    }
    if (selectedExample) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [selectedExample, closeModal])

  // Fetch conversation when example is selected
  useEffect(() => {
    if (!selectedExample) return

    const token = selectedExample.token

    async function fetchConversation() {
      setLoading(true)
      try {
        const response = await fetch(`/api/share/${token}`)
        if (response.ok) {
          const data = await response.json()
          setConversationData(data)
        }
      } catch {
        // Silently fail - modal will show loading state
      } finally {
        setLoading(false)
      }
    }

    fetchConversation()
  }, [selectedExample])

  function handleCardClick(example: ExampleConversation) {
    setSelectedExample(example)
  }

  return (
    <>
      {/* Tabs */}
      <div className="examples-tabs">
        {BUSINESS_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            className={`examples-tab ${activeTab === type ? 'examples-tab--active' : ''}`}
          >
            {BUSINESS_TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="examples-grid">
        {examples.map((example) => (
          <button
            key={example.token}
            onClick={() => handleCardClick(example)}
            className="examples-card"
          >
            <div className="examples-card-header">
              <span className={`examples-badge examples-badge--${example.goal}`}>
                {GOAL_LABELS[example.goal]}
              </span>
              <h3 className="examples-card-title">{example.title}</h3>
              <p className="examples-card-description">{example.description}</p>
            </div>

            <div className="examples-card-preview">
              <MessageSquare className="examples-preview-icon" size={14} />
              <span className="examples-preview-question">
                "{example.previewQuestion}"
              </span>
            </div>

            <div className="examples-card-footer">
              <span className="examples-view-link">
                View conversation
                <ArrowRight size={14} />
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Modal */}
      {selectedExample && (
        <div className="examples-modal-overlay" onClick={closeModal}>
          <div
            className="examples-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="examples-modal-header">
              <div className="examples-modal-header-content">
                <span className={`examples-badge examples-badge--${selectedExample.goal}`}>
                  {GOAL_LABELS[selectedExample.goal]}
                </span>
                <h2 className="examples-modal-title">{selectedExample.title}</h2>
                {conversationData?.page_url && (
                  <p className="examples-modal-url">{conversationData.page_url}</p>
                )}
              </div>
              <button
                onClick={closeModal}
                className="examples-modal-close"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="examples-modal-body">
              {loading ? (
                <div className="examples-modal-loading">
                  <p>Loading conversation...</p>
                </div>
              ) : conversationData ? (
                <div className="examples-modal-messages">
                  {conversationData.messages.map((message) => (
                    <ConversationMessageView
                      key={message.id}
                      message={message}
                      variant="white"
                    />
                  ))}
                </div>
              ) : (
                <div className="examples-modal-loading">
                  <p>Failed to load conversation</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
