import { defineConfig, devices } from '@playwright/test'

// End-to-end tests against the production build. The backend is mocked (e2e/mocks.ts): the build points at
// a fake Supabase host, so a call the tests didn't expect fails instead of reaching the real database.
const PORT = 4173
const CI = !!process.env.CI

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 2 : 0,
  workers: CI ? 2 : undefined,
  reporter: CI ? [['list'], ['junit', { outputFile: 'reports/junit-e2e.xml' }], ['html', { outputFolder: 'reports/e2e-html', open: 'never' }]] : [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // CI installs Playwright's Chromium; locally use the Edge that ships with Windows (no browser download)
    ...(CI ? {} : { channel: 'msedge' }),
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], ...(CI ? {} : { channel: 'msedge' }) } },
    { name: 'mobile', use: { ...devices['Pixel 7'], ...(CI ? {} : { channel: 'msedge' }) } },
  ],
  webServer: {
    command: `npx vite build --outDir dist-e2e --emptyOutDir && npx vite preview --outDir dist-e2e --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !CI,
    timeout: 180_000,
    env: { VITE_SUPABASE_URL: 'https://e2e.supabase.test', VITE_SUPABASE_ANON_KEY: 'e2e-anon-key' },
  },
})
