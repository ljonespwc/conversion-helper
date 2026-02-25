(function() {
  'use strict';

  // Prevent double initialization
  if (window.__EASYASK_LOADED__) return;
  window.__EASYASK_LOADED__ = true;

  // Configuration
  var ORIGIN = 'https://www.easyask.io';
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

  // Persistent visitor identity via first-party cookie
  function getRootDomain() {
    var host = location.hostname;
    var parts = host.split('.');
    // localhost or IP addresses — no domain attribute needed
    if (parts.length <= 2) return host;
    // Multi-part TLDs (co.uk, com.au, etc.) — take last 3 parts
    var twoPartTLDs = ['co.uk','com.au','co.nz','co.za','com.br','co.in','co.jp','com.mx','co.kr'];
    var lastTwo = parts.slice(-2).join('.');
    if (twoPartTLDs.indexOf(lastTwo) !== -1 && parts.length > 3) {
      return '.' + parts.slice(-3).join('.');
    }
    // Standard TLDs — take last 2 parts
    return '.' + parts.slice(-2).join('.');
  }

  function getVisitorId() {
    var name = 'easyask_vid';
    var match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    if (match) return decodeURIComponent(match[1]);
    // Generate new UUID
    var vid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    var expires = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(vid) + '; expires=' + expires + '; path=/; domain=' + getRootDomain() + '; SameSite=Lax';
    return vid;
  }

  var visitorId = getVisitorId();

  // Sizes (fixed - modal scrolls internally)
  var PILL = { w: 480, h: 100 };
  var MODAL = { w: 460, h: 600 };  // Corner-anchored modal
  var EXPANDED_MODAL = { w: 800 };  // Widened modal max width
  var COLLAPSED = { w: 80, h: 80 };  // Collapsed circle
  var COLLAPSE_KEY = 'easyask_collapsed';
  var widgetCollapsed = false;
  try { widgetCollapsed = localStorage.getItem(COLLAPSE_KEY) === '1'; } catch (e) {}

  // Create iframe
  var iframe = document.createElement('iframe');
  iframe.id = 'easyask-widget';
  iframe.src = ORIGIN + '/widget?url=' + encodeURIComponent(window.location.href) + '&position=' + position + '&tz=' + encodeURIComponent(tz) + '&key=' + encodeURIComponent(apiKey) + (groupId ? '&group_id=' + encodeURIComponent(groupId) : '') + '&vw=' + window.innerWidth + '&collapsed=' + (widgetCollapsed ? '1' : '0') + '&vid=' + encodeURIComponent(visitorId);
  iframe.title = 'EasyAsk Assistant';
  iframe.allow = 'microphone *; autoplay *; clipboard-write *';
  iframe.style.cssText = [
    'position:fixed',
    'bottom:0',
    isLeft ? 'left:0' : 'right:0',
    widgetCollapsed
      ? 'width:' + COLLAPSED.w + 'px'
      : 'width:min(' + PILL.w + 'px, 100vw)',
    'height:' + (widgetCollapsed ? COLLAPSED.h : PILL.h) + 'px',
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
        var modalWidth = d.widened
          ? Math.min(EXPANDED_MODAL.w, window.innerWidth - 32)
          : Math.min(MODAL.w, window.innerWidth);
        iframe.style.transition = 'all .25s ease-out';
        iframe.style.top = 'auto';
        iframe.style.left = isLeft ? '0' : 'auto';
        iframe.style.right = isLeft ? 'auto' : '0';
        iframe.style.bottom = '0';
        iframe.style.transform = 'none';
        iframe.style.width = modalWidth + 'px';
        iframe.style.height = maxHeight + 'px';
      } else {
        iframe.style.transition = 'all .3s ease';
        iframe.style.top = 'auto';
        iframe.style.left = isLeft ? '0' : 'auto';
        iframe.style.right = isLeft ? 'auto' : '0';
        iframe.style.bottom = '0';
        iframe.style.transform = 'none';
        if (widgetCollapsed) {
          iframe.style.width = COLLAPSED.w + 'px';
          iframe.style.height = COLLAPSED.h + 'px';
        } else {
          iframe.style.width = 'min(' + PILL.w + 'px, 100vw)';
          iframe.style.height = PILL.h + 'px';
        }
      }
    }
    if (d.type === 'easyask:collapse') {
      widgetCollapsed = !!d.collapsed;
      try { localStorage.setItem(COLLAPSE_KEY, widgetCollapsed ? '1' : '0'); } catch (e) {}
      if (widgetCollapsed) {
        iframe.style.transition = 'all .3s ease';
        iframe.style.width = COLLAPSED.w + 'px';
        iframe.style.height = COLLAPSED.h + 'px';
      } else {
        iframe.style.transition = 'all .3s ease';
        iframe.style.width = 'min(' + PILL.w + 'px, 100vw)';
        iframe.style.height = PILL.h + 'px';
      }
    }
    if (d.type === 'easyask:position') {
      isLeft = d.position === 'bottom-left';
      iframe.style.left = isLeft ? '0' : 'auto';
      iframe.style.right = isLeft ? 'auto' : '0';
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

  // Update widget when URL changes (SPA navigation)
  // Instead of reloading the iframe (which causes flicker), send a postMessage
  // so the React app stays mounted and the pill stays visible.
  function updateWidget() {
    var newUrl = window.location.href;
    if (newUrl !== currentUrl) {
      currentUrl = newUrl;
      if (iframe.contentWindow) {
        iframe.contentWindow.postMessage({ type: 'easyask:urlchange', url: newUrl }, ORIGIN);
      }
    }
  }

  // Listen for SPA navigation (popstate for back/forward, periodic check for pushState)
  window.addEventListener('popstate', updateWidget);
  setInterval(updateWidget, 500);

  // Send viewport width updates to iframe so expand button can show/hide
  window.addEventListener('resize', function() {
    if (iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'easyask:vw', vw: window.innerWidth }, ORIGIN);
    }
  });

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
