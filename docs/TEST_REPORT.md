# Test report

## Latest run - 18 Oct 2026, night (branch design-4-blaze, cards, features band, footer)

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
