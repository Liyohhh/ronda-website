# Test report

## Latest run - 27 Oct 2026, later (owner's own photos for 8 stops and 2 trail covers)

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
