// Home hero videos, shown one after another (day to night) on wider screens. Pexels videos chosen by the owner
// (18 Oct 2026; the Putra Mosque clip was swapped for the KL high-rise clip the same day; the Petronas Towers night clip was swapped for a daytime aerial one on 26 Oct, placed second to keep day to night; Pexels licence: free to use, credit not required, credited anyway). Re-encoded from the 4K / HD
// downloads to 1280x720 MP4 (H.264, about 3 Mbit/s, no sound), each cut to at most 12 s.
// Creator names: TODO (the Pexels pages could not be read automatically); until then the credit links to the page.
// poster: the clip's first frame (shown on phones, with reduced motion, and while the clip loads)
export type HeroVideo = { src: string; poster: string; alt: string; page: string; author?: string }

export const HERO_VIDEOS: HeroVideo[] = [
  { src: '/video/hero/kl-day.mp4', poster: '/video/hero/kl-day.jpg', alt: 'Kuala Lumpur skyline by day', page: 'https://www.pexels.com/video/14851863/' },
  { src: '/video/hero/petronas-towers.mp4', poster: '/video/hero/petronas-towers.jpg', alt: 'Petronas Towers from the air by day', page: 'https://www.pexels.com/video/15668866/' },
  { src: '/video/hero/kl-dusk.mp4', poster: '/video/hero/kl-dusk.jpg', alt: 'Kuala Lumpur at dusk with KL Tower', page: 'https://www.pexels.com/video/15987056/' },
  { src: '/video/hero/kl-highrise.mp4', poster: '/video/hero/kl-highrise.jpg', alt: 'Kuala Lumpur from a high-rise, night to morning', page: 'https://www.pexels.com/video/18522098/' },
  { src: '/video/hero/kl-night.mp4', poster: '/video/hero/kl-night.jpg', alt: 'Kuala Lumpur at night with KL Tower and the Petronas Towers', page: 'https://www.pexels.com/video/14851872/' },
]

// how long each video shows before the next one fades in (short clips loop until then)
export const HERO_SLIDE_MS = 8000

export const videoByName = (name: string) => HERO_VIDEOS.find((v) => v.src.endsWith(`/${name}.mp4`))!
