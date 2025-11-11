'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/Header'
import ScrapeForm from '@/components/admin/ScrapeForm'
import ScrapedPagesList from '@/components/admin/ScrapedPagesList'
import FileSearchUpload from '@/components/admin/FileSearchUpload'

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

export default function ContentManagementPage() {
  const [jobs, setJobs] = useState<ScrapingJob[]>([])
  const [selectedJobs, setSelectedJobs] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [polling, setPolling] = useState(false)
  const [user, setUser] = useState<{ email?: string | null; id: string } | null>(null)

  useEffect(() => {
    checkUser()
    fetchJobs()
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
      }, 2000) // Poll every 2 seconds

      return () => {
        clearInterval(interval)
        setPolling(false)
      }
    } else if (!hasActiveJobs && polling) {
      setPolling(false)
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

  const handleScrapeStarted = () => {
    // Refresh jobs list after starting a scrape
    fetchJobs()
  }

  const handleUploadComplete = () => {
    // Refresh jobs list and clear selection after upload
    setSelectedJobs([])
    fetchJobs()
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

        {/* Upload to File Search */}
        <FileSearchUpload
          selectedJobs={selectedJobs}
          onUploadComplete={handleUploadComplete}
        />
      </div>
    </div>
  )
}
