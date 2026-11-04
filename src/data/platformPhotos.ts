// Platform sign photos for one direction at a station: the hanging sign with the station, its code, the platform and
// where the trains go ("27 Platform 2 Kwasa Damansara"), zoomed in and turned to face the camera, so a user can tell
// they are on the right platform (owner, 4 Nov 2026). Shown instead of the station photo (stationPhotos.ts) when the
// ride goes that way. Demo photos from any source (owner); no credit on the site, sources in docs/PHOTO_SOURCES.md.
// Keyed by "feed_id:stop_id>headsign", headsign in lower case as the planner gives it.
import type { TrailPhoto } from './trailPhotos'

export const PLATFORM_PHOTOS: Record<string, TrailPhoto> = {
  // owner's edit of a platform photo with the new wording (4 Nov 2026)
  'rapid-rail-kl:KG27>kwasa damansara': { src: '/stations/KG27-taman-suntex-platform.jpg', author: 'Owner edit', license: 'Unknown (demo)', licenseUrl: null, page: '', owner: true },
  // Wikimedia Commons platform signs (4 Nov 2026), cropped to the sign
  'rapid-rail-kl:PY38>putrajaya': { src: '/stations/PY38-16-sierra-to-putrajaya.jpg', author: '*angys*', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0', page: 'https://commons.wikimedia.org/wiki/File:16_Sierra_MRT_Station_platform_signboard_(230419).jpg' },
  'rapid-rail-kl:PY33>kwasa damansara': { src: '/stations/PY33-serdang-jaya-to-kwasa-damansara.jpg', author: '*angys*', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0', page: 'https://commons.wikimedia.org/wiki/File:Serdang_Jaya_MRT_Station_platform_signboard_(230403).jpg' },
  'rapid-rail-kl:PY39>putrajaya': { src: '/stations/PY39-cyberjaya-utara-to-putrajaya.jpg', author: '*angys*', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0', page: 'https://commons.wikimedia.org/wiki/File:Cyberjaya_Utara_MRT_Station_platform_signboard_(230419).jpg' },
  'rapid-rail-kl:PY40>putrajaya': { src: '/stations/PY40-cyberjaya-city-centre-to-putrajaya.jpg', author: '*angys*', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0', page: 'https://commons.wikimedia.org/wiki/File:Cyberjaya_City_Centre_MRT_Station_platform_signboard_(230419).jpg' },
  'rapid-rail-kl:SA7>bandar utama': { src: '/stations/SA07-glenmarie-2-to-bandar-utama.jpg', author: 'Qhairy', license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', page: 'https://commons.wikimedia.org/wiki/File:Platform_1_Signage_in_Glenmarie_2_LRT_Station.jpg' },
  'rapid-rail-kl:SA15>johan setia': { src: '/stations/SA15-seksyen-7-to-johan-setia.jpg', author: 'Qhairy', license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', page: 'https://commons.wikimedia.org/wiki/File:Sign_for_Platform_2_route_in_Seksyen_7_Shah_Alam_LRT_Station.jpg' },
  'rapid-rail-kl:SA17>bandar utama': { src: '/stations/SA17-bandar-baru-klang-to-bandar-utama.jpg', author: 'Qhairy', license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', page: 'https://commons.wikimedia.org/wiki/File:Platform_1_Signage_Bandar_Baru_Klang_LRT_Station.jpg' },
  'rapid-rail-kl:SA17>johan setia': { src: '/stations/SA17-bandar-baru-klang-to-johan-setia.jpg', author: 'Qhairy', license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', page: 'https://commons.wikimedia.org/wiki/File:Platform_2_Signage_Bandar_Baru_Klang_LRT_Station.jpg' },
  'rapid-rail-kl:SA18>bandar utama': { src: '/stations/SA18-pasar-klang-to-bandar-utama.jpg', author: 'Qhairy', license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', page: 'https://commons.wikimedia.org/wiki/File:Platform_1_Signage_Pasar_Klang_LRT_Station.jpg' },
  'rapid-rail-kl:SA18>johan setia': { src: '/stations/SA18-pasar-klang-to-johan-setia.jpg', author: 'Qhairy', license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', page: 'https://commons.wikimedia.org/wiki/File:Platform_2_Signage_Pasar_Klang_LRT_Station.jpg' },
  'rapid-rail-kl:MR11>kl sentral': { src: '/stations/MR11-titiwangsa-to-kl-sentral.jpg', author: '*angys*', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0', page: 'https://commons.wikimedia.org/wiki/File:Titiwangsa_Monorail_Station_platform_signboard_(230402).jpg' },
  'rapid-rail-kl:KG04>kajang': { src: '/stations/KG04-kwasa-damansara-platforms.jpg', author: 'Wiki Farazi', license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', page: 'https://commons.wikimedia.org/wiki/File:Kwasa_Damansara_MRT_Platform_Sign_at_Platform_3_(220625).jpg' },
  'rapid-rail-kl:PY01>putrajaya': { src: '/stations/KG04-kwasa-damansara-platforms.jpg', author: 'Wiki Farazi', license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', page: 'https://commons.wikimedia.org/wiki/File:Kwasa_Damansara_MRT_Platform_Sign_at_Platform_3_(220625).jpg' },

}

export const platformPhoto = (feedId?: string, stopId?: string, headsign?: string | null) =>
  feedId && stopId && headsign ? PLATFORM_PHOTOS[`${feedId}:${stopId}>${headsign.toLowerCase()}`] : undefined
