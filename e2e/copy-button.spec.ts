import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { openGallery, type Theme } from './fixtures';

type ClipboardTestWindow = Window & {
  copyWrites: string[];
  copyMode: 'success' | 'error' | 'deferred';
  settleCopy?: () => void;
};
const command = (page: Page) => page.getByTestId('command-copy');
async function mocked(
  page: Page,
  mode: 'success' | 'error' | 'deferred' | 'missing' = 'success',
  theme: Theme = 'dark',
  dir = 'ltr',
) {
  await page.addInitScript((mode) => {
    const state = window as ClipboardTestWindow;
    state.copyWrites = [];
    state.copyMode = mode === 'missing' ? 'error' : mode;
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value:
        mode === 'missing'
          ? undefined
          : {
              writeText: (text: string) => {
                state.copyWrites.push(text);
                if (state.copyMode === 'error')
                  return Promise.reject(new DOMException('Denied', 'NotAllowedError'));
                if (state.copyMode === 'deferred')
                  return new Promise<void>((resolve) => (state.settleCopy = resolve));
                return Promise.resolve();
              },
            },
    });
  }, mode);
  await openGallery(page, 'copy-button', theme, dir);
  await expect(page.getByRole('heading', { name: 'Copy button', exact: true })).toBeVisible();
}

test('real Chromium clipboard receives the command and exact table identifier', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await openGallery(page, 'copy-button');
  const button = command(page).getByRole('button');
  await button.focus();
  await button.press('Enter');
  await expect(command(page)).toHaveAttribute('data-state', 'copied');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('npm install @vadem/ui');
  await expect(button).toBeFocused();
  const row = page.getByRole('button', { name: 'Копіювати ID: Кабінет користувача', exact: true });
  await row.click();
  await expect(row.locator('..')).toHaveAttribute('data-state', 'copied');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('VDM-ACCOUNT-2026');
});

test('Enter/Space repeat safely, keep name/focus/width and announce success', async ({ page }) => {
  await mocked(page);
  const host = command(page),
    button = host.getByRole('button');
  const before = await button.boundingBox();
  await button.focus();
  await button.press('Space');
  await expect(host).toHaveAttribute('data-state', 'copied');
  await expect(host.getByRole('status')).toHaveText('Скопійовано');
  await expect(button).toHaveAccessibleName(/^Копіювати команду:/);
  await expect(button).toBeFocused();
  const after = await button.boundingBox();
  expect(after!.width).toBe(before!.width);
  expect(after!.height).toBe(before!.height);
  await button.press('Enter');
  expect(await page.evaluate(() => (window as ClipboardTestWindow).copyWrites)).toEqual([
    'npm install @vadem/ui',
    'npm install @vadem/ui',
  ]);
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('region', { name: 'Ідентифікатори проєктів', exact: true }),
  ).toBeFocused();
});

test('denial shows retryable error without success; retry and changed source clear feedback', async ({
  page,
}) => {
  await mocked(page, 'error');
  const host = command(page),
    button = host.getByRole('button');
  await button.click();
  await expect(host).toHaveAttribute('data-state', 'error');
  await expect(host.getByRole('status')).toContainText('скопіюйте вручну');
  await expect(button).toHaveAccessibleName(/^Копіювати команду:/);
  await expect(button).toContainText('Спробувати ще раз');
  await page.evaluate(() => ((window as ClipboardTestWindow).copyMode = 'success'));
  await button.press('Enter');
  await expect(host).toHaveAttribute('data-state', 'copied');
  const changing = page.getByTestId('changing-copy');
  await changing.getByRole('button').click();
  await expect(changing).toHaveAttribute('data-state', 'copied');
  await page.getByRole('button', { name: 'Змінити ID', exact: true }).click();
  await expect(changing).toHaveAttribute('data-state', 'idle');
  await expect(changing.getByRole('status')).toBeEmpty();
});

test('pending writes block repeats, preserve focus and discard stale completion', async ({
  page,
}) => {
  await mocked(page, 'deferred');
  const host = page.getByTestId('changing-copy'),
    button = host.getByRole('button');
  await button.focus();
  await button.press('Enter');
  await expect(button).toHaveAttribute('aria-busy', 'true');
  await expect(button).toHaveAttribute('aria-disabled', 'true');
  await expect(button).toBeFocused();
  await button.press('Space');
  expect(await page.evaluate(() => (window as ClipboardTestWindow).copyWrites)).toEqual([
    'VDM-001',
  ]);
  await page.getByRole('button', { name: 'Змінити ID', exact: true }).click();
  await button.evaluate((el) => (el as HTMLButtonElement).click());
  expect(await page.evaluate(() => (window as ClipboardTestWindow).copyWrites)).toEqual([
    'VDM-001',
  ]);
  await page.evaluate(() => (window as ClipboardTestWindow).settleCopy!());
  await expect(host).toHaveAttribute('data-state', 'idle');
  await expect(host.getByRole('status')).toBeEmpty();
  await page.evaluate(() => ((window as ClipboardTestWindow).copyMode = 'success'));
  await button.click();
  await expect(host).toHaveAttribute('data-state', 'copied');
  expect(await page.evaluate(() => (window as ClipboardTestWindow).copyWrites)).toEqual([
    'VDM-001',
    'VDM-002',
  ]);
});

test('unavailable API is honest; disabled controls cannot write', async ({ page }) => {
  await mocked(page, 'missing');
  const disabled = page.getByRole('button', { name: 'Копіювати недоступний код', exact: true });
  await expect(disabled).toBeDisabled();
  await disabled.evaluate((el) => (el as HTMLButtonElement).click());
  const icon = page.getByRole('button', {
    name: 'Копіювати ID: Бібліотека компонентів',
    exact: true,
  });
  await icon.click();
  await expect(icon.locator('..')).toHaveAttribute('data-state', 'error');
  await expect(icon).toHaveAttribute('title', /скопіюйте вручну/);
  expect(await page.evaluate(() => (window as ClipboardTestWindow).copyWrites)).toEqual([]);
});

for (const dir of ['ltr', 'rtl']) {
  test(`320px/200% labels fit, focus survives and reduced/forced motion stays static (${dir})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await mocked(page, 'deferred', 'light', dir);
    await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
    const button = command(page).getByRole('button');
    await button.focus();
    await button.press('Enter');
    await expect(button).toHaveCSS('outline-style', 'solid');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(button.locator('.vd-button__spinner .vd-icon__svg')).toHaveCSS(
      'animation-name',
      'none',
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.emulateMedia({ forcedColors: 'active' });
    await expect(button).toHaveCSS('border-top-style', 'solid');
    await page.evaluate(() => (window as ClipboardTestWindow).settleCopy!());
    await expect(command(page)).toHaveAttribute('data-state', 'copied');
    await expect(button).toBeFocused();
    const box = await button.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(24);
    expect(box!.height).toBeGreaterThanOrEqual(24);
  });
}
for (const theme of ['dark', 'light'] as const) {
  test(`idle, success and error states are axe clean (${theme})`, async ({ page }) => {
    await mocked(page, 'success', theme);
    for (const mode of ['idle', 'success', 'error'] as const) {
      if (mode !== 'idle') {
        await page.evaluate((mode) => ((window as ClipboardTestWindow).copyMode = mode), mode);
        await command(page).getByRole('button').click();
      }
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(result.violations).toEqual([]);
    }
  });
}
