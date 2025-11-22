/**
 * EasyAsk Widget Loader
 * Standalone script for injecting the EasyAsk voice widget onto any webpage
 * Usage: Load this script via bookmarklet or script tag
 */

(function() {
  'use strict';

  // Prevent multiple loads
  if (window.easyaskWidgetLoaded) {
    console.log('EasyAsk Widget already loaded');
    return;
  }
  window.easyaskWidgetLoaded = true;

  // Configuration
  const WIDGET_HOST = window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://easyask.io';

  const currentPageUrl = encodeURIComponent(window.location.href);

  // Create iframe container
  const iframe = document.createElement('iframe');
  iframe.id = 'easyask-widget-frame';
  iframe.src = `${WIDGET_HOST}/widget-embed?url=${currentPageUrl}`;
  iframe.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    border: none !important;
    z-index: 2147483647 !important;
    pointer-events: none !important;
    background: transparent !important;
  `;

  // Inject into page
  if (document.body) {
    document.body.appendChild(iframe);
  } else {
    // If body doesn't exist yet, wait for DOM ready
    document.addEventListener('DOMContentLoaded', function() {
      document.body.appendChild(iframe);
    });
  }

  console.log('EasyAsk Widget loaded successfully');

  // Expose API for programmatic control
  window.EasyAskWidget = {
    remove: function() {
      const frame = document.getElementById('easyask-widget-frame');
      if (frame) {
        frame.remove();
        window.easyaskWidgetLoaded = false;
        console.log('EasyAsk Widget removed');
      }
    },
    reload: function() {
      this.remove();
      window.easyaskWidgetLoaded = false;
      setTimeout(() => {
        // Re-run the script
        eval(document.querySelector('script[src*="widget.js"]')?.textContent || '');
      }, 100);
    }
  };
})();
