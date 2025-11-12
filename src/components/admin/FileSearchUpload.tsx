'use client'

import { useState } from 'react'
import { Upload, Check, Loader2 } from 'lucide-react'

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

  const totalSelected = selectedJobs.length + selectedUploads.length

  const handleUpload = async () => {
    if (totalSelected === 0) return

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
          uploadIds: selectedUploads
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
    <div className="bg-gray-800 rounded-3xl shadow-xl border border-gray-700 p-6">
      <h2 className="text-xl font-bold text-white mb-4">Upload to File Search</h2>
      <p className="text-gray-300 mb-6">
        Upload selected pages to Google File Search for AI-powered Q&A
      </p>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {success && stats && (
        <div className="bg-green-900/30 border border-green-700 text-green-400 px-4 py-3 rounded-lg text-sm mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Check className="w-5 h-5" />
            <span className="font-medium">Upload Complete!</span>
          </div>
          <ul className="text-sm space-y-1 ml-7">
            <li>Total: {stats.total}</li>
            <li>Successful: {stats.successful}</li>
            {stats.failed > 0 && <li>Failed: {stats.failed}</li>}
          </ul>
        </div>
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
