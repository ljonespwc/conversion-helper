'use client'

import { useState } from 'react'

export default function BookmarkletPage() {
  const [copied, setCopied] = useState(false)

  // Bookmarklet code that injects the widget
  const bookmarkletCode = `javascript:(function(){if(window.easyaskWidgetLoaded){alert('Widget already loaded');return;}const s=document.createElement('script');s.src='https://easyask.io/widget.js';document.head.appendChild(s);})();`

  const handleCopy = () => {
    navigator.clipboard.writeText(bookmarkletCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">EasyAsk Bookmarklet Demo Tool</h1>
          <p className="text-gray-300 text-lg">
            Add the EasyAsk voice widget to any website with a single click - perfect for demos and testing.
          </p>
        </div>

        {/* Installation Instructions */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20">
          <h2 className="text-2xl font-semibold mb-6">How to Install</h2>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Drag to bookmark bar</h3>
                <p className="text-gray-300 mb-3">
                  Make sure your browser's bookmark bar is visible, then drag this button to it:
                </p>
                <a
                  href={bookmarkletCode}
                  className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all cursor-move border-2 border-white/30"
                  onClick={(e) => e.preventDefault()}
                >
                  🎙️ EasyAsk Widget
                </a>
                <p className="text-sm text-gray-400 mt-2">
                  ⚠️ Don't click - drag this to your bookmark bar!
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Visit any website</h3>
                <p className="text-gray-300">
                  Go to any webpage you want to demo the widget on (e.g., hubermanlab.com, your client's site, etc.)
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Click the bookmark</h3>
                <p className="text-gray-300">
                  Click the "EasyAsk Widget" bookmark you just created. The widget will appear on the page!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Alternative: Copy Code */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold mb-4">Can't drag? Copy the code instead</h2>
          <p className="text-gray-300 mb-4">
            Create a new bookmark manually and paste this code as the URL:
          </p>

          <div className="relative">
            <pre className="bg-black/50 rounded-lg p-4 overflow-x-auto text-sm mb-4 border border-white/10">
              <code className="text-blue-300">{bookmarkletCode}</code>
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>

          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mt-4">
            <p className="text-sm text-yellow-200">
              <strong>Note:</strong> Some browsers (Safari) may strip the <code>javascript:</code> prefix when you paste.
              Make sure the bookmark URL starts with <code>javascript:</code>
            </p>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold mb-4">Perfect for:</h2>
          <ul className="space-y-2 text-gray-300">
            <li>✓ Demoing to clients on their live website</li>
            <li>✓ Testing on sites that block iframe embedding (like hubermanlab.com)</li>
            <li>✓ Quick internal testing without deployment</li>
            <li>✓ Showing the widget on competitor sites</li>
            <li>✓ Sales presentations and pitches</li>
          </ul>
        </div>

        {/* How It Works */}
        <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold mb-4">How it works</h2>
          <p className="text-gray-300 mb-4">
            The bookmarklet injects the EasyAsk widget script onto whatever page you're viewing.
            The widget will automatically use the current page's URL to fetch relevant content from your configured widget pages.
          </p>
          <p className="text-sm text-gray-400">
            <strong>Technical note:</strong> The widget must be configured in your EasyAsk admin for the page URL you're testing.
            If no configuration exists for that URL, the widget will show but may not have page-specific content.
          </p>
        </div>
      </div>
    </div>
  )
}
