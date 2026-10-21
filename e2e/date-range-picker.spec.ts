import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { openGallery } from './fixtures';
const fields = (page: Page) => page.getByRole('group', { name: 'Період звіту', exact: true });
const start = (page: Page) => fields(page).getByRole('textbox', { name: /Початок/ });
const end = (page: Page) => fields(page).getByRole('textbox', { name: 'Кінець', exact: true });
const trigger = (page: Page) =>
  page.getByRole('button', { name: 'Відкрити календар періоду', exact: true });
const dialog = (page: Page) => page.getByRole('dialog', { name: 'Період звіту', exact: true });
const date = (page: Page, iso: string) => dialog(page).locator(`[data-date="${iso}"]`);
async function open(page: Page, theme: 'dark' | 'light' = 'dark', dir = 'ltr') {
  // Keep the initial month deterministic and different from the explicitly focused day.
  await page.clock.setFixedTime(new Date('2026-10-16T12:00:00Z'));
  await openGallery(page, 'date-range-picker', theme, dir);
  await expect(page.getByRole('heading', { name: 'Date range picker', exact: true })).toBeVisible();
}
async function show(page: Page) {
  await trigger(page).click();
  await expect(dialog(page).locator('[role=gridcell][tabindex="0"]')).toBeFocused();
}

for (const dir of ['ltr', 'rtl']) {
  test(`keyboard selects inclusive range and same-day period (${dir})`, async ({ page }) => {
    await open(page, 'dark', dir);
    await start(page).focus();
    await start(page).press('Alt+ArrowDown');
    await expect(dialog(page).locator('[tabindex="0"]')).toBeFocused();
    await date(page, '2026-10-08').focus();
    await page.keyboard.press('Enter');
    await expect(dialog(page).getByRole('status')).toHaveText('Оберіть дату кінця');
    await expect(page.getByTestId('range-value')).toHaveText('Період ще не обрано');
    await page.keyboard.press(dir === 'ltr' ? 'ArrowRight' : 'ArrowLeft');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('range-value')).toHaveText('2026-10-08 → 2026-10-09');
    await expect(trigger(page)).toBeFocused();
    await show(page);
    await date(page, '2026-10-08').press('Space');
    await date(page, '2026-10-08').press('Space');
    await expect(page.getByTestId('range-value')).toHaveText('2026-10-08 → 2026-10-08');
  });
}

test('pointer reverse boundaries, cross-month navigation, cancel and interval semantics', async ({
  page,
}) => {
  await open(page);
  await show(page);
  await date(page, '2026-10-14').click();
  await date(page, '2026-10-08').click();
  await expect(page.getByTestId('range-value')).toHaveText('2026-10-08 → 2026-10-14');
  await show(page);
  await expect(dialog(page).getByRole('grid')).toHaveAttribute('aria-multiselectable', 'true');
  await expect(dialog(page).locator('[aria-selected="true"]')).toHaveCount(7);
  await date(page, '2026-10-30').click();
  await dialog(page).getByRole('button', { name: 'Наступний місяць' }).click();
  await date(page, '2026-11-02').click();
  await expect(page.getByTestId('range-value')).toHaveText('2026-10-30 → 2026-11-02');
  await show(page);
  await date(page, '2026-10-20').click();
  await page.keyboard.press('Escape');
  await expect(trigger(page)).toBeFocused();
  await expect(page.getByTestId('range-value')).toHaveText('2026-10-30 → 2026-11-02');
});

test('typed locale dates reject stale values, impossible/order/out-of-bound input and reset errors', async ({
  page,
}) => {
  await open(page);
  await start(page).fill('8.10.26');
  await end(page).fill('14.10.26');
  await end(page).press('Enter');
  await expect(page.getByTestId('range-value')).toHaveText('2026-10-08 → 2026-10-14');
  await expect(start(page)).toHaveValue('08.10.2026');
  await end(page).fill('7.10.26');
  await end(page).press('Enter');
  await expect(page.getByTestId('range-value')).toHaveText('Період ще не обрано');
  await expect(end(page)).toHaveAttribute('aria-invalid', 'true');
  await end(page).fill('31.2.26');
  await end(page).press('Enter');
  await expect(end(page)).toHaveAttribute('aria-invalid', 'true');
  await end(page).fill('1.1.27');
  await end(page).press('Enter');
  await expect(end(page)).toHaveAttribute('aria-invalid', 'true');
  await page.getByRole('button', { name: 'Скинути період', exact: true }).click();
  await expect(start(page)).toHaveValue('');
  await expect(end(page)).toHaveValue('');
  await expect(end(page)).not.toHaveAttribute('aria-invalid', 'true');
});

test('limits, native disabled and readonly preserve inspection', async ({ page }) => {
  await open(page);
  await show(page);
  await expect(date(page, '2026-09-30')).toHaveAttribute('aria-disabled', 'true');
  await date(page, '2026-09-30').click({ force: true });
  await expect(dialog(page).getByRole('status')).toHaveText('Оберіть дату початку');
  await date(page, '2026-10-01').click();
  await date(page, '2026-10-31').click();
  await page.getByRole('button', { name: 'Перемкнути доступність', exact: true }).click();
  await expect(start(page)).toBeDisabled();
  await expect(trigger(page)).toBeDisabled();
  await expect(page.getByTestId('range-value')).toHaveText('2026-10-01 → 2026-10-31');
  const readonly = page.locator('vd-date-range-picker[data-readonly]');
  await expect(readonly.getByRole('textbox').first()).toHaveAttribute('readonly', '');
  await expect(readonly.getByRole('button')).toBeDisabled();
  await readonly.getByRole('textbox').first().focus();
  await readonly.getByRole('textbox').first().press('Alt+ArrowDown');
  await expect(dialog(page)).not.toBeVisible();
});

test('required touch, internal focus, Signal Forms typing and replacement', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Зберегти період', exact: true }).click();
  await expect(start(page)).toHaveAttribute('aria-invalid', 'true');
  const group = page.getByRole('group', { name: 'Відпустка', exact: true });
  const a = group.getByRole('textbox').first(),
    b = group.getByRole('textbox').last();
  await a.focus();
  await page.keyboard.press('Tab');
  await expect(b).not.toHaveAttribute('aria-invalid', 'true');
  await a.fill('8.10.26');
  await b.fill('12.10.26');
  await b.press('Enter');
  await expect(page.getByTestId('range-signal-value')).toHaveText('2026-10-08 → 2026-10-12');
  await page.getByRole('button', { name: 'Установити приклад періоду', exact: true }).click();
  await expect(page.getByTestId('range-signal-value')).toHaveText('2026-10-08 → 2026-10-14');
});

test('grid endpoints/month/year navigation and non-modal Tab dismissal', async ({ page }) => {
  await open(page);
  await show(page);
  await date(page, '2026-10-08').focus();
  await page.keyboard.press('Home');
  await expect(date(page, '2026-10-05')).toBeFocused();
  await page.keyboard.press('End');
  await expect(date(page, '2026-10-11')).toBeFocused();
  await page.keyboard.press('PageDown');
  await expect(date(page, '2026-11-11')).toBeFocused();
  await page.keyboard.press('PageUp');
  await expect(date(page, '2026-10-11')).toBeFocused();
  await page.keyboard.press('Shift+PageDown');
  await expect(date(page, '2026-12-31')).toBeFocused();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(dialog(page)).not.toBeVisible();
});
for (const dir of ['ltr', 'rtl']) {
  test(`320px/200% calendar targets and fields remain reachable (${dir})`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await open(page, 'dark', dir);
    await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
    await show(page);
    expect(await dialog(page).evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    const cells = await dialog(page).getByRole('gridcell').all();
    for (const cell of cells) {
      const box = await cell.boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(24);
      expect(
        await cell.evaluate((el) => {
          const node = el.firstChild!;
          const text = node.textContent!;
          const range = document.createRange();
          range.setStart(node, text.search(/\S/));
          range.setEnd(node, text.trimEnd().length);
          const ink = range.getBoundingClientRect(),
            box = el.getBoundingClientRect();
          return ink.left >= box.left + 1 && ink.right <= box.right - 1;
        }),
      ).toBe(true);
    }
    await date(page, '2026-10-08').click();
    await date(page, '2026-10-10').click();
    await expect(page.getByTestId('range-value')).toHaveText('2026-10-08 → 2026-10-10');
  });
}

test('forced colors and reduced motion preserve endpoints, focus and interior', async ({
  page,
}) => {
  await open(page);
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await show(page);
  await date(page, '2026-10-08').click();
  await date(page, '2026-10-14').click();
  await show(page);
  await expect(date(page, '2026-10-08')).toHaveCSS('outline-style', 'solid');
  await expect(date(page, '2026-10-10')).toHaveCSS('border-block-start-style', 'solid');
  expect(
    await dialog(page).evaluate((el) =>
      getComputedStyle(el)
        .transitionDuration.split(',')
        .every((v) => parseFloat(v) === 0),
    ),
  ).toBe(true);
});
for (const theme of ['dark', 'light'] as const) {
  test(`closed/error and open range axe (${theme})`, async ({ page }) => {
    // Audit settled states: mid-fade popups report false contrast failures.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page, theme);
    await start(page).fill('bad');
    await start(page).press('Enter');
    for (const opened of [false, true]) {
      if (opened) await show(page);
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(
        result.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
      ).toEqual([]);
    }
  });
}

test('Arabic localized numbers can be edited into a new complete range', async ({ page }) => {
  await open(page);
  const group = page.getByRole('group', { name: 'فترة التقرير', exact: true });
  const start = group.getByRole('textbox', { name: 'فترة التقرير البداية', exact: true });
  const end = group.getByRole('textbox', { name: 'النهاية', exact: true });
  await start.fill('٠٩/١٠/٢٠٢٦');
  await end.fill('١٥/١٠/٢٠٢٦');
  await end.press('Enter');
  await expect(start).toHaveValue('٠٩‏/١٠‏/٢٠٢٦');
  await expect(end).toHaveValue('١٥‏/١٠‏/٢٠٢٦');
  await expect(end).not.toHaveAttribute('aria-invalid', 'true');
});
