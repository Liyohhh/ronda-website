# Test report

## Run - 7 Nov 2026 (Google search: site name, logo, one address per page)

- Why: a Google search for "Ronda2go" shows an unrelated Instagram account (@ronda2go) and not ronda2go.com. The domain
  is 6 days old under this name, and the site gave Google no site name, no logo and no main address per page.
- Checked live before the change: ronda2u.com and www.ronda2u.com redirect 301 to the same page on ronda2go.com (good);
  http redirects to https (good); robots.txt lets Googlebot in and lists the sitemap (good). Problems: www.ronda2go.com
  shows a second copy of the site with no redirect; no canonical link; no structured data; share picture given as a
  relative address; any unknown address answers 200 like a real page; /services (hidden) listed in the sitemap.
- Website: WebSite and Organization data (name Ronda2Go, logo, legal name Movinexa) in index.html; every page now
  sets its own canonical link and og:url on https://ronda2go.com (src/components/SeoTags.tsx, src/lib/seo.ts); the
  not-found page adds noindex; share picture and texts with full addresses and the nationwide text; /services left
  out of the sitemap while services are hidden. No new visible text.
- Checked (local): structured data reads as JSON; canonical on /, /trails/ (no trailing slash) and /about; noindex
  only on the not-found page and gone after leaving it; one canonical link at a time; build writes 37 sitemap pages,
  none /services; typecheck, lint and tests pass.
- Live (PR Liyohhh/ronda-website#5 merged into main, c336bbb): structured data on the live page; canonical and og:url
  https://ronda2go.com/trails on /trails/; noindex on an unknown address; 37 sitemap pages, none /services; full share
  picture address. www.ronda2go.com/trails now redirects 301 to ronda2go.com/trails (Cloudflare rule, owner).
- Search Console: sitemap live test "URL is available to Google"; Google had not read the sitemap yet ("Couldn't fetch",
  no last read). Browser tests on the PR were still running at merge (lint, types, unit tests, build passed).
- Cloudflare Web Analytics was blocked by the site's CSP (script-src 'self'). Now allowed in scripts/csp.mjs: script
  from https://static.cloudflareinsights.com, reports to https://cloudflareinsights.com. Checked: the built _headers
  lists both. Not proven yet on the live site (goes live with the next merge into main).
- Owner to do: request indexing for /, /trails and /about; own social accounts. Not proven yet: Google's result, which
  can take days to weeks.

## Run - 7 Nov 2026 (production outage: database disk full)

- What happened: the database stopped at 12:24:39 Malaysia time with "No space left on device" and came back by itself
  at 12:29:29 (about 5 minutes). Search, trips and live buses failed in that time; the website itself stayed up.
- During a full reload of the hidden place_index table (about 440,000 of 514,592 rows sent). Free disk space was not
  checked first. Not proven as the only cause: database 974 MB and write-ahead log 832 MB after recovery, and disk size
  and use are only visible in the dashboard. Why it recovered is also not known.
- Checked after: search 200, trip planner 200, live buses 200; database not read-only.
- Open: read disk size and use in the dashboard before any further load. Reloads are paused until then.

## Run - 7 Nov 2026 (own place search: hidden table, speed test)

- Database (20261107090000_place_index.sql and 20261107100000_place_index_indexes.sql, applied with the owner's go): hidden
  table place_index, 511,499 rows from the Geofabrik file of 6 Nov (182,743 roads, 178,295 addresses, 133,140 places,
  17,321 areas), 172 MB with indexes; public roles cannot read it and nothing on the site uses it yet.
- Speed: "pavilion" 1 ms, typo "paviliom bukit jalil" 63 ms and finds Pavilion Bukit Jalil; "jalan" 635 ms and
  "jalan ampng" 787 ms are too slow (today's search takes 9 to 62 ms). Common words need a word index before this can
  go live.
- Finds: "Jalan PJS 11/18" and 10 Jalan PJS 11/18; number 16 is not in OpenStreetMap. Not compared with Photon yet.
- Word index added (20261107110000_place_index_words.sql, owner's go; 76,832 words, 206 MB in all, still hidden):
  "jalan ampng" 45 ms, "jalan" 94 ms, "paviliom bukit jalil" 36 ms. Right result on 5 of 5 sample searches, and nearest
  first for "starbucks" near KLCC. To fix: a road repeats once per stretch; "jalan" alone gives odd results.

## Run - 7 Nov 2026 (nightly route check sends trips a few at a time)

- Why: the database sent all 56 main trips in one instant, with no second try: 34 of 56 failed on 5 Nov and 53 of 56 on
  6 Nov, all HTTP 546 (Edge Function limit).
- Database (migration 20261106210000_route_audit_paced.sql, applied with the owner's go): 6 trips a minute from 02:31 to
  03:20 Malaysia time, resending 429, any 5xx and no answer; results read at 03:25.
- Checked: jobs and functions in place, public role cannot run it. Not yet proven: first paced run is the coming night.

## Run - 6 Nov 2026, night (Lines page: full bus line list)

- Website: the one Bus lines tile opens the line panel on its own Bus lines tab: every bus line as a card (code and both
  ends of the line, sorted by code) with a search box, typos allowed. A bus route opens in the same panel and its tab
  leads back to the list. The owner chose this after seeing a list with tabs and tiles in the dropdown.
- Colour: Bus lines (tile, tab, panel header) now use the site navy #222D52, used by no line, because the bus blue
  #2F6BD8 looked the same as the ECRL's #0065DE. Each bus route keeps its own colour.
- Scrolling, cause found: the page fade-in added on the work branch kept a transform on the page's main area, so every
  fixed panel inside it (line panel and any other panel in main) was as tall as the whole page (5,489 px) and scrolled
  with it. The fade now leaves nothing behind. Measured on the local site with all 322 bus lines: panel height = screen
  height at 1280 x 800 and 390 x 844, wheel over the panel moves the page 0 px. The page behind is also locked while the
  line panel is open, and the panel and the tile dropdown no longer pass their scroll on.
- Tests: e2e mocks now answer record_search_pick (added with the search picks; 14 trip and search tests failed on it
  at desktop and phone size). Unit 306 / 306. e2e 244 passed, 6 skipped. Earlier runs had 2 slow timeouts (trails, chat) that
  passed when run again. Lint clean on the project; the 401 errors npm run lint prints all come from
  a leftover local working copy, not from the project.
- Screenshots with real data at 1280 and 390 px. Not on the live site or the preview until pushed.

## Run - 6 Nov 2026, night (search: a type of place near me)

- Why: Google Maps lists the nearest ATMs, mosques or pharmacies when you type just that word; we searched names
  only, wherever they were.
- Database (migration 20261106190000_search_categories.sql, applied to production 6 Nov with the owner's go): 84
  words in English, Malay, Chinese and Arabic for hospital, clinic, ATM, bank, pharmacy, toilet, police, post office,
  mosque/surau, church, temple, hotel, mall, supermarket, restaurant, food court, cafe/kopitiam, fast food, park and
  museum (table search_categories, can grow without code). One of them typed on its own with a position gives the
  nearest ones within 10 km, closest first, with distance and area; places with no name take the type's name
  ("Toilet"). New column distance_m. Without a position, or for anything else, place search is as before.
- Website: when places come with distances they are listed first, before a station named after the word ("masjid"
  puts the nearest mosques before LRT Masjid Jamek). Unit tests 310 / 310. Live with the next website deploy.
- The position is the map (live map), the hub (hub pages) or the other end of the trip (Home, trip panel). Home with
  nothing chosen yet has no position, so it searches by name.
- Production: search, geocode and security smoke 59 / 59; 10 to 57 ms per search.

| # | Typed near MRT Maluri | Top results | Result |
|---|---|---|---|
| 1 | atm | CIMB · ATM · 260 m · Pudu Ulu / ATM · 340 m · Maluri / MEPS · 490 m | Pass |
| 2 | masjid, مسجد | Surau Tarbiah · Mosque · 670 m / Masjid Al-Imam Ash-Shafie · 1.1 km | Pass |
| 3 | 医院 | Sunway Medical Centre Velocity · Hospital · 820 m / Hospital Rehabilitasi Cheras · 2.1 km | Pass |
| 4 | farmasi | Hai-O · Pharmacy · 1.3 km / Caring · 1.7 km | Pass |
| 5 | hotel | MH Hotel & Residence · 270 m / Hotel Mezzo · 390 m | Pass |
| 6 | pavilion, masjid negara | by name, as before | Pass |
| 7 | masjid (no position) | by name, as before | Pass |

- Excel report: TC-PLN-028 added in the database repo.

## Run - 6 Nov 2026, evening (place data refresh tries again)

- Why: the monthly places refresh of 28 Oct failed (Overpass answered "at capacity", HTTP 502) and nothing asked
  again, so our places were last loaded on 14 Oct; the first load of area names on 6 Nov also needed a second try.
- Database (migration 20261106170000_osm_load_retries.sql, applied to production 6 Nov with the owner's go): one job
  every 20 minutes (osm-loads) replaces the four fixed monthly jobs. For places, area names and boundaries it reads
  any answer that has arrived, writes off a question unanswered after 15 minutes, and asks again when the last good
  load is 30 days old or more: at most once an hour and 8 times a day, every other try on a backup server
  (overpass.kumi.systems). Each request now records which server was asked.
- Tried first on production data and undone: as today, nothing to do; with places 40 days old it asked the main
  server, read a failed area-name answer and logged it, and wrote off a boundary question with no answer; the next
  run waited for the places answer.
- Production: job active; run by hand at 03:17 UTC, "nothing to do" (places due 13 Nov, area names and boundaries
  6 Dec).
- Known: the three backup Overpass servers tried on 6 Nov (kumi.systems, private.coffee, mail.ru) did not answer a
  small test query (two timed out after 60 s, one answered 504); the retries on the main server are what helps.
- Excel report: TC-PLN-027 added in the database repo.

## Run - 6 Nov 2026, evening (search: area line for places, duplicates by name and distance)

- Why: Google Maps shows where each place is ("Maluri, Kuala Lumpur"); our own places showed only their kind
  ("Mall"), so branches of a chain looked the same. The website also dropped every repeat of a name, so only one
  Starbucks could ever be listed.
- Database (migration 20261106140000_place_areas.sql, applied to production 6 Nov with the owner's go): every named
  suburb, neighbourhood, village, town and city in Malaysia from OpenStreetMap (10,261) and the boundaries of the
  federal territories Kuala Lumpur (243 km2), Putrajaya (49 km2) and Labuan, loaded and refreshed monthly with the
  places. Place search shows kind · area, city: the nearest suburb within 2 km, and the territory the place is in or
  else the nearest town. A nearest-point rule alone called Mid Valley "Petaling Jaya", hence the boundaries.
- First load: Overpass's main server first answered "at capacity" (502), as it did for the monthly places refresh on
  28 Oct; the retry loaded 3 boundaries and 10,261 names.
- Website (useSmartSearch.ts): a place is a repeat only with the same OpenStreetMap id or the same name within about
  100 m; branches further apart are all listed. Unit tests 309 / 309. Live with the next website deploy.
- Production: search, geocode and security smoke 58 / 58; 9 to 62 ms per search; security advisors: only the new
  loader log table without public access (as osm_poi_loads).

| # | Typed | Top place now | Result |
|---|---|---|---|
| 1 | pav | Pavilion Kuala Lumpur · Mall · Bukit Bintang, Kuala Lumpur | Pass |
| 2 | mid valley | Mid Valley Megamall · Mall · Taman Bangsar Pertama, Kuala Lumpur | Pass |
| 3 | sunway pyramid | Sunway Pyramid · Mall · Bandar Sunway, Subang Jaya | Pass |
| 4 | the curve | The Curve · Mall · PJU 7, Petaling Jaya | Pass |
| 5 | starbucks | three branches: SS 11, Subang Jaya / Seksyen 31, Subang Jaya / Bandar Rimbayu, Jenjarom | Pass |
| 6 | putrajaya | Taman Botani Putrajaya · Park · Putrajaya | Pass |
| 7 | ioi city mall | IOI City Mall · Mall · IOI Resort City, Bandar Baru Bangi (nearest town; Google says Putrajaya) | Known |

- Known: names come from the nearest named point, so places near an edge can get the neighbouring suburb; mosques
  show "Muslim" as their kind; without a map position chain branches are not ordered by distance.
- Excel report: TC-PLN-026 added in the database repo.

## Run - 6 Nov 2026, later (search learns from picks)

- Why: Google Maps and Moovit put first what people choose most; our order came only from names, Wikipedia
  articles and routes.
- Website: each station, stop and place in a suggestion list carries its id; picking one (click on any page, Enter
  on Home and in the trip panel) sends it once per visit to record_search_pick. Nothing is sent when the browser
  asks not to be tracked. Unit tests 306 / 306 (new: searchPicks.test.ts, pick ids in suggestions.test.ts). Live
  with the next website deploy.
- Database (migration 20261106100000_search_picks.sql, applied to production 6 Nov with the owner's go): one row
  per item, day and person (salted hash of the address; no account, device, position or search text). Only real
  stations, stops and our own places count, at most 30 picks a minute per person. Every night at 00:20 Malaysia
  time the people per item over the last 90 days are counted and picks older than 120 days deleted; today's picks
  count from tomorrow. Ranking: places by ln(1 + Wikipedia articles) + ln(1 + people), stations by ln(1 + routes) +
  ln(1 + people), among equally good matches.
- Tried first on production data and undone: one person picking twice = 1 row; fake and unknown items and picks
  with no address kept nothing; "pav" unchanged until the nightly count, then 41 people moved Pavilion Elite first;
  30 picks of LRT KL Sentral put it first for "kl sentral"; searches 7 to 25 ms.
- Production after applying: search, geocode and security smoke 57 / 57; a real pick from outside recorded (1 row),
  fake items ignored; nightly job active; security advisors list only the intended new items (record_search_pick
  open to everyone, search_picks with no read access).
- Not yet: the app does not send picks; places found only through the outside place search are not counted.
- Excel report: TC-PLN-025 added in the database repo.

## Run - 6 Nov 2026 (search: station codes, landmark and other-language names, roads)

- Why: 38 searches typed into ronda2go.com, Google Maps and Moovit (5 Nov). Score (2 = right place first, 1 = top 5):
  Ronda2Go 68 / 76, Google Maps 67 / 76, Moovit 50 / 76. Our misses: "kj15" (LRT KL Sentral 3rd), "kl tower"
  (the tower not listed), "jln ampang" and "jalan tun razak" (the road never shown).
- Website (suggestions.ts): a station or stop code typed on its own ranks that station first, before stops whose
  names only start with it; a place found by another name ranks on that name. Unit tests 302 / 302. Live with the
  next website deploy.
- Database (migration 20261105180000_search_pois_other_names.sql, applied to production 6 Nov with the owner's go):
  place search also looks at the English, Malay, Chinese and Arabic names (new index), and a place named with a
  landmark name counts as an exact match ("kl tower" -> Menara Kuala Lumpur). Tried first on production data and
  undone; 6 to 16 ms per search, same as before.
- Place search (geocode function version 5, deployed 6 Nov with the owner's go): a search that starts with a road
  word (jalan, jln, lorong, lrg, persiaran ...) writes the short form out and puts the road itself first.
- Tests on production: search, geocode and security smoke 56 / 56; geocode unit tests 16 / 16; security advisors
  show nothing new.

| # | Typed | Before | After | Result |
|---|---|---|---|---|
| 1 | kj15 | bus stops KJ154, KJ156, then LRT KL Sentral | LRT KL Sentral first (unit test; live after deploy) | Pass |
| 2 | kl tower (places) | KL Tower Mini Zoo, a viewpoint, a car park | Menara Kuala Lumpur, then KL Tower Mini Zoo | Pass |
| 3 | twin towers / klcc / 双峰塔 (places) | KLCC Park, a hostel | Menara Berkembar Petronas first | Pass |
| 4 | 吉隆坡塔 (places) | nothing | Menara Kuala Lumpur | Pass |
| 5 | jln ampang | LRT Ampang, LRT Ampang Park (no road) | Jalan Ampang first | Pass |
| 6 | jalan tun razak | bus stops on the road | Jalan Tun Razak (Cheras, Kuala Lumpur) first | Pass |
| 7 | lrg haji taib | - | Lorong Haji Taib first | Pass |
| 8 | pav, hosp kl, masjid, sunway pyramid | right place first | same | Pass |

- Known, not fixed: only 14 places have an Arabic name; "batu caves" places are still hotels and shops (the sight is
  not in our own place list).
- Excel report: TC-PLN-022, TC-PLN-023 and TC-PLN-024 added in the database repo.

## Run - 5 Nov 2026 (check for missing or non-working parts)

- Checked: 22 pages and all 28 trail pages followed link by link (no dead pages), 182 outside links opened, the code
  searched for unfinished parts, the live sign-in settings read.
- Sign-in: only email works on the live site. Google, Apple and Facebook are off in Supabase; WeChat and QQ have no
  sign-in route. Their 5 buttons only showed a notice. Now only switched-on ways show (none today, so the "or" line
  and buttons are hidden); they come back by themselves when one is switched on in Supabase.
- "Delete account": the server function behind it was never deployed, so the button would fail. The function's list
  of a person's data was also out of date (only the assistant usage); it now also removes their live trip shares and
  ad enquiries, and unlinks them from usage counts and alerts they wrote (17 / 17 function tests). Deployed 6 Nov
  (approved). Live check: it still refuses ronda2go.com ("origin not allowed") because the ALLOWED_ORIGINS secret does
  not list it yet; the owner is adding it. Other websites are refused, as they should be.
- "Saved trips" was listed as a feature but is not built on the website: now labelled Coming soon, no link.
- About: "using your current location" and "nearby spots with RONDA 300" said Coming soon although both work; removed.
- Data sources page: the React / Supabase / Tailwind credit linked to our private code repository (404 for
  visitors); now each library's own page, plus shadcn/ui.
- Outside links: Pexels and ecrl.com.my refuse automatic checks (open fine in a browser); nothing else broken.
- Unit tests 302 / 302; browser tests 244 passed (6 skipped).

## Run - 5 Nov 2026 (search: well-known places first, short forms in a row)

- Why: the same searches in Google Maps, Moovit and our site (5 Nov). "pav" listed Pavilion Elite before Pavilion
  Kuala Lumpur; "hosp kl" became "hospital kl" but never "hospital kuala lumpur", so Damai and Columbia Hospital bus
  stops came before MRT Hospital Kuala Lumpur, and hospitals were left out of place search.
- Database (migration 20261105120000_search_popularity_alias_loop.sql, applied to production 5 Nov with the owner's
  go): new table search_importance, the number of Wikipedia articles about a place (all languages), from Wikidata
  (CC0, checked 5 Nov) for the 225 places whose OpenStreetMap entry has a wikidata tag (217 with articles). Places:
  better known first among equally good matches; hospitals included. Stations: more routes first among near-equal
  matches. Short forms are written out again until nothing changes (at most 3 rounds). No website change.
- Tests: tried first on production data and undone; then search smoke 24 / 24 and security smoke 24 / 24 on
  production after applying; security advisors show nothing new.

| # | Typed | Before | After | Result |
|---|---|---|---|---|
| 1 | pav (places) | Pavilion Elite, Pavilion Bukit Jalil, Pavilion Kuala Lumpur | Pavilion Kuala Lumpur, Pavilion Bukit Jalil, Pavilion Damansara Heights | Pass |
| 2 | hosp kl (stations) | Damai Hospital, Columbia Hospital, MRT Hospital Kuala Lumpur | MRT Hospital Kuala Lumpur first | Pass |
| 3 | hosp kl (places) | Surau Kuarters Hospital Kuala Lumpur | Hospital Kuala Lumpur first | Pass |
| 4 | hospital (places) | a mosque, a surau, Mana Mana Hospitality | Hospital Sungai Buloh, Hospital Putrajaya, Hospital Tengku Ampuan Rahimah | Pass |
| 5 | masjid (places) | Masjid, Masjid Jamek, Masjid UTM | Masjid, Masjid Negara, Masjid Jamek, Masjid Putra | Pass |
| 6 | sunway (places) | Sunway Lagoon, Sunway Pyramid, Sunway 163 Mall | Sunway Pyramid, Sunway Lagoon, Sunway Velocity Mall | Pass |
| 7 | kl sentral, klcc, kj10, mrrt mluri, bkt bintang, tbs | right station first | same, still first (KL Sentral: KTM/ETS now before ERL, more routes) | Pass |

- Known, not fixed here: "batu caves" places are hotels and shops (the Batu Caves sight is not in our place list);
  same-name duplicates in the list; Arabic station names (1 of 15,893).
- Excel report: TC-PLN-020 (popularity) and TC-PLN-021 (short forms in a row) added in the database repo.

## Run - 4 Nov 2026, night (ECRL names and interchanges from MRL's sign at Gombak)

- Why: the owner sent a photo of MRL's platform sign at Terminal Bersepadu Gombak. Checked against ecrl.com.my
  (4 Nov 2026), the Transport Minister (20 Oct 2026) and NST (Apr 2025).
- Station order: same 20 stations in the same order as the sign. No change.
- Names fixed: "ITT Gombak" is now "Terminal Bersepadu Gombak", "Kota SAS" is now "KotaSAS" (both as on
  ecrl.com.my and the sign), "Serendah Baru" is now "Bandar Serendah" (sign, MOF). Phase text fixed in EN, BM, 中文 and
  عربي.
- Interchanges: added Temerloh (KTM Intercity, the East Coast line at Mentakab) and Bandar Serendah (KTM Port Klang
  Line); Gombak (LRT Kelana Jaya Line) and Jalan Kastam (KTM Port Klang Line) as before. A station can now show more
  than one line to change to.
- Fares and opening date: no change. Note: ecrl.com.my still says "January 2027" on its home page; the Minister said
  12 Dec 2026 on 20 Oct 2026, so we keep 12 Dec.
- ECRL badge: no change. We already use MRL's official logo (owner, 29 Oct 2026); the dark train icon on the sign is
  a wayfinding icon, not the line logo.
- Database: migration 20261104210000_ecrl_kotasas_name.sql (2 Explore Pahang trail places, "ECRL Kota SAS" to
  "ECRL KotaSAS"). Applied to production 4 Nov with the owner's go; both rows checked.
- Tests: unit tests 294 / 294 (new test: station order as on the sign); About page ECRL card checked in the browser.

## Run - 4 Nov 2026, evening (site online at ronda2go.com, not announced)

- Hosting: Cloudflare Pages project `ronda2go` builds from `main` (PR Liyohhh/ronda-website#2 merged, both GitHub
  checks green). https://ronda2go.com and https://www.ronda2go.com answer with the site and the security headers
  (HSTS, CSP, COOP, CORP); http goes to https; ronda2u.com and www.ronda2u.com redirect (301) to ronda2go.com with
  the path and query kept.
- Map file on Cloudflare R2: https://map.ronda2go.com/malaysia.pmtiles (421 MB), partial downloads (206) and CORS for
  ronda2go.com checked.
- Checked on the live site: home page loads with no errors; trip KL Sentral to KLCC planned (23 min, RM 2.10, LRT);
  live map shows the basemap from our map file, 640 buses and 26 KTMB trains.
- Before the merge: unit tests 293 / 293 with coverage limits, browser tests 244 passed and 6 skipped in the same
  browser as GitHub; the 3 tests that failed on GitHub were fixed (RONDA 300 map follows the search before it has
  fully loaded; the About trail list no longer widens the page past a phone screen; the live map test taps the train).
- Known: Cloudflare Web Analytics is switched on for the Pages project and its script is blocked by our CSP (harmless
  console error); switch it off in Pages settings or allow it.
- Sign-up and password reset on the live site (owner, real inbox support@ronda2go.com): confirmation email from
  no-reply@ronda2go.com in the new design, the link opens ronda2go.com signed in; reset email and new password work.
- Not checked yet: all four languages on a phone; email to non-@ronda2go.com addresses (waits for SES production
  access).

## Run - 4 Nov 2026 (smart search: typos, short forms, places first, recent)

- Why: searches people really typed found nothing or the wrong place (analytics): "mrrt mluri" 0 results, "mlri" a
  clinic, "mrt sunetx" Sungai Besi, "bkt bintang" KTM Sri Bintang, "kl tower" a bus stop, "pavilion kl" the Pavilion
  Bukit Jalil bus stop before the mall. Every bus stop was listed before every place.
- Database (migration 20261104150000_smart_search_words.sql, applied to production 4 Nov with the owner's go): a list
  of known words (29,972 from station, stop and place names) fixes each unknown word (one letter wrong, missing,
  extra or two swapped; vowels left out); short forms and landmark names in 4 languages (bkt, jln, tmn, bt, sg, kg,
  KL Tower, Twin Towers, 双峰塔, برج كوالالمبور ...) in a table that can grow without code. The search as typed is
  always searched too. Places near the map come first.
- Website: one list ranked best match first (a place before a bus stop that only looks alike; a train station stays
  first on a tie), up to 10 stations and 8 places, places from 2 letters, the same bus stop across the road shown
  once, "Showing results for ..." when the search was fixed, typed words bold even with a typo, recent picks when
  the box is empty (this browser only). Typing again after a pick reopens the list (it stayed closed before).
- Place search (geocode function version 4, deployed 4 Nov with the owner's go): results near the map or the chosen
  Start first, the position rounded to about 10 km. Checked live: "masjid jamek" gives Petaling Jaya and KL with no
  position, George Town near Penang.

| # | Test | Typed | Expected top result | Before | After | Result |
|---|---|---|---|---|---|---|
| 1 | Typo in train type and name | mrrt mluri | MRT Maluri | nothing | MRT Maluri | Pass |
| 2 | Vowels left out | mlri | LRT / MRT Maluri | Klinik Bersatu Taman Nagasari | LRT Maluri | Pass |
| 3 | Two letters swapped | mrt sunetx | MRT Taman Suntex | MRT Sungai Besi | MRT Taman Suntex | Pass |
| 4 | Short form | bkt bintang | MRT Bukit Bintang | KTM Sri Bintang | MRT Bukit Bintang | Pass |
| 5 | Short form | tmn tun | MRT Taman Tun Dr Ismail | Sra Tmn Tun Perak (1 result) | MRT Taman Tun Dr Ismail | Pass |
| 6 | Short form | bt caves | KTM Batu Caves | Bt Caves Industrial Park | KTM Batu Caves | Pass |
| 7 | Landmark name | kl tower | Menara KL | Hp Tower | Menara KL | Pass |
| 8 | Landmark name | twin towers | LRT KLCC | nothing | LRT KLCC | Pass |
| 9 | Landmark, Chinese | 双峰塔 | LRT KLCC | nothing | LRT KLCC | Pass |
| 10 | Landmark, Arabic | برج كوالالمبور | Menara KL | nothing | Menara KL | Pass |
| 11 | Place before look-alike bus stop | pavilion kl | Pavilion Kuala Lumpur | Pavilion Bukit Jalil bus stop | Pavilion Kuala Lumpur | Pass |
| 12 | Half typed with typo | mrrt mlu | MRT Maluri | nothing | MRT Maluri | Pass |
| 13 | Typo | kl sentarl / pasr seni / titwangsa | KL Sentral / Pasar Seni / Titiwangsa | right | right | Pass |
| 14 | Correct names unchanged | klcc, kl sentral, pasar seni, kajang, batu caves | same as before | right | right, no "fixed" line | Pass |
| 15 | Codes unchanged | kj10, t352 | LRT KLCC / route T352 stops | right | right | Pass |
| 16 | Nonsense | zzqxqzzqxq | empty list | empty | empty | Pass |
| 17 | Short word with no close match | mlt | anything sensible | 1 bus stop | LRT Taman Melati | Pass (guess) |

- Rows 1-17: run on the live data inside a transaction that was rolled back (nothing saved), 4 Nov. About 130 ms for
  stations, places and the fix together per search.
- Still weak (not changed): "pavillion" (double l) finds a restaurant before Pavilion KL in our own places (the
  geocoder's results come after); "um" finds the Universiti Malaya places but no station first.
- Unit tests: 50 files, 292 pass, 16 of them new (ranking, merged bus stops, recent picks). 2 unhandled errors from
  the Advertise page test (`scrollIntoView` missing in the test browser), not from search; that test file passes.
- Geocode function unit tests: 9 / 9 (position bias, places from the geocoder).
- Playwright: new e2e/search.spec.ts (typo with "Showing results for", mall before bus stop, recent picks) 6 / 6.
  Full run 244 passed, 6 skipped, 0 failed (desktop + phone). In an earlier run with more workers, RONDA 300 map and
  "opening another page from Home" failed once each; both passed 16 / 16 with one worker (timing under load).
- Typecheck clean; lint clean for the changed files.
- Production smoke after applying (search.smoke.mjs + live_geocode.smoke.mjs): 28 / 28 pass, 13 of them new typo,
  short form, landmark and place checks. Security advisor: nothing new. Existing callers of search_pois (query,
  max_rows) still work.
- Website not deployed yet: it needs the owner's go (the database and geocode are ready for it).

## Run - 4 Nov 2026 (Paintball and Karting trails live)

- Database: migration 20261015180000_trails_activities_more.sql applied to production (owner approved). It had never
  been applied. Trail order changed first from 23 / 24 to 27 / 28 (after Laser Tag), because the Explore trails moved
  the later trails down by 3 and 23 / 24 are now Arcades and Active Play.
- Live site now has Paintball (Puncak Jalil, Sri Awana) and Karting (Evolt), all three by bus.
- Production trails_data() checked against the e2e trails fixture: all 28 trails and 153 places match.
- Playwright trails + activities 19 / 20 in the full run. The one failure (desktop: Home "See all trails" keeps the
  category) passed 3 / 3 when run alone: timing under load, not the data.

## Run - 4 Nov 2026 (app picture in the "Get the app" band)

- The phone in the "Get the app" band above the footer now shows a real screenshot of the app's home screen
  (owner's screenshot: Petronas Towers header, "Where to?" search, nearest stop, Browse lines) instead of the drawn
  trip screen. Cleaned for the site: the phone's own status bar (carrier, clock, battery) blurred out and the strip
  under the tab bar evened out; saved as public/app/home-screen.webp (440 x 953, 48 KB, loads lazily). The two
  floating cards stay. Same on every page (it is part of the footer); hidden on phones as before.
- Checked in a production build at 1280 and 1024 px wide: picture sharp, phone top rises above the band, cut at the
  band's bottom edge. Unit tests pass; lint clean for the changed file.
- Floating cards (owner): "6,500+ stations and stops" moved left so it no longer touches the phone. The "12 min"
  card replaced (owner, after a Live map version) with a trails card: "25+ trails" with the walking icon and "150
  places to go by train and bus" under it on wide screens. Numbers from the live database 4 Nov: 26 trails, 150
  trail places ("25+" so it stays true as trails are added). New text in all 4 languages. Checked at 1024, 1280 and 1440 px: nothing cut
  off, cards clear of the phone's edge.


## Run - 4 Nov 2026 (security fixes before going online)

- Outside security review (read-only, both repositories) checked against the live project. Fixed today:
  - Admin check: `is_admin()` also accepted any account with the email admin@gmail.com (an address the team does
    not own; such an account existed). Now only the admin role counts, as in the other admin rules. Checked in the
    database: that account is no longer admin, the team's admin accounts still are.
  - Test planner `plan-trip-staging` was open to anyone and showed the 12 unpublished networks. Now switched off
    (answers 401, checked); the repository version needs a secret token, for the next load test.
  - Build tools: vite 8.3.0 to 8.3.5 and `npm audit fix`. `npm audit --omit=dev --audit-level=high`: 0 issues
    (12 moderate ones left in development tools only).
  - Site headers: HTTPS only (HSTS), COOP and CORP added; the CAPTCHA host is now allowed whenever a CAPTCHA key is
    set, not only with the assistant.
- Already safe (checked live): admins table locked, old stops table not readable, leaked-password protection on,
  assistant and account deletion functions not deployed yet.
- Unit tests 276 / 276. Not checked: the full build and browser tests, because another chat's unfinished change
  (trip panel) does not build yet; to re-run once that is finished.
- Still open (before the public launch): limits on statistics and ad enquiry writes, trusted IP for rate limits,
  profile photo rules, complete account deletion, smaller hardening items.

## Run - 5 Nov 2026 (design polish: shadcn/ui, one button and card, page change, home hero)

- shadcn/ui set up (components.json, "@/" import path, cn helper, class-variance-authority, Radix Slot), so components
  from shadcn/ui and 21st.dev can be added as code we own. New shared Button (variants: navy, blue, outline, white,
  glass, ghost, link; sizes small, normal, large, icon) and Card (one radius, border, shadow, padding; a lifting
  hover for cards you can tap).
- The site had over 25 hand-written button styles in 6 heights. Moved to the shared Button: header Sign Up, Home
  "See all trails" / "Nearby places" / "Advertise with us", 404 buttons, RONDA 300 search, trail "Plan a trip"
  buttons, advertise form Next / Back / Send, admin "New alert", no-access page. Moved to the shared card: hub
  places, help categories, About networks, partner dashboard tiles.
- Page change: the new page fades and rises in under the header (the header stays still); footer links underline
  smoothly on hover; no grey flash on tap on phones. All motion is off when the phone asks for reduced motion.
- Home hero: a "Live map" chip with a pulsing dot over the headline (links to the live map), and the headline is
  revealed from below. Checked on screen at phone and desktop size.
- Browser tests 244 passed (6 skipped, phone and desktop); unit tests 294 / 294.

## Run - 5 Nov 2026 (all route options shown; live bus card redesigned)

- Trip results: every route option is listed, the slower ones after the best; the "More options" button is gone
  (owner).
- Live buses on a bus step: one card with a "Live" header and a row per bus: a bus icon, the big value (minutes, or
  stops away), stops and distance under it, the wheelchair sign and the bus plate on the right; the nearest bus first
  and stronger (owner). Checked on a phone screen with sample live data.
- Browser tests 244 passed (6 skipped; chat and security-header tests re-run on their own after a full run on a busy
  machine timed out on 3); unit tests 294 / 294.

## Run - 5 Nov 2026 (full phone audit: every page, role, state and language)

- Checked at 412 px (Pixel 7 size), screen by screen while scrolling, 230 screens: 17 public pages; signed-in account
  page and its edit forms; the account menu; admin dashboard and partner dashboard; no-access page; trip suggestions,
  results, steps and change time; Lines list and line panel; the menu; the assistant; RONDA 300 station view; hub
  search; help search and answers; form errors (advertise, login, sign-up). English everywhere; Malay and Arabic on
  the main pages, account, admin and partner. Each screen also checked automatically for sideways overflow,
  overlapping text, controls off screen or too small, tiny text, blurred pictures and plain-looking links.
- No sideways scrolling and nothing off screen on any page, in any language.
- Fixed: the floating assistant button covered the Edit buttons on the account page; it no longer shows on the
  account, admin and partner pages. Account section tabs were cut off in Malay; they now wrap. Bigger tap areas (same
  look) for Edit / Change / Sign out / Add a picture / Delete account, Change time, the fare and payment switches, All
  routes, the stops list, Back to top, the nearest-station link, the assistant's close, new chat and suggestion
  buttons; larger live map checkboxes. The admin page title now uses the same title font as the other pages.
- Malay: "Lines" and "Trails" were both "Laluan". Trails are now "Jejak" everywhere (menu, footer, trails page, trail
  names, 46 texts, owner); "Laluan" stays for train and bus lines.
- Not changed: the sign-in pages and footer still show the old RONDA word logo (the rename to Ronda2Go is a separate
  job); map zoom buttons are the map library's own size.
- Browser tests 244 passed (6 skipped, phone and desktop); unit tests 294 / 294.

## Run - 5 Nov 2026 (phone, round 3: header and menu, search size, location line)

- Research: the phone versions of Booking.com, Airbnb, Citymapper, Moovit, Transit, MyRapid, GOV.UK and Grab all use
  one slim top bar (logo, a menu button) and open the menu as a full-screen panel with grouped sections; none keep a
  second row of menu names. Search is short (Moovit) or one "Start your search" box (Airbnb).
- Phone header is now one row of 56 px: logo, Sign Up (or the account), and a menu button. The menu opens full screen
  with Login / Sign Up, Hub, RONDA 300 and About as sections that open in place, Help, and the four languages.
  Following a link closes it. Tablets keep their icons and get the same menu; desktop is unchanged.
- RONDA 300 in the header now opens its menu (it used to jump to the RONDA 300 section on Home).
- Home search card is tighter on phones (smaller tabs, fields, buttons and padding): 234 px tall at 412 px wide.
- "Show the nearest train and bus" is a blue underlined link, so it reads as something to tap. When location is
  blocked it is one red underlined line, "Location blocked. Tap to allow it.", that asks again when tapped (the
  Start box's location button does the same). The longer help text was removed (owner).
- Sweep for things that can be tapped but look like plain text, on 14 pages: the trail pages' OpenStreetMap source
  line is now underlined; the rest are footer links, tabs or cards that already read as tappable.
- Browser tests updated for the new phone header and RONDA 300 menu: 244 passed (6 skipped, phone and desktop);
  unit tests 294 / 294.

## Run - 4 Nov 2026 (phone, round 2: owner's list from a real phone)

- Trip results sheet: the same height while it searches and after (it used to grow when results came in); a handle
  at the top drags it down to close it.
- Lines list: one line per row with its full name ("LRT Sri Petaling Line" instead of "Sri Peta...").
- Language menu: opened off the left edge of the screen; now opens to the right of the globe on phones.
- Trail cards: the station, stop count and title overlapped with large text; the text now sits in the flow and
  the card grows instead.
- Page banners (About, Trails, RONDA 300 and others): wider, shorter, smaller type on phones.
- Home offers row: a slanted swipe moved the cards up and cut off their tops; the row now only slides sideways.
- Live map: the card is smaller on phones (no "Live" label, smaller title and text, switches side by side).
- Home banner: the line and the three quick links in one straight row; on phones a tall, sharp photo of the
  Petronas Towers at dusk (Wikimedia Commons, CC BY 2.0, credited on About) replaces the wide strip that was stretched
  and looked blurred.
- Search boxes (Home, RONDA 300, hub): on a phone they scroll up under the header when tapped, so the choices show
  above the keyboard.
- Location: when it is blocked, the nearest-station line offers "Try again" and the steps to turn it back on
  (Android Chrome, iPhone Safari), and tries again by itself once location is allowed in the browser.
- Checked at 412 px (Pixel 7): all of the above on screen. Browser tests 244 passed (6 skipped, phone and desktop);
  unit tests 294 / 294.

## Run - 4 Nov 2026 (full phone test: every page and component, fixes)

- Checked on a phone screen (iPhone 13 size, 390 px): 16 pages screen by screen, every menu, the language switch
  and Arabic right to left, trip search to results and steps, Lines panel, nearest train and bus, trails filter and
  typo search, trail stops, RONDA 300 station search and filters, hub hotel search, live map search and switches,
  help search and answers, advertise, login and sign-up forms, back to top. No page scrolls sideways; no errors in
  the browser console.
- Fixed: the header menus (Hub, About) did not open on a phone: a tap opened the menu and closed it at once. The
  menu panel now fits the screen and scrolls if long.
- Fixed: on the 404 page the Trails and Help Centre buttons were white on a light background (could not be seen).
- Too big on a phone, made smaller: Home feature cards (no empty space under the icon), Home offers (one row that
  slides sideways instead of three tall cards), the footer (link groups two to a row), trip results top (fare and
  payment switches on one line), live map card (switches side by side), trail stop photos (wider, less tall),
  About photo credits (folded behind "View all"). Help answers now use the same back button as other pages.
  Home is 17% shorter, About 28% shorter.
- Not changed, for the owner: sign-in pages still show the old RONDA word logo (rename in progress); trail and help
  pages use a plain title font while other pages use the serif one.
- Browser tests: phone 120 passed (5 skipped), desktop 124 passed (1 skipped); unit tests 293 / 293.

## Run - 4 Nov 2026 (Escape Rooms trail cover)

- Escape Rooms trail cover is now the owner's photo (tarot cards in an escape room), public/trails/escape-rooms.jpg,
  instead of the mall building. Demo photo, no credit, replaced after launch. Checked on screen: the trail card and
  the trail page banner (face kept in view).

## Run - 4 Nov 2026 (platform sign photos for every direction: shot list, no credits)

- Owner: use any photo for now, no credit on the site, list every source in one document; all photos are replaced
  with our own after launch. Credits for station photos removed from the large view and the About page. Every source
  is in docs/PHOTO_SOURCES.md, written by `npm run photo-sources` from the photo lists.
- New: a platform sign photo for one direction at a station (src/data/platformPhotos.ts), shown instead of the station
  photo when the ride goes that way, because the two platforms have different signs. Taman Suntex towards Kwasa
  Damansara moved there; the other direction shows the station photo.
- Wikimedia Commons search for platform signs at all 281 stations, each match checked by eye. Added: 13 platform
  sign photos for one direction (16 Sierra, Serdang Jaya, Cyberjaya Utara, Cyberjaya City Centre, Glenmarie 2,
  Seksyen 7, Bandar Baru Klang both ways, Pasar Klang both ways, Titiwangsa Monorail, Kwasa Damansara for Kajang and
  Putrajaya) and 9 station sign photos (Damai, Alam Sutera, Awan Besar, Stadium Shah Alam, UiTM Shah Alam, Jalan
  Meru, Klang Jaya, Bandar Baru Klang, Sungai Besi MRT), each cropped to the sign. KTM Komuter photos on Commons
  show no readable sign, so those stations wait for the team's photos. Checked on screen: Seksyen 7 to Klang Jaya.
- 15 platform numbers read off those signs added to the live database (approved); live check: Seksyen 7 shows
  "Towards Johan Setia | Platform 2" with its sign.
- Shot list for the team: docs/PLATFORM_SHOT_LIST.xlsx, every rail station and direction from the timetable (549 rows,
  281 stations: Rapid KL rail and BRT, KLIA Ekspres and Transit, KTM Komuter), with how to take the photo, the file
  name to use, the platform number seen on the sign, status (have platform sign / station photo only / needed).

## Run - 4 Nov 2026 (photos in trip steps: station signs; KLIA Transit badge; admin alerts card)

- Trip steps: a photo on the right of each rail ride shows the sign of the station where you board (platform sign,
  name board or entrance sign), so a user can tell they are in the right place. It sits under the ride's times,
  across the step (first tried on the right, but the station name, fare and times were squeezed; owner). Tap to
  see it large. Train photos
  were dropped (owner: they do not show where you are).
- 129 platforms have a photo: 11 checked by hand (e.g. Masjid Jamek "Ampang & Sri Petaling Line", KL Sentral, Pasar
  Seni, Plaza Rakyat, Kwasa Damansara, Sungai Besi, Kajang KTM), the rest Wikimedia Commons photos whose file names
  that station. 33 automatic matches were removed because they showed another place (for example a Hong Kong street
  sign for Cochrane, a Tampin sign for Titiwangsa, a UPM shop for MRT UPM); those stations show no photo for now.
  Demo set, to be replaced with our own photos (owner). CC0, CC BY or CC BY-SA; no credit on the thumbnail (owner),
  credit in the large view and on the About page.
- MRT Taman Suntex: the platform sign ("27, Platform 2, Kwasa Damansara") from the owner's edited platform photo,
  zoomed in on the sign and turned to face the camera, replaces the entrance photo. Source and licence of that photo not known
  yet, so no credit is shown; must be replaced with our own photo or cleared before launch. Checked on screen: Taman
  Suntex to Cyberjaya Utara (phone).
- Platform number on the "Towards" line of a rail ride: "Towards Kwasa Damansara | Platform 2" (owner). It comes from
  the planner's existing platform data (station_platforms), so it shows only where we have a confirmed number. First
  row added to the live database (approved): Taman Suntex, towards Kwasa Damansara, Platform 2, from the station sign.
- A change shows a small note: the walk ("2 min walk · 90 m"), and "Exit the station and tap in again" when the
  change is outside the paid area. Wording in all 4 languages. The results list is unchanged.
- KLIA Transit badge: the train sat against the border; now centred with space around it.
- Admin service alerts: removed the note marked with "*" under the dashboard and made the alerts card match the
  other admin cards (heading, text and button size). Not checked on screen (needs an admin sign-in).
- Checked on the real planner (9 am, 4 Nov): KL Sentral to Sultan Ismail (desktop), UPM to Cochrane (phone).
- Unit tests 276 / 276; journey, security-header and site end-to-end 106 / 106; type check and lint clean.

## Run - 4 Nov 2026 (dropdown arrows)

- Every dropdown (sign-up country, account settings, advertise form, admin) now draws the same small arrow, set
  in from the edge and centred on the box, instead of each browser's own arrow pressed against the border. On
  Arabic (right-to-left) pages the arrow sits on the left. Checked on screen on the advertise form, in English and
  right-to-left.
- Unit tests 276 / 276.

## Run - 4 Nov 2026 (account emails through Amazon SES, new design)

- Supabase now sends account emails through Amazon SES (Singapore) from no-reply@ronda2go.com. Real test: the
  sign-up confirmation reached support@ronda2go.com. A sign-up with an address that has no mailbox bounced as
  expected and SES recorded it (suppression list on, bounce and complaint alarms set).
- New email design in the site's blue look (owner picked option A of 3): pale blue page, white card, logo, blue line,
  blue button, light-blue security note. Rebuilt for both emails in English, Malay, Chinese and Arabic (right to left);
  previews checked on screen for all four.
- Not done yet: SES production access (AWS asked for more details, reply sent); until then only @ronda2go.com
  addresses get mail. The logo picture still says RONDA (no Ronda2Go logo file yet).

## Run - 3 Nov 2026, latest (admin dashboard, second look, no repeats)

- /admin redone again to the owner's second reference (white cards with a thin border, headline cards with a change
  label and a footer line, one big chart with a picker, top lists with coloured bars). Side menu kept.
- Every number now shows once. Taken out as repeats: the navy "Active today" block (active today, this week, this
  month, accounts), the second active-users chart, the separate live sharing card, the separate website-or-app,
  language and country cards (now tabs or part of another card), the ring and the tile grid, the second data warnings
  list, and the "analytics events" total (only all the other counts added up). Trips planned and searches are on the
  headline card only; the steps card now starts after a trip is planned (opened, shared live, as a share of trips).
- Layout: four headline cards (active users last 30 days with change on the 30 days before; active today with change
  on the same day last week and signed in / guests; trips planned from N searches; user accounts with new this week),
  Trends chart (active users per day / week / month, trips planned per day, searches per day), Top lists (stations,
  countries, languages), busy hours, after a trip is planned (with website or app), most planned trips, searches,
  coming back (with how many come back on a given day), RONDA 300 and trails, service alert reach, then data and
  systems in one card (live vehicles, feeds, last import, alerts in force, AI chats, ad enquiries, feeds table, live
  sources, data warnings).
- Database migration trimmed to the fields the page uses: daily_events (searches and trips planned per day) and ops.
  Dropped before applying: events_30d, accounts_daily, ai_daily. Applied to the live database 3 Nov 2026 (owner
  approved; live version 20261103073214 admin_dashboard_overview). Checked on the live database: as an admin it
  returns all 29 earlier fields unchanged plus daily_events (30 days) and ops (8 feeds published, 3 open warnings,
  1 alert in force); a signed-in user without the admin role gets "admins only"; guests cannot call it.
- Unit tests 276 / 276 (AdminView: each headline number once, chart and top list switches, older database, after a
  trip is planned, data and systems, all 4 languages). End to end: e2e/access.spec.ts 12 / 12 (admin checks updated
  to the new layout). Type check clean; lint only the old e2e/mocks.ts error. Screenshots desktop and phone, English
  and Arabic, with the real numbers of 3 Nov; phone page stays 412 px wide.

## Run - 3 Nov 2026, later (admin dashboard, first dashboard look; replaced by the run above)

- /admin redone in a dashboard style (owner's reference picture, admin page only): side menu on wide screens
  (Overview, Users, Trips, Places, Data, Service alerts; quick links to Live map, Trails, Data sources; the signed-in
  admin with Profile and Sign out), pill menu on phones. Top: a soft blue band with the headline numbers on glass
  cards (active today with change on the same day last week, user accounts, trips planned, searches, analytics
  events). Then three chart cards: who is on today (ring: signed in and guests), trips planned per day (bars, last 14
  days, busiest day in blue), active users (smooth line, last 30 days, with the 30 days before). Then "Data and
  systems" (live vehicles, feeds, last GTFS import, alerts in force, AI chats, ad enquiries, live sharing) and "Data
  warnings" (latest 3, "View all data"). Every card jumps to its detail below; detail cards keep their content with a
  soft shadow. Real numbers only; same admin guard.
- Fixed: on phones a wide table (busy hours) made the whole admin page wider than the screen; cards now keep to the
  screen width (checked: page 412 px wide on a 412 px phone).
- Unit tests 274 / 274, type check clean, lint only the old e2e/mocks.ts error. Screenshots desktop and phone,
  English and Arabic, with the real numbers of 3 Nov. The database update (below) is still waiting for approval.


## Run - 3 Nov 2026, later (admin dashboard overview, first version)

- /admin: new "At a glance" block at the top with one tile per key number: active today (with this month), user
  accounts (+ new this week), trips planned, searches, analytics events, live location sharing, AI chats (with cost),
  live vehicles now (with last update), feeds published (of all feeds), last GTFS import (feed and time), alerts in
  force, data warnings (open warnings, failed imports, live sources down), new ad enquiries. 30-day lines where the
  database has daily numbers (active users, sign-ups, trips, searches, events, AI chats). A tile jumps to its section;
  live vehicles and data warnings get a red edge when not updating / not zero. New section "Data" below (feeds with
  published or not and last import, live vehicle sources, open data warnings) and a "Data" pill in the menu. Every
  earlier section stays as it was. All 4 languages; Arabic right to left. Still admin-only (same /admin guard; the
  database function refuses non-admins).
- Database: migration 20261103120000_admin_dashboard_overview.sql (DB repo) only adds fields to admin_dashboard()
  (now daily_events and ops, after the trim above); every earlier field unchanged, so the app keeps working. New
  parts dry-run read-only on the live database: all fine. Applied 3 Nov (see the run above).
- Real numbers 3 Nov (live database): 62 active today, 4 user accounts, 168 trips planned, 171 searches, 849 events,
  9 live shares, 0 AI chats, 8 of 20 feeds published, last import KTM done 3 Nov 01:30, 1 alert in force, 3 open data
  warnings. Live vehicles: 0 now; last live update 1 Nov 22:44 (live updates have stopped since then: to check).
- Not tracked yet (left out): cities published (feeds have no city field), app crashes and server errors (not in the
  database), AI chat by day before the assistant goes live (table empty).
- Unit tests: new AdminOverview tests (numbers, jumps, older database without the new fields, warnings, all 4
  languages). Type check clean. Lint: only the old error in e2e/mocks.ts. Screenshots (desktop, phone, Arabic phone)
  made with the real numbers above.

## Run - 3 Nov 2026, later ("Advertise with us" page)

- New page /advertise: a two-step enquiry form (about you: name, company, email, phone optional, type of business;
  your idea: ad place, message, consent with a link to the privacy policy). Type of business (shop or café near a
  station, hotel or attraction, brand or agency, event) is a plain list in the form, for the team; the picker cards
  and the "Suits you" line were taken out (owner, 3 Nov). Linked from the footer (Support) and the home page "Advertise with us"
  button (was the Help answer). All 4 languages; Arabic reads right to left. No audience figures (TODO when confirmed).
- Form and picture in one card: the form on the light side, a navy side drawn like a transit map (owner's pick C,
  3 Nov; replaces the photo with a fade): the Ronda2Go mark and name, the LRT Kelana Jaya Line through KL Sentral
  and Pasar Seni and the MRT Kajang Line crossing at Pasar Seni (real stops and interchange, operator colours from
  src/data/lines.ts, with the site's own line badges instead of a drawn train; not to scale). No ad on the drawing:
  a photo marker, ad card and map label were tried and taken out (owner: the ad part looked out of place). The lines
  fade in at the top so they never run over the tagline, and the green line fades out at the bottom.
- Checked in the browser on localhost, laptop and phone sizes: empty fields stop step 1 with a note and a message
  under each field; Next opens step 2; Back keeps what was typed; a failed send
  shows "could not be sent" and keeps what was typed.
- Database: table ad_enquiries added on the live database (owner approved, 3 Nov). Anyone can send; only admins can
  read, change or delete. Checked: a visitor (not signed in) cannot read enquiries (refused) and cannot send one
  marked as already handled (refused).
- End to end on localhost against the live database: test enquiry sent (saved, answer 201), thank-you message shown,
  row checked in the table (kind of business, ad place, language, consent all right), then the test row deleted
  (table empty again).
- Unit tests 274 / 274 (new: 5 for the page, 3 for the form checks), type check clean. Lint: only the old error in
  e2e/mocks.ts. Screenshots: reports/advertise/ (desktop, phone, phone step 2, Arabic, sent).
- Not done: admin screen to read enquiries (for now in Supabase only), email alert to the team on a new enquiry.

## Run - 3 Nov 2026 (home page RONDA 300 card photo)

- Home page RONDA 300 card: the photo is bigger (144 to 224 px) and sits further into the top corner; the card titles
  move down so the photo never covers them (all four cards grow by the same amount, the row stays even). Checked on
  a laptop screen and a phone: title clear of the photo on both.
- FeatureGrid unit tests 3 / 3.

## Run - 1 Nov 2026, night (product name Ronda2Go)

- Product name on the site changed from RONDA to Ronda2Go (owner, 1 Nov): tab title and share preview
  ("Ronda2Go · Let's Ronda", tagline kept), all 4 languages (sign-in, account, About, FAQ, Help answers, assistant,
  "Why Ronda2Go?", Ronda2Go picks / trails / partner / merchant), footer "© 2026 Ronda2Go.", Help Centre header,
  section labels and the logo's screen-reader name.
- Kept as they are (owner): "RONDA 300", the logo artwork (header, footer, app mock-up still draw RONDA until new
  art arrives), page addresses such as /ronda-300, and saved settings on each device.
- Not done yet: account emails (wait for the domain change to be committed), database docs and the assistant's
  instructions.
- Unit tests 262 / 262, type check clean. Browser tests for sign-in, assistant and RONDA 300: 37 passed, 1 skipped.
  Lint on src, e2e and scripts: 1 error in e2e/mocks.ts (not changed here, already there); the full `npm run lint`
  also trips on extra local copies of the site in the project folder.

## Run - 1 Nov 2026, evening (Johor fares, line panel badges, KLIA Transit badge)

- Johor bus fares added from the operator's own timetable file (data.gov.my): 84,371 stop-to-stop fares, adult and
  child, cash and card (same amounts), RM0.90 to RM6.20. They update with the weekly import. Checked on the live
  planner: JB Sentral to Larkin Sentral RM1.80 (J13), to Kota Tinggi RM5.00 (J10; child RM2.50), Plaza Angsana to
  Toppen RM4.20 over two buses; both single fares match the operator's file. Senior fares are not shown because
  Malaysians aged 60+ ride free with the concession card. Melaka's file has no fares; Penang's fare table is found
  but not added yet.
- Line badges: round only in the line panel (header logo in a white circle, line tabs and station list); everywhere
  else the badges are rounded squares again, as before (owner).
- KLIA Transit badge: bigger train, smaller words.
- Line panel: small left / right arrows at the ends of the line tabs show the row slides; tapping one slides it,
  and an arrow hides at the end of the row. On phones the panel header (logo, name, station count) no longer gets
  squashed by a long station list.
- Planner memory after the Johor fares: the first load test with them had 3.0% errors (memory limit on new
  workers, budget 1%). Johor fares are now stored once for cash and card (84,371 rows to 42,939, fare data
  16 MB to 11.9 MB). Re-run: errors 1.3% (2 of about 160 trips, both on new workers), p95 5.4 s (budget 6 s),
  rail trips all priced, live board 0% errors. Still just over budget.
- Fix: the planner now loads station-to-station fares only for the networks a trip can use (a KL trip no longer
  loads Johor's fares, a Johor trip no longer loads KL rail's). Load test after it: errors 0.0%, p95 3.0 s
  (was 5.4 s), 165 rail trips all priced, live board 0% errors, p95 0.8 s. Live check: JB Sentral to Larkin
  RM1.80 (J13), KL LRT trip RM2.10.
- Database tidy-up: raw Johor fare files cleared once used (about 120 MB), alert security rules made faster,
  6 missing indexes added.
- Smoke 48 / 48. Regression 134 journeys: 0 worse, 2 better. Planner unit tests 172 / 172. Website unit tests 262 / 262, type check and lint clean.

## Run - 1 Nov 2026, afternoon (round line badges)

- Line badges are now circles instead of rounded squares (owner). Same drawings as before, shrunk to fit inside the
  circle; the ECRL keeps its official mark. All 19 badges checked at 64 px and 22 px: nothing is cut off. Seen on
  the home page line picker.
- Unit tests 262 / 262, type check and lint clean.

## Run - 1 Nov 2026, evening (main domain ronda2go.com)

- Owner moved the main domain to ronda2go.com: on Cloudflare (same nameservers as ronda2u.com), verified in Google
  Workspace and made the primary domain; admin@, support@ and feedback@ renamed with @ronda2u.com kept as aliases.
  Checked from public DNS: MX smtp.google.com, SPF, DKIM (google._domainkey) and DMARC (p=none, reports to
  admin@ronda2go.com) all answer.
- Site addresses now support@ronda2go.com and feedback@ronda2go.com (Help, Account, RONDA 300). Account email
  templates rebuilt with the new support address (2 emails x 4 languages).
- Unit tests 262 / 262. Browser tests for account, sign-in, site and RONDA 300: 102 passed. The RONDA 300 map test
  failed once on both screen sizes when run with the other files and passed on a rerun alone (timing, not the change).
- Not done yet: the site is not hosted on ronda2go.com, so Supabase Site URL, CORS and the ronda2u.com redirect wait
  for hosting (docs/LAUNCH.md).

## Run - 1 Nov 2026, afternoon (myBAS Melaka published)

- myBAS Melaka published (owner's approval). Live planner checked: Melaka Sentral to MITC (M10B), Bukit Katil (M11)
  and the airport area (M30). Melaka Sentral to UTeM on a Monday finds no bus, which matches the operator's timetable
  (M10A only goes to UTeM Friday to Sunday). Stop search finds Melaka Sentral. Johor, Penang and Klang Valley trips
  unchanged: smoke 48 / 48, regression 134 journeys.
- Known gap: Melaka fares are not in the database yet ("Fare n/a").

## Run - 1 Nov 2026, later still (myBAS Johor published)

- myBAS Johor published (owner's approval). Live planner checked: JB Sentral to Larkin Sentral (J13), Kota Tinggi
  (J10) and Mid Valley Southkey (J15); Plaza Angsana to Toppen with a change at JB Sentral (J33 then J10). Stop search
  finds Larkin Sentral. Penang and Klang Valley trips unchanged: smoke 48 / 48, regression 134 journeys, 0 regressions.
- Known gap: Johor fares are not in the database yet ("Fare n/a").

## Run - 1 Nov 2026, later (Rapid Penang published)

- Load test on a test-only copy of the trip planner that holds every city, hidden ones included (plan-trip-staging):
  165 searches, 0 errors, p95 2.6 s; live map p95 0.9 s. The bigger timetable fits.
- Rapid Penang published (owner's approval). Live planner checked: Komtar to Batu Ferringhi on bus 101, Komtar to
  the airport area on 401E, Weld Quay to the Penang Hill area on 202. Stop search finds Komtar. Klang Valley trips
  unchanged: production smoke tests 48 / 48, regression 134 journeys, 0 regressions.
- Known gaps: Penang fares are not in the database yet, so trips show "Fare n/a". The ferry and the Penang Hill
  funicular are not in the operator's feed, so Butterworth to Komtar goes round by bus (96 min).
- Not checked on screen: the trip results page for a Penang trip (the planner boxes reset in the test browser).

## Run - 1 Nov 2026 (load test after the Supabase upgrade)

- Supabase now on Pro + Large (checked: 160 database connections, 2 GB buffers, database 429 MB).
- Load test against production, 90 s, 8 users: trip planner 165 searches, p95 1.95 s, every rail trip priced;
  live map 317 requests, p95 1.32 s, 0 errors.
- Failed one budget: 8 trip searches (4.9%, budget 1%) got an error at the same second. Cause: one planner worker ran
  out of memory (Edge Function limit), not the database. The bigger database does not fix this; the planner needs
  to use less memory before the new cities are published (details in the database repo, docs/GROWTH_PATH.md).
- Fixed the same day: when several searches reached a new planner worker at once, each loaded its own copy of the
  timetable and fares. They now share one load (trip planner v26, deployed with the owner's approval; new unit test).
  Load test again: 165 searches, 0 errors, p95 2.12 s, every rail trip priced; live map 330 requests, 0 errors, p95
  1.52 s. Production smoke tests 48 / 48. Regression 134 journeys: 0 regressions, 2 improved. Database unit tests 252 / 252.
- Leaked-password protection turned on by the owner in Supabase (Pro). docs/LAUNCH.md items ticked.
- Route check: no bus route 1765B or T765B in the database (all feeds, hidden cities included) or in any public source found (Rapid KL feed, mrt.com.my, Transit app; MyRapid kiosk page now loads blank). Nearest match: T765
  (Stesen LRT Seksyen 7 ~ UITM, Rapid KL).

## Run - 28 Oct 2026, evening (account emails)

- New RONDA confirm-sign-up and reset-password emails (docs/email-templates/, built by scripts/email-templates.mjs).
  Owner picked option A of six designs, with the dark RONDA logo: white top with the logo and a champagne line, serif
  title, one velvet button, the link written out as a fallback,
  "ignore if not you" and support@ronda2u.com. Each email comes in the language the person used on the site: the
  language is now saved at sign-up (user_metadata.lang); no language saved = English. Previews checked in headless
  Edge (English 800 px, Malay, Arabic right to left at 390 px).
- Site text no longer says the link works for 24 hours (Supabase is set to 1 hour).
- Supabase Email settings checked from the owner's screenshot: minimum 8, lower + upper + digits + symbols, link
  expiry 3600 s; they match the website rules. Leaked-password protection needs Pro (reminder in docs/LAUNCH.md).
- Unit tests for sign-up updated (language sent); type check and lint clean.
- Logo: public Storage bucket "brand" made by migration 20261028210000_brand_bucket.sql (database repo, owner
  approved; read-only, PNG only, 512 KB max); owner uploaded ronda-logo-email.png in the dashboard. Public address
  checked: 200, image/png, same file as public/brand/email/ronda-logo-email.png.
- Open: owner to paste the templates into Supabase; sender name stays "Supabase Auth" until Amazon SES is set up.

## Run - 28 Oct 2026, later (stronger sign-up)

- Password rules on sign-up, reset and the Account page: 8 to 72 characters, upper and lower case, a number, a
  symbol, and not the email name. A live checklist and bar tick each rule off as the person types; the form will not
  send until all are met. Supabase still checks on the server.
- Show / hide button on every password field (Edge's own extra eye hidden so there is only one).
- Confirm password says "Passwords do not match." as soon as it differs.
- Sign-up needs the box "I agree to RONDA's terms and privacy policy" ticked; the time of agreement is saved on the
  account (terms_accepted_at) as a PDPA consent record.
- Bot check (Cloudflare Turnstile) on sign-up, sign-in, resend and forgot password, switched on by setting
  VITE_CAPTCHA_SITE_KEY. Not on yet: needs the owner to turn CAPTCHA on in Supabase Auth -> Attack Protection at the
  same time, or every sign-in fails.
- All new text in English, Malay, Chinese and Arabic (right to left checked on a 375 px phone).
- Unit 244 / 244 (new: password rules 4, bot-check token passed on 1, Register page 5). Type check and lint clean.
  Playwright auth, account, access, site and CSP 122 / 122. Full Playwright run 232 passed, 6 skipped by design, 0 failed.
- Open (owner, Supabase dashboard): set the same password rules in Auth -> Providers -> Email (minimum 8; lower,
  upper, digits and symbols), turn on leaked-password protection (needs Pro), and decide on CAPTCHA.

## Run - 28 Oct 2026 (sign up, sign in, sign out, password reset)

- Sign up: name, email, password (8+ characters). After sending, a "Check your inbox" screen names the email and can
  send the confirmation email again. The account works once the link is opened; the link signs the person in and
  opens My RONDA. An email that already has an account gets the same screen (the form can't reveal who is registered).
- Sign in: wrong email or password, unconfirmed email (with "send confirmation email again"), too many tries and no
  connection each get a plain message in the reader's language (Supabase's own messages are English only). An
  expired or used email link says so and offers a new one. A signed-in person visiting /login or /register goes on.
- Sign out (header menu) now signs out of this browser only; "Sign out on all devices" stays on the Account page.
  The header no longer flashes Login / Sign Up for a signed-in person while the session loads.
- Forgot / reset password: same flow as before, messages now translated.
- Look: form straight on one plain white background (no card, owner's choice), serif headings, champagne rule and links, velvet buttons. English,
  Malay, Chinese and Arabic (right to left) for every new message.
- Checked on the local dev server against the live Supabase project: a wrong password gives "Wrong email or
  password." Live Auth settings read (public endpoint): email sign-up on, email confirmation required, no Google /
  Apple / Facebook switched on. No account was created in production.
- Unit 237 / 237 (new: auth service 5, Register page 3). Type check and lint clean. Playwright sign-in, account and
  access 46 / 46 (new auth.spec.ts, 8 tests x desktop + mobile: sign up + resend, sign-up error, sign in + header
  name + sign out, back to the page that asked, wrong password + unconfirmed email, confirmation link signs in,
  expired link, Malay / Chinese / Arabic). Full Playwright run 232 passed, 6 skipped (phone-only / desktop-only by design), 0 failed.
- Open (owner): Supabase Auth -> URL Configuration needs the site's address in Site URL and these in Redirect URLs:
  `https://<site>/login`, `https://<site>/reset-password` (and `http://localhost:5173/**` for local testing);
  otherwise email links fall back to the Site URL. Emails still come from Supabase's built-in mailer (low hourly
  limit, Supabase sender name) until Amazon SES is set up; email templates still Supabase's defaults. Google /
  Apple / Facebook buttons show but those providers are off. A real sign-up with a real inbox is not tested yet.

## Run - 28 Oct 2026 (Explore trails: Selangor, Putrajaya, Pahang, Terengganu)

- Four trails in Explore: Explore Selangor (8 stops: Shah Alam by LRT Shah Alam Line, Klang by KTM), Explore
  Putrajaya (the old Putrajaya Trail, same link, now 10 stops with Dataran Putra and Taman Wetland), Explore Pahang
  (5 stops by ECRL: Kuantan, Teluk Cempedak, Balok, Cherating) and Explore Terengganu (8 stops by ECRL: Kemasik,
  Kuala Terengganu, and the jetties for Kapas, Redang and Perhentian).
- Places from OpenStreetMap (position, address); walks from the station by OSM foot routing; names and blurbs in
  English, Malay, Chinese and Arabic; a photo for every new stop and the 3 new covers (Wikimedia Commons, credits in
  docs/RONDA_Photo_Credits.xlsx and the About page list).
- ECRL stops: the stop card says "ECRL station: the line opens 12 Dec 2026. Not in trip planning yet." and has no
  plan button; ECRL stations are left out of RONDA 300 (no timetable to plan with).
- Database: migration 20261028120000_trails_explore_states.sql applied to production 28 Oct 2026 (owner approved).
  Production trails_data() checked against the e2e trails fixture: all 26 live trails and 150 places match exactly.
  The fixture also keeps the Paintball and Karting trails (3 places): their migration 20261015180000 is not live yet.
  Playwright trails rerun after applying: 10 / 10.
- Unit 229 / 229 (new: ECRL stations stay out of RONDA 300). Type check and lint clean. Playwright trails 10 / 10
  (new: the four Explore trails listed; Explore Pahang shows the ECRL note on all 5 stops and no plan buttons;
  Explore Selangor keeps its 8). CSP passed. RONDA 300 desktop test fails ("0 places in this area") with the old
  fixture too: comes from the RONDA 300 work in progress, not from this change.
- Open: KotaSAS and Jerteh ECRL stations are not on OpenStreetMap yet (distance to Kuantan town and Kuala Besut TODO);
  Taman Wetland Putrajaya bus route TODO; island boat times and fares TODO; turtle sanctuary hours TODO.

## Latest run - 28 Oct 2026 (RONDA 300: Mosque and Religion sections, sticky header, merchant section)

- Places of worship split: mosques and surau (OpenStreetMap religion "muslim") under Mosque; temples, churches,
  gurdwaras and other places of worship under Religion. Banks and ATMs stay under Bank.
- Station header stays at the top of the panel while the list scrolls (desktop).
- Merchant section redesigned: full-width cream band, serif headline, three points, a sample listing showing how a
  partner shop appears in the RONDA 300 list (marked as a sample).
- Text sizes kept as they were (a larger size was tried and undone at the owner's request).
- Merchant section then made compact on request: one short band (headline, three points in a row, button) beside a
  small sample listing.
- Merchant section spaced out on request: more room above and below, the three points stacked one per line, wider
  gap to the sample listing, and a white gap between the map and the band. Checked with headless Edge at 1440 px
  and 375 px.
- Merchant section redone as a partner pitch on owner feedback ("doesn't look like users want to be a partner"):
  navy band, headline and one line on why riders will find the shop, three benefits with icons, gold "Partner with
  us" button and the support@ronda2u.com address, beside a sample card of what riders see (the market stall scene,
  a partner listing with opening hours and walk time, and the Go button). New text in 4 languages. Unit 244 / 244;
  Playwright site (axe) and RONDA 300: 64 / 64. Checked with headless Edge at 1440 px and 375 px.
- Partner section made smaller on request (less padding, smaller headline and card). RONDA picks stand out on the
  map: gold ring and a navy badge with a gold star on each photo pin (navy ring on hover); star beside the "RONDA
  picks" heading in the panel. Unit 244 / 244; Playwright site (axe) and RONDA 300: 64 / 64.
- UDA Holdings buildings near the trains put first (owner request). Researched from UDA's own pages
  (udamalls.com.my, uda.com.my) and the Chinatown 1974 opening news; positions from OpenStreetMap; nearest station
  from our transit data: Chinatown 1974 (Tunas Utama, Jalan Petaling; Monorail Maharajalela 290 m, Pasar Seni),
  Pudu Sentral (LRT Plaza Rakyat 220 m), Pertama Complex (LRT Bandaraya 210 m), LaLaport Bukit Bintang City Centre
  (UDA 40% joint venture; Monorail Hang Tuah 220 m), Cahaya Suria (LRT Plaza Rakyat 410 m), Sinar Kota (LRT Masjid
  Jamek 390 m). Left out: Hentian Duta (no train near), City Parking, townships, malls outside KL.
  They show first among the RONDA picks (with a photo, or a navy star tile where no free photo exists yet), first
  as map photo pins, first in the places list with a "RONDA pick" star, and first in the place search of the trip
  planner and RONDA 300 (typo-tolerant: "lalapot", "pertma", "puduraya", "petaling street"). A trail stop in the
  same building is not listed twice. Photos from Wikimedia Commons, credited on About and in
  docs/RONDA_Photo_Credits.xlsx. Checked with headless Edge at Pasar Seni and Hang Tuah. Unit 248 / 248 (new:
  search matching); Playwright full run 232 / 232.
- Photos added for the last three UDA places (owner request; no "Partner" label, owner decided). Commons has no
  photo of the buildings themselves, so they show their street: Chinatown 1974 the lanterns on Jalan Petaling
  (CC0), Cahaya Suria and Sinar Kota Jalan Tun Perak by the Lebuh Pudu hub (CC BY-SA 4.0, credited on About and in
  docs/RONDA_Photo_Credits.xlsx). Checked with headless Edge at Pasar Seni and Plaza Rakyat. Unit 248 / 248.
- Open: Kompleks Jalan Raja Bot not on OpenStreetMap (TODO); a real photo of each building when one is free to use.
- RONDA 300 scrolling (owner: hard to move between the map and the page): the list panel no longer holds the
  scroll at its end, so the page carries on; the map already lets the page scroll (Ctrl / Cmd + scroll or two
  fingers move it), and its hint is now in all 4 languages. Headless Edge at 1440 px: wheel over the map moves the
  page 400 px; wheel over the panel at the end of the list moves the page 1200 px.
- RONDA 300 map: the place callout now shows the station's line logos before "About N min walk from ..." (one
  per line at an interchange: LRT Masjid Jamek shows three). Checked with headless Edge.
- RONDA picks: pressing a pick (or its photo pin) opens a short description on the map itself, by the pin: what the
  place is, the walk from its nearest station and a Go button to plan the trip (an in-panel card was tried first and
  replaced at the owner's request). Short descriptions added in 4 languages for Pudu Sentral, Pertama Complex, Cahaya
  Suria and Sinar Kota (Chinatown 1974 and LaLaport use their trail descriptions).
- Less clutter on the RONDA 300 map (owner idea: a checklist). The kind tabs are now one checklist that drives both
  the map dots and the list (nothing shown twice): tick or untick each kind, or All. Food, banks and everyday services
  start unticked as they are most of the dots (Bukit Bintang: 297 places, 85 shown at first); the choice is kept in
  the browser. UDA featured places always show. Playwright RONDA 300 updated (map description and Go link, Eat starts
  unticked, All shows 3, none, then Parks 1): 4 / 4 one at a time; site and accessibility (axe) 60 / 60. Unit 248 / 248.
- Checklist redesigned on owner feedback: one row like the old tabs (All, Eat, Sights, ...), each with a real
  checkbox (filled in the kind's colour with a tick when on, empty when off). A boxed two-column legend and tabs with
  only a tick were tried and dropped. All ticks every kind, or clears them when all are ticked. Checked with headless
  Edge at 1440 px and 375 px. Playwright RONDA 300 4 / 4; site (axe) on /ronda-300 4 / 4; unit 248 / 248.
- Fix (owner: "it bugs out"): sliding the checkbox row sideways moved the whole list with it (the group did not shrink
  to the panel). Now only the row slides (no scrollbar shown, owner request); the panel and list stay put. Wrapping the row was
  tried; the owner prefers the sliding row. Headless Edge at 1440 and 375 px after sliding the row and ticking two
  boxes: row moved 422 / 116 px, panel 0, list in place.
- The sliding row of kinds shows a tiny arrow over a soft fade on the side that has more (right at first, left once
  slid; none when everything fits); pressing it slides the row. Works right to left in Arabic. Checked with headless
  Edge. Playwright RONDA 300 4 / 4; site (axe) on /ronda-300 4 / 4; unit 248 / 248.
- Account page redesigned (owner picked design B of three): a side menu with the user's initials, name and email and
  four sections (Profile, Sign-in and security, Preferences, Delete account), one panel open at a time, each with its
  own address (/account#security). Profile: name, sign-in email (read only) and "User since". Security: change
  password, sign out on all devices. Preferences: language (new here). On phones the menu is a row above the panel.
  New text in 4 languages; says "user", not "rider" (owner). Playwright account, auth and access 48 / 48 (new: the
  menu opens each section, Malay from Preferences, axe clean). Checked with headless Edge at 1440 px and 375 px.
- Account page: new Trip settings section (owner request): which routes come first (least walking by default,
  fastest, fewest transfers, cheapest), fares for Malaysians or tourists, cashless or cash, and parking at the start
  station on or off. Kept on this device and used by the trip planner at once (same fare keys the planner already
  had; new src/data/tripPrefs.ts). Step-free routes and choosing Park & Ride trips are not offered by the planner
  yet, so they are not in the settings (TODO when plan-trip supports them). Unit 251 / 251 (new: trip settings);
  Playwright account 18 / 18 (new: settings kept, axe clean), journey and home pass. Checked at 1440 px and 375 px.
- "My dashboard" removed (owner: useless): the page, its header menu link and its texts are gone; /dashboard and
  links in sign-up / reset emails now open the account page.
- Account page: the password rules show only once a new password is being typed (owner request).
- Profile picture (owner request): add, change or remove it on the account page. The photo is cut to a centred
  256 px square WebP in the browser (up to 10 MB in), uploaded to a new public "avatars" bucket at
  <user id>/avatar.webp (users can only write their own folder), and shown beside the menu and in the header.
  Deleting the account removes the picture too (delete-account Edge Function). Pictures allowed by the site's
  content security policy. Database: migration 20261029100000_avatars_bucket.sql written, NOT applied yet (needs
  the owner's approval); delete-account change not deployed yet; its Deno test updated but not run here (no Deno).
  Unit 253 / 253 (new: picture square and path); Playwright account and CSP 38 / 38 (new: upload, link, remove;
  rules only while typing).
- Admin dashboard (owner: the dashboard is for admins only): on /admin, above the quick links. Users: total
  accounts and new accounts per day (30 days), week (12) or month (12) as bars; people using the app each day (30
  days); where users are from; the 10 most searched words and the 10 busiest stations (last 30 days). Numbers come
  from one admin-only database function, admin_dashboard() (sign-ups from Supabase Auth, the rest from the mobile
  app's analytics events; the website records nothing new). Checked read-only on production: 4 accounts, 16
  distinct searches, busiest LRT Titiwangsa (26).
- Sign-up asks "Where are you from?" (required; Malaysia first, then the countries most visitors come from, then
  A-Z in the reader's language), kept as an ISO code in the account; the privacy answer in Help says so (4 languages).
- Security found while doing this: any signed-in user could read every analytics event (device ids, user ids, search
  text). The same migration closes it; admins still read through their own policy. Also: is_admin() in the database
  treats the email admin@gmail.com as admin; the new dashboard does not use it (it checks the admin role / admins
  table), but the old rule should be removed (owner to decide).
- Database: migration 20261029110000_admin_dashboard.sql written, NOT applied yet (needs the owner's approval).
  Unit 253 / 253; Playwright full run 234 / 236 before the last fixes (select contrast, label), then site, auth and
  access 88 / 88 (new: dashboard numbers and Weekly, country on sign-up).
- Admin dashboard rebuilt to the owner's chosen design (mix of the references; same format for the app): active users
  first (today with the same day last week, this week, this month, share who come on a given day, accounts), active
  users per day / week / month (signed in and guests), coming back (weekly groups, 1 / 2 / 4 weeks), busy hours,
  most planned trips, countries, busiest stations with line colours, searches (most searched / found nothing), live
  sharing, website or app, language, from search to trip, RONDA 300 places and trails, service alert reach. Greeting
  and a pill menu jumping to Users, Trips, Places and the service alerts editor. All text in 4 languages.
- Website now records anonymous usage events like the app (services/analytics.ts): app opened (once a day), search
  (with how many results), trip planned, trip opened, place opened / Go tapped, trail opened, alert seen. Random device
  id only, no names or positions; nothing sent when the browser asks not to be tracked. Help privacy answer updated
  (4 languages). Event list for the app team: docs/ANALYTICS_EVENTS.md in the database repo.
- Database: migration 20261029110000_admin_dashboard.sql rewritten (new admin_dashboard(), insert rules for events:
  known kinds only, 2 KB max, own account only; closes the read-all hole). Tested read-only on production with a
  temporary copy: 5 devices active this month, stickiness 27%, busiest LRT Titiwangsa. NOT applied yet: the apply was
  blocked by the session's safety check; needs the owner to allow it or run it. Same for the avatars migration and the
  delete-account deploy.
- Unit 258 / 258 (new: event recording, opt-out). Playwright full run 235 / 236: the one failure is the RONDA 300 map
  timing under parallel load (known; passes on its own).
- Trails page search bar (owner request): typo-tolerant (one letter off is fine), looks at the trail name and
  description in the reader's language, its stops and their stations; best matches first; kept in the address
  (?q=); "No trails match" with a clear button. Shared matcher data/smartMatch.ts (featured places use it too).
- Header account menu redesigned (owner's reference, only what RONDA has): a card with picture, name and email
  (to the account page), then Profile, Trip settings, Preferences, Sign-in and security with line icons, Admin
  dashboard (admins) or Partner page (merchants), Help, Sign out. Opens on hover with a mouse, on tap on phones.
- Account page redesigned the same way: a side card (picture, name, email, user since) and a menu with an icon per
  part; the parts as cards of tiles, one setting per tile with its value and action: picture, name, country (now
  editable), route order, fares, payment, parking, language, email, password, sign out everywhere; Delete account
  as a line under the cards that opens a confirm box. New icons added to the Material set (scripts/fetch-icons.mjs).
  Unit tests pass; Playwright account, auth and access 50 / 50, trails 12 / 12. Checked at 1440 px and 390 px.
- Promotions redone (owner picked layout C with the wording of A): one wide navy card (RONDA 300: "Put your shop
  near the station", 6,500+ stops and stations, List your business) and two coloured cards (hotels and
  attractions; offers for riders), each with a flat drawing (components/PromoArt.tsx) and an Ad tag. The old photo
  banner and its credit are gone. 4 languages.
- Lighter colour scheme (owner, after the reference): the big navy blocks are now light sky to cream with navy
  words: inner page tops (pages with a photo keep the dark fade), the lines band, the get-the-app band, the RONDA 300
  partner pitch, the menu promo card and the feature tiles. Gold stays the button colour; navy only for words and
  small things. The home hero video and the trip / line panels keep navy.
- Motion kept gentle: sections fade up as they come into view (already there), cards lift a little on hover
  (promotion and feature cards; trail cards already did), photos zoom slowly on hover, the home hero words come in
  one after the other. All off for people who ask for reduced motion. The planner box does not animate (it would
  read as faded to screen readers and contrast checks while it moves).
- Unit 261 / 261. Playwright full run: all pass except the known RONDA 300 map timing under parallel load; home and
  site (axe) 72 / 72 after the last fixes.
- Colours studied from the owner's reference (29 Oct) and cream removed: white page, pale blue-grey surfaces
  (#F2F6FB), navy #222D52 for words and main buttons, one blue accent (#2F6BD8 fill, #2559B8 for text, for
  contrast). Promotions are navy, light sky and blue cards. Playwright full run 238 / 238.
- "Everything you need" redesigned (owner picked A of four): four cards on one pale strip; one card is lifted,
  filled blue, with a round photo in its corner and "Learn more" (RONDA 300 first, then whichever card the mouse or
  keyboard is on). Cards stack on phones. New intro line in 4 languages. Unit 261 / 261; Playwright home, access and
  site (axe) 84 / 84. Checked at 1280 px (also on hover) and 390 px.
- Name split (owner): sign-up and the account page ask for first name and last name; saved as first_name,
  last_name and full_name (both, for the header, emails and the app). Older accounts show their full name as the first
  name until edited. Unit 262 / 262; Playwright account, auth, access and site 110 / 110 (one register check passed
  on re-run).
- Feature strip and Park & Ride made to match the new cards: strip icons all blue on pale circles (fill blue on
  hover) in place of one colour each; Park & Ride card in the same sans heading, grey text and corner size.
  FeatureGrid 3 / 3, Playwright home and site 14 / 14.
- Park & Ride redone (owner picked C of three): one blue banner like the lit card, a white P sign, title, one
  line, three short facts (on the live map, P next to stations on every line, fares where published) and two
  buttons; darker circles and chips keep white text at 4.5:1. 4 languages. "klia2" written "KLIA 2" in all
  wording (links and search words unchanged). Playwright home and site 72 / 72 (one scroll check passed on re-run).
- "Every line. One plan." band redone smaller (owner picked E of six): heading and one line, the numbers on an open
  row (first in blue), then one pale panel with the two drifting rows of line badges (fading at the ends) and the live
  map bar at its foot. About 680 px tall at 1280 px. Playwright home and site 72 / 72.
- Promotions redone (owner picked C of three, from new references): three arched cards with the owner's photos in
  the round top and an icon on the photo's edge; RONDA 300 in the middle, filled blue, taller, with 6,500+ stops and
  stations; heading centred with "Advertise with us" under it; every card still one link with an Ad tag. Flat
  drawings (PromoArt) removed. Unit 262 / 262; Playwright home and site 72 / 72 (two timing checks passed on re-run).
- Admin dashboard, busiest stations: each station shows its lines' official badges (one per line at interchanges)
  in place of small colour squares. Unit 262 / 262; Playwright access 7 / 7.
- ECRL: the official logo (from the owner) is its line badge (logo only, no box) and sits beside the ECRL heading
  on About; ECRL colour set to the logo's blue #0065DE. Line list: buses under their own "Bus" heading (4
  languages), apart from ECRL; plain bus badges now the lighter blue #2F6BD8 (white on it 5:1). Unit 262 / 262;
  Playwright journey, home and site 102 / 102.
- RONDA 300 header redone (owner picked C of three): a wide photo (Central Market, owner's photo) with the title
  on a navy fade and a white search card over its bottom edge: "Find a station" (the label is now readable; it was
  white on light), a Search button, and the numbers 18,000+ places, 300 m, 5 min on foot. 4 languages.
- Line panel redone (owner picked B of three): header in the line's own colour (navy where white words would not
  read, e.g. MRT Putrajaya, ETS), the line's logo on a white tile, the line tabs on white under it; the ECRL has a
  Transit / Express switch and its stations as cards (Express shows "Transit only" where it does not stop).
  Unit 262 / 262; Playwright RONDA 300, journey and site 94 / 94 (one axe check passed on re-run).
- Line panel header now in every line's own colour, yellow, lime and light blue too (navy words on those, white on
  the rest, each at 4.5:1); the colour blends over 0.3 s when another line is picked and the station list fades in
  (both off for reduced motion). ECRL station cards joined by the line (dashed for phase 2). Unit 262 / 262; Playwright
  journey 30 / 30 (10 timed out under a heavy parallel run, all passed on 2 workers), live and site pass.
- Home page: the three small promotion cards now show small isometric city scenes in place of photos (owner picked
  this style from three): a train on its viaduct in the line's colour (LRT Kelana Jaya, MRT Kajang, Monorail),
  buildings, park, river and a gold pin; a station with its 300 m ring, twin towers and hotels, the walk to a row of
  stalls. Checked with headless Edge at 1440 px and 375 px: nothing cut off.
  The wide banner keeps its photo; the three card photos are no longer used, so they left the About credits.
- Promotion cards revised on owner feedback: the Offers card's plain coloured blocks are now market stalls with
  striped awnings and goods on the counter, with riders in front (a discount tag was tried and removed); trains on
  all three cards now sit on the viaduct deck with windows, a side stripe in the line's colour and a coloured front
  car. Checked with headless Edge at 1440 px; PromotionSection tests 4 / 4, type check clean. Owner approved.
- Checked with headless Edge at 1440 px with live data at Pasar Seni: tabs All 152, Eat 103, Sights 5, Parks 1,
  Shop 1, Stay 26, Mosque 2, Religion 5, Bank 2, Useful 7. Unit test added for the sorting.

## Run - 27 Oct 2026, night (RONDA 300: full width, plainer look, banks)

- Owner feedback: gap above and below the map, icons looked generic. Map and panel now run the full screen width at
  the full window height; the panel scrolls on its own, so no gaps.
- Plainer look: places are small dots in muted colours on the map (the one pointed at grows into a marker with a line
  drawing); other stations get a navy label with a place count; list rows are plain text with thin dividers, a
  small-caps kind label, walk minutes on the right; text tabs instead of icon pills; station name in the serif face.
- Banks: banks, ATMs and money changers have their own Bank section instead of Useful.
- Checked in the browser with live data at Monorail Raja Chulan, 1440 px and 375 px: dots, ring, labels and 9 photo
  pins show, Bank tab shows 6, no sideways scroll. Unit 227 / 227; Playwright RONDA 300 and CSP 20 / 20.

## Run - 27 Oct 2026, evening (RONDA 300 redesign, style 1)

- New RONDA 300 layout: map on the left, station panel on the right (on phones the map comes first). Panel: the
  station nearest the middle of the map, its line badges, places within a 5 min walk, up to 3 "RONDA picks" (trail
  places with photos within 450 m), kind chips with counts, then the places in view with a "Go" button.
- Map: RONDA's own icons for the 7 kinds of place (white markers), a bubble over each other station in view with its
  3 most found kinds and counts, and round photo pins for the trail places (pressing one flies to it).
- Trail place positions read from trail_places (public read already on); no database change.
- Checked in the browser with live data at LRT Masjid Jamek, desktop 1440 px and phone 375 px: 153 places, 3 picks,
  bubbles for Bandaraya, Plaza Rakyat, Pasar Seni and Merdeka, all 12 photo pins load, no sideways scroll.
- Fixed while checking: photo pins off screen stayed empty (lazy loading); now load straight away.
- Unit 227 / 227. Playwright RONDA 300, CSP and links: 25 passed, 5 skipped (test updated for picks, photo pin and
  "Go" button). Type check and lint clean.

## Run - 27 Oct 2026, later (owner's own photos for 8 stops and 2 trail covers)

- The owner's photos now show for Central Market, Guan Di Temple, Masjid India, Masjid Jamek, Masjid Negara, Masjid
  Putra, River of Life and Sultan Abdul Samad Building, and as the Mosque Trail and Heritage Trail covers. Resized to
  at most 1280 px, served from our own site (public/places), file details removed. Masjid Putra and Sultan Abdul
  Samad cropped to show the dome and the clock tower.
- Not used: the "Sri Mahamariamman" photo (a different temple, with an Indian sculptor's sign).
- Source and licence: marked TODO, for the owner to fill in docs/RONDA_Photo_Credits.xlsx (several look like stock
  photos; only licensed ones should stay). Left out of the About page credit list until then.
- Unit 227 / 227 (new: owner photos are site files and stay out of the credit list). Mosque trail page checked in
  Chrome: every photo loads.

## Run - 27 Oct 2026 (checklist step 1: staging gate, new city feeds imported hidden)

- Database (owner's approval): new feeds stay hidden until checked (feeds.published). Website queries run as a
  visitor before and after: line stations, stop search, nearest transit, map stops, bus route search, bus routes all
  return the same results; stop search about 90 ms (was about 50).
- Rapid KL timetables were stuck since 11 Oct (the weekly import clashed with another job and died). Fixed the
  schedule and re-imported: rider planner now has 8,837 trips (was 7,887).
- Imported hidden: Rapid Penang, myBAS Johor Bahru, Melaka, Ipoh, Seremban A and B, Kuching, Kota Bharu, Kuala
  Terengganu, Alor Setar, Kangar. Checked: no broken trips, coordinates fine (1 bad stop in Ipoh, filtered), search
  labels built. Rapid Kuantan is not on data.gov.my (404). Riders still see only the old feeds (rider planner
  snapshot unchanged at 6,571 stops).
- Problems seen: the database stopped answering for 2 to 4 minutes three times and restarted twice during the heavy
  rebuilds (03:00 MYT, few users). With every city the planner data is 3 times bigger (21.5 MB). Publishing waits for
  a decision on database size. Ipoh and Seremban timetables are for one day only and need a daily refresh.
- Website code unchanged in this step.

## Run - 26 Oct 2026, late night (photos for the Michelin and Extreme Park trails and more stops)

- New covers: Michelin trail (a plated dish, Flickr, CC BY 2.0) and Extreme Park trail (Putrajaya Challenge Park,
  U.S. Embassy Kuala Lumpur, public domain; cropped so the skater shows).
- New stop photos, each checked by eye to show the place: The Starhill, MVEC (the Mid Valley Megamall it is part of),
  Masjid India, Feeka Coffee Roasters, Pulp by Papa Palheta, Shah Alam Extreme Park, Putrajaya Challenge Park.
  Sources: Wikimedia Commons and Flickr (Creative Commons, commercial use allowed), found through Openverse.
- Still no free photo (24 stops): the Michelin restaurants, most cafés, KidZania, Jump Street, MAZE, the night markets,
  the KL Urban and Batu skate parks, Camp5, Heli Lounge, Cindai, Madam Zee. Candidates found were other places
  (KidZania Lisbon, a Hong Kong night market, Menara FELDA instead of Naza Tower) and were not used.
- Site security policy now allows images from live.staticflickr.com (scripts/csp.mjs), or Flickr photos would not
  show on the live site. Credits added to docs/RONDA_Photo_Credits.xlsx (143) and the Pictures list (24 missing).
- Unit 226 / 226 (photo check now allows Flickr). Trail pages checked in Chrome: all images load.

## Run - 26 Oct 2026, night (ECRL line with fares, photo credits moved off the photos)

- ECRL: now a line in the Lines tab ("East Coast (ECRL)" group) with its own badge. It opens a panel with the 20
  stations north to south, the starting fare and distance from Gombak (RM 24 Bentong to RM 125 Kota Bharu), Express
  fares where it stops (KotaSAS RM 68, Kuala Terengganu RM 110, Kota Bharu RM 147), phase 2 dashed (2028), the
  changes at ITT Gombak and Jalan Kastam, the fare rules (starting fares, dynamic pricing, same both ways), the
  discounts (50% / 40%), opening 12 Dec 2026, tickets from mid-November. About page card shows the same fares.
  Fares announced by MRL 19 Oct 2026 (Bernama, theSun, DagangNews); three confirmed in the news, the rest from MRL's
  chart as reposted (owner's picture), marked to recheck when ticket sales open. Line colour TODO from MRL.
  Not in trip planning (no timetable yet). Checked in Chrome (screenshots).
- Photo credits: removed from on top of every photo and video (home video, sign-in video, promotions, slides, trail
  covers, trail stops). The full list stays on the About page photo credits and /credits (CC BY / BY-SA photos need a
  credit somewhere on the site), and in docs/RONDA_Photo_Credits.xlsx (134 photos and videos).
- Owner's 9 new photos: on hold. Their files show stock or unknown sources (copyright names in the files, a stock
  preview size, an editorial stock caption) and the "Sri Mahamariamman" one is a different temple. Waiting for the
  owner to confirm the licences.
- Missing photos: searched Wikimedia Commons again for all 33; no free photo fits (restaurants, cafés, small venues;
  Commons has none of KL's Masjid India itself). Left on the category cover.
- Unit 226 / 226. Playwright home, site (incl. accessibility), links, trails: all pass.

## Run - 26 Oct 2026, evening (car park names, short car park popup, compact live search, Mosque Trail)

- Live map car parks: each one now shows a name instead of just "Car park". OpenStreetMap leaves 517 of 603
  unnamed, so the database build names them after their OSM operator, a mall / hotel / sight / place of worship /
  park next to them ("Lot 10 Car Park"), the nearest named place ("Car park near Sungei Wang Plaza") or the
  station. "Car park near ..." is translated in all four languages. Built in the database repo
  (scripts/build_station_parking.py); loaded 26 Oct 2026 with the owner's approval: 0 of 667 left as plain "Car park".
- Maluri (at-grade) Park & Ride: free for now (owner parked there, 26 Oct 2026), noted with the date; MyRapid page
  still says RM 4.50 a day, recheck later. Loaded; the popup shows "Free" (checked in Chrome).
- Car park popup cut to three lines: name (+ Park & Ride), one fare line, "256 m to the station", small Source link.
  The popup no longer jumps focus to the link.
- Live map search list: compact size for the small panel (smaller rows, badges and text, shorter list).
- Trails: "Mosques & Culture" split into a Mosque Trail (Masjid India, Masjid Jamek, National Mosque, Putra, Iron,
  Blue Mosque) and a Culture Trail (St. Mary's, Sri Mahamariamman, Guan Di, Thean Hou). Old link /trails/cultural-
  harmony still works (Culture Trail). New names, texts and cover photos (Masjid Jamek, Thean Hou). Database
  migration 20261026120000_trail_mosques.sql applied with the owner's approval; both trail pages checked in Chrome. Pictures list: 165 rows.
- Unit 226 / 226 (new: car park names). Playwright live, site (incl. accessibility), trails, journey, hub: all pass
  (trails test data has the split). Checked in Chrome: popup and search list (screenshots).

## Run - 26 Oct 2026, later (brighter home video, live map search, new Petronas Towers clip)

- Home top banner: lighter shade over the videos (bottom 55%, top 25%, nothing in the middle; it was 80% / 15% /
  35%) and the videos and photo drawn 10% brighter and more colourful. Headline and quick links still readable
  (their text shadow stays). Checked at 1440 px.
- Live map: the box now finds stations and places too ("mrt maluri" lists MRT Maluri, the Maluri bus stops and
  LRT Maluri; picking one flies the map there with a gold pin and shows every vehicle again). Route codes and train
  numbers still filter the vehicles ("T789", "9999"); text that matches no vehicle no longer empties the map.
  Arrow keys, Enter and Escape work in the list. New box text in all four languages ("Search a route, station or
  place, e.g. T808 or MRT Maluri").
- Home videos: the Petronas Towers night clip is replaced by the owner's new Pexels clip (Pexels video 15668866,
  daytime aerial of the Petronas Towers), cut to 12 s, 1280x720, 4.2 MB like the others, with its first frame as the
  poster. It plays second so the clips still go from day to night. Pictures list refreshed (164 rows, hero and brand
  still left out).
- Unit 225 / 225. Playwright live (new test: station search keeps every bus and drops a pin), home: all pass. One
  live-map test (feed error) failed once and passed in two full reruns (36 / 36); watched.

## Run - 26 Oct 2026 (Lines interchange badges, layout check of every page, Park & Ride showcase)

- Lines panel: each station now shows where you can change, as on the MyRapid line maps: the station's own lines,
  then ⇌ and the lines reached without tapping out, then a walking person and the lines reached on foot (e.g. Ampang
  Line at Titiwangsa: Ampang + Sri Petaling ⇌ Monorail, MRT Putrajaya; Sri Petaling at PWTC: walk to KTM). Built from
  public.line_stations for every rail line and public.rail_interchanges (src/services/stationConnections.ts), on
  every rail line. The badges sit to the right of the station name (under it only when the row is full, e.g. on
  phones). The header shows the line's square badge with a white ring instead of squeezing it into a circle, and the
  parking button is now the square P sign itself (it was a square inside a round border).
  New text in all four languages; new unit tests (connections, Accent).
- Layout check: every page at 1440 and 375 px (home, trails, a trail, RONDA 300, about, help, live map, hub, login,
  credits, 404): no sideways scroll, no script errors. Fixed on phones: the network numbers (18,000+ ran into the
  divider), the Malaysia dot map (only Kuala Lumpur and the country name kept, drawn larger), the RONDA 300 map
  legend (moved to the top, it covered the map credit), trail card chips (wrap instead of cutting the station to
  "LRT ..."). Everywhere: a number at the end of a heading goes with the word before it ("KLIA Terminal 1" instead
  of a lone italic "1").
- Park & Ride shown to riders: a card on the home page under "Everything you need" (big P sign, short text, "Car
  parks on the map" and "Find by line"), a feature card on About, and a Help article "Where can I park near a
  station?" (also on the Help home page). "Car parks on the map" opens /live?parking=1, which now opens with the car
  parks on (fixed: the car parks waited for the map only when ticked by hand). Checked: 651 car parks on the map.
  New text in all four languages.
- Unit 225 / 225. Playwright home, site (incl. accessibility scan), links, RONDA 300, trails, journey, hub, access:
  all pass.

## Run - 26 Oct 2026 (branch design-4-blaze, parking near stations)

- Database: public.station_parking applied 25 Oct 2026 (owner's approval): 667 car parks at 246 of 313 rail
  stations; operator Park & Ride fares in RM (MyRapid, KLIA Ekspres) and OpenStreetMap car parks with a location
  only. Counts, distances, bays and TODO notes match data/station_parking.csv in the database repo. Public read only:
  an anonymous insert is refused.
- Line panel: a blue "P" next to each station with car parks (36 of 37 on the Kelana Jaya Line; Wawasan has none on
  record). It opens the car parks under the station: Park & Ride first with the train-user rate, other rates, bays,
  distance, date checked and source link; mapped car parks without fares say "Fare not published yet".
- /live: a "Car parks" switch puts 651 P markers on the map (the 16 without a location are left out); a popup gives
  the fares or says none are published. Checked in English and Arabic (right to left).
- Trip plan: when the first train is boarded at a station with car parks, a separate line under the trip says
  "Driving to LRT Gombak? Park & Ride: RM 4.30 per day (train users)" and that parking is not in the trip fare
  (Gombak -> KLCC: fare stays RM 3.00).
- New text in all four languages (23 labels). Unit 221 / 221 (new: parking point decoding, stop-to-station lookup,
  no made-up fares). Typecheck and lint clean. Line panel list key fixed (KJ3 + 35 and KJ33 + 5 gave the same key).

## Run - 25 Oct 2026 (branch design-4-blaze, service alerts on trips)

- Operator service alerts, like Moovit's: a ride on a line with an alert in force shows a small amber "!" on its line
  badge, in the route list and on the step; the step shows the alert itself (type such as "Modified service", the
  title and details in the reader's language, falling back to English, when it was published, and a link to the
  operator's notice). Alerts never block a trip: if they fail to load, trips show as before.
- /admin: a Service alerts editor. An admin copies a notice (e.g. from MyRapid's alerts page), picks the lines, writes
  the title and details (English required; Malay, Chinese, Arabic optional), saves a draft, then publishes; ending an
  alert stamps its end time. Riders only ever see published alerts that have started and not ended.
- Database (ronda-database repo): migration 20261025100000_service_alerts.sql written, **not applied** (waits for the
  owner's approval): table, admin-only writes, public read of live alerts, and the current MyRapid Ampang Line notice
  (23 Oct 2026) as a draft with its planner rule for the next step.
- Migration applied 25 Oct 2026 (owner's approval); the Ampang notice is a draft until an admin publishes it. Owner's
  account given the admin role.
- Trip planner (plan-trip, ronda-database repo; **not deployed**, waits for approval): a published alert's rule
  "turn_back" cuts that route at the named station while the alert is in force (rules re-read every minute; the live
  function v24 is otherwise unchanged). New Deno test on real Rapid KL rail data: Ampang -> Titiwangsa becomes
  Ampang Line to Chan Sow Lin, then Sri Petaling Line (normally one ride); no option rides the Ampang Line north of
  Chan Sow Lin; Pudu -> Maluri changes at Chan Sow Lin; Maluri -> Ampang stays direct; ending the rule restores the
  line. All 12 plan-trip test files pass.
- Live 25 Oct 2026: plan-trip v25 deployed (identical to the repo), the Ampang notice published; the planner first
  could not read the alerts table (service role grant missing, added to the migration and applied), then Ampang ->
  Titiwangsa came back as Ampang Line to Chan Sow Lin + Sri Petaling Line to Titiwangsa (38 min).
- 26 Oct 2026: /admin alert editor can set the turn-back rule (line from the alert's lines, "trains from" end and
  "turn back at" station; the line's GTFS ids are filled in); alerts with a rule show "Reroutes trips". Unit 218 / 218.
- New text in all four languages. Unit 217 / 217 (new: alert loading and language fallback, admin editor). Playwright
  journey (new alert test), site (incl. accessibility scan), links and access on desktop and mobile: all pass.
  Screenshots at 1440 and 375 px.

## Run - 20 Oct 2026 (branch design-4-blaze, home order, RONDA 300 page with nearby places, Monzo-style feature cards, compact app band)

- Home order rearranged after studying Monzo, Wise, Trainline and Apple Maps (all go: tool, something to explore,
  what the product does, proof, offers, app): search, RONDA 300 trails (always first), Promotions (ads, second at
  the owner's request), "Everything you need", the lines band with its numbers, Why RONDA, then the app band and
  footer. e2e order test updated.
- RONDA 300 map polished: places are round markers in their kind's colour with the kind's white icon (drawn from the
  site's own icons) instead of plain dots, a little bigger the closer in, the nearest the middle on top; the place
  pointed at in the list grows and gets a soft halo and a callout without a tip. Stations show as small dots in the
  line's colour from afar and as the line's badge with the station's name from street level. Softer dashed 300 m
  rings; the zoom buttons are one white pill with a soft shadow. Checked in the browser; RONDA 300, site and CSP e2e
  pass. The SiteLayout chat-switch unit test timed out when the whole suite ran at once (it loads a fresh copy of the
  page frame); it now has more time. Unit 211 / 211.
- Home hero: "Plan your journey across Malaysia" moved to the top-left corner and made smaller (30 to 52 px, was 40 to
  84 px) with a soft shadow, so the skyline shows; the line and quick links stay bottom-right. Checked at 1440, 800
  and 375 px.
- Home RONDA 300 trails: a "Nearby places" button beside "See all trails" opens the RONDA 300 page. New text in all
  four languages.
- Opening another page now starts at its top (ScrollToTop in App): before, pressing a link low on Home (e.g. the
  RONDA 300 card) opened the new page at the same scroll depth. Links to a #section still go to that section; Back
  keeps the browser's own behaviour. Checked in the browser (Home at 2,979 px, RONDA 300 card, new page at 0) and
  with a new e2e test.
- RONDA 300 is a full page again (/ronda-300), rebuilt around nearby places, after Klook and Rome2rio: under the
  header (with the station search) one panel with the kinds of place as an icon bar across the top (icon, name, how
  many in view), the places in the part of the map in view on the left, and one map on the right (phones: map
  first). The list follows the map as it moves: from street level (zoom 14.5) it shows what OpenStreetMap has within
  300 m of each station in view (up to 8 stations nearest the middle, loaded once each and kept), each place with
  "About {min} min walk from {station}" and "Plan a trip here"; zoomed further out it asks to zoom in or search. The
  map opens on KLCC to Bukit Bintang; the search (or ?station=&lat=&lon=) flies it to a station; pressing a station
  flies in. Stations are dots in their lines' colours, a dashed 300 m ring around each station shown, places as
  dots in their kind's colour; pointing at a place puts a callout on its dot, pressing a dot picks it in the list.
  Station names from the table's capitals shown as "Sentul Timur" (KLCC and other short forms kept).
- The home page Trails / Station map switch and the station list are removed (Home's RONDA 300 section is trails
  again); all RONDA 300 links point to the page. The old StationsPreviewMap and StationAroundMap are replaced by
  Ronda300Map + Ronda300Explorer. New text in all four languages; unused RONDA 300 texts removed. e2e RONDA 300
  spec rewritten for the new page.
- "Everything you need" below the live-map spotlight, after photo tiles, a numbered list, tabs, photo cards and
  Apple Maps-style cards: a row of four picture cards in the way Monzo shows its products. Each picture is a clean
  drawing made for the site (src/components/FeatureArt.tsx: route to a pin, three lines in their official colours,
  station with places around it and a "300 m" walk label using the site's icons, winding trail to a flag) on a
  cream or navy block (alternating), then the name, one
  line and a "Learn more" pill; the whole card is one link (Trails always first, then Directions, Lines, RONDA 300). Four across from
  1024 px, two from 640 px, a sideways-scrolling row on phones. Phone screenshots dropped. The other six features
  follow in a ruled strip (icon in a cream circle, six across on desktop, two on phones); Languages stays a button, Coming soon kept. New text ("Learn more" and the
  one-line descriptions) in all four languages.
- Live map card taken out of "Everything you need" (it sat apart from the cards) and joined to the lines band: under
  the drifting line pills, a glass bar with the pulsing "Live" label, what the live map shows and "Open the live map"
  (a pill on desktop, a stacked card on phones). New unit test for its link. The animated drawing is gone.
- "Get the app" band made smaller and joined to the top of the footer as in the earlier design: less padding,
  smaller heading, phone 220 px wide whose top rises above the band and whose bottom is cut off where the band meets
  the footer; text and store badges left, phone right as before. The floating cards (6,500+ stations, 12 min) show
  from 1024 px up; the phone from 768 px up. Footer gap prop for Home removed (Home no longer ends in a dark band).
- Unit 211 / 211. Playwright home, site (incl. accessibility scan) and links/access on desktop and mobile: all pass
  after fixing a sideways scroll at 768 px (floating cards now hidden below 1024 px, footer clips sideways only).
  1440, 768 and 375 px, no sideways scroll.

---

## Run - 18 Oct 2026, night 3 (branch design-4-blaze, all pages, RONDA 300 map, Ainaa-style concept)

- Home hero: "Malaysia" tried in the flag's colours (striped, then letter by letter) and set back to gold at the
  owner's request.
  Full e2e: 207 passed, 3 failed under heavy load (forgot password, open chat a11y, map tiles failing); all 3
  passed when re-run alone.
- Home "Everything you need for the journey", after how Transit, Citymapper, Omio and Bolt present features: a Live
  map spotlight (navy card, live dot, gliding vehicles on three lines, "Open the live map"), then the ten features in
  three groups (Plan your trip / Explore around stations / Made for you), each with one plain line on what it does
  (4 languages; only what RONDA does today). Unit 210 / 210.
- RONDA 300: the hand-picked "Places near …" list and "nearest stations with places" removed; before a search the
  page shows a map of all 193 LRT / MRT / Monorail / BRT / ERL stations in their line colours (public.stops); pressing
  a station opens it like the search (display name looked up the same way). E2E: new preview test, old curated-list
  tests removed. Filter chips show each kind's icon in its colour instead of a dot; both RONDA 300 maps are labelled
  as regions (they hold buttons). Unit 210 / 210; RONDA 300 + site specs 66 passed.
- Fix (RONDA 300): the station suggestions were cut off by the header card; the card no longer clips (only when
  it has a photo), so the list opens over the page. Checked: "klcc" lists 4 stops, picking LRT KLCC shows its places.
- Live map: "Near me" checked with a test position (dot, accuracy ring, zoom to stops: works). The basemap's own
  shop and restaurant icons removed from the live map (not pressable there, hid the buses; places near a station
  are on RONDA 300). Unit 210 / 210; live, site and links specs passed.
- Fix (live map): the map's panel sat above the header, so the header menus could not be clicked on /live; the map
  now has its own layer under the header (checked: menu link over the panel opens, Back returns). /live redesigned:
  map as an inset card with round corners, velvet control panel with a live dot, serif title, pill filter and gold
  "Near me". Unit 210 / 210, e2e 212 passed.
- Later still: the owner's "Luxe & Elegant" palette - velvet navy #222D52, champagne #D2B68A (buttons, velvet text
  6.9:1), #E2CBA4 on dark, #6F5630 for gold text on light, silk #EEE5D9, marble #E8E4E0, warm greys, pearl white;
  the band of numbers is velvet with a champagne glow (onyx tried and dropped); the app band has the phone preview
  back, with two floating cards. Small dark-panel labels raised for contrast. Unit 210 / 210, e2e 212 passed.
- Earlier: colours changed to petrol #0F2E35 / #16434C, sand #F3EEE6, copper #D08A4E (buttons), peach copper #F2B98A
  (on petrol) and burnt sienna #9A4A1E (accent text on light); the Putra Mosque hero clip replaced by the KL
  high-rise clip (night to morning, 4.6 MB). Unit 210 / 210 after the change.
- Every inner page (Trails, trail pages, RONDA 300, Hub, About, Help, Account, dashboards, Services, Credits, 404)
  now opens with the same inset navy card as Home (PageHero) and sits on the same page grid.
- RONDA 300: search in the page header; after picking a station, the list of places (filter by kind, colour per
  kind) beside a map that stays in view: the station in the middle, a dashed 300 m ring (about 5 min walk), every
  place as a coloured dot; pointing at a place rings its dot, pressing a dot picks the place in the list.
- Look after the Ainaa site the owner pointed to, in our own shades: serif headings with the last word in italic
  shimmering gold, small gold labels between thin lines, sections alternating white / stone / navy, navy band with the
  network in big numbers, features as stone cards, navy app band, white footer, plain-text header menus. Palette:
  midnight navy, #1C3263, stone #F4F1EA, brass #C8963E (buttons), champagne #E3BE6E (on navy), deep bronze #8A6420
  (gold text on light, 4.5:1).

| Suite | Result |
|---|---|
| Website static checks (ESLint, TypeScript) | clean |
| Website unit and component tests (Vitest) | **210 / 210 passed**, 34 files |
| Website end-to-end tests (Playwright, desktop + phone, incl. accessibility scan of 14 pages) | **212 passed, 0 failed**, 6 skipped |
| RONDA 300 map | checked by eye at 1440 and 390 px with MRT Bukit Bintang (200 places), with the local map file |

---

## Run - 18 Oct 2026, night 2 (branch design-4-blaze, hero videos, ECRL, clean-up)

- Hero: 5 KL / Putrajaya videos from the owner (Pexels; re-encoded to 720p MP4, 1.2-4.4 MB each, first frame as
  poster) play one after another with a soft fade; slim bars top right switch them; phones and reduced motion keep
  the photo.
- About: ECRL "coming soon" card - 20 stations, phase 1 (Kota Bharu - ITT Gombak, target mid-Dec 2026) and phase 2
  (to Jalan Kastam, service from Jan 2028), interchanges, "fares not announced yet", sources linked. The viral fare
  poster was not used (The Star fact-check: not official).
- Clean-up: rainbow stripes removed; section labels as small capitals with a gold dot; one heading scale; hero
  without decorative chips; even trail row; feature slides off the page for now; navy line band and stats card;
  cool blue-grey neutrals. Promotions and "Everything you need" made compact (banner + 3 small cards; 5 x 2 icon
  tiles, each feature with its own colour and icon pair).
- Later the same night: the line band quote is a large white quote signed with the white logo; feature tiles show
  plain coloured icons (no tinted boxes or badges) at one even height; section labels are solid pills (navy, or
  white on the dark band) with a gold dot. Unit 210 / 210, home + site e2e re-run passed.
- Fix: pressing Search on the Lines tab with an empty box did nothing; it now opens the list of all lines.

| Suite | Result |
|---|---|
| Website static checks (ESLint, TypeScript) | clean |
| Website unit and component tests (Vitest) | **210 / 210 passed**, 34 files (new: EcrlCard, HeroVideos) |
| Website end-to-end tests (Playwright, desktop + phone) | **211 passed, 1 failed**, 6 skipped in the full run before the fix; after the fix, links + journey specs **19 passed** |

---

## Run - 18 Oct 2026, late (branch design-4-blaze, features band as a route)

"Everything you need for the journey" redesigned: heading and the station-map drawing on the left (they stay in view
on wide screens), the 10 features on the right as stops on a gold line, each with a station code (RD01-RD10), icon,
name and arrow; pointing at a stop lights it gold. Same links and texts as before.

| Suite | Result |
|---|---|
| Website static checks (ESLint, TypeScript) | clean |
| Website unit and component tests (Vitest) | **206 / 206 passed**, 32 files |
| Website end-to-end tests (Playwright, desktop + phone) | **211 passed, 1 failed**, 6 skipped in the full run; the failed one ("every visible button does something", the trails "Next" arrow on /?tab=lines) **passed** when run again alone, so it is a timing flake under load, not a broken button |

---

## Run - 18 Oct 2026, night (branch design-4-blaze, cards, features band, footer)

Promotion cards are now one solid card each (photo and text on one grey surface, no white backing or shadow), so the
card on top covers the one below exactly while scrolling (checked frame by frame every 140 px). Features band rebuilt:
tiles in one grid with even 1 px lines, hover fills the whole tile, "Coming soon" inside its tile; the drawing is now a
station-map style diagram (straight lines, 45 degree bends, interchanges where lines meet) with a key of line names.
Large RONDA wordmark removed from the footer.

| Suite | Result |
|---|---|
| Website static checks (ESLint, TypeScript) | clean |
| Website unit and component tests (Vitest) | **206 / 206 passed**, 32 files |
| Website end-to-end tests (Playwright, desktop + phone) | **212 passed, 0 failed**, 6 skipped (full run before the footer change); site, home and links specs re-run after it: **75 passed** |

---

## Run - 18 Oct 2026, evening (branch design-4-blaze, polish + Black & Gold)

Design review fixes: one page grid (every block starts on the same 80 px line on wide screens: header, hero text,
search card, sections, footer); promotion cards all the same size and sticking at the same place, so each one slides
over the last and covers it fully (no more slivers of mismatched halves); word-by-word headings now fade smoothly
(no re-render while scrolling); gentler fade-up; stations in the metro drawing sit on their lines. Colours moved to the
Black & Gold set across the whole site: navy #14213D, gold #FCA311 for main actions (with navy text), platinum and
neutral greys, black footer. Official line colours unchanged.

| Suite | Result |
|---|---|
| Website static checks (ESLint, TypeScript) | clean |
| Website unit and component tests (Vitest) | **206 / 206 passed**, 32 files |
| Website end-to-end tests (Playwright, desktop + phone, incl. accessibility scan of 14 pages) | **212 passed, 0 failed**, 6 skipped |
| Visual check | full-page screenshots at 390, 1024, 1280, 1440 px; scroll frames every 200 px through the promotion cards; /trails, /login, /about checked for the new colours |

---

## Run - 18 Oct 2026 (branch design-4-blaze)

New home page layout in the style of the Blaze travel template (white page, 32 px round corners, grey pills,
fade-up and word-by-word headings, sticky stacked promotion cards, dark band and footer), themed on Malaysian rail:
official line colours, a moving row of every line with its badge, a metro drawing. Text and data unchanged, except the
slide 2 button label ("Explore stations"), which had gone missing on 15 Oct and is back in all 4 languages, and one new
footer button "Back to top" (4 languages).

| Suite | Result |
|---|---|
| Website static checks (ESLint, TypeScript) | clean |
| Website unit and component tests (Vitest) | **206 / 206 passed**, 32 files (new: Motion, LineMarquee; promotions arrows test replaced by stacked-cards test) |
| Website end-to-end tests (Playwright, desktop + phone, incl. accessibility scan of 14 pages) | **212 passed, 0 failed**, 6 skipped (desktop-only or phone-only tests) |
| Visual check (full-page screenshots at 375, 768, 1024, 1280, 1440 px; reduced motion too) | checked by eye: no overlap, no sideways scroll, long line names wrap on phones |
| Trip-planner regression matrix | Not run (no planner or database change) |

Notes: one earlier full run had 2 tests time out under load (journey "use my location", trails "See all trails");
both passed alone and in the next two full runs. Production workbook (database repo `testing/build_report.py`) not
regenerated: this branch is not deployed.

---

## Run - 15 Oct 2026 (branch design-2-blue-classic)

| Suite | Result |
|---|---|
| Website static checks (ESLint, TypeScript) | clean |
| Website unit and component tests (Vitest) | **200 / 200 passed**, 30 files |
| Website end-to-end tests (Playwright, desktop + phone) | **210 passed, 0 failed**, 6 skipped (desktop-only or phone-only tests) |
| Trip-planner regression matrix (production, plan-trip v23) | **134 cases, 0 regressions** (2 improved), p95 276 ms |
| Nightly route check (production, first run) | 56 trips + 186 nearby-station trips planned; 14 trips flagged for review (database repo `docs/ROUTE_QUALITY_PLAN.md`) |

Changes covered since 7 Oct: hub pages, OSM places, one-line "Nearest", Why RONDA, least walking first, MyRapid line
and bus icons, passes in fares, Fun & Activities trails (5 trails, 25 places on production since 15 Oct; Paintball and Karting, 3 more places, waiting
for deploy). The full workbook is the database repo's `testing/RONDA_Test_Report.xlsx`.

---

## Earlier run - 7 Oct 2026

Website `main` at `a713772`; database repository at `80044b8`; production Supabase project after the
`trail_halal_fine_dining` and `ai_chat` migrations. All runs on 7 Oct 2026. How each layer works: `docs/TESTING.md`.

## Summary

| Suite | Result |
|---|---|
| Website static checks (ESLint, TypeScript) | clean |
| Website unit and component tests (Vitest) | **183 / 183 passed**, 23 files |
| Website end-to-end tests (Playwright, desktop + phone) | **192 passed, 0 failed**, 6 skipped (desktop-only or phone-only tests) |
| Edge Function unit tests (trip planner, live, assistant, delete account) | **236 / 236 checks**, 15 files |
| Production smoke + security checks | **46 / 46** (48 / 48 after the KTM fare checks were added) |
| Trip-planner regression matrix (production) | **134 cases, 0 regressions** (2 improved) |
| Interchanges (production) | **36 / 36** change where they should |
| Load test (production) | **pass**: plan p95 1.3 s, live p95 0.68 s, 0 errors |
| Read-only live smoke (`scripts/smoke-live.ts`) | **13 / 13** |
| Production build | builds; CSP, sitemap and trail texts generated |

## Website end-to-end (192)

| Area | What is proven |
|---|---|
| Journeys | search by code, typo and name; plan a trip; journey panel; errors; out-of-reach; Enter keys |
| Lines | pressing the Line box shows every line as a tile; picking opens it; Escape / click elsewhere closes; Bus routes tile then T352 found however typed |
| Home | section order; promotion banners marked "Ad" (arrows scroll the row on small screens); no overlap or sideways scroll at 375 / 768 / 1440 px |
| Menu | Hub, Explore, RONDA 300, Services, About; Explore goes to the trails |
| Trails | Arabic-only halal category hidden in English, shown and filterable in Arabic |
| RONDA 300 | station with places; station without places shows the nearest stations that have some |
| Help | 3 categories, articles, search, removed category redirects |
| Live map | buses and trains drawn, counts, stops |
| Sign-in pages | signed-out redirect, no-access page, signed-in dashboard |
| Accounts | forgot password (same answer for any email), reset password (rules, old link), account page (name, password, sign out everywhere), delete account (DELETE to confirm; failure keeps you signed in) |
| Assistant (flag on in tests) | answers with cards, guest without CAPTCHA, rate limit, Escape, Arabic, phone sheet, hidden behind side panels |
| Links and buttons | every internal link on 16 pages in all 4 languages opens a real page and its section; every visible button does something |
| Accessibility (axe, WCAG 2.1 AA) | every public page incl. RONDA 300 and the 404 page, the open chat, the journey panel, the dashboard: **0 serious or critical issues**, baseline empty |
| Security policy | 8 pages with the generated Content-Security-Policy: nothing blocked; also checked on the production build with the real map file |

## Measurements

| Check | Result |
|---|---|
| Hero text contrast, worst pixel (needs 3:1 headline, 4.5:1 subtitle) | 375 px: 6.57 / 5.04 - 768 px: 6.75 / 4.62 - 1440 px: 6.76 / 6.34 |
| Feature tile icon contrast on white (needs 3:1) | 3.12 to 10.24 for all 10 tiles |
| Load test (90 s, 12 users, 110 plans + 225 live calls a minute, the per-caller maximum) | plan p50 / p95: 0.55 / 1.31 s; live p95 0.68 s; 0 errors; all 165 rail trips priced |
| Response sizes (compressed) | trip plan 1.9 KB, live map 36.6 KB, station search 0.4 KB, trails 3.1 KB |

## Code coverage

Line coverage of the website is 31% overall (most pages are covered end-to-end instead); every new module has its own
minimum enforced in `vitest.config.ts` (90-100% of lines): RONDA 300 lookup, Help data, trails, chat service and
widget, line tiles, feature tiles, promotions, Help page.

- Home "Why RONDA?" map (15 Oct): redrawn as a dot map of Malaysia that fills in when scrolled into view, cities
  marked, no transit lines; still picture for reduced motion; lint, typecheck, unit 198 and e2e 200 passed.

- Trails (15 Oct, owner's pick): the full-photo card on Home and /trails; Home "See all trails" (was "Explore stations" to RONDA 300)
  opens /trails with the same category; the trail page's back button returns to where the trail was opened; a
  "Trail overview" under the header (stops, start and end station, plan a trip to the start, map beside them; map
  under the facts on phones). Home map cities: official open timetables (data.gov.my).
  Lint, typecheck, unit 198 and e2e 204 passed.

- Photos (15 Oct): 42 stop photos and 5 trail covers added from Wikimedia Commons (free licences, credited, each
  checked by eye); all trail pages load every picture (no broken images). 2 covers and 31 stops still have none
  (database repo `docs/PICTURES_NEEDED.md`). Unit 200, e2e 210 passed.

- Line badges (15 Oct): every line now uses our own vector badge in the style of MyRapid's line legend (one matching
  set, sharp at any size); MyRapid's small icon files are kept on record but no longer shown. App badge files
  (`public/lines`) re-exported. Unit 200, e2e 212 passed.

## Known gaps (not test failures)

- KTM Komuter (Klang Valley) fares were added on 7 Oct after this report (smoke 48 / 48, regression 0 regressions);
  ETS / Intercity (flexible fares), Northern Komuter, Shuttle Selatan, Abdullah Hukum and Kajang 2 stay unpriced.
- KTMB publishes its timetable about two weeks ahead and moves the end date forward daily (29 Oct on 15 Oct); the
  alert now fires 7 days before the end, so only if KTMB stops publishing.
- API keys (15 Oct): database smoke checks pass 48/48 with the publishable key the website uses; backend functions
  moved to the new secret key and deployed (plan-trip v24); regression 134/134, no change in results (database repo
  `docs/API_KEYS.md`).
- Live KTM positions: the official open feed carries ETS / intercity trainsets only (7 trains at 13:15 on 7 Oct),
  no Komuter.
- No independent penetration test yet; native-speaker review of Malay, Chinese and Arabic pending (`docs/UAT.md`).
- Tests against the real domain wait for hosting day.

## Test history (27 Sep - 7 Oct 2026)

238 recorded test runs over 9 working days (planner unit tests, Edge Function tests, Vitest, Playwright, production
smoke, regression, interchanges, load, live smoke, contrast, audit, lint). Failures during a day were defects found
and fixed the same day; the last run of every suite on 7 Oct passed (full re-run at 14:29 on 7 Oct: same results; search p95 283 ms). Every run, with time and result, is in the
testing workbook (sheets "Daily Test Summary" and "Test History (all runs)").

## How to repeat

```bash
npm run test:all
```

Database repository: `npm test`, `npm run test:smoke`, `npm run test:regression`, `npm run test:interchanges`,
`node tests/load/load_test.mjs`.
