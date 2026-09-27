// Content shown in the header's service dropdowns (Alibaba-style hover panels).
// Durations are approximate and for display only; confirm before using in bookings.

export type ServiceItem = { name: string; detail: string }
export type ServiceColumn = { title: string; items: ServiceItem[] }
export type ServiceOption = {
  key: 'merchant' | 'busShuttle' | 'airportTransfer' | 'chauffeur'
  columns: ServiceColumn[]
  promo: { title: string; text: string; cta: string }
}

export const SERVICE_OPTIONS: ServiceOption[] = [
  {
    key: 'merchant',
    columns: [
      {
        title: 'Shopping near stations',
        items: [
          { name: 'Pavilion Kuala Lumpur', detail: 'MRT Bukit Bintang' },
          { name: 'Suria KLCC', detail: 'LRT KLCC' },
          { name: 'Mid Valley Megamall', detail: 'KTM Mid Valley' },
          { name: 'Sunway Pyramid', detail: 'BRT Sunway Lagoon' },
        ],
      },
      {
        title: 'Attractions',
        items: [
          { name: 'Petronas Twin Towers', detail: 'LRT KLCC' },
          { name: 'Batu Caves', detail: 'KTM Batu Caves' },
          { name: 'Central Market (Pasar Seni)', detail: 'LRT / MRT Pasar Seni' },
          { name: 'KL Bird Park', detail: 'Near KTM Kuala Lumpur' },
        ],
      },
      {
        title: 'Food & dining',
        items: [
          { name: 'Jalan Alor Food Street', detail: 'MRT Bukit Bintang' },
          { name: 'Petaling Street', detail: 'LRT / MRT Pasar Seni' },
          { name: 'Kampung Baru', detail: 'LRT Kampung Baru' },
          { name: 'Brickfields (Little India)', detail: 'KL Sentral' },
        ],
      },
    ],
    promo: {
      title: 'Become a RONDA merchant',
      text: 'List your business in RONDA 300, the places within 300m of every station.',
      cta: 'Partner with us',
    },
  },
  {
    key: 'busShuttle',
    columns: [
      {
        title: 'Popular express bus routes',
        items: [
          { name: 'Kuala Lumpur → Penang', detail: 'Approx. 5 hrs' },
          { name: 'Kuala Lumpur → Johor Bahru', detail: 'Approx. 4.5 hrs' },
          { name: 'Kuala Lumpur → Melaka', detail: 'Approx. 2 hrs' },
          { name: 'Kuala Lumpur → Ipoh', detail: 'Approx. 3 hrs' },
          { name: 'Kuala Lumpur → Singapore', detail: 'Approx. 5–6 hrs' },
        ],
      },
      {
        title: 'Bus terminals',
        items: [
          { name: 'Terminal Bersepadu Selatan (TBS)', detail: 'LRT / KTM / ERL Bandar Tasik Selatan' },
          { name: 'Terminal Bersepadu Gombak (TBG)', detail: 'East Coast routes' },
          { name: 'Pudu Sentral', detail: 'LRT Plaza Rakyat' },
          { name: 'KL Sentral', detail: 'Airport and Genting coaches' },
        ],
      },
      {
        title: 'City & shuttle services',
        items: [
          { name: 'GoKL City Bus', detail: 'Free city loop, Kuala Lumpur' },
          { name: 'Smart Selangor', detail: 'Free bus, Selangor' },
          { name: 'Genting Highlands shuttle', detail: 'From KL Sentral' },
          { name: 'Hop On Hop Off KL', detail: 'City sightseeing bus' },
        ],
      },
    ],
    promo: {
      title: 'Compare bus operators',
      text: 'See schedules and seats across operators in one search.',
      cta: 'Search buses',
    },
  },
  {
    key: 'airportTransfer',
    columns: [
      {
        title: 'Airports',
        items: [
          { name: 'KLIA Terminal 1', detail: 'Sepang, Selangor' },
          { name: 'KLIA Terminal 2', detail: 'Sepang, Selangor' },
          { name: 'Sultan Abdul Aziz Shah Airport', detail: 'Subang' },
          { name: 'Penang International Airport', detail: 'Bayan Lepas' },
          { name: 'Senai International Airport', detail: 'Johor Bahru' },
        ],
      },
      {
        title: 'Rail to KLIA',
        items: [
          { name: 'KLIA Ekspres', detail: 'KL Sentral → KLIA, non-stop' },
          { name: 'KLIA Transit', detail: 'Stops at BTS, Putrajaya & Cyberjaya, Salak Tinggi' },
        ],
      },
      {
        title: 'Road transfers',
        items: [
          { name: 'Airport coach', detail: 'KL Sentral ↔ KLIA T1 / T2' },
          { name: 'Private car transfer', detail: 'Door-to-door, fixed price' },
          { name: 'Group van transfer', detail: 'Up to 10 passengers' },
        ],
      },
    ],
    promo: {
      title: 'Landing soon?',
      text: 'Book a transfer ahead and get picked up at arrivals.',
      cta: 'Book a transfer',
    },
  },
  {
    key: 'chauffeur',
    columns: [
      {
        title: 'Services',
        items: [
          { name: 'Hourly hire', detail: 'Driver on standby, minimum hours apply' },
          { name: 'Full-day hire', detail: 'Up to 10 hours' },
          { name: 'Corporate & events', detail: 'Meetings, weddings, VIP guests' },
        ],
      },
      {
        title: 'Popular day trips',
        items: [
          { name: 'Kuala Lumpur city tour', detail: 'KLCC, Merdeka Square, Batu Caves' },
          { name: 'Putrajaya', detail: 'Mosques, bridges and lake' },
          { name: 'Melaka heritage', detail: 'UNESCO World Heritage city' },
          { name: 'Genting Highlands', detail: 'Hill resort' },
          { name: 'Kuala Selangor fireflies', detail: 'Evening trip' },
        ],
      },
      {
        title: 'Vehicle types',
        items: [
          { name: 'Sedan', detail: 'Up to 3 passengers' },
          { name: 'MPV', detail: 'Up to 6 passengers' },
          { name: 'Premium MPV', detail: 'Toyota Alphard / Vellfire class' },
          { name: 'Van', detail: 'Up to 10 passengers' },
        ],
      },
    ],
    promo: {
      title: 'Travel in comfort',
      text: 'Licensed, vetted drivers for city trips and long journeys.',
      cta: 'Hire a chauffeur',
    },
  },
]
