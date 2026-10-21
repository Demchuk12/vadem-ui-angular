import { expect, test } from '@playwright/test';
import { openGallery } from './fixtures';

test.describe('tabs', () => {
  test('arrow keys move and select, skipping disabled; Home/End', async ({ page }) => {
    await openGallery(page, 'tabs');
    const list = page.getByRole('tablist', { name: 'Розділи проєкту' });
    await list.getByRole('tab', { name: /Розгортання/ }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(list.getByRole('tab', { name: 'Логи' })).toBeFocused();
    await expect(list.getByRole('tab', { name: 'Логи' })).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('ArrowRight'); // skips disabled "Оплата"
    await expect(list.getByRole('tab', { name: 'Налаштування' })).toBeFocused();
    await page.keyboard.press('Home');
    await expect(list.getByRole('tab', { name: 'Огляд' })).toBeFocused();
    await expect(page.getByRole('tabpanel', { name: 'Огляд' })).toBeVisible();
  });

  test('tab key goes from the selected tab into the panel', async ({ page }) => {
    await openGallery(page, 'tabs');
    await page.getByRole('tab', { name: /Розгортання/ }).focus();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('tabpanel', { name: /Розгортання/ })).toBeFocused();
  });

  test('manual activation: arrows focus, Enter selects', async ({ page }) => {
    await openGallery(page, 'tabs');
    const list = page.getByRole('tablist', { name: 'Налаштування акаунта' });
    await list.getByRole('tab', { name: 'Загальні' }).focus();
    await page.keyboard.press('ArrowDown');
    const security = list.getByRole('tab', { name: 'Безпека' });
    await expect(security).toBeFocused();
    await expect(security).toHaveAttribute('aria-selected', 'false');
    await page.keyboard.press('Enter');
    await expect(security).toHaveAttribute('aria-selected', 'true');
  });

  test('RTL: ArrowLeft moves forward', async ({ page }) => {
    await openGallery(page, 'tabs');
    const list = page.getByRole('tablist', { name: 'الأقسام' });
    await list.getByRole('tab').first().focus();
    await page.keyboard.press('ArrowLeft');
    await expect(list.getByRole('tab').nth(1)).toBeFocused();
  });
});
