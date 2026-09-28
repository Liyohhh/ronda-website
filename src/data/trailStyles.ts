import type { TrailCategory } from './trails'

// Placeholder cover per category until real photos exist: a gradient anchored on RONDA navy,
// tinted per category, plus an outline icon (24x24 paths).
export const CATEGORY_STYLE: Record<TrailCategory, { from: string; to: string; icon: string }> = {
  food: {
    from: '#002472',
    to: '#C2410C',
    icon: 'M4 3v8a3 3 0 0 0 3 3v7M7 3v6M10 3v8a3 3 0 0 1-3 3M17 21V3c-2 1-3 4-3 8h3',
  },
  culture: {
    from: '#001233',
    to: '#1D4ED8',
    icon: 'M3 21h18M5 21V10M9 21V10M15 21V10M19 21V10M2 10l10-6 10 6',
  },
  shopping: {
    from: '#002472',
    to: '#BE185D',
    icon: 'M5 8h14l-1 13H6zM9 8V6a3 3 0 0 1 6 0v2',
  },
  nature: {
    from: '#001233',
    to: '#15803D',
    icon: 'M12 21v-6M7 15l5-12 5 12zM4 21h16',
  },
  explore: {
    from: '#001233',
    to: '#A16207',
    icon: 'M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  },
}
