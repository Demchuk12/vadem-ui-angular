import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('reactive formatting keeps native focus and exact source bytes', async ({ page }) => {
  await page.goto('/file-size');
  await expect(page.getByTestId('decimal')).toContainText('1,5');
  await expect(page.getByTestId('binary')).toHaveText('1,5\u00a0MiB');
  const zero = page.getByRole('button', { name: 'Порожній файл', exact: true });
  await zero.focus();
  await zero.press('Enter');
  await expect(zero).toBeFocused();
  await expect(page.getByTestId('decimal')).toContainText('0');
  await expect(page.getByTestId('binary')).not.toContainText('MiB');
  await page.getByRole('button', { name: 'Біля межі одиниці' }).click();
  await expect(page.getByTestId('decimal')).toContainText('1 МБ');
  await expect(page.getByTestId('size-states')).toContainText('Розмір невідомий');
  await expect(page.locator('vd-file-size')).toHaveCount(0);
});

for (const theme of ['dark', 'light']) {
  for (const dir of ['ltr', 'rtl']) {
    test(`plain text is readable and axe-clean at 320px/200% (${theme}, ${dir})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 320, height: 1100 });
      await page.goto('/file-size');
      await page.evaluate(
        ({ theme, dir }) => {
          document.documentElement.dataset['theme'] = theme;
          document.documentElement.dir = dir;
          document.documentElement.style.fontSize = '200%';
        },
        { theme, dir },
      );
      await expect(page.getByTestId('rtl-size')).toContainText('MiB');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(results.violations).toEqual([]);
      await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
      await expect(page.getByTestId('decimal')).toBeVisible();
      await page.getByRole('button', { name: 'Порожній файл', exact: true }).focus();
      await expect(page.getByRole('button', { name: 'Порожній файл', exact: true })).toBeFocused();
    });
  }
}

test('file preview shows actual Blob size and retains modal controls', async ({ page }) => {
  await page.goto('/file-preview');
  await page.getByRole('button', { name: 'Текстовий файл', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.locator('.vd-file-preview__size bdi')).toHaveText(
    new Intl.NumberFormat('uk', { style: 'unit', unit: 'byte', unitDisplay: 'short' }).format(
      new TextEncoder().encode('Нотатки проєкту: ї є і ґ').length,
    ),
  );
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Текстовий файл', exact: true })).toBeFocused();
});
