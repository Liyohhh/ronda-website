import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { LANGUAGES, type Lang } from '../i18n/translations'
import Icon from './Icon'

// Themed language picker (the native <select> list can't be styled on Windows).
// Button + listbox with arrow keys, Enter/Space, Escape and click-outside.

type Props = {
  // "pill" matches the header controls; "outline" is the bordered look on Login / Register
  variant?: 'pill' | 'outline'
  // hide the language name on small screens (header on phones)
  compact?: boolean
}

function LanguageMenu({ variant = 'pill', compact = false }: Props) {
  const { lang, setLang } = useLanguage()
  const [open, setOpen] = useState(false)
  const [focus, setFocus] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const listId = useId()

  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0]

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    listRef.current?.focus()
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const openMenu = () => {
    setFocus(Math.max(0, LANGUAGES.findIndex((l) => l.code === lang)))
    setOpen(true)
  }

  const choose = (code: Lang) => {
    setLang(code)
    setOpen(false)
    buttonRef.current?.focus()
  }

  const onListKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') setFocus((i) => (i + 1) % LANGUAGES.length)
    else if (e.key === 'ArrowUp') setFocus((i) => (i - 1 + LANGUAGES.length) % LANGUAGES.length)
    else if (e.key === 'Home') setFocus(0)
    else if (e.key === 'End') setFocus(LANGUAGES.length - 1)
    else if (e.key === 'Enter' || e.key === ' ') choose(LANGUAGES[focus].code)
    else if (e.key === 'Escape' || e.key === 'Tab') {
      setOpen(false)
      if (e.key === 'Escape') buttonRef.current?.focus()
      return
    } else return
    e.preventDefault()
  }

  const buttonClass =
    variant === 'pill'
      ? 'h-9 px-3 rounded-full hover:bg-[#002472]/5'
      : 'h-9 px-3 rounded-lg border border-gray-300 bg-white hover:border-[#002472]/40'

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault()
            openMenu()
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`Language: ${current.label}`}
        className={`${buttonClass} inline-flex items-center gap-1.5 text-sm font-medium text-[#002472] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#002472]/40`}
      >
        <Icon name="language" size={20} />
        <span className={compact ? 'hidden sm:inline' : ''}>{current.label}</span>
        <Icon name="expandMore" size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-label="Language"
          aria-activedescendant={`${listId}-${LANGUAGES[focus].code}`}
          onKeyDown={onListKey}
          className="absolute end-0 mt-2 w-48 py-1.5 bg-white border border-gray-200 rounded-xl shadow-lg outline-none z-50 origin-top animate-[menu-in_120ms_ease-out]"
        >
          {LANGUAGES.map((l, i) => {
            const selected = l.code === lang
            return (
              <li
                key={l.code}
                id={`${listId}-${l.code}`}
                role="option"
                aria-selected={selected}
                lang={l.code}
                onMouseEnter={() => setFocus(i)}
                onClick={() => choose(l.code)}
                className={`mx-1.5 px-3 py-2 rounded-lg flex items-center justify-between gap-3 cursor-pointer text-sm ${
                  selected ? 'text-[#002472] font-semibold' : 'text-gray-700'
                } ${i === focus ? 'bg-[#002472]/[0.06]' : ''}`}
              >
                {l.label}
                {selected && (
                  <Icon name="check" size={16} />
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default LanguageMenu
