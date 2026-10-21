import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { openGallery, type Theme } from './fixtures';

const code = (page: Page) => page.getByLabel('Код підтвердження');
async function openOtp(page: Page, theme: Theme = 'dark', dir = 'ltr') {
  await openGallery(page, 'otp-input', theme, dir);
  await expect(page.getByRole('heading', { name: 'OTP input', exact: true })).toBeVisible();
  await expect(page.locator('input[vdOtpInput]')).toHaveCount(9);
}

test('native editing retains leading zeros, selection and one keyboard entry', async ({ page }) => {
  await openOtp(page);
  const input = code(page);
  await input.focus();
  await page.keyboard.type('0012347');
  await expect(input).toHaveValue('001234');
  await expect(page.getByTestId('otp-status')).toHaveText('Очікуємо підтвердження');
  await expect(input).toBeFocused();
  await input.press('Home');
  await input.press('ArrowRight');
  await input.press('Shift+ArrowRight');
  await page.keyboard.type('9');
  await expect(input).toHaveValue('091234');
  await input.press('End');
  await input.press('Backspace');
  await expect(input).toHaveValue('09123');
  await input.press('Tab');
  await expect(page.getByRole('button', { name: 'Підтвердити код', exact: true })).toBeFocused();
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await page.keyboard.press('Shift+Tab');
  await expect(input).toBeFocused();
  await input.fill('000042');
  await input.press('Enter');
  await expect(page.getByTestId('otp-status')).toHaveText('Демонстраційний код прийнято');
});

test('actual clipboard paste replaces the selected code without auto-submit', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await openOtp(page);
  await page.evaluate(() => navigator.clipboard.writeText('004281'));
  await code(page).fill('123456');
  await code(page).selectText();
  await code(page).press('ControlOrMeta+V');
  await expect(code(page)).toHaveValue('004281');
  await expect(code(page)).toBeFocused();
  await expect(page.getByTestId('otp-status')).toHaveText('Очікуємо підтвердження');
  await code(page).press('ControlOrMeta+Z');
  await expect(code(page)).toHaveValue('123456');
});

test('nondigits remain editable and fail form validation; reset and disabled preserve native state', async ({
  page,
}) => {
  await openOtp(page);
  await code(page).fill('abc123');
  await code(page).press('Tab');
  await expect(code(page)).toHaveAttribute('aria-invalid', 'true');
  expect(await code(page).evaluate((el: HTMLInputElement) => el.validity.patternMismatch)).toBe(
    true,
  );
  await code(page).fill('001234');
  await code(page).press('Tab');
  await expect(code(page)).not.toHaveAttribute('aria-invalid', 'true');
  await page.getByRole('button', { name: 'Перемкнути доступність', exact: true }).click();
  await expect(code(page)).toBeDisabled();
  expect(
    await page
      .locator('form')
      .evaluate((el: HTMLFormElement) => new FormData(el).has('verification-code')),
  ).toBe(false);
  await page.getByRole('button', { name: 'Перемкнути доступність', exact: true }).click();
  await expect(code(page)).toHaveValue('001234');
  await page.getByRole('button', { name: 'Очистити', exact: true }).click();
  await expect(code(page)).toHaveValue('');
  await expect(code(page)).not.toHaveAttribute('aria-invalid', 'true');
  const readonly = page.getByLabel('Код тільки для перегляду', { exact: true });
  await readonly.focus();
  await readonly.press('Backspace');
  await expect(readonly).toHaveValue('004281');
});

test('Signal Forms receives native editing and external writes with touched validation', async ({
  page,
}) => {
  await openOtp(page);
  const input = page.getByLabel('Код запрошення');
  await input.fill('12');
  await input.press('Tab');
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await page.getByRole('button', { name: 'Заповнити прикладом', exact: true }).click();
  await expect(input).toHaveValue('0042');
  await expect(input).not.toHaveAttribute('aria-invalid', 'true');
  await input.fill('abcd');
  await input.press('Tab');
  await expect(input).toHaveAttribute('aria-invalid', 'true');
});

for (const dir of ['ltr', 'rtl'])
  test(`320px and 200% text contain the controls and preserve digit order (${dir})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await openOtp(page, 'dark', dir);
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%';
    });
    for (const theme of ['dark', 'light']) {
      await page.evaluate(
        (theme) => document.documentElement.setAttribute('data-theme', theme),
        theme,
      );
      expect(
        await page.locator('input[vdOtpInput]').evaluateAll((inputs) =>
          inputs.every((input) => {
            const box = input.getBoundingClientRect();
            const parent = input.parentElement!.getBoundingClientRect();
            return (
              box.left >= parent.left - 1 &&
              box.right <= parent.right + 1 &&
              getComputedStyle(input).direction === 'ltr'
            );
          }),
        ),
      ).toBe(true);
    }
    const input = page.getByLabel('رمز التحقق', { exact: true });
    await input.focus();
    await input.press('Home');
    await input.press('ArrowRight');
    expect(await input.evaluate((el: HTMLInputElement) => el.selectionStart)).toBe(1);
    await input.press('End');
    await input.press('Backspace');
    await expect(input).toHaveValue('01234');
  });

test('forced colors keeps a visible keyboard outline; reduced motion removes transitions', async ({
  page,
}) => {
  await openOtp(page);
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await code(page).focus();
  await code(page).press('ArrowRight');
  expect(await code(page).evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid');
  expect(
    await code(page).evaluate((el) =>
      getComputedStyle(el)
        .transitionDuration.split(',')
        .every((value) => parseFloat(value) === 0),
    ),
  ).toBe(true);
});

for (const theme of ['dark', 'light'] as const)
  test(`OTP input axe (${theme})`, async ({ page }) => {
    await openOtp(page, theme);
    await code(page).fill('12');
    await code(page).press('Tab');
    await expect(code(page)).toHaveAttribute('aria-invalid', 'true');
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(
      result.violations.map((v) => ({ id: v.id, targets: v.nodes.map((node) => node.target) })),
    ).toEqual([]);
  });
