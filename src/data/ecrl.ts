// ECRL (East Coast Rail Link), shown on the About page as a line that is coming. Not in the trip planner: there is no
// timetable yet (it goes in when the operator publishes one, see the database repo docs/ROADMAP.md, phase 3).
// No fares on purpose: none are official yet. Fare posters seen on social media (e.g. "RM35-RM110 from Gombak") are
// not official (The Star fact-check, 3 Jul 2026; MRL called them speculation). Add fares only from MRL or the
// Ministry of Transport.
//
// Sources (checked 18 Oct 2026):
// - Stations (20, north to south) and phase split: Malay Mail, 3 Jan 2025 (MRL's list), The Smart Local station table;
//   the same 20 names appear on the Fawwaz Media map the owner sent.
// - Phase 1 Kota Bharu - ITT Gombak, passenger service targeted for mid-December 2026, subject to testing:
//   The Star and NST, 6 Oct 2026 (MRL); Bernama, Oct 2026 (fares announced by the ministry this month, tickets on
//   sale in November).
// - Phase 2 ITT Gombak - Jalan Kastam, due to be finished by December 2027 with service from January 2028: Transport
//   Minister, NST, Aug 2026.
// - Interchanges: ITT Gombak with LRT Kelana Jaya Line (Gombak); Jalan Kastam with KTM Komuter (NST, Apr 2025).

export type EcrlStation = { name: string; phase: 1 | 2; link?: string }

export const ECRL_STATIONS: EcrlStation[] = [
  { name: 'Kota Bharu', phase: 1 },
  { name: 'Pasir Puteh', phase: 1 },
  { name: 'Jerteh', phase: 1 },
  { name: 'Bandar Permaisuri', phase: 1 },
  { name: 'Kuala Terengganu', phase: 1 },
  { name: 'Dungun', phase: 1 },
  { name: 'Kemasik', phase: 1 },
  { name: 'Chukai', phase: 1 },
  { name: 'Cherating', phase: 1 },
  { name: 'Kuantan Port City', phase: 1 },
  { name: 'Kota SAS', phase: 1 },
  { name: 'Paya Besar', phase: 1 },
  { name: 'Maran', phase: 1 },
  { name: 'Temerloh', phase: 1 },
  { name: 'Bentong', phase: 1 },
  { name: 'ITT Gombak', phase: 1, link: 'lrt-kelana-jaya' },
  { name: 'Serendah Baru', phase: 2 },
  { name: 'Puncak Alam', phase: 2 },
  { name: 'Kapar', phase: 2 },
  { name: 'Jalan Kastam', phase: 2, link: 'ktm-port-klang' },
]

export const ECRL_SOURCES: { label: string; url: string }[] = [
  { label: 'The Star, 6 Oct 2026', url: 'https://www.thestar.com.my/business/business-news/2026/10/06/ecrl-targets-mid-december-start-for-commercial-operations' },
  { label: 'Bernama, Oct 2026', url: 'https://www.bernama.com/en/general/news.php?id=2616039' },
  { label: 'The Star fact-check, 3 Jul 2026', url: 'https://www.thestar.com.my/news/true-or-not/2026/07/03/quickcheck-has-the-ecrl-announced-its-ticket-prices-ahead-of-its-january-2027-launch' },
  { label: 'Malay Mail, 3 Jan 2025', url: 'https://www.malaymail.com/news/malaysia/2025/01/03/malaysias-ecrl-progress-recapped-latest-updates-station-details-and-why-it-matters/160468' },
  { label: 'NST, Aug 2026', url: 'https://www.nst.com.my/amp/business/corporate/2026/08/1510943/ecrl-track-start-commercial-operations-jan-2027-watch' },
]
