import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { openGallery } from './fixtures';

test('keyboard stepping, bounds and permanent tab order', async ({ page }) => {
  await openGallery(page, 'range-slider');
  const group = page.getByTestId('price-range');
  const thumbs = group.getByRole('slider');
  await thumbs.nth(0).focus();
  await page.keyboard.press('ArrowRight');
  await expect(thumbs.nth(0)).toHaveAttribute('aria-valuenow', '2100');
  await page.keyboard.press('PageUp');
  await expect(thumbs.nth(0)).toHaveAttribute('aria-valuenow', '3100');
  await page.keyboard.press('End');
  await expect(thumbs.nth(0)).toHaveAttribute('aria-valuenow', '7000');
  await expect(thumbs.nth(1)).toHaveAttribute('aria-valuemin', '7000');
  await page.keyboard.press('ArrowRight');
  await expect(thumbs.nth(0)).toHaveAttribute('aria-valuenow', '7000');
  await page.keyboard.press('Tab');
  await expect(thumbs.nth(1)).toBeFocused();
  await page.keyboard.press('End');
  await expect(thumbs.nth(1)).toHaveAttribute('aria-valuenow', '10000');
  await expect(page.getByTestId('budget-value')).toHaveText('7000–10000');
});

test('track click, outside drag, capture and equal thumb keyboard editing', async ({ page }) => {
  await openGallery(page, 'range-slider');
  const rail = page.getByTestId('price-range').locator('.vd-range-slider__rail');
  const bounds = (await rail.boundingBox())!;
  await page.mouse.click(bounds.x + bounds.width * 0.1, bounds.y + bounds.height / 2);
  await expect(page.getByTestId('budget-value')).toHaveText('1000–7000');
  const thumb = page.getByTestId('price-range').getByRole('slider').nth(1);
  const box = (await thumb.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expect(page.getByTestId('price-range')).toHaveAttribute('data-dragging', '');
  await page.mouse.move(bounds.x + bounds.width + 80, bounds.y + bounds.height / 2);
  await page.mouse.up();
  await expect(thumb).toHaveAttribute('aria-valuenow', '10000');
  await expect(page.getByTestId('price-range')).not.toHaveAttribute('data-dragging');
  const equal = page.getByTestId('equal-range').getByRole('slider');
  await equal.nth(0).focus();
  await page.keyboard.press('ArrowLeft');
  await expect(equal.nth(0)).toHaveAttribute('aria-valuenow', '49');
  await page.keyboard.press('Tab');
  await expect(equal.nth(1)).toBeFocused();
});

test('null form reset, touched errors, disabled and readonly', async ({ page }) => {
  await openGallery(page, 'range-slider');
  const thumbs = page.getByTestId('price-range').getByRole('slider');
  await page.getByRole('button', { name: 'Скинути бюджет' }).click();
  await expect(page.getByTestId('budget-value')).toHaveText('Бюджет не задано');
  await page.getByRole('button', { name: 'Перевірити бюджет' }).click();
  await expect(thumbs.nth(0)).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByText('Вкажіть бюджет')).toBeVisible();
  await page.getByRole('button', { name: 'Перемкнути доступність' }).click();
  await expect(thumbs.nth(0)).toBeDisabled();
  const read = page.getByRole('slider', { name: 'Погоджений діапазон Від' });
  await read.focus();
  await page.keyboard.press('End');
  await expect(read).toHaveAttribute('aria-valuenow', '20');
});

test('decimals, Signal Forms, RTL and modified keys', async ({ page }) => {
  await openGallery(page, 'range-slider');
  const decimal = page.getByTestId('decimal-range').getByRole('slider').nth(0);
  await decimal.focus();
  await page.keyboard.press('ArrowRight');
  await expect(decimal).toHaveAttribute('aria-valuenow', '0.6');
  const signal = page.getByTestId('signal-range').getByRole('slider').nth(0);
  await signal.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('signal-value')).toHaveText('11–30');
  await page.keyboard.press('Control+End');
  await expect(signal).toHaveAttribute('aria-valuenow', '11');
  const rtl = page.getByTestId('rtl-range').getByRole('slider').nth(0);
  await rtl.focus();
  await page.keyboard.press('ArrowRight');
  await expect(rtl).toHaveAttribute('aria-valuenow', '19');
  await page.keyboard.press('ArrowLeft');
  await expect(rtl).toHaveAttribute('aria-valuenow', '20');
});

for (const theme of ['dark', 'light'] as const) {
  test(`axe, narrow text and system colors (${theme})`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await openGallery(page, 'range-slider', theme, 'rtl');
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%';
    });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const violations = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(violations.violations).toEqual([]);
    const rail = page.getByTestId('price-range');
    const thumbs = rail.getByRole('slider');
    for (const thumb of await thumbs.all()) {
      const bounds = (await thumb.boundingBox())!;
      expect(bounds.x).toBeGreaterThanOrEqual(0);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(320);
    }
    await page.emulateMedia({ forcedColors: 'active' });
    await thumbs.nth(0).focus();
    await page.keyboard.press('ArrowUp');
    await expect(thumbs.nth(0)).toHaveAttribute('aria-valuenow', '2100');
  });
}

test('touch drag and pointer cancellation end capture', async ({ page, context }) => {
  await page.setViewportSize({ width: 600, height: 900 });
  await openGallery(page, 'range-slider');
  const group = page.getByTestId('price-range');
  await group.scrollIntoViewIfNeeded();
  const thumb = group.getByRole('slider').nth(0);
  const box = (await thumb.boundingBox())!;
  const rail = (await group.locator('.vd-range-slider__rail').boundingBox())!;
  const session = await context.newCDPSession(page);
  const x = box.x + box.width / 2,
    y = box.y + box.height / 2;
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x: rail.x + rail.width * 0.4, y }],
  });
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(thumb).toHaveAttribute('aria-valuenow', '4000');
  await expect(group).not.toHaveAttribute('data-dragging');
  const updated = (await thumb.boundingBox())!;
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: updated.x + updated.width / 2, y }],
  });
  await expect(group).toHaveAttribute('data-dragging', '');
  await session.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  await expect(group).not.toHaveAttribute('data-dragging');
});
