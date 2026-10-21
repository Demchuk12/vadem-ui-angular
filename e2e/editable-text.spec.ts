import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { openGallery } from './fixtures';

test('keyboard cancel, required validation, failed save and retry preserve committed value', async ({
  page,
}) => {
  await openGallery(page, 'editable-text');
  const editor = page.getByTestId('project-editor');
  const trigger = editor.locator('.vd-editable-text__trigger');
  await trigger.press('Enter');
  const input = editor.getByRole('textbox', { name: 'Назва проєкту' });
  await expect(input).toBeFocused();
  await input.fill('Чернетка');
  await input.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(trigger).toContainText('Лінія фасування № 4');
  await trigger.click();
  await input.fill('   ');
  await input.press('Enter');
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByTestId('save-attempts')).toContainText('0');
  await input.fill('Лінія фасування № 5');
  await input.press('Tab');
  await expect(input).toBeVisible();
  await editor.getByRole('button', { name: 'Зберегти', exact: true }).click();
  await expect(input).toHaveAttribute('readonly', '');
  await input.press('Enter');
  await expect(editor).toHaveAttribute('data-state', 'error');
  await expect(input).toHaveValue('Лінія фасування № 5');
  await expect(page.getByTestId('committed-value')).toContainText('№ 4');
  await expect(page.getByTestId('save-attempts')).toContainText('1');
  await input.press('Enter');
  await expect(trigger).toContainText('№ 5');
  await expect(trigger).toBeFocused();
  await expect(page.getByTestId('form-submissions')).toContainText('0');
});

test('completion does not steal focus after Tab leaves the widget', async ({ page }) => {
  await openGallery(page, 'editable-text');
  const editor = page.getByTestId('project-editor');
  await editor.getByRole('button').click();
  const input = editor.getByRole('textbox');
  await input.fill('Нова назва');
  await input.press('Enter');
  await expect(editor).toHaveAttribute('data-state', 'error');
  await input.press('Enter');
  const outside = page.getByTestId('outside-action');
  await outside.focus();
  await expect(editor).toHaveAttribute('data-state', 'idle');
  await expect(outside).toBeFocused();
});

for (const theme of ['dark', 'light'] as const) {
  for (const dir of ['ltr', 'rtl'] as const) {
    test(`narrow layout, 200% text and axe in idle/editing/error (${theme}, ${dir})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 320, height: 900 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await openGallery(page, 'editable-text', theme, dir);
      await page.addStyleTag({ content: 'html { font-size: 200%; }' });
      const editor = page.getByTestId('project-editor');
      for (const state of ['idle', 'editing', 'error']) {
        if (state === 'editing') await editor.getByRole('button').click();
        if (state === 'error') {
          await editor.getByRole('textbox').fill('');
          await editor.getByRole('textbox').press('Enter');
        }
        const result = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze();
        expect(
          result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(',')}`),
        ).toEqual([]);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
          ),
        ).toBe(true);
      }
      const errorText = editor.locator('.vd-field__error > span');
      const bounds = await errorText.evaluate((element) => ({
        text: element.getBoundingClientRect().right,
        host: element.closest('vd-editable-text')!.getBoundingClientRect().right,
      }));
      expect(bounds.text).toBeLessThanOrEqual(bounds.host + 1);
      const arabic = page.locator('vd-editable-text[lang="ar"]');
      await arabic.getByRole('button').click();
      await expect(arabic.getByRole('textbox')).toBeFocused();
      await arabic.getByRole('textbox').press('Escape');
    });
  }
}

test('forced colors retains usable editor and actions', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await openGallery(page, 'editable-text');
  const editor = page.getByTestId('project-editor');
  await editor.getByRole('button').click();
  await expect(editor.getByRole('textbox')).toBeVisible();
  await expect(editor.getByRole('button', { name: 'Зберегти', exact: true })).toBeVisible();
  await editor.getByRole('textbox').press('Escape');
  await expect(editor.getByRole('button')).toBeFocused();
});
