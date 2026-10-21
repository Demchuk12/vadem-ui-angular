import { expect, test } from '@playwright/test';
import { openGallery } from './fixtures';

test.describe('demo screens', () => {
  test('dashboard exposes exact chart values and labels fixture data honestly', async ({
    page,
  }) => {
    await openGallery(page, 'screens/dashboard');
    const card = page.locator('.dash-chart-card');
    const figure = card.getByRole('figure', { name: 'Запити до API' });
    await expect(figure).toContainText('демо-дані');
    // Every bar is a keyboard stop with its exact value.
    await expect(card.locator('.vd-chart__hit').first()).toHaveAttribute(
      'aria-label',
      'Пн: Запити, тис. 42',
    );
    await card.getByRole('button', { name: 'Data table' }).click();
    const values = card.getByRole('region', { name: 'Запити до API' }).getByRole('table');
    await expect(values.getByRole('row')).toHaveCount(8);
    await expect(values.getByRole('row', { name: 'Пн 42', exact: true })).toBeVisible();
    // Refetch keeps the frame: the open table survives a period change.
    await page.getByRole('radio', { name: 'Місяць', exact: true }).check();
    await expect(figure).not.toHaveAttribute('aria-busy');
    await expect(values.getByRole('row')).toHaveCount(13);
    await expect(values.getByRole('row', { name: '4 55', exact: true })).toBeVisible();
  });
  test('login: wrong password shows an inline alert, valid one opens the dashboard', async ({
    page,
  }) => {
    await openGallery(page, 'screens/login');
    await page.locator('[formcontrolname=email]').fill('olena@vadem.dev');
    await page.locator('[formcontrolname=password]').fill('password');
    await page.getByRole('button', { name: 'Увійти', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('Невірний email або пароль');

    await page.locator('[formcontrolname=password]').fill('correct-horse');
    await page.getByRole('button', { name: 'Увійти', exact: true }).click();
    await expect(page).toHaveURL(/screens\/dashboard/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Доброго ранку');
  });

  test('dashboard: row menu -> rollback confirmation -> toast', async ({ page }) => {
    await openGallery(page, 'screens/dashboard');
    await page.getByRole('button', { name: 'Дії: Платформа оплат, main' }).click();
    await page.getByRole('menuitem', { name: 'Відкотити' }).click();
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Скасувати' })).toBeFocused();
    await dialog.getByRole('button', { name: 'Відкотити' }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText('«Платформа оплат» відкочено')).toBeVisible();
  });

  test('phones: the nav drawer navigates and closes', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openGallery(page, 'screens/dashboard');
    const toggle = page.getByRole('button', { name: 'Навігація', exact: true });
    await toggle.click();
    const drawer = page.getByRole('dialog', { name: 'Навігація' });
    await expect(drawer).toBeVisible();
    await drawer.getByRole('link', { name: 'Налаштування' }).click();
    await expect(page).toHaveURL(/screens\/settings/);
    await expect(drawer).toBeHidden();
    await expect(toggle).toBeFocused();
    // The navigation exists once: the docked copy is not rendered on phones.
    await expect(page.getByRole('navigation', { name: 'Основна навігація' })).toHaveCount(0);
  });

  test('desktop: the sidebar collapses to a rail and keeps link names', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await openGallery(page, 'screens/dashboard');
    const nav = page.getByRole('navigation', { name: 'Основна навігація' });
    const toggle = page.getByRole('button', { name: 'Навігація', exact: true });
    await expect(nav.getByRole('link', { name: 'Огляд' })).toHaveAttribute('aria-current', 'page');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByText('Квота оновиться 1 листопада.')).toBeHidden();
    await expect(nav.getByRole('link', { name: 'Налаштування' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Акаунт: Олена Коваленко' })).toBeVisible();
  });

  test('settings: save is enabled only with changes; saving shows a toast', async ({ page }) => {
    await openGallery(page, 'screens/settings');
    const save = page.getByRole('button', { name: 'Зберегти зміни' });
    await expect(save).toBeDisabled();
    await page.locator('[formcontrolname=role]').fill('Головна дизайнерка');
    await expect(page.getByText('Незбережені зміни')).toBeVisible();
    await save.click();
    await expect(page.getByText('Профіль збережено')).toBeVisible();
    await expect(save).toBeDisabled();
  });
});
