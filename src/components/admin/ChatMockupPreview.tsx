'use client'

import { forwardRef, useEffect } from 'react'
import { X } from 'lucide-react'
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
  // Visual
  platform: 'x' | 'linkedin'
  backgroundMode: 'solid' | 'gradient' | 'image-outline'
  backgroundColor: string
  gradientPreset: string
  gradientDirection: 'to bottom' | '135deg'
  fontFamily: string
  borderColor: string
  borderThickness: number
  borderRadius: number
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

export interface VisualPreset {
  backgroundMode: 'solid' | 'gradient' | 'image-outline'
  backgroundColor: string
  gradientPreset: string
  gradientDirection: 'to bottom' | '135deg'
  fontFamily: string
  borderColor: string
  borderThickness: number
  borderRadius: number
}

export const VISUAL_PRESETS: Record<string, VisualPreset> = {
  clean: {
    backgroundMode: 'solid',
    backgroundColor: '#ffffff',
    gradientPreset: 'arctic',
    gradientDirection: 'to bottom',
    fontFamily: 'Inter',
    borderColor: '#E5E7EB',
    borderThickness: 1,
    borderRadius: 16,
  },
  dark: {
    backgroundMode: 'gradient',
    backgroundColor: '#1a1a2e',
    gradientPreset: 'midnight',
    gradientDirection: 'to bottom',
    fontFamily: 'DM Sans',
    borderColor: '#374151',
    borderThickness: 0,
    borderRadius: 16,
  },
  warm: {
    backgroundMode: 'gradient',
    backgroundColor: '#ffecd2',
    gradientPreset: 'peach',
    gradientDirection: 'to bottom',
    fontFamily: 'Nunito',
    borderColor: '#f5c6aa',
    borderThickness: 2,
    borderRadius: 20,
  },
  corporate: {
    backgroundMode: 'gradient',
    backgroundColor: '#e6e9f0',
    gradientPreset: 'arctic',
    gradientDirection: 'to bottom',
    fontFamily: 'IBM Plex Sans',
    borderColor: '#cbd5e1',
    borderThickness: 1,
    borderRadius: 12,
  },
  bold: {
    backgroundMode: 'gradient',
    backgroundColor: '#fa709a',
    gradientPreset: 'sunset',
    gradientDirection: 'to bottom',
    fontFamily: 'Space Grotesk',
    borderColor: '#f59e0b',
    borderThickness: 0,
    borderRadius: 16,
  },
}

export function getVisualPreset(name: string): VisualPreset | undefined {
  return VISUAL_PRESETS[name]
}

export const FONT_OPTIONS = [
  'Inter',
  'DM Sans',
  'Space Grotesk',
  'Lora',
  'JetBrains Mono',
  'Nunito',
  'Playfair Display',
  'IBM Plex Sans',
] as const

export function buildGoogleFontUrl(font: string): string | null {
  if (font === 'Inter') return null // System default
  const encoded = font.replace(/ /g, '+')
  return `https://fonts.googleapis.com/css2?family=${encoded}:wght@400;600;700&display=swap`
}

export function getPlatformDimensions(platform: 'x' | 'linkedin'): { width: number; height: number } {
  return platform === 'x'
    ? { width: 1200, height: 675 }
    : { width: 1200, height: 1200 }
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
// Markdown Components (copied from ChatInterface.tsx:65-78)
// ============================================================================

const markdownComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => <h1 className="text-lg font-bold text-gray-900 mt-3 mb-2 first:mt-0">{children}</h1>,
  h2: ({ children }: { children?: React.ReactNode }) => <h2 className="text-base font-bold text-gray-900 mt-3 mb-2 first:mt-0">{children}</h2>,
  h3: ({ children }: { children?: React.ReactNode }) => <h3 className="text-sm font-bold text-gray-800 mt-2 mb-1 first:mt-0">{children}</h3>,
  h4: ({ children }: { children?: React.ReactNode }) => <h4 className="text-sm font-semibold text-gray-800 mt-2 mb-1 first:mt-0">{children}</h4>,
  p: ({ children }: { children?: React.ReactNode }) => <p className="mb-2 last:mb-0">{children}</p>,
  strong: ({ children }: { children?: React.ReactNode }) => <strong className="font-semibold text-orange-600">{children}</strong>,
  em: ({ children }: { children?: React.ReactNode }) => <em className="italic text-gray-600">{children}</em>,
  ul: ({ children }: { children?: React.ReactNode }) => <ul className="list-disc list-outside pl-5 mb-2 space-y-1">{children}</ul>,
  ol: ({ children }: { children?: React.ReactNode }) => <ol className="list-decimal list-outside pl-5 mb-2 space-y-1">{children}</ol>,
  li: ({ children }: { children?: React.ReactNode }) => <li className="text-gray-700 pl-1">{children}</li>,
  code: ({ children }: { children?: React.ReactNode }) => <code className="bg-gray-100 px-1.5 py-0.5 rounded text-orange-600 text-xs">{children}</code>,
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-orange-600 underline hover:text-orange-700">{children}</a>,
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
    backgroundMode,
    backgroundColor,
    gradientPreset,
    gradientDirection,
    fontFamily,
    borderColor,
    borderThickness,
    borderRadius,
  } = props

  const { width, height } = getPlatformDimensions(platform)
  const isLinkedIn = platform === 'linkedin'

  // Load Google Font dynamically
  useEffect(() => {
    const url = buildGoogleFontUrl(fontFamily)
    if (!url) return

    const linkId = 'mockup-google-font'
    let link = document.getElementById(linkId) as HTMLLinkElement | null
    if (link) {
      link.href = url
    } else {
      link = document.createElement('link')
      link.id = linkId
      link.rel = 'stylesheet'
      link.href = url
      document.head.appendChild(link)
    }
  }, [fontFamily])

  // Determine background style for widget area
  const widgetBackgroundStyle: React.CSSProperties = {}
  if (backgroundMode === 'solid') {
    widgetBackgroundStyle.backgroundColor = backgroundColor
  } else if (backgroundMode === 'gradient') {
    widgetBackgroundStyle.background = getGradientCSS(gradientPreset, gradientDirection)
  }

  // Determine text colors based on background brightness
  const isDarkBg = backgroundMode === 'gradient' && ['midnight', 'monochrome', 'forest', 'slate', 'ocean'].includes(gradientPreset)
  const contextTextColor = isDarkBg ? 'text-gray-200' : 'text-gray-700'
  const contextHeadingColor = isDarkBg ? 'text-white' : 'text-gray-900'
  const footerTextColor = isDarkBg ? 'text-gray-300' : 'text-gray-600'
  const footerHeadingColor = isDarkBg ? 'text-white' : 'text-gray-900'
  const seriesTextColor = isDarkBg ? 'text-gray-300' : 'text-gray-500'
  const seriesHeadingColor = isDarkBg ? 'text-white' : 'text-gray-900'

  return (
    <div
      ref={ref}
      data-testid="preview-canvas"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderWidth: `${borderThickness}px`,
        borderColor: borderColor,
        borderStyle: borderThickness > 0 ? 'solid' : 'none',
        borderRadius: `${borderRadius}px`,
        overflow: 'hidden',
        position: 'relative',
        ...widgetBackgroundStyle,
      }}
      className="flex flex-col"
    >
      {/* Image Outline backdrop for image-outline mode */}
      {backgroundMode === 'image-outline' && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
          }}
        />
      )}

      <div className="relative flex flex-col h-full" style={{ padding: isLinkedIn ? '32px 40px' : '20px 32px' }}>
        {/* ================================================================
            Layer 0: Series Header
            ================================================================ */}
        <div className={`text-center ${isLinkedIn ? 'mb-5' : 'mb-3'}`}>
          <h1 className={`${seriesHeadingColor} ${isLinkedIn ? 'text-2xl' : 'text-xl'} font-bold tracking-tight`}>
            Typing... <span className="font-normal text-orange-500">|</span> Vol. {volumeNumber}
          </h1>
          {seriesTagline && (
            <p className={`${seriesTextColor} ${isLinkedIn ? 'text-base' : 'text-sm'} mt-1 italic`}>
              {seriesTagline}
            </p>
          )}
        </div>

        {/* ================================================================
            Layer 1: Context Card
            ================================================================ */}
        <div className={`${isLinkedIn ? 'mb-4 px-5 py-3' : 'mb-3 px-4 py-2.5'} rounded-xl ${isDarkBg ? 'bg-white/10 backdrop-blur-sm' : 'bg-gray-50/80'}`}>
          <div className="flex items-center justify-between flex-wrap gap-x-4 gap-y-1">
            <div>
              <span className={`${contextHeadingColor} font-semibold ${isLinkedIn ? 'text-base' : 'text-sm'}`}>{businessName || 'Business Name'}</span>
              {pageContext && (
                <span className={`${contextTextColor} ${isLinkedIn ? 'text-sm' : 'text-xs'}`}> &middot; {pageContext}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {dayTime && (
                <span className={`${contextTextColor} ${isLinkedIn ? 'text-sm' : 'text-xs'}`}>{dayTime}</span>
              )}
              {archetypeTag && (
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${isDarkBg ? 'bg-orange-500/20 text-orange-300' : 'bg-orange-100 text-orange-700'}`}>
                  {archetypeTag}
                </span>
              )}
            </div>
          </div>
          {setupLine && (
            <p className={`${contextTextColor} ${isLinkedIn ? 'text-sm' : 'text-xs'} italic mt-1.5`}>
              {setupLine}
            </p>
          )}
        </div>

        {/* ================================================================
            Layer 2: Widget Mockup
            ================================================================ */}
        <div className="flex-1 min-h-0 flex flex-col" data-testid="widget-background">
          {/* Image Outline backdrop effect */}
          {backgroundMode === 'image-outline' && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                transform: 'scale(1.05)',
                filter: 'blur(20px)',
                opacity: 0.4,
                zIndex: 0,
              }}
            />
          )}

          <div className={`relative flex flex-col flex-1 min-h-0 rounded-2xl overflow-hidden border ${isDarkBg ? 'border-white/20' : 'border-orange-400/50'}`} style={{ zIndex: 1 }}>
            {/* Widget Header — gradient bar */}
            <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0 bg-gradient-to-r from-rose-400 via-orange-400 to-amber-400">
              <div className="w-6" /> {/* Spacer */}
              <h2 className="text-base font-semibold text-white truncate">
                {businessName || 'Business Name'}
              </h2>
              <button className="p-1 rounded-full border border-white/30" aria-hidden="true" tabIndex={-1}>
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            </div>

            {/* Messages area */}
            <div
              className="flex-1 overflow-hidden bg-white p-3 space-y-2.5"
              style={{ fontFamily: fontFamily !== 'Inter' ? `'${fontFamily}', sans-serif` : undefined }}
            >
              {messages.map((msg, idx) => (
                <div key={idx} className="w-full" data-testid={msg.role === 'visitor' ? 'visitor-bubble' : 'easyask-bubble'}>
                  <div
                    data-testid="message-bubble"
                    className={`w-full rounded-2xl px-4 py-3 ${
                      msg.role === 'visitor'
                        ? 'bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 text-white'
                        : 'bg-orange-50 border border-gray-200 text-gray-800'
                    }`}
                  >
                    {msg.role === 'visitor' ? (
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    ) : (
                      <div className="text-sm leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Branding footer */}
            <div className="flex-shrink-0 bg-gradient-to-r from-rose-400 via-orange-400 to-amber-400 py-1.5 px-3">
              <p className="text-xs text-white/70 text-center">
                Powered by EasyAsk
              </p>
            </div>
          </div>
        </div>

        {/* ================================================================
            Layer 3: Footer Overlay
            ================================================================ */}
        <div className={`${isLinkedIn ? 'mt-4' : 'mt-3'} text-center`}>
          {innerMonologue && (
            <p className={`${footerTextColor} ${isLinkedIn ? 'text-base' : 'text-sm'} italic`}>
              &ldquo;<span style={{ fontSize: '1.2em' }}>{innerMonologue}</span>&rdquo;
            </p>
          )}
          {tagline && (
            <p className={`${footerHeadingColor} ${isLinkedIn ? 'text-base' : 'text-sm'} font-bold mt-1`}>
              {tagline}
            </p>
          )}
        </div>
      </div>
    </div>
  )
})

export default ChatMockupPreview
