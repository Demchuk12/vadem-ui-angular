import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { openGallery, type Theme } from './fixtures';

const experience = (page: Page) =>
  page.getByRole('radiogroup', { name: 'Оцініть консультацію', exact: true });
const save = (page: Page) => page.getByRole('button', { name: 'Зберегти оцінку', exact: true });
async function openRating(page: Page, theme: Theme = 'dark', dir = 'ltr') {
  await openGallery(page, 'rating', theme, dir);
  await expect(page.getByRole('heading', { name: 'Rating', exact: true })).toBeVisible();
  await expect(page.locator('vd-rating').getByRole('radiogroup')).toHaveCount(10);
}

for (const dir of ['ltr', 'rtl']) {
  test(`one Tab stop, wrapping arrows, endpoints and native activation (${dir})`, async ({
    page,
  }) => {
    await openRating(page, 'dark', dir);
    const group = experience(page);
    const first = group.getByRole('radio', { name: '1 з 5 зірок', exact: true });
    await first.focus();
    await first.press(dir === 'ltr' ? 'ArrowRight' : 'ArrowLeft');
    await expect(group.getByRole('radio', { name: '2 з 5 зірок', exact: true })).toBeFocused();
    await expect(page.getByTestId('rating-value')).toHaveText('2 / 5');
    await page.keyboard.press('Home');
    await page.keyboard.press('ArrowUp');
    await expect(group.getByRole('radio', { name: '5 з 5 зірок', exact: true })).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(first).toBeFocused();
    await page.keyboard.press('End');
    await page.keyboard.press('Space');
    await expect(group.getByRole('radio', { checked: true })).toHaveCount(1);
    await page.keyboard.press('Tab');
    await expect(save(page)).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(group.getByRole('radio', { name: '5 з 5 зірок', exact: true })).toBeFocused();
    await expect(group.getByRole('radio', { name: '5 з 5 зірок', exact: true })).toHaveCSS(
      'outline-style',
      'solid',
    );
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('rating-status')).toHaveText('Демонстраційну оцінку збережено');
  });
}

test('hover previews shape without committing; pointer selection updates form and reset restores empty', async ({
  page,
}) => {
  await openRating(page);
  const group = experience(page);
  await group.getByRole('radio', { name: '4 з 5 зірок', exact: true }).hover();
  await expect(group.locator('[data-filled]')).toHaveCount(4);
  await expect(group.getByRole('radio', { checked: true })).toHaveCount(0);
  await expect(page.getByTestId('rating-value')).toHaveText('Ще без оцінки');
  await page.getByRole('heading', { name: 'Rating', exact: true }).hover();
  await expect(group.locator('[data-filled]')).toHaveCount(0);
  await group.getByRole('radio', { name: '3 з 5 зірок', exact: true }).click();
  await expect(page.getByTestId('rating-value')).toHaveText('3 / 5');
  await page.getByRole('heading', { name: 'Rating', exact: true }).hover();
  await expect(group.locator('[data-filled]')).toHaveCount(3);
  await page.getByRole('button', { name: 'Скинути оцінку', exact: true }).click();
  await expect(group.getByRole('radio', { checked: true })).toHaveCount(0);
  await expect(page.getByTestId('rating-value')).toHaveText('Ще без оцінки');
});

test('required errors, disabled preservation and readonly inspection', async ({ page }) => {
  await openRating(page);
  await save(page).click();
  const group = experience(page);
  await expect(group).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByText('Оберіть оцінку від 1 до 5', { exact: true })).toBeVisible();
  await group.getByRole('radio', { name: '4 з 5 зірок', exact: true }).click();
  await expect(group).not.toHaveAttribute('aria-invalid', 'true');
  await page.getByRole('button', { name: 'Перемкнути доступність', exact: true }).click();
  for (const radio of await group.getByRole('radio').all()) await expect(radio).toBeDisabled();
  await expect(page.getByTestId('rating-value')).toHaveText('4 / 5');
  await page.getByRole('button', { name: 'Перемкнути доступність', exact: true }).click();
  await expect(group.getByRole('radio', { name: '4 з 5 зірок', exact: true })).toBeChecked();
  const readonly = page.getByRole('radiogroup', { name: 'Опублікований відгук', exact: true });
  await expect(readonly).toHaveAttribute('aria-readonly', 'true');
  const current = readonly.getByRole('radio', { checked: true });
  await current.focus();
  await current.press('ArrowRight');
  await current.press('Home');
  await expect(current).toBeFocused();
  await readonly.getByRole('radio', { name: '1 з 5 зірок', exact: true }).click();
  await expect(current).toBeChecked();
  await readonly.getByRole('radio', { name: '1 з 5 зірок', exact: true }).press('Space');
  await expect(current).toBeChecked();
});

test('Signal Forms touch, native-button writes and external replacement', async ({ page }) => {
  await openRating(page);
  const group = page.getByRole('radiogroup', { name: 'Оцініть доставку', exact: true });
  await group.getByRole('radio').first().focus();
  const set = page.getByRole('button', { name: 'Установити 4 зірки', exact: true });
  await set.focus();
  await expect(group).toHaveAttribute('aria-invalid', 'true');
  await set.press('Enter');
  await expect(group.getByRole('radio', { name: '4 з 5 зірок', exact: true })).toBeChecked();
  await expect(group).not.toHaveAttribute('aria-invalid', 'true');
  await group.getByRole('radio', { name: '2 з 5 зірок', exact: true }).click();
  await expect(page.getByTestId('rating-signal-value')).toHaveText('2 / 5');
});

for (const dir of ['ltr', 'rtl']) {
  test(`320px and 200% text preserve labels and five reachable stars (${dir})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await openRating(page, 'dark', dir);
    await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
    for (const theme of ['dark', 'light']) {
      await page.evaluate(
        (theme) => document.documentElement.setAttribute('data-theme', theme),
        theme,
      );
      expect(
        await page.locator('.vd-rating__stars').evaluateAll((groups) =>
          groups.every((group) => {
            const box = group.getBoundingClientRect();
            return Array.from(group.querySelectorAll('button')).every((button) => {
              const star = button.getBoundingClientRect();
              return star.width >= 24 && star.left >= box.left - 1 && star.right <= box.right + 1;
            });
          }),
        ),
      ).toBe(true);
    }
    const arabic = page.getByRole('radiogroup', {
      name: 'كيف كانت تجربتك مع الفريق؟',
      exact: true,
    });
    await arabic.getByRole('radio', { name: '2 من 5 نجوم', exact: true }).click();
    await expect(arabic.getByRole('radio', { name: '2 من 5 نجوم', exact: true })).toBeChecked();
  });
}

test('forced colors preserve solid stars and focus; reduced motion disables transitions', async ({
  page,
}) => {
  await openRating(page);
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  const radio = experience(page).getByRole('radio', { name: '3 з 5 зірок', exact: true });
  await radio.focus();
  await radio.press('Space');
  await expect(radio).toHaveCSS('outline-style', 'solid');
  expect(await radio.locator('svg').evaluate((el) => getComputedStyle(el).fill)).not.toBe('none');
  expect(
    await radio.evaluate((el) =>
      getComputedStyle(el)
        .transitionDuration.split(',')
        .every((value) => parseFloat(value) === 0),
    ),
  ).toBe(true);
});

for (const theme of ['dark', 'light'] as const) {
  test(`Rating axe with required error and every state (${theme})`, async ({ page }) => {
    await openRating(page, theme);
    await save(page).click();
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(
      result.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
    ).toEqual([]);
  });
}
