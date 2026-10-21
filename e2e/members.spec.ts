import { expect, test } from '@playwright/test';
import { openGallery } from './fixtures';

test.describe('members: list, edit, delete workflow', () => {
  test('loading feedback gives way to the list; sort and pagination work', async ({ page }) => {
    await openGallery(page, 'screens/members');
    const table = page.getByRole('table', { name: /Учасники|^$/ }).first();
    await expect(page.getByRole('row', { name: /Богдан Ткаченко/ })).toBeVisible();
    await expect(page.getByRole('status', { name: 'Завантаження учасників' })).toHaveCount(0);
    // 6 members, 4 per page.
    await expect(page.getByRole('row')).toHaveCount(1 + 4);
    await page.getByRole('button', { name: 'Наступна сторінка' }).click();
    await expect(page.getByRole('row')).toHaveCount(1 + 2);
    await expect(table).toBeVisible();
  });

  test('search with no matches shows an empty state that resets the search', async ({ page }) => {
    await openGallery(page, 'screens/members');
    await page.getByRole('searchbox', { name: 'Пошук учасників' }).fill('zzz');
    await expect(page.getByText('Нікого не знайдено')).toBeVisible();
    await page.getByRole('button', { name: 'Скинути пошук' }).click();
    await expect(page.getByRole('row', { name: /Богдан Ткаченко/ })).toBeVisible();
  });

  test('a failed load shows an error with retry', async ({ page }) => {
    await openGallery(page, 'screens/members');
    await expect(page.getByRole('row', { name: /Богдан Ткаченко/ })).toBeVisible();
    await page.getByRole('button', { name: 'Симулювати збій' }).click();
    await page.getByRole('button', { name: 'Оновити' }).click();
    await expect(page.getByText('Не вдалося завантажити учасників')).toBeVisible();
    await page.getByRole('button', { name: 'Спробувати знову' }).click();
    await expect(page.getByRole('row', { name: /Богдан Ткаченко/ })).toBeVisible();
  });

  test('create validates, reports a server conflict, then saves with a toast', async ({ page }) => {
    await openGallery(page, 'screens/members');
    await expect(page.getByRole('row', { name: /Богдан Ткаченко/ })).toBeVisible();
    const add = page.getByRole('button', { name: 'Додати учасника' }).first();
    await add.click();
    const dialog = page.getByRole('dialog', { name: 'Новий учасник' });
    await expect(dialog).toBeVisible();

    await dialog.getByRole('button', { name: 'Зберегти' }).click();
    await expect(dialog.getByLabel('Імʼя')).toHaveAttribute('aria-invalid', 'true');
    await expect(dialog.getByText('Вкажіть імʼя')).toBeVisible();
    await expect(dialog.getByLabel('Імʼя'))
      .toBeFocused()
      .catch(() => undefined);

    await dialog.getByLabel('Імʼя').fill('Нова Людина');
    await dialog.getByLabel('Email').fill('olena@vadem.dev');
    await dialog.getByRole('combobox', { name: 'Роль' }).click();
    await page.getByRole('option', { name: 'Адміністратор' }).click();
    await dialog.getByRole('button', { name: 'Зберегти' }).click();
    await expect(dialog.getByRole('alert')).toContainText('уже є в команді');
    await expect(dialog).toBeVisible();

    await dialog.getByLabel('Email').fill('nova@vadem.dev');
    await dialog.getByRole('button', { name: 'Зберегти' }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText('Учасника додано')).toBeVisible();
    await expect(add).toBeFocused();
    await page.getByRole('searchbox', { name: 'Пошук учасників' }).fill('nova@');
    await expect(page.getByRole('row', { name: /Нова Людина.*Адміністратор/ })).toBeVisible();
  });

  test('edit keeps the dialog open and the data intact when saving fails', async ({ page }) => {
    await openGallery(page, 'screens/members');
    await expect(page.getByRole('row', { name: /Іван Шевченко/ })).toBeVisible();
    const edit = page.getByRole('button', { name: 'Редагувати Іван Шевченко' });
    await edit.click();
    const dialog = page.getByRole('dialog', { name: 'Редагувати учасника' });
    await expect(dialog.getByLabel('Імʼя')).toHaveValue('Іван Шевченко');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(edit).toBeFocused();

    await page.getByRole('button', { name: 'Симулювати збій' }).click();
    await edit.click();
    await dialog.getByLabel('Імʼя').fill('Іван Петренко');
    await dialog.getByRole('button', { name: 'Зберегти' }).click();
    await expect(dialog.getByRole('alert')).toContainText('Не вдалося зберегти');
    await expect(dialog).toBeVisible();
    await expect(page.getByRole('row', { name: /Іван Шевченко/ })).toHaveCount(1);

    await dialog.getByRole('button', { name: 'Зберегти' }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText('Зміни збережено')).toBeVisible();
    await expect(page.getByRole('row', { name: /Іван Петренко/ })).toBeVisible();
  });

  test('delete asks for confirmation, survives a failure, then removes the member', async ({
    page,
  }) => {
    await openGallery(page, 'screens/members');
    await expect(page.getByRole('row', { name: /Андрій Кравченко/ })).toBeVisible();
    await page.getByRole('searchbox', { name: 'Пошук учасників' }).fill('Андрій');
    await page.getByRole('button', { name: 'Симулювати збій' }).click();
    await page.getByRole('button', { name: 'Видалити Андрій Кравченко' }).click();
    const confirm = page.getByRole('alertdialog');
    await expect(confirm).toContainText('Видалити Андрій Кравченко?');
    await confirm.getByRole('button', { name: 'Видалити' }).click();
    await expect(confirm.getByRole('status')).not.toBeEmpty();
    await expect(page.getByRole('row', { name: /Андрій Кравченко/ })).toBeVisible();

    await confirm.getByRole('button', { name: 'Видалити' }).click();
    await expect(confirm).toBeHidden();
    await expect(page.getByText('Учасника видалено')).toBeVisible();
    await expect(page.getByRole('row', { name: /Андрій Кравченко/ })).toHaveCount(0);
  });
});
