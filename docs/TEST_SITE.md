# Test website (private, for QA)

A private copy of the website for the tester: same build and real data, behind a login so only invited people
reach it. The tester gets this site and the QA kit (`ronda2go-qa` repository), never this repository.

## One-time setup (Cloudflare account, about 30 minutes)

1. **Branch**: create a `test` branch from `main` and push it. Every release goes to `test` first, then `main`.
2. **Pages project**: Cloudflare -> Workers & Pages -> Create -> Pages -> connect GitHub `Liyohhh/ronda-website`.
   - Project name `ronda2go-test`, production branch `test`, build command `npm run build`, output `dist`.
   - Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (same as `.env`). Leave `SITE_URL`
     unset, so the test site writes no sitemap. `VITE_MAP_PMTILES_URL` when the map file is hosted (without it
     the map uses plain OpenStreetMap tiles). `VITE_AI_CHAT=on` once `ai-chat` is deployed.
3. **Address**: Pages project -> Custom domains -> `test.ronda2go.com`.
4. **Login in front of it (Cloudflare Access, free up to 50 people)**: Zero Trust -> Access -> Applications ->
   Add -> Self-hosted.
   - Domains: `test.ronda2go.com` and `ronda2go-test.pages.dev` (plus `*.ronda2go-test.pages.dev` for preview builds).
   - Policy "Team": Allow, Emails = Lya's and the tester's. Login by one-time code to the email.
   - Policy "QA kit": Service Auth, with a new service token (Access -> Service credentials). Send its Client ID
     and Client Secret to the tester for `CF_ACCESS_CLIENT_ID` / `CF_ACCESS_CLIENT_SECRET` in the kit's `.env`.
5. **Sign-in links**: Supabase -> Authentication -> URL configuration -> add `https://test.ronda2go.com/**` to the
   redirect URLs, so confirm and reset emails can return to the test site.
6. **QA test account**: Supabase -> Authentication -> Add user, with an address the team owns (for example
   `qa@ronda2go.com`), confirmed, normal user (no admin role). Its email and password go in the kit's
   `QA_TEST_EMAIL` / `QA_TEST_PASSWORD`. The assistant allows signed-in users 30 questions an hour and 100 a day,
   so a full evaluation run of 50 questions takes two hours unless this account gets a higher limit.
7. **When the public functions are locked to the domain** (`docs/LAUNCH.md`, hosting day step 4): allow
   `https://test.ronda2go.com` too, or the test site stops planning trips.

## What to send the tester

- The test website link, and the invitation email from Cloudflare Access.
- Access to the `ronda2go-qa` repository.
- For the kit's `.env`: the backend address and public key (the same two the website uses), the Access service
  token, and the QA account. Nothing else: no secret keys, no database access.
