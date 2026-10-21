import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { openGallery } from './fixtures';
const trigger = (page: Page) =>
  page.getByRole('button', { name: 'Колір робочого простору', exact: true });
const popup = (page: Page) =>
  page.getByRole('dialog', { name: 'Колір робочого простору', exact: true });
const hex = (page: Page) => popup(page).getByRole('textbox', { name: 'Колір HEX' });

for (const dir of ['ltr', 'rtl']) {
  test(`palette draft, wrapping arrows, explicit commit and focus (${dir})`, async ({ page }) => {
    await openGallery(page, 'color-picker', 'dark', dir);
    await trigger(page).focus();
    await trigger(page).press('Alt+ArrowDown');
    await expect(hex(page)).toBeFocused();
    await page.keyboard.press('Tab');
    const first = popup(page).getByRole('radio', { name: 'Фіолетовий' });
    await expect(first).toBeFocused();
    await first.press(dir === 'ltr' ? 'ArrowRight' : 'ArrowLeft');
    await expect(popup(page).getByRole('radio', { name: 'Синій' })).toBeChecked();
    await expect(page.getByTestId('color-value')).toHaveText('Колір ще не обрано');
    await page.keyboard.press('End');
    await page.keyboard.press('ArrowDown');
    await expect(first).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('color-value')).toHaveText('#6D4BD3');
    await expect(trigger(page)).toBeFocused();
    await expect(popup(page)).not.toBeVisible();
  });
}

test('HEX validation, canonical value, Escape cancellation and pointer toggle', async ({
  page,
}) => {
  await openGallery(page, 'color-picker');
  await trigger(page).click();
  await hex(page).fill('#12345678');
  await hex(page).press('Enter');
  await expect(hex(page)).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByTestId('color-value')).toHaveText('Колір ще не обрано');
  await hex(page).fill('abc');
  await hex(page).press('Enter');
  await expect(page.getByTestId('color-value')).toHaveText('#AABBCC');
  await trigger(page).click();
  await hex(page).fill('#000');
  await hex(page).press('Escape');
  await expect(trigger(page)).toBeFocused();
  await trigger(page).click();
  await expect(hex(page)).toHaveValue('#AABBCC');
  await trigger(page).click();
  await expect(popup(page)).not.toBeVisible();
});

test('required errors, reset, disabled and readonly', async ({ page }) => {
  await openGallery(page, 'color-picker');
  await page.getByRole('button', { name: 'Зберегти колір', exact: true }).click();
  await expect(trigger(page)).toHaveAttribute('aria-invalid', 'true');
  await trigger(page).click();
  await popup(page).getByRole('radio', { name: 'Зелений' }).click();
  await expect(trigger(page)).not.toHaveAttribute('aria-invalid', 'true');
  await page.getByRole('button', { name: 'Перемкнути доступність', exact: true }).click();
  await expect(trigger(page)).toBeDisabled();
  await expect(page.getByTestId('color-value')).toHaveText('#23856D');
  await page.getByRole('button', { name: 'Перемкнути доступність', exact: true }).click();
  await page.getByRole('button', { name: 'Скинути колір', exact: true }).click();
  await expect(page.getByTestId('color-value')).toHaveText('Колір ще не обрано');
  const readonly = page.getByRole('button', { name: 'Опублікований колір', exact: true });
  await readonly.focus();
  await readonly.press('Enter');
  await readonly.press('Alt+ArrowDown');
  await expect(readonly).toHaveAttribute('aria-expanded', 'false');
});

test('Signal Forms touch and writes; focus leaving popup dismisses', async ({ page }) => {
  await openGallery(page, 'color-picker');
  const button = page.getByRole('button', { name: 'Колір категорії', exact: true });
  await button.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Колір категорії', exact: true });
  await dialog.getByRole('textbox').fill('123');
  await dialog.getByRole('textbox').press('Enter');
  await expect(page.getByTestId('color-signal-value')).toHaveText('#112233');
  await page.getByRole('button', { name: 'Установити зелений', exact: true }).click();
  await expect(page.getByTestId('color-signal-value')).toHaveText('#23856D');
  await button.click();
  await expect(dialog.getByRole('textbox')).toBeFocused();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(dialog).not.toBeVisible();
});

for (const dir of ['ltr', 'rtl']) {
  test(`320px enlarged text keeps palette reachable (${dir})`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await openGallery(page, 'color-picker', 'dark', dir);
    await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
    await trigger(page).click();
    await expect(popup(page)).toBeVisible();
    expect(await popup(page).evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    for (const radio of await popup(page).getByRole('radio').all()) {
      const box = await radio.boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(24);
      expect(
        await radio.evaluate((el) => {
          const frame = el.getBoundingClientRect();
          const chip = el.querySelector('.vd-color-picker__chip')!.getBoundingClientRect();
          return chip.left >= frame.left && chip.right <= frame.right;
        }),
      ).toBe(true);
    }
    await popup(page).getByRole('radio', { name: 'Білий' }).click();
    await expect(page.getByTestId('color-value')).toHaveText('#FFFFFF');
  });
}

test('forced colors retain data and selection; reduced motion', async ({ page }) => {
  await openGallery(page, 'color-picker');
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await trigger(page).click();
  const first = popup(page).getByRole('radio').first();
  await first.focus();
  await first.press('ArrowDown');
  const selected = popup(page).getByRole('radio', { checked: true });
  await expect(selected).toHaveCSS('outline-style', 'solid');
  await expect(selected.locator('.vd-color-picker__chip')).toHaveCSS('forced-color-adjust', 'none');
  expect(
    await popup(page).evaluate((el) =>
      getComputedStyle(el)
        .transitionDuration.split(',')
        .every((v) => parseFloat(v) === 0),
    ),
  ).toBe(true);
});
for (const theme of ['dark', 'light'] as const) {
  test(`closed and open Color picker axe (${theme})`, async ({ page }) => {
    await openGallery(page, 'color-picker', theme);
    for (const opened of [false, true]) {
      if (opened) {
        await trigger(page).click();
        await hex(page).fill('invalid');
        await hex(page).press('Enter');
      }
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(
        result.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
      ).toEqual([]);
    }
  });
}
