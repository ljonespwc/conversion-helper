'use client'

import { useState } from 'react'
import { Check, Loader2, X, FileText, Globe, Plus, Trash2 } from 'lucide-react'
import DeleteConfirmationModal from './DeleteConfirmationModal'

interface ScrapingJob {
  id: string
  url: string
  status: string
  scraping_status: string
  indexing_status: string
  file_size: number | null
  word_count: number | null
  error_message: string | null
  created_at: string
  completed_at: string | null
}

interface ScrapedPagesListProps {
  jobs: ScrapingJob[]
  selectedJobs: string[]
  onSelectionChange: (jobIds: string[]) => void
  onScrapeStarted: () => void
}

export default function ScrapedPagesList({
  jobs,
  selectedJobs,
  onSelectionChange,
  onScrapeStarted
}: ScrapedPagesListProps) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!url) {
      setError('Please enter a URL')
      return
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      setError('Please enter a valid URL')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/admin/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start scraping')
      }

      setUrl('')
      onScrapeStarted()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start scraping')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = (jobId: string) => {
    if (selectedJobs.includes(jobId)) {
      onSelectionChange(selectedJobs.filter(id => id !== jobId))
    } else {
      onSelectionChange([...selectedJobs, jobId])
    }
  }

  const handleSelectAll = () => {
    // Only select jobs that are scraped and ready to be indexed (not_indexed or failed)
    const readyJobIds = jobs.filter(j =>
      j.scraping_status === 'scraped' &&
      ['not_indexed', 'failed'].includes(j.indexing_status)
    ).map(j => j.id)
    if (selectedJobs.length === readyJobIds.length && readyJobIds.length > 0) {
      onSelectionChange([])
    } else {
      onSelectionChange(readyJobIds)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const response = await fetch('/api/admin/scraping-jobs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobIds: selectedJobs })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete jobs')
      }

      // Clear selections and refresh list
      onSelectionChange([])
      onScrapeStarted() // Reuses existing refresh callback
      setIsDeleteModalOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete jobs')
      setIsDeleteModalOpen(false)
    } finally {
      setIsDeleting(false)
    }
  }

  const readyJobs = jobs.filter(j =>
    j.scraping_status === 'scraped' &&
    ['not_indexed', 'failed'].includes(j.indexing_status)
  )
  const allSelected = selectedJobs.length === readyJobs.length && readyJobs.length > 0

  return (
    <div className="bg-gray-800 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-700 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-700 bg-gray-900">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-2">Scraped Pages</h2>
        <p className="text-xs sm:text-sm text-gray-400">Enter a URL to scrape and convert to markdown</p>
      </div>

      {/* Scrape Form */}
      <div className="p-4 sm:p-6 border-b border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-2">
              Page URL
            </label>
            <input
              type="text"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/page"
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-sm sm:text-base"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-400 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg px-4 sm:px-6 py-2 sm:py-2.5 font-medium transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              {loading ? 'Scraping...' : 'Scrape Page'}
            </button>

            {selectedJobs.length > 0 && (
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={loading}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg px-4 sm:px-6 py-2 sm:py-2.5 font-medium transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Delete Selected ({selectedJobs.length})</span>
              </button>
            )}
          </div>
        </form>
      </div>

      {jobs.length > 0 && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
              Scraped Pages ({jobs.length})
            </h3>
            {readyJobs.length > 0 && (
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-400 hover:text-blue-300 font-medium"
              >
                {allSelected ? 'Deselect All' : 'Select All Ready'}
              </button>
            )}
          </div>

          <div className="space-y-2">
            {jobs.map((job) => {
              // Job is ready if scraping is complete and indexing is not yet done or failed
              const isReady = job.scraping_status === 'scraped' &&
                ['not_indexed', 'failed'].includes(job.indexing_status)
              const isSelected = selectedJobs.includes(job.id)

              // Extract domain from URL for display
              const urlObj = new URL(job.url)
              const displayUrl = urlObj.hostname + urlObj.pathname

              return (
                <div
                  key={job.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border ${
                    isSelected
                      ? 'bg-blue-900/20 border-blue-700'
                      : 'bg-gray-900/50 border-gray-700 hover:border-gray-600'
                  } transition-colors`}
                >
                  {/* Checkbox */}
                  {isReady && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggle(job.id)}
                      className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                    />
                  )}

                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-purple-900/30 border border-purple-700/50 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-purple-400" />
                    </div>
                  </div>

                  {/* Page Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate">
                      {displayUrl}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      {job.file_size && (
                        <>
                          <span>{(job.file_size / 1024).toFixed(1)} KB</span>
                          <span>•</span>
                        </>
                      )}
                      {job.word_count && <span>{job.word_count.toLocaleString()} words</span>}
                      {job.error_message && (
                        <>
                          <span>•</span>
                          <span className="text-red-400">{job.error_message}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0">
                    {/* Show scraping status if not complete */}
                    {job.scraping_status === 'pending' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-gray-700 text-gray-400">
                        Pending
                      </span>
                    )}
                    {job.scraping_status === 'scraping' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-blue-900/30 text-blue-400">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Scraping
                      </span>
                    )}
                    {job.scraping_status === 'failed' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-red-900/30 text-red-400">
                        <X className="w-3 h-3" />
                        Scrape Failed
                      </span>
                    )}

                    {/* Show indexing status if scraping is complete */}
                    {job.scraping_status === 'scraped' && job.indexing_status === 'not_indexed' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-900/30 text-green-400">
                        <Check className="w-3 h-3" />
                        Ready
                      </span>
                    )}
                    {job.scraping_status === 'scraped' && job.indexing_status === 'uploading' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-blue-900/30 text-blue-400">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Uploading
                      </span>
                    )}
                    {job.scraping_status === 'scraped' && job.indexing_status === 'indexed' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-gray-700 text-gray-400">
                        <Check className="w-3 h-3" />
                        Indexed
                      </span>
                    )}
                    {job.scraping_status === 'scraped' && job.indexing_status === 'failed' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-orange-900/30 text-orange-400">
                        <X className="w-3 h-3" />
                        Upload Failed
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {jobs.length === 0 && (
        <div className="px-6 py-16 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-lg font-semibold text-white mb-2">No pages scraped yet</h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Enter a URL above to scrape a page and convert it to markdown
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        items={selectedJobs.map(id => {
          const job = jobs.find(j => j.id === id)
          return {
            id,
            title: job ? new URL(job.url).hostname + new URL(job.url).pathname : 'Unknown'
          }
        })}
        type="scraped"
        loading={isDeleting}
      />
    </div>
  )
}
