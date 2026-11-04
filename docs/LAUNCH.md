# Soft launch: 10 Oct 2026

## Owner (blocking)

- [x] Domain bought: **ronda2u.com** at Exabytes (domain only, no hosting package), paid to 27 Oct 2029, auto-renew on.
- [x] Main domain changed to **ronda2go.com** (owner, 1 Nov 2026): bought at Exabytes 31 Oct 2026 for 3 years
      (RM200.10, renews at RM278.40 every 3 years, next due 31 Oct 2029). ronda2u.com stays as a redirect and mail alias.
- [x] Cloudflare account created (free) and the nameservers pointed to it at Exabytes (27 Oct 2026:
      carla.ns.cloudflare.com, chase.ns.cloudflare.com). ronda2go.com added to the same RONDA account on 1 Nov 2026,
      same nameservers. All DNS records now live in Cloudflare.
- [x] Exabytes: Registrar Lock on for ronda2go.com (owner, 4 Nov 2026).
- [x] Email on Google Workspace Business Starter (27 Oct 2026). ronda2go.com is the primary domain since 1 Nov 2026;
      groups admin@, support@ and feedback@ renamed to @ronda2go.com with the old @ronda2u.com addresses kept as
      aliases. Cloudflare DNS for ronda2go.com has MX (smtp.google.com), SPF, DKIM (authenticating) and DMARC
      (`v=DMARC1; p=none; rua=mailto:admin@ronda2go.com`), all checked 1 Nov 2026.
- [x] ronda2u.com and www.ronda2u.com redirect (301) to https://ronda2go.com (Cloudflare redirect rule, 4 Nov 2026).
- [x] Site online, not announced (4 Nov 2026): Cloudflare Pages project `ronda2go` from `main`, custom domains
      ronda2go.com and www.ronda2go.com; map file on R2 at https://map.ronda2go.com/malaysia.pmtiles.
- [ ] Cloudflare Pages: switch off Web Analytics (its script is blocked by the CSP) or allow it in scripts/csp.mjs.
- [ ] When the site is live on ronda2go.com: Supabase secret `ALLOWED_ORIGINS=https://ronda2go.com,https://www.ronda2go.com`
      (ai-chat, delete-account), Supabase Auth Site URL and redirect URLs to https://ronda2go.com, and the Amazon SES
      sender on ronda2go.com (add `include:amazonses.com` to the same SPF record, plus SES's DKIM records).
- [ ] Change the login email of Cloudflare, AWS and Supabase from admin@ronda2u.com to admin@ronda2go.com
      (the old address still receives mail as an alias, so nothing is urgent).
- [ ] Supabase production setup (full scale from launch, owner decision 7 Oct 2026), about RM1,418 a month:
      Billing -> **Pro**; Project -> Settings -> Compute and Disk -> **Large** (2 dedicated vCPU, 8 GB; under 2 min
      downtime, do it 8 Oct); Add-ons -> **PITR 7 days**; Database -> Read Replicas -> **1 replica** (Singapore);
      Billing -> Spend cap **off** (PITR is not covered by it anyway). Re-run the load test afterwards.
- [x] Supabase -> Authentication -> turn on leaked password protection (owner, 1 Nov 2026).
- [ ] Supabase -> Project Settings -> Vault: secret `discord_webhook_url` (alerts to Discord).
- [x] Official addresses (28 Oct 2026, moved to ronda2go.com 1 Nov 2026, in `src/data/contact.ts`): support@ronda2go.com
      (help for riders and partners, shown in Help and Account) and feedback@ronda2go.com (rider feedback, shown in Help). admin@ronda2go.com is for
      RONDA's own accounts (Cloudflare, AWS, Supabase, app stores, codes and bills) and is never shown on the site.

## Ready for 50,000 users (agreed 28 Oct 2026)

- [x] Supabase: Pro + Large compute (switched by the owner, checked 1 Nov 2026: 160 connections) (about RM551 a month with SST); the owner pays and switches later and says
      so first, so no import is running at the time. admin@ronda2u.com is an Owner of the Supabase organisation.
- [x] AWS account (made 28 Oct 2026, company Movinexa): Paid plan (31 Oct 2026) and advanced features (boss approved,
      3 Nov 2026; organisation Ronda-Team, root email admin@ronda2go.com). SES in Singapore in the **Ronda-Team
      Management Account** (the project account "Minimum Delightful Product" blocks SES through a service control
      policy): ronda2go.com verified with Easy DKIM 2048 and MAIL FROM mail.ronda2go.com (records in Cloudflare,
      checked 3 Nov 2026); SMTP user `ses-smtp-supabase`; Supabase custom SMTP on (sender no-reply@ronda2go.com,
      Ronda2Go) and the Ronda2Go email templates pasted.
- [ ] SES production access: requested 3 Nov 2026, waiting for AWS (until then SES only sends to @ronda2go.com).
- [x] Boss's phone added as a second MFA device on the AWS Builder ID login (owner, 4 Nov 2026).
- [ ] AWS root user of the Ronda-Team Management Account (admin@ronda2go.com): no password or MFA set yet; the
      boss wants one shared password for all accounts (4 Nov 2026). Root of the two member accounts: not present
      (checked 4 Nov 2026). Open point for the security check: root MFA, 2-step sign-in on every service, and
      Google Workspace 2-step verification enforced (admin@ can reset the other accounts).
- [x] CloudWatch alarms on SES (Singapore, Management Account), SNS topic `ses-alerts` to admin@ronda2go.com:
      "SES bounce rate 2%" (Reputation.BounceRate >= 0.02) and "SES complaint rate 0.1%" (Reputation.ComplaintRate
      >= 0.001), made 3 Nov 2026. Suppression list on for bounces and complaints.
- [x] SNS email subscription confirmed in the admin@ronda2go.com inbox (3 Nov 2026).
- [x] After the switch to Pro (done by the owner, 1 Nov 2026): Supabase -> Authentication -> Sign In / Providers -> Email -> "Prevent use of leaked
      passwords" on, then Save (Pro only; on Free the switch shows on but does nothing). Owner asked to be reminded.
- [x] After the switch (1 Nov 2026, p95 plan-trip 2.1 s, live 1.5 s, 0 errors): run `npm run test:load` in the database repo on Large and record p95 per endpoint
      (checklist G12-16).
- [ ] Self-host Photon geocoding for Malaysia only, likely on the AWS walking-router server; the public Photon server
      is fair-use and may block RONDA (G12-17).
- [ ] Remove the tile.openstreetmap.org fallback in `src/services/mapStyle.ts` and always use our PMTiles on R2;
      OpenStreetMap's tile policy does not allow public apps (G12-18).
- [x] Per-IP rate limits on plan-trip, geocode and live: already in place since 2 Oct 2026 (120 / 120 / 240 a minute,
      G12-05). Re-check the limits against the load test results.

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

## Before launch: security check (owner asked, 4 Nov 2026)

Run once everything else on this list is done, before the site goes public:

- [ ] Supabase: security and performance advisors clean (RLS on every table, function search paths), Auth settings
      (leaked password protection, CAPTCHA, rate limits, redirect URLs only ronda2go.com), legacy API keys off.
- [ ] CORS of public functions locked to ronda2go.com; no secrets in either repo or in the built site.
- [ ] Cloudflare: HTTPS only, security headers and CSP on the site, WAF basics.
- [ ] Accounts: MFA on AWS root (admin@ronda2go.com) with the boss's phone added; check members on Supabase,
      Cloudflare, Google Workspace and AWS (only the people who need access).
- [x] Outside code security review (4 Nov 2026). Fixed: admin check by role only, test planner switched off,
      vite update, HSTS / COOP / CORP headers.
- [ ] Before the public launch, from that review: rate-limited writes for statistics and ad enquiries (statistics
      needs the app change first), trusted client IP in the rate limits, avatar upload rules, account deletion also
      clears statistics, enquiries and all photo files, Supabase "Secure password change" on.
