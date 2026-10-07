# Test report - 7 Oct 2026

Website `main` at `a713772`; database repository at `80044b8`; production Supabase project after the
`trail_halal_fine_dining` and `ai_chat` migrations. All runs on 7 Oct 2026. How each layer works: `docs/TESTING.md`.

## Summary

| Suite | Result |
|---|---|
| Website static checks (ESLint, TypeScript) | clean |
| Website unit and component tests (Vitest) | **183 / 183 passed**, 23 files |
| Website end-to-end tests (Playwright, desktop + phone) | **178 passed, 0 failed**, 6 skipped (desktop-only or phone-only tests) |
| Edge Function unit tests (trip planner, live, assistant) | **221 / 221 checks**, 14 files |
| Production smoke + security checks | **46 / 46** (48 / 48 after the KTM fare checks were added) |
| Trip-planner regression matrix (production) | **134 cases, 0 regressions** (2 improved) |
| Interchanges (production) | **36 / 36** change where they should |
| Load test (production) | **pass**: plan p95 1.3 s, live p95 0.68 s, 0 errors |
| Read-only live smoke (`scripts/smoke-live.ts`) | **13 / 13** |
| Production build | builds; CSP, sitemap and trail texts generated |

## Website end-to-end (178)

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

## Known gaps (not test failures)

- KTM Komuter (Klang Valley) fares were added on 7 Oct after this report (smoke 48 / 48, regression 0 regressions);
  ETS / Intercity (flexible fares), Northern Komuter, Shuttle Selatan, Abdullah Hukum and Kajang 2 stay unpriced.
- KTMB's published timetable ends 21 Oct 2026; an alert is open until KTMB publishes the next one.
- Live KTM positions: the official open feed carries ETS / intercity trainsets only (7 trains at 13:15 on 7 Oct),
  no Komuter.
- No independent penetration test yet; native-speaker review of Malay, Chinese and Arabic pending (`docs/UAT.md`).
- Tests against the real domain wait for hosting day.

## Test history (27 Sep - 7 Oct 2026)

220 recorded test runs over 9 working days (planner unit tests, Edge Function tests, Vitest, Playwright, production
smoke, regression, interchanges, load, live smoke, contrast, audit, lint). Failures during a day were defects found
and fixed the same day; the last run of every suite on 7 Oct passed (full re-run at 14:29 on 7 Oct: same results; search p95 283 ms). Every run, with time and result, is in the
testing workbook (sheets "Daily Test Summary" and "Test History (all runs)").

## How to repeat

```bash
npm run test:all
```

Database repository: `npm test`, `npm run test:smoke`, `npm run test:regression`, `npm run test:interchanges`,
`node tests/load/load_test.mjs`.
