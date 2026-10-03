# Soft launch: 10 Oct 2026

## Owner (blocking)

- [ ] Buy the domain (`.com` on Cloudflare Registrar is quickest; `.com.my` needs SSM documents).
- [ ] Create the Cloudflare account (add a card if asked; Pages and R2 free tiers apply).
- [ ] Supabase -> Authentication -> turn on leaked password protection.
- [ ] Supabase -> Project Settings -> Vault: secret `discord_webhook_url` (alerts to Discord).

## Hosting day (once the domain and the Cloudflare account exist)

1. **Map file**: create an R2 bucket, upload `malaysia.pmtiles` (docs/MAP.md), connect a custom domain
   (e.g. `map.<domain>`), CORS: allow `GET`, `HEAD` from `https://<domain>` with header `Range`.
2. **Website**: Cloudflare Pages -> connect GitHub `Liyohhh/ronda-website`, branch `main`, build `npm run build`,
   output `dist`. Environment variables:
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (same as `.env`)
   - `VITE_MAP_PMTILES_URL=https://map.<domain>/malaysia.pmtiles`
   Single-page app routing works without extra files (no `404.html`, so Pages serves `index.html`).
3. **Custom domain** on the Pages project (`<domain>` and `www.<domain>`).
4. **Lock the public functions** (plan-trip, live, geocode) to `https://<domain>`: CORS origin instead of `*`
   (owner decision 3 Oct 2026), then redeploy them.
5. **Supabase Auth**: Site URL and redirect URLs -> `https://<domain>`.
6. **Content-Security-Policy** in `public/_headers` (connect: Supabase, map host, protomaps.github.io;
   img: self, data:, blob:, upload.wikimedia.org; worker: self blob:).
7. **Link previews**: `og:image` / `og:url` as absolute URLs on the domain; add `sitemap.xml`.

## Checks before opening (8-9 Oct)

- [ ] Smoke (38), regression (134), load test, interchange test against production: all pass.
- [ ] Health checks H1-H8 and security checks S1-S7: no rows.
- [ ] On the real domain, phone and desktop: plan a trip, search (codes, typos, Malay names), live map
      (buses, trains, stops), trails, all 4 languages, location allowed and blocked.
- [ ] Alerts reach Discord (temporarily open a test alert).

## Status 4 Oct 2026

Done: own Malaysia map (MapLibre + PMTiles), pages load on demand (home page 713 KB of script instead of
1.86 MB), security headers, robots.txt, link previews; regression 0 regressions, load test p95 1.0 s (plan) /
0.66 s (live), 0 errors; security checks clean.
