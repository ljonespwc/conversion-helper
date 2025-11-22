'use client'

import { useState } from 'react'

export default function BookmarkletPage() {
  const [copied, setCopied] = useState(false)
  const [consoleCopied, setConsoleCopied] = useState(false)

  // Bookmarklet code that injects the widget
  const bookmarkletCode = `javascript:(function(){if(window.easyaskWidgetLoaded){alert('Widget already loaded');return;}const s=document.createElement('script');s.src='https://easyask.io/widget.js';document.head.appendChild(s);})();`

  // Console code for sites with strict CSP
  const consoleCode = `(function() {
  if (window.easyaskWidgetLoaded) {
    alert('Widget already loaded');
    return;
  }
  window.easyaskWidgetLoaded = true;

  const WIDGET_HOST = 'https://easyask.io';
  const currentPageUrl = encodeURIComponent(window.location.href);

  const iframe = document.createElement('iframe');
  iframe.id = 'easyask-widget-frame';
  iframe.src = \`\${WIDGET_HOST}/widget-embed?url=\${currentPageUrl}\`;
  iframe.style.cssText = \`
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    border: none !important;
    z-index: 2147483647 !important;
    background: transparent !important;
  \`;

  document.body.appendChild(iframe);
  console.log('✅ EasyAsk Widget loaded');

  window.EasyAskWidget = {
    remove: function() {
      const frame = document.getElementById('easyask-widget-frame');
      if (frame) {
        frame.remove();
        window.easyaskWidgetLoaded = false;
      }
    }
  };
})();`

  const handleCopy = () => {
    navigator.clipboard.writeText(bookmarkletCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleConsoleCopy = () => {
    navigator.clipboard.writeText(consoleCode)
    setConsoleCopied(true)
    setTimeout(() => setConsoleCopied(false), 2000)
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

        {/* Dev Console Alternative */}
        <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold mb-4">For sites with strict security policies</h2>
          <p className="text-gray-300 mb-4">
            Some sites (like hubermanlab.com) block external scripts with Content Security Policy (CSP).
            For these sites, paste this code directly into the browser's dev console:
          </p>

          <div className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm text-blue-200 mb-2">
                <strong>How to use:</strong>
              </p>
              <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                <li>Press <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">F12</kbd> or right-click → "Inspect"</li>
                <li>Click the "Console" tab</li>
                <li>Paste the code below and press Enter</li>
              </ol>
            </div>

            <div className="relative">
              <pre className="bg-black/50 rounded-lg p-4 overflow-x-auto text-xs mb-4 border border-white/10 max-h-64">
                <code className="text-green-300">{consoleCode}</code>
              </pre>
              <button
                onClick={handleConsoleCopy}
                className="absolute top-2 right-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                {consoleCopied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>

            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
              <p className="text-sm text-green-200">
                <strong>Why this works:</strong> Code pasted into the browser console runs in the page's security context, bypassing CSP restrictions that block external scripts.
              </p>
            </div>
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
