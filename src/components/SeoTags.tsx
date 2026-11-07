import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { canonicalUrl } from '../lib/seo'
import { getPageMeta } from '../lib/pageMeta'

// Sets the title, description, canonical link and social tags for the page shown
// (see src/lib/seo.ts and src/lib/pageMeta.ts)
function setTag(selector: string, create: () => HTMLElement, attr: string, value: string) {
  let el = document.head.querySelector<HTMLElement>(selector)
  if (!el) {
    el = create()
    document.head.appendChild(el)
  }
  el.setAttribute(attr, value)
}

// Creates or updates a <meta> tag, e.g. <meta name="description" content="...">
function setMeta(keyAttr: 'name' | 'property', key: string, value: string) {
  setTag(`meta[${keyAttr}="${key}"]`, () => {
    const m = document.createElement('meta')
    m.setAttribute(keyAttr, key)
    return m
  }, 'content', value)
}

function SeoTags() {
  const { pathname } = useLocation()
  useEffect(() => {
    const url = canonicalUrl(pathname)
    setTag('link[rel="canonical"]', () => Object.assign(document.createElement('link'), { rel: 'canonical' }), 'href', url)
    setMeta('property', 'og:url', url)

    const meta = getPageMeta(pathname)
    document.title = meta.title
    setMeta('name', 'description', meta.description)
    setMeta('property', 'og:title', meta.title)
    setMeta('property', 'og:description', meta.description)
    setMeta('name', 'twitter:title', meta.title)
    setMeta('name', 'twitter:description', meta.description)
  }, [pathname])
  return null
}

export default SeoTags