# User acceptance tests

People (not scripts) try the site the way real riders will, before each release. Use a phone for at least two
personas. Write down anything confusing, not only what is broken. Tick a row only when it works without help.

How to run a session: open the release build (or the live site), clear the browser's site data, give the tester
the persona and the tasks only, and watch without helping. 20-30 minutes per persona.

## 1. Aisyah, student in Kuala Lumpur (Bahasa Melayu, phone)

| # | Task | Expected |
|---|---|---|
| 1 | Switch the site to Bahasa Melayu | Every menu, button and page text is in Malay; it stays Malay after a reload |
| 2 | Plan a trip from LRT Universiti to MRT Pasar Seni, leaving now | Options with times, changes and a fare; cashless fare by default |
| 3 | Find bus route T410 without typing in Directions | Lines tab -> Bus routes tile -> type "t410" -> the route opens |
| 4 | Find a cheap place to eat near a station | Trails or RONDA 300 show places near a station with "Plan a trip here" |
| 5 | Open a Help answer about fares | Help -> Payments -> "Which fare does RONDA show?" opens and reads clearly |

## 2. Daniel, tourist arriving at KLIA (English, phone, first visit)

| # | Task | Expected |
|---|---|---|
| 1 | Get from KLIA Terminal 1 to KL Sentral | "Airport & hubs" slide or Hub menu -> KLIA Terminal 1 is filled in; KLIA Ekspres / Transit options |
| 2 | See the tourist fare | Trip options -> tourist fare shown |
| 3 | Find what to do near KLCC | Explore -> trails; or RONDA 300 -> LRT KLCC -> places with plan links |
| 4 | Ask the assistant (when switched on) "hotels near LRT KLCC" | Answer in English with cards; any price is labelled "Estimate" with its source |
| 5 | Open a page that doesn't exist (type a wrong address) | "Page not found" with ways back |

## 3. Ahmed, visitor from the Gulf (Arabic, desktop)

| # | Task | Expected |
|---|---|---|
| 1 | Switch to العربية | Layout turns right-to-left; menus, slides and chat launcher (bottom-left) mirror |
| 2 | Find halal fine dining | Explore -> the halal category appears (Arabic only); places are JAKIM-certified hotel restaurants |
| 3 | Plan a trip to one of those places | "Plan a trip here" fills the destination |
| 4 | Read the Help policies | Articles in Arabic, marked as a draft for legal review |
| 5 | Check the trail cards and RONDA 300 in Arabic | Station names stay as proper nouns; arrows point the right way |

## 4. Mei Ling, office worker commuting daily (中文, desktop then phone)

| # | Task | Expected |
|---|---|---|
| 1 | Plan the usual commute (MRT Kajang Line, one change) | Fastest and fewest-changes options, platform and walking steps |
| 2 | See where the KTM train is | Live map shows KTM trains with destination, next stop and how late |
| 3 | Use every tile under "Everything you need" | Each tile opens something useful; "Last-train alerts" says "Coming soon" |
| 4 | Look for promotions | Promotions are clearly marked "Ad"; nothing tracks her |
| 5 | Find out what data RONDA keeps about her | Help -> Policies -> privacy article |

## Wording check (native speakers)

Before launch, a native speaker reads every page in Malay, Chinese and Arabic and notes wording that is wrong,
stiff or too literal. The Arabic names (for example the halal category) will be revised by the owner.

## Record

| Date | Build | Persona | Tester | Passed | Issues raised |
|---|---|---|---|---|---|
| | | | | | |
