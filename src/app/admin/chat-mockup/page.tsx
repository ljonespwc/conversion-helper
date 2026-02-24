'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { ChevronDown, ChevronRight, Copy, Check, Plus, Trash2, Filter } from 'lucide-react'
import ChatMockupPreview, {
  type ChatMockupMessage,
  type ChatMockupPreviewProps,
  GRADIENT_PRESETS,
  VISUAL_PRESETS,
  FONT_OPTIONS,
  getVisualPreset,
  getPlatformDimensions,
  getNextVolumeNumber,
} from '@/components/admin/ChatMockupPreview'

export const dynamic = 'force-dynamic'

// ============================================================================
// Types
// ============================================================================

interface CotdExample {
  id: string
  volume_number: number
  business_name: string
  page_context: string
  day_time: string
  setup: string
  messages: ChatMockupMessage[]
  inner_monologue: string | null
  tagline: string
  sort_order: number
  vertical: { id: string; slug: string; label: string; sector: string } | null
  archetype: { id: string; slug: string; label: string; parent_id: string | null } | null
  series_tagline: { id: string; text: string; category: string } | null
}

interface CotdTagline {
  id: string
  text: string
  category: string
}

interface CotdVertical {
  id: string
  slug: string
  label: string
  sector: string
}

interface CotdArchetype {
  id: string
  slug: string
  label: string
  parent_id: string | null
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function ChatMockupPage() {
  // Auth & org check
  const [authorized, setAuthorized] = useState<boolean | null>(null)

  // Data from API
  const [examples, setExamples] = useState<CotdExample[]>([])
  const [taglines, setTaglines] = useState<CotdTagline[]>([])
  const [verticals, setVerticals] = useState<CotdVertical[]>([])
  const [archetypes, setArchetypes] = useState<CotdArchetype[]>([])
  const [loading, setLoading] = useState(true)

  // Form state — series
  const [volumeNumber, setVolumeNumber] = useState(1)
  const [seriesTagline, setSeriesTagline] = useState('')
  const [seriesTaglineId, setSeriesTaglineId] = useState('')

  // Form state — content
  const [businessName, setBusinessName] = useState('')
  const [pageContext, setPageContext] = useState('')
  const [dayTime, setDayTime] = useState('')
  const [archetypeTag, setArchetypeTag] = useState('')
  const [setupLine, setSetupLine] = useState('')
  const [messages, setMessages] = useState<ChatMockupMessage[]>([
    { role: 'visitor', content: '' },
    { role: 'easyask', content: '' },
  ])
  const [innerMonologue, setInnerMonologue] = useState('')
  const [tagline, setTagline] = useState('')

  // Form state — visual
  const [platform, setPlatform] = useState<'x' | 'linkedin'>('x')
  const [backgroundMode, setBackgroundMode] = useState<'solid' | 'gradient' | 'image-outline'>('solid')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [gradientPreset, setGradientPreset] = useState('arctic')
  const [gradientDirection, setGradientDirection] = useState<'to bottom' | '135deg'>('to bottom')
  const [fontFamily, setFontFamily] = useState('Inter')
  const [borderColor, setBorderColor] = useState('#E5E7EB')
  const [borderThickness, setBorderThickness] = useState(0)
  const [borderRadius, setBorderRadius] = useState(16)

  // UI state
  const [stylingOpen, setStylingOpen] = useState(false)
  const [copyState, setCopyState] = useState<'idle' | 'copying' | 'copied'>('idle')
  const [exampleDropdownOpen, setExampleDropdownOpen] = useState(false)
  const [filterVertical, setFilterVertical] = useState('')
  const [filterArchetype, setFilterArchetype] = useState('')
  const [filterSector, setFilterSector] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const previewRef = useRef<HTMLDivElement>(null)
  const scaleWrapperRef = useRef<HTMLDivElement>(null)

  // ============================================================================
  // Auth Check
  // ============================================================================

  useEffect(() => {
    async function checkAccess() {
      try {
        const res = await fetch('/api/admin/user-info')
        const data = await res.json()
        if (data.organization?.name === 'EasyAsk') {
          setAuthorized(true)
        } else {
          setAuthorized(false)
        }
      } catch {
        setAuthorized(false)
      }
    }
    checkAccess()
  }, [])

  // ============================================================================
  // Data Fetch
  // ============================================================================

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/chat-mockup')
      if (!res.ok) return
      const data = await res.json()
      setExamples(data.examples || [])
      setTaglines(data.taglines || [])
      setVerticals(data.verticals || [])
      setArchetypes(data.archetypes || [])
      if (data.examples?.length) {
        setVolumeNumber(getNextVolumeNumber(data.examples))
      }
      // Default tagline
      if (data.taglines?.length && !seriesTaglineId) {
        setSeriesTaglineId(data.taglines[0].id)
        setSeriesTagline(data.taglines[0].text)
      }
    } catch (error) {
      console.error('Failed to fetch chat mockup data:', error)
    } finally {
      setLoading(false)
    }
  }, [seriesTaglineId])

  useEffect(() => {
    if (authorized) fetchData()
  }, [authorized, fetchData])

  // ============================================================================
  // Load Example
  // ============================================================================

  function loadExample(example: CotdExample) {
    setVolumeNumber(example.volume_number)
    setBusinessName(example.business_name)
    setPageContext(example.page_context)
    setDayTime(example.day_time)
    setSetupLine(example.setup)
    setMessages(example.messages || [])
    setInnerMonologue(example.inner_monologue || '')
    setTagline(example.tagline)
    setArchetypeTag(example.archetype?.label || '')

    if (example.series_tagline) {
      setSeriesTaglineId(example.series_tagline.id)
      setSeriesTagline(example.series_tagline.text)
    }

    setExampleDropdownOpen(false)
  }

  // ============================================================================
  // Visual Preset
  // ============================================================================

  function applyPreset(name: string) {
    const preset = getVisualPreset(name)
    if (!preset) return
    setBackgroundMode(preset.backgroundMode)
    setBackgroundColor(preset.backgroundColor)
    setGradientPreset(preset.gradientPreset)
    setGradientDirection(preset.gradientDirection)
    setFontFamily(preset.fontFamily)
    setBorderColor(preset.borderColor)
    setBorderThickness(preset.borderThickness)
    setBorderRadius(preset.borderRadius)
  }

  // ============================================================================
  // Messages CRUD
  // ============================================================================

  function addMessage() {
    const lastRole = messages.length > 0 ? messages[messages.length - 1].role : 'easyask'
    setMessages([...messages, { role: lastRole === 'visitor' ? 'easyask' : 'visitor', content: '' }])
  }

  function removeMessage(idx: number) {
    setMessages(messages.filter((_, i) => i !== idx))
  }

  function updateMessage(idx: number, field: 'role' | 'content', value: string) {
    setMessages(messages.map((m, i) =>
      i === idx ? { ...m, [field]: value } : m
    ))
  }

  // ============================================================================
  // Screenshot Export
  // ============================================================================

  async function handleCopyAsImage() {
    if (!previewRef.current || copyState === 'copying') return
    setCopyState('copying')

    try {
      const { default: html2canvas } = await import('html2canvas-pro')
      const { width, height } = getPlatformDimensions(platform)

      // Temporarily remove scale transform so html2canvas captures at true 1200px dimensions
      const wrapper = scaleWrapperRef.current
      const prevTransform = wrapper?.style.transform || ''
      if (wrapper) wrapper.style.transform = 'none'

      const canvas = await html2canvas(previewRef.current, {
        scale: 1,
        width,
        height,
        useCORS: true,
        backgroundColor: null,
      })

      // Restore scale transform
      if (wrapper) wrapper.style.transform = prevTransform

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(b => b ? resolve(b) : reject(new Error('Failed to create blob')), 'image/png')
      })

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])

      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 2000)
    } catch (error) {
      console.error('Failed to copy image:', error)
      setCopyState('idle')
    }
  }

  // ============================================================================
  // Filter examples
  // ============================================================================

  const filteredExamples = examples.filter(ex => {
    if (filterVertical && ex.vertical?.id !== filterVertical) return false
    if (filterArchetype && ex.archetype?.id !== filterArchetype) return false
    if (filterSector && ex.vertical?.sector !== filterSector) return false
    return true
  })

  const sectors = [...new Set(verticals.map(v => v.sector))].sort()

  // ============================================================================
  // Render
  // ============================================================================

  if (authorized === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Not available</p>
      </div>
    )
  }

  // Preview props
  const previewProps: ChatMockupPreviewProps = {
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
  }

  const { width: canvasWidth, height: canvasHeight } = getPlatformDimensions(platform)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* ================================================================
            Left Panel: Editor
            ================================================================ */}
        <div className="lg:w-[420px] xl:w-[460px] flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
          <div className="p-5 space-y-5">
            {/* Header */}
            <div>
              <h1 className="text-xl font-bold text-gray-900">Typing... Screenshot Generator</h1>
              <p className="text-sm text-gray-500 mt-1">Create social media screenshots from scripted chat examples</p>
            </div>

            {/* Load Example */}
            <div className="relative">
              <button
                onClick={() => setExampleDropdownOpen(!exampleDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <span>Load Example</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${exampleDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {exampleDropdownOpen && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-y-auto">
                  {/* Filters */}
                  <div className="sticky top-0 bg-white border-b border-gray-100 p-2">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                    >
                      <Filter className="w-3 h-3" />
                      Filters
                    </button>
                    {showFilters && (
                      <div className="mt-2 space-y-1.5">
                        <select
                          value={filterSector}
                          onChange={e => setFilterSector(e.target.value)}
                          className="w-full text-xs px-2 py-1 border border-gray-200 rounded"
                        >
                          <option value="">All Sectors</option>
                          {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select
                          value={filterVertical}
                          onChange={e => setFilterVertical(e.target.value)}
                          className="w-full text-xs px-2 py-1 border border-gray-200 rounded"
                        >
                          <option value="">All Verticals</option>
                          {verticals.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
                        </select>
                        <select
                          value={filterArchetype}
                          onChange={e => setFilterArchetype(e.target.value)}
                          className="w-full text-xs px-2 py-1 border border-gray-200 rounded"
                        >
                          <option value="">All Archetypes</option>
                          {archetypes.filter(a => !a.parent_id).map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                          {archetypes.filter(a => a.parent_id).map(a => <option key={a.id} value={a.id}>&nbsp;&nbsp;↳ {a.label}</option>)}
                        </select>
                      </div>
                    )}
                  </div>

                  {loading ? (
                    <div className="p-4 text-center text-sm text-gray-400">Loading...</div>
                  ) : filteredExamples.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-400">No examples found</div>
                  ) : (
                    filteredExamples.map(ex => (
                      <button
                        key={ex.id}
                        onClick={() => loadExample(ex)}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">
                            Vol. {ex.volume_number}
                          </span>
                          <span className="text-sm text-gray-800 font-medium truncate">{ex.business_name}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                          {ex.archetype?.label && <span>{ex.archetype.label}</span>}
                          {ex.vertical?.label && <span>&middot; {ex.vertical.label}</span>}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Series Fields */}
            <fieldset className="space-y-3">
              <legend className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Series</legend>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Volume #</label>
                  <input
                    type="number"
                    value={volumeNumber}
                    onChange={e => setVolumeNumber(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Series Tagline</label>
                  <select
                    value={seriesTaglineId}
                    onChange={e => {
                      setSeriesTaglineId(e.target.value)
                      const t = taglines.find(t => t.id === e.target.value)
                      setSeriesTagline(t?.text || '')
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                  >
                    {taglines.map(t => (
                      <option key={t.id} value={t.id}>{t.text}</option>
                    ))}
                  </select>
                </div>
              </div>
            </fieldset>

            <hr className="border-gray-100" />

            {/* Content Fields */}
            <fieldset className="space-y-3">
              <legend className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Content</legend>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Business name</label>
                <input
                  name="businessName"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  placeholder="e.g. Luxury mattress brand"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Page context</label>
                <input
                  name="pageContext"
                  value={pageContext}
                  onChange={e => setPageContext(e.target.value)}
                  placeholder="e.g. Product page — king-size mattress"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Day & time</label>
                  <input
                    name="dayTime"
                    value={dayTime}
                    onChange={e => setDayTime(e.target.value)}
                    placeholder="e.g. Tuesday, 2:47 AM"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Archetype tag</label>
                  <input
                    name="archetypeTag"
                    value={archetypeTag}
                    onChange={e => setArchetypeTag(e.target.value)}
                    placeholder="e.g. The 3 AM Shopper"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Setup line</label>
                <input
                  name="setupLine"
                  value={setupLine}
                  onChange={e => setSetupLine(e.target.value)}
                  placeholder="e.g. A visitor has been on the mattress page for 22 minutes..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                />
              </div>
            </fieldset>

            <hr className="border-gray-100" />

            {/* Messages */}
            <fieldset className="space-y-3">
              <legend className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Messages</legend>

              {messages.map((msg, idx) => (
                <div key={idx} className="space-y-1.5" data-testid="message-row">
                  <div className="flex items-center gap-2">
                    <select
                      data-testid="role-toggle"
                      value={msg.role}
                      onChange={e => updateMessage(idx, 'role', e.target.value)}
                      className="text-xs px-2 py-1 border border-gray-200 rounded font-medium"
                    >
                      <option value="visitor">Visitor</option>
                      <option value="easyask">EasyAsk</option>
                    </select>
                    <button
                      data-testid="remove-message"
                      onClick={() => removeMessage(idx)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove message"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <textarea
                    value={msg.content}
                    onChange={e => updateMessage(idx, 'content', e.target.value)}
                    placeholder={msg.role === 'visitor' ? 'Visitor message...' : 'EasyAsk response (supports markdown)...'}
                    rows={msg.role === 'easyask' ? 4 : 2}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400 resize-y"
                  />
                </div>
              ))}

              {messages.length < 6 && (
                <button
                  onClick={addMessage}
                  className="flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add message
                </button>
              )}
            </fieldset>

            <hr className="border-gray-100" />

            {/* Footer Fields */}
            <fieldset className="space-y-3">
              <legend className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Footer</legend>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Inner monologue (with emoji)</label>
                <input
                  name="innerMonologue"
                  value={innerMonologue}
                  onChange={e => setInnerMonologue(e.target.value)}
                  placeholder="What the AI really wanted to say... 🤖"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                />
                <p className="text-xs text-gray-400 mt-0.5">Use Ctrl+Cmd+Space for emoji picker</p>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Tagline</label>
                <input
                  name="tagline"
                  value={tagline}
                  onChange={e => setTagline(e.target.value)}
                  placeholder="EasyAsk: ..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                />
              </div>
            </fieldset>

            <hr className="border-gray-100" />

            {/* Styling Accordion */}
            <div>
              <button
                onClick={() => setStylingOpen(!stylingOpen)}
                className="w-full flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
              >
                {stylingOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                Styling
              </button>

              {stylingOpen && (
                <div className="mt-3 space-y-4">
                  {/* Platform Toggle */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Platform</label>
                    <div className="flex gap-2">
                      <button
                        data-testid="platform-x"
                        onClick={() => setPlatform('x')}
                        className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                          platform === 'x'
                            ? 'border-orange-400 bg-orange-50 text-orange-700 font-medium'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        X (16:9)
                      </button>
                      <button
                        data-testid="platform-linkedin"
                        onClick={() => setPlatform('linkedin')}
                        className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                          platform === 'linkedin'
                            ? 'border-orange-400 bg-orange-50 text-orange-700 font-medium'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        LinkedIn (1:1)
                      </button>
                    </div>
                  </div>

                  {/* Visual Presets */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Presets</label>
                    <div className="flex gap-1.5">
                      {Object.keys(VISUAL_PRESETS).map(name => (
                        <button
                          key={name}
                          data-testid={`preset-${name}`}
                          onClick={() => applyPreset(name)}
                          className="flex-1 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-orange-300 transition-colors capitalize"
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Background Mode */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Background</label>
                    <div className="flex gap-1.5 mb-2">
                      {(['solid', 'gradient', 'image-outline'] as const).map(mode => (
                        <button
                          key={mode}
                          onClick={() => setBackgroundMode(mode)}
                          className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors capitalize ${
                            backgroundMode === mode
                              ? 'border-orange-400 bg-orange-50 text-orange-700'
                              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {mode === 'image-outline' ? 'Outline' : mode}
                        </button>
                      ))}
                    </div>

                    {backgroundMode === 'solid' && (
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={backgroundColor}
                          onChange={e => setBackgroundColor(e.target.value)}
                          className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={backgroundColor}
                          onChange={e => setBackgroundColor(e.target.value)}
                          className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded font-mono"
                        />
                      </div>
                    )}

                    {backgroundMode === 'gradient' && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-6 gap-1.5">
                          {Object.entries(GRADIENT_PRESETS).map(([name, colors]) => (
                            <button
                              key={name}
                              onClick={() => setGradientPreset(name)}
                              className={`h-8 rounded-md border-2 transition-colors ${
                                gradientPreset === name ? 'border-orange-500' : 'border-transparent'
                              }`}
                              style={{ background: `linear-gradient(to bottom, ${colors.join(', ')})` }}
                              title={name}
                            />
                          ))}
                        </div>
                        <button
                          onClick={() => setGradientDirection(d => d === 'to bottom' ? '135deg' : 'to bottom')}
                          className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          Direction: {gradientDirection === 'to bottom' ? '↓ Vertical' : '↘ Diagonal'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Font */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Chat bubble font</label>
                    <select
                      data-testid="font-select"
                      value={fontFamily}
                      onChange={e => setFontFamily(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400"
                    >
                      {FONT_OPTIONS.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>

                  {/* Border */}
                  <div className="space-y-2">
                    <label className="block text-xs text-gray-500">Border</label>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs text-gray-400 mb-0.5">Color</label>
                        <input
                          type="color"
                          value={borderColor}
                          onChange={e => setBorderColor(e.target.value)}
                          className="w-full h-8 rounded border border-gray-200 cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-0.5">Thickness</label>
                        <input
                          data-testid="border-thickness"
                          type="number"
                          min={0}
                          max={12}
                          value={borderThickness}
                          onChange={e => setBorderThickness(parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-0.5">Radius</label>
                        <input
                          type="number"
                          min={0}
                          max={32}
                          value={borderRadius}
                          onChange={e => setBorderRadius(parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded text-center"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================================================================
            Right Panel: Live Preview
            ================================================================ */}
        <div className="flex-1 bg-gray-100 p-6 overflow-auto flex flex-col items-center">
          {/* Preview container — scales to fit */}
          <div
            ref={scaleWrapperRef}
            className="origin-top-left"
            style={{
              width: `${canvasWidth}px`,
              height: `${canvasHeight}px`,
              transform: `scale(${Math.min(1, (typeof window !== 'undefined' ? Math.min(window.innerWidth - 460 - 48, 900) : 700) / canvasWidth)})`,
              transformOrigin: 'top center',
            }}
          >
            <ChatMockupPreview ref={previewRef} {...previewProps} />
          </div>

          {/* Copy button */}
          <div className="mt-4" style={{ marginTop: `${Math.max(16, canvasHeight * Math.min(1, 700 / canvasWidth) + 16 - canvasHeight)}px` }}>
            <button
              onClick={handleCopyAsImage}
              disabled={copyState === 'copying'}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 disabled:opacity-50 text-white font-medium rounded-xl shadow-lg transition-all"
            >
              {copyState === 'copied' ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Copied!</span>
                </>
              ) : copyState === 'copying' ? (
                <span>Capturing...</span>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span>Copy as Image</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
