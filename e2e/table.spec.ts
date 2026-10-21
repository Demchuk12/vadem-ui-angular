import { expect, test } from '@playwright/test';
import { openGallery } from './fixtures';

test.describe('table', () => {
  test('sort buttons work from the keyboard and set aria-sort on one column', async ({ page }) => {
    await openGallery(page, 'table');
    const client = page.getByRole('columnheader', { name: 'Клієнт' });
    const due = page.getByRole('columnheader', { name: 'Термін' });
    await expect(due).toHaveAttribute('aria-sort', 'descending');

    await client.getByRole('button').focus();
    await page.keyboard.press('Enter');
    await expect(client).toHaveAttribute('aria-sort', 'ascending');
    await expect(due).not.toHaveAttribute('aria-sort');
    // Collator order for Ukrainian: А, Б, Є, І, Р, Я.
    const firstColumn = page.locator('table').first().locator('tbody th[scope=row]');
    // Page 1 of 2 (4 per page).
    await expect(firstColumn).toHaveText([
      'Атлас Логістик',
      'Бджілка',
      'Єдиний Простір',
      'Іскра Медіа',
    ]);
    await page.keyboard.press('Space');
    await expect(client).toHaveAttribute('aria-sort', 'descending');
    await expect(firstColumn.first()).toHaveText('Ярмарок Онлайн');
  });

  test('select all is mixed, then full; filtering shows the empty state', async ({ page }) => {
    await openGallery(page, 'table');
    const all = page.getByRole('checkbox', { name: 'Вибрати всі видимі рахунки' });
    expect(await all.evaluate((el: HTMLInputElement) => el.indeterminate)).toBe(true);
    // Select all = the visible page (4 rows).
    await all.click();
    await expect(page.getByText('Вибрано: 4')).toBeVisible();
    await expect(page.locator('tr[data-selected]')).toHaveCount(4);

    await page.getByRole('searchbox', { name: 'Фільтр рахунків' }).fill('zzz');
    await expect(page.getByText('Нічого не знайдено')).toBeVisible();
    await expect(all).toBeDisabled();
    await page.getByRole('button', { name: 'Показати всі рахунки' }).click();
    await expect(page.locator('tbody th[scope=row]').first()).toBeVisible();
  });

  test('pagination pages the rows and keeps focus on the edge step', async ({ page }) => {
    await openGallery(page, 'table');
    const nav = page.getByRole('navigation', { name: 'Сторінки рахунків' });
    await expect(nav.getByRole('button', { name: 'Сторінка 1' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    const next = nav.getByRole('button', { name: 'Наступна сторінка' });
    await next.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText('5–6 з 6')).toBeVisible();
    await expect(next).toHaveAttribute('aria-disabled', 'true');
    await expect(next).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByText('5–6 з 6')).toBeVisible();
  });

  test('the scroll region is focusable and scrolls with the keyboard', async ({ page }) => {
    await openGallery(page, 'table');
    const region = page.getByRole('region', { name: 'Журнал подій' });
    await region.focus();
    await page.keyboard.press('PageDown');
    await expect.poll(() => region.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  });
});

test('data table column visibility updates headers, rows and empty colspan', async ({ page }) => {
  await openGallery(page, 'table');
  const trigger = page.getByRole('button', { name: 'Колонки', exact: true });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const chooser = page.getByRole('dialog', { name: 'Видимість колонок' });
  await expect(chooser.getByRole('checkbox', { name: 'Клієнт', exact: true })).toBeDisabled();
  const owner = chooser.getByRole('checkbox', { name: 'Відповідальний' });
  await owner.focus();
  await page.keyboard.press('Space');
  const table = page.locator('table').first();
  await expect(table.getByRole('columnheader', { name: 'Відповідальний' })).toHaveCount(0);
  await expect(table.locator('tbody [vdTableColumn=owner]')).toHaveCount(4);
  await expect(table.locator('tbody [vdTableColumn=owner]').first()).toBeHidden();
  await expect(table.getByRole('columnheader', { name: 'Термін' })).toHaveAttribute(
    'aria-colindex',
    '5',
  );
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await page.getByRole('searchbox').fill('zzz');
  await expect(table.locator('[vdTableEmpty]')).toHaveAttribute('colspan', '6');
  await trigger.click();
  await chooser.getByRole('button', { name: 'Показати всі' }).click();
  await expect(table.locator('[vdTableEmpty]')).toHaveAttribute('colspan', '7');
});

test('data table selection survives a page change and deselects only the current page', async ({
  page,
}) => {
  await openGallery(page, 'table');
  const all = page.getByRole('checkbox', { name: 'Вибрати всі видимі рахунки' });
  await all.check();
  await page.getByRole('button', { name: 'Наступна сторінка' }).click();
  await expect(page.getByText('5–6 з 6')).toBeVisible();
  await expect(all).not.toBeChecked();
  await all.check();
  await expect(page.getByText('Вибрано: 6')).toBeVisible();
  await all.uncheck();
  await expect(page.getByText('Вибрано: 4')).toBeVisible();
  await page.getByRole('button', { name: 'Попередня сторінка' }).click();
  await expect(all).toBeChecked();
});

for (const theme of ['dark', 'light'] as const) {
  test(`column chooser fits enlarged text at 320px (${theme})`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await openGallery(page, 'table', theme, 'rtl');
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%';
    });
    await page.getByRole('button', { name: 'Колонки', exact: true }).click();
    const chooser = page.getByRole('dialog', { name: 'Видимість колонок' });
    const bounds = await chooser.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.y).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(900);
    const amount = chooser.getByRole('checkbox', { name: 'Сума, ₴' });
    await amount.scrollIntoViewIfNeeded();
    await amount.uncheck();
    await expect(
      page.locator('table').first().getByRole('columnheader', { name: 'Сума, ₴' }),
    ).toHaveCount(0);
  });
}

test('status filter combines search, resets paging and preserves selection and columns', async ({
  page,
}) => {
  await openGallery(page, 'table');
  await page.getByRole('button', { name: 'Колонки', exact: true }).click();
  await page
    .getByRole('dialog', { name: 'Видимість колонок' })
    .getByRole('checkbox', { name: 'Відповідальний' })
    .uncheck();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Наступна сторінка' }).click();
  const status = page.getByRole('combobox', { name: 'Статус рахунку' });
  await status.focus();
  await page.keyboard.press('Enter');
  await page.getByRole('option', { name: 'Оплачено', exact: true }).click();
  await expect(page.getByText('Знайдено: 2 з 6')).toBeVisible();
  await expect(page.locator('table').first().locator('tbody tr')).toHaveCount(2);
  await expect(page.getByText('Вибрано: 1')).toBeVisible();
  await page.getByRole('searchbox').fill('Бджілка');
  await expect(page.getByText('Знайдено: 1 з 6')).toBeVisible();
  await page.getByRole('searchbox').fill('Іскра');
  await expect(page.getByText('Нічого не знайдено')).toBeVisible();
  await page.getByRole('button', { name: 'Скинути фільтри', exact: true }).click();
  await expect(status).toContainText('Усі статуси');
  await expect(
    page.locator('table').first().getByRole('columnheader', { name: 'Відповідальний' }),
  ).toHaveCount(0);
  await expect(page.getByRole('searchbox')).toHaveValue('');
  await expect(page.getByText('Знайдено: 6 з 6')).toBeVisible();
  await expect(page.getByText('1–4 з 6')).toBeVisible();
  await expect(page.locator('tr[data-selected]')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Скинути фільтри', exact: true })).toBeDisabled();
});
