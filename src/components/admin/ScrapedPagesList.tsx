'use client'

import { Check, Loader2, X, FileText } from 'lucide-react'

interface ScrapingJob {
  id: string
  url: string
  status: string
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
}

export default function ScrapedPagesList({
  jobs,
  selectedJobs,
  onSelectionChange
}: ScrapedPagesListProps) {
  const handleToggle = (jobId: string) => {
    if (selectedJobs.includes(jobId)) {
      onSelectionChange(selectedJobs.filter(id => id !== jobId))
    } else {
      onSelectionChange([...selectedJobs, jobId])
    }
  }

  const handleSelectAll = () => {
    const scrapedJobIds = jobs.filter(j => j.status === 'scraped').map(j => j.id)
    if (selectedJobs.length === scrapedJobIds.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(scrapedJobIds)
    }
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '-'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatNumber = (num: number | null) => {
    if (!num) return '-'
    return num.toLocaleString()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'scraping':
      case 'uploading':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      case 'scraped':
      case 'completed':
        return <Check className="w-5 h-5 text-green-500" />
      case 'failed':
        return <X className="w-5 h-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'Pending',
      scraping: 'Scraping...',
      scraped: 'Scraped',
      uploading: 'Uploading...',
      completed: 'Completed',
      failed: 'Failed'
    }
    return statusMap[status] || status
  }

  return (
    <div className="bg-gray-800 rounded-3xl shadow-xl border border-gray-700">
      <div className="p-6 border-b border-gray-700 bg-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Scraped Pages</h2>
            <p className="text-gray-400 text-sm mt-1">
              {jobs.length} total · {jobs.filter(j => j.status === 'scraped').length} ready to upload
            </p>
          </div>
          <button
            onClick={handleSelectAll}
            className="text-sm text-blue-400 hover:text-blue-300 font-medium"
          >
            {selectedJobs.length > 0 ? 'Deselect All' : 'Select All Ready'}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900 border-b border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-12">

              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                URL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Words
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                  <p>No pages scraped yet</p>
                  <p className="text-sm mt-1">Enter a URL above to get started</p>
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    {job.status === 'scraped' && (
                      <input
                        type="checkbox"
                        checked={selectedJobs.includes(job.id)}
                        onChange={() => handleToggle(job.id)}
                        className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(job.status)}
                      <span className="text-sm font-medium text-gray-200">
                        {getStatusText(job.status)}
                      </span>
                    </div>
                    {job.error_message && (
                      <p className="text-xs text-red-400 mt-1">{job.error_message}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:underline truncate max-w-md block"
                    >
                      {job.url}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {formatFileSize(job.file_size)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {formatNumber(job.word_count)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
