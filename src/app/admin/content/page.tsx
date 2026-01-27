'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/Header'
import ScrapedPagesList from '@/components/admin/ScrapedPagesList'
import FileUploadSection from '@/components/admin/FileUploadSection'
import FileSearchUpload from '@/components/admin/FileSearchUpload'
import IndexedPagesSection from '@/components/admin/IndexedPagesSection'
import type { ScrapingJob, FileUpload, IndexedPage, WidgetPage } from '@/components/admin/types'

export const dynamic = 'force-dynamic'

interface User {
  id: string
  email?: string | null
}

export default function ContentManagementPage(): React.ReactElement {
  const [jobs, setJobs] = useState<ScrapingJob[]>([])
  const [selectedJobs, setSelectedJobs] = useState<string[]>([])
  const [uploads, setUploads] = useState<FileUpload[]>([])
  const [selectedUploads, setSelectedUploads] = useState<string[]>([])
  const [indexedPages, setIndexedPages] = useState<IndexedPage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadsLoading, setUploadsLoading] = useState(true)
  const [indexedPagesLoading, setIndexedPagesLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [widgetPagesMap, setWidgetPagesMap] = useState<Record<string, string>>({})

  const fetchJobs = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/scraping-jobs')
      const data = await response.json()
      setJobs(data.jobs || [])
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchUploads = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/upload-files')
      const data = await response.json()
      setUploads(data.uploads || [])
    } catch (error) {
      console.error('Failed to fetch uploads:', error)
    } finally {
      setUploadsLoading(false)
    }
  }, [])

  const fetchIndexedPages = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/indexed-pages')
      const data = await response.json()
      setIndexedPages(data.pages || [])
    } catch (error) {
      console.error('Failed to fetch indexed pages:', error)
    } finally {
      setIndexedPagesLoading(false)
    }
  }, [])

  const fetchWidgetPages = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/widget-pages')
      const data = await response.json()
      const map: Record<string, string> = {}
      data.pages?.forEach((page: WidgetPage) => {
        map[page.page_url] = page.page_title
      })
      setWidgetPagesMap(map)
    } catch (error) {
      console.error('Failed to fetch widget pages:', error)
    }
  }, [])

  useEffect(() => {
    async function checkUser(): Promise<void> {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        setUser({ id: authUser.id, email: authUser.email })
      }
    }

    checkUser()
    fetchJobs()
    fetchUploads()
    fetchIndexedPages()
    fetchWidgetPages()
  }, [fetchJobs, fetchUploads, fetchIndexedPages, fetchWidgetPages])

  const hasActiveJobs = useMemo(() => {
    return jobs.some(job => ['pending', 'scraping', 'uploading'].includes(job.status))
  }, [jobs])

  useEffect(() => {
    if (!hasActiveJobs) return

    const interval = setInterval(fetchJobs, 3000)
    return () => clearInterval(interval)
  }, [hasActiveJobs, fetchJobs])

  function handleScrapeStarted(): void {
    fetchJobs()
  }

  function handleUploadComplete(): void {
    setSelectedJobs([])
    setSelectedUploads([])
    fetchJobs()
    fetchUploads()
    fetchIndexedPages()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">AI Assistant Knowledgebase</h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">
            Scrape pages, upload files, and manage content for the AI Assistant
          </p>
        </div>

        <IndexedPagesSection
          pages={indexedPages}
          loading={indexedPagesLoading}
          widgetPagesMap={widgetPagesMap}
          onRefresh={fetchIndexedPages}
        />

        <div className="mb-8">
          {loading ? (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-12 text-center">
              <p className="text-gray-500">Loading scraped pages...</p>
            </div>
          ) : (
            <ScrapedPagesList
              jobs={jobs}
              selectedJobs={selectedJobs}
              onSelectionChange={setSelectedJobs}
              onScrapeStarted={handleScrapeStarted}
            />
          )}
        </div>

        <div className="mb-8">
          {uploadsLoading ? (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-12 text-center">
              <p className="text-gray-500">Loading uploaded files...</p>
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

        <div className="sticky bottom-0 z-10 pt-4 pb-4 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent">
          <FileSearchUpload
            selectedJobs={selectedJobs}
            selectedUploads={selectedUploads}
            onUploadComplete={handleUploadComplete}
          />
        </div>
      </div>
    </div>
  )
}
