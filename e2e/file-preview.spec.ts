import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { openGallery } from './fixtures';

test('native modal image preview, keyboard dismissal, trigger focus and exact download', async ({
  page,
}) => {
  await openGallery(page, 'file-preview');
  const trigger = page.getByRole('button', { name: 'Переглянути зображення', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toHaveAccessibleName('План-дільниці.png');
  await expect(dialog.getByRole('button', { name: 'Закрити' })).toBeFocused();
  await expect(dialog.locator('[data-state]')).toHaveAttribute('data-state', 'ready');
  await expect(dialog.getByRole('img')).toHaveAccessibleName(
    'План виробничої дільниці: три позначені зони',
  );
  const download = dialog.getByRole('link', { name: 'Завантажити' });
  const pending = page.waitForEvent('download');
  await download.click();
  const file = await pending;
  expect(file.suggestedFilename()).toBe('План-дільниці.png');
  const stream = await file.createReadStream();
  const parts: Buffer[] = [];
  for await (const part of stream!) parts.push(part);
  expect(Buffer.concat(parts).subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  await dialog.getByRole('button').focus();
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('region')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(download).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(
    page.locator('vd-file-preview img, vd-file-preview object, vd-file-preview a'),
  ).toHaveCount(0);
});

test('error, unsupported, empty and PDF fallback stay actionable', async ({ page }) => {
  await openGallery(page, 'file-preview');
  for (const [trigger, state] of [
    ['Пошкоджене зображення', 'error'],
    ['Текстовий файл', 'unsupported'],
    ['Без файлу', 'empty'],
    ['Переглянути PDF', 'pdf'],
  ]) {
    await page.getByRole('button', { name: trigger, exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.locator('[data-state]')).toHaveAttribute('data-state', state);
    await expect(dialog.getByRole('link')).toHaveCount(state === 'empty' ? 0 : 1);
    if (state === 'pdf') {
      const object = dialog.locator('object');
      await expect(object).toHaveAttribute('type', 'application/pdf');
      const payload = await object.evaluate(async (element) => {
        const response = await fetch(element.getAttribute('data')!);
        return { type: response.headers.get('content-type'), text: await response.text() };
      });
      expect(payload.type).toBe('application/pdf');
      expect(payload.text).toContain('%PDF-1.4');
      await expect(dialog.locator('.vd-file-preview__notice')).toContainText(
        'залежить від браузера',
      );
    }
    await dialog.getByRole('button', { name: 'Закрити' }).click();
  }
});

test('object URLs are revoked on replacement, close and destruction; SVG stays download-only', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const created: string[] = [],
      revoked: string[] = [];
    Object.assign(window, { previewUrls: { created, revoked } });
    const create = URL.createObjectURL.bind(URL),
      revoke = URL.revokeObjectURL.bind(URL);
    URL.createObjectURL = (blob) => {
      const url = create(blob);
      created.push(url);
      return url;
    };
    URL.revokeObjectURL = (url) => {
      revoked.push(url);
      revoke(url);
    };
  });
  await openGallery(page, 'file-preview');
  const input = page.locator('#preview-local');
  await input.setInputFiles({
    name: 'unsafe.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'),
  });
  const dialog = page.getByRole('dialog');
  await expect(dialog.locator('[data-state]')).toHaveAttribute('data-state', 'unsupported');
  await expect(dialog.locator('img, object, iframe, svg')).toHaveCount(0);
  // Programmatic source replacement tests a controlled input change while the page is inert.
  await input.setInputFiles({
    name: 'new.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('новий файл'),
  });
  await expect(dialog).toHaveAccessibleName('new.txt');
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { previewUrls: { revoked: string[] } }).previewUrls.revoked.length,
      ),
    )
    .toBe(1);
  await dialog.getByRole('button').click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { previewUrls: { revoked: string[] } }).previewUrls.revoked.length,
      ),
    )
    .toBe(2);
  await input.setInputFiles({
    name: 'third.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('third'),
  });
  await expect(dialog).toBeVisible();
  await page
    .locator('a[href="/text-highlight"]')
    .first()
    .evaluate((link: HTMLAnchorElement) => link.click());
  await expect(page.locator('vd-file-preview')).toHaveCount(0);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { previewUrls: { revoked: string[] } }).previewUrls.revoked.length,
      ),
    )
    .toBe(3);
});

for (const theme of ['dark', 'light'] as const)
  for (const dir of ['ltr', 'rtl']) {
    test(`long filenames, narrow 200% and axe (${theme}, ${dir})`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 1100 });
      await openGallery(page, 'file-preview', theme, dir);
      await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
      await page
        .getByRole('button', { name: dir === 'rtl' ? 'معاينة الصورة' : 'Довга назва', exact: true })
        .click();
      const dialog = page.getByRole('dialog');
      await expect(dialog.locator('[data-state]')).toHaveAttribute('data-state', 'ready');
      await expect(dialog.getByRole('button')).toBeInViewport();
      await expect(dialog.getByRole('link')).toBeInViewport();
      expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
      expect(
        await dialog
          .locator('.vd-file-preview__heading')
          .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
      ).toBe(true);
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
            .analyze()
        ).violations,
      ).toEqual([]);
    });
  }

test('forced colors, reduced motion and empty state axe', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await openGallery(page, 'file-preview');
  await page.getByRole('button', { name: 'Без файлу', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('button')).toBeFocused();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  const styles = await page.getByRole('dialog').evaluate((el) => {
    const style = getComputedStyle(el);
    const focus = getComputedStyle(el.querySelector('button')!);
    return {
      duration: style.transitionDuration,
      border: style.borderTopStyle,
      outline: focus.outlineStyle,
      width: focus.outlineWidth,
    };
  });
  expect(styles.duration.split(',').every((value) => parseFloat(value) === 0)).toBe(true);
  expect(styles.border).toBe('solid');
  expect(styles.outline).toBe('solid');
  expect(parseFloat(styles.width)).toBeGreaterThan(0);
  await page.emulateMedia({ forcedColors: 'none' });
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Без файлу', exact: true })).toBeFocused();
});
