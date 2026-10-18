import { useLanguage } from '../hooks/useLanguage'
import { describeHours, hhmm, hoursStatus, parseHours } from '../data/openingHours'

// Opening hours of a trail stop (OpenStreetMap text). Two pieces for the stop card:
//   <HoursStatus>  "● Open now · closes 22:00" / "● Closed · opens 10:00" (Malaysia time); nothing if the text can't be read
//   <HoursWeek>    "Mon–Sun 10:00–22:00" in the page language, or the OSM text as written

export function HoursStatus({ hours }: { hours: string }) {
  const { t } = useLanguage()
  const rules = parseHours(hours)
  if (!rules) return null
  const status = hoursStatus(rules)
  const tone = status.open ? 'text-[#15803D]' : 'text-[#B91C1C]'
  return (
    <p className="inline-flex items-center gap-1.5 text-sm whitespace-nowrap">
      <span aria-hidden="true" className={`w-2 h-2 rounded-full ${status.open ? 'bg-[#15803D]' : 'bg-[#B91C1C]'}`} />
      <span className={`font-semibold ${tone}`}>{status.open ? t('openNow') : t('closedNow')}</span>
      {status.open ? (
        <span className="text-gray-600">· {t('closesAt').replace('{time}', hhmm(status.closes))}</span>
      ) : status.opens != null ? (
        <span className="text-gray-600">· {t('opensAt').replace('{time}', hhmm(status.opens))}</span>
      ) : null}
    </p>
  )
}

export function HoursWeek({ hours }: { hours: string }) {
  const { lang } = useLanguage()
  const rules = parseHours(hours)
  return <>{rules ? describeHours(rules, lang) : hours}</>
}
