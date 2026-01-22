'use client'

import { useState } from 'react'
import { Check, Loader2, X, FileText, Globe, Plus, Trash2, ChevronDown, ChevronUp, Calendar } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import DeleteConfirmationModal from './DeleteConfirmationModal'
import type { ScrapingJob } from './types'

interface ScrapedPagesListProps {
  jobs: ScrapingJob[]
  selectedJobs: string[]
  onSelectionChange: (jobIds: string[]) => void
  onScrapeStarted: () => void
}

type StatusBadgeConfig = {
  label: string
  bgClass: string
  textClass: string
  icon?: 'loader' | 'check' | 'x'
}

function getDisplayUrl(url: string): string {
  const urlObj = new URL(url)
  return urlObj.hostname + urlObj.pathname
}

function isJobReady(job: ScrapingJob): boolean {
  return job.scraping_status === 'scraped' && ['not_indexed', 'failed'].includes(job.indexing_status)
}

function getStatusBadge(job: ScrapingJob): StatusBadgeConfig | null {
  const { scraping_status, indexing_status } = job

  if (scraping_status === 'pending') {
    return { label: 'Pending', bgClass: 'bg-gray-700', textClass: 'text-gray-400' }
  }
  if (scraping_status === 'scraping') {
    return { label: 'Scraping', bgClass: 'bg-blue-900/30', textClass: 'text-blue-400', icon: 'loader' }
  }
  if (scraping_status === 'failed') {
    return { label: 'Scrape Failed', bgClass: 'bg-red-900/30', textClass: 'text-red-400', icon: 'x' }
  }

  if (scraping_status === 'scraped') {
    switch (indexing_status) {
      case 'not_indexed':
        return { label: 'Ready to Index', bgClass: 'bg-green-900/30', textClass: 'text-green-400', icon: 'check' }
      case 'uploading':
        return { label: 'Uploading', bgClass: 'bg-blue-900/30', textClass: 'text-blue-400', icon: 'loader' }
      case 'indexed':
        return { label: 'Live in AI', bgClass: 'bg-purple-900/30', textClass: 'text-purple-400', icon: 'check' }
      case 'failed':
        return { label: 'Upload Failed', bgClass: 'bg-orange-900/30', textClass: 'text-orange-400', icon: 'x' }
    }
  }

  return null
}

function StatusBadge({ config }: { config: StatusBadgeConfig }): React.ReactElement {
  const iconMap = {
    loader: <Loader2 className="w-3 h-3 animate-spin" />,
    check: <Check className="w-3 h-3" />,
    x: <X className="w-3 h-3" />,
  }

  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full', config.bgClass, config.textClass)}>
      {config.icon && iconMap[config.icon]}
      {config.label}
    </span>
  )
}

export default function ScrapedPagesList({
  jobs,
  selectedJobs,
  onSelectionChange,
  onScrapeStarted
}: ScrapedPagesListProps): React.ReactElement {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const readyJobs = jobs.filter(isJobReady)
  const allSelected = selectedJobs.length === readyJobs.length && readyJobs.length > 0

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    setError('')

    if (!url) {
      setError('Please enter a URL')
      return
    }

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

  function handleToggle(jobId: string): void {
    if (selectedJobs.includes(jobId)) {
      onSelectionChange(selectedJobs.filter(id => id !== jobId))
    } else {
      onSelectionChange([...selectedJobs, jobId])
    }
  }

  function handleSelectAll(): void {
    const readyJobIds = readyJobs.map(j => j.id)
    onSelectionChange(allSelected ? [] : readyJobIds)
  }

  async function handleDelete(): Promise<void> {
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

      onSelectionChange([])
      onScrapeStarted()
      setIsDeleteModalOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete jobs')
      setIsDeleteModalOpen(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="bg-gray-800 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-700 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-700 bg-gray-900">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full hover:bg-gray-800/50 transition-colors text-left -m-2 p-2 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                Scraped Pages
                <span className="text-sm font-normal text-gray-400">
                  ({jobs.length})
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">Enter a URL to scrape for the Assistant to use later</p>
            </div>
            <div className="flex-shrink-0 ml-4">
              {isExpanded ? (
                <ChevronUp className="w-6 h-6 text-gray-400" />
              ) : (
                <ChevronDown className="w-6 h-6 text-gray-400" />
              )}
            </div>
          </div>
        </button>
      </div>

      {isExpanded && (
        <>
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
                  const isReady = isJobReady(job)
                  const isSelected = selectedJobs.includes(job.id)
                  const displayUrl = getDisplayUrl(job.url)
                  const statusBadge = getStatusBadge(job)

                  return (
                    <div
                      key={job.id}
                      className={cn(
                        'flex items-center gap-4 p-4 rounded-xl border transition-colors',
                        isSelected
                          ? 'bg-blue-900/20 border-blue-700'
                          : 'bg-gray-900/50 border-gray-700 hover:border-gray-600'
                      )}
                    >
                      {isReady && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggle(job.id)}
                          className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                        />
                      )}

                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-lg bg-purple-900/30 border border-purple-700/50 flex items-center justify-center">
                          <Globe className="w-5 h-5 text-purple-400" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white truncate">
                          {displayUrl}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          {job.created_at && (
                            <>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(job.created_at)}
                              </span>
                              <span>•</span>
                            </>
                          )}
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

                      <div className="flex-shrink-0">
                        {statusBadge && <StatusBadge config={statusBadge} />}
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
        </>
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        items={selectedJobs.map(id => {
          const job = jobs.find(j => j.id === id)
          return {
            id,
            title: job ? getDisplayUrl(job.url) : 'Unknown'
          }
        })}
        type="scraped"
        loading={isDeleting}
      />
    </div>
  )
}
