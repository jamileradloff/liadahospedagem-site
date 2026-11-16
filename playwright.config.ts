import { defineConfig, devices } from '@playwright/test'

const PORT = 4173
// Set to a deployed site (e.g. a Pages preview) to test it instead of a local build.
const DEPLOYED = process.env.PLAYWRIGHT_BASE_URL

export default defineConfig({  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: DEPLOYED ?? `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
    { name: 'mobile-webkit', use: { ...devices['iPhone 14'] } },
  ],
  ...(!DEPLOYED && {
    webServer: {
      // The production build, not the dev server. An empty key overrides any local .env so tests never send events.
      command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
      env: { VITE_POSTHOG_KEY: '', VITE_PREVIEW: '' },
      url: `http://localhost:${PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  }),
})
