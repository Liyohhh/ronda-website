import type { TranslationKey } from './translations'

// 45 -> "45 min", 60 -> "1 hr", 90 -> "1 hr 30 min" (in the current language)
export function formatDuration(min: number, t: (key: TranslationKey) => string) {
  const total = Math.max(0, Math.round(min))
  const h = Math.floor(total / 60), m = total % 60
  if (!h) return t('durMin').replace('{m}', String(m))
  if (!m) return t('durHr').replace('{h}', String(h))
  return t('durHrMin').replace('{h}', String(h)).replace('{m}', String(m))
}
