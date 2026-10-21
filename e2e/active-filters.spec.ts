import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { openGallery } from './fixtures';

test('keyboard removal focuses next/previous, and clearing retains stable empty-group focus', async ({
  page,
}) => {
  await openGallery(page, 'active-filters');
  const root = page.getByTestId('main-filters');
  await root.locator('[data-filter-id=client]').focus();
  await page.keyboard.press('Enter');
  await expect(root.locator('[data-filter-id=client]')).toHaveCount(0);
  await expect(root.locator('[data-filter-id=owner]')).toBeFocused();
  await page.keyboard.press('Space');
  await expect(root.locator('[data-filter-id=status]')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(root.getByRole('button', { name: 'Очистити всі', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(root).toBeFocused();
  await expect(root).toContainText('Фільтри не застосовано.');
  await expect(root.getByRole('button')).toHaveCount(0);
});
test('unaccepted requests keep controls/focus and external state does not steal outside focus', async ({
  page,
}) => {
  await openGallery(page, 'active-filters');
  const root = page.getByTestId('request-filters');
  const remove = root.locator('[data-filter-id=status]');
  await remove.focus();
  await remove.press('Enter');
  await remove.press('Space');
  await expect(remove).toBeFocused();
  await expect(page.getByTestId('request-count')).toHaveText('Отримано запитів: 2');
  await expect(root.getByRole('button')).toHaveCount(2);
  const outside = page.getByLabel('Нотатка поза фільтрами', { exact: true });
  await outside.focus();
  await page
    .getByRole('button', { name: 'Прибрати першу умову ззовні', exact: true })
    .evaluate((el: HTMLButtonElement) => el.click());
  await expect(outside).toBeFocused();
  await expect(page.getByTestId('main-filters').locator('[data-filter-id=status]')).toHaveCount(0);
});
test('external removal and disable recover only owned focus; invalid and empty have no actions', async ({
  page,
}) => {
  await openGallery(page, 'active-filters');
  const root = page.getByTestId('main-filters');
  await root.locator('[data-filter-id=status]').focus();
  await page
    .getByRole('button', { name: 'Прибрати першу умову ззовні', exact: true })
    .evaluate((el: HTMLButtonElement) => el.click());
  await expect(root.locator('[data-filter-id=client]')).toBeFocused();
  await page
    .getByRole('button', { name: 'Відновити фільтри', exact: true })
    .evaluate((el: HTMLButtonElement) => el.click());
  await expect(root.locator('[data-filter-id=client]')).toBeFocused();
  await page
    .getByRole('button', { name: 'Заблокувати зміни', exact: true })
    .evaluate((el: HTMLButtonElement) => el.click());
  await expect(root).toBeFocused();
  await expect(root.locator('button:disabled')).toHaveCount(4);
  await expect(page.getByTestId('invalid-filters').getByRole('button')).toHaveCount(0);
  await expect(page.getByTestId('empty-filters').getByRole('button')).toHaveCount(0);
});
test('table removal updates only its condition, preserves selection and returns final focus to search', async ({
  page,
}) => {
  await openGallery(page, 'table');
  const search = page.getByRole('searchbox');
  await search.fill('Іскра');
  const status = page.getByRole('combobox', { name: 'Статус рахунку' });
  await status.click();
  await page.getByRole('option', { name: 'Очікує', exact: true }).click();
  const root = page.getByRole('group', { name: 'Застосовані фільтри рахунків' });
  await expect(root.locator('[data-filter-id]')).toHaveCount(2);
  await root.locator('[data-filter-id=query]').focus();
  await page.keyboard.press('Enter');
  await expect(search).toHaveValue('');
  await expect(status).toContainText('Очікує');
  await expect(root.locator('[data-filter-id=status]')).toBeFocused();
  await page.keyboard.press('Space');
  await expect(root).toHaveCount(0);
  await expect(search).toBeFocused();
  await expect(page.getByText('Знайдено: 6 з 6')).toBeVisible();
  await expect(page.getByText('1–4 з 6')).toBeVisible();
  await expect(page.getByText('Вибрано: 1')).toBeVisible();
  await search.fill('Іскра');
  await root.getByRole('button', { name: 'Очистити всі', exact: true }).click();
  await expect(search).toBeFocused();
  await expect(search).toHaveValue('');
});
for (const theme of ['dark', 'light'] as const)
  for (const dir of ['ltr', 'rtl']) {
    test(`wrapped labels, RTL, keyboard focus and axe at 320px/200% (${theme},${dir})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 320, height: 1100 });
      await openGallery(page, 'active-filters', theme, dir);
      await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
            .analyze()
        ).violations,
      ).toEqual([]);
      const root = page.getByTestId(dir === 'rtl' ? 'rtl-filters' : 'long-filters');
      const button = root.locator('[data-filter-id]').first();
      await button.focus();
      await button.press('Enter');
      await expect(root.locator('[data-filter-id]')).toHaveCount(dir === 'rtl' ? 1 : 0);
      await expect(dir === 'rtl' ? root.locator('[data-filter-id]').first() : root).toBeFocused();
      await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
      const action = page.getByTestId('request-filters').locator('[data-filter-id]').first();
      await action.focus();
      expect(await action.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid');
      expect(
        await action.evaluate((el) =>
          getComputedStyle(el)
            .transitionDuration.split(',')
            .every((value) => parseFloat(value) === 0),
        ),
      ).toBe(true);
    });
  }
