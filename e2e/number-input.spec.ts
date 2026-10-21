import { expect, test } from '@playwright/test';
import { openGallery } from './fixtures';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openGallery(page, 'number-input');
});

test('native numeric semantics, Tab order, Arrow keys and focused boundary action', async ({
  page,
}) => {
  const input = page.getByRole('spinbutton', { name: 'Кількість учасників' });
  const minus = page.getByRole('button', { name: 'Зменшити кількість', exact: true });
  const plus = page.getByRole('button', { name: 'Збільшити кількість', exact: true });
  await minus.focus();
  await minus.press('Tab');
  await expect(input).toBeFocused();
  await input.press('ArrowUp');
  await expect(input).toHaveValue('3');
  await input.press('ArrowDown');
  await expect(input).toHaveValue('2');
  await input.press('Tab');
  await expect(plus).toBeFocused();
  await input.fill('9');
  await plus.focus();
  await plus.press('Enter');
  await expect(input).toHaveValue('10');
  await expect(plus).toBeFocused();
  await expect(plus).toHaveAttribute('aria-disabled', 'true');
  await plus.press('Space');
  await expect(input).toHaveValue('10');
  await expect(page.getByTestId('quantity-value')).toHaveText('Value: 10');
  await input.fill('0');
  await expect(minus).toHaveAttribute('aria-disabled', 'true');
  await minus.click({ force: true });
  await expect(input).toHaveValue('0');
});

test('empty is null, programmatic writes refresh bounds, typing never clamps', async ({ page }) => {
  const input = page.getByRole('spinbutton', { name: 'Кількість учасників' });
  const plus = page.getByRole('button', { name: 'Збільшити кількість', exact: true });
  await page.getByRole('button', { name: 'Установити 10', exact: true }).click();
  await expect(plus).toHaveAttribute('aria-disabled', 'true');
  await page.getByRole('button', { name: 'Очистити', exact: true }).click();
  await expect(input).toHaveValue('');
  await expect(page.getByTestId('quantity-value')).toHaveText('Value: null (empty)');
  await plus.click();
  await expect(input).toHaveValue('1');
  await input.fill('15');
  await input.press('Tab');
  await expect(input).toHaveValue('15');
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  await expect(plus).toHaveAttribute('aria-disabled', 'true');
  await page.getByRole('button', { name: 'Зменшити кількість', exact: true }).click();
  await expect(input).toHaveValue('10');
});

test('native decimal stepping aligns off-grid values without floating-point artifacts', async ({
  page,
}) => {
  const input = page.getByRole('spinbutton', { name: 'Вага зразка, кг' });
  const plus = page.getByRole('button', { name: 'Збільшити вагу', exact: true });
  await plus.click();
  await expect(input).toHaveValue('0.3');
  await input.fill('0.25');
  await plus.click();
  await expect(input).toHaveValue('0.3');
  await page.getByRole('button', { name: 'Зменшити вагу', exact: true }).click();
  await expect(input).toHaveValue('0.2');
});

test('dynamic constraints and Signal Forms model writes synchronize actions', async ({ page }) => {
  const seat = page.getByRole('button', { name: 'Додати місце', exact: true });
  await expect(seat).toHaveAttribute('aria-disabled', 'true');
  await page.getByRole('button', { name: 'Змінити ліміт', exact: true }).click();
  await expect(seat).not.toHaveAttribute('aria-disabled', 'true');
  await seat.click();
  await expect(page.getByRole('spinbutton', { name: 'Місця на зустрічі' })).toHaveValue('4');
  await page.getByRole('button', { name: 'Додати день', exact: true }).click();
  await expect(page.getByTestId('signal-value')).toHaveText('Days: 6');
  await page.getByRole('button', { name: 'Установити 30 днів', exact: true }).click();
  await expect(page.getByRole('spinbutton', { name: 'Дні відпустки' })).toHaveValue('30');
  await expect(page.getByRole('button', { name: 'Додати день', exact: true })).toHaveAttribute(
    'aria-disabled',
    'true',
  );
});

test('disabled/read-only fields lock actions; step any remains directly editable', async ({
  page,
}) => {
  for (const label of ['Недоступне', 'Лише читання']) {
    const input = page.getByRole('spinbutton', { name: label, exact: true });
    const buttons = input.locator('..').getByRole('button');
    await expect(buttons.nth(0)).toBeDisabled();
    await expect(buttons.nth(1)).toBeDisabled();
  }
  const any = page.getByRole('spinbutton', { name: 'Довільний десятковий дріб' });
  const buttons = any.locator('..').getByRole('button');
  await expect(buttons.nth(1)).toHaveAttribute('aria-disabled', 'true');
  await buttons.nth(1).click({ force: true });
  await expect(any).toHaveValue('1.2345');
  await any.fill('2.5678');
  await expect(any).toHaveValue('2.5678');
});

for (const dir of ['ltr', 'rtl']) {
  test(`320px enlarged text preserves controls and long labels (${dir})`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await openGallery(page, 'number-input', 'dark', dir);
    await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      320,
    );
    for (const control of await page.locator('vd-number-input').all()) {
      const box = await control.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(320);
      expect(await control.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
      expect(
        await control.locator('button').evaluateAll((buttons) =>
          buttons.every((button) => {
            const b = button.getBoundingClientRect();
            const icon = button.querySelector('vd-icon')!.getBoundingClientRect();
            return icon.left >= b.left && icon.right <= b.right;
          }),
        ),
      ).toBe(true);
    }
    const arabic = page.getByRole('spinbutton', { name: 'عدد المشاركين' });
    await page.getByRole('button', { name: 'زيادة العدد', exact: true }).click();
    await expect(arabic).toHaveValue('5');
  });
}

test('forced colors and reduced motion preserve visible field/button focus boundaries', async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  const plus = page.getByRole('button', { name: 'Збільшити кількість', exact: true });
  await plus.focus();
  expect(
    await plus.evaluate((el) => parseFloat(getComputedStyle(el).outlineWidth)),
  ).toBeGreaterThan(0);
  const input = page.getByRole('spinbutton', { name: 'Кількість учасників' });
  expect(
    await input
      .locator('..')
      .evaluate((el) => parseFloat(getComputedStyle(el).borderInlineStartWidth)),
  ).toBeGreaterThan(0);
  expect(
    await plus.evaluate((el) =>
      getComputedStyle(el)
        .transitionDuration.split(',')
        .every((duration) => parseFloat(duration) === 0),
    ),
  ).toBe(true);
});

test('incomplete native numeric entry cannot be replaced by a step action', async ({ page }) => {
  const input = page.getByRole('spinbutton', { name: 'Вага зразка, кг' });
  await input.fill('');
  await input.press('e');
  expect(await input.evaluate((el) => (el as HTMLInputElement).validity.badInput)).toBe(true);
  const plus = page.getByRole('button', { name: 'Збільшити вагу', exact: true });
  await expect(plus).toHaveAttribute('aria-disabled', 'true');
  await plus.click({ force: true });
  expect(await input.evaluate((el) => (el as HTMLInputElement).validity.badInput)).toBe(true);
});
