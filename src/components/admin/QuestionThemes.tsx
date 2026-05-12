'use client'

import { useEffect, useState } from 'react'
import { Sparkles, Loader2, ChevronDown, ChevronRight, Download } from 'lucide-react'
import type { PageThemeResult, WidgetPage } from './types'
import DateRangeFilter, {
  formatDateRangeLabel,
  getDefaultDateRange,
  type DateRangeValue
} from './DateRangeFilter'

interface QuestionThemesProps {
  pageUrl: string | null
  widgetPages: WidgetPage[]
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function ThemeList({ result }: { result: PageThemeResult }) {
  const dateLabel = result.date_range_label || 'Last 30 days'

  if (result.message_count < 3) {
    return (
      <p className="text-sm text-gray-500 italic py-2">
        Not enough questions (need at least 3 for {dateLabel.toLowerCase()}).
      </p>
    )
  }

  if (result.themes.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic py-2">
        No themes generated yet.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {result.generated_at && (
        <p className="text-xs text-gray-400">
          Last generated: {relativeTime(result.generated_at)} · {dateLabel} · Based on {result.message_count} questions
        </p>
      )}
      {result.themes.map((theme, i) => (
        <div key={i} className="border border-gray-100 rounded-lg p-4 bg-white">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900 text-sm">{theme.name}</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
              {theme.count}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">{theme.description}</p>
          {theme.examples.length > 0 && (
            <div className="space-y-1">
              {theme.examples.map((ex, j) => (
                <p key={j} className="text-xs text-gray-500 bg-gray-50 rounded px-2 py-1">
                  &ldquo;{ex}&rdquo;
                </p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function buildThemesMarkdown(
  pages: PageThemeResult[],
  range: DateRangeValue,
  pageUrl: string | null
): string {
  const generatedAt = new Date().toLocaleString()
  const dateLabel = formatDateRangeLabel(range)
  const scope = pageUrl ? pages[0]?.page_title || pageUrl : 'All Pages'

  const sections = pages.map(result => {
    const lines = [
      `## ${result.page_title}`,
      '',
      `Page: ${result.page_url}`,
      `Questions analyzed: ${result.message_count}`,
      ''
    ]

    if (result.themes.length === 0) {
      lines.push('No themes generated.')
      return lines.join('\n')
    }

    result.themes.forEach((theme, index) => {
      lines.push(`### ${index + 1}. ${theme.name} (${theme.count})`)
      lines.push('')
      lines.push(theme.description)
      if (theme.examples.length > 0) {
        lines.push('')
        lines.push('Examples:')
        theme.examples.forEach(example => {
          lines.push(`- "${example}"`)
        })
      }
      lines.push('')
    })

    return lines.join('\n')
  })

  return [
    '# EasyAsk Question Themes',
    '',
    `Generated: ${generatedAt}`,
    `Date range: ${dateLabel}`,
    `Scope: ${scope}`,
    '',
    ...sections
  ].join('\n')
}

export default function QuestionThemes({ pageUrl, widgetPages }: QuestionThemesProps) {
  const [pageThemes, setPageThemes] = useState<PageThemeResult[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set())
  const [dateRange, setDateRange] = useState<DateRangeValue>(() => getDefaultDateRange())
  const [lastGeneratedPages, setLastGeneratedPages] = useState<PageThemeResult[]>([])
  const [lastGeneratedRange, setLastGeneratedRange] = useState<DateRangeValue | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  useEffect(() => {
    setLastGeneratedPages([])
    setLastGeneratedRange(null)
    fetchThemes()
  }, [pageUrl])

  useEffect(() => {
    if (lastGeneratedPages.length === 0) {
      setDownloadUrl(null)
      return
    }

    const markdown = buildThemesMarkdown(
      lastGeneratedPages,
      lastGeneratedRange || dateRange,
      pageUrl
    )
    const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown' }))
    setDownloadUrl(url)

    return () => URL.revokeObjectURL(url)
  }, [lastGeneratedPages, lastGeneratedRange, dateRange, pageUrl])

  async function fetchThemes() {
    setLoading(true)
    try {
      const url = pageUrl
        ? `/api/admin/question-themes?pageUrl=${encodeURIComponent(pageUrl)}`
        : '/api/admin/question-themes'
      const response = await fetch(url, { cache: 'no-store' })
      const data = await response.json()
      setPageThemes(data.pages || [])
      // Auto-expand all pages on load
      setExpandedPages(new Set())
    } catch (error) {
      console.error('Error fetching themes:', error)
    } finally {
      setLoading(false)
    }
  }

  async function runAnalysis() {
    setGenerating(true)
    try {
      const response = await fetch('/api/admin/question-themes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageUrl: pageUrl || undefined,
          dateRangeMode: dateRange.mode,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        })
      })
      const data = await response.json()
      if (data.pages) {
        setPageThemes(data.pages)
        setLastGeneratedPages(data.pages)
        setLastGeneratedRange(dateRange)
        setExpandedPages(new Set(data.pages.map((p: PageThemeResult) => p.page_url)))
      }
    } catch (error) {
      console.error('Error generating themes:', error)
    } finally {
      setGenerating(false)
    }
  }

  function togglePage(url: string) {
    setExpandedPages(prev => {
      const next = new Set(prev)
      if (next.has(url)) {
        next.delete(url)
      } else {
        next.add(url)
      }
      return next
    })
  }

  const hasThemes = pageThemes.length > 0
  const dateLabel = formatDateRangeLabel(dateRange)

  return (
    <div className="mt-8">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-orange-500" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Question Themes</h2>
            <p className="text-xs text-gray-500 mt-1">
              Default analysis uses the last 30 days.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
            <button
              onClick={runAnalysis}
              disabled={generating}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                `Run Analysis (${dateLabel})`
              )}
            </button>
            {downloadUrl && (
              <a
                href={downloadUrl}
                download={`easyask-question-themes-${new Date().toISOString().slice(0, 10)}.md`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 hover:border-orange-300 text-gray-700 text-sm font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Themes
              </a>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : !hasThemes ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <p className="text-gray-500">
            Click &quot;Run Analysis&quot; to discover what your visitors are asking about.
          </p>
        </div>
      ) : pageUrl ? (
        // Single page view
        <div className="bg-gray-50 rounded-xl p-4">
          <ThemeList result={pageThemes[0]} />
        </div>
      ) : (
        // All pages view - collapsible subsections
        <div className="space-y-3">
          {pageThemes.map(result => (
            <div key={result.page_url} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => togglePage(result.page_url)}
                className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                {expandedPages.has(result.page_url) ? (
                  <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )}
                <span className="font-medium text-gray-900 text-sm">{result.page_title}</span>
                <span className="text-xs text-gray-400 truncate ml-auto">
                  {result.themes.length} theme{result.themes.length !== 1 ? 's' : ''}
                </span>
              </button>
              {expandedPages.has(result.page_url) && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <div className="pt-3">
                    <ThemeList result={result} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
