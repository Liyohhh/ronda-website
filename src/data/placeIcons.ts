import type { PlaceKind } from '../services/places'

// Line drawings for the kinds of place, shown only on the place picked or pointed at on the RONDA 300 map (every
// other place is a plain dot). 24 x 24, stroked in currentColor.
export const PLACE_GLYPH: Record<PlaceKind, string> = {
  restaurant: '<path d="M4 12h16M5 12a7 7 0 0 0 14 0"/><path d="M14 3l-3 7M18 4l-5 6"/>',
  attraction: '<path d="M8 21V9l1.5-5L11 9v12M13 21V9l1.5-5L16 9v12M11 13h2M5 21h14"/>',
  park: '<path d="M12 21v-7M9 21h6M12 14c-4 0-7-2-7-5.5S8 3 12 3s7 2.5 7 5.5S16 14 12 14z"/>',
  shopping: '<path d="M5 8h14l-1 13H6zM9 8V6a3 3 0 0 1 6 0v2"/>',
  hotel: '<path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11" r="1.6"/>',
  mosque: '<path d="M6 21v-7a6 6 0 0 1 12 0v7zM12 3v3M10 21v-3a2 2 0 0 1 4 0v3"/>',
  religion: '<path d="M4 10l8-6 8 6M6 10v10h12V10M10 20v-5h4v5M3 20h18"/>',
  bank: '<path d="M3 9.5L12 4l9 5.5M5 10v7M9.7 10v7M14.3 10v7M19 10v7M3 20h18"/>',
  useful: '<rect x="4" y="7" width="16" height="12" rx="2.5"/><path d="M9 7V5h6v2M12 10v6M9 13h6"/>',
}
