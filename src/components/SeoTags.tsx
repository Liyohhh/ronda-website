import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { canonicalUrl } from '../lib/seo'

// Sets the canonical link and og:url for the page shown (see src/lib/seo.ts)
function setTag(selector: string, create: () => HTMLElement, attr: string, value: string) {
  let el = document.head.querySelector<HTMLElement>(selector)
  if (!el) {
    el = create()
    document.head.appendChild(el)
  }
  el.setAttribute(attr, value)
}

function SeoTags() {
  const { pathname } = useLocation()
  useEffect(() => {
    const url = canonicalUrl(pathname)
    setTag('link[rel="canonical"]', () => Object.assign(document.createElement('link'), { rel: 'canonical' }), 'href', url)
    setTag('meta[property="og:url"]', () => {
      const m = document.createElement('meta')
      m.setAttribute('property', 'og:url')
      return m
    }, 'content', url)
  }, [pathname])
  return null
}

export default SeoTags
