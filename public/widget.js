(function() {
  'use strict';

  // Prevent double initialization
  if (window.__EASYASK_LOADED__) return;
  window.__EASYASK_LOADED__ = true;

  // Configuration
  var ORIGIN = 'https://easyask.io';
  var Z_INDEX = 2147483647;

  // Read position from script tag (default: bottom-right)
  var script = document.currentScript;
  var position = (script && script.getAttribute('data-position')) || 'bottom-right';
  var isLeft = position === 'bottom-left';

  // Sizes: pill collapsed, full viewport when expanded
  var PILL = { w: 360, h: 100 };

  // Create iframe
  var iframe = document.createElement('iframe');
  iframe.id = 'easyask-widget';
  iframe.src = ORIGIN + '/widget?url=' + encodeURIComponent(window.location.href) + '&position=' + position;
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
  window.addEventListener('message', function(e) {
    if (e.origin !== ORIGIN) return;
    var d = e.data;
    if (!d || !d.type) return;

    if (d.type === 'easyask:resize') {
      if (d.expanded) {
        // Expand to full viewport for modal
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
      } else {
        // Collapse to pill
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
