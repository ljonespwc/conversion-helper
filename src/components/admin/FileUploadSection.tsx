'use client'

import { useState, useRef, DragEvent } from 'react'
import { Upload, FileText, Check, X, Loader2, Trash2 } from 'lucide-react'
import DeleteConfirmationModal from './DeleteConfirmationModal'

interface FileUpload {
  id: string
  filename: string
  file_path: string
  file_size: number
  word_count: number
  status: string
  created_at: string
}

interface FileUploadSectionProps {
  uploads: FileUpload[]
  selectedUploads: string[]
  onSelectionChange: (selected: string[]) => void
  onUploadComplete: () => void
}

export default function FileUploadSection({
  uploads,
  selectedUploads,
  onSelectionChange,
  onUploadComplete
}: FileUploadSectionProps) {
  const [uploading, setUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploading(true)

    try {
      const formData = new FormData()
      Array.from(files).forEach(file => {
        formData.append('files', file)
      })

      const response = await fetch('/api/admin/upload-files', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        onUploadComplete()
      }
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleToggle = (uploadId: string) => {
    if (selectedUploads.includes(uploadId)) {
      onSelectionChange(selectedUploads.filter(id => id !== uploadId))
    } else {
      onSelectionChange([...selectedUploads, uploadId])
    }
  }

  const handleSelectAll = () => {
    const readyUploadIds = uploads.filter(u => u.status === 'ready' || u.status === 'failed').map(u => u.id)
    if (selectedUploads.length === readyUploadIds.length && readyUploadIds.length > 0) {
      onSelectionChange([])
    } else {
      onSelectionChange(readyUploadIds)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const response = await fetch('/api/admin/upload-files', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadIds: selectedUploads })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete uploads')
      }

      // Clear selections and refresh list
      onSelectionChange([])
      onUploadComplete()
      setIsDeleteModalOpen(false)
    } catch (err) {
      console.error('Delete failed:', err)
      setIsDeleteModalOpen(false)
    } finally {
      setIsDeleting(false)
    }
  }

  const readyUploads = uploads.filter(u => u.status === 'ready' || u.status === 'failed')
  const allSelected = selectedUploads.length === readyUploads.length && readyUploads.length > 0

  return (
    <div className="bg-gray-800 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-700 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-700 bg-gray-900">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-2">Uploaded Docs</h2>
        <p className="text-xs sm:text-sm text-gray-400">Upload .txt or .md files from your computer</p>
      </div>

      {/* Upload Zone */}
      <div className="p-4 sm:p-6 border-b border-gray-700">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-colors ${
            isDragging
              ? 'border-blue-400 bg-blue-900/20'
              : 'border-gray-600 hover:border-gray-500'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            disabled={uploading}
          />

          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
              {uploading ? (
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              ) : (
                <Upload className="w-8 h-8 text-gray-400" />
              )}
            </div>

            <div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-semibold transition-colors"
              >
                {uploading ? 'Uploading...' : 'Select Files'}
              </button>
              <p className="text-sm text-gray-400 mt-3">
                or drag and drop files here
              </p>
              <p className="text-xs text-gray-500 mt-1">
                .txt or .md files up to 10MB
              </p>
            </div>
          </div>
        </div>

        {/* Delete Selected Button */}
        {selectedUploads.length > 0 && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={uploading || isDeleting}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg px-6 py-2.5 font-medium transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-5 h-5" />
              Delete Selected ({selectedUploads.length})
            </button>
          </div>
        )}
      </div>

      {/* Uploaded Files List */}
      {uploads.length > 0 && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
              Uploaded Files ({uploads.length})
            </h3>
            {readyUploads.length > 0 && (
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-400 hover:text-blue-300 font-medium"
              >
                {allSelected ? 'Deselect All' : 'Select All Ready'}
              </button>
            )}
          </div>

          <div className="space-y-2">
            {uploads.map((upload) => {
              const isReady = upload.status === 'ready' || upload.status === 'failed'
              const isSelected = selectedUploads.includes(upload.id)

              return (
                <div
                  key={upload.id}
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
                      onChange={() => handleToggle(upload.id)}
                      className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                    />
                  )}

                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-purple-900/30 border border-purple-700/50 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-purple-400" />
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate">
                      {upload.filename}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span>{(upload.file_size / 1024).toFixed(1)} KB</span>
                      <span>•</span>
                      <span>{upload.word_count} words</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0">
                    {upload.status === 'ready' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-900/30 text-green-400">
                        <Check className="w-3 h-3" />
                        Ready
                      </span>
                    )}
                    {upload.status === 'uploading' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-blue-900/30 text-blue-400">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Uploading
                      </span>
                    )}
                    {upload.status === 'completed' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-gray-700 text-gray-400">
                        <Check className="w-3 h-3" />
                        Completed
                      </span>
                    )}
                    {upload.status === 'failed' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-red-900/30 text-red-400">
                        <X className="w-3 h-3" />
                        Failed
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        items={selectedUploads.map(id => {
          const upload = uploads.find(u => u.id === id)
          return {
            id,
            title: upload?.filename || 'Unknown'
          }
        })}
        type="uploaded"
        loading={isDeleting}
      />
    </div>
  )
}
