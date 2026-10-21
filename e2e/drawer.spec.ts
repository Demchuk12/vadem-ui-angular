import { expect, test } from '@playwright/test';
import { openGallery } from './fixtures';

test.describe('drawer (dialog placement)', () => {
  test.use({ reducedMotion: 'reduce' });

  for (const dir of ['ltr', 'rtl'] as const) {
    test(`placement="end" sticks to the inline end, full height (${dir})`, async ({ page }) => {
      await openGallery(page, 'dialog', 'dark', dir);
      const trigger = page.getByRole('button', { name: 'Деталі розгортання' });
      await trigger.click();
      const drawer = page.getByRole('dialog', { name: /dpl_8f2a/ });
      await expect(drawer).toBeVisible();
      // Settled at its edge (transition off under reduced motion is not guaranteed, so poll).
      const viewport = page.viewportSize()!;
      await expect
        .poll(async () => {
          const box = (await drawer.boundingBox())!;
          return dir === 'ltr' ? Math.round(box.x + box.width) : Math.round(box.x);
        })
        .toBe(dir === 'ltr' ? viewport.width : 0);
      const box = (await drawer.boundingBox())!;
      expect(Math.round(box.height)).toBe(viewport.height);

      await page.keyboard.press('Escape');
      await expect(drawer).toBeHidden();
      await expect(trigger).toBeFocused();
    });
  }

  test('a form with method="dialog" closes it with the submit value', async ({ page }) => {
    await openGallery(page, 'dialog');
    await page.getByRole('button', { name: 'Фільтри (start)' }).click();
    await page.getByRole('button', { name: 'Застосувати' }).click();
    await expect(page.getByText('Фільтри: applied')).toBeVisible();
  });

  test('dashboard row menu opens the details drawer', async ({ page }) => {
    await openGallery(page, 'screens/dashboard');
    await page.getByRole('button', { name: 'Дії: Платформа оплат, main' }).click();
    await page.getByRole('menuitem', { name: 'Деталі й логи' }).click();
    const drawer = page.getByRole('dialog', { name: 'Платформа оплат' });
    await expect(drawer).toBeVisible();
    await drawer.getByRole('button', { name: 'Розгорнути повторно' }).click();
    await expect(drawer).toBeHidden();
    await expect(page.getByText('Розгортання запущено')).toBeVisible();
  });
});
