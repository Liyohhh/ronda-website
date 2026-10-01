import { useState, type KeyboardEvent } from 'react'
import SuggestionList from './SuggestionList'
import { normaliseQuery, useSmartSearch } from '../hooks/useSmartSearch'
import { buildItems, type Pick } from '../data/suggestions'
import Icon from './Icon'

// A From / To box in the results panel: shows the place, and on click becomes a search field with the
// same smart suggestions as the Home search. Picking a suggestion calls onPick (the trip is re-planned).
type Props = { id: string; label: string; value: string; onPick: (p: Pick) => void }

function PlaceField({ id, label, value, onPick }: Props) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState('')
  const [hi, setHi] = useState<{ q: string; i: number }>({ q: '', i: -1 })
  const { stops, places, routeStops, loading } = useSmartSearch(editing ? text : '')
  const items = editing && text.trim() ? buildItems(stops, places, routeStops) : []
  const highlighted = hi.q === normaliseQuery(text) ? hi.i : -1

  const pick = (p: Pick) => {
    setEditing(false)
    onPick(p)
  }
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!items.length) return
      e.preventDefault()
      const step = e.key === 'ArrowDown' ? 1 : -1
      setHi({ q: normaliseQuery(text), i: (highlighted + step + items.length) % items.length })
    } else if (e.key === 'Enter') {
      const it = items[highlighted >= 0 ? highlighted : 0]
      if (!it) return
      e.preventDefault()
      pick(it.pick)
    } else if (e.key === 'Escape') setEditing(false)
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setText('')
          setEditing(true)
        }}
        className="w-full text-start bg-white/10 hover:bg-white/15 rounded-lg px-3 py-2 group"
      >
        <div className="text-[11px] text-white/60">{label}</div>
        <div className="flex items-center gap-2">
          <span className="flex-1 font-semibold truncate">{value}</span>
          <Icon name="editOutline" size={14} className="text-white/50 group-hover:text-white" />
        </div>
      </button>
    )
  }

  return (
    <div className="relative">
      <div className="bg-white rounded-lg px-3 py-2 ring-2 ring-white/60">
        <label htmlFor={id} className="block text-[11px] text-gray-500">{label}</label>
        <input
          id={id}
          autoFocus
          value={text}
          placeholder={value}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKey}
          onBlur={() => setTimeout(() => setEditing(false), 150)}
          role="combobox"
          aria-expanded={items.length > 0}
          aria-controls={`${id}-list`}
          aria-activedescendant={highlighted >= 0 ? `${id}-list-${highlighted}` : undefined}
          autoComplete="off"
          className="w-full font-semibold text-gray-900 outline-none bg-transparent placeholder:text-gray-400 placeholder:font-normal"
        />
      </div>
      {items.length > 0 && (
        <div className="text-gray-900">
          <SuggestionList
            id={`${id}-list`}
            items={items}
            query={text}
            loading={loading}
            highlighted={highlighted}
            onHover={(i) => setHi({ q: normaliseQuery(text), i })}
            onPick={pick}
          />
        </div>
      )}
    </div>
  )
}

export default PlaceField
