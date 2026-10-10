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
  'cultural-harmony': { src: commons('c/ce', 'Masjid_Jamek%2C_Kuala_Lumpur_20231114_114015.jpg'), author: 'Wiki Farazi', license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', page: 'https://commons.wikimedia.org/wiki/File:Masjid_Jamek,_Kuala_Lumpur_20231114_114015.jpg' },
  'cafe-hopping': { src: commons('1/1f', 'Tingkap_Cafe_2.jpg'), author: 'Slleong', license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', page: 'https://commons.wikimedia.org/wiki/File:Tingkap_Cafe_2.jpg' },
  instagrammable: { src: commons('c/c5', 'Saloma_link_at_night.jpg'), author: 'Sheikh Izham', license: 'CC BY 2.0', licenseUrl: 'https://creativecommons.org/licenses/by/2.0', page: 'https://commons.wikimedia.org/wiki/File:Saloma_link_at_night.jpg' },
  'rooftop-dining': { src: commons('c/cc', 'Kuala_Lumpur_Skyline_at_dusk_1.jpg'), author: 'Walkerssk', license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', page: 'https://commons.wikimedia.org/wiki/File:Kuala_Lumpur_Skyline_at_dusk_1.jpg' },
}

// Home page slides ("Travel made effortless"): iconic KL places, same licence rules and credits as above.
// Checked through the Commons API (author + licence) on 4 Oct 2026.
export const SLIDE_PHOTOS: Record<'plan' | 'ronda300' | 'fares' | 'saved' | 'airport', TrailPhoto & { alt: string }> = {
  plan: { src: commons('a/aa', 'Kuala_Lumpur_Malaysia_Skyline-03.jpg'), alt: 'Kuala Lumpur skyline with the Petronas Twin Towers and KL Tower', author: 'CEphoto, Uwe Aranas', license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0', page: 'https://commons.wikimedia.org/wiki/File:Kuala_Lumpur_Malaysia_Skyline-03.jpg' },
  ronda300: { src: commons('3/3c', 'Merdeka_Square_Kuala_Lumpur_Malaysia.jpg'), alt: 'Memorial arches at Merdeka Square, Kuala Lumpur', author: 'Philip Nalangan', license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0', page: 'https://commons.wikimedia.org/wiki/File:Merdeka_Square_Kuala_Lumpur_Malaysia.jpg' },
  fares: { src: commons('6/67', 'Kuala_Lumpur._Jamek_Mosque._2019-12-08_17-34-20.jpg'), alt: 'Masjid Jamek Sultan Abdul Samad, Kuala Lumpur', author: 'Shesmax', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0', page: 'https://commons.wikimedia.org/wiki/File:Kuala_Lumpur._Jamek_Mosque._2019-12-08_17-34-20.jpg' },
  saved: { src: commons('7/73', 'Murugan_statue_Batu_Caves_01.jpg'), alt: 'Murugan statue and steps at Batu Caves', author: 'Aumars', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0', page: 'https://commons.wikimedia.org/wiki/File:Murugan_statue_Batu_Caves_01.jpg' },
  airport: { src: commons('5/5c', 'KLIA_Terminal_1_05112025_10.jpg'), alt: 'Check-in hall at KLIA Terminal 1', author: 'Rulwarih', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0', page: 'https://commons.wikimedia.org/wiki/File:KLIA_Terminal_1_05112025_10.jpg' },
}
