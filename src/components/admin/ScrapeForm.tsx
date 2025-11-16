'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

interface ScrapeFormProps {
  onScrapeStarted: () => void
}

export default function ScrapeForm({ onScrapeStarted }: ScrapeFormProps) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!url) {
      setError('Please enter a URL')
      return
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      setError('Please enter a valid URL')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/admin/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start scraping')
      }

      setUrl('')
      onScrapeStarted()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start scraping')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-800 rounded-3xl shadow-xl border border-gray-700 p-6">
      <h2 className="text-xl font-bold text-white mb-4">Scrape New Page</h2>
      <p className="text-gray-300 mb-4">Enter a URL to scrape and convert to markdown (5MB max, 30s timeout)</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-2">
            Page URL
          </label>
          <input
            type="text"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/page"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
            disabled={loading}
          />
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg px-6 py-2.5 font-medium transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          {loading ? 'Scraping...' : 'Scrape Page'}
        </button>
      </form>
    </div>
  )
}
