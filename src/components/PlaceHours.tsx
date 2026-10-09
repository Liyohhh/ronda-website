import { useLanguage } from '../hooks/useLanguage'
import { describeHours, hhmm, hoursStatus, parseHours } from '../data/openingHours'

// "● Open now · closes 22:00" / "● Closed · opens 10:00" (Malaysia time), with the week's hours under it.
// Hours in a form we don't read are shown as written in OpenStreetMap.
function PlaceHours({ hours }: { hours: string }) {
  const { t, lang } = useLanguage()
  const rules = parseHours(hours)
  if (!rules) return <p className="text-xs text-gray-500">{hours}</p>
  const status = hoursStatus(rules)
  return (
    <div className="text-sm leading-tight">
      <p className="flex items-center gap-1.5">
        <span aria-hidden="true" className={`w-2 h-2 rounded-full ${status.open ? 'bg-[#15803D]' : 'bg-[#B91C1C]'}`} />
        <span className={`font-semibold ${status.open ? 'text-[#15803D]' : 'text-[#B91C1C]'}`}>{status.open ? t('openNow') : t('closedNow')}</span>
        {status.open ? (
          <span className="text-gray-600">· {t('closesAt').replace('{time}', hhmm(status.closes))}</span>
        ) : status.opens != null ? (
          <span className="text-gray-600">· {t('opensAt').replace('{time}', hhmm(status.opens))}</span>
        ) : null}
      </p>
      <p className="mt-0.5 text-xs text-gray-500">{describeHours(rules, lang)}</p>
    </div>
  )
}

export default PlaceHours
