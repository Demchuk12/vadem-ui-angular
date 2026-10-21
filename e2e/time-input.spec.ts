import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { openGallery, type Theme } from './fixtures';

const meeting = (page: Page) => page.getByLabel('Час зустрічі');
async function openTime(page: Page, theme: Theme = 'dark', dir = 'ltr') {
  await openGallery(page, 'time-input', theme, dir);
  await expect(page.getByRole('heading', { name: 'Time input', exact: true })).toBeVisible();
  await expect(page.locator('input[vdTimeInput]')).toHaveCount(10);
}
const save = (page: Page) => page.getByRole('button', { name: 'Зберегти час', exact: true });

test('native segment editing, keyboard exit and explicit form submission', async ({ page }) => {
  await openTime(page);
  const input = meeting(page);
  await input.focus();
  await input.press('ArrowUp');
  await expect(input).toHaveValue('10:30');
  await input.press('ArrowDown');
  await expect(input).toHaveValue('09:30');
  expect(await input.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid');
  await input.press('ArrowRight');
  await input.press('ArrowUp');
  await expect(input).toHaveValue('09:45');
  await input.fill('10:15');
  await expect(page.getByTestId('time-status')).toHaveText('Оберіть час і збережіть зміни');
  for (
    let step = 0;
    step < 8 && !(await save(page).evaluate((el) => el === document.activeElement));
    step++
  )
    await page.keyboard.press('Tab');
  await expect(save(page)).toBeFocused();
  await save(page).press('Enter');
  await expect(page.getByTestId('time-status')).toHaveText('Демонстраційний час збережено');
  await page.keyboard.press('Shift+Tab');
  await expect(input).toBeFocused();
});

test('native bounds, inclusive endpoints and quarter-hour validity agree with touched model errors', async ({
  page,
}) => {
  await openTime(page);
  for (const [value, flag] of [
    ['08:00', 'rangeUnderflow'],
    ['18:15', 'rangeOverflow'],
    ['10:07', 'stepMismatch'],
  ] as const) {
    await meeting(page).fill(value);
    await save(page).focus();
    expect(
      await meeting(page).evaluate((el: HTMLInputElement, flag) => el.validity[flag], flag),
    ).toBe(true);
    await expect(meeting(page)).toHaveAttribute('aria-invalid', 'true');
  }
  for (const value of ['09:00', '10:15', '18:00']) {
    await meeting(page).fill(value);
    await save(page).focus();
    expect(await meeting(page).evaluate((el: HTMLInputElement) => el.validity.valid)).toBe(true);
    await expect(meeting(page)).not.toHaveAttribute('aria-invalid', 'true');
  }
  await meeting(page).fill('');
  await save(page).focus();
  expect(await meeting(page).evaluate((el: HTMLInputElement) => el.validity.valueMissing)).toBe(
    true,
  );
  await expect(meeting(page)).toHaveAttribute('aria-invalid', 'true');
});

test('disabled excludes native submission, readonly resists editing and reset restores string value', async ({
  page,
}) => {
  await openTime(page);
  await meeting(page).fill('14:45');
  await page.getByRole('button', { name: 'Перемкнути доступність', exact: true }).click();
  await expect(meeting(page)).toBeDisabled();
  expect(
    await page
      .locator('form')
      .evaluate((el: HTMLFormElement) => new FormData(el).has('meeting-time')),
  ).toBe(false);
  await page.getByRole('button', { name: 'Перемкнути доступність', exact: true }).click();
  await expect(meeting(page)).toHaveValue('14:45');
  await page.getByRole('button', { name: 'Скинути час', exact: true }).click();
  await expect(meeting(page)).toHaveValue('09:30');
  const readonly = page.getByLabel('Час тільки для перегляду', { exact: true });
  await readonly.focus();
  await readonly.press('ArrowUp');
  await readonly.press('Delete');
  await expect(readonly).toHaveValue('14:45');
});

test('native overnight bounds permit both sides of midnight', async ({ page }) => {
  await openTime(page);
  const input = page.getByLabel('Нічна зміна', { exact: true });
  for (const value of ['22:00', '23:30', '00:00', '05:45', '06:00']) {
    await input.fill(value);
    expect(await input.evaluate((el: HTMLInputElement) => el.validity.valid)).toBe(true);
  }
  await input.fill('12:00');
  expect(await input.evaluate((el: HTMLInputElement) => el.validity.valid)).toBe(false);
});

test('Signal Forms receives native writes and displays matching time-window errors', async ({
  page,
}) => {
  await openTime(page);
  const input = page.getByLabel('Час консультації');
  await input.fill('08:00');
  await page.getByRole('button', { name: 'Установити 14:30', exact: true }).focus();
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await page.getByRole('button', { name: 'Установити 14:30', exact: true }).press('Enter');
  await expect(input).toHaveValue('14:30');
  await expect(input).not.toHaveAttribute('aria-invalid', 'true');
  await input.fill('10:07');
  await save(page).focus();
  await expect(input).toHaveAttribute('aria-invalid', 'true');
});

for (const dir of ['ltr', 'rtl'])
  test(`320px and 200% text keep Ukrainian/Arabic fields within panels (${dir})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await openTime(page, 'dark', dir);
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%';
    });
    for (const theme of ['dark', 'light']) {
      await page.evaluate(
        (theme) => document.documentElement.setAttribute('data-theme', theme),
        theme,
      );
      expect(
        await page.locator('input[vdTimeInput]').evaluateAll((inputs) =>
          inputs.every((el) => {
            const box = el.getBoundingClientRect(),
              parent = el.parentElement!.getBoundingClientRect();
            return box.width > 0 && box.left >= parent.left - 1 && box.right <= parent.right + 1;
          }),
        ),
      ).toBe(true);
      const arabic = page.getByLabel('وقت الاجتماع', { exact: true });
      await arabic.fill('17:45');
      await expect(arabic).toHaveValue('17:45');
    }
  });

test('forced colors preserves keyboard outline and reduced motion removes transitions', async ({
  page,
}) => {
  await openTime(page);
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await meeting(page).focus();
  await meeting(page).press('ArrowRight');
  expect(await meeting(page).evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid');
  expect(
    await meeting(page).evaluate((el) =>
      getComputedStyle(el)
        .transitionDuration.split(',')
        .every((v) => parseFloat(v) === 0),
    ),
  ).toBe(true);
});

for (const theme of ['dark', 'light'] as const)
  test(`time input axe (${theme})`, async ({ page }) => {
    await openTime(page, theme);
    await meeting(page).fill('08:00');
    await save(page).focus();
    await expect(meeting(page)).toHaveAttribute('aria-invalid', 'true');
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(
      result.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
    ).toEqual([]);
  });

for (const theme of ['dark', 'light'] as const) {
  test(`styled picker pointer, keyboard, bounds and axe (${theme})`, async ({ page }) => {
    await openTime(page, theme);
    const input = meeting(page);
    await input.click();
    const panel = page.getByRole('dialog', { name: 'Оберіть час', exact: true });
    await expect(panel).toBeVisible();
    await expect(panel).toHaveCSS('opacity', '1');
    await expect(input).toHaveAttribute('data-state', 'open');
    const hours = panel.getByRole('listbox', { name: 'Год', exact: true });
    const minutes = panel.getByRole('listbox', { name: 'Хв', exact: true });
    const selected = hours.getByRole('option', { name: '09', exact: true });
    await expect(selected).toBeFocused();
    await expect(selected).toHaveAttribute('aria-selected', 'true');
    await expect(hours.getByRole('option')).toHaveCount(10);
    await expect(minutes.getByRole('option')).toHaveCount(4);
    await page.screenshot({ path: `screenshots/time-input-picker-${theme}.png` });
    await selected.press('Tab');
    await expect(minutes.getByRole('option', { name: '30', exact: true })).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(minutes.getByRole('option', { name: '45', exact: true })).toBeFocused();
    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(axe.violations).toEqual([]);
    await page.keyboard.press('Enter');
    await expect(input).toHaveValue('09:45');
    await expect(input).toBeFocused();
    await expect(panel).not.toBeVisible();
    await input.press('Alt+ArrowDown');
    await expect(panel).toBeVisible();
    await expect(panel).toHaveCSS('opacity', '1');
    await page.keyboard.press('End');
    await expect(hours.getByRole('option', { name: '18', exact: true })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(minutes.getByRole('option')).toHaveCount(1);
    await expect(minutes.getByRole('option', { name: '00', exact: true })).toBeFocused();
    await expect(input).toHaveValue('09:45');
    await page.keyboard.press('Escape');
    await expect(input).toBeFocused();
    await expect(input).toHaveValue('09:45');
    await input.click();
    await hours.getByRole('option', { name: '10', exact: true }).click();
    await minutes.getByRole('option', { name: '15', exact: true }).click();
    await expect(input).toHaveValue('10:15');
    await save(page).click();
    await expect(page.getByTestId('time-status')).toHaveText('Демонстраційний час збережено');
  });
}

test('picker preserves RTL, narrow enlarged text, readonly and overnight constraints', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await openTime(page, 'dark', 'rtl');
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
  await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
  await meeting(page).press('Alt+ArrowDown');
  const panel = page.getByRole('dialog', { name: 'Оберіть час', exact: true });
  await expect(panel).toBeVisible();
  await expect(panel).toHaveCSS('opacity', '1');
  expect(
    await panel.evaluate((el) => {
      const box = el.getBoundingClientRect();
      return box.left >= 0 && box.right <= innerWidth;
    }),
  ).toBe(true);
  expect(
    await panel
      .getByRole('option')
      .evaluateAll((options) => options.every((el) => el.scrollWidth <= el.clientWidth)),
  ).toBe(true);
  await page.screenshot({ path: 'screenshots/time-input-picker-narrow-forced.png' });
  await page.keyboard.press('Escape');
  await page.getByLabel('Час тільки для перегляду', { exact: true }).click();
  await expect(page.locator('.vd-time-picker:popover-open')).toHaveCount(0);
  const overnight = page.getByLabel('Нічна зміна', { exact: true });
  await overnight.press('Alt+ArrowDown');
  await expect(
    panel
      .getByRole('listbox', { name: 'Год', exact: true })
      .getByRole('option', { name: '00', exact: true }),
  ).toHaveCount(1);
  await expect(
    panel
      .getByRole('listbox', { name: 'Год', exact: true })
      .getByRole('option', { name: '12', exact: true }),
  ).toHaveCount(0);
});
