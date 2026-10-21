import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { openGallery } from './fixtures';

test('soft limit preserves pasted text, native editing and Field descriptions through errors', async ({
  page,
}) => {
  await openGallery(page, 'character-count');
  const input = page.getByRole('textbox', {
    name: 'Що змінилося на виробничій дільниці?',
    exact: true,
  });
  const count = page.getByTestId('details-count');
  await expect(count).toHaveAttribute('data-state', 'within');
  await expect(count.locator('[role=status]')).toBeEmpty();
  await input.fill('О'.repeat(125));
  await expect(input).toHaveValue('О'.repeat(125));
  await expect(input).not.toHaveAttribute('maxlength');
  await expect(count).toHaveAttribute('data-state', 'over');
  await expect(count).toContainText('Перевищення на 5 символів.');
  const description = count.locator('.vd-character-count__content');
  const id = await description.getAttribute('id');
  await expect(input).toHaveAttribute('aria-describedby', new RegExp(id!));
  const before = await input.getAttribute('aria-describedby');
  await page.getByRole('button', { name: 'Перевірити опис' }).click();
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  const after = await input.getAttribute('aria-describedby');
  expect(after).not.toBe(before);
  expect(after!.split(' ')).toContain(id);
  await input.fill('Змінили налаштування лінії фасування.');
  await expect(input).toBeFocused();
  await expect(count).toHaveAttribute('data-state', 'within');
  await expect(input).not.toHaveAttribute('aria-invalid', 'true');
  await input.press('Tab');
  await expect(page.getByRole('button', { name: 'Перевірити опис' })).toBeFocused();
  await page.getByRole('button', { name: 'Очистити', exact: true }).click();
  await expect(input).toHaveValue('');
  await expect(count).toContainText('0 / 120');
});

test('announces after a quiet second, resets the timer and suppresses blur or readonly speech', async ({
  page,
}) => {
  await openGallery(page, 'character-count');
  await page.clock.install();
  await page.clock.pauseAt(new Date());
  const input = page.getByRole('textbox', {
    name: 'Що змінилося на виробничій дільниці?',
    exact: true,
  });
  const status = page.getByTestId('details-count').getByRole('status');
  await input.fill('і');
  await page.clock.runFor(32);
  await page.clock.runFor(900);
  await expect(status).toBeEmpty();
  await input.fill('ії');
  await page.clock.runFor(32);
  await page.clock.runFor(900);
  await expect(status).toBeEmpty();
  await page.clock.runFor(100);
  await expect(status).toContainText('2 / 120');
  await input.fill('іїє');
  await page.clock.runFor(32);
  await page.getByRole('button', { name: 'Очистити', exact: true }).focus();
  await page.clock.runFor(1100);
  await expect(status).toBeEmpty();
  await input.fill('іїєґ');
  await page.clock.runFor(32);
  await input.evaluate((el) => ((el as HTMLTextAreaElement).readOnly = true));
  await page.clock.runFor(1100);
  await expect(status).toBeEmpty();
});

test('Reactive Forms buffers IME; UTF-16, Signal Forms, exact and zero limits remain consistent', async ({
  page,
}) => {
  await openGallery(page, 'character-count');
  const input = page.getByRole('textbox', {
    name: 'Що змінилося на виробничій дільниці?',
    exact: true,
  });
  const count = page.getByTestId('details-count');
  await input.dispatchEvent('compositionstart');
  await input.evaluate((el) => {
    (el as HTMLTextAreaElement).value = '日本';
    el.dispatchEvent(new InputEvent('input', { bubbles: true, data: '日本', isComposing: true }));
  });
  await expect(count).toContainText('0 / 120');
  await input.dispatchEvent('compositionend', { data: '日本' });
  await expect(count).toContainText('2 / 120');
  await input.fill('😀');
  await expect(count).toContainText('2 / 120');
  await expect(page.getByTestId('exact-count')).toHaveAttribute('data-state', 'limit');
  await expect(page.getByTestId('zero-count')).toHaveAttribute('data-state', 'limit');
  await page.getByRole('button', { name: 'Завантажити довгу назву' }).click();
  await expect(page.getByTestId('title-count')).toHaveAttribute('data-state', 'over');
  await expect(page.getByRole('textbox', { name: 'Коротка назва звіту', exact: true })).toHaveValue(
    'Звіт із дуже довгою назвою виробничого підрозділу',
  );
  await expect(page.getByTestId('title-count').getByRole('status')).toBeEmpty();
});

for (const theme of ['dark', 'light'] as const) {
  for (const dir of ['ltr', 'rtl'] as const) {
    test(`320px/200%, all count states and axe (${theme}, ${dir})`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 900 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await openGallery(page, 'character-count', theme, dir);
      await page.addStyleTag({ content: 'html { font-size: 200%; }' });
      const input = page.getByRole('textbox', {
        name: 'Що змінилося на виробничій дільниці?',
        exact: true,
      });
      await input.fill('Довгий виробничий коментар. '.repeat(6));
      await page.getByRole('button', { name: 'Перевірити опис' }).click();
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
      for (const count of await page.locator('vd-character-count').all()) {
        expect(
          await count.evaluate((host) => {
            const bounds = host.getBoundingClientRect();
            return [
              ...host.querySelectorAll('.vd-character-count__used, .vd-character-count__message'),
            ].every((el) => {
              const r = el.getBoundingClientRect();
              return r.left >= bounds.left - 1 && r.right <= bounds.right + 1;
            });
          }),
        ).toBe(true);
      }
      expect(
        await page
          .getByTestId('details-count')
          .locator('.vd-character-count__used')
          .evaluate((el) => getComputedStyle(el).direction),
      ).toBe('ltr');
      const arabic = page.locator('[lang=ar]');
      await arabic.getByRole('textbox').fill('ملاحظات');
      await expect(arabic.locator('vd-character-count')).toContainText('عدد الأحرف المتبقية:');
    });
  }
}

test('forced colors retains textual excess cue and native focus; reduced motion remains static', async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await openGallery(page, 'character-count');
  const input = page.getByRole('textbox', {
    name: 'Що змінилося на виробничій дільниці?',
    exact: true,
  });
  await input.fill('а'.repeat(121));
  await expect(input).toBeFocused();
  await expect(page.getByTestId('details-count')).toContainText('Перевищення на 1 символ.');
  expect(await input.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid');
  expect(
    await page
      .getByTestId('details-count')
      .evaluate((el) => getComputedStyle(el).transitionDuration),
  ).toBe('0s');
});
