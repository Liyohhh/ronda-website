import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

// Unit and component tests (Vitest + Testing Library). End-to-end tests are in e2e/ (Playwright).
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.{ts,tsx}'],
      setupFiles: ['src/test/setup.ts'],
      // the Supabase client is created at import time; tests never reach it (calls are mocked)
      env: { VITE_SUPABASE_URL: 'http://localhost:54321', VITE_SUPABASE_ANON_KEY: 'test-anon-key' },
      restoreMocks: true,
      reporters: process.env.CI ? ['default', 'junit'] : ['default'],
      outputFile: { junit: 'reports/junit-unit.xml' },
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/main.tsx', 'src/**/*.d.ts'],
        reporter: ['text-summary', 'html', 'lcov'],
        reportsDirectory: 'reports/coverage',
        // floor for the logic modules that have tests; raise as coverage grows (see docs/TESTING.md)
        thresholds: {
          'src/data/time.ts': { lines: 100 },
          'src/i18n/duration.ts': { lines: 100 },
          'src/data/stopIcon.ts': { lines: 100 },
          'src/hooks/usePoll.ts': { lines: 90 },
          'src/data/lines.ts': { lines: 90 },
        },
      },
    },
  }),
)
