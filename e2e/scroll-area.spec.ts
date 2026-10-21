import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { openGallery, type Theme } from './fixtures';

async function openScroll(page: Page, theme: Theme = 'dark', dir = 'ltr') {
  await openGallery(page, 'scroll-area', theme, dir);
  await expect(page.getByRole('heading', { name: 'Scroll area', exact: true })).toBeVisible();
  await expect(page.locator('[vdScrollArea]')).toHaveCount(8);
}
const activity = (page: Page) => page.getByTestId('scroll-activity');
const scrollTop = (page: Page) => activity(page).evaluate((el) => el.scrollTop);

test('native keyboard scrolling, Tab exit, focus visibility and descendant action', async ({
  page,
}) => {
  await openScroll(page);
  const area = activity(page);
  await area.focus();
  await area.press('ArrowDown');
  await expect.poll(() => scrollTop(page)).toBeGreaterThan(0);
  expect(await area.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid');
  await area.press('PageDown');
  await expect.poll(() => scrollTop(page)).toBeGreaterThan(100);
  await area.press('End');
  await expect
    .poll(() => area.evaluate((el) => Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop)))
    .toBeLessThanOrEqual(1);
  await area.press('Home');
  await expect.poll(() => scrollTop(page)).toBe(0);
  await area.press('Space');
  await expect.poll(() => scrollTop(page)).toBeGreaterThan(100);
  await area.press('Shift+Space');
  await expect.poll(() => scrollTop(page)).toBe(0);
  await area.press('Tab');
  const action = page.getByRole('button', { name: 'Позначити переглянутим', exact: true });
  await expect(action).toBeFocused();
  await expect.poll(() => scrollTop(page)).toBeGreaterThan(100);
  await action.press('Space');
  await expect(page.locator('demo-scroll-area').getByRole('status')).toHaveText(
    'Історію переглянуто',
  );
  await action.press('Shift+Tab');
  await expect(area).toBeFocused();
  await area.press('Shift+Tab');
  await expect(area).not.toBeFocused();
});

test('actual wheel scroll stays native and both table axes are reachable', async ({ page }) => {
  await openScroll(page);
  const area = activity(page);
  await area.evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await area.hover();
  await page.mouse.wheel(0, 180);
  await expect.poll(() => scrollTop(page)).toBeGreaterThan(0);
  const table = page.getByTestId('scroll-table');
  await table.focus();
  await table.press('ArrowDown');
  await expect.poll(() => table.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  // Narrowing the viewport guarantees horizontal overflow rather than relying on desktop width.
  await page.setViewportSize({ width: 600, height: 900 });
  await table.focus();
  await table.press('ArrowRight');
  await expect.poll(() => table.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
});

for (const dir of ['ltr', 'rtl'])
  test(`native horizontal arrow direction (${dir})`, async ({ page }) => {
    await openScroll(page, 'dark', dir);
    const area = page.getByTestId('scroll-horizontal');
    await area.focus();
    await area.press(dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight');
    await expect.poll(() => area.evaluate((el) => Math.abs(el.scrollLeft))).toBeGreaterThan(0);
    expect(await area.evaluate((el) => getComputedStyle(el).direction)).toBe(dir);
  });

test('Splitter composes on one viewport; nested input keys do not resize or scroll panes', async ({
  page,
}) => {
  await openScroll(page);
  const pane = page.getByTestId('scroll-pane');
  expect(await pane.locator('[vdScrollArea]').count()).toBe(0);
  await expect(pane).toHaveAttribute('tabindex', '0');
  const input = page.getByLabel('Пошук у нотатках', { exact: true });
  await input.fill('і ї є ґ');
  await input.focus();
  await input.press('Home');
  await input.press('ArrowRight');
  expect(await input.evaluate((el: HTMLInputElement) => el.selectionStart)).toBe(1);
  const top = await pane.evaluate((el) => el.scrollTop);
  await input.press('ArrowDown');
  expect(await pane.evaluate((el) => el.scrollTop)).toBe(top);
  const handle = page.getByRole('separator', { name: 'Нотатки команди', exact: true });
  await handle.focus();
  const before = Number(await handle.getAttribute('aria-valuenow'));
  await handle.press('ArrowRight');
  await expect(handle).toHaveAttribute('aria-valuenow', String(before + 1));
});

test('short and empty content retain stable keyboard access without synthetic scrollbars', async ({
  page,
}) => {
  await openScroll(page);
  const short = page.getByTestId('scroll-short');
  await short.focus();
  await expect(short).toBeFocused();
  expect(
    await short.evaluate(
      (el) => el.scrollHeight <= el.clientHeight && el.scrollWidth <= el.clientWidth,
    ),
  ).toBe(true);
  await short.press('Tab');
  await expect(page.getByTestId('scroll-empty')).toBeFocused();
  await expect(page.getByRole('scrollbar')).toHaveCount(0);
});

for (const dir of ['ltr', 'rtl'])
  test(`320px and 200% text keep all content inside scroll viewports (${dir})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await openScroll(page, 'dark', dir);
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%';
    });
    for (const theme of ['dark', 'light']) {
      await page.evaluate(
        (theme) => document.documentElement.setAttribute('data-theme', theme),
        theme,
      );
      expect(
        await page.locator('[vdScrollArea]').evaluateAll((areas) =>
          areas.every((el) => {
            const box = el.getBoundingClientRect(),
              parent = el.parentElement!.getBoundingClientRect();
            return box.width > 0 && box.left >= parent.left - 1 && box.right <= parent.right + 1;
          }),
        ),
      ).toBe(true);
      const rtl = page.getByTestId('scroll-rtl');
      await rtl.focus();
      await rtl.press('End');
      await expect
        .poll(() =>
          rtl.evaluate((el) => Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop)),
        )
        .toBeLessThanOrEqual(1);
      expect(await rtl.evaluate((el) => getComputedStyle(el).direction)).toBe('rtl');
    }
  });

test('forced colors uses native scrollbars and system outline; reduced motion is immediate', async ({
  page,
}) => {
  await openScroll(page);
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  const area = activity(page);
  await area.focus();
  await area.press('ArrowDown');
  expect(await area.evaluate((el) => getComputedStyle(el).scrollbarColor)).toBe('auto');
  expect(await area.evaluate((el) => getComputedStyle(el).scrollbarWidth)).toBe('auto');
  expect(await area.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid');
  expect(await area.evaluate((el) => getComputedStyle(el).scrollBehavior)).toBe('auto');
});

test('emulated touch swipe scrolls the native viewport', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  try {
    await openScroll(page);
    await activity(page).evaluate((el) =>
      el.scrollIntoView({ behavior: 'instant', block: 'center' }),
    );
    const box = await activity(page).boundingBox();
    expect(box).not.toBeNull();
    const client = await context.newCDPSession(page);
    const x = box!.x + box!.width / 2,
      y = box!.y + box!.height / 2 + 70;
    await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let step = 1; step <= 6; step++) {
      await client.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x, y: y - step * 22 }],
      });
      await page.waitForTimeout(20);
    }
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect.poll(() => scrollTop(page)).toBeGreaterThan(0);
  } finally {
    await context.close();
  }
});

for (const theme of ['dark', 'light'] as const)
  test(`scroll area axe (${theme})`, async ({ page }) => {
    await openScroll(page, theme);
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(
      result.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
    ).toEqual([]);
  });
