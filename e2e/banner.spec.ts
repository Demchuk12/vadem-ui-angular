import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { openGallery } from './fixtures';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('dismissing a focused banner hands focus to the next control', async ({ page }) => {
  await openGallery(page, 'alert');
  const banner = page.getByTestId('banner-maintenance');
  const close = banner.getByRole('button', { name: 'Dismiss' });
  await close.focus();
  await page.keyboard.press('Enter');
  await expect(banner).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Зрозуміло' })).toBeFocused();
  // Pointer dismissal does not steal focus that was elsewhere.
  await page.getByRole('button', { name: 'Показати банери знову' }).click();
  await page.getByTestId('banner-next').focus();
  await page.getByTestId('banner-maintenance').getByRole('button', { name: 'Dismiss' }).click();
  await expect(page.getByTestId('banner-maintenance')).toHaveCount(0);
});

test('banner spans the region edge to edge with a single bottom rule', async ({ page }) => {
  await openGallery(page, 'alert');
  const banner = page.getByTestId('banner-maintenance');
  await expect(banner).toHaveAttribute('data-layout', 'banner');
  await expect(banner).toHaveCSS('border-top-width', '0px');
  await expect(banner).toHaveCSS('border-bottom-width', '1px');
  await expect(banner).toHaveCSS('border-radius', '0px');
  const frame = (await page.locator('.demo-banner-frame').boundingBox())!;
  const box = (await banner.boundingBox())!;
  expect(Math.abs(box.width - (frame.width - 2))).toBeLessThan(2);
});

for (const dir of ['ltr', 'rtl']) {
  test(`narrow banners keep text readable and actions below (${dir})`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 900 });
    await openGallery(page, 'alert', 'dark', dir);
    const banner = page.getByTestId('banner-maintenance');
    const title = (await banner.locator('.vd-alert__content').boundingBox())!;
    const action = (await banner.getByRole('link', { name: 'Детальніше' }).boundingBox())!;
    expect(title.width).toBeGreaterThan(200);
    expect(action.y).toBeGreaterThanOrEqual(title.y + title.height - 1);
  });
}

for (const theme of ['dark', 'light'] as const) {
  test(`axe with banners (${theme})`, async ({ page }) => {
    await openGallery(page, 'alert', theme);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
}
