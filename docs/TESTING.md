# Testing

How the RONDA website is tested, how to run the tests, and the rules for adding to them.

## Test layers

| Layer | Tool | Where | What it covers |
|---|---|---|---|
| Static | ESLint, TypeScript | `npm run lint`, `npm run typecheck` | Code rules, types (app, tests and config) |
| Unit / component | Vitest + Testing Library (jsdom) | `src/**/*.test.ts(x)` | Pure logic (time, durations, search, route codes, live helpers), hooks, small components, translation completeness |
| End-to-end | Playwright | `e2e/*.spec.ts` | User journeys on the production build, desktop and phone sizes |
| Accessibility | axe-core in Playwright | `e2e/site.spec.ts` | WCAG 2.1 A/AA rules axe can check, on every public page |
| Dependencies | `npm audit` | CI | Known vulnerabilities in production dependencies (high and above) |

The backend (database functions, trip planner, live buses, geocoder) has its own unit, smoke and security
suites in the database repository. Website tests never call the real backend.

## Running

```bash
npm test                 # unit and component tests
npm run test:watch       # same, re-running on save
npm run test:coverage    # with coverage report in reports/coverage
npm run test:e2e         # end-to-end (builds the site first)
npm run test:all         # lint, types, coverage, end-to-end: what CI runs
```

End-to-end tests build the site into `dist-e2e/` with a fake backend address and serve it on port 4173.
Locally they use Microsoft Edge (installed with Windows), so no browser download is needed; CI installs
Playwright's Chromium. Results, traces and screenshots of failures go to `test-results/` and `reports/`
(both git-ignored).

## How end-to-end tests mock the backend

`e2e/mocks.ts` answers every request to the fake backend host:

- stop search, route list and trip planning answers are recorded real responses in `e2e/fixtures/`
  (public timetable data only);
- live bus positions are made up (`TEST001`, `TEST002`), never real vehicles;
- map tiles are a blank image, so tests never load the public tile server.

Each test fails if the page makes a backend request the mocks don't handle, or throws an uncaught error.
Tests can change an answer per case, e.g. `backend.planTrip = () => ({ status: 500, json: { error: 'x' } })`.

## Accessibility baseline

`e2e/a11y-baseline.json` lists the serious or critical axe violations that existed when the suite was added.
They are reported on the test but don't fail it; any **new** violation fails. When one is fixed, remove it
from the file. Never add an entry without a planned fix.

## Coverage

Thresholds are set per file in `vitest.config.ts` for the modules that have tests (90-100% of lines).
Overall coverage is low because most page components are tested end-to-end instead. Raise the
thresholds as tests are added; never lower one to make a build pass.

## Writing tests

- Name tests by behaviour: "a bus route code finds the route, however it is typed".
- Select elements the way users find them: role and accessible name (`getByRole('combobox', { name: 'Start' })`),
  then visible text. Avoid CSS selectors except for map markers.
- Expected values come from fixtures or operator data, not from the code under test.
- No real personal data in fixtures. No secrets in tests: the anon key used in tests is a placeholder.
- A test that needs a sleep is a bug: wait for something visible instead.
- A bug fix comes with a test that fails before the fix.

## CI

`.github/workflows/ci.yml` runs on every push to `main` and every pull request:

1. `quality`: install, dependency audit, lint, types, unit tests with coverage, production build;
2. `e2e`: end-to-end and accessibility tests in Chromium, desktop and phone.

Reports (JUnit XML, coverage, Playwright HTML, failure traces) are uploaded as build artifacts for 14 days.
A pull request must be green to merge.
