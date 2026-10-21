import { expect, test } from '@playwright/test';
import { openGallery } from './fixtures';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openGallery(page, 'tag-input');
});

test('Enter and add button commit trimmed tags without submitting; duplicates preserve the draft', async ({
  page,
}) => {
  const input = page.getByRole('textbox', { name: 'Теги проєкту', exact: true });
  const control = input.locator('../..');
  await input.fill('  Доступність  ');
  await expect(page.getByTestId('project-value')).toHaveText('Tags: Дизайн · Українська');
  await input.press('Enter');
  await expect(page.getByTestId('project-value')).toHaveText(
    'Tags: Дизайн · Українська · Доступність',
  );
  await expect(input).toHaveValue('');
  await expect(input).toBeFocused();
  await expect(control.getByRole('status')).toHaveText('Додано «Доступність».');
  await input.fill('дизайн');
  await input.press('Enter');
  await expect(input).toHaveValue('дизайн');
  await expect(control.getByRole('status')).toHaveText('Тег «дизайн» уже є у списку.');
  await control.getByRole('status').evaluate((el) => {
    const updates: string[] = [];
    (el as HTMLElement & { updates: string[] }).updates = updates;
    new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === 'childList')
          updates.push(
            [...record.addedNodes]
              .map((node) => node.textContent)
              .join('')
              .trim(),
          );
      }
    }).observe(el, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  });
  await input.press('Enter');
  await expect
    .poll(() =>
      control
        .getByRole('status')
        .evaluate((el) => (el as HTMLElement & { updates: string[] }).updates),
    )
    .toContain('');
  await expect(control.getByRole('status')).toHaveText('Тег «дизайн» уже є у списку.');
  await input.fill('Перевірка');
  await control.getByRole('button', { name: 'Додати', exact: true }).click();
  await expect(input).toBeFocused();
  await expect(page.getByTestId('project-value')).toContainText('Перевірка');
  await input.press('Enter');
  await expect(page.getByTestId('submit-count')).toHaveText('Form submits: 0');
});

test('Backspace focuses removal; Escape returns to text and explicit Space removes', async ({
  page,
}) => {
  const input = page.getByRole('textbox', { name: 'Теги проєкту', exact: true });
  const control = input.locator('../..');
  const remove = control.getByRole('button', { name: 'Видалити Українська', exact: true });
  await input.focus();
  await input.press('Backspace');
  await expect(remove).toBeFocused();
  await expect(page.getByTestId('project-value')).toHaveText('Tags: Дизайн · Українська');
  await remove.press('Escape');
  await expect(input).toBeFocused();
  await input.press('Shift+Tab');
  await expect(remove).toBeFocused();
  await remove.press('Tab');
  await expect(input).toBeFocused();
  await input.press('Backspace');
  await remove.press('Space');
  await expect(input).toBeFocused();
  await expect(page.getByTestId('project-value')).toHaveText('Tags: Дизайн');
  await expect(control.getByRole('status')).toHaveText('Видалено «Українська».');
});

test('required validates committed values only after whole-control touch', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Теги проєкту', exact: true });
  await page.getByRole('button', { name: 'Очистити', exact: true }).click();
  await input.fill('Ще не додано');
  await expect(input).not.toHaveAttribute('aria-invalid', 'true');
  await input.press('Tab');
  await expect(input).not.toHaveAttribute('aria-invalid', 'true');
  await input.locator('../..').getByRole('button', { name: 'Додати', exact: true }).press('Tab');
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByText('Додайте хоча б один тег', { exact: true })).toBeVisible();
  await input.press('Enter');
  await expect(input).not.toHaveAttribute('aria-invalid', 'true');
  await expect(input).toHaveAttribute('aria-required', 'true');
  await expect(input).not.toHaveAttribute('required');
});

test('programmatic form writes, reset and disabled state update tags and draft', async ({
  page,
}) => {
  const input = page.getByRole('textbox', { name: 'Теги проєкту', exact: true });
  const control = input.locator('../..');
  await input.fill('Draft');
  await page.getByRole('button', { name: 'Завантажити теги', exact: true }).click();
  await expect(control.getByRole('listitem')).toHaveCount(2);
  await expect(input).toHaveValue('');
  await expect(page.getByTestId('project-value')).toHaveText('Tags: Реліз · Перевірка');
  await page.getByRole('button', { name: 'Перемкнути доступність', exact: true }).click();
  await expect(input).toBeDisabled();
  for (const button of await control.getByRole('button').all()) await expect(button).toBeDisabled();
  await page.getByRole('button', { name: 'Перемкнути доступність', exact: true }).click();
  await expect(input).toBeEnabled();
  await page.getByRole('button', { name: 'Очистити', exact: true }).click();
  await expect(control.getByRole('list')).toHaveCount(0);
  await expect(input).toHaveValue('');
  await expect(control.getByRole('status')).toBeEmpty();
});

test('readonly preserves selectable text and locks all actions', async ({ page }) => {
  const input = page.getByRole('textbox', { name: 'Лише читання', exact: true });
  await expect(input).toHaveAttribute('readonly');
  await expect(input).toBeEnabled();
  await input.focus();
  await expect(input).toBeFocused();
  for (const button of await input.locator('../..').getByRole('button').all())
    await expect(button).toBeDisabled();
  await expect(input.locator('../..').getByRole('listitem')).toHaveCount(2);
});

test('Signal Forms receives arrays and touch, programmatic updates and UI reset', async ({
  page,
}) => {
  const input = page.getByRole('textbox', { name: 'Навички команди', exact: true });
  await input.fill('Доступність');
  await input.press('Enter');
  await expect(page.getByTestId('signal-value')).toHaveText('Skills: Angular · Доступність');
  await page.getByRole('button', { name: 'Завантажити навички', exact: true }).click();
  await expect(page.getByTestId('signal-value')).toHaveText('Skills: TypeScript · Дизайн');
  await input.fill('Draft');
  await page.getByRole('button', { name: 'Скинути навички', exact: true }).click();
  await expect(input).toHaveValue('');
  await expect(page.getByTestId('signal-value')).toHaveText('Skills: empty');
  await input.focus();
  await input.press('Tab');
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(
    page.getByText('Список навичок не може бути порожнім', { exact: true }),
  ).toBeVisible();
});

test('composition Enter does not commit, pasted punctuation remains one tag, caret keys stay native', async ({
  page,
}) => {
  const input = page.getByRole('textbox', { name: 'Теги проєкту', exact: true });
  await input.fill('日本語');
  await input.dispatchEvent('compositionstart');
  await input.press('Enter');
  await expect(page.getByTestId('project-value')).toHaveText('Tags: Дизайн · Українська');
  await input.dispatchEvent('compositionend');
  await input.press('Enter');
  await expect(page.getByTestId('project-value')).toContainText('日本語');
  await input.fill('UI, UX');
  await input.press('Home');
  await input.press('ArrowRight');
  expect(await input.evaluate((el) => (el as HTMLInputElement).selectionStart)).toBe(1);
  await input.press('Enter');
  await expect(input.locator('../..').getByRole('listitem')).toHaveCount(4);
  await expect(page.getByTestId('project-value')).toContainText('UI, UX');
});

for (const dir of ['ltr', 'rtl']) {
  test(`long Ukrainian tags and Arabic stay inside 320px with enlarged text (${dir})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await openGallery(page, 'tag-input', 'dark', dir);
    await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      320,
    );
    expect(
      await page
        .locator('.vd-tag-input__field, .vd-tag-input__tag')
        .evaluateAll((nodes) => nodes.every((el) => el.scrollWidth <= el.clientWidth + 1)),
    ).toBe(true);
    const arabic = page.getByRole('textbox', { name: 'موضوعات المشروع' });
    await arabic.fill('اختبار');
    await arabic.press('Enter');
    const remove = arabic
      .locator('../..')
      .getByRole('button', { name: 'إزالة اختبار', exact: true });
    await expect(remove).toBeVisible();
    await remove.click();
    await expect(arabic).toBeFocused();
    await expect(remove).toHaveCount(0);
  });
}

test('forced colors retain boundaries and focus, reduced motion stops transitions', async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  const input = page.getByRole('textbox', { name: 'Теги проєкту', exact: true });
  await input.focus();
  await input.press('Backspace');
  const remove = input
    .locator('../..')
    .getByRole('button', { name: 'Видалити Українська', exact: true });
  expect(
    await remove.evaluate((el) => parseFloat(getComputedStyle(el).outlineWidth)),
  ).toBeGreaterThan(0);
  expect(
    await input
      .locator('..')
      .evaluate((el) => parseFloat(getComputedStyle(el).borderInlineStartWidth)),
  ).toBeGreaterThan(0);
  expect(
    await remove.evaluate((el) =>
      getComputedStyle(el)
        .transitionDuration.split(',')
        .every((duration) => parseFloat(duration) === 0),
    ),
  ).toBe(true);
});
