import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import { NAV_MENUS, type NavMenu } from '../data/serviceOptions'
import Icon from './Icon'

type Key = NavMenu['key']

// Header menus with hover panels. Sits inside the header row; the panel is positioned
// against the nearest `relative` ancestor (the header row), so it spans the full width.
function ServiceNav({ className = '' }: { className?: string }) {
  const { t, lang } = useLanguage()
  const [active, setActive] = useState<Key | null>(null)
  // Keeps the last panel's content rendered while it fades out
  const [shown, setShown] = useState<Key>('navTravel')
  const closeTimer = useRef<number | undefined>(undefined)
  const navigate = useNavigate()

  const open = (key: Key) => {
    window.clearTimeout(closeTimer.current)
    setActive(key)
    setShown(key)
  }

  const scheduleClose = () => {
    window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setActive(null), 150)
  }

  const close = () => {
    window.clearTimeout(closeTimer.current)
    setActive(null)
  }

  const menu = NAV_MENUS.find((m) => m.key === shown)!
  const isOpen = active !== null

  return (
    <nav className={className} onMouseLeave={scheduleClose} aria-label="Main">
      <ul className="flex items-stretch gap-6 text-sm text-[#1F2F5C] whitespace-nowrap">
        {NAV_MENUS.map((m) => (
          <li key={m.key} className="flex">
            <button
              type="button"
              onMouseEnter={() => open(m.key)}
              onFocus={() => open(m.key)}
              onClick={() => {
                // RONDA 300: a click goes to its section on Home (hover / focus still opens the panel)
                if (m.key === 'navRonda300') {
                  window.clearTimeout(closeTimer.current)
                  setActive(null)
                  navigate('/#explore')
                  return
                }
                if (active === m.key) setActive(null)
                else open(m.key)
              }}
              aria-expanded={active === m.key}
              className={`py-3 border-b-2 font-medium transition-colors flex items-center gap-1 ${
                active === m.key ? 'border-[#1F2F5C]' : 'border-transparent hover:border-[#1F2F5C]/40'
              }`}
            >
              {t(m.key)}
              <Icon name="expandMore" size={12} className={`transition-transform ${active === m.key ? 'rotate-180' : ''}`} />
            </button>
          </li>
        ))}
      </ul>

      {/* Hover panel */}
      <div
        onMouseEnter={() => active && open(active)}
        className={`absolute left-0 right-0 top-full bg-white border-b border-gray-200 shadow-xl transition-all duration-200 ease-out ${
          isOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-2 invisible pointer-events-none'
        }`}
      >
        <div className={`max-w-6xl mx-auto px-6 py-7 grid grid-cols-1 gap-8 ${menu.columns.length >= 3 ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
          {menu.columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-[#1F2F5C] mb-3">{t(col.title)}</h3>
              <ul className="space-y-2.5">
                {col.items.filter((item) => !item.onlyLang || item.onlyLang === lang).map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} onClick={close} className="block group">
                      <span className="block text-sm text-gray-800 group-hover:text-[#1F2F5C] group-hover:underline">
                        {item.label ? t(item.label) : item.name}
                      </span>
                      {(item.detail || item.detailLabel) && (
                        <span className="block text-xs text-gray-500">{item.detailLabel ? t(item.detailLabel).replace('{n}', '10') : item.detail}</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className={`rounded-2xl bg-[#1F2F5C] text-white p-6 flex flex-col justify-between ${menu.columns.length === 1 ? 'md:col-span-2' : ''}`}>
            <div>
              <h3 className="font-semibold text-lg mb-2">{t(menu.promo.title)}</h3>
              <p className="text-sm text-white/70">{t(menu.promo.text)}</p>
            </div>
            <Link
              to={menu.promo.to}
              onClick={close}
              className="mt-6 self-start bg-white text-[#1F2F5C] px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-100"
            >
              {t(menu.promo.cta)}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default ServiceNav
