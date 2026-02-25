'use client'

import { forwardRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// ============================================================================
// Types
// ============================================================================

export interface ChatMockupMessage {
  role: 'visitor' | 'easyask'
  content: string
}

export interface ChatMockupPreviewProps {
  // Series
  volumeNumber: number
  seriesTagline: string
  // Content
  businessName: string
  pageContext: string
  dayTime: string
  archetypeTag: string
  setupLine: string
  messages: ChatMockupMessage[]
  innerMonologue: string
  tagline: string
  // Visual (simplified)
  platform: 'x' | 'linkedin'
  sizeMode: 'compact' | 'extended'
  backgroundColor: string
  backgroundMode: 'solid' | 'gradient'
  backgroundGradient: string
  accentColor: string
  accentMode: 'solid' | 'gradient'
  accentGradient: string
}

// ============================================================================
// Constants & Helpers (exported for testing)
// ============================================================================

export const GRADIENT_PRESETS: Record<string, string[]> = {
  sunrise: ['#FF6B6B', '#FFA07A'],
  ocean: ['#667eea', '#764ba2'],
  mint: ['#a8edea', '#fed6e3'],
  midnight: ['#0f0c29', '#302b63', '#24243e'],
  peach: ['#ffecd2', '#fcb69f'],
  arctic: ['#e6e9f0', '#eef1f5'],
  sunset: ['#fa709a', '#fee140'],
  forest: ['#134e5e', '#71b280'],
  lavender: ['#c471f5', '#fa71cd'],
  slate: ['#2c3e50', '#4ca1af'],
  ember: ['#f12711', '#f5af19'],
  monochrome: ['#434343', '#000000'],
}

export function getGradientCSS(preset: string, direction: string = 'to bottom'): string {
  const colors = GRADIENT_PRESETS[preset]
  if (!colors) return ''
  return `linear-gradient(${direction}, ${colors.join(', ')})`
}

export function getPlatformDimensions(platform: 'x' | 'linkedin', sizeMode: 'compact' | 'extended' = 'compact'): { width: number; height: number } {
  if (platform === 'x') {
    return sizeMode === 'compact'
      ? { width: 1200, height: 675 }
      : { width: 1200, height: 900 }
  }
  return sizeMode === 'compact'
    ? { width: 1200, height: 1200 }
    : { width: 1200, height: 1500 }
}

export function validateMessages(msgs: unknown[]): boolean {
  if (!Array.isArray(msgs) || msgs.length === 0) return false
  return msgs.every((m: unknown) => {
    if (typeof m !== 'object' || m === null) return false
    const msg = m as Record<string, unknown>
    return (
      (msg.role === 'visitor' || msg.role === 'easyask') &&
      typeof msg.content === 'string' &&
      msg.content.length > 0
    )
  })
}

export function getNextVolumeNumber(examples: { volume_number: number }[]): number {
  if (examples.length === 0) return 1
  return Math.max(...examples.map(e => e.volume_number)) + 1
}

// ============================================================================
// Markdown Components (dark background optimized)
// ============================================================================

const socialMarkdownComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => <h1 className="text-xl font-bold text-white/90 mt-3 mb-2 first:mt-0">{children}</h1>,
  h2: ({ children }: { children?: React.ReactNode }) => <h2 className="text-lg font-bold text-white/90 mt-3 mb-2 first:mt-0">{children}</h2>,
  h3: ({ children }: { children?: React.ReactNode }) => <h3 className="text-base font-bold text-white/80 mt-2 mb-1 first:mt-0">{children}</h3>,
  h4: ({ children }: { children?: React.ReactNode }) => <h4 className="text-base font-semibold text-white/80 mt-2 mb-1 first:mt-0">{children}</h4>,
  p: ({ children }: { children?: React.ReactNode }) => <p className="mb-2 last:mb-0">{children}</p>,
  strong: ({ children }: { children?: React.ReactNode }) => <strong className="font-semibold text-amber-400">{children}</strong>,
  em: ({ children }: { children?: React.ReactNode }) => <em className="italic text-white/60">{children}</em>,
  ul: ({ children }: { children?: React.ReactNode }) => <ul className="list-disc list-outside pl-6 mb-2 space-y-1.5">{children}</ul>,
  ol: ({ children }: { children?: React.ReactNode }) => <ol className="list-decimal list-outside pl-6 mb-2 space-y-1.5">{children}</ol>,
  li: ({ children }: { children?: React.ReactNode }) => <li className="text-white/70 pl-1">{children}</li>,
  code: ({ children }: { children?: React.ReactNode }) => <code className="bg-white/10 px-1.5 py-0.5 rounded text-amber-400 text-sm">{children}</code>,
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-amber-400 underline hover:text-amber-300">{children}</a>,
}

// ============================================================================
// Preview Component
// ============================================================================

const ChatMockupPreview = forwardRef<HTMLDivElement, ChatMockupPreviewProps>(function ChatMockupPreview(props, ref) {
  const {
    volumeNumber,
    seriesTagline,
    businessName,
    pageContext,
    dayTime,
    archetypeTag,
    setupLine,
    messages,
    innerMonologue,
    tagline,
    platform,
    sizeMode,
    backgroundMode,
    backgroundColor,
    backgroundGradient,
    accentColor,
    accentMode,
    accentGradient,
  } = props

  const { width, height } = getPlatformDimensions(platform, sizeMode)
  const isLinkedIn = platform === 'linkedin'

  // Card background
  const cardBackgroundStyle: React.CSSProperties = {}
  if (backgroundMode === 'solid') {
    cardBackgroundStyle.backgroundColor = backgroundColor
  } else {
    cardBackgroundStyle.background = getGradientCSS(backgroundGradient, 'to bottom')
  }

  // Accent line style
  const accentLineStyle: React.CSSProperties = {}
  if (accentMode === 'solid') {
    accentLineStyle.backgroundColor = accentColor
  } else {
    accentLineStyle.background = getGradientCSS(accentGradient, 'to right')
  }

  return (
    <div
      ref={ref}
      data-testid="preview-canvas"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: '16px',
        overflow: 'hidden',
        position: 'relative',
        ...cardBackgroundStyle,
      }}
      className="flex flex-col"
    >
      {/* Accent line at top */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={accentLineStyle}
      />

      {/* Content */}
      <div
        className="flex flex-col h-full"
        style={{ padding: isLinkedIn ? '40px 56px 56px' : '32px 48px 48px' }}
      >
        {/* ================================================================
            Header
            ================================================================ */}
        <div className="flex items-baseline gap-3 mb-4">
          <h1
            className="text-[2rem] font-black text-white tracking-tight"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Typing...
          </h1>
          <span className="text-white/30 text-lg font-light">|</span>
          <span className="text-white/40 text-lg font-medium tracking-wide">Vol. {volumeNumber}</span>
        </div>
        {seriesTagline && (
          <p className="text-white/30 text-sm -mt-3 mb-4">{seriesTagline}</p>
        )}

        {/* Context: Business pill */}
        {businessName && (
          <div className="flex items-center justify-center mb-5">
            <span
              className="text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider"
              style={{ backgroundColor: 'rgba(245,158,11,0.2)', color: '#fbbf24' }}
            >
              {businessName}
            </span>
          </div>
        )}

        {/* ================================================================
            Chat Bubbles
            ================================================================ */}
        <div className="flex-1 flex flex-col gap-4 min-h-0" data-testid="widget-background">
          {messages.map((msg, idx) => {
            if (msg.role === 'visitor') {
              return (
                <div key={idx} className="flex items-start gap-3 justify-start" data-testid="visitor-bubble">
                  {/* Visitor avatar */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                    style={{ backgroundColor: 'rgba(245,158,11,0.2)' }}
                  >
                    <span className="text-sm" style={{ color: '#fbbf24' }}>&#x1F464;</span>
                  </div>
                  {/* Visitor bubble */}
                  <div
                    data-testid="message-bubble"
                    className="relative max-w-[65%] px-5 py-3.5 rounded-2xl rounded-bl-sm"
                    style={{ backgroundColor: '#f59e0b', color: '#000' }}
                  >
                    <p className="text-sm leading-relaxed font-semibold">{msg.content}</p>
                  </div>
                </div>
              )
            } else {
              return (
                <div key={idx} className="flex items-start gap-3 justify-end" data-testid="easyask-bubble">
                  {/* AI bubble */}
                  <div
                    data-testid="message-bubble"
                    className="relative max-w-[65%] px-5 py-3.5 rounded-2xl rounded-br-sm"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)' }}
                  >
                    <div className="text-sm leading-relaxed font-normal">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={socialMarkdownComponents}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                  {/* AI avatar */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                  >
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>&#x1F916;</span>
                  </div>
                </div>
              )
            }
          })}
        </div>

        {/* ================================================================
            Punchline Footer
            ================================================================ */}
        {innerMonologue && (
          <div
            className="mt-auto pt-4"
          >
            <div
              className="rounded-xl px-6 py-5 text-center"
              style={{ backgroundColor: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.1)' }}
            >
              <span
                className="text-xs font-bold uppercase block mb-2"
                style={{ color: 'rgba(251,191,36,0.6)', letterSpacing: '0.2em' }}
              >
                &#x1F4AD; What the AI didn&#x27;t say
              </span>
              <p
                className="text-white/80 text-lg leading-relaxed"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                &ldquo;{innerMonologue}&rdquo;
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Tagline — pinned to bottom of card */}
      {tagline && (
        <p
          className="absolute bottom-4 left-0 right-0 text-center text-white/25 text-xs font-bold uppercase"
          style={{ letterSpacing: '0.25em' }}
        >
          {tagline}
        </p>
      )}
    </div>
  )
})

export default ChatMockupPreview
