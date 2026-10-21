import { expect, test } from '@playwright/test';
import { openGallery } from './fixtures';

test.describe('segmented', () => {
  test('arrows move and select; disabled segments are skipped', async ({ page }) => {
    await openGallery(page, 'segmented');
    const group = page.getByRole('radiogroup', { name: 'Тариф' });
    const team = group.getByRole('radio', { name: 'Team' });
    const free = group.getByRole('radio', { name: 'Free' });
    await free.focus();
    await page.keyboard.press('ArrowRight');
    await expect(team).toBeFocused();
    await expect(team).toBeChecked();
    // Business is disabled: the next arrow wraps to Free.
    await page.keyboard.press('ArrowRight');
    await expect(free).toBeChecked();
  });

  test('two-way value and icon-only names', async ({ page }) => {
    await openGallery(page, 'segmented');
    const group = page.getByRole('radiogroup', { name: 'Період, md' });
    await group.getByRole('radio', { name: 'Рік' }).click();
    await expect(page.getByText('value: year')).toBeVisible();
    // Both size demos share the model.
    await expect(
      page.getByRole('radiogroup', { name: 'Період, sm' }).getByRole('radio', { name: 'Рік' }),
    ).toBeChecked();
    const compact = page.getByRole('radiogroup', { name: 'Тема (компактно)' });
    await compact.getByRole('radio', { name: 'Світла' }).click();
    await expect(page.getByText('form: light')).toBeVisible();
  });

  test('arrows are mirrored in RTL', async ({ page }) => {
    await openGallery(page, 'segmented', 'dark', 'rtl');
    const group = page.getByRole('radiogroup', { name: 'Тариф' });
    await group.getByRole('radio', { name: 'Free' }).focus();
    await page.keyboard.press('ArrowLeft');
    await expect(group.getByRole('radio', { name: 'Team' })).toBeChecked();
  });
});
