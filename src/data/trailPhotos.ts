// Trail cover photos from Wikimedia Commons. Every licence here allows commercial use:
// CC0 / public domain need no credit; CC BY and CC BY-SA need the credit shown on the trail page
// and in the About page's photo credits (author, licence, link). BY-SA applies to the photo only.
// Chosen 28 Sep 2026; `page` is the file's Commons page with the full licence details.

// focus: where the picture is cropped around when it does not fit its box (CSS object-position, e.g. '50% 30%')
// owner: a photo the owner supplied (26 Oct 2026), served from public/places; its source and licence are recorded by the
// owner in docs/RONDA_Photo_Credits.xlsx, so it is left out of the About page credit list until then
export type TrailPhoto = { src: string; author: string; license: string; licenseUrl: string | null; page: string; focus?: string; owner?: boolean }

const commons = (path: string, file: string) => `https://upload.wikimedia.org/wikipedia/commons/thumb/${path}/${file}/1280px-${file}`

export const TRAIL_PHOTOS: Record<string, TrailPhoto> = {
  shopping: { src: commons('9/95', 'Pavilion_KL_outview_2_%28211030%29.jpg'), author: '*angys*', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0', page: 'https://commons.wikimedia.org/wiki/File:Pavilion_KL_outview_2_(211030).jpg' },
  heritage: { src: '/places/sultanAbdulSamad.jpg', author: 'TODO', license: 'TODO', licenseUrl: null, page: '', focus: '50% 30%', owner: true }, // owner's photo, 26 Oct 2026
  museum: { src: commons('b/b6', 'Muzium_Negara%2C_2023_%2801%29.jpg'), author: 'Bahnfrend', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0', page: 'https://commons.wikimedia.org/wiki/File:Muzium_Negara,_2023_(01).jpg' },
  nature: { src: commons('b/bb', 'Perdana_Botanical_Gardens_in_2023_01.jpg'), author: 'Renek78', license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', page: 'https://commons.wikimedia.org/wiki/File:Perdana_Botanical_Gardens_in_2023_01.jpg' },
  'food-hawker': { src: commons('1/11', 'Jalan_Alor_Street_View1.jpg'), author: 'Alexander Synaptic', license: 'CC BY-SA 2.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0', page: 'https://commons.wikimedia.org/wiki/File:Jalan_Alor_Street_View1.jpg' },
  'street-art': { src: commons('1/14', 'Kwai_Chai_Hong_4.jpg'), author: 'Slleong', license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', page: 'https://commons.wikimedia.org/wiki/File:Kwai_Chai_Hong_4.jpg' },
  mosques: { src: '/places/masjidJamek.jpg', author: 'TODO', license: 'TODO', licenseUrl: null, page: '', owner: true }, // owner's photo, 26 Oct 2026
  'cultural-harmony': { src: commons('3/36', 'Thean_Hou_Temple%2C_Kuala_Lumpur-1.jpg'), author: 'Alexey Komarov', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0', page: 'https://commons.wikimedia.org/wiki/File:Thean_Hou_Temple,_Kuala_Lumpur-1.jpg' },
  'cafe-hopping': { src: commons('1/1f', 'Tingkap_Cafe_2.jpg'), author: 'Slleong', license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', page: 'https://commons.wikimedia.org/wiki/File:Tingkap_Cafe_2.jpg' },
  instagrammable: { src: commons('c/c5', 'Saloma_link_at_night.jpg'), author: 'Sheikh Izham', license: 'CC BY 2.0', licenseUrl: 'https://creativecommons.org/licenses/by/2.0', page: 'https://commons.wikimedia.org/wiki/File:Saloma_link_at_night.jpg' },
  'rooftop-dining': { src: commons('c/cc', 'Kuala_Lumpur_Skyline_at_dusk_1.jpg'), author: 'Walkerssk', license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', page: 'https://commons.wikimedia.org/wiki/File:Kuala_Lumpur_Skyline_at_dusk_1.jpg' },
  // Fun & Activities trails: the building of one of the trail's stops (same photos as placePhotos.ts), 15 Oct 2026
  climbing: { src: commons('6/68', 'KL_Eco_City_in_February_2020-01.jpg'), author: 'Renek78', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0', page: 'https://commons.wikimedia.org/wiki/File:KL_Eco_City_in_February_2020-01.jpg' },
  arcades: { src: commons('5/5b', 'The_Mines_Shopping_Mall%2C_Mines_Wellness_City_20231015_123334.jpg'), author: 'Wiki Farazi', license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', page: 'https://commons.wikimedia.org/wiki/File:The_Mines_Shopping_Mall,_Mines_Wellness_City_20231015_123334.jpg' },
  'active-play': { src: commons('d/d1', 'Avenue_K%2C_Kuala_Lumpur_20260413_095055.jpg'), author: 'Wiki Farazi', license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/', page: 'https://commons.wikimedia.org/wiki/File:Avenue_K,_Kuala_Lumpur_20260413_095055.jpg', focus: '50% 30%' },
  'escape-rooms': { src: commons('7/72', 'The_LINC_Mall.jpg'), author: 'Kaart @ Mapillary.com', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0', page: 'https://commons.wikimedia.org/wiki/File:The_LINC_Mall.jpg' },
  'laser-tag': { src: commons('3/33', 'Sunway_Pyramid_interior_%28240131%29_01.jpg'), author: '*angys*', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0', page: 'https://commons.wikimedia.org/wiki/File:Sunway_Pyramid_interior_(240131)_01.jpg' },
  // 15 Oct 2026: covers for the trails that had none, a photo of one of the trail's stops (see placePhotos.ts)
  putrajaya: { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Masjid_Putra_and_Perdana_Putra.JPG/1280px-Masjid_Putra_and_Perdana_Putra.JPG', author: 'Mimihitam', license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0', page: 'https://commons.wikimedia.org/wiki/File:Masjid_Putra_and_Perdana_Putra.JPG' },
  kids: { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Underwater_tunnel_in_Aquaria_KLCC.jpg/1280px-Underwater_tunnel_in_Aquaria_KLCC.jpg', author: 'Phalinn Ooi from Kuala Lumpur, Malaysia', license: 'CC BY 2.0', licenseUrl: 'https://creativecommons.org/licenses/by/2.0', page: 'https://commons.wikimedia.org/wiki/File:Underwater_tunnel_in_Aquaria_KLCC.jpg' },
  events: { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/National_Stadium_Bukit_Jalil_2014_AFF_Suzuki_Cup_final.jpg/1280px-National_Stadium_Bukit_Jalil_2014_AFF_Suzuki_Cup_final.jpg', author: 'Phalinn Ooi', license: 'CC BY 2.0', licenseUrl: 'https://creativecommons.org/licenses/by/2.0', page: 'https://commons.wikimedia.org/wiki/File:National_Stadium_Bukit_Jalil_2014_AFF_Suzuki_Cup_final.jpg' },
  'halal-fine-dining': { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Royale_Chulan_Kuala_Lumpur.jpg/1280px-Royale_Chulan_Kuala_Lumpur.jpg', author: '*angys*', license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0', page: 'https://commons.wikimedia.org/wiki/File:Royale_Chulan_Kuala_Lumpur.jpg' },
  'mall-hopping': { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Nu_sentral_mall1.jpg/1280px-Nu_sentral_mall1.jpg', author: 'Brownc', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0', page: 'https://commons.wikimedia.org/wiki/File:Nu_sentral_mall1.jpg' },
  // 26 Oct 2026: covers for the last two trails (Flickr through Openverse): a plated dish, and Putrajaya Challenge Park
  michelin: { src: 'https://live.staticflickr.com/3482/3462048736_0ef84fcd6b_b.jpg', author: 'Geoff Peters', license: 'CC BY 2.0', licenseUrl: 'https://creativecommons.org/licenses/by/2.0/', page: 'https://www.flickr.com/photos/54359128@N00/3462048736' },
  'extreme-park': { src: 'https://live.staticflickr.com/1788/29294647418_76109d5a73_b.jpg', author: 'U.S. Embassy Kuala Lumpur', license: 'Public domain', licenseUrl: 'https://creativecommons.org/publicdomain/mark/1.0/', page: 'https://www.flickr.com/photos/52445638@N06/29294647418', focus: '50% 10%' },
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
