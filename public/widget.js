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

  // Sizes: pill collapsed, modal expanded
  var PILL = { w: 360, h: 100 };   // Button + sound wave overflow
  var MODAL = { w: 440, h: 700 };  // Full modal

  // Create iframe
  var iframe = document.createElement('iframe');
  iframe.id = 'easyask-widget';
  iframe.src = ORIGIN + '/widget?url=' + encodeURIComponent(window.location.href);
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
    'transition:width .3s,height .3s'
  ].join(';');

  // Handle messages from widget
  window.addEventListener('message', function(e) {
    if (e.origin !== ORIGIN) return;
    var d = e.data;
    if (!d || !d.type) return;

    if (d.type === 'easyask:resize') {
      iframe.style.width = (d.expanded ? MODAL.w : PILL.w) + 'px';
      iframe.style.height = (d.expanded ? MODAL.h : PILL.h) + 'px';
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
