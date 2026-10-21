import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { openGallery } from './fixtures';

for (const theme of ['dark', 'light'] as const) {
  test(`loading table preserves columns, replaces hidden rows and announces completion (${theme})`, async ({
    page,
  }) => {
    await openGallery(page, 'skeleton', theme);
    const table = page.getByTestId('projects-table');
    await expect(table).toHaveAttribute('aria-busy', 'true');
    await expect(table.locator('tbody')).toHaveAttribute('aria-hidden', 'true');
    await expect(table.getByRole('columnheader')).toHaveCount(4);
    await expect(table.getByRole('cell')).toHaveCount(0);
    const geometry = await table
      .locator('thead th')
      .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().width));
    const bodyHeight = await table
      .locator('tbody')
      .evaluate((el) => el.getBoundingClientRect().height);
    const toggle = page.getByRole('button', { name: 'Показати дані', exact: true });
    await toggle.focus();
    await toggle.press('Enter');
    await expect(table).toHaveAttribute('aria-busy', 'false');
    await expect(table.getByRole('cell')).toHaveCount(16);
    await expect(table.locator('.vd-skeleton')).toHaveCount(0);
    await expect(page.getByTestId('table-status')).toContainText('4 проєкти');
    expect(
      await table
        .locator('thead th')
        .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().width)),
    ).toEqual(geometry);
    expect(
      Math.abs(
        (await table.locator('tbody').evaluate((el) => el.getBoundingClientRect().height)) -
          bodyHeight,
      ),
    ).toBeLessThanOrEqual(1);
    await expect(page.getByRole('button', { name: 'Показати завантаження' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(table).toHaveAttribute('aria-busy', 'true');
    await expect(table.locator('.vd-skeleton')).toHaveCount(24);
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(result.violations).toEqual([]);
  });
}

test('animation stops for reduced motion and forced colors; explicit static stays static', async ({
  page,
}) => {
  await openGallery(page, 'skeleton');
  const animated = page.locator('.vd-skeleton[data-animated]').first();
  const staticShape = page.locator('.vd-skeleton:not([data-animated])').first();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  expect(await animated.evaluate((el) => getComputedStyle(el, '::after').animationName)).toBe(
    'vd-skeleton-shimmer',
  );
  expect(await staticShape.evaluate((el) => getComputedStyle(el, '::after').animationName)).toBe(
    'none',
  );
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await animated.evaluate((el) => getComputedStyle(el, '::after').animationName)).toBe(
    'none',
  );
  await expect(animated).toHaveCSS('opacity', '1');
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'no-preference' });
  expect(await animated.evaluate((el) => getComputedStyle(el, '::after').animationName)).toBe(
    'none',
  );
  await expect(animated).toHaveCSS('border-top-style', 'solid');
  expect(
    await animated.evaluate(
      (el) => getComputedStyle(el).borderTopColor !== getComputedStyle(el).backgroundColor,
    ),
  ).toBe(true);
});

for (const dir of ['ltr', 'rtl']) {
  test(`320px and enlarged text retain native keyboard table scrolling (${dir})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await openGallery(page, 'skeleton', 'light', dir);
    await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
    const scroll = page.getByRole('region', {
      name: 'Список проєктів — горизонтальне прокручування',
      exact: true,
    });
    await scroll.focus();
    await expect(scroll).toHaveCSS('outline-style', 'solid');
    const before = await scroll.evaluate((el) => el.scrollLeft);
    await page.keyboard.press(dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight');
    await expect.poll(() => scroll.evaluate((el) => el.scrollLeft)).not.toBe(before);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    for (const circle of await page.locator('[data-shape="circle"]').all()) {
      const box = await circle.boundingBox();
      expect(Math.abs(box!.width - box!.height)).toBeLessThanOrEqual(1);
    }
  });
}

test('existing CSS-sized Card skeletons retain natural and explicit geometry', async ({ page }) => {
  await openGallery(page, 'card');
  const skeletons = page.locator('[aria-busy=true] .vd-skeleton');
  await expect(skeletons).toHaveCount(5);
  expect(await skeletons.first().getAttribute('data-shape')).toBeNull();
  const geometry = await skeletons.evaluateAll((els) =>
    els.map((el) => {
      const cs = getComputedStyle(el);
      return {
        height: el.getBoundingClientRect().height,
        lineHeight: parseFloat(cs.lineHeight),
        space5:
          parseFloat(cs.getPropertyValue('--vd-space-5')) *
          parseFloat(getComputedStyle(document.documentElement).fontSize),
        space10:
          parseFloat(cs.getPropertyValue('--vd-space-10')) *
          parseFloat(getComputedStyle(document.documentElement).fontSize),
      };
    }),
  );
  expect(geometry[0].height).toBe(Math.max(geometry[0].space5, geometry[0].lineHeight));
  expect(geometry[2].height).toBe(Math.max(geometry[2].space10, geometry[2].lineHeight));
  expect(geometry[3].height).toBe(geometry[3].lineHeight);
});
