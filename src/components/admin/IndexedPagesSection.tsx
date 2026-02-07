'use client'

import { useState } from 'react'
import { FileText, ExternalLink, Calendar, ChevronDown, ChevronUp, Globe, Search } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import type { IndexedPage, IndexedPageSyncStatus } from './types'

interface IndexedPagesSectionProps {
  pages: IndexedPage[]
  loading: boolean
  widgetPagesMap: Record<string, string>
  onRefresh: () => void
  selectedPages: string[]
  onSelectionChange: (ids: string[]) => void
}

const SYNC_STATUS_STYLES: Record<IndexedPageSyncStatus, { bg: string; text: string; border: string; label: string }> = {
  synced: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Synced' },
  orphaned: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'Orphaned' },
  missing_from_google: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Missing' },
  id_mismatch: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', label: 'ID Mismatch' }
}

export default function IndexedPagesSection({
  pages,
  loading,
  widgetPagesMap,
  onRefresh,
  selectedPages,
  onSelectionChange
}: IndexedPagesSectionProps): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPages = searchQuery
    ? pages.filter(p =>
        (p.page_title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.page_url.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : pages

  function handleTogglePage(pageId: string): void {
    onSelectionChange(
      selectedPages.includes(pageId)
        ? selectedPages.filter(id => id !== pageId)
        : [...selectedPages, pageId]
    )
  }

  function handleSelectAll(): void {
    if (selectedPages.length === filteredPages.length && filteredPages.length > 0) {
      onSelectionChange([])
    } else {
      onSelectionChange(filteredPages.map(p => p.id))
    }
  }

  function getPageDisplayUrl(url: string): string {
    try {
      return new URL(url).pathname || '/'
    } catch {
      return url
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden mb-8">
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1 hover:bg-gray-100 transition-colors text-left -m-2 p-2 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  Current Knowledgebase Documents
                  {!loading && (
                    <span className="text-sm font-normal text-gray-500">
                      ({pages.length} in registry)
                    </span>
                  )}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  These are all the files the AI Assistant has access to
                </p>
              </div>
              <div className="flex-shrink-0 ml-4">
                {isExpanded ? (
                  <ChevronUp className="w-6 h-6 text-gray-500" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-500" />
                )}
              </div>
            </div>
          </button>
        </div>

        {isExpanded && pages.length > 0 && (
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handleSelectAll}
              className="text-sm text-orange-600 hover:text-orange-500 font-medium"
            >
              {selectedPages.length === filteredPages.length && filteredPages.length > 0 ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        )}
      </div>

      {isExpanded && (
        <>
          {loading ? (
            <div className="px-6 py-12 text-center text-gray-500">
              Loading indexed documents...
            </div>
          ) : pages.length > 0 ? (
            <>
              <div className="px-6 pt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search documents..."
                    className="w-full pl-9 pr-3 py-2 bg-gray-100 border border-gray-300 text-gray-900 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent placeholder-gray-400"
                  />
                </div>
              </div>
              <div className="divide-y divide-gray-200 mt-4">
              {filteredPages.map((page) => {
                const isSelected = selectedPages.includes(page.id)
                const statusStyle = SYNC_STATUS_STYLES[page.sync_status]

                return (
                  <div
                    key={page.id}
                    className={cn(
                      'px-6 py-5 transition-colors',
                      isSelected
                        ? 'bg-orange-50 border-l-4 border-orange-300'
                        : 'hover:bg-gray-100'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleTogglePage(page.id)}
                        className="mt-1 w-5 h-5 rounded border-gray-300 bg-white text-orange-500 focus:ring-2 focus:ring-orange-400 focus:ring-offset-0 cursor-pointer"
                      />

                      <div className="flex-1 min-w-0 flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-orange-500 flex-shrink-0" />
                            <span className="truncate">{page.page_title || 'Untitled'}</span>
                          </h3>

                          {page.source_type === 'uploaded' ? (
                            <div className="mb-3">
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                                <FileText className="w-3 h-3" />
                                Uploaded File
                              </span>
                            </div>
                          ) : (
                            <a
                              href={page.page_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-orange-600 hover:text-orange-500 hover:underline flex items-center gap-1 mb-3"
                            >
                              <span className="truncate">{page.page_url}</span>
                              <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            </a>
                          )}

                          <div className="space-y-2">
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              {(page.scraped_at || page.created_at) && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>Added {formatDate(page.scraped_at || page.created_at!)}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <span className={cn(
                                  'inline-flex px-2 py-0.5 text-xs font-semibold rounded-md border',
                                  statusStyle.bg,
                                  statusStyle.text,
                                  statusStyle.border
                                )}>
                                  {statusStyle.label}
                                </span>
                              </div>
                            </div>

                            {page.page_urls && page.page_urls.length > 0 && (
                              <div className="flex items-start gap-2">
                                <Globe className="w-3 h-3 text-gray-500 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-xs text-gray-500 mb-1">Available on:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {page.page_urls.map((url, idx) => (
                                      <span
                                        key={idx}
                                        className="inline-flex items-center px-2 py-0.5 text-xs rounded-md bg-blue-50 text-blue-700 border border-blue-200"
                                      >
                                        {widgetPagesMap[url] || getPageDisplayUrl(url)}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          <div className="text-right">
                            <p className="text-xs text-gray-500 mb-1">Document ID</p>
                            <p className="text-xs font-mono text-gray-500 max-w-[200px] truncate">
                              {page.document_id.split('/').pop()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            </>
          ) : (
            <div className="px-6 py-16 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents indexed yet</h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                Documents selected from below will appear here.
              </p>
            </div>
          )}
        </>
      )}

    </div>
  )
}
