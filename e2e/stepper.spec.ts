import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { openGallery } from './fixtures';

test('native keyboard navigation skips disabled stages and preserves focus on activation', async ({
  page,
}) => {
  await openGallery(page, 'stepper');
  const nav = page.getByRole('navigation', { name: 'Публікація', exact: true });
  const draft = nav.getByRole('button', { name: 'Чернетка', exact: true });
  const review = nav.getByRole('button', { name: 'Перевірка', exact: true });
  await draft.focus();
  await draft.press('Enter');
  await expect(draft).toHaveAttribute('aria-current', 'step');
  await draft.press('Tab');
  await expect(review).toBeFocused();
  await review.press('Space');
  await expect(review).toHaveAttribute('aria-current', 'step');
  await expect(review).toBeFocused();
  await review.press('Tab');
  await expect(nav.getByRole('button', { name: 'Публікація' })).not.toBeFocused();
  await expect(
    page.getByRole('navigation', { name: 'Завершений процес' }).locator('button:enabled'),
  ).toHaveCount(0);
});

test('wizard validates, unlocks stages, restores previous values and focuses the new heading', async ({
  page,
}) => {
  await openGallery(page, 'stepper');
  const nav = page.getByRole('navigation', { name: 'Створення робочого простору' });
  const next = page.getByRole('button', { name: 'Продовжити', exact: true });
  await next.click();
  await expect(page.getByRole('textbox', { name: 'Назва простору' })).toHaveAttribute(
    'aria-invalid',
    'true',
  );
  await expect(nav.getByRole('button', { name: 'Контакт', exact: true })).toBeDisabled();
  await page.getByRole('textbox', { name: 'Назва простору' }).fill('Українська команда');
  await next.click();
  await expect(page.getByRole('heading', { name: 'Додайте контакт' })).toBeFocused();
  await page.getByRole('textbox', { name: 'Контактний email' }).fill('team@example.ua');
  await next.click();
  await expect(page.getByRole('heading', { name: 'Перевірте дані' })).toBeFocused();
  await expect(nav.locator('[data-completed]')).toHaveCount(2);
  await nav.getByRole('button', { name: 'Робочий простір', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Назва простору' })).toHaveValue(
    'Українська команда',
  );
  await page.getByRole('textbox', { name: 'Назва простору' }).fill('');
  await nav.getByRole('button', { name: 'Підтвердження', exact: true }).click();
  await page.getByRole('button', { name: 'Створити простір' }).click();
  await expect(page.getByRole('textbox', { name: 'Назва простору' })).toHaveAttribute(
    'aria-invalid',
    'true',
  );
  await page.getByRole('textbox', { name: 'Назва простору' }).fill('Нова команда');
  await next.click();
  await next.click();
  await page.getByRole('button', { name: 'Створити простір' }).click();
  await expect(page.getByRole('heading', { name: 'Усе готово' })).toBeFocused();
  await page.getByRole('button', { name: 'Почати знову' }).click();
  await expect(page.getByRole('textbox', { name: 'Назва простору' })).toHaveValue('');
  await expect(nav.locator('[data-completed]')).toHaveCount(0);
});

for (const theme of ['dark', 'light'] as const) {
  test(`axe and focus/hover states (${theme})`, async ({ page }) => {
    await openGallery(page, 'stepper', theme);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const nav = page.getByRole('navigation', { name: 'Публікація', exact: true });
    const draft = nav.getByRole('button', { name: 'Чернетка' });
    await draft.focus();
    await draft.hover();
    // Interaction checks cover stage content; the gallery suite audits the entire page.
    const results = await new AxeBuilder({ page })
      .include('main')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(
      results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`),
    ).toEqual([]);
    await nav.locator('..').screenshot({ path: `screenshots/stepper-${theme}-focus-hover.png` });
  });
}

test('responsive stacking, RTL, text zoom and forced colors preserve content', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await openGallery(page, 'stepper', 'light', 'rtl');
  await page.addStyleTag({ content: 'html { font-size: 200%; }' });
  const navs = page.locator('nav[vdStepper]');
  expect(
    await navs.evaluateAll((navs) =>
      navs.some(
        (n) => n.scrollWidth > n.clientWidth || n.getBoundingClientRect().width > window.innerWidth,
      ),
    ),
  ).toBe(false);
  await expect(navs.first().locator('ol')).toHaveCSS('flex-direction', 'column');
  const rtl = page.getByRole('navigation', { name: 'إنشاء مساحة العمل' });
  await rtl.getByRole('button', { name: 'التأكيد' }).focus();
  await page.keyboard.press('Enter');
  await expect(rtl.getByRole('button', { name: 'التأكيد' })).toHaveAttribute(
    'aria-current',
    'step',
  );
  await page.screenshot({ path: 'screenshots/stepper-320-rtl-forced-colors.png', fullPage: true });
});
