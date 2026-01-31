'use client'

import { useEffect, useState } from 'react'
import { Sparkles, Loader2, ChevronDown, ChevronRight } from 'lucide-react'
import type { PageThemeResult, WidgetPage } from './types'

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
  if (result.message_count < 3) {
    return (
      <p className="text-sm text-gray-500 italic py-2">
        Not enough questions (need at least 3 in the last 30 days).
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
          Last generated: {relativeTime(result.generated_at)} · Based on {result.message_count} questions
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

export default function QuestionThemes({ pageUrl, widgetPages }: QuestionThemesProps) {
  const [pageThemes, setPageThemes] = useState<PageThemeResult[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchThemes()
  }, [pageUrl])

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
        body: JSON.stringify({ pageUrl: pageUrl || undefined })
      })
      const data = await response.json()
      if (data.pages) {
        setPageThemes(data.pages)
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

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-semibold text-gray-900">Question Themes</h2>
        </div>
        <button
          onClick={runAnalysis}
          disabled={generating}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Run Analysis'
          )}
        </button>
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
