import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { openGallery } from './fixtures';

const uploads = (page: Page) => page.getByRole('list', { name: 'Файли проєкту', exact: true });
const row = (page: Page, name: string) =>
  uploads(page)
    .getByRole('listitem')
    .filter({ has: page.locator('bdi', { hasText: name }) });
const picked = {
  name: 'Звіт.csv',
  mimeType: 'text/csv',
  buffer: Buffer.from('name,total\nОлена,42'),
};

test('cancel and retry preserve focus and canceled work cannot resume itself', async ({ page }) => {
  await page.clock.install();
  await openGallery(page, 'upload-list');
  await page.getByTestId('upload-input').setInputFiles(picked);
  const item = row(page, 'Звіт.csv');
  await item.getByRole('button', { name: 'Скасувати Звіт.csv', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(item).toHaveAttribute('data-state', 'canceled');
  const retry = item.getByRole('button', { name: 'Повторити Звіт.csv', exact: true });
  await expect(retry).toBeFocused();
  await page.clock.runFor(2400);
  await expect(item).toHaveAttribute('data-state', 'canceled');
  await retry.press('Space');
  await expect(item).toHaveAttribute('data-state', 'uploading');
  await expect(item.getByRole('button', { name: 'Скасувати Звіт.csv', exact: true })).toBeFocused();
  await page.clock.runFor(1500);
  await expect(item).toHaveAttribute('data-state', 'success');
  await expect(item.getByRole('button', { name: 'Видалити Звіт.csv', exact: true })).toBeFocused();
});

test('removing rows recovers adjacent focus and then the named empty list', async ({ page }) => {
  await openGallery(page, 'upload-list');
  const rows = uploads(page).locator('.vd-upload-list__item');
  await expect(rows.first()).toBeVisible();
  const initialCount = await rows.count();
  await uploads(page).getByRole('button').first().focus();
  await page.keyboard.press('Enter');
  await expect(rows).toHaveCount(initialCount - 1);
  await expect(uploads(page).getByRole('button').first()).toBeFocused();
  for (let remaining = await rows.count(); remaining > 0; remaining--) {
    const first = rows.first();
    if (['queued', 'uploading'].includes((await first.getAttribute('data-state'))!)) {
      await first.getByRole('button').first().press('Enter');
      await expect(first).toHaveAttribute('data-state', 'canceled');
    }
    const remove = first.getByRole('button', { name: /^Видалити / });
    await remove.focus();
    await remove.press('Enter');
    await expect(rows).toHaveCount(remaining - 1);
  }
  await expect(uploads(page)).toBeFocused();
  await expect(uploads(page)).toContainText('Додайте перший файл');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Відновити приклад', exact: true })).toBeFocused();
});

test('duplicate filenames remain independent; progress is native and non-chatty', async ({
  page,
}) => {
  await page.clock.install();
  await openGallery(page, 'upload-list');
  await page.getByTestId('upload-input').setInputFiles([picked, picked]);
  const items = row(page, 'Звіт.csv');
  await expect(items).toHaveCount(2);
  await items
    .first()
    .getByRole('button', { name: /^Скасувати / })
    .click();
  await page.clock.runFor(300);
  await expect(items.first()).toHaveAttribute('data-state', 'canceled');
  await expect(items.last().getByRole('progressbar')).toHaveAttribute('value', '20');
  await expect(items.last().getByRole('status')).not.toContainText('%');
  await page.clock.runFor(1200);
  await expect(items.last()).toHaveAttribute('data-state', 'success');
  await items
    .first()
    .getByRole('button', { name: /^Видалити / })
    .click();
  await expect(items).toHaveCount(1);
  await expect(items).toHaveAttribute('data-state', 'success');
  const unknown = row(page, 'Протокол_випробувань.pdf').getByRole('progressbar');
  await expect(unknown).not.toHaveAttribute('value');
  const arabic = page.getByRole('list', { name: 'مرفقات المشروع', exact: true });
  await arabic.getByRole('button', { name: /^إعادة المحاولة / }).click();
  await page.getByRole('button', { name: 'Відновити приклад', exact: true }).click();
  await page.clock.runFor(1500);
  await expect(arabic.locator('[data-state=success]')).toHaveCount(2);
});

for (const theme of ['dark', 'light'] as const) {
  for (const dir of ['ltr', 'rtl']) {
    test(`states, narrow/enlarged text and axe (${theme}, ${dir})`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 900 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await openGallery(page, 'upload-list', theme, dir);
      await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
      const dimensions = await page.evaluate(() => ({
        width: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width);
      const locked = page.getByRole('list', { name: 'Вкладення закритого проєкту', exact: true });
      for (const button of await locked.getByRole('button').all())
        await expect(button).toBeDisabled();
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(
        results.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
      ).toEqual([]);
    });
  }
}

test('forced colors retains state, boundaries and keyboard outlines', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await openGallery(page, 'upload-list');
  const button = uploads(page).getByRole('button').first();
  await button.focus();
  await expect(button).toHaveCSS('outline-style', 'solid');
  await expect(uploads(page).locator('.vd-upload-list__item').first()).toHaveCSS(
    'border-block-end-style',
    'solid',
  );
  await expect(row(page, 'Технічне_завдання.pdf').getByRole('status')).toContainText('Завантажено');
  const running = row(page, 'Протокол_випробувань.pdf').getByRole('progressbar');
  await expect(running).toHaveCSS('animation-name', 'none');
});
