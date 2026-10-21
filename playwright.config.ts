import { defineConfig, devices } from '@playwright/test';

const ci = !!process.env['CI'];

export default defineConfig({
  testDir: './e2e',
  testIgnore: ['visual/**'],
  fullyParallel: true,
  forbidOnly: ci,
  // One retry on CI surfaces flaky tests as "flaky" in the report instead of failing the run.
  retries: ci ? 1 : 0,
  workers: ci ? 2 : undefined,
  reporter: ci ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: process.env['DEMO_URL'] ?? 'http://localhost:4200',
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: 'npm start',
    url: 'http://localhost:4200',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
