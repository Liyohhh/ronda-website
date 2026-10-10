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
}
