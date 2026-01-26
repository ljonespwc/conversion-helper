'use client'

import { Archive } from 'lucide-react'

interface ArchiveConfirmModalProps {
  selectedCount: number
  isArchiving: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ArchiveConfirmModal({
  selectedCount,
  isArchiving,
  onConfirm,
  onCancel,
}: ArchiveConfirmModalProps): React.ReactElement {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Archive Conversations</h3>
        <p className="text-gray-600 mb-4">
          Archive {selectedCount} conversation{selectedCount !== 1 ? 's' : ''}?
        </p>
        <p className="text-sm text-gray-500 mb-6">
          This will hide them from the dashboard. Any unresolved escalations will
          be automatically marked as resolved.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isArchiving}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isArchiving}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isArchiving ? (
              <>
                <span className="animate-spin">&#8987;</span>
                Archiving...
              </>
            ) : (
              <>
                <Archive className="w-4 h-4" />
                Archive
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
