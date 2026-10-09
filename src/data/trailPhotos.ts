// Trail cover photos from Wikimedia Commons. Every licence here allows commercial use:
// CC0 / public domain need no credit; CC BY and CC BY-SA need the credit shown on the trail page
// and in the About page's photo credits (author, licence, link). BY-SA applies to the photo only.
// Chosen 28 Sep 2026; `page` is the file's Commons page with the full licence details.

export type TrailPhoto = { src: string; author: string; license: string; licenseUrl: string | null; page: string }

const commons = (path: string, file: string) => `https://upload.wikimedia.org/wikipedia/commons/thumb/${path}/${file}/1280px-${file}`

export const TRAIL_PHOTOS: Record<string, TrailPhoto> = {
  shopping: { src: commons('9/95', 'Pavilion_KL_outview_2_%28211030%29.jpg'), author: '*angys*', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0', page: 'https://commons.wikimedia.org/wiki/File:Pavilion_KL_outview_2_(211030).jpg' },
  heritage: { src: commons('d/d9', '20190822_Sultan_Abdul_Samad_Building-10.jpg'), author: 'Unknown', license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', page: 'https://commons.wikimedia.org/wiki/File:20190822_Sultan_Abdul_Samad_Building-10.jpg' },
  museum: { src: commons('b/b6', 'Muzium_Negara%2C_2023_%2801%29.jpg'), author: 'Bahnfrend', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0', page: 'https://commons.wikimedia.org/wiki/File:Muzium_Negara,_2023_(01).jpg' },
  nature: { src: commons('b/bb', 'Perdana_Botanical_Gardens_in_2023_01.jpg'), author: 'Renek78', license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', page: 'https://commons.wikimedia.org/wiki/File:Perdana_Botanical_Gardens_in_2023_01.jpg' },
  'food-hawker': { src: commons('1/11', 'Jalan_Alor_Street_View1.jpg'), author: 'Alexander Synaptic', license: 'CC BY-SA 2.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0', page: 'https://commons.wikimedia.org/wiki/File:Jalan_Alor_Street_View1.jpg' },
  'street-art': { src: commons('1/14', 'Kwai_Chai_Hong_4.jpg'), author: 'Slleong', license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', page: 'https://commons.wikimedia.org/wiki/File:Kwai_Chai_Hong_4.jpg' },
  'night-market': { src: commons('1/1d', 'Night_market_or_pasar_malam_near_Jelatek_LRT_Putra_Station.jpg'), author: 'naim fadil', license: 'CC BY-SA 2.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0', page: 'https://commons.wikimedia.org/wiki/File:Night_market_or_pasar_malam_near_Jelatek_LRT_Putra_Station.jpg' },
  'cultural-harmony': { src: commons('c/ce', 'Masjid_Jamek%2C_Kuala_Lumpur_20231114_114015.jpg'), author: 'Wiki Farazi', license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', page: 'https://commons.wikimedia.org/wiki/File:Masjid_Jamek,_Kuala_Lumpur_20231114_114015.jpg' },
  'cafe-hopping': { src: commons('1/1f', 'Tingkap_Cafe_2.jpg'), author: 'Slleong', license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', page: 'https://commons.wikimedia.org/wiki/File:Tingkap_Cafe_2.jpg' },
  'hidden-gems': { src: commons('8/84', 'Kampung_Baru_-_Jalan_Daud_-_KL_tower.JPG'), author: 'Patrice78500', license: 'Public domain', licenseUrl: null, page: 'https://commons.wikimedia.org/wiki/File:Kampung_Baru_-_Jalan_Daud_-_KL_tower.JPG' },
  instagrammable: { src: commons('c/c5', 'Saloma_link_at_night.jpg'), author: 'Sheikh Izham', license: 'CC BY 2.0', licenseUrl: 'https://creativecommons.org/licenses/by/2.0', page: 'https://commons.wikimedia.org/wiki/File:Saloma_link_at_night.jpg' },
  'student-budget': { src: commons('c/c0', 'Central_Market_Kuala_Lumpur.jpg'), author: 'Aumars', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0', page: 'https://commons.wikimedia.org/wiki/File:Central_Market_Kuala_Lumpur.jpg' },
  'wellness-park': { src: commons('f/f8', 'KLCC_Park_1.jpg'), author: 'Brownc', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0', page: 'https://commons.wikimedia.org/wiki/File:KLCC_Park_1.jpg' },
  festive: { src: commons('d/d7', 'Thean_Hou_Temple%2C_2023_%2803%29.jpg'), author: 'Bahnfrend', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0', page: 'https://commons.wikimedia.org/wiki/File:Thean_Hou_Temple,_2023_(03).jpg' },
  'rooftop-dining': { src: commons('c/cc', 'Kuala_Lumpur_Skyline_at_dusk_1.jpg'), author: 'Walkerssk', license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', page: 'https://commons.wikimedia.org/wiki/File:Kuala_Lumpur_Skyline_at_dusk_1.jpg' },
}
