import { expect, test } from '@playwright/test';
import { openGallery } from './fixtures';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('titles share a row and tiles line up across columns', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openGallery(page, 'board');
  const board = page.locator('vd-board').first();
  const columns = board.locator('vd-board-column');
  await expect(columns).toHaveCount(6);
  // "Наука й технології" wraps; the first tile of every column still starts at the same height.
  const tops = await columns.evaluateAll((all) =>
    all.map((c) => Math.round(c.querySelector('.vd-board-cell')!.getBoundingClientRect().top)),
  );
  expect(new Set(tops).size).toBe(1);
});

test('picking a tile activates it and finishes the previous one', async ({ page }) => {
  await openGallery(page, 'board');
  const history = page.getByRole('group', { name: 'Історія' });
  const first = history.locator('button').first();
  await first.click();
  await expect(first).toHaveAttribute('aria-current', 'true');
  await history.getByRole('button', { name: '400' }).click();
  await expect(first).toBeDisabled();
  await expect(first).toHaveAccessibleName('Played');
  await expect(first.locator('.vd-board-cell__value')).toBeHidden();
});

test('a narrow board stacks its columns without sideways scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await openGallery(page, 'board');
  const board = page.locator('vd-board').first();
  const fits = await board.evaluate((el) => el.scrollWidth <= el.clientWidth);
  expect(fits).toBe(true);
  const [a, b] = await board
    .locator('vd-board-column')
    .evaluateAll((all) => all.slice(0, 2).map((c) => c.getBoundingClientRect().top));
  expect(b!).toBeGreaterThan(a!);
  const cells = board.locator('vd-board-column').first().locator('.vd-board-cell');
  const tops = await cells.evaluateAll((all) =>
    all.map((c) => Math.round(c.getBoundingClientRect().top)),
  );
  expect(new Set(tops).size).toBe(1);
});
