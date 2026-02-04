'use client'

import { useState, useEffect } from 'react'
import { Upload, Trash2, Check, Loader2, X, AlertTriangle } from 'lucide-react'
import DeleteConfirmationModal from './DeleteConfirmationModal'
import type { ScrapingJob, FileUpload, IndexedPage } from './types'

interface WidgetPage {
  id: string
  page_url: string
  page_title: string
}

interface StickyActionsBarProps {
  selectedJobs: string[]
  selectedUploads: string[]
  selectedIndexedPages: string[]
  jobs: ScrapingJob[]
  uploads: FileUpload[]
  indexedPages: IndexedPage[]
  onDeleteComplete: () => void
  onUploadComplete: () => void
}

function buildSummaryLabel(
  jobCount: number,
  uploadCount: number,
  indexedCount: number
): string {
  const parts: string[] = []
  if (jobCount > 0) parts.push(`${jobCount} scraped page${jobCount !== 1 ? 's' : ''}`)
  if (uploadCount > 0) parts.push(`${uploadCount} upload${uploadCount !== 1 ? 's' : ''}`)
  if (indexedCount > 0) parts.push(`${indexedCount} indexed doc${indexedCount !== 1 ? 's' : ''}`)
  return parts.join(', ') + ' selected'
}

function getDisplayUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname + urlObj.pathname
  } catch {
    return url
  }
}

export default function StickyActionsBar({
  selectedJobs,
  selectedUploads,
  selectedIndexedPages,
  jobs,
  uploads,
  indexedPages,
  onDeleteComplete,
  onUploadComplete
}: StickyActionsBarProps) {
  // Upload-to-AI state (absorbed from FileSearchUpload)
  const [widgetPages, setWidgetPages] = useState<WidgetPage[]>([])
  const [selectedPageUrls, setSelectedPageUrls] = useState<string[]>([])
  const [loadingPages, setLoadingPages] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [success, setSuccess] = useState(false)
  const [stats, setStats] = useState<{ total: number; successful: number; failed: number } | null>(null)

  // Delete state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const totalSelected = selectedJobs.length + selectedUploads.length + selectedIndexedPages.length
  const hasUploadable = selectedJobs.length + selectedUploads.length > 0

  useEffect(() => {
    fetchWidgetPages()
  }, [])

  async function fetchWidgetPages(): Promise<void> {
    try {
      const response = await fetch('/api/admin/widget-pages')
      const data = await response.json()
      setWidgetPages(data.pages || [])
    } catch (error) {
      console.error('Failed to fetch widget pages:', error)
    } finally {
      setLoadingPages(false)
    }
  }

  function handleTogglePage(pageUrl: string): void {
    if (selectedPageUrls.includes(pageUrl)) {
      setSelectedPageUrls(selectedPageUrls.filter(url => url !== pageUrl))
    } else {
      setSelectedPageUrls([...selectedPageUrls, pageUrl])
    }
  }

  function handleSelectAllPages(): void {
    if (selectedPageUrls.length === widgetPages.length && widgetPages.length > 0) {
      setSelectedPageUrls([])
    } else {
      setSelectedPageUrls(widgetPages.map(p => p.page_url))
    }
  }

  // Upload handler (same as FileSearchUpload)
  async function handleUpload(): Promise<void> {
    if (!hasUploadable) return

    if (selectedPageUrls.length === 0) {
      setUploadError('Please select at least one page where this content should be available')
      return
    }

    setUploadError('')
    setSuccess(false)
    setStats(null)
    setUploading(true)

    try {
      const response = await fetch('/api/admin/upload-to-file-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobIds: selectedJobs,
          uploadIds: selectedUploads,
          pageUrls: selectedPageUrls
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload to File Search')
      }

      setStats(data.summary)
      setSuccess(true)
      onUploadComplete()
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload')
    } finally {
      setUploading(false)
    }
  }

  // Delete handler — builds items and fires parallel API calls
  function getDeleteType(): 'scraped' | 'uploaded' | 'indexed' | 'mixed' {
    const types: string[] = []
    if (selectedJobs.length > 0) types.push('scraped')
    if (selectedUploads.length > 0) types.push('uploaded')
    if (selectedIndexedPages.length > 0) types.push('indexed')
    if (types.length === 1) return types[0] as 'scraped' | 'uploaded' | 'indexed'
    return 'mixed'
  }

  function getDeleteItems(): Array<{ id: string; title: string }> {
    const items: Array<{ id: string; title: string }> = []

    for (const id of selectedJobs) {
      const job = jobs.find(j => j.id === id)
      items.push({ id, title: job ? getDisplayUrl(job.url) : 'Unknown' })
    }

    for (const id of selectedUploads) {
      const upload = uploads.find(u => u.id === id)
      items.push({ id, title: upload?.filename || 'Unknown' })
    }

    for (const id of selectedIndexedPages) {
      const page = indexedPages.find(p => p.id === id)
      items.push({ id, title: page?.page_title || 'Unknown' })
    }

    return items
  }

  async function handleDelete(): Promise<void> {
    setIsDeleting(true)

    try {
      const promises: Promise<Response>[] = []

      if (selectedJobs.length > 0) {
        promises.push(
          fetch('/api/admin/scraping-jobs', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobIds: selectedJobs })
          })
        )
      }

      if (selectedUploads.length > 0) {
        promises.push(
          fetch('/api/admin/upload-files', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uploadIds: selectedUploads })
          })
        )
      }

      if (selectedIndexedPages.length > 0) {
        promises.push(
          fetch('/api/admin/indexed-pages', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pageIds: selectedIndexedPages })
          })
        )
      }

      await Promise.all(promises)
      onDeleteComplete()
    } catch (err) {
      console.error('Delete failed:', err)
    } finally {
      setIsDeleting(false)
      setIsDeleteModalOpen(false)
    }
  }

  const hasResult = success || !!uploadError
  const isVisible = totalSelected > 0 || hasResult

  if (!isVisible) return null

  function handleDismissResult(): void {
    setSuccess(false)
    setStats(null)
    setUploadError('')
  }

  const summaryLabel = buildSummaryLabel(
    selectedJobs.length,
    selectedUploads.length,
    selectedIndexedPages.length
  )

  return (
    <div className="sticky bottom-0 z-10 pt-4 pb-4 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent">
      <div className={`rounded-2xl sm:rounded-3xl shadow-xl border p-4 sm:p-6 transition-colors ${totalSelected > 0 && hasUploadable ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'}`}>
        {totalSelected > 0 && (
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <p className="text-sm sm:text-base font-medium text-gray-700">
              {summaryLabel}
            </p>
          </div>
        )}

        {/* Page Selection — only when uploadable items are selected */}
        {hasUploadable && !loadingPages && widgetPages.length > 0 && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
              <p className="text-sm font-medium text-gray-700">Select pages where this content should be available:</p>
              <button
                onClick={handleSelectAllPages}
                className="text-xs text-orange-600 hover:text-orange-500 font-medium ml-auto"
              >
                {selectedPageUrls.length === widgetPages.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {widgetPages.map((page) => (
                <label
                  key={page.id}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedPageUrls.includes(page.page_url)}
                    onChange={() => handleTogglePage(page.page_url)}
                    className="w-4 h-4 rounded border-gray-300 bg-white text-orange-500 focus:ring-2 focus:ring-orange-400 focus:ring-offset-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{page.page_title}</p>
                    <p className="text-xs text-gray-500 truncate">{page.page_url}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {hasUploadable && loadingPages && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" />
            <p className="text-sm text-gray-500 mt-2">Loading pages...</p>
          </div>
        )}

        {hasUploadable && !loadingPages && widgetPages.length === 0 && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-700">
              No pages configured yet. Please add pages in the <a href="/admin/pages" className="underline">Pages</a> section first.
            </p>
          </div>
        )}

        {/* Error / Success Alerts */}
        {uploadError && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
            <span className="flex-1">{uploadError}</span>
            <button onClick={handleDismissResult} className="flex-shrink-0 p-0.5 rounded-md hover:bg-red-100 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {success && stats && (
          <>
            {stats.failed === 0 && (
              <div className="flex items-start gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="w-5 h-5" />
                    <span className="font-medium">Upload Complete!</span>
                  </div>
                  <ul className="text-sm space-y-1 ml-7">
                    <li>Total: {stats.total}</li>
                    <li>Successful: {stats.successful}</li>
                  </ul>
                </div>
                <button onClick={handleDismissResult} className="flex-shrink-0 p-0.5 rounded-md hover:bg-green-100 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {stats.successful === 0 && stats.failed > 0 && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <X className="w-5 h-5" />
                    <span className="font-medium">Upload Failed</span>
                  </div>
                  <ul className="text-sm space-y-1 ml-7">
                    <li>Total: {stats.total}</li>
                    <li>Successful: {stats.successful}</li>
                    <li>Failed: {stats.failed}</li>
                  </ul>
                </div>
                <button onClick={handleDismissResult} className="flex-shrink-0 p-0.5 rounded-md hover:bg-red-100 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {stats.successful > 0 && stats.failed > 0 && (
              <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-lg text-sm mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-medium">Upload Completed with Errors</span>
                  </div>
                  <ul className="text-sm space-y-1 ml-7">
                    <li>Total: {stats.total}</li>
                    <li>Successful: {stats.successful}</li>
                    <li>Failed: {stats.failed}</li>
                  </ul>
                </div>
                <button onClick={handleDismissResult} className="flex-shrink-0 p-0.5 rounded-md hover:bg-orange-100 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}

        {/* Action Buttons */}
        {totalSelected > 0 && (
          <div className="flex items-center gap-3">
            {hasUploadable && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white rounded-lg px-6 py-2.5 font-medium transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Upload to AI
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={isDeleting || uploading}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg px-6 py-2.5 font-medium transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-5 h-5" />
              Delete ({totalSelected})
            </button>
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        items={getDeleteItems()}
        type={getDeleteType()}
        loading={isDeleting}
      />
    </div>
  )
}
