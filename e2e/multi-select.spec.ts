import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { openGallery } from './fixtures';

test('keyboard toggles multiple values without closing or changing selection on Tab', async ({
  page,
}) => {
  await openGallery(page, 'multi-select');
  const input = page.getByRole('combobox', { name: 'Міста', exact: true });
  const control = page.locator('vd-multi-select').first();
  await input.focus();
  await input.press('ArrowDown');
  const list = page.getByRole('listbox');
  await expect(list).toHaveAttribute('aria-multiselectable', 'true');
  await input.press('ArrowDown');
  await input.press('ArrowDown');
  await expect(list.locator('[data-active]')).toHaveText('Луцьк');
  await input.press('Enter');
  await expect(control.getByRole('button', { name: 'Видалити Луцьк' })).toBeVisible();
  await expect(input).toBeFocused();
  await expect(list).toBeVisible();
  await input.press('ArrowDown');
  await expect(list.locator('[data-active]')).toHaveText('Кам’янець-Подільський');
  await input.press('Tab');
  await expect(list).toBeHidden();
  await expect(control.getByRole('button', { name: /Видалити/ })).toHaveCount(3);
  await expect(page.getByRole('button', { name: 'Перевірити', exact: true })).toBeFocused();
});

test('pointer toggles, search matches apostrophes, no matches clears active descendant', async ({
  page,
}) => {
  await openGallery(page, 'multi-select');
  const input = page.getByRole('combobox', { name: 'Міста', exact: true });
  await input.click();
  await page.getByRole('option', { name: 'Луцьк', exact: true }).click();
  await expect(input).toBeFocused();
  await expect(page.getByRole('listbox')).toBeVisible();
  await input.fill("кам'ян под");
  await expect(page.getByRole('listbox').getByRole('option')).toHaveCount(1);
  await input.press('Enter');
  await expect(page.getByRole('listbox').getByRole('option')).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await input.fill('zzzz');
  await expect(input).not.toHaveAttribute('aria-activedescendant');
  await expect(page.getByText('Міст не знайдено')).toBeVisible();
  await input.press('Escape');
  await expect(input).toHaveValue('');
  await expect(input).toBeFocused();
  await expect(page.getByRole('button', { name: 'Видалити Кам’янець-Подільський' })).toBeVisible();
});

test('removal keeps focus, Backspace respects query, reset and validation work', async ({
  page,
}) => {
  await openGallery(page, 'multi-select');
  const input = page.getByRole('combobox', { name: 'Міста', exact: true });
  await page.getByRole('button', { name: 'Видалити Київ', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(input).toBeFocused();
  await expect(page.getByRole('button', { name: 'Видалити Київ', exact: true })).toHaveCount(0);
  await input.fill('л');
  await input.press('Backspace');
  await expect(page.getByRole('button', { name: 'Видалити Львів', exact: true })).toBeVisible();
  await input.press('Backspace');
  await expect(page.getByRole('button', { name: 'Видалити Львів', exact: true })).toHaveCount(0);
  // Multi-select stays open after selection; dismiss it before using form actions.
  await input.press('Escape');
  await page.getByRole('button', { name: 'Перевірити', exact: true }).click();
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByText('Оберіть хоча б одне місто')).toBeVisible();
  await input.fill('ки');
  await input.press('Enter');
  await expect(input).not.toHaveAttribute('aria-invalid');
  await input.press('Escape');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await page.getByRole('button', { name: 'Скинути', exact: true }).click();
  await expect(
    page.locator('vd-multi-select').first().locator('.vd-multi-select__chip'),
  ).toHaveCount(0);
});

test('disabled values cannot be toggled and outside press dismisses', async ({ page }) => {
  await openGallery(page, 'multi-select');
  await expect(page.getByRole('combobox', { name: 'Недоступний вибір' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Видалити Безпека' })).toBeDisabled();
  const input = page.getByRole('combobox', { name: 'Міста', exact: true });
  await input.click();
  const disabled = page.getByRole('option', { name: /Дніпро/ });
  await disabled.click({ force: true });
  await expect(disabled).toHaveAttribute('aria-selected', 'false');
  await page.mouse.click(5, 300);
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('listbox')).toBeHidden();
});

test('Signal Forms value and touch state synchronize with the control', async ({ page }) => {
  await openGallery(page, 'multi-select');
  const input = page.getByRole('combobox', { name: 'Канали', exact: true });
  await page.getByRole('button', { name: 'Видалити Email', exact: true }).click();
  await input.press('Tab');
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await input.fill('email');
  await input.press('Enter');
  await expect(page.getByRole('button', { name: 'Видалити Email', exact: true })).toBeVisible();
  await expect(input).not.toHaveAttribute('aria-invalid');
});

for (const theme of ['dark', 'light'] as const) {
  test(`axe, focus and hover screenshots (${theme})`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openGallery(page, 'multi-select', theme);
    const input = page.getByRole('combobox', { name: 'Міста', exact: true });
    await input.focus();
    await input.press('ArrowDown');
    await page.getByRole('option', { name: 'Луцьк', exact: true }).hover();
    await expect(page.locator('[role=option][data-active]')).toHaveText('Луцьк');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .exclude('[aria-disabled="true"]')
      .analyze();
    expect(
      results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`),
    ).toEqual([]);
    await page.screenshot({ path: `screenshots/multi-select-${theme}-open.png`, fullPage: true });
    const field = page.locator('.vd-multi-select__field').first();
    await field.screenshot({ path: `screenshots/multi-select-${theme}-focus.png` });
    await input.press('Escape');
    const remove = page.getByRole('button', { name: 'Видалити Київ', exact: true });
    await remove.focus();
    await expect(remove).toBeFocused();
    await field.screenshot({ path: `screenshots/multi-select-${theme}-remove-focus.png` });
    await remove.hover();
    await field.screenshot({ path: `screenshots/multi-select-${theme}-hover.png` });
  });
}

test('RTL and long labels fit at 320px, text zoom and forced colors remain usable', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
  await openGallery(page, 'multi-select', 'light', 'rtl');
  await page.addStyleTag({ content: 'html { font-size: 200%; }' });
  const control = page
    .locator('vd-multi-select')
    .filter({ has: page.getByRole('combobox', { name: 'الفرق' }) });
  const input = control.getByRole('combobox');
  await input.focus();
  await input.press('ArrowDown');
  await input.press('Enter');
  await expect(page.getByRole('listbox')).toBeVisible();
  await input.press('Escape');
  const overflow = await page
    .locator('vd-multi-select')
    .evaluateAll((controls) =>
      controls.some((control) => control.scrollWidth > control.clientWidth),
    );
  expect(overflow).toBe(false);
  await page.screenshot({
    path: 'screenshots/multi-select-320-rtl-forced-colors.png',
    fullPage: true,
  });
});
