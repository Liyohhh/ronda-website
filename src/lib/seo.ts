import { useEffect } from 'react'

// The one address search engines should list for each page: always https://ronda2go.com, no "www", no query,
// no trailing slash. The site is also reachable as www.ronda2go.com and *.pages.dev, so without this Google
// may pick one of those copies.
export const SITE = 'https://ronda2go.com'

export function canonicalUrl(pathname: string): string {
  const path = pathname.replace(/\/+$/, '')
  return SITE + (path || '/')
}

// For pages that must stay out of search results (the "page not found" page): adds robots noindex while shown
export function useNoIndex() {
  useEffect(() => {
    const m = document.createElement('meta')
    m.name = 'robots'
    m.content = 'noindex'
    document.head.appendChild(m)
    return () => m.remove()
  }, [])
}
