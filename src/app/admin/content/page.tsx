'use client'

import { useEffect, useState } from 'react'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { signOut } from '../../login/actions'
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
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    checkUser()
    fetchJobs()
  }, [])

  const checkUser = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUserEmail(user.email || null)
    }
  }

  const handleSignOut = async () => {
    await signOut()
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
            <p className="text-gray-600 mt-2">Scrape pages and manage File Search content</p>
          </div>
          {userEmail && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Signed in as</p>
                <p className="text-sm font-medium text-gray-900">{userEmail}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Scrape Form */}
        <div className="mb-8">
          <ScrapeForm onScrapeStarted={handleScrapeStarted} />
        </div>

        {/* Scraped Pages List */}
        <div className="mb-8">
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500">Loading scraped pages...</p>
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
