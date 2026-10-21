import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { openGallery } from './fixtures';

const shell = (page: Page) => page.locator('.demo-sidebar-frame').first();
const toggle = (page: Page) => shell(page).getByRole('button', { name: 'Навігація', exact: true });

test('docked rail collapses, keeps link names and shows visual-only tooltips', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openGallery(page, 'sidebar');
  const button = toggle(page);
  const layout = shell(page).locator('vd-sidebar-layout');
  await expect(layout).toHaveAttribute('data-mode', 'docked');
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  const sidebarId = await button.getAttribute('aria-controls');
  await expect(page.locator(`#${sidebarId}`)).toBeVisible();

  const before = await page.locator(`#${sidebarId}`).boundingBox();
  await button.press('Enter');
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(layout).toHaveAttribute('data-collapsed', '');
  await expect(page.getByTestId('sidebar-state')).toHaveText('collapsed');
  const after = await page.locator(`#${sidebarId}`).boundingBox();
  expect(after!.width).toBeLessThan(before!.width / 2);
  await expect(button).toBeFocused();

  // Names stay in the accessibility tree; consumer content marked rail-hidden disappears.
  const projects = shell(page).getByRole('link', { name: /^Проєкти/ });
  await expect(projects).toBeVisible();
  await expect(shell(page).getByText('План Team · 72% квоти')).toBeHidden();
  const geometry = await page
    .locator(`#${sidebarId}`)
    .evaluate((el) => ({ client: el.clientWidth, scroll: el.scrollWidth }));
  expect(geometry.scroll).toBeLessThanOrEqual(geometry.client);

  await shell(page).getByRole('link', { name: 'Огляд', exact: true }).focus();
  await page.keyboard.press('Tab');
  await expect(projects).toBeFocused();
  const tip = page.locator('.vd-tooltip:popover-open');
  await expect(tip).toHaveText('Проєкти');
  await expect(tip).toHaveAttribute('aria-hidden', 'true');
  await expect(projects).not.toHaveAttribute('aria-describedby');
  await page.keyboard.press('Escape');
  await expect(tip).toHaveCount(0);

  await button.click();
  await expect(layout).not.toHaveAttribute('data-collapsed');
  await projects.focus();
  await expect(page.locator('.vd-tooltip:popover-open')).toHaveCount(0);
});

test('narrow viewport opens the same content as a drawer that closes on navigation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openGallery(page, 'sidebar');
  const button = toggle(page);
  await expect(shell(page).locator('vd-sidebar-layout')).toHaveAttribute('data-mode', 'drawer');
  await expect(button).toHaveAttribute('aria-haspopup', 'dialog');
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('navigation', { name: 'Робочий простір' })).toHaveCount(0);

  await button.click();
  const drawer = page.getByRole('dialog', { name: 'Навігація' });
  await expect(drawer).toBeVisible();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('navigation', { name: 'Робочий простір' })).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(drawer).toBeHidden();
  await expect(button).toBeFocused();

  await button.click();
  await drawer.getByRole('link', { name: /^Учасники/ }).click();
  await expect(page).toHaveURL(/section=people/);
  await expect(drawer).toBeHidden();
  await expect(button).toBeFocused();
  await expect(shell(page).getByRole('heading', { name: 'Учасники' })).toBeVisible();

  // Widening with the drawer open docks the sidebar; focus returns to the toggle.
  await button.click();
  await drawer.getByRole('link', { name: /^Учасники/ }).focus();
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(shell(page).locator('vd-sidebar-layout')).toHaveAttribute('data-mode', 'docked');
  await expect(page.locator('dialog[open]')).toHaveCount(0);
  await expect(button).toBeFocused();
  await expect(shell(page).getByRole('link', { name: /^Учасники/ })).toBeVisible();
});

for (const theme of ['dark', 'light'] as const) {
  for (const dir of ['ltr', 'rtl']) {
    test(`axe, docked and rail (${theme}, ${dir})`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await openGallery(page, 'sidebar', theme, dir);
      await toggle(page).click();
      const rtl = page.locator('.demo-sidebar-frame[dir=rtl] > vd-sidebar-layout > .vd-sidebar');
      const rtlBox = await rtl.boundingBox();
      const frameBox = await page.locator('.demo-sidebar-frame[dir=rtl]').boundingBox();
      // Inline-start is the right edge in RTL.
      expect(rtlBox!.x + rtlBox!.width).toBeGreaterThan(frameBox!.x + frameBox!.width - 2);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(
        results.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
      ).toEqual([]);
    });
  }
}

test('forced colors keep the sidebar boundary and focus outline', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ forcedColors: 'active' });
  await openGallery(page, 'sidebar');
  const sidebar = shell(page).locator('vd-sidebar-layout > .vd-sidebar');
  await expect(sidebar).toHaveCSS('border-inline-end-style', 'solid');
  await toggle(page).focus();
  await expect(toggle(page)).toHaveCSS('outline-style', 'solid');
});
