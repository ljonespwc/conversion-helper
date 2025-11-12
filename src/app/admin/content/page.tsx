'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/Header'
import ScrapeForm from '@/components/admin/ScrapeForm'
import ScrapedPagesList from '@/components/admin/ScrapedPagesList'
import FileUploadSection from '@/components/admin/FileUploadSection'
import FileSearchUpload from '@/components/admin/FileSearchUpload'
import { FileText, ExternalLink, Calendar, ChevronDown, ChevronUp } from 'lucide-react'

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

interface FileUpload {
  id: string
  filename: string
  file_path: string
  file_size: number
  word_count: number
  status: string
  created_at: string
  completed_at: string | null
}

interface IndexedPage {
  id: string
  page_url: string
  page_title: string | null
  document_id: string
  file_search_store_name: string
  status: string
  synced_to_file_search: boolean
  source_type: 'scraped' | 'uploaded'
  created_at: string
  updated_at: string
  metadata: any
}

export default function ContentManagementPage() {
  const [jobs, setJobs] = useState<ScrapingJob[]>([])
  const [selectedJobs, setSelectedJobs] = useState<string[]>([])
  const [uploads, setUploads] = useState<FileUpload[]>([])
  const [selectedUploads, setSelectedUploads] = useState<string[]>([])
  const [indexedPages, setIndexedPages] = useState<IndexedPage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadsLoading, setUploadsLoading] = useState(true)
  const [indexedPagesLoading, setIndexedPagesLoading] = useState(true)
  const [polling, setPolling] = useState(false)
  const [isIndexedSectionExpanded, setIsIndexedSectionExpanded] = useState(false)
  const [user, setUser] = useState<{ email?: string | null; id: string } | null>(null)

  useEffect(() => {
    checkUser()
    fetchJobs()
    fetchUploads()
    fetchIndexedPages()
  }, [])

  const checkUser = async () => {
    const supabase = createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (authUser) {
      setUser({ id: authUser.id, email: authUser.email })
    }
  }

  // Poll for updates while jobs are in progress
  useEffect(() => {
    const hasActiveJobs = jobs.some(job =>
      ['pending', 'scraping', 'uploading'].includes(job.status)
    )

    if (hasActiveJobs && !polling) {
      setPolling(true)
      const interval = setInterval(() => {
        fetchJobs()
      }, 3000)

      return () => {
        clearInterval(interval)
        setPolling(false)
      }
    }
  }, [jobs, polling])

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/admin/scraping-jobs')
      const data = await response.json()
      setJobs(data.jobs || [])
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUploads = async () => {
    try {
      const response = await fetch('/api/admin/upload-files')
      const data = await response.json()
      setUploads(data.uploads || [])
    } catch (error) {
      console.error('Failed to fetch uploads:', error)
    } finally {
      setUploadsLoading(false)
    }
  }

  const fetchIndexedPages = async () => {
    try {
      const response = await fetch('/api/admin/indexed-pages')
      const data = await response.json()
      setIndexedPages(data.pages || [])
    } catch (error) {
      console.error('Failed to fetch indexed pages:', error)
    } finally {
      setIndexedPagesLoading(false)
    }
  }

  const handleScrapeStarted = () => {
    fetchJobs()
  }

  const handleUploadComplete = () => {
    // Refresh all lists after upload
    setSelectedJobs([])
    setSelectedUploads([])
    fetchJobs()
    fetchUploads()
    fetchIndexedPages()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Content Management</h1>
          <p className="text-gray-400 mt-2">Scrape pages and manage File Search content</p>
        </div>

        {/* Scrape Form */}
        <div className="mb-8">
          <ScrapeForm onScrapeStarted={handleScrapeStarted} />
        </div>

        {/* Scraped Pages List */}
        <div className="mb-8">
          {loading ? (
            <div className="bg-gray-800 rounded-3xl shadow-xl border border-gray-700 p-12 text-center">
              <p className="text-gray-400">Loading scraped pages...</p>
            </div>
          ) : (
            <ScrapedPagesList
              jobs={jobs}
              selectedJobs={selectedJobs}
              onSelectionChange={setSelectedJobs}
            />
          )}
        </div>

        {/* Uploaded Docs */}
        <div className="mb-8">
          {uploadsLoading ? (
            <div className="bg-gray-800 rounded-3xl shadow-xl border border-gray-700 p-12 text-center">
              <p className="text-gray-400">Loading uploaded files...</p>
            </div>
          ) : (
            <FileUploadSection
              uploads={uploads}
              selectedUploads={selectedUploads}
              onSelectionChange={setSelectedUploads}
              onUploadComplete={handleUploadComplete}
            />
          )}
        </div>

        {/* File Search Upload */}
        <div className="mb-8">
          <FileSearchUpload
            selectedJobs={selectedJobs}
            selectedUploads={selectedUploads}
            onUploadComplete={handleUploadComplete}
          />
        </div>

        {/* Currently Indexed Documents - Collapsible */}
        <div className="bg-gray-800 rounded-3xl shadow-xl border border-gray-700 overflow-hidden">
          <button
            onClick={() => setIsIndexedSectionExpanded(!isIndexedSectionExpanded)}
            className="w-full p-6 border-b border-gray-700 bg-gray-900 hover:bg-gray-800/50 transition-colors text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Currently Indexed Documents
                  {!indexedPagesLoading && (
                    <span className="text-sm font-normal text-gray-400">
                      ({indexedPages.length} in registry)
                    </span>
                  )}
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Documents in Supabase registry with sync status to Google File Search
                </p>
              </div>
              <div className="flex-shrink-0 ml-4">
                {isIndexedSectionExpanded ? (
                  <ChevronUp className="w-6 h-6 text-gray-400" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-400" />
                )}
              </div>
            </div>
          </button>

          {isIndexedSectionExpanded && (
            <>
              {indexedPagesLoading ? (
                <div className="px-6 py-12 text-center text-gray-400">
                  Loading indexed documents...
                </div>
              ) : indexedPages.length > 0 ? (
                <div className="divide-y divide-gray-700">
                  {indexedPages.map((page) => {
                    const isSynced = page.synced_to_file_search

                    return (
                      <div key={page.id} className="px-6 py-5 hover:bg-gray-700/50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                              <FileText className="w-5 h-5 text-blue-400 flex-shrink-0" />
                              <span className="truncate">{page.page_title || 'Untitled'}</span>
                            </h3>

                            {page.source_type === 'uploaded' ? (
                              <div className="mb-3">
                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-purple-900/30 text-purple-400 border border-purple-700/50">
                                  <FileText className="w-3 h-3" />
                                  Uploaded File
                                </span>
                              </div>
                            ) : (
                              <a
                                href={page.page_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 mb-3"
                              >
                                <span className="truncate">{page.page_url}</span>
                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                              </a>
                            )}

                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>Added {formatDate(page.created_at)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                                  isSynced
                                    ? 'bg-green-900/30 text-green-400'
                                    : 'bg-yellow-900/30 text-yellow-400'
                                }`}>
                                  {isSynced ? 'synced' : 'pending'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex-shrink-0">
                            <div className="text-right">
                              <p className="text-xs text-gray-500 mb-1">Document ID</p>
                              <p className="text-xs font-mono text-gray-400 max-w-[200px] truncate">
                                {page.document_id.split('/').pop()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="px-6 py-16 text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <h3 className="text-lg font-semibold text-white mb-2">No documents indexed yet</h3>
                  <p className="text-gray-400 text-sm max-w-md mx-auto">
                    Documents uploaded to Google File Search will appear here. Scrape and upload pages above to get started.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
