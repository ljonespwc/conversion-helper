'use client'

import { useState } from 'react'
import { Upload, Check, Loader2 } from 'lucide-react'

interface FileSearchUploadProps {
  selectedJobs: string[]
  onUploadComplete: () => void
}

export default function FileSearchUpload({
  selectedJobs,
  onUploadComplete
}: FileSearchUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [stats, setStats] = useState<{ total: number; successful: number; failed: number } | null>(null)

  const handleUpload = async () => {
    if (selectedJobs.length === 0) return

    setError('')
    setSuccess(false)
    setStats(null)
    setUploading(true)

    try {
      const response = await fetch('/api/admin/upload-to-file-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobIds: selectedJobs })
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Upload to File Search</h2>
      <p className="text-gray-600 mb-6">
        Upload selected pages to Google File Search for AI-powered Q&A
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {success && stats && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm mb-4">
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
          disabled={uploading || selectedJobs.length === 0}
          className="bg-[#00AFEF] text-white rounded-lg px-6 py-2.5 font-medium hover:bg-[#0099D4] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading {selectedJobs.length} page{selectedJobs.length !== 1 ? 's' : ''}...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Upload {selectedJobs.length} Selected
            </>
          )}
        </button>

        {selectedJobs.length === 0 && (
          <p className="text-sm text-gray-500">
            Select pages above to upload
          </p>
        )}
      </div>
    </div>
  )
}
