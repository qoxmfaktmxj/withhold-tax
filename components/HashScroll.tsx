'use client'

import { useEffect } from 'react'

/**
 * Scrolls to the URL hash target on mount and on hashchange.
 * Covers every entry path into a deep link: command-palette client-nav,
 * home <a> anchors, a hard refresh, or an external link. App Router does not
 * reliably auto-scroll to a hash on client navigation, so we own it here.
 * Pairs with `router.push(url, { scroll: false })` in the palette so Next's
 * scroll-to-top doesn't override us.
 */
export function HashScroll() {
  useEffect(() => {
    const scrollToHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1))
      if (!id) return
      let tries = 0
      const tick = () => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        else if (tries++ < 30) requestAnimationFrame(tick) // wait for content paint
      }
      tick()
    }
    scrollToHash()
    window.addEventListener('hashchange', scrollToHash)
    return () => window.removeEventListener('hashchange', scrollToHash)
  }, [])
  return null
}
