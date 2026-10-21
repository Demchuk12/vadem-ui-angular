import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { openGallery } from './fixtures';

test('highlights every literal match, preserves result/link text and keeps native focus order', async ({
  page,
}) => {
  await openGallery(page, 'text-highlight');
  const search = page.getByRole('searchbox', { name: 'Що підсвітити?', exact: true });
  const results = page.getByTestId('highlight-results');
  await expect(results.locator('mark')).toHaveCount(5);
  const original = await results.textContent();
  await search.fill('ЗВІТ');
  await expect(search).toBeFocused();
  await expect(results.locator('mark')).toHaveCount(5);
  await expect(results.getByRole('link').first()).toHaveAccessibleName('Звіт за виробничу зміну');
  await search.press('Escape');
  await expect(results.locator('mark')).toHaveCount(0);
  expect(await results.textContent()).toBe(original);
  const links = results.getByRole('link');
  await links.nth(0).focus();
  await links.nth(0).press('Tab');
  await expect(links.nth(1)).toBeFocused();
  await search.fill('НЕМАЄЗБІГУ');
  await expect(results.locator('mark')).toHaveCount(0);
  await expect(results.locator('li')).toHaveCount(3);
});

test('literal metacharacters and apparent HTML remain original selectable text', async ({
  page,
}) => {
  await openGallery(page, 'text-highlight');
  const target = page.getByTestId('literal-highlight');
  await expect(target.locator('mark')).toHaveText(['[line].*', '[LINE].*']);
  const source = '<img src=x onerror="alert(1)">\n  [x].* <script>alert(1)</script>  ';
  await page.getByRole('textbox', { name: 'Текст прикладу', exact: true }).fill(source);
  await page.getByRole('textbox', { name: 'Дослівний запит', exact: true }).fill('[x].*');
  await expect(target.locator('mark')).toHaveText('[x].*');
  expect(await target.textContent()).toBe(source);
  await expect(target.locator('img, script')).toHaveCount(0);
  const selected = await target.evaluate((el) => {
    const range = el.ownerDocument.createRange();
    range.selectNodeContents(el);
    const selection = el.ownerDocument.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
    const text = selection.toString();
    selection.removeAllRanges();
    return text;
  });
  expect(selected).toBe(source);
  await expect(page.getByTestId('ukrainian-highlight').locator('mark')).toHaveText([
    'ЇЖАК',
    'їжак',
  ]);
  await expect(page.getByTestId('arabic-highlight').locator('mark')).toHaveCount(2);
});

test('Autocomplete highlights labels while preserving names, keyboard selection and input focus', async ({
  page,
}) => {
  await openGallery(page, 'text-highlight');
  const input = page.getByRole('combobox', { name: 'Знайти документ', exact: true });
  await input.press('ArrowDown');
  const list = page.getByRole('listbox');
  await expect(list.getByRole('option')).toHaveCount(3);
  await expect(list.locator('mark')).toHaveCount(2);
  const first = list.getByRole('option').first();
  await expect(first).toHaveAccessibleName('Звіт за виробничу зміну');
  await expect(input).toBeFocused();
  await input.press('Enter');
  await expect(input).toHaveValue('Звіт за виробничу зміну');
  await expect(input).toBeFocused();
  await expect(list).toBeHidden();
  await input.fill('Журнал');
  await input.press('ArrowDown');
  const disabled = list.getByRole('option', {
    name: 'Журнал технічного обслуговування',
    exact: true,
  });
  await expect(disabled).toHaveAttribute('aria-disabled', 'true');
  await expect(disabled.locator('mark')).toHaveText('Журнал');
  expect(await disabled.locator('mark').evaluate((el) => getComputedStyle(el).color)).toBe(
    await disabled.evaluate((el) => getComputedStyle(el).color),
  );
  await input.fill('немає');
  await input.press('ArrowDown');
  await expect(list.locator('mark')).toHaveCount(0);
  await expect(list.getByRole('option')).toHaveCount(3);
  await input.press('Escape');
  await expect(input).toBeFocused();
});

for (const theme of ['dark', 'light'] as const) {
  for (const dir of ['ltr', 'rtl'] as const) {
    test(`320px/200%, inline wrapping and open-popup axe (${theme}, ${dir})`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 900 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await openGallery(page, 'text-highlight', theme, dir);
      await page.addStyleTag({ content: 'html { font-size: 200%; }' });
      const input = page.getByRole('combobox', { name: 'Знайти документ', exact: true });
      await input.press('ArrowDown');
      await expect(page.getByRole('listbox').locator('mark')).toHaveCount(2);
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
      const expected = 'ВідповідальністьЗаЯкістьВиробничоїДільниці'.repeat(3);
      expect(await page.getByTestId('long-highlight').textContent()).toBe(expected);
      await expect(page.getByTestId('long-highlight').locator('mark')).toHaveCount(3);
      expect(
        await page.getByTestId('arabic-highlight').evaluate((el) => getComputedStyle(el).direction),
      ).toBe('rtl');
      await input.press('Escape');
    });
  }
}

test('forced colors retains a non-color mark cue and reduced motion is static', async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await openGallery(page, 'text-highlight');
  const mark = page.getByTestId('highlight-results').locator('mark').first();
  expect(await mark.evaluate((el) => getComputedStyle(el).textDecorationLine)).toContain(
    'underline',
  );
  expect(await mark.evaluate((el) => getComputedStyle(el).transitionDuration)).toBe('0s');
  await page.getByRole('searchbox').focus();
  await expect(page.getByRole('searchbox')).toBeFocused();
});
