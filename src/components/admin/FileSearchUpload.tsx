'use client'

import { useState, useEffect } from 'react'
import { Upload, Check, Loader2, X, AlertTriangle } from 'lucide-react'

interface WidgetPage {
  id: string
  page_url: string
  page_title: string
}

interface FileSearchUploadProps {
  selectedJobs: string[]
  selectedUploads: string[]
  onUploadComplete: () => void
}

export default function FileSearchUpload({
  selectedJobs,
  selectedUploads,
  onUploadComplete
}: FileSearchUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [stats, setStats] = useState<{ total: number; successful: number; failed: number } | null>(null)
  const [widgetPages, setWidgetPages] = useState<WidgetPage[]>([])
  const [selectedPageUrls, setSelectedPageUrls] = useState<string[]>([])
  const [loadingPages, setLoadingPages] = useState(true)

  const totalSelected = selectedJobs.length + selectedUploads.length

  useEffect(() => {
    fetchWidgetPages()
  }, [])

  const fetchWidgetPages = async () => {
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

  const handleTogglePage = (pageUrl: string) => {
    if (selectedPageUrls.includes(pageUrl)) {
      setSelectedPageUrls(selectedPageUrls.filter(url => url !== pageUrl))
    } else {
      setSelectedPageUrls([...selectedPageUrls, pageUrl])
    }
  }

  const handleSelectAllPages = () => {
    if (selectedPageUrls.length === widgetPages.length && widgetPages.length > 0) {
      setSelectedPageUrls([])
    } else {
      setSelectedPageUrls(widgetPages.map(p => p.page_url))
    }
  }

  const handleUpload = async () => {
    if (totalSelected === 0) return

    // Check if pages are selected when items are selected
    if (selectedPageUrls.length === 0) {
      setError('Please select at least one page where this content should be available')
      return
    }

    setError('')
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
      setError(err instanceof Error ? err.message : 'Failed to upload')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-gray-800 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-700 p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Upload to File Search</h2>
      <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
        Upload selected pages to Google File Search to activate your assistant
      </p>

      {/* Page Selection */}
      {!loadingPages && widgetPages.length > 0 && totalSelected > 0 && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-900 rounded-lg border border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
            <h3 className="text-xs sm:text-sm font-medium text-gray-300">Select pages where this content should be available:</h3>
            <button
              onClick={handleSelectAllPages}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              {selectedPageUrls.length === widgetPages.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {widgetPages.map((page) => (
              <label
                key={page.id}
                className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-750 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedPageUrls.includes(page.page_url)}
                  onChange={() => handleTogglePage(page.page_url)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{page.page_title}</p>
                  <p className="text-xs text-gray-400 truncate">{page.page_url}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {loadingPages && totalSelected > 0 && (
        <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-700 text-center">
          <Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" />
          <p className="text-sm text-gray-400 mt-2">Loading pages...</p>
        </div>
      )}

      {!loadingPages && widgetPages.length === 0 && totalSelected > 0 && (
        <div className="mb-6 p-4 bg-orange-900/30 border border-orange-700 rounded-lg">
          <p className="text-sm text-orange-400">
            No pages configured yet. Please add pages in the <a href="/admin/pages" className="underline">Pages</a> section first.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {success && stats && (
        <>
          {/* All items succeeded */}
          {stats.failed === 0 && (
            <div className="bg-green-900/30 border border-green-700 text-green-400 px-4 py-3 rounded-lg text-sm mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-5 h-5" />
                <span className="font-medium">Upload Complete!</span>
              </div>
              <ul className="text-sm space-y-1 ml-7">
                <li>Total: {stats.total}</li>
                <li>Successful: {stats.successful}</li>
              </ul>
            </div>
          )}

          {/* All items failed */}
          {stats.successful === 0 && stats.failed > 0 && (
            <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
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
          )}

          {/* Partial success */}
          {stats.successful > 0 && stats.failed > 0 && (
            <div className="bg-orange-900/30 border border-orange-700 text-orange-400 px-4 py-3 rounded-lg text-sm mb-4">
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
          )}
        </>
      )}

      <div className="flex items-center gap-4">
        <button
          onClick={handleUpload}
          disabled={uploading || totalSelected === 0}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg px-6 py-2.5 font-medium transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading {totalSelected} item{totalSelected !== 1 ? 's' : ''}...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Upload {totalSelected} Selected
            </>
          )}
        </button>

        {totalSelected === 0 && (
          <p className="text-sm text-gray-400">
            Select scraped pages or uploaded docs above
          </p>
        )}
      </div>
    </div>
  )
}
