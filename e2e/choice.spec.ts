import { expect, test } from '@playwright/test';
import { openGallery } from './fixtures';

test.describe('checkbox + switch', () => {
  test('space toggles a checkbox; label click toggles too', async ({ page }) => {
    await openGallery(page, 'choice');
    const box = page.getByRole('checkbox', { name: 'Не вибрано' });
    await box.focus();
    await page.keyboard.press('Space');
    await expect(box).toBeChecked();
    await page.getByText('Не вибрано').click();
    await expect(box).not.toBeChecked();
  });

  test('select all reflects mixed state and toggles children', async ({ page }) => {
    await openGallery(page, 'choice');
    const all = page.getByRole('checkbox', { name: 'Усі канали' });
    expect(await all.evaluate((el: HTMLInputElement) => el.indeterminate)).toBe(true);
    await all.click();
    await expect(page.getByRole('checkbox', { name: 'Push-сповіщення' })).toBeChecked();
    expect(await all.evaluate((el: HTMLInputElement) => el.indeterminate)).toBe(false);
    await expect(all).toBeChecked();
  });

  test('switch is exposed as a switch and toggles with space', async ({ page }) => {
    await openGallery(page, 'choice');
    const sw = page.getByRole('switch', { name: 'Вимкнено' });
    await sw.focus();
    await page.keyboard.press('Space');
    await expect(sw).toBeChecked();
  });

  test('setting description is the switch description', async ({ page }) => {
    await openGallery(page, 'choice');
    await expect(
      page.getByRole('switch', { name: 'Компактний режим' }),
    ).toHaveAccessibleDescription('Менші відступи в таблицях і списках.');
  });

  test('consent error appears on submit and clears when checked', async ({ page }) => {
    await openGallery(page, 'choice');
    await page.getByRole('button', { name: 'Створити акаунт' }).click();
    const terms = page.getByRole('checkbox', { name: /Я приймаю умови/ });
    await expect(terms).toHaveAttribute('aria-invalid', 'true');
    await expect(terms).toHaveAccessibleDescription(/прийміть умови/);
    await terms.check();
    await expect(terms).not.toHaveAttribute('aria-invalid', 'true');
  });

  test('switch thumb moves toward the inline end in RTL', async ({ page }) => {
    await openGallery(page, 'choice');
    const rtlOn = page.locator('[dir=rtl] .vd-switch:checked').first();
    const t = await rtlOn.evaluate((el) => getComputedStyle(el, '::before').translate);
    expect(t.startsWith('-')).toBe(true);
  });
});
