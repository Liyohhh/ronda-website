// Title and description for each page (used by SeoTags.tsx)
export type PageMeta = { title: string; description: string }

const DEFAULT_META: PageMeta = {
  title: "Ronda2Go · Let's Ronda",
  description:
    "Plan trips on all of Malaysia's public transport, trains and buses, in one place. Live buses and trains, fares and routes in English, Malay, Chinese and Arabic.",
}

const PAGES: Record<string, PageMeta> = {
  '/': {
    title: 'Ronda2Go – Malaysia Train & Bus Trip Planner',
    description:
      'Plan trips on MRT, LRT, KTM, Monorail and buses across Malaysia. Live arrivals, fares and routes in English, Malay, Chinese and Arabic.',
  },
  '/trails': {
    title: 'Trails: Explore Malaysia by Train & Bus – Ronda2Go',
    description:
      'Ready-made trails for food, heritage, shopping, nature and fun, all reachable by public transport. Pick a trail and Ronda2Go plans the route.',
  },
  '/live': {
    title: 'Live Bus & Train Arrivals in Malaysia – Ronda2Go',
    description:
      'Real-time positions and arrival times for buses and trains across Malaysia. See where your ride is right now.',
  },
  '/about': {
    title: "About Ronda2Go – Malaysia's Public Transport App",
    description:
      "Ronda2Go by Movinexa makes Malaysia's trains and buses easy to use, with one planner for every line in four languages.",
  },
  '/credits': {
    title: 'Credits & Data Sources – Ronda2Go',
    description:
      "The open data, partners and tools that power Ronda2Go's routes, live arrivals and maps.",
  },
  '/help': {
    title: 'Help Centre – Ronda2Go',
    description:
      "Answers on using Ronda2Go: planning trips, live arrivals, payments, accounts and policies for Malaysia's trains and buses.",
  },
  '/help/general': {
    title: 'Getting Started with Ronda2Go – Help',
    description:
      'How to plan a trip, read routes and live arrivals, switch languages and save places in Ronda2Go.',
  },
  '/help/payments': {
    title: 'Payments & Fares Help – Ronda2Go',
    description:
      "How fares are shown in Ronda2Go and how paying works on Malaysia's trains and buses.",
  },
  '/help/policies': {
    title: 'Privacy, Terms & Policies – Ronda2Go',
    description:
      "Read Ronda2Go's privacy policy, terms of use and how we handle your location and account data.",
  },
  '/trails/food-hawker': {
    title: 'Hawker & Night Market Trail in KL by MRT – Ronda2Go',
    description:
      '9 stops of Chinese, Malay and Indian street food plus a night market for every evening, from MRT Bukit Bintang to MRT Taman Tun Dr Ismail.',
  },
}

export function getPageMeta(pathname: string): PageMeta {
  // treat "/about/" the same as "/about"
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  return PAGES[path] ?? DEFAULT_META
}
