import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { openGallery } from './fixtures';

for (const theme of ['dark', 'light'] as const) {
  for (const dir of ['ltr', 'rtl']) {
    test(`native groups, responsive geometry and axe (${theme}, ${dir})`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.setViewportSize({ width: 1440, height: 900 });
      await openGallery(page, 'description-list', theme, dir);
      const list = page.getByTestId('equipment');
      await expect(list).toHaveAttribute('data-layout', 'horizontal');
      await expect(list.locator('dd').nth(5)).toHaveText('0');
      const first = list.locator(':scope > div').first();
      const term = await first.locator('dt').boundingBox();
      const value = await first.locator('dd').boundingBox();
      expect(Math.abs(term!.y - value!.y)).toBeLessThan(2);
      expect(dir === 'ltr' ? value!.x > term!.x : value!.x < term!.x).toBe(true);
      const group = page.getByTestId('groups').locator(':scope > div').first();
      const boxes = await group.locator('dt, dd').evaluateAll((elements) =>
        elements.map((el) => {
          const r = el.getBoundingClientRect();
          return { x: r.x, y: r.y };
        }),
      );
      expect(boxes[0].y).toBe(boxes[2].y);
      expect(boxes[1].y).toBe(boxes[3].y);
      const copy = list.getByRole('button', { name: 'Копіювати ідентифікатор' });
      await copy.focus();
      await expect(copy).toHaveCSS('outline-style', 'solid');
      await page.keyboard.press('Tab');
      await expect(list.getByRole('link', { name: 'Олена Ковальчук' })).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(page.getByTestId('profile').getByRole('link').first()).toBeFocused();
      await page.setViewportSize({ width: 320, height: 900 });
      await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
      const narrowTerm = await first.locator('dt').boundingBox();
      const narrowValue = await first.locator('dd').boundingBox();
      expect(narrowValue!.y).toBeGreaterThanOrEqual(narrowTerm!.y + narrowTerm!.height);
      const width = await page.evaluate(() => ({
        client: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      expect(width.scroll).toBeLessThanOrEqual(width.client);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(
        results.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
      ).toEqual([]);
    });
  }
}

test('forced colors keeps native text, separators and nested focus visible', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await openGallery(page, 'description-list');
  const list = page.getByTestId('equipment');
  await expect(list.locator(':scope > div').nth(1)).toHaveCSS('border-block-start-style', 'solid');
  const link = list.getByRole('link');
  await link.focus();
  await expect(link).toHaveCSS('outline-style', 'solid');
  await expect(list.locator('dd').nth(1)).toHaveText('Працює');
  await expect(list).toHaveCSS('animation-name', 'none');
});
