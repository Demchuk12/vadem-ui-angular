import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { openGallery } from './fixtures';

test('controlled reference updates passive time and pipe without timers or focus changes', async ({
  page,
}) => {
  await page.clock.install({ time: new Date('2030-01-01T00:00:00Z') });
  await openGallery(page, 'relative-time');
  const time = page.getByTestId('main-relative');
  await expect(time).toHaveText('5 хвилин тому');
  await expect(time).toHaveAttribute('datetime', '2026-10-18T11:55:00.000Z');
  expect(await time.evaluate((el) => el.tagName)).toBe('TIME');
  await expect(time).not.toHaveAttribute('tabindex');
  await expect(time).not.toHaveAttribute('aria-live');
  await expect(page.getByTestId('recent')).toHaveText('Щойно');
  await expect(page.getByTestId('future')).toHaveText('через 2 години');
  await page.clock.fastForward(3600000);
  await expect(time).toHaveText('5 хвилин тому');
  const advance = page.getByRole('button', { name: 'Додати хвилину', exact: true });
  await advance.focus();
  await advance.press('Enter');
  await expect(time).toHaveText('6 хвилин тому');
  await expect(time).toHaveAttribute('datetime', '2026-10-18T11:55:00.000Z');
  await expect(advance).toBeFocused();
  await expect(page.getByTestId('recent')).toHaveText('1 хвилину тому');
  await expect(page.getByTestId('reference')).toHaveAttribute(
    'datetime',
    '2026-10-18T12:01:00.000Z',
  );
  await expect(page.getByTestId('pipe')).toHaveText('1 годину тому');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Відновити відлік', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(time).toHaveText('5 хвилин тому');
  for (const id of ['unknown', 'invalid']) {
    await expect(page.getByTestId(id)).toHaveText('Час невідомий');
    await expect(page.getByTestId(id)).not.toHaveAttribute('datetime');
    await expect(page.getByTestId(id)).toHaveAttribute('data-state', 'unknown');
  }
});

for (const theme of ['dark', 'light'] as const) {
  for (const dir of ['ltr', 'rtl']) {
    test(`native time, long content and axe at 320px/200% (${theme}, ${dir})`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 1100 });
      await openGallery(page, 'relative-time', theme, dir);
      await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
      const rtl = page.getByTestId('rtl-time');
      await expect(rtl.locator('bdi')).toHaveCount(1);
      await expect(rtl).toHaveAttribute('datetime', '2026-10-18T11:55:00.000Z');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
            .analyze()
        ).violations,
      ).toEqual([]);
      await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
      await expect(page.getByTestId('main-relative')).toBeVisible();
      const button = page.getByRole('button', { name: 'Додати хвилину', exact: true });
      await button.focus();
      await button.press('Enter');
      await expect(button).toBeFocused();
      await expect(page.getByTestId('main-relative')).toHaveText('6 хвилин тому');
      expect(await button.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid');
    });
  }
}
