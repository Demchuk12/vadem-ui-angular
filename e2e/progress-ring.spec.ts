import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { openGallery } from './fixtures';

test('spinner spins normally and stops into a dashed ring under reduced motion', async ({
  page,
}) => {
  await openGallery(page, 'progress');
  const spinner = page.locator('vd-progress-ring[data-indeterminate]').first();
  await expect(spinner.locator('svg')).toHaveCSS('animation-name', 'vd-progress-ring-spin');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(spinner.locator('svg')).toHaveCSS('animation-name', 'none');
  await expect(spinner.locator('.vd-progress-ring__indicator')).toHaveCSS(
    'stroke-dasharray',
    '4px, 4px',
  );
  // The button spinner follows the same rule.
  await openGallery(page, 'button');
  const loader = page.locator('.vd-button__spinner .vd-icon__svg').first();
  await expect(loader).toBeAttached();
  await expect(loader).toHaveCSS('animation-name', 'none');
});

test('determinate ring exposes its value and mirrors in RTL', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openGallery(page, 'progress');
  const ring = page.getByRole('progressbar', { name: 'التحميل' });
  await expect(ring).toHaveAttribute('aria-valuenow', '40');
  await expect(ring.locator('svg')).toHaveCSS('scale', '1 -1');
  const ltr = page.getByRole('progressbar', { name: 'Готово' });
  await expect(ltr.locator('svg')).not.toHaveCSS('scale', '1 -1');
});

for (const theme of ['dark', 'light'] as const) {
  test(`axe (${theme})`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openGallery(page, 'progress', theme);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
}
