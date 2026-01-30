'use client'

import { useState, useRef } from 'react'
import type { DragEvent } from 'react'
import { Upload, FileText, Check, X, Loader2, Trash2, ChevronDown, ChevronUp, Calendar, ExternalLink } from 'lucide-react'
import { formatDate, cn } from '@/lib/utils'
import DeleteConfirmationModal from './DeleteConfirmationModal'
import type { FileUpload } from './types'

interface FileUploadSectionProps {
  uploads: FileUpload[]
  selectedUploads: string[]
  onSelectionChange: (selected: string[]) => void
  onUploadComplete: () => void
}

interface StatusConfig {
  bg: string
  text: string
  label: string
  Icon: typeof Check
  animate?: boolean
}

const STATUS_BADGES: Record<string, StatusConfig> = {
  ready: { bg: 'bg-green-50', text: 'text-green-700', label: 'Ready to Index', Icon: Check },
  uploading: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Uploading', Icon: Loader2, animate: true },
  completed: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Live in AI', Icon: Check },
  failed: { bg: 'bg-red-50', text: 'text-red-700', label: 'Failed', Icon: X },
}

function StatusBadge({ status }: { status: string }): JSX.Element | null {
  const config = STATUS_BADGES[status]
  if (!config) return null

  const { bg, text, label, Icon, animate } = config
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full', bg, text)}>
      <Icon className={cn('w-3 h-3', animate && 'animate-spin')} />
      {label}
    </span>
  )
}

export default function FileUploadSection({
  uploads,
  selectedUploads,
  onSelectionChange,
  onUploadComplete
}: FileUploadSectionProps): JSX.Element {
  const [uploading, setUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [viewingFileId, setViewingFileId] = useState<string | null>(null)

  const readyUploads = uploads.filter(u => u.status === 'ready' || u.status === 'failed')
  const allSelected = selectedUploads.length === readyUploads.length && readyUploads.length > 0

  async function handleFileSelect(files: FileList | null): Promise<void> {
    if (!files || files.length === 0) return

    setUploading(true)

    try {
      const formData = new FormData()
      Array.from(files).forEach(file => formData.append('files', file))

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

  function handleDragOver(e: DragEvent<HTMLDivElement>): void {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>): void {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(e: DragEvent<HTMLDivElement>): void {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  function handleToggle(uploadId: string): void {
    if (selectedUploads.includes(uploadId)) {
      onSelectionChange(selectedUploads.filter(id => id !== uploadId))
    } else {
      onSelectionChange([...selectedUploads, uploadId])
    }
  }

  function handleSelectAll(): void {
    const readyUploadIds = readyUploads.map(u => u.id)
    if (allSelected) {
      onSelectionChange([])
    } else {
      onSelectionChange(readyUploadIds)
    }
  }

  async function handleDelete(): Promise<void> {
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

      onSelectionChange([])
      onUploadComplete()
    } catch (err) {
      console.error('Delete failed:', err)
    } finally {
      setIsDeleting(false)
      setIsDeleteModalOpen(false)
    }
  }

  function getDeleteModalItems(): Array<{ id: string; title: string }> {
    return selectedUploads.map(id => {
      const upload = uploads.find(u => u.id === id)
      return { id, title: upload?.filename || 'Unknown' }
    })
  }

  async function handleViewFile(uploadId: string): Promise<void> {
    setViewingFileId(uploadId)
    try {
      const response = await fetch(`/api/admin/upload-files/${uploadId}`)
      const data = await response.json()
      if (data.url) {
        window.open(data.url, '_blank')
      }
    } catch (error) {
      console.error('Failed to get file URL:', error)
    } finally {
      setViewingFileId(null)
    }
  }

  const ChevronIcon = isExpanded ? ChevronUp : ChevronDown

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full hover:bg-gray-100 transition-colors text-left -m-2 p-2 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                Uploaded Docs
                <span className="text-sm font-normal text-gray-500">
                  ({uploads.length})
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Upload text, markdown, or PDF files for the Assistant to use later
              </p>
            </div>
            <div className="flex-shrink-0 ml-4">
              <ChevronIcon className="w-6 h-6 text-gray-500" />
            </div>
          </div>
        </button>
      </div>

      {isExpanded && (
        <>
          {/* Upload Zone */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                'relative border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-colors',
                isDragging
                  ? 'border-orange-400 bg-orange-50'
                  : 'border-gray-300 hover:border-gray-400'
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.pdf"
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
                disabled={uploading}
              />

              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  {uploading ? (
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                  ) : (
                    <Upload className="w-8 h-8 text-gray-400" />
                  )}
                </div>

                <div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-lg font-semibold transition-colors"
                  >
                    {uploading ? 'Uploading...' : 'Select Files'}
                  </button>
                  <p className="text-sm text-gray-500 mt-3">
                    or drag and drop files here
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Text, Markdown, or PDF - 10MB per file - 50MB total per batch
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
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg px-6 py-2.5 font-medium transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Uploaded Files ({uploads.length})
                </h3>
                {readyUploads.length > 0 && (
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-orange-600 hover:text-orange-500 font-medium"
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
                      className={cn(
                        'flex items-center gap-4 p-4 rounded-xl border transition-colors',
                        isSelected
                          ? 'bg-orange-50 border-orange-300'
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                      )}
                    >
                      {isReady && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggle(upload.id)}
                          className="w-5 h-5 rounded border-gray-300 bg-white text-orange-500 focus:ring-2 focus:ring-orange-400 focus:ring-offset-0 cursor-pointer"
                        />
                      )}

                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-purple-700" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {upload.filename}
                          </h4>
                          <button
                            onClick={() => handleViewFile(upload.id)}
                            disabled={viewingFileId === upload.id}
                            className="flex-shrink-0 text-orange-500 hover:text-orange-600 transition-colors"
                            title="View file"
                          >
                            {viewingFileId === upload.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <ExternalLink className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          {upload.created_at && (
                            <>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(upload.created_at)}
                              </span>
                              <span>-</span>
                            </>
                          )}
                          <span>{(upload.file_size / 1024).toFixed(1)} KB</span>
                          <span>-</span>
                          <span>{upload.word_count} words</span>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        <StatusBadge status={upload.status} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        items={getDeleteModalItems()}
        type="uploaded"
        loading={isDeleting}
      />
    </div>
  )
}
