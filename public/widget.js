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
  var groupId = (script && script.getAttribute('data-group-id')) || '';
  var isLeft = position === 'bottom-left';

  // Get visitor's timezone for personalized greeting
  var tz = '';
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  } catch (e) {}

  // Sizes (fixed - modal scrolls internally)
  var PILL = { w: 480, h: 100 };
  var MODAL = { w: 460, h: 600 };  // Corner-anchored modal

  // Create iframe
  var iframe = document.createElement('iframe');
  iframe.id = 'easyask-widget';
  iframe.src = ORIGIN + '/widget?url=' + encodeURIComponent(window.location.href) + '&position=' + position + '&tz=' + encodeURIComponent(tz) + '&key=' + encodeURIComponent(apiKey) + (groupId ? '&group_id=' + encodeURIComponent(groupId) : '');
  iframe.title = 'EasyAsk Assistant';
  iframe.allow = 'microphone *; autoplay *; clipboard-write *';
  iframe.style.cssText = [
    'position:fixed',
    'bottom:0',
    isLeft ? 'left:0' : 'right:0',
    'width:min(' + PILL.w + 'px, 100vw)',
    'height:' + PILL.h + 'px',
    'border:none',
    'background:transparent',
    'z-index:' + Z_INDEX,
    'transition:all .3s ease',
    'display:none'  // Start hidden, show via easyask:show message
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
        // Corner-anchored modal: stays in same corner as button, expands upward
        // Mobile: 92% of viewport (leaves a bit of space to see page behind)
        // Desktop: full height minus 32px margin
        var isMobile = window.innerWidth < 640;
        var maxHeight = isMobile
          ? Math.min(MODAL.h, window.innerHeight * 0.92)
          : Math.min(MODAL.h, window.innerHeight - 32);
        iframe.style.transition = 'all .25s ease-out';
        iframe.style.top = 'auto';
        iframe.style.left = isLeft ? '0' : 'auto';
        iframe.style.right = isLeft ? 'auto' : '0';
        iframe.style.bottom = '0';
        iframe.style.transform = 'none';
        iframe.style.width = Math.min(MODAL.w, window.innerWidth) + 'px';
        iframe.style.height = maxHeight + 'px';
      } else {
        iframe.style.transition = 'all .3s ease';
        iframe.style.top = 'auto';
        iframe.style.left = isLeft ? '0' : 'auto';
        iframe.style.right = isLeft ? 'auto' : '0';
        iframe.style.bottom = '0';
        iframe.style.transform = 'none';
        iframe.style.width = 'min(' + PILL.w + 'px, 100vw)';
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
      iframe.style.transform = 'none';
      iframe.style.width = 'min(' + PILL.w + 'px, 100vw)';
      iframe.style.height = PILL.h + 'px';
      iframe.src = ORIGIN + '/widget?url=' + encodeURIComponent(newUrl) + '&position=' + position + '&tz=' + encodeURIComponent(tz) + '&key=' + encodeURIComponent(apiKey) + (groupId ? '&group_id=' + encodeURIComponent(groupId) : '');
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
