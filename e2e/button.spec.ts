import { expect, test } from '@playwright/test';
import { openGallery } from './fixtures';

test.describe('button', () => {
  test('keyboard: loading keeps focus and blocks activation', async ({ page }) => {
    await openGallery(page, 'button');
    const save = page.getByRole('button', { name: 'Зберегти зміни' }).first();
    await save.focus();
    await page.keyboard.press('Enter');
    await expect(save).toHaveAttribute('aria-busy', 'true');
    await expect(save).toBeFocused();

    const width = (await save.boundingBox())!.width;
    await page.keyboard.press('Enter'); // ignored while busy
    await expect(page.getByText('Зберігаємо…')).toBeVisible();
    await expect(save).not.toHaveAttribute('aria-busy');
    expect((await save.boundingBox())!.width).toBeCloseTo(width, 0);
    await expect(page.getByText('Зміни збережено')).toBeVisible();
  });

  test('keyboard: disabled link is skipped in tab order', async ({ page }) => {
    await openGallery(page, 'button');
    const link = page.getByRole('link', { name: 'Посилання-кнопка' });
    await link.focus();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Детальніше' })).toBeFocused();
  });

  test('focus ring is visible with keyboard', async ({ page }) => {
    await openGallery(page, 'button');
    const btn = page.locator('.demo-matrix .vd-button').first();
    await btn.focus();
    const outline = await btn.evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).toBe('solid');
  });

  test('forced colors keeps a visible boundary', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' });
    await openGallery(page, 'button');
    const primary = page.locator('.vd-button[data-variant=primary]').first();
    const border = await primary.evaluate((el) => getComputedStyle(el).borderTopStyle);
    expect(border).toBe('solid');
  });
});
