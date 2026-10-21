import { defineConfig, devices } from '@playwright/test';

/**
 * Visual regression: compares a curated set of gallery pages with committed baselines.
 * Always run through `npm run visual` (official Playwright image) so local and CI rendering match.
 */
export default defineConfig({
  testDir: './e2e/visual',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  reporter: process.env['CI'] ? [['github'], ['html', { open: 'never' }]] : [['list']],
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}{ext}',
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      // Tolerate sub-pixel antialiasing noise; any real token or layout change exceeds this.
      maxDiffPixelRatio: 0.002,
    },
  },
  use: {
    baseURL: process.env['DEMO_URL'] ?? 'http://localhost:4200',
    ...devices['Desktop Chrome'],
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
  },
  webServer: {
    command: 'npm start',
    url: 'http://localhost:4200',
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
