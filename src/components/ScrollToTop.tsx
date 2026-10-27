import { useLayoutEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

// Opening another page starts at its top (the router keeps the old scroll position otherwise). Links to a #section
// are left to the page, which scrolls there itself; going back keeps the browser's own behaviour.
function ScrollToTop() {
  const { pathname, hash } = useLocation()
  const nav = useNavigationType()
  useLayoutEffect(() => {
    if (nav !== 'POP' && !hash) window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    // only when the page changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])
  return null
}

export default ScrollToTop
