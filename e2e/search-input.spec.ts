import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { openGallery } from './fixtures';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('filters, clears with the button and with Escape, keeping focus in the field', async ({
  page,
}) => {
  await openGallery(page, 'search-input');
  const form = page.getByRole('search');
  const box = form.getByRole('searchbox', { name: 'Місто' });
  await page.locator('body').press('/');
  await expect(box).toBeFocused();
  await box.pressSequentially('ів');
  await expect(form.locator('vd-progress-ring')).toBeVisible();
  await expect(page.getByTestId('search-status')).toHaveText('Знайдено: 6');
  await expect(form.locator('vd-progress-ring')).toHaveCount(0);

  await box.press('Escape');
  await expect(box).toHaveValue('');
  await expect(box).toBeFocused();
  await expect(page.getByTestId('search-status')).toHaveText('Усього міст: 22');

  await box.fill('Київ');
  const clear = form.getByRole('button', { name: 'Clear search' });
  await clear.click();
  await expect(box).toHaveValue('');
  await expect(box).toBeFocused();
  await expect(clear).toHaveCount(0);
  await expect(form.locator('vd-kbd')).toBeVisible();
});

test('read-only and disabled fields offer no clear action', async ({ page }) => {
  await openGallery(page, 'search-input');
  for (const name of ['Read-only', 'Disabled']) {
    const field = page.locator('vd-field').filter({ hasText: name });
    await expect(field.getByRole('searchbox')).not.toHaveValue('');
    await expect(field.getByRole('button')).toHaveCount(0);
  }
});

for (const theme of ['dark', 'light'] as const) {
  for (const dir of ['ltr', 'rtl']) {
    test(`axe and narrow layout (${theme}, ${dir})`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 900 });
      await openGallery(page, 'search-input', theme, dir);
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
