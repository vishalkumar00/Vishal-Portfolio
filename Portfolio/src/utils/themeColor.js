/**
 * Keep the browser UI chrome (theme-color) in sync with the page background.
 *
 * Use `setThemeColor('#202c39')` anywhere the background changes (e.g. when a
 * new section scrolls into view) and the browser's address bar / tab tint /
 * PWA title bar will follow along smoothly.
 */

let metaEl = null

function getMeta() {
  if (metaEl) return metaEl
  metaEl = document.querySelector('meta[name="theme-color"]')
  if (!metaEl) {
    metaEl = document.createElement('meta')
    metaEl.setAttribute('name', 'theme-color')
    document.head.appendChild(metaEl)
  }
  return metaEl
}

export function setThemeColor(hex) {
  if (!hex) return
  getMeta().setAttribute('content', hex)
  // also tint the document background so overscroll/edges match
  document.documentElement.style.backgroundColor = hex
}

/* Named palette anchors so callers don't sprinkle hex codes around */
export const THEME = {
  splash: '#000000',
  bg: '#000000', // home page background (black)
  surface: '#283845', // --color-surface
}
