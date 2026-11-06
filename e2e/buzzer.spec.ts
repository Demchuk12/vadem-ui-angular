import { expect, test } from '@playwright/test';
import { openGallery } from './fixtures';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openGallery(page, 'buzzer');
});

const live = (page: import('@playwright/test').Page) =>
  page.locator('.demo-buzzer-live button[vdBuzzer], .demo-buzzer-live .vd-buzzer');

test('a mouse press counts once, already on pointer down', async ({ page }) => {
  const buzzer = live(page);
  await buzzer.scrollIntoViewIfNeeded();
  const box = (await buzzer.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expect(page.getByText('Presses counted: 1')).toBeVisible();
  await expect(buzzer).toHaveAttribute('data-state', 'won');
  await page.mouse.up();
  await expect(page.getByText('Presses counted: 1')).toBeVisible();
});

for (const key of ['Enter', 'Space']) {
  test(`${key} presses and focus stays on the button after the state changes`, async ({ page }) => {
    const buzzer = live(page);
    await buzzer.focus();
    await page.keyboard.press(key);
    await expect(page.getByText('Presses counted: 1')).toBeVisible();
    await expect(buzzer).toHaveAttribute('aria-disabled', 'true');
    await expect(buzzer).toBeFocused();
    await page.keyboard.press(key);
    await expect(page.getByText('Presses counted: 1')).toBeVisible();
  });
}

test('never overflows a phone and blocks gestures', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  const buzzer = live(page);
  const box = (await buzzer.boundingBox())!;
  expect(box.x + box.width).toBeLessThanOrEqual(320);
  expect(Math.abs(box.width - box.height)).toBeLessThan(1);
  await expect(buzzer).toHaveCSS('touch-action', 'none');
});
