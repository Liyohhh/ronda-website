// ECRL (East Coast Rail Link): a line in the Lines tab (opens with its stations and fares from Gombak) and a card on the
// About page. Not in the trip planner yet: there is no timetable (it goes in when MRL publishes one, see the database
// repo docs/ROADMAP.md, phase 3).
//
// Sources (checked 26 Oct 2026):
// - Stations (20, north to south) and phase split: Malay Mail, 3 Jan 2025 (MRL's list), The Smart Local station table;
//   the same 20 names appear on the Fawwaz Media map the owner sent.
// - Phase 1 Kota Bharu - Terminal Bersepadu Gombak: passenger service from 12 Dec 2026, subject to safety and regulatory approval;
//   tickets on sale from mid-November (Bernama and theSun, 19 Oct 2026).
// - Phase 2 Terminal Bersepadu Gombak - Jalan Kastam, due to be finished by December 2027 with service from January 2028: Transport
//   Minister, NST, Aug 2026.
// - Fares: announced by MRL on 19 Oct 2026 after the government approved them on 16 Oct (Bernama, theSun, DagangNews).
//   They are STARTING fares, one way, the same both ways; the real fare changes with time, demand and seats (dynamic
//   pricing). Transit (economy, every station) and Express (Gombak, KotaSAS, Kuala Terengganu, Kota Bharu only).
//   Confirmed in the news: Kota Bharu RM125 / Express RM147 (523 km), Kuala Terengganu RM95 / RM110, KotaSAS RM60 /
//   RM68 (`confirmed: true`). The other Transit fares and the distances are from MRL's fare chart as reposted by
//   autopros.my (the owner sent it, 26 Oct 2026); TODO check them on MRL's own ticket site when sales open.
//   Concessions: 50% off for children 2-12, seniors 60+, OKU card holders and government pensioners; 40% off for
//   students 13-24 (The Vibes, 19 Oct 2026).
// - Names: as on ecrl.com.my (checked 4 Nov 2026: "Terminal Bersepadu Gombak", "KotaSAS") and MRL's platform sign at
//   Terminal Bersepadu Gombak (owner's photo, 4 Nov 2026), which also gives "Bandar Serendah" (MOF, Selangor ECRL
//   stations). ecrl.com.my still says January 2027 on its home page; the 12 Dec 2026 date is the Transport Minister's
//   (20 Oct 2026, Paul Tan, Harian Metro).
// - Interchanges (the sign's connecting stations): Temerloh with KTM (the East Coast line at Mentakab, joined by a spur:
//   NST, Apr 2025), Terminal Bersepadu Gombak with LRT Kelana Jaya Line (Gombak) and the TBG bus terminal, Bandar
//   Serendah and Jalan Kastam with KTM Komuter (NST, Apr 2025).

// km / fareRm / expressRm: from Terminal Bersepadu Gombak (phase 1 stations only); express = the Express train stops here;
// links: the lines to change to here
export type EcrlStation = {
  name: string
  phase: 1 | 2
  links?: string[]
  km?: number
  fareRm?: number
  expressRm?: number
  confirmed?: boolean
}

export const ECRL_STATIONS: EcrlStation[] = [
  { name: 'Kota Bharu', phase: 1, km: 523, fareRm: 125, expressRm: 147, confirmed: true },
  { name: 'Pasir Puteh', phase: 1, km: 490, fareRm: 118 },
  { name: 'Jerteh', phase: 1, km: 473, fareRm: 114 },
  { name: 'Bandar Permaisuri', phase: 1, km: 436, fareRm: 107 },
  { name: 'Kuala Terengganu', phase: 1, km: 378, fareRm: 95, expressRm: 110, confirmed: true },
  { name: 'Dungun', phase: 1, km: 317, fareRm: 82 },
  { name: 'Kemasik', phase: 1, km: 285, fareRm: 75 },
  { name: 'Chukai', phase: 1, km: 256, fareRm: 69 },
  { name: 'Cherating', phase: 1, km: 246, fareRm: 67 },
  { name: 'Kuantan Port City', phase: 1, km: 222, fareRm: 62 },
  { name: 'KotaSAS', phase: 1, km: 209, fareRm: 60, expressRm: 68, confirmed: true },
  { name: 'Paya Besar', phase: 1, km: 186, fareRm: 55 },
  { name: 'Maran', phase: 1, km: 127, fareRm: 42 },
  { name: 'Temerloh', phase: 1, km: 91, fareRm: 35, links: ['ktm-intercity'] },
  { name: 'Bentong', phase: 1, km: 40, fareRm: 24 },
  { name: 'Terminal Bersepadu Gombak', phase: 1, links: ['lrt-kelana-jaya'] },
  { name: 'Bandar Serendah', phase: 2, links: ['ktm-port-klang'] },
  { name: 'Puncak Alam', phase: 2 },
  { name: 'Kapar', phase: 2 },
  { name: 'Jalan Kastam', phase: 2, links: ['ktm-port-klang'] },
]

export const ECRL_SOURCES: { label: string; url: string }[] = [
  { label: 'Bernama, 19 Oct 2026', url: 'https://www.bernama.com/en/general/news.php?id=2622360' },
  { label: 'theSun, 19 Oct 2026', url: 'https://thesun.my/news/malaysia-news/gombak-kota-bharu-ecrl-ticket-prices-start-at-rm125-sales-begin-mid-november/' },
  { label: 'DagangNews, 19 Oct 2026', url: 'https://www.dagangnews.com/index.php/article/terkini/tambang-ecrl-sehala-kelas-ekonomi-rm125-dari-gombak-ke-kota-bharu-rm60-ke-kotasas-kuantan-75977' },
  { label: 'The Vibes, 19 Oct 2026', url: 'https://www.thevibes.com/articles/news/128519/ecrl-fares-start-at-rm60-with-50-discounts-for-children-seniors-and-oku' },
  { label: 'The Star, 6 Oct 2026', url: 'https://www.thestar.com.my/business/business-news/2026/10/06/ecrl-targets-mid-december-start-for-commercial-operations' },
  { label: 'ECRL (MRL), 4 Nov 2026', url: 'https://ecrl.com.my/' },
  { label: 'Paul Tan, 20 Oct 2026', url: 'https://paultan.org/bm/2026/10/20/ecrl-mula-beroperasi-pada-12-disember-2026-diskaun-30-bagi-tiket-ekonomi-selama-sebulan-loke/' },
  { label: 'NST, Apr 2025', url: 'https://www.nst.com.my/amp/news/nation/2025/04/1200947/ktmb-ecrl-link-lays-tracks-enhanced-services' },
  { label: 'Malay Mail, 3 Jan 2025', url: 'https://www.malaymail.com/news/malaysia/2025/01/03/malaysias-ecrl-progress-recapped-latest-updates-station-details-and-why-it-matters/160468' },
  { label: 'NST, Aug 2026', url: 'https://www.nst.com.my/amp/business/corporate/2026/08/1510943/ecrl-track-start-commercial-operations-jan-2027-watch' },
]
