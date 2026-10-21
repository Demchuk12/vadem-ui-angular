import { expect, test } from '@playwright/test';
import { openGallery } from './fixtures';

for (const dir of ['ltr', 'rtl']) {
  for (const theme of ['dark', 'light'] as const) {
    test(`numbered pages stay reachable at 320px and enlarged text (${dir}, ${theme})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 320, height: 900 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await openGallery(page, 'pagination', theme, dir);
      for (const enlarged of [false, true]) {
        await page.evaluate(
          (value) => (document.documentElement.style.fontSize = value ? '200%' : ''),
          enlarged,
        );
        const dimensions = await page.evaluate(() => ({
          content: document.documentElement.scrollWidth,
          viewport: document.documentElement.clientWidth,
        }));
        expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
        const nav = page.getByRole('navigation', {
          name: 'Приклад: дві сусідні сторінки',
          exact: true,
        });
        const buttons = nav.getByRole('button');
        await buttons.first().focus();
        for (let i = 0; i < (await buttons.count()); i++) {
          const button = buttons.nth(i);
          await expect(button).toBeFocused();
          await expect
            .poll(() =>
              button.evaluate((el) => {
                const parent = el.closest('.vd-pagination')!;
                const a = el.getBoundingClientRect(),
                  b = parent.getBoundingClientRect();
                return a.left >= b.left && a.right <= b.right;
              }),
            )
            .toBe(true);
          const bounds = await button.evaluate((el) => {
            const parent = el.closest('.vd-pagination')!;
            const a = el.getBoundingClientRect(),
              b = parent.getBoundingClientRect();
            return {
              start: a.left - b.left,
              end: b.right - a.right,
              scroll: el.scrollWidth,
              width: el.clientWidth,
            };
          });
          expect(bounds.start).toBeGreaterThanOrEqual(0);
          expect(bounds.end).toBeGreaterThanOrEqual(0);
          expect(bounds.scroll).toBeLessThanOrEqual(bounds.width);
          if (i < (await buttons.count()) - 1) await page.keyboard.press('Tab');
        }
        await buttons.last().press('Enter');
        await expect(buttons.last()).toBeFocused();
        await expect(
          nav.getByRole('button', { name: 'Сторінка ' + (enlarged ? 8 : 7), exact: true }),
        ).toHaveAttribute('aria-current', 'page');
      }
    });
  }
}
