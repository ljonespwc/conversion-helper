'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Loader2, X } from 'lucide-react'

interface DeleteItem {
  id: string
  title: string
}

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  items: DeleteItem[]
  type: 'scraped' | 'uploaded' | 'indexed' | 'mixed'
  loading?: boolean
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  items,
  type,
  loading = false
}: DeleteConfirmationModalProps) {
  const getWarningText = () => {
    switch (type) {
      case 'scraped':
        return 'This will permanently delete the selected pages from Storage, database, and Google File Search (if indexed). This action cannot be undone.'
      case 'uploaded':
        return 'This will permanently delete the selected files from Storage, database, and Google File Search (if indexed). This action cannot be undone.'
      case 'indexed':
        return 'This will permanently delete the selected documents from Google File Search (including all chunks) and the registry. This action cannot be undone.'
      case 'mixed':
        return 'This will permanently delete the selected items from Storage, database, and Google File Search (where applicable). This action cannot be undone.'
    }
  }

  const getTypeLabel = () => {
    switch (type) {
      case 'scraped':
        return 'scraped page'
      case 'uploaded':
        return 'uploaded file'
      case 'indexed':
        return 'indexed document'
      case 'mixed':
        return 'item'
    }
  }

  const handleConfirm = async () => {
    await onConfirm()
  }

  const displayItems = items.slice(0, 5)
  const remainingCount = items.length - displayItems.length

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-gray-200 rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Confirm Deletion
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {items.length} {getTypeLabel()}{items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Warning */}
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">
                  {getWarningText()}
                </p>
              </div>

              {/* Items List */}
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Items to be deleted:
                </p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {displayItems.map((item) => (
                    <div
                      key={item.id}
                      className="text-sm text-gray-500 truncate px-2 py-1 bg-gray-50 rounded"
                    >
                      {item.title}
                    </div>
                  ))}
                  {remainingCount > 0 && (
                    <div className="text-sm text-gray-500 px-2 py-1">
                      ...and {remainingCount} more
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Permanently'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
