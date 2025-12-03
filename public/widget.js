(function() {
  'use strict';

  // Prevent double initialization
  if (window.__EASYASK_LOADED__) return;
  window.__EASYASK_LOADED__ = true;

  // Configuration
  var ORIGIN = 'https://easyask.io';
  var Z_INDEX = 2147483647;

  // Read configuration from script tag
  var script = document.currentScript;
  var position = (script && script.getAttribute('data-position')) || 'bottom-right';
  var apiKey = (script && script.getAttribute('data-key')) || '';
  var isLeft = position === 'bottom-left';

  // Get visitor's timezone for personalized greeting
  var tz = '';
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  } catch (e) {}

  // Sizes: pill collapsed, full viewport when expanded
  var PILL = { w: 360, h: 100 };

  // Create iframe
  var iframe = document.createElement('iframe');
  iframe.id = 'easyask-widget';
  iframe.src = ORIGIN + '/widget?url=' + encodeURIComponent(window.location.href) + '&position=' + position + '&tz=' + encodeURIComponent(tz) + '&key=' + encodeURIComponent(apiKey);
  iframe.title = 'EasyAsk Assistant';
  iframe.allow = 'microphone *; autoplay *';
  iframe.style.cssText = [
    'position:fixed',
    'bottom:0',
    isLeft ? 'left:0' : 'right:0',
    'width:' + PILL.w + 'px',
    'height:' + PILL.h + 'px',
    'border:none',
    'background:transparent',
    'z-index:' + Z_INDEX,
    'transition:all .3s ease'
  ].join(';');

  // Handle messages from widget
  // Accept messages from both www and non-www origins
  var ALLOWED_ORIGINS = ['https://easyask.io', 'https://www.easyask.io'];
  window.addEventListener('message', function(e) {
    if (ALLOWED_ORIGINS.indexOf(e.origin) === -1) return;
    var d = e.data;
    if (!d || !d.type) return;

    if (d.type === 'easyask:resize') {
      if (d.expanded) {
        // Expand to full viewport instantly (no transition)
        iframe.style.transition = 'none';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
      } else {
        // Collapse to pill with smooth transition
        iframe.style.transition = 'all .3s ease';
        iframe.style.top = 'auto';
        iframe.style.left = isLeft ? '0' : 'auto';
        iframe.style.right = isLeft ? 'auto' : '0';
        iframe.style.bottom = '0';
        iframe.style.width = PILL.w + 'px';
        iframe.style.height = PILL.h + 'px';
      }
    }
    if (d.type === 'easyask:hide') {
      iframe.style.display = 'none';
    }
    if (d.type === 'easyask:show') {
      iframe.style.display = '';
    }
  });

  // Track current URL to detect SPA navigation
  var currentUrl = window.location.href;

  // Update iframe when URL changes (SPA navigation)
  function updateWidget() {
    var newUrl = window.location.href;
    if (newUrl !== currentUrl) {
      currentUrl = newUrl;
      // Hide immediately, then update iframe src - widget will show itself if page is configured
      iframe.style.display = 'none';
      iframe.style.transition = 'none';
      iframe.style.top = 'auto';
      iframe.style.left = isLeft ? '0' : 'auto';
      iframe.style.right = isLeft ? 'auto' : '0';
      iframe.style.bottom = '0';
      iframe.style.width = PILL.w + 'px';
      iframe.style.height = PILL.h + 'px';
      iframe.src = ORIGIN + '/widget?url=' + encodeURIComponent(newUrl) + '&position=' + position + '&tz=' + encodeURIComponent(tz) + '&key=' + encodeURIComponent(apiKey);
    }
  }

  // Listen for SPA navigation (popstate for back/forward, periodic check for pushState)
  window.addEventListener('popstate', updateWidget);
  setInterval(updateWidget, 500);

  // Insert into DOM
  function insert() {
    document.body.appendChild(iframe);
  }

  if (document.body) {
    insert();
  } else {
    document.addEventListener('DOMContentLoaded', insert);
  }
})();
