import { expect, test } from '@playwright/test';
import { openGallery } from './fixtures';

test.describe('input + field', () => {
  test('label click focuses the input', async ({ page }) => {
    await openGallery(page, 'input');
    await page.getByText('Заповнене', { exact: true }).click();
    await expect(page.getByLabel('Заповнене')).toBeFocused();
  });

  test('errors appear only after leaving the field, and are described', async ({ page }) => {
    await openGallery(page, 'input');
    const email = page.getByRole('textbox', { name: 'Email' }).last();
    await email.focus();
    await expect(email).not.toHaveAttribute('aria-invalid', 'true');
    await page.keyboard.press('Tab'); // leave email -> password
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await expect(email).toHaveAccessibleDescription(/Вкажіть email/);

    await email.fill('olena@vadem.dev');
    await expect(email).not.toHaveAttribute('aria-invalid', 'true');
  });

  test('submit marks all fields and shows errors', async ({ page }) => {
    await openGallery(page, 'input');
    await page.getByRole('button', { name: 'Увійти' }).click();
    await expect(page.getByText('Пароль занадто короткий')).toBeVisible();
    await expect(page.getByText('Перевірте поля з помилками')).toBeVisible();
  });

  test('password reveal toggles type and pressed state', async ({ page }) => {
    await openGallery(page, 'input');
    const password = page.locator('input[formcontrolname=password]');
    const toggle = page.getByRole('button', { name: 'Показати пароль' });
    await password.fill('secret-123');
    await expect(password).toHaveAttribute('type', 'password');
    await toggle.click();
    await expect(password).toHaveAttribute('type', 'text');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  });

  test('clicking the group icon focuses the input', async ({ page }) => {
    await openGallery(page, 'input');
    const group = page
      .locator('vd-input-group')
      .filter({ has: page.locator('input[type=email][value="team@vadem.dev"]') });
    await group.locator('vd-icon').click();
    await expect(group.locator('input')).toBeFocused();
  });

  test('focus ring is drawn on the group, not the inner input', async ({ page }) => {
    await openGallery(page, 'input');
    const group = page.locator('vd-input-group').first();
    await group.locator('input').focus();
    expect(await group.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid');
    expect(await group.locator('input').evaluate((el) => getComputedStyle(el).outlineStyle)).toBe(
      'none',
    );
  });
});
