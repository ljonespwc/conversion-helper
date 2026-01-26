'use client'

import { useState } from 'react'
import { Globe, ChevronDown } from 'lucide-react'
import type { WidgetPage } from './types'

interface PageSelectorProps {
  pages: WidgetPage[]
  selectedPage: WidgetPage | null
  onPageSelect: (page: WidgetPage | null) => void
}

export default function PageSelector({
  pages,
  selectedPage,
  onPageSelect,
}: PageSelectorProps): React.ReactElement | null {
  const [isOpen, setIsOpen] = useState(false)

  if (pages.length === 0) {
    return null
  }

  function handleSelect(page: WidgetPage | null): void {
    onPageSelect(page)
    setIsOpen(false)
  }

  return (
    <div className="relative w-full sm:w-auto">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-white border border-gray-200 hover:border-orange-400 rounded-lg px-4 py-3 w-full sm:min-w-[250px] transition-colors"
      >
        <Globe className="w-5 h-5 text-orange-500 flex-shrink-0" />
        <div className="flex-1 text-left min-w-0">
          <p className="text-xs text-gray-500">Viewing Stats For:</p>
          <p className="text-sm font-medium text-gray-900 truncate">
            {selectedPage ? selectedPage.page_title : 'All Pages'}
          </p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-full sm:min-w-[300px] bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-[300px] overflow-y-auto">
          <button
            onClick={() => handleSelect(null)}
            className={`w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors border-b border-gray-200 ${
              !selectedPage ? 'bg-orange-50' : ''
            }`}
          >
            <p className="text-sm font-medium text-gray-900">All Pages</p>
            <p className="text-xs text-gray-500 mt-1">
              View combined stats from all assistant pages
            </p>
          </button>

          {pages.map((page) => (
            <button
              key={page.id}
              onClick={() => handleSelect(page)}
              className={`w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors border-b border-gray-200 last:border-b-0 ${
                selectedPage?.id === page.id ? 'bg-orange-50' : ''
              }`}
            >
              <p className="text-sm font-medium text-gray-900">{page.page_title}</p>
              <p className="text-xs text-gray-500 mt-1 truncate">{page.page_url}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
