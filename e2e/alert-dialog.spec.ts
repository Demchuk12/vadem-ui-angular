import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { openGallery } from './fixtures';

test('safe initial focus, explicit cancel, keyboard order and focus restore', async ({ page }) => {
  await openGallery(page, 'alert-dialog');
  const trigger = page.getByRole('button', { name: 'Видалити звіт', exact: true });
  await trigger.click();
  const dialog = page.getByRole('alertdialog');
  await expect(dialog).toHaveAccessibleName('Видалити звіт за зміну?');
  await expect(dialog).toHaveAccessibleDescription(/без можливості відновлення/);
  const cancel = dialog.getByRole('button', { name: 'Скасувати', exact: true });
  const confirm = dialog.getByRole('button', { name: 'Видалити', exact: true });
  await expect(cancel).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(confirm).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(cancel).toBeFocused();
  await dialog.getByRole('region').focus();
  await page.keyboard.press('Enter');
  await expect(dialog).toHaveAttribute('data-state', 'idle');
  await page.mouse.click(1, 1);
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(cancel).toBeFocused();
  await cancel.press('Enter');
  await expect(dialog).toHaveCount(0);
  await expect(page.getByTestId('alert-result')).toHaveText('Дію скасовано. Звіт збережено.');
});

test('pending blocks cancellation, duplicate activation and Escape; success closes', async ({
  page,
}) => {
  await openGallery(page, 'alert-dialog');
  const trigger = page.getByRole('button', { name: 'Тривале виконання', exact: true });
  await trigger.click();
  const dialog = page.getByRole('alertdialog');
  const confirm = dialog.getByRole('button', { name: 'Видалити', exact: true });
  await confirm.focus();
  await confirm.press('Enter');
  await expect(dialog).toHaveAttribute('data-state', 'pending');
  await expect(confirm).toBeFocused();
  await expect(confirm).toHaveAttribute('aria-busy', 'true');
  await confirm.press('Enter');
  await page.keyboard.press('Escape');
  const cancel = dialog.getByRole('button', { name: 'Скасувати', exact: true });
  await expect(cancel).toHaveAttribute('aria-disabled', 'true');
  await cancel.focus();
  await page.keyboard.press('Enter');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('status')).toContainText('Виконуємо дію');
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(page.getByTestId('alert-result')).toHaveText('Дію виконано. Це лише демонстрація.');
});

test('failure remains open with focus retained, safe copy and working retry', async ({ page }) => {
  await openGallery(page, 'alert-dialog');
  await page.getByRole('button', { name: 'Помилка й повторна спроба', exact: true }).click();
  const dialog = page.getByRole('alertdialog'),
    confirm = dialog.getByRole('button', { name: 'Видалити', exact: true });
  await confirm.click();
  await expect(dialog).toHaveAttribute('data-state', 'error');
  await expect(confirm).toBeFocused();
  await expect(dialog.getByRole('status')).toContainText('Не вдалося виконати дію');
  await expect(dialog.getByRole('button', { name: 'Скасувати' })).not.toHaveAttribute(
    'aria-disabled',
    'true',
  );
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
  await confirm.press('Enter');
  await expect(dialog).toHaveCount(0);
});

test('synchronous exceptions remain recoverable and primary variant is opt-in', async ({
  page,
}) => {
  await openGallery(page, 'alert-dialog');
  await page.getByRole('button', { name: 'Синхронна помилка', exact: true }).click();
  const dialog = page.getByRole('alertdialog');
  await dialog.getByRole('button', { name: 'Видалити', exact: true }).click();
  await expect(dialog).toHaveAttribute('data-state', 'error');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Опублікувати зміни', exact: true }).click();
  await expect(dialog.getByRole('button', { name: 'Опублікувати', exact: true })).toHaveAttribute(
    'data-variant',
    'primary',
  );
  await expect(dialog.getByRole('button', { name: 'Скасувати' })).toBeFocused();
});

for (const theme of ['dark', 'light'] as const)
  for (const dir of ['ltr', 'rtl']) {
    test(`320px, 200% text, keyboard scroll and axe (${theme}, ${dir})`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 1000 });
      await openGallery(page, 'alert-dialog', theme, dir);
      await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
      await page
        .getByRole('button', { name: dir === 'rtl' ? 'حذف التقرير' : 'Довгий опис', exact: true })
        .click();
      const dialog = page.getByRole('alertdialog');
      const cancel = dialog.getByRole('button', {
        name: dir === 'rtl' ? 'إلغاء' : 'Скасувати',
        exact: true,
      });
      await expect(cancel).toBeFocused();
      await expect(cancel).toBeInViewport();
      await expect(dialog.getByRole('button').last()).toBeInViewport();
      expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
      const region = dialog.getByRole('region');
      await region.focus();
      await region.press('Home');
      await region.press('End');
      if (dir === 'ltr')
        await expect.poll(() => region.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
            .analyze()
        ).violations,
      ).toEqual([]);
    });
  }

test('system colors keep boundaries/focus and reduced motion has zero dialog transitions', async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await openGallery(page, 'alert-dialog');
  await page.getByRole('button', { name: 'Видалити звіт', exact: true }).focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('alertdialog');
  await expect(dialog.getByRole('button', { name: 'Скасувати' })).toBeFocused();
  const style = await dialog.evaluate((el) => {
    const s = getComputedStyle(el),
      f = getComputedStyle(el.querySelector('button')!);
    return { duration: s.transitionDuration, border: s.borderTopStyle, outline: f.outlineStyle };
  });
  expect(style.duration.split(',').every((value) => parseFloat(value) === 0)).toBe(true);
  expect(style.border).toBe('solid');
  expect(style.outline).toBe('solid');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
});
