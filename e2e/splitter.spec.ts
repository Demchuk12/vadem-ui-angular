import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { openGallery, type Theme } from './fixtures';

async function openSplitter(page: Page, theme: Theme = 'dark') {
  await openGallery(page, 'splitter', theme);
  await expect(page.getByRole('heading', { name: 'Splitter', exact: true })).toBeVisible();
  await expect(page.locator('[vdSplitter]')).toHaveCount(4);
}
const files = (page: Page) => page.getByRole('separator', { name: 'Файли', exact: true });
const workspace = (page: Page) =>
  page.locator('section[aria-labelledby="splitter-workspace"] [vdSplitter]');

test('keyboard bounds, ARIA, focus and native content order', async ({ page }) => {
  await openSplitter(page);
  const handle = files(page);
  await expect(handle).toHaveAttribute('aria-orientation', 'vertical');
  await expect(handle).toHaveAttribute('aria-valuenow', '40');
  const id = await handle.getAttribute('aria-controls');
  expect(id).toBeTruthy();
  await expect(page.locator(`[id="${id}"]`)).toHaveAttribute('vdSplitterPane', '');
  await workspace(page)
    .getByRole('button', { name: 'Нотатки української команди', exact: true })
    .focus();
  await page.keyboard.press('Tab');
  await expect(handle).toBeFocused();
  await handle.press('ArrowRight');
  await expect(handle).toHaveAttribute('aria-valuenow', '41');
  await handle.press('Home');
  await expect(handle).toHaveAttribute('aria-valuenow', '20');
  await handle.press('ArrowLeft');
  await expect(handle).toHaveAttribute('aria-valuenow', '20');
  await handle.press('End');
  await expect(handle).toHaveAttribute('aria-valuenow', '80');
  await expect(handle).toBeFocused();
  await handle.press('Tab');
  await expect(workspace(page).locator(':scope > [vdSplitterPane]').nth(1)).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(handle).toBeFocused();
});
test('mouse drag uses pane span, captures outside the rail and clamps', async ({ page }) => {
  await openSplitter(page);
  const handle = files(page);
  const box = (await handle.boundingBox())!;
  const span = await workspace(page)
    .locator(':scope > [vdSplitterPane]')
    .evaluateAll((panes) =>
      panes.reduce((sum, pane) => sum + pane.getBoundingClientRect().width, 0),
    );
  const start = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await expect(workspace(page)).toHaveAttribute('data-dragging', '');
  await page.mouse.move(start.x + span * 0.2, start.y, { steps: 5 });
  await expect
    .poll(async () => Number(await handle.getAttribute('aria-valuenow')))
    .toBeCloseTo(60, 1);
  await page.mouse.move(start.x + span * 2, start.y);
  await expect(handle).toHaveAttribute('aria-valuenow', '80');
  await page.mouse.up();
  await expect(workspace(page)).not.toHaveAttribute('data-dragging');
  await expect(handle).toBeFocused();
  const newBox = (await handle.boundingBox())!;
  await page.mouse.move(newBox.x + newBox.width / 2, start.y);
  await page.mouse.down();
  await page.mouse.move(0, start.y);
  await page.mouse.up();
  await expect(handle).toHaveAttribute('aria-valuenow', '20');
});
test('vertical axis uses decimal steps; RTL arrows move physically', async ({ page }) => {
  // Geometry assertions must not race the document's smooth focus scrolling.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openSplitter(page);
  const vertical = page.getByRole('separator', { name: 'Попередній перегляд', exact: true });
  await expect(vertical).toHaveAttribute('aria-orientation', 'horizontal');
  await vertical.focus();
  await vertical.press('ArrowDown');
  await expect(vertical).toHaveAttribute('aria-valuenow', '52.5');
  await vertical.press('ArrowUp');
  await expect(vertical).toHaveAttribute('aria-valuenow', '50');
  // Hover waits for a stable, reachable hit target before raw pointer events begin.
  await vertical.hover();
  const box = (await vertical.boundingBox())!;
  await page.mouse.down();
  await expect(vertical.locator('..')).toHaveAttribute('data-dragging', '');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 30);
  await expect
    .poll(async () => Number(await vertical.getAttribute('aria-valuenow')))
    .toBeGreaterThan(50);
  await page.mouse.up();
  const rtl = page.getByRole('separator', { name: 'الملفات', exact: true });
  await rtl.focus();
  await rtl.press('ArrowRight');
  await expect(rtl).toHaveAttribute('aria-valuenow', '49');
  await rtl.press('ArrowLeft');
  await expect(rtl).toHaveAttribute('aria-valuenow', '50');
  await rtl.hover();
  const r = (await rtl.boundingBox())!;
  await page.mouse.down();
  await page.mouse.move(r.x + r.width / 2 + 30, r.y + r.height / 2);
  await page.mouse.up();
  await expect.poll(async () => Number(await rtl.getAttribute('aria-valuenow'))).toBeLessThan(50);
});
test('external model/bounds and disabled/fixed state do not resize or disable content', async ({
  page,
}) => {
  await openSplitter(page);
  const handle = files(page);
  await page.getByRole('button', { name: 'Установити 30%', exact: true }).click();
  await expect(handle).toHaveAttribute('aria-valuenow', '30');
  await page.getByRole('button', { name: 'Перемкнути межі 40–60%', exact: true }).click();
  await expect(handle).toHaveAttribute('aria-valuenow', '40');
  await expect(page.getByTestId('splitter-value')).toContainText('Requested: 30%');
  await page.getByRole('button', { name: 'Перемкнути доступність', exact: true }).click();
  await expect(handle).toHaveAttribute('tabindex', '-1');
  await handle.dispatchEvent('keydown', { key: 'End' });
  await expect(handle).toHaveAttribute('aria-valuenow', '40');
  await expect(
    workspace(page).getByRole('button', { name: 'Вимоги проєкту', exact: true }),
  ).toBeEnabled();
  const fixed = page.getByRole('separator', { name: 'Навігація', exact: true });
  await expect(fixed).toHaveAttribute('aria-disabled', 'true');
  await expect(fixed).toHaveAttribute('aria-valuenow', '35');
});
test('touch drag and pointer cancellation release interaction state', async ({ page, context }) => {
  await openSplitter(page);
  const handle = files(page);
  const box = (await handle.boundingBox())!;
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true });
  const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ ...point, id: 1 }],
  });
  await expect(workspace(page)).toHaveAttribute('data-dragging', '');
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x: point.x + 60, y: point.y, id: 1 }],
  });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  expect(Number(await handle.getAttribute('aria-valuenow'))).toBeGreaterThan(40);
  await expect(workspace(page)).not.toHaveAttribute('data-dragging');
  const next = (await handle.boundingBox())!;
  await page.mouse.move(next.x + next.width / 2, next.y + next.height / 2);
  await page.mouse.down();
  await handle.evaluate((el) =>
    el.dispatchEvent(new PointerEvent('pointercancel', { pointerId: 1, bubbles: true })),
  );
  await page.mouse.up();
  await expect(workspace(page)).not.toHaveAttribute('data-dragging');
});
test('cross-axis/modified/IME keys and missing capture preserve keyboard fallback', async ({
  page,
}) => {
  await openSplitter(page);
  const handle = files(page);
  await handle.focus();
  const untouched = await handle.evaluate((el) =>
    [
      { key: 'ArrowUp' },
      { key: 'Enter' },
      { key: 'ArrowRight', ctrlKey: true },
      { key: 'End', shiftKey: true },
      { key: 'Home', isComposing: true },
    ].map((init) =>
      el.dispatchEvent(new KeyboardEvent('keydown', { ...init, bubbles: true, cancelable: true })),
    ),
  );
  expect(untouched).toEqual([true, true, true, true, true]);
  await expect(handle).toHaveAttribute('aria-valuenow', '40');
  await handle.evaluate((el) =>
    Object.defineProperty(el, 'setPointerCapture', { value: undefined, configurable: true }),
  );
  const b = (await handle.boundingBox())!;
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + 70, b.y + b.height / 2);
  await page.mouse.up();
  await expect(workspace(page)).not.toHaveAttribute('data-dragging');
  await handle.focus();
  await handle.press('ArrowRight');
  await expect(handle).toHaveAttribute('aria-valuenow', '41');
});
for (const dir of ['ltr', 'rtl'])
  test(`320px/enlarged Ukrainian/RTL content (${dir})`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await openSplitter(page);
    await page.evaluate((dir) => {
      document.documentElement.dir = dir;
      document.documentElement.style.fontSize = '200%';
    }, dir);
    for (const theme of ['dark', 'light']) {
      await page.evaluate(
        (theme) => document.documentElement.setAttribute('data-theme', theme),
        theme,
      );
      expect(
        await page.locator('[vdSplitter]').evaluateAll((roots) =>
          roots.every(
            (root) =>
              root.scrollWidth <= root.clientWidth + 1 &&
              [...root.children].every((el) => {
                const a = root.getBoundingClientRect(),
                  b = el.getBoundingClientRect();
                return b.left >= a.left - 1 && b.right <= a.right + 1;
              }),
          ),
        ),
      ).toBe(true);
    }
  });
test('forced colors keeps the rail and keyboard focus; no resize transitions', async ({ page }) => {
  await openSplitter(page);
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await files(page).focus();
  await files(page).press('ArrowRight');
  expect(await files(page).evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid');
  expect(await files(page).evaluate((el) => getComputedStyle(el).transitionDuration)).toBe('0s');
});
for (const theme of ['dark', 'light'] as const)
  test(`splitter axe (${theme})`, async ({ page }) => {
    await openSplitter(page, theme);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(
      results.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
    ).toEqual([]);
  });
