import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { GALLERY_ROUTES, openGallery } from './fixtures';

for (const theme of ['dark', 'light'] as const) {
  for (const route of GALLERY_ROUTES) {
    test(`axe: ${route} (${theme})`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await openGallery(page, route, theme);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        // Token swatches and specimens intentionally show low-contrast pairs.
        .exclude('.demo-ramp')
        .exclude('.demo-text-samples')
        // Inactive controls are exempt from contrast (WCAG 1.4.3); axe only knows native disabled.
        .exclude('[aria-disabled="true"]')
        .analyze();
      expect(
        results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`),
      ).toEqual([]);
    });
  }
}
