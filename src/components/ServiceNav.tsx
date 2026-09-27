import { useRef, useState } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { SERVICE_OPTIONS, type ServiceOption } from '../data/serviceOptions'

type Key = ServiceOption['key']

function ServiceNav() {
  const { t } = useLanguage()
  const [active, setActive] = useState<Key | null>(null)
  // Keeps the last panel's content rendered while it fades out
  const [shown, setShown] = useState<Key>('merchant')
  const closeTimer = useRef<number | undefined>(undefined)

  const open = (key: Key) => {
    window.clearTimeout(closeTimer.current)
    setActive(key)
    setShown(key)
  }

  const scheduleClose = () => {
    window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setActive(null), 150)
  }

  const option = SERVICE_OPTIONS.find((o) => o.key === shown)!
  const isOpen = active !== null

  return (
    <nav className="relative border-b border-gray-200" onMouseLeave={scheduleClose}>
      <ul className="flex items-center gap-8 px-6 text-sm text-[#002472]">
        {SERVICE_OPTIONS.map((o) => (
          <li key={o.key}>
            <button
              type="button"
              onMouseEnter={() => open(o.key)}
              onFocus={() => open(o.key)}
              onClick={() => (active === o.key ? setActive(null) : open(o.key))}
              aria-expanded={active === o.key}
              className={`py-3 border-b-2 -mb-px font-medium transition-colors ${
                active === o.key ? 'border-[#002472]' : 'border-transparent hover:border-[#002472]/40'
              }`}
            >
              {t(o.key)}
            </button>
          </li>
        ))}
      </ul>

      {/* Dropdown panel */}
      <div
        onMouseEnter={() => active && open(active)}
        className={`absolute left-0 right-0 top-full bg-white border-b border-gray-200 shadow-xl transition-all duration-200 ease-out ${
          isOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-2 invisible pointer-events-none'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          {option.columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-[#002472] mb-3">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.items.map((item) => (
                  <li key={item.name}>
                    <button type="button" className="text-start group">
                      <div className="text-sm text-gray-800 group-hover:text-[#002472] group-hover:underline">
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-500">{item.detail}</div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="rounded-2xl bg-[#002472] text-white p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-2">{option.promo.title}</h3>
              <p className="text-sm text-white/70">{option.promo.text}</p>
            </div>
            <button
              type="button"
              className="mt-6 self-start bg-white text-[#002472] px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-100"
            >
              {option.promo.cta}
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default ServiceNav
