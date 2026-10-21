import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { Page } from '@playwright/test';
import { openGallery } from './fixtures';

/** Playwright can't `press` Cyrillic keys; real layouts send keydown with key="л". */
async function typeKey(page: Page, key: string) {
  await page.evaluate((k) => {
    document.activeElement?.dispatchEvent(
      new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }),
    );
  }, key);
}

test.describe('select', () => {
  test('keyboard: open, move, typeahead, choose; focus stays on the trigger', async ({ page }) => {
    await openGallery(page, 'select');
    const select = page.getByRole('combobox', { name: 'Місто' });
    await select.focus();
    await page.keyboard.press('ArrowDown');
    await expect(select).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('listbox')).toBeVisible();
    await typeKey(page, 'л');
    await expect(page.locator('[role=option][data-active]')).toHaveText('Львів');
    await page.keyboard.press('Enter');
    await expect(select).toHaveAttribute('aria-expanded', 'false');
    await expect(select).toContainText('Львів');
    await expect(select).toBeFocused();
    await expect(page.getByText('city: lviv')).toBeVisible();
  });

  test('mouse: click opens, option click chooses, outside click dismisses', async ({ page }) => {
    await openGallery(page, 'select');
    const select = page.getByRole('combobox', { name: 'Роль' });
    await select.click();
    await page.getByRole('option', { name: 'Адміністратор' }).click();
    await expect(select).toContainText('Адміністратор');
    await select.click();
    await expect(page.getByRole('listbox')).toBeVisible();
    await select.click();
    await expect(page.getByRole('listbox')).toBeHidden();
    await select.click();
    // The outside click must land after the popup is open, or it dismisses nothing.
    await expect(page.getByRole('listbox')).toBeVisible();
    await page.mouse.click(5, 300);
    await expect(page.getByRole('listbox')).toBeHidden();
    await expect(select).toHaveAttribute('aria-expanded', 'false');
  });

  test('Escape closes without changing the value', async ({ page }) => {
    await openGallery(page, 'select');
    const select = page.getByRole('combobox', { name: 'Роль' });
    await select.focus();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('listbox')).toBeHidden();
    await expect(select).toContainText('Учасник');
  });

  test('required error appears after leaving the field', async ({ page }) => {
    await openGallery(page, 'select');
    await page.getByRole('combobox', { name: 'Місто' }).focus();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('combobox', { name: 'Місто' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    await expect(page.getByText('Оберіть місто').last()).toBeVisible();
  });

  test('combobox filters and picks with arrows', async ({ page }) => {
    await openGallery(page, 'select');
    const input = page.getByRole('combobox', { name: 'Населений пункт' });
    await input.fill('кам под');
    await expect(page.getByRole('listbox').getByRole('option')).toHaveCount(1);
    await page.keyboard.press('Enter');
    await expect(input).toHaveValue('Кам’янець-Подільський');
    await input.fill('zzz');
    await expect(page.getByText('Нічого не знайдено')).toBeVisible();
    await input.blur();
    await expect(input).toHaveValue('Кам’янець-Подільський');
  });

  test('a long value truncates instead of widening its container', async ({ page }) => {
    await openGallery(page, 'select');
    const panel = page.locator('.demo-panel', { hasText: 'Тарифний план' });
    const fits = await panel.evaluate((el) => el.scrollWidth <= el.clientWidth);
    expect(fits).toBe(true);
  });

  test('axe with the listbox open', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openGallery(page, 'select');
    await page.getByRole('combobox', { name: 'Місто' }).click();
    await expect(page.getByRole('listbox')).toBeVisible();
    await page.waitForTimeout(300);
    const results = await new AxeBuilder({ page })
      .include('vd-select')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});

test.describe('menu', () => {
  test('keyboard: open on first, loop, typeahead, Escape returns focus', async ({ page }) => {
    await openGallery(page, 'menu');
    const trigger = page.getByRole('button', { name: 'Дії з проєктом' });
    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    const menu = page.getByRole('menu', { name: 'Дії з проєктом' });
    await expect(menu).toBeVisible();
    await expect(menu.getByRole('menuitem', { name: /Редагувати/ })).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await expect(menu.getByRole('menuitem', { name: /Видалити/ })).toBeFocused();
    await typeKey(page, 'д');
    await expect(menu.getByRole('menuitem', { name: /Дублювати/ })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('activating an item runs it and closes', async ({ page }) => {
    await openGallery(page, 'menu');
    await page.getByRole('button', { name: 'Дії з проєктом' }).click();
    await page.getByRole('menuitem', { name: /Дублювати/ }).click();
    await expect(page.getByRole('menu')).toBeHidden();
    await expect(page.getByText('Скопійовано')).toBeVisible();
  });

  test('disabled items are skipped and do nothing', async ({ page }) => {
    await openGallery(page, 'menu');
    await page.getByRole('button', { name: 'Дії з проєктом' }).focus();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('menuitem', { name: /Видалити/ })).toBeFocused();
  });

  test('axe with the menu open', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openGallery(page, 'menu');
    await page.getByRole('button', { name: 'Дії з проєктом' }).click();
    await page.waitForTimeout(300);
    const results = await new AxeBuilder({ page })
      .include('[role=menu]')
      .exclude('[aria-disabled="true"]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(
      results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`),
    ).toEqual([]);
  });
});
