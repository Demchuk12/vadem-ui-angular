import { expect, test } from '@playwright/test';
import { GALLERY_ROUTES, openGallery } from './fixtures';

const routes = GALLERY_ROUTES;

for (const dir of ['ltr', 'rtl']) {
  for (const enlarged of [false, true]) {
    test(`narrow layouts contain the page (${dir}, ${enlarged ? 'enlarged text' : 'normal text'})`, async ({
      page,
    }) => {
      test.setTimeout(120_000);
      await page.setViewportSize({ width: 320, height: 900 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      for (const route of routes) {
        await openGallery(page, route, 'dark', dir);
        await page.evaluate(() => document.fonts.ready);
        if (enlarged) {
          // Text enlargement stress, not browser zoom.
          await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
        }
        const dimensions = await page.evaluate(() => ({
          content: document.documentElement.scrollWidth,
          viewport: document.documentElement.clientWidth,
        }));
        expect(dimensions.content, route).toBeLessThanOrEqual(dimensions.viewport);
      }
    });
  }
}

test('desktop sidebar reveals the active route without moving the page', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openGallery(page, 'calendar');
  const nav = page.getByRole('navigation', { name: 'Gallery' });
  await expect.poll(() => nav.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  const active = nav.getByRole('link', { name: 'Date picker', exact: true });
  const navBox = await nav.boundingBox();
  const linkBox = await active.boundingBox();
  expect(navBox).not.toBeNull();
  expect(linkBox).not.toBeNull();
  expect(linkBox!.y).toBeGreaterThanOrEqual(navBox!.y);
  expect(linkBox!.y + linkBox!.height).toBeLessThanOrEqual(navBox!.y + navBox!.height);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);

  await active.focus();
  await page.keyboard.press('Shift+Tab');
  await expect(nav.getByRole('link', { name: 'Popover', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/popover$/);
});

for (const dir of ['ltr', 'rtl']) {
  test(`phone navigation reveals and activates the current link (${dir})`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openGallery(page, 'stepper', 'dark', dir);
    const nav = page.getByRole('navigation', { name: 'Gallery' });
    const link = nav.getByRole('link', { name: 'Stepper', exact: true });
    await expect(link).toBeInViewport();
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(link).toBeInViewport();
    await page.setViewportSize({ width: 320, height: 900 });
    await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
    await expect(link).toBeInViewport();
    await link.focus();
    await page.keyboard.press('Tab');
    const next = nav.getByRole('link', { name: 'Command palette', exact: true });
    await expect(next).toBeFocused();
    await expect(next).toBeInViewport();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/command$/);
  });
}

test('button comparison can be scrolled by keyboard inside its region', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openGallery(page, 'button');
  const comparison = page.getByRole('region', { name: 'Розміри кнопок' });
  await comparison.focus();
  await expect(comparison).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => comparison.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
  await page.keyboard.press('Tab');
  await expect(comparison.getByRole('button').first()).toBeFocused();
});

test('plain Ukrainian and RTL tables keep a named keyboard scroll region', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await openGallery(page, 'table');
  await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
  for (const name of ['Тарифи', 'الخطط']) {
    const region = page.getByRole('region', { name, exact: true });
    await region.focus();
    await expect(region).toBeFocused();
    expect(await region.evaluate((el) => el.scrollWidth)).toBeGreaterThan(
      await region.evaluate((el) => el.clientWidth),
    );
  }
});
