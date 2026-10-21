import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { openGallery } from './fixtures';

test('native Enter/Space disclosure keeps focus and restores exactly selectable source text', async ({
  page,
}) => {
  await openGallery(page, 'expandable-text');
  const main = page.getByTestId('main-description'),
    button = main.getByRole('button');
  const content = main.locator('p'),
    rest = main.locator('.vd-expandable-text__rest');
  const full = (await content.textContent())!.replace(/…$/, '');
  const target = await button.getAttribute('aria-controls');
  expect(target).toBe(await rest.getAttribute('id'));
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(rest).toBeHidden();
  await button.focus();
  await button.press('Enter');
  await expect(button).toBeFocused();
  await expect(button).toHaveText('Згорнути');
  expect(await content.textContent()).toBe(full);
  await expect(rest).toBeVisible();
  const selected = await content.evaluate((el) => {
    const range = el.ownerDocument.createRange();
    range.selectNodeContents(el);
    const selection = el.ownerDocument.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
    const text = selection.toString();
    selection.removeAllRanges();
    return text;
  });
  expect(selected).toBe(full);
  await button.press('Space');
  await expect(button).toBeFocused();
  await expect(rest).toBeHidden();
  await button.press('Tab');
  await expect(page.getByRole('textbox', { name: 'Текст опису', exact: true })).toBeFocused();
  await expect(page.getByTestId('short-description').getByRole('button')).toHaveCount(0);
  await expect(page.getByTestId('empty-description').getByRole('button')).toHaveCount(0);
});

test('dynamic text, external state, literal HTML and emoji keep their content contract', async ({
  page,
}) => {
  await openGallery(page, 'expandable-text');
  const textarea = page.getByRole('textbox', { name: 'Текст опису', exact: true });
  const target = page.getByTestId('changing-description');
  const source =
    '  Ї Є І Ґ\n\n<img src=x onerror="alert(1)"> <strong>це текст</strong> ' +
    '👨‍👩‍👧‍👦е́🇺🇦'.repeat(50) +
    '  ';
  await textarea.fill(source);
  await target.getByRole('button').click();
  await expect(target.locator('p')).toHaveJSProperty('textContent', source);
  await expect(target.locator('img,strong,script')).toHaveCount(0);
  const external = page.getByRole('button', { name: 'Змінити стан ззовні', exact: true });
  await external.click();
  await expect(external).toBeFocused();
  await expect(target.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
  await textarea.fill('Коротко.');
  await expect(target.getByRole('button')).toHaveCount(0);
  await expect(textarea).toBeFocused();
  await textarea.fill('');
  await expect(target).toHaveAttribute('data-state', 'empty');
  const unicode = page.getByTestId('unicode-description');
  expect(await unicode.locator('p').innerText()).toBe('Ї 👨‍👩‍👧‍👦 е́…');
  await unicode.getByRole('button').click();
  await expect(unicode.locator('p')).toContainText('🇺🇦');
});

test('removing a focused toggle recovers paragraph focus and never steals outside focus', async ({
  page,
}) => {
  await openGallery(page, 'expandable-text');
  const textarea = page.getByRole('textbox', { name: 'Текст опису', exact: true });
  const target = page.getByTestId('changing-description');
  await target.getByRole('button').focus();
  await textarea.evaluate((element: HTMLTextAreaElement) => {
    element.value = 'Коротко.';
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect(target.getByRole('button')).toHaveCount(0);
  await expect(target.locator('p')).toBeFocused();
  await textarea.fill('Знову довгий текст. '.repeat(30));
  await target.getByRole('button').focus();
  await textarea.fill('Ще коротше.');
  await expect(textarea).toBeFocused();
  await expect(target.getByRole('button')).toHaveCount(0);
});

test('fallback without Intl.Segmenter shows complete content without controls', async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(Intl, 'Segmenter', { configurable: true, value: undefined }),
  );
  await openGallery(page, 'expandable-text');
  const main = page.getByTestId('main-description');
  await expect(main.getByRole('button')).toHaveCount(0);
  await expect(main).toHaveAttribute('data-state', 'plain');
  await expect(main.locator('p')).toContainText('Кожен компонент');
});

for (const theme of ['dark', 'light'] as const)
  for (const dir of ['ltr', 'rtl']) {
    test(`both states, narrow 200% and axe (${theme}, ${dir})`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 1000 });
      await openGallery(page, 'expandable-text', theme, dir);
      await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
      const target = page.getByTestId(dir === 'rtl' ? 'rtl-description' : 'unbroken-description'),
        button = target.getByRole('button');
      await button.focus();
      await button.press('Enter');
      await expect(button).toBeFocused();
      await expect(button).toHaveAttribute('aria-expanded', 'true');
      expect(await target.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
            .analyze()
        ).violations,
      ).toEqual([]);
      await button.press('Space');
      await expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
            .analyze()
        ).violations,
      ).toEqual([]);
    });
  }

test('system colors, keyboard outline and reduced motion keep a static usable disclosure', async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await openGallery(page, 'expandable-text');
  const main = page.getByTestId('main-description'),
    button = main.getByRole('button');
  await button.focus();
  await button.press('Enter');
  const styles = await button.evaluate((el) => {
    const s = getComputedStyle(el);
    return { outline: s.outlineStyle, width: s.outlineWidth, transition: s.transitionDuration };
  });
  expect(styles.outline).toBe('solid');
  expect(parseFloat(styles.width)).toBeGreaterThan(0);
  expect(styles.transition.split(',').every((value) => parseFloat(value) === 0)).toBe(true);
  await expect(button).toBeFocused();
  await button.press('Space');
  await expect(button).toHaveAttribute('aria-expanded', 'false');
});
