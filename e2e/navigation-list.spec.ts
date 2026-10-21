import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { openGallery } from './fixtures';

const workspace = (page: import('@playwright/test').Page) =>
  page.getByRole('navigation', { name: 'Робочий простір', exact: true });

test('router current state follows links and browser history without moving link focus', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openGallery(page, 'navigation-list');
  const nav = workspace(page);
  const overview = nav.getByRole('link', { name: 'Огляд', exact: true });
  const projects = nav.getByRole('link', { name: /^Проєкти/ });
  const archive = nav.getByRole('link', { name: /^Архів/ });
  await expect(overview).toHaveAttribute('aria-current', 'page');
  await expect(nav.locator('[aria-current=page]')).toHaveCount(1);
  await projects.focus();
  await projects.press('Enter');
  await expect(page).toHaveURL(/section=projects/);
  await expect(projects).toHaveAttribute('aria-current', 'page');
  await expect(overview).not.toHaveAttribute('aria-current');
  await expect(projects).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Проєкти команди', exact: true })).toBeVisible();
  await archive.click();
  await expect(archive).toContainText('0');
  await expect(archive).toHaveAttribute('aria-current', 'page');
  await page.goBack();
  await expect(projects).toHaveAttribute('aria-current', 'page');
  await page.goBack();
  await expect(overview).toHaveAttribute('aria-current', 'page');
  await expect(nav.locator('[aria-current=page]')).toHaveCount(1);
});

test('native Tab order, modifier click and explicit new tabs remain available', async ({
  page,
  context,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openGallery(page, 'navigation-list');
  const nav = workspace(page);
  const links = nav.getByRole('link');
  await links.nth(0).focus();
  await page.keyboard.press('Tab');
  await expect(links.nth(1)).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(links.nth(1)).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(links.nth(0)).toBeFocused();
  const original = page.url();
  const newTab = context.waitForEvent('page');
  await links.nth(1).click({ modifiers: ['Control'] });
  const opened = await newTab;
  await opened.waitForURL(/section=projects/);
  await expect(page).toHaveURL(original);
  await opened.close();
  const helpTab = context.waitForEvent('page');
  await nav.getByRole('link', { name: /Довідка/ }).click();
  const help = await helpTab;
  await help.waitForURL(/section=help/);
  await help.close();
  await expect(
    nav.locator('[tabindex], [role="menu"], [role="menuitem"], [aria-selected]'),
  ).toHaveCount(0);
});

for (const theme of ['dark', 'light'] as const) {
  for (const dir of ['ltr', 'rtl']) {
    test(`long labels, metadata, focus and axe at 320px/200% (${theme}, ${dir})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 320, height: 900 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await openGallery(page, 'navigation-list', theme, dir);
      await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
      const links = page.locator('a.vd-navigation-link');
      for (const link of await links.all()) {
        const geometry = await link.evaluate((el) => ({
          width: el.clientWidth,
          scroll: el.scrollWidth,
        }));
        expect(geometry.scroll).toBeLessThanOrEqual(geometry.width);
      }
      const projects = workspace(page).getByRole('link', { name: /^Проєкти/ });
      await projects.focus();
      await expect(projects).toHaveCSS('outline-style', 'solid');
      const label = await projects.locator(':scope > span:not([slot])').boundingBox();
      const count = await projects.locator('[slot=end]').boundingBox();
      const row = await projects.boundingBox();
      expect(label!.width).toBeGreaterThan(row!.width / 2);
      expect(count!.y).toBeGreaterThanOrEqual(label!.y + label!.height);
      const arabic = page.getByRole('navigation', { name: 'مساحة عمل الفريق' });
      await expect(arabic).toHaveCSS('direction', 'rtl');
      await expect(arabic.getByRole('link').first()).toHaveAttribute('aria-current', 'page');
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

test('forced colors distinguishes current state and focus; reduced motion removes transitions', async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await openGallery(page, 'navigation-list');
  const nav = workspace(page);
  const current = nav.getByRole('link', { name: 'Огляд', exact: true });
  const other = nav.getByRole('link', { name: /^Проєкти/ });
  await current.focus();
  await expect(current).toHaveCSS('outline-style', 'solid');
  await expect(current).toHaveCSS('border-inline-start-style', 'solid');
  await expect(current).toHaveCSS('font-weight', '600');
  const currentColor = await current.evaluate((el) => getComputedStyle(el).borderInlineStartColor);
  const otherColor = await other.evaluate((el) => getComputedStyle(el).borderInlineStartColor);
  expect(currentColor).not.toBe(otherColor);
  const durations = await current.evaluate((el) =>
    getComputedStyle(el).transitionDuration.split(','),
  );
  expect(durations.every((value) => Number.parseFloat(value) === 0)).toBe(true);
});
