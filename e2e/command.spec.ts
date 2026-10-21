import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { openGallery } from './fixtures';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('modal search filters aliases, accepts an action and restores opener focus', async ({
  page,
}) => {
  await openGallery(page, 'command');
  const opener = page.getByRole('button', { name: 'Відкрити палітру', exact: true });
  await opener.click();
  const dialog = page.getByRole('dialog', { name: 'Швидкі дії' });
  const search = dialog.getByRole('combobox', { name: 'Пошук швидкої дії' });
  await expect(search).toBeFocused();
  await search.fill('settings');
  await expect(dialog.getByRole('option')).toHaveCount(1);
  await expect(dialog.getByRole('option')).toHaveAccessibleName('Відкрити налаштування');
  await expect(dialog.getByRole('option')).toHaveAttribute('aria-selected', 'true');
  await search.press('Enter');
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
  await expect(page.getByText('Обрано: Відкрити налаштування.', { exact: true })).toBeVisible();
});

test('consumer Ctrl/Cmd+K shortcut opens the palette; Escape preserves the caller focus', async ({
  page,
}) => {
  await openGallery(page, 'command');
  const inline = page.getByRole('combobox', { name: 'Пошук дій у списку' });
  await inline.focus();
  for (const shortcut of ['Control+k', 'Meta+k']) {
    await page.keyboard.press(shortcut);
    const dialog = page.getByRole('dialog', { name: 'Швидкі дії' });
    await expect(dialog.getByRole('combobox')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(inline).toBeFocused();
  }
});

test('inline navigation skips disabled actions and preserves native caret editing', async ({
  page,
}) => {
  await openGallery(page, 'command');
  const input = page.getByRole('combobox', { name: 'Пошук дій у списку' });
  await input.focus();
  const command = input.locator('xpath=ancestor::vd-command');
  await input.press('ArrowDown');
  await expect(
    command.getByRole('option', { name: 'Відкрити налаштування', exact: true }),
  ).toHaveAttribute('aria-selected', 'true');
  await input.press('Enter');
  await expect(page.getByText('Обрано: Відкрити налаштування.', { exact: true })).toBeVisible();
  await input.fill('settings');
  await input.press('Home');
  expect(await input.evaluate((el: HTMLInputElement) => el.selectionStart)).toBe(0);
  await input.press('End');
  expect(await input.evaluate((el: HTMLInputElement) => el.selectionStart)).toBe(8);
  await input.press('Escape');
  await expect(input).toHaveValue('settings');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await input.press('ArrowDown');
  await expect(input).toHaveAttribute('aria-expanded', 'true');
  await input.press('Tab');
  await expect(input).not.toBeFocused();
});

test('empty, disabled, loading and composition states do not execute actions', async ({ page }) => {
  await openGallery(page, 'command');
  const input = page.getByRole('combobox', { name: 'Пошук дій у списку' });
  const command = input.locator('xpath=ancestor::vd-command');
  await input.fill('billing');
  await expect(command.getByRole('option')).toHaveAttribute('aria-disabled', 'true');
  await expect(input).not.toHaveAttribute('aria-activedescendant');
  await input.press('Enter');
  await input.fill('невідома дія');
  await expect(command.getByRole('option')).toHaveCount(0);
  await expect(command.getByRole('status')).toHaveText('Немає збігів. Спробуйте інше слово.');
  await input.press('Enter');
  await input.fill('settings');
  await input.evaluate((el) =>
    el.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', isComposing: true, bubbles: true }),
    ),
  );
  await expect(page.getByText('Дію ще не обрано.', { exact: true })).toBeVisible();
  const loading = page.getByRole('combobox', { name: 'Пошук доступних дій' });
  await loading.fill('settings');
  await loading.press('Enter');
  await expect(loading).not.toHaveAttribute('aria-activedescendant');
  await expect(page.getByRole('combobox', { name: 'Недоступний пошук' })).toBeDisabled();
});

test('pointer activation works and the demo theme action changes app state', async ({ page }) => {
  await openGallery(page, 'command');
  await page.getByRole('button', { name: 'Відкрити палітру', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Швидкі дії' });
  await dialog.getByRole('combobox').fill('theme');
  await dialog.getByRole('option', { name: 'Змінити тему', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.getByText('Тему змінено.', { exact: true })).toBeVisible();
});

test('PageDown/PageUp scroll only results and expose the active action', async ({ page }) => {
  await openGallery(page, 'command');
  const input = page.getByRole('combobox', { name: 'Пошук проєкту' });
  await input.focus();
  const command = input.locator('xpath=ancestor::vd-command');
  const pageTop = await page.evaluate(() => window.scrollY);
  await input.press('PageDown');
  const active = command.getByRole('option', { name: 'Відкрити проєкт VA-11', exact: true });
  await expect(input).toHaveAttribute(
    'aria-activedescendant',
    (await active.getAttribute('id')) ?? '',
  );
  await expect
    .poll(() => command.getByRole('listbox').evaluate((el) => el.scrollTop))
    .toBeGreaterThan(0);
  expect(await page.evaluate(() => window.scrollY)).toBe(pageTop);
  await input.press('PageUp');
  await expect(
    command.getByRole('option', { name: 'Відкрити проєкт VA-01', exact: true }),
  ).toHaveAttribute('aria-selected', 'true');
});

test('RTL modal traps focus; narrow enlarged content stays within the page', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await openGallery(page, 'command', 'dark', 'rtl');
  await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await page.getByRole('button', { name: 'Відкрити палітру', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Швидкі дії' });
  const search = dialog.getByRole('combobox');
  await expect(search).toBeFocused();
  await search.fill('налаштування');
  await expect(dialog.getByRole('option')).toHaveCount(1);
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button', { name: 'Закрити', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  // Native dialogs can step into browser chrome before returning to the first control.
  const backgroundIsInert = await dialog.evaluate(
    (el) => el.contains(document.activeElement) || document.activeElement === document.body,
  );
  expect(backgroundIsInert).toBe(true);
  if (!(await search.evaluate((el) => el === document.activeElement)))
    await page.keyboard.press('Tab');
  await expect(search).toBeFocused();
  const box = await dialog.boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(320);
  await search.press('Escape');
  await expect(dialog).not.toBeVisible();
});

for (const theme of ['dark', 'light'] as const) {
  test(`modal palette passes axe with results and no matches (${theme})`, async ({ page }) => {
    await openGallery(page, 'command', theme);
    await page.getByRole('button', { name: 'Відкрити палітру', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Швидкі дії' });
    for (const query of ['', 'нічого не знайдено']) {
      await dialog.getByRole('combobox').fill(query);
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .exclude('[aria-disabled="true"]')
        .analyze();
      expect(
        result.violations.map(
          (violation) =>
            `${violation.id}: ${violation.nodes.map((node) => node.target).join(', ')}`,
        ),
      ).toEqual([]);
    }
  });
}
