import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { openGallery } from './fixtures';
const rows = (root: Locator) => root.locator('[data-reorder-id]');
const order = (root: Locator) =>
  rows(root).evaluateAll((elements) => elements.map((el) => el.getAttribute('data-reorder-id')));
async function point(row: Locator, grip = false) {
  const box = await (grip ? row.locator('.vd-reorder-list__grip') : row).boundingBox();
  return { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };
}
async function begin(page: Page, root: Locator, from: number, to: number) {
  const start = await point(rows(root).nth(from), true),
    end = await point(rows(root).nth(to));
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(end.x, end.y, { steps: 8 });
}

test('buttons preserve identity/focus and announce one-based positions; boundaries do nothing', async ({
  page,
}) => {
  await openGallery(page, 'reorder-list');
  const root = page.getByTestId('priority-list');
  const report = rows(root).filter({
    has: page.getByText('Перевірити звіт за зміну', { exact: true }),
  });
  const down = report.getByRole('button', { name: 'Нижче: Перевірити звіт за зміну', exact: true });
  await expect(root.getByRole('status')).toBeEmpty();
  await down.focus();
  await down.press('Enter');
  await expect.poll(() => order(root)).toEqual(['quality', 'report', 'plan', 'archive']);
  await expect(down).toBeFocused();
  await expect(root.getByRole('status')).toHaveText('Перевірити звіт за зміну. Позиція 2 з 4.');
  await down.press('Space');
  await down.press('Enter');
  await expect.poll(() => order(root)).toEqual(['quality', 'plan', 'archive', 'report']);
  await expect(report.getByRole('button').first()).toBeFocused();
  await expect(down).toBeDisabled();
  await down.evaluate((el: HTMLButtonElement) => el.click());
  await expect.poll(() => order(root)).toEqual(['quality', 'plan', 'archive', 'report']);
  await report.getByRole('button', { name: 'Вище: Перевірити звіт за зміну', exact: true }).click();
  await expect.poll(() => order(root)).toEqual(['quality', 'plan', 'report', 'archive']);
});

test('mouse drag previews a boundary without reordering and commits only on release', async ({
  page,
}) => {
  await openGallery(page, 'reorder-list');
  const root = page.getByTestId('priority-list');
  await begin(page, root, 0, 2);
  await expect(root).toHaveAttribute('data-state', 'dragging');
  await expect(rows(root).nth(2)).toHaveAttribute('data-drop', 'after');
  expect(await order(root)).toEqual(['report', 'quality', 'plan', 'archive']);
  await page.mouse.up();
  await expect.poll(() => order(root)).toEqual(['quality', 'plan', 'report', 'archive']);
  await expect(rows(root).nth(2)).toBeFocused();
  await expect(root.getByRole('status')).toContainText('Позиція 3 з 4');
});

test('Escape, outside drop, pointercancel and lost capture keep the source unchanged', async ({
  page,
}) => {
  await openGallery(page, 'reorder-list');
  const root = page.getByTestId('priority-list'),
    initial = await order(root);
  await begin(page, root, 0, 2);
  await page.keyboard.press('Escape');
  await page.mouse.up();
  expect(await order(root)).toEqual(initial);
  await expect(root.getByRole('status')).toContainText('Переміщення скасовано');
  await begin(page, root, 0, 2);
  await page.keyboard.press('Tab');
  await page.mouse.up();
  await expect(root).toHaveAttribute('data-state', 'idle');
  expect(await order(root)).toEqual(initial);
  await expect(rows(root).first().locator('button:not(:disabled)')).toBeFocused();
  await begin(page, root, 0, 2);
  await page.mouse.move(1, 1);
  await page.mouse.up();
  expect(await order(root)).toEqual(initial);
  await expect(root).toHaveAttribute('data-state', 'idle');
  for (const event of ['pointercancel', 'lostpointercapture']) {
    await begin(page, root, 0, 2);
    await rows(root)
      .first()
      .locator('.vd-reorder-list__grip')
      .evaluate(
        (el, event) => el.dispatchEvent(new PointerEvent(event, { pointerId: 1, bubbles: true })),
        event,
      );
    await page.mouse.up();
    await expect(root).toHaveAttribute('data-state', 'idle');
    expect(await order(root)).toEqual(initial);
  }
});

test('small gestures and same-row releases are no-ops; external replacement and disable cancel drag', async ({
  page,
}) => {
  await openGallery(page, 'reorder-list');
  const root = page.getByTestId('priority-list'),
    initial = await order(root);
  const start = await point(rows(root).first(), true);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x + 1, start.y + 1);
  await page.mouse.up();
  expect(await order(root)).toEqual(initial);
  await expect(root.getByRole('status')).toBeEmpty();
  await begin(page, root, 0, 0);
  await page.mouse.up();
  expect(await order(root)).toEqual(initial);
  await begin(page, root, 0, 2);
  await page
    .getByRole('button', { name: 'Відновити порядок', exact: true })
    .evaluate((el: HTMLButtonElement) => el.click());
  await page.mouse.up();
  await expect(root).toHaveAttribute('data-state', 'idle');
  expect(await order(root)).toEqual(initial);
  await begin(page, root, 0, 2);
  await page
    .getByRole('button', { name: 'Заблокувати зміни', exact: true })
    .evaluate((el: HTMLButtonElement) => el.click());
  await page.mouse.up();
  await expect(root).toHaveAttribute('data-state', 'disabled');
  expect(await order(root)).toEqual(initial);
  await page.getByRole('button', { name: 'Увімкнути зміни', exact: true }).click();
  await begin(page, root, 0, 2);
  await page
    .locator('a[href="/expandable-text"]')
    .first()
    .evaluate((el: HTMLAnchorElement) => el.click());
  await expect(root).toHaveCount(0);
  await page.mouse.up();
});

test('native touch drag/cancel use the grip while ordinary content retains native touch behavior', async ({
  browser,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 520, height: 1500 },
  });
  const page = await context.newPage();
  await openGallery(page, 'reorder-list');
  const root = page.getByTestId('priority-list');
  await root.scrollIntoViewIfNeeded();
  const session = await context.newCDPSession(page);
  const touch = async (
    type: 'touchStart' | 'touchMove' | 'touchEnd' | 'touchCancel',
    p?: { x: number; y: number },
  ) => session.send('Input.dispatchTouchEvent', { type, touchPoints: p ? [{ ...p, id: 1 }] : [] });
  await touch('touchStart', await point(rows(root).first(), true));
  await touch('touchMove', await point(rows(root).nth(2)));
  await expect(root).toHaveAttribute('data-state', 'dragging');
  await touch('touchEnd');
  await expect.poll(() => order(root)).toEqual(['quality', 'plan', 'report', 'archive']);
  const before = await order(root);
  await touch('touchStart', await point(rows(root).first(), true));
  await touch('touchMove', await point(rows(root).nth(1)));
  await touch('touchCancel');
  await expect(root).toHaveAttribute('data-state', 'idle');
  expect(await order(root)).toEqual(before);
  expect(
    await rows(root)
      .first()
      .locator('.vd-reorder-list__body')
      .evaluate((el) => getComputedStyle(el).touchAction),
  ).toBe('auto');
  await session.detach();
  await context.close();
});

test('external removal/disable recover owned focus while outside focus stays outside', async ({
  page,
}) => {
  await openGallery(page, 'reorder-list');
  const root = page.getByTestId('priority-list');
  await rows(root).first().getByRole('button').last().focus();
  await page
    .getByRole('button', { name: 'Прибрати перший елемент', exact: true })
    .evaluate((el: HTMLButtonElement) => el.click());
  await expect(rows(root).first().getByRole('button').last()).toBeFocused();
  const block = page.getByRole('button', { name: 'Заблокувати зміни', exact: true });
  await block.evaluate((el: HTMLButtonElement) => el.click());
  await expect(root.getByRole('list')).toBeFocused();
  await page.getByRole('button', { name: 'Увімкнути зміни', exact: true }).click();
  const remove = page.getByRole('button', { name: 'Прибрати перший елемент', exact: true });
  await remove.click();
  await expect(remove).toBeFocused();
  await expect(page.getByTestId('invalid-list').getByRole('button')).toHaveCount(0);
  await expect(page.getByTestId('single-list').getByRole('button').first()).toBeDisabled();
  await expect(page.getByTestId('empty-list').getByRole('button')).toHaveCount(0);
});

test('missing pointer capture keeps buttons usable', async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(Element.prototype, 'setPointerCapture', {
      configurable: true,
      value: undefined,
    }),
  );
  await openGallery(page, 'reorder-list');
  const root = page.getByTestId('priority-list');
  await begin(page, root, 0, 2);
  await page.mouse.up();
  expect(await order(root)).toEqual(['report', 'quality', 'plan', 'archive']);
  await rows(root).first().getByRole('button').last().click();
  await expect.poll(() => order(root)).toEqual(['quality', 'report', 'plan', 'archive']);
});

for (const theme of ['dark', 'light'] as const)
  for (const dir of ['ltr', 'rtl']) {
    test(`narrow 200%, vertical meaning, focus and axe (${theme}, ${dir})`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 1100 });
      await openGallery(page, 'reorder-list', theme, dir);
      await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
      const root = page.getByTestId(dir === 'rtl' ? 'rtl-list' : 'long-list'),
        first = rows(root).first(),
        id = await first.getAttribute('data-reorder-id');
      const item = root.locator(`[data-reorder-id="${id}"]`);
      const down = item.getByRole('button').last();
      await down.focus();
      await down.press('Enter');
      await expect(rows(root).nth(1)).toHaveAttribute('data-reorder-id', id!);
      await expect(item.locator('button:not(:disabled)').last()).toBeFocused();
      await expect(item.locator('button:not(:disabled)').last()).toBeInViewport();
      expect(await root.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
            .analyze()
        ).violations,
      ).toEqual([]);
    });
  }

test('drag marker is axe-clean; forced colors and reduced motion retain focus and boundary', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openGallery(page, 'reorder-list');
  const root = page.getByTestId('priority-list');
  await begin(page, root, 0, 2);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.emulateMedia({ forcedColors: 'active' });
  const styles = await rows(root)
    .nth(2)
    .evaluate((el) => ({
      marker: getComputedStyle(el, '::after').backgroundColor,
      height: getComputedStyle(el, '::after').height,
      border: getComputedStyle(el).borderBottomStyle,
    }));
  expect(styles.marker).not.toBe('rgba(0, 0, 0, 0)');
  expect(parseFloat(styles.height)).toBeGreaterThan(0);
  expect(styles.border).toBe('solid');
  await page.keyboard.press('Escape');
  await page.mouse.up();
  const button = root.locator('[data-reorder-id="report"]').getByRole('button').last();
  await button.focus();
  await button.press('Enter');
  await expect(button).toBeFocused();
  expect(
    await button.evaluate((el) =>
      getComputedStyle(el)
        .transitionDuration.split(',')
        .every((value) => parseFloat(value) === 0),
    ),
  ).toBe(true);
});
