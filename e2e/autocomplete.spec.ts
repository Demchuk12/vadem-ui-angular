import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { openGallery } from './fixtures';

const address = (page: import('@playwright/test').Page) =>
  page.getByRole('combobox', { name: 'Адреса доставки', exact: true });
const suggestions = (page: import('@playwright/test').Page) =>
  page.getByRole('listbox', { name: 'Знайдені адреси', exact: true });

async function open(page: import('@playwright/test').Page) {
  await page.clock.install();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openGallery(page, 'autocomplete');
}

async function lookup(page: import('@playwright/test').Page, text = 'Ки') {
  await address(page).fill(text);
  await page.clock.runFor(650);
  await expect(suggestions(page)).toHaveAttribute('aria-busy', 'false');
}

test('manual selection preserves free text, form submission and duplicate-label identity', async ({
  page,
}) => {
  await open(page);
  const input = address(page);
  await lookup(page, '  Нова адреса  ');
  await expect(input).not.toHaveAttribute('aria-activedescendant');
  await input.press('Enter');
  await expect(page.getByTestId('address-submitted')).toContainText('Нова адреса');
  await expect(input).toHaveValue('  Нова адреса  ');
  await lookup(page);
  await expect(suggestions(page).getByRole('option')).toHaveCount(3);
  // Zoneless rendering is asynchronous: wait for each move before reading the active option.
  await input.press('ArrowDown');
  await expect(input).toHaveAttribute('aria-activedescendant', /.+/);
  const first = await input.getAttribute('aria-activedescendant');
  await input.press('ArrowDown');
  await expect(input).not.toHaveAttribute('aria-activedescendant', first!);
  const second = await input.getAttribute('aria-activedescendant');
  await input.press('ArrowDown');
  await expect(input).toHaveAttribute('aria-activedescendant', second!);
  await input.press('Home');
  await expect(input).toHaveAttribute('aria-activedescendant', second!);
  await input.press('Enter');
  await expect(input).toHaveValue('Київ, вулиця Січових Стрільців, 24');
  await expect(page.getByTestId('address-id')).toContainText('kyiv-office');
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await page.clock.runFor(1000);
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await input.press('Tab');
  await expect(page.getByRole('button', { name: 'Зберегти адресу', exact: true })).toBeFocused();
});

test('pointer selection keeps focus; Tab, Escape and outside dismissal never accept', async ({
  page,
}) => {
  await open(page);
  const input = address(page);
  await lookup(page);
  await suggestions(page)
    .getByRole('option', { name: 'Київ, вулиця Січових Стрільців, 24', exact: true })
    .nth(1)
    .click();
  await expect(input).toBeFocused();
  await expect(page.getByTestId('address-id')).toContainText('kyiv-office');
  await lookup(page);
  await input.press('ArrowUp');
  await input.press('Escape');
  await expect(input).toHaveValue('Ки');
  await expect(input).not.toHaveAttribute('aria-activedescendant');
  await input.press('Alt+ArrowDown');
  await expect(input).not.toHaveAttribute('aria-activedescendant');
  await input.press('ArrowDown');
  await input.press('Tab');
  await expect(input).toHaveValue('Ки');
  await expect(page.getByTestId('address-id')).toContainText('не вибрана');
  await input.focus();
  await page.getByRole('heading', { name: 'Autocomplete', exact: true }).click();
  await expect(input).toHaveAttribute('aria-expanded', 'false');
});

test('async states suppress stale choices, ignore late replies and preserve text through errors', async ({
  page,
}) => {
  await open(page);
  const input = address(page);
  await input.fill('повільно');
  await page.clock.runFor(200);
  await expect(suggestions(page)).toHaveAttribute('aria-busy', 'true');
  await input.press('ArrowDown');
  await expect(input).not.toHaveAttribute('aria-activedescendant');
  await lookup(page);
  await page.clock.runFor(2000);
  await expect(suggestions(page).getByRole('option')).toHaveCount(3);
  await expect(suggestions(page)).not.toContainText('Повільний результат');
  await input.fill('Льв');
  await page.clock.runFor(200);
  await input.press('Escape');
  await page.clock.runFor(450);
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await input.focus();
  await input.press('ArrowDown');
  await expect(input).toHaveAttribute('aria-activedescendant', /lviv/);
  await input.fill('помилка');
  await expect(input).not.toHaveAttribute('aria-activedescendant');
  await page.clock.runFor(650);
  await expect(
    page.locator('.vd-autocomplete__message').filter({ hasText: 'Підказки тимчасово недоступні' }),
  ).toBeVisible();
  await expect(suggestions(page).getByRole('option')).toHaveCount(0);
  await expect(input).not.toHaveAttribute('aria-invalid');
  await input.press('Enter');
  await expect(page.getByTestId('address-submitted')).toContainText('помилка');
  await page.getByRole('button', { name: 'Очистити адресу' }).click();
  await expect(input).toHaveValue('');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
});

test('native form reset, disabled, readonly and Signal Forms external writes', async ({ page }) => {
  await open(page);
  const input = address(page);
  await lookup(page);
  await page.getByRole('button', { name: 'Лише читання', exact: true }).click();
  await input.focus();
  await input.press('ArrowDown');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await expect(input).toHaveAttribute('readonly');
  await page.getByRole('button', { name: 'Вимкнути поле', exact: true }).click();
  await expect(input).toBeDisabled();
  await page.getByRole('button', { name: 'Увімкнути поле', exact: true }).click();
  await page.getByRole('button', { name: 'Дозволити редагування', exact: true }).click();
  await page.getByRole('button', { name: 'Очистити адресу' }).click();
  await input.focus();
  await input.press('Tab');
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  const local = page.getByRole('combobox', { name: 'Напрям роботи української команди' });
  await local.fill('Контроль');
  await local.press('ArrowDown');
  await local.press('Enter');
  await expect(local).toHaveValue('Контроль якості');
  await expect(page.getByTestId('signal-value')).toContainText('Контроль якості');
  await page.getByRole('button', { name: 'Установити власний напрям' }).click();
  await expect(local).toHaveValue('Власний напрям');
  await expect(local).toHaveAttribute('aria-expanded', 'false');
});

test('IME does not navigate or query until composition commits', async ({ page }) => {
  await open(page);
  const input = address(page);
  await input.focus();
  await input.evaluate((el) => {
    el.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
    (el as HTMLInputElement).value = 'Ки';
    el.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true }));
    el.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        isComposing: true,
        bubbles: true,
        cancelable: true,
      }),
    );
  });
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await input.evaluate((el) => {
    el.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: 'Ки' }));
    el.dispatchEvent(new InputEvent('input', { bubbles: true }));
  });
  await page.clock.runFor(650);
  await expect(suggestions(page).getByRole('option')).toHaveCount(3);
  await expect(input).not.toHaveAttribute('aria-activedescendant');
});

for (const theme of ['dark', 'light'] as const) {
  for (const dir of ['ltr', 'rtl']) {
    test(`open popup stays bounded, wraps and passes axe (${theme}, ${dir})`, async ({ page }) => {
      await page.clock.install();
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.setViewportSize({ width: 320, height: 900 });
      await openGallery(page, 'autocomplete', theme, dir);
      await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
      await lookup(page);
      await address(page).press('ArrowDown');
      const popup = page.locator('.vd-autocomplete__popup[data-open]');
      await expect(popup).toBeVisible();
      const box = await popup.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(320);
      expect(box!.y).toBeGreaterThanOrEqual(0);
      expect(box!.y + box!.height).toBeLessThanOrEqual(901);
      const sizes = await popup.evaluate((el) => ({
        width: el.clientWidth,
        scroll: el.scrollWidth,
      }));
      expect(sizes.scroll).toBeLessThanOrEqual(sizes.width);
      await expect(address(page)).toHaveCSS('outline-style', 'solid');
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(
        results.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
      ).toEqual([]);
      await address(page).press('Escape');
      const arabic = page.getByRole('combobox', { name: 'اسم المؤسسة' });
      await arabic.focus();
      await arabic.press('ArrowDown');
      await expect(page.getByRole('listbox', { name: 'اقتراحات المؤسسات' })).toBeVisible();
      await arabic.press('Enter');
      await expect(arabic).toHaveValue('شركة الصناعات الغذائية');
      const documentWidth = await page.evaluate(() => ({
        width: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      expect(documentWidth.scroll).toBeLessThanOrEqual(documentWidth.width);
    });
  }
}

test('popover fallback supports selection, outside dismissal and forced-color active outlines', async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(HTMLElement.prototype, 'showPopover', {
      configurable: true,
      value: undefined,
    }),
  );
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await open(page);
  await lookup(page);
  await address(page).press('ArrowDown');
  const popup = page.locator('.vd-autocomplete__popup[data-open]');
  await expect(popup).toHaveAttribute('data-fallback');
  await expect(popup.locator('[data-active]')).toHaveCSS('outline-style', 'solid');
  await expect(popup).toHaveCSS('animation-name', 'none');
  await address(page).press('Enter');
  await expect(address(page)).toHaveValue('Київ, вулиця Січових Стрільців, 24');
  await address(page).click();
  await page.getByRole('heading', { name: 'Autocomplete', exact: true }).click();
  await expect(address(page)).toHaveAttribute('aria-expanded', 'false');
});

for (const theme of ['dark', 'light'] as const) {
  test(`request errors and empty results stay readable and axe-clean (${theme})`, async ({
    page,
  }) => {
    await page.clock.install();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 320, height: 900 });
    await openGallery(page, 'autocomplete', theme, 'rtl');
    await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
    for (const query of ['помилка', 'Невідома адреса']) {
      await lookup(page, query);
      await expect(suggestions(page).getByRole('option')).toHaveCount(0);
      await expect(address(page)).not.toHaveAttribute('aria-invalid');
      await address(page).press('ArrowDown');
      await expect(address(page)).not.toHaveAttribute('aria-activedescendant');
      const popup = await suggestions(page).boundingBox();
      expect(popup!.x).toBeGreaterThanOrEqual(0);
      expect(popup!.y).toBeGreaterThanOrEqual(0);
      expect(popup!.y + popup!.height).toBeLessThanOrEqual(901);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(results.violations.map((v) => v.id)).toEqual([]);
      await expect(address(page)).toHaveValue(query);
    }
  });
}
