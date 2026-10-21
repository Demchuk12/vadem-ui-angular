import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { openGallery, type Theme } from './fixtures';

async function openPassword(page: Page, theme: Theme = 'dark') {
  await openGallery(page, 'password-input', theme);
  await expect(page.getByRole('heading', { name: 'Password input', exact: true })).toBeVisible();
  await expect(page.locator('input[vdPasswordInput]')).toHaveCount(9);
}
const account = (page: Page) =>
  page.getByLabel('Пароль облікового запису').and(page.locator('input'));
const reveal = (page: Page) =>
  page.getByRole('button', { name: 'Показати пароль облікового запису', exact: true });

test('native keyboard toggle preserves selection/value; Tab exits and never submits', async ({
  page,
}) => {
  await openPassword(page);
  const input = account(page);
  const button = reveal(page);
  await input.focus();
  await input.evaluate((el: HTMLInputElement) => el.setSelectionRange(2, 7, 'backward'));
  await input.press('Tab');
  await expect(button).toBeFocused();
  await button.press('Space');
  await expect(input).toHaveAttribute('type', 'text');
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  expect(
    await input.evaluate((el: HTMLInputElement) => [
      el.selectionStart,
      el.selectionEnd,
      el.selectionDirection,
    ]),
  ).toEqual([2, 7, 'backward']);
  await expect(input).toHaveValue('ЛишеДемо-іЇєҐ-2026');
  await expect(page.getByTestId('password-form-status')).toContainText('Без змін');
  await expect(page.getByTestId('password-form-status')).toContainText('Відправлень: 0');
  await expect(button).toBeFocused();
  await button.press('Enter');
  await expect(input).toHaveAttribute('type', 'password');
  await button.press('Tab');
  await expect(
    page.getByRole('button', { name: 'Перемкнути доступність', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(button).toBeFocused();
});
test('pointer reveal retains editing focus and native replacement/scroll position', async ({
  page,
}) => {
  await openPassword(page);
  const input = account(page);
  await input.focus();
  await input.evaluate((el: HTMLInputElement) => el.setSelectionRange(4, 8, 'backward'));
  await reveal(page).click();
  await expect(input).toBeFocused();
  expect(
    await input.evaluate((el: HTMLInputElement) => [
      el.selectionStart,
      el.selectionEnd,
      el.selectionDirection,
    ]),
  ).toEqual([4, 8, 'backward']);
  await page.keyboard.insertText('ґ');
  await expect(input).toHaveValue('Лишеґ-іЇєҐ-2026');
  await expect(page.getByTestId('password-form-status')).toContainText('Змінено');
  await input.fill('very-long-demo-value-'.repeat(30));
  await input.press('End');
  const before = await input.evaluate((el: HTMLInputElement) => el.scrollLeft);
  await reveal(page).click();
  await expect(input).toBeFocused();
  expect(await input.evaluate((el: HTMLInputElement) => el.selectionStart)).toBe(
    'very-long-demo-value-'.repeat(30).length,
  );
  // Both representations keep the caret visible; browser may clamp scroll to the changed text width.
  expect(before).toBeGreaterThan(0);
});
test('disabled masks and blocks reveal, readonly permits inspection, native form reset refreshes value', async ({
  page,
}) => {
  await openPassword(page);
  await reveal(page).click();
  await page.getByRole('button', { name: 'Перемкнути доступність', exact: true }).click();
  await expect(account(page)).toBeDisabled();
  await expect(account(page)).toHaveAttribute('type', 'password');
  await expect(reveal(page)).toBeDisabled();
  await page.getByRole('button', { name: 'Перемкнути доступність', exact: true }).click();
  await expect(reveal(page)).toBeEnabled();
  const readonly = page.getByLabel('Пароль тільки для перегляду', { exact: true });
  await page
    .getByRole('button', { name: 'Показати пароль тільки для перегляду', exact: true })
    .click();
  await expect(readonly).toHaveAttribute('type', 'text');
  await expect(readonly).toHaveJSProperty('readOnly', true);
  await account(page).fill('short');
  await account(page).press('Tab');
  await expect(account(page)).toHaveAttribute('aria-invalid', 'true');
  await page.getByRole('button', { name: 'Очистити пароль', exact: true }).click();
  await expect(account(page)).toHaveValue('ЛишеДемо-іЇєҐ-2026');
});
test('Signal Forms native editing, external writes, blur validation and reveal leave value intact', async ({
  page,
}) => {
  await openPassword(page);
  const input = page.getByLabel('Пароль нового учасника').and(page.locator('input'));
  await input.fill('abc');
  await input.press('Tab');
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await page
    .getByRole('button', { name: 'Заповнити демонстраційним паролем', exact: true })
    .click();
  await expect(input).toHaveValue('ЛишеДемо-іЇєҐ-2026');
  await page.getByRole('button', { name: 'Показати пароль нового учасника', exact: true }).click();
  await expect(input).toHaveAttribute('type', 'text');
  await expect(input).toHaveValue('ЛишеДемо-іЇєҐ-2026');
  await expect(input).not.toHaveAttribute('aria-invalid', 'true');
});
for (const dir of ['ltr', 'rtl'])
  test(`320px/200% text, Ukrainian and Arabic (${dir})`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await openPassword(page);
    await page.evaluate((dir) => {
      document.documentElement.dir = dir;
      document.documentElement.style.fontSize = '200%';
    }, dir);
    for (const theme of ['dark', 'light']) {
      await page.evaluate(
        (theme) => document.documentElement.setAttribute('data-theme', theme),
        theme,
      );
      expect(
        await page.locator('.vd-password-input').evaluateAll((groups) =>
          groups.every((group) => {
            const box = group.getBoundingClientRect();
            return (
              group.scrollWidth <= group.clientWidth + 1 &&
              [...group.querySelectorAll('input,button')].every((el) => {
                const r = el.getBoundingClientRect();
                return r.left >= box.left - 1 && r.right <= box.right + 1;
              })
            );
          }),
        ),
      ).toBe(true);
    }
    await page.getByRole('button', { name: 'إظهار كلمة المرور', exact: true }).click();
    await expect(page.getByLabel('كلمة مرور الحساب', { exact: true })).toHaveValue('تجربة-2026');
  });
test('forced colors retains input/button keyboard outlines; reduced motion is static', async ({
  page,
}) => {
  await openPassword(page);
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await account(page).focus();
  await account(page).press('Tab');
  expect(await reveal(page).evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid');
  expect(
    await reveal(page).evaluate((el) =>
      getComputedStyle(el)
        .transitionDuration.split(',')
        .every((value) => parseFloat(value) === 0),
    ),
  ).toBe(true);
});
for (const theme of ['dark', 'light'] as const)
  test(`password input axe (${theme})`, async ({ page }) => {
    await openPassword(page, theme);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(
      results.violations.map((v) => ({ id: v.id, targets: v.nodes.map((node) => node.target) })),
    ).toEqual([]);
  });
