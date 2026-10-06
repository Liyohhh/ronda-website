# Soft launch: 10 Oct 2026

## Owner (blocking)

- [ ] Buy the domain (`.com` on Cloudflare Registrar is quickest; `.com.my` needs SSM documents).
- [ ] Create the Cloudflare account (add a card if asked; Pages and R2 free tiers apply).
- [ ] Supabase -> Authentication -> turn on leaked password protection.
- [ ] Supabase -> Project Settings -> Vault: secret `discord_webhook_url` (alerts to Discord).
- [ ] When the `@ronda.com` business address exists: set `VITE_CONTACT_EMAIL` on Pages (Help shows it).

## After launch (not needed on 10 Oct)

- RONDA assistant (chat): off until switched on (its migration is applied, 7 Oct). Run
  `scripts/load_osm_pois.mjs`, one real Apify run, secrets and Auth settings per the database repo's
  `docs/AI_CHAT.md`, deploy `ai-chat`, then `VITE_AI_CHAT=on` and `VITE_CAPTCHA_SITE_KEY` on Pages. The CSP then
  allows the Turnstile CAPTCHA by itself (`scripts/csp.mjs`).
- Native speakers check the Malay, Chinese and Arabic wording (`docs/UAT.md`).
- Saved trips and last-train alerts (dashboard shows them as "Coming soon").

## Hosting day (once the domain and the Cloudflare account exist)

1. **Map file**: create an R2 bucket, upload `malaysia.pmtiles` (docs/MAP.md), connect a custom domain
   (e.g. `map.<domain>`), CORS: allow `GET`, `HEAD` from `https://<domain>` with header `Range`.
2. **Website**: Cloudflare Pages -> connect GitHub `Liyohhh/ronda-website`, branch `main`, build `npm run build`,
   output `dist`. Environment variables:
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (same as `.env`)
   - `VITE_MAP_PMTILES_URL=https://map.<domain>/malaysia.pmtiles`
   - `SITE_URL=https://<domain>` (the build then writes `sitemap.xml` and adds it to `robots.txt`)
   Single-page app routing works without extra files (no `404.html`, so Pages serves `index.html`).
3. **Custom domain** on the Pages project (`<domain>` and `www.<domain>`).
4. **Lock the public functions** (plan-trip, live, geocode) to `https://<domain>`: CORS origin instead of `*`
   (owner decision 3 Oct 2026), then redeploy them. Requests with no `Origin` header (the mobile apps) must keep
   working: refuse only other web origins (see `docs/APP_API.md` in the database repo).
5. **Supabase Auth**: Site URL and redirect URLs -> `https://<domain>`.
6. **Content-Security-Policy**: automatic. `npm run build` writes it into `dist/_headers` from the same env
   (`scripts/csp.mjs`); after the first deploy, check the response header of `https://<domain>/`.
7. **Link previews**: `og:image` / `og:url` as absolute URLs on the domain (`sitemap.xml` is automatic, step 2).

## Checks before opening (8-9 Oct)

- [ ] Smoke (38), regression (134), load test, interchange test against production: all pass.
- [ ] Health checks H1-H8 and security checks S1-S7: no rows.
- [ ] On the real domain, phone and desktop: plan a trip, search (codes, typos, Malay names), live map
      (buses, trains, stops), trails, all 4 languages, location allowed and blocked.
- [ ] Alerts reach Discord (temporarily open a test alert).
- [ ] `node --experimental-strip-types scripts/smoke-live.ts` with `SITE_URL=https://<domain>` (read-only): all pass.
- [ ] UAT: the four personas in `docs/UAT.md`.

## Status 4 Oct 2026

Done: own Malaysia map (MapLibre + PMTiles), pages load on demand (home page 713 KB of script instead of
1.86 MB), security headers, robots.txt, link previews; regression 0 regressions, load test p95 1.0 s (plan) /
0.66 s (live), 0 errors; security checks clean.

## Status 7 Oct 2026

Branch `feature/home-nav-help-ai` (not merged): new home order (trails, promotions, slides, tiles, reviews), line
picker A/B, 5 slides with credited KL photos, Hub / Explore / RONDA 300 / Services / About menu, `/ronda-300`, real
Help articles, 404 page, dashboards, the assistant (off). Tests: 181 unit, 158 end-to-end (links and buttons in
all 4 languages, axe on every page), 220 Edge Function checks.
