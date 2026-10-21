import { expect, test } from '@playwright/test';
import { openGallery, type Theme } from '../fixtures';

/** Token pages catch palette/type/spacing drift; the rest cover common components and screens. */
const PAGES = [
  'colors',
  'typography',
  'space',
  'elevation',
  'button',
  'input',
  'select',
  'card',
  'table',
  'sidebar',
  'screens/dashboard',
  'screens/settings',
  'screens/login',
];

for (const theme of ['dark', 'light'] as Theme[]) {
  for (const route of PAGES) {
    test(`${route} (${theme})`, async ({ page }) => {
      await page.clock.setFixedTime(new Date('2026-10-02T09:00:00Z'));
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await openGallery(page, route, theme);
      await page.evaluate(() => document.fonts.ready);
      await expect(page).toHaveScreenshot(`${route.replace('/', '-')}-${theme}.png`, {
        fullPage: true,
      });
    });
  }
}
