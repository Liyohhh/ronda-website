// Printed-style trail map pictures, made from the trail's walking route in the database (scripts in the database
// repo's notes: OpenStreetMap basemap, OSRM walking legs). Shown on the trail page; trails without one show nothing.
// Map data © OpenStreetMap contributors (credit is printed on the picture).
export const TRAIL_MAPS: Record<string, { webp: string; jpg: string; alt: string }> = {
  heritage: {
    webp: '/trails/heritage-map.webp',
    jpg: '/trails/heritage-map.jpg',
    alt: 'Map of the Heritage Trail: from LRT Masjid Jamek past Masjid Jamek, Merdeka Square, the Sultan Abdul Samad Building, Central Market and Stadium Merdeka to the Old KL Railway Station, about 4 km and 55 minutes on foot.',
  },
  shopping: {
    webp: '/trails/shopping-map.webp',
    jpg: '/trails/shopping-map.jpg',
    alt: 'Map of the Bukit Bintang & KLCC Shopping Trail: from LRT KLCC past Suria KLCC, Pavilion Kuala Lumpur, Bukit Bintang Walk, Lot 10, The Starhill and The Exchange TRX to MRT Tun Razak Exchange, about 3.2 km and 45 minutes on foot.',
  },
  'rooftop-dining': {
    webp: '/trails/rooftop-dining-map.webp',
    jpg: '/trails/rooftop-dining-map.jpg',
    alt: "Map of the Fine Dining & Rooftop Trail: from LRT KLCC past Marini's on 57, SkyBar at Traders Hotel, THIRTY8 at Grand Hyatt, Atmosphere 360 at KL Tower and Heli Lounge Bar to Monorail Raja Chulan, about 4.6 km and an hour on foot.",
  },
  'street-art': {
    webp: '/trails/street-art-map.webp',
    jpg: '/trails/street-art-map.jpg',
    alt: 'Map of the Street Art & Mural Trail: from MRT Pasar Seni past Kwai Chai Hong and the River of Life riverside walk to LRT Masjid Jamek, about 1.5 km and 20 minutes on foot.',
  },
}
