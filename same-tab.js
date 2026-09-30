/*
 * Links to the Find.ly site open in the same tab, like any page of the site.
 *
 * Mintlify renders absolute links (navbar, "Get your API key", logo, footer,
 * links in pages) with target="_blank" and sometimes an "external" arrow.
 * For findly.icu and www.findly.icu only, this script removes target/rel,
 * hides that arrow, and keeps doing so when Mintlify re-renders the page.
 * Every other external link is left alone. Mintlify loads every .js file of
 * this folder on every page.
 */
(function () {
  'use strict';

  if (window.__findlySameTab) return;
  window.__findlySameTab = true;

  var HOSTS = { 'findly.icu': true, 'www.findly.icu': true };
  var MARK = 'data-findly-same-tab';

  function isSiteUrl(value) {
    try {
      var url = new URL(value, window.location.href);
      return (url.protocol === 'https:' || url.protocol === 'http:') && HOSTS[url.hostname] === true;
    } catch (e) {
      return false;
    }
  }

  // An "external link" arrow: an inline SVG drawn with paths, or an icon-font
  // SVG whose mask is an arrow. Icons with another mask (the footer's globe,
  // a card's key) are kept.
  function isArrowIcon(svg) {
    var style = svg.getAttribute('style') || '';
    if (style.indexOf('mask-image') === -1) return true;
    return /arrow-up-right|up-right-from-square|external-link/.test(style);
  }

  function fixLink(a) {
    if (!a.hasAttribute('href') || !isSiteUrl(a.href)) return;
    if (a.hasAttribute('target')) a.removeAttribute('target');
    if (a.hasAttribute('rel')) a.removeAttribute('rel');
    if (!a.hasAttribute(MARK)) a.setAttribute(MARK, '');
    // Only links that also have text: an icon-only link keeps its icon.
    if (!a.textContent || !a.textContent.trim()) return;
    var icons = a.querySelectorAll('svg');
    for (var i = 0; i < icons.length; i++) {
      if (isArrowIcon(icons[i])) icons[i].classList.add('findly-external-icon');
    }
  }

  function scan(node) {
    if (!node || node.nodeType !== 1) return;
    if (node.tagName === 'A') fixLink(node);
    var links = node.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) fixLink(links[i]);
  }

  scan(document.documentElement);

  new MutationObserver(function (records) {
    for (var i = 0; i < records.length; i++) {
      var record = records[i];
      if (record.type === 'attributes') {
        if (record.target.tagName === 'A') fixLink(record.target);
      } else {
        for (var j = 0; j < record.addedNodes.length; j++) scan(record.addedNodes[j]);
        // Text or icons added inside an existing link.
        var parent = record.target.nodeType === 1 ? record.target.closest('a[href]') : null;
        if (parent) fixLink(parent);
      }
    }
  }).observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['href', 'target'],
  });

  // Last guard, in the capture phase: if a re-render put target back between
  // the observer and the click, remove it before the browser follows the link.
  // Ctrl/Cmd/Shift/middle clicks keep their usual "new tab/window" meaning.
  var newTabGesture = false;
  function onPointer(event) {
    newTabGesture = event.button === 1 || event.ctrlKey || event.metaKey || event.shiftKey;
    var a = event.target && event.target.closest ? event.target.closest('a[href]') : null;
    if (a && !newTabGesture) fixLink(a);
    setTimeout(function () {
      newTabGesture = false;
    }, 0);
  }
  document.addEventListener('click', onPointer, true);
  document.addEventListener('auxclick', onPointer, true);

  // Some components (cards) navigate with window.open(url, '_blank').
  var open = window.open;
  window.open = function (url, target) {
    if (!newTabGesture && url != null && isSiteUrl(String(url)) && (target == null || target === '_blank')) {
      window.location.assign(new URL(String(url), window.location.href).href);
      return null;
    }
    return open.apply(window, arguments);
  };
})();
