import { expect, test } from '@playwright/test';
import { openGallery } from './fixtures';

test.describe('toast', () => {
  test('appears in a polite live region inside a named landmark and can be closed', async ({
    page,
  }) => {
    await openGallery(page, 'toast');
    await page.getByRole('button', { name: 'Успіх' }).click();
    const region = page.getByRole('region', { name: 'Сповіщення' });
    const toast = region.getByRole('listitem').filter({ hasText: 'Зміни збережено' });
    await expect(toast).toBeVisible();
    await expect(region.locator('ol')).toHaveAttribute('aria-live', 'polite');
    await toast.getByRole('button', { name: 'Закрити' }).click();
    await expect(toast).toBeHidden();
  });

  test('errors are alerts', async ({ page }) => {
    await openGallery(page, 'toast');
    await page.getByRole('button', { name: 'Помилка' }).click();
    await expect(page.getByRole('alert')).toContainText('Не вдалося розгорнути');
  });

  test('action runs and dismisses', async ({ page }) => {
    await openGallery(page, 'toast');
    await page.getByRole('button', { name: 'Видалити файл' }).click();
    await page
      .getByRole('region', { name: 'Сповіщення' })
      .getByRole('button', { name: 'Скасувати' })
      .click();
    await expect(page.getByText('Файл відновлено')).toBeVisible();
    await expect(page.getByText(/звіт-жовтень\.csv/)).toBeHidden();
  });

  test('shows at most three', async ({ page }) => {
    await openGallery(page, 'toast');
    await page.getByRole('button', { name: 'Чотири поспіль' }).click();
    await expect(page.getByText('Четвертий тост')).toBeVisible();
    await expect(page.getByText('Перший тост')).toBeHidden();
    await expect(page.locator('.vd-toast[data-state=open]')).toHaveCount(3);
  });

  test('timer pauses while hovered', async ({ page }) => {
    await page.clock.install();
    await openGallery(page, 'toast');
    await page.getByRole('button', { name: 'Нейтральний' }).click();
    const toast = page.locator('.vd-toast').filter({ hasText: 'Посилання скопійовано' });
    await expect(toast).toBeVisible();
    await toast.hover();
    await page.clock.runFor(8000);
    await expect(toast).toHaveAttribute('data-state', 'open');
    await page.mouse.move(0, 0);
    await page.clock.runFor(6000);
    await expect(toast).toBeHidden();
  });
});
