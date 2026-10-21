import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { openGallery } from './fixtures';

test('invalid submit focuses the summary; native link order and Enter focus exact field IDs', async ({
  page,
}) => {
  await openGallery(page, 'form-error-summary');
  const summary = page.getByTestId('live-summary');
  await expect(summary).toBeHidden();
  await page.getByRole('button', { name: 'Надіслати заявку' }).click();
  await expect(summary).toBeFocused();
  await expect(summary.getByRole('link')).toHaveCount(3);
  const url = page.url();
  await page.keyboard.press('Tab');
  await expect(summary.getByRole('link').nth(0)).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(summary.getByRole('link').nth(1)).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(
    page.getByRole('textbox', { name: 'Робоча електронна пошта', exact: true }),
  ).toBeFocused();
  expect(page.url()).toBe(url);
  const input = page.getByRole('textbox', { name: 'Робоча електронна пошта', exact: true });
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  const message = await summary.getByRole('link').nth(1).textContent();
  const describedBy = await input.getAttribute('aria-describedby');
  await expect(page.locator(`[id="${describedBy}"]`)).toContainText(message!);
  await page.getByRole('button', { name: 'Надіслати заявку' }).click();
  await expect(summary).toBeFocused();
});

test('fixing errors keeps focus, updates the list and permits successful local validation', async ({
  page,
}) => {
  await openGallery(page, 'form-error-summary');
  const summary = page.getByTestId('live-summary');
  await page.getByRole('button', { name: 'Надіслати заявку' }).click();
  await summary.getByRole('link').first().click();
  const name = page.getByRole('textbox', { name: 'Ім’я та прізвище', exact: true });
  await expect(name).toBeFocused();
  await name.fill('Олена Коваль');
  await expect(name).toBeFocused();
  await expect(summary.getByRole('link')).toHaveCount(2);
  await page
    .getByRole('textbox', { name: 'Робоча електронна пошта', exact: true })
    .fill('olena@example.com');
  await page
    .getByRole('textbox', {
      name: 'Мета доступу до виробничих звітів і відповідальний підрозділ',
      exact: true,
    })
    .fill('Аналіз якості на дільниці фасування.');
  await expect(summary).toBeHidden();
  await page.getByRole('button', { name: 'Надіслати заявку' }).click();
  await expect(page.getByTestId('request-result')).toContainText('Дані перевірено');
  await expect(page.getByRole('button', { name: 'Надіслати заявку' })).toBeFocused();
});

test('unavailable fields keep focus on their link without changing the URL or target attributes', async ({
  page,
}) => {
  await openGallery(page, 'form-error-summary');
  await page.getByRole('button', { name: 'Надіслати заявку' }).click();
  const link = page.getByTestId('live-summary').getByRole('link').first();
  const input = page.locator('[id="request-name"]');
  const url = page.url();
  for (const state of ['disabled', 'hidden', 'inert', 'missing']) {
    await input.evaluate((field, state) => {
      field.removeAttribute('disabled');
      field.removeAttribute('hidden');
      field.removeAttribute('inert');
      if (state === 'missing') field.remove();
      else field.setAttribute(state, '');
    }, state);
    await link.click();
    await expect(link).toBeFocused();
    expect(page.url()).toBe(url);
  }
});

for (const theme of ['dark', 'light'] as const) {
  for (const dir of ['ltr', 'rtl'] as const) {
    test(`axe, keyboard and 320px/200% content (${theme}, ${dir})`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 900 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await openGallery(page, 'form-error-summary', theme, dir);
      await page.addStyleTag({ content: 'html { font-size: 200%; }' });
      await page.getByRole('button', { name: 'Надіслати заявку' }).click();
      const summary = page.getByTestId('live-summary');
      await expect(summary).toBeFocused();
      await expect
        .poll(() => summary.evaluate((el) => el.getBoundingClientRect().top))
        .toBeGreaterThanOrEqual(0);
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
      for (const region of await page.locator('vd-form-error-summary').all()) {
        const contained = await region.evaluate((host) => {
          const bounds = host.getBoundingClientRect();
          return [...host.querySelectorAll('a, h2, p')].every((el) => {
            const rect = el.getBoundingClientRect();
            return rect.left >= bounds.left && rect.right <= bounds.right;
          });
        });
        expect(contained).toBe(true);
      }
      const arabic = page.locator('[lang=ar]');
      await arabic.getByRole('link').click();
      await expect(arabic.getByRole('textbox')).toBeFocused();
    });
  }
}

test('forced colors preserves the border and focus; reduced motion adds no transitions', async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await openGallery(page, 'form-error-summary');
  await page.getByRole('button', { name: 'Надіслати заявку' }).click();
  const summary = page.getByTestId('live-summary');
  await expect(summary).toBeFocused();
  expect(await summary.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid');
  expect(await summary.evaluate((el) => getComputedStyle(el).borderTopStyle)).toBe('solid');
  expect(await summary.evaluate((el) => getComputedStyle(el).transitionDuration)).toBe('0s');
  await page.keyboard.press('Tab');
  const link = summary.getByRole('link').first();
  await expect(link).toBeFocused();
  expect(await link.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid');
});
