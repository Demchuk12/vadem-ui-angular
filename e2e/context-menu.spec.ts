import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { openGallery } from './fixtures';

const row = (page: Page, i: number) => page.locator('.demo-file__name').nth(i);
const fileMenu = (page: Page, name: RegExp) => page.getByRole('menu', { name });

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openGallery(page, 'menu');
});

test('right-click opens the shared menu at the pointer; Escape returns focus', async ({ page }) => {
  const target = row(page, 1);
  await target.scrollIntoViewIfNeeded();
  const box = (await target.boundingBox())!;
  const x = box.x + 40;
  const y = box.y + box.height / 2;
  await page.mouse.click(x, y, { button: 'right' });
  const menu = fileMenu(page, /Договір/);
  await expect(menu).toBeVisible();
  const menuBox = (await menu.boundingBox())!;
  expect(Math.abs(menuBox.x - x)).toBeLessThan(2);
  expect(menuBox.y - y).toBeGreaterThanOrEqual(0);
  expect(menuBox.y - y).toBeLessThan(8);
  await expect(menu.getByRole('menuitem', { name: 'Відкрити' })).toBeFocused();
  // Disabled items are skipped.
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await expect(menu.getByRole('menuitem', { name: 'Видалити' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(target).toBeFocused();
});

test('Shift+F10 and the ContextMenu key open it from the keyboard; activation runs and closes', async ({
  page,
}) => {
  await row(page, 0).focus();
  await page.keyboard.press('Shift+F10');
  const menu = fileMenu(page, /Кошторис/);
  await expect(menu).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(menu).toBeHidden();
  await expect(row(page, 0)).toBeFocused();
  await expect(page.getByText('Відкрито Кошторис_2026.xlsx')).toBeVisible();

  await row(page, 2).focus();
  await page.keyboard.press('ContextMenu');
  await expect(fileMenu(page, /logo-vadem/)).toBeVisible();
});

test('a touch long-press opens it; a short tap does not', async ({ page }) => {
  const target = row(page, 2);
  await target.scrollIntoViewIfNeeded();
  const box = (await target.boundingBox())!;
  const at = { clientX: box.x + 20, clientY: box.y + 10, pointerType: 'touch', bubbles: true };
  await target.dispatchEvent('pointerdown', at);
  await target.dispatchEvent('pointerup', at);
  await page.waitForTimeout(700);
  await expect(fileMenu(page, /logo/)).toBeHidden();
  await target.dispatchEvent('pointerdown', at);
  await expect(fileMenu(page, /logo/)).toBeVisible();
});

test('stays on screen near the viewport edge and Shift+right-click keeps the native menu', async ({
  page,
}) => {
  await page.setViewportSize({ width: 900, height: 700 });
  const target = row(page, 2);
  await target.scrollIntoViewIfNeeded();
  const box = (await target.boundingBox())!;
  await page.mouse.click(box.x + box.width - 4, box.y + 4, { button: 'right' });
  const menu = fileMenu(page, /logo/);
  await expect(menu).toBeVisible();
  const menuBox = (await menu.boundingBox())!;
  expect(menuBox.x + menuBox.width).toBeLessThanOrEqual(900);
  expect(menuBox.y + menuBox.height).toBeLessThanOrEqual(700);
  await page.keyboard.press('Escape');

  const prevented = await target.evaluate((el) => {
    const event = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      shiftKey: true,
      button: 2,
    });
    return !el.dispatchEvent(event);
  });
  expect(prevented).toBe(false);
});

test('RTL opens toward inline-end of the pointer', async ({ page }) => {
  await openGallery(page, 'menu', 'dark', 'rtl');
  const target = row(page, 1);
  await target.scrollIntoViewIfNeeded();
  const box = (await target.boundingBox())!;
  const x = box.x + box.width - 40;
  await page.mouse.click(x, box.y + 10, { button: 'right' });
  const menu = fileMenu(page, /Договір/);
  await expect(menu).toBeVisible();
  const menuBox = (await menu.boundingBox())!;
  expect(Math.abs(menuBox.x + menuBox.width - x)).toBeLessThan(2);
});

for (const theme of ['dark', 'light'] as const) {
  test(`axe with the context menu open (${theme})`, async ({ page }) => {
    await openGallery(page, 'menu', theme);
    await row(page, 0).focus();
    await page.keyboard.press('Shift+F10');
    await expect(fileMenu(page, /Кошторис/)).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
}
