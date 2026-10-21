import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { openGallery } from './fixtures';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('dashboard figures keep currency and number order in RTL', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openGallery(page, 'screens/dashboard', 'dark', 'rtl');
  const value = page.locator('.vd-stat__value bdi').first();
  await expect(value).toHaveText('₴ 48 920');
  await expect(value).toHaveAttribute('dir', 'ltr');
  // The block keeps the page's alignment: the value hugs the right edge in RTL.
  const card = (await page.locator('.dash-kpi').first().boundingBox())!;
  const box = (await value.boundingBox())!;
  expect(card.x + card.width - (box.x + box.width)).toBeLessThan(40);
});

test('loading keeps labels and toggles placeholders', async ({ page }) => {
  await openGallery(page, 'stat');
  const stat = page.locator('vd-stat').filter({ hasText: 'Активні користувачі' });
  await expect(stat.locator('.vd-stat__value')).toHaveText('8 920');
  await page.getByRole('button', { name: 'Показати завантаження' }).click();
  await expect(stat).toHaveAttribute('aria-busy', 'true');
  await expect(stat.locator('dt')).toHaveText('Активні користувачі');
});

for (const theme of ['dark', 'light'] as const) {
  for (const dir of ['ltr', 'rtl']) {
    test(`axe and narrow layout (${theme}, ${dir})`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 900 });
      await openGallery(page, 'stat', theme, dir);
      await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
      const width = await page.evaluate(() => ({
        client: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      expect(width.scroll).toBeLessThanOrEqual(width.client);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(results.violations.map((v) => v.id)).toEqual([]);
    });
  }
}
