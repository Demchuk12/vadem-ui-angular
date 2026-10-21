import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { openGallery } from './fixtures';

test.describe('dialog', () => {
  test('opens modally, focuses autofocus, Escape closes and returns focus', async ({ page }) => {
    await openGallery(page, 'dialog');
    const trigger = page.getByRole('button', { name: 'Редагувати профіль' });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Редагувати профіль' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAccessibleDescription(/учасники робочого простору/);
    await expect(dialog.getByLabel('Імʼя')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(page.getByText('Профіль: закрито без дії')).toBeVisible();
  });

  test('focus stays inside while tabbing', async ({ page }) => {
    await openGallery(page, 'dialog');
    await page.getByRole('button', { name: 'Редагувати профіль' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    // Native modal: Tab cycles inside the dialog and may step out to browser UI (body), but never
    // onto the inert page.
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      const ok = await dialog.evaluate(
        (d) => d.contains(document.activeElement) || document.activeElement === document.body,
      );
      expect(ok).toBe(true);
    }
  });

  test('close buttons report their return value', async ({ page }) => {
    await openGallery(page, 'dialog');
    await page.getByRole('button', { name: 'Редагувати профіль' }).click();
    await page.getByRole('button', { name: 'Зберегти' }).click();
    await expect(page.getByText('Профіль: saved')).toBeVisible();
  });

  test('backdrop click dismisses; non-dismissible ignores Escape and backdrop', async ({
    page,
  }) => {
    await openGallery(page, 'dialog');
    await page.getByRole('button', { name: 'Маленький діалог' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(page.getByRole('dialog')).toBeHidden();

    await page.getByRole('button', { name: 'Видалити проєкт' }).click();
    const confirm = page.getByRole('alertdialog');
    await expect(confirm).toBeVisible();
    await page.keyboard.press('Escape');
    await page.mouse.click(5, 5);
    await expect(confirm).toBeVisible();
    await confirm.getByRole('button', { name: 'Залишити' }).click();
    await expect(confirm).toBeHidden();
  });

  test('page does not scroll behind an open dialog', async ({ page }) => {
    await openGallery(page, 'dialog');
    await page.getByRole('button', { name: 'Умови використання' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => getComputedStyle(document.documentElement).overflow))
      .toBe('hidden');
    await page.keyboard.press('Escape');
    await expect
      .poll(() => page.evaluate(() => getComputedStyle(document.documentElement).overflow))
      .toBe('visible');
  });

  test('opening and closing does not shift the page (no flash)', async ({ page }) => {
    await openGallery(page, 'dialog');
    const header = page.locator('.demo-controls');
    const before = (await header.boundingBox())!.x;
    await page.getByRole('button', { name: 'Маленький діалог' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    expect((await header.boundingBox())!.x).toBe(before);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
    expect((await header.boundingBox())!.x).toBe(before);
  });

  test('dialog keeps its geometry on the first frame of the exit transition', async ({ page }) => {
    await openGallery(page, 'dialog');
    await page.getByRole('button', { name: 'Маленький діалог' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await page.waitForTimeout(400);
    const [open, closing] = await dialog.evaluate(async (d: HTMLDialogElement) => {
      const rect = () => {
        const r = d.getBoundingClientRect();
        return [Math.round(r.top), Math.round(r.height)];
      };
      const a = rect();
      d.close();
      await new Promise((r) => requestAnimationFrame(r));
      return [a, rect()];
    });
    expect(closing).toEqual(open);
  });

  test('phones get a bottom sheet', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 780 });
    await openGallery(page, 'dialog');
    await page.getByRole('button', { name: 'Редагувати профіль' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await page.waitForTimeout(500);
    const box = (await dialog.boundingBox())!;
    expect(Math.round(box.y + box.height)).toBe(780);
    expect(box.x).toBe(0);
  });

  for (const theme of ['dark', 'light'] as const) {
    test(`axe on an open dialog (${theme})`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await openGallery(page, 'dialog', theme);
      await page.getByRole('button', { name: 'Редагувати профіль' }).click();
      await page.waitForTimeout(400);
      const results = await new AxeBuilder({ page })
        .include('dialog[open]')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(results.violations.map((v) => v.id)).toEqual([]);
    });
  }
});

test.describe('dialog bottom sheet swipe', () => {
  test.use({ viewport: { width: 390, height: 780 } });

  async function openSheet(page: import('@playwright/test').Page, name: string) {
    await openGallery(page, 'dialog');
    await page.getByRole('button', { name }).click();
    const dialog = page.getByRole('dialog').or(page.getByRole('alertdialog'));
    await expect(dialog).toBeVisible();
    await page.waitForTimeout(450);
    return dialog;
  }

  async function drag(
    page: import('@playwright/test').Page,
    x: number,
    y: number,
    dy: number,
    steps: number,
  ) {
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x, y + dy, { steps });
    await page.mouse.up();
  }

  test('dragging the header down past the threshold closes it', async ({ page }) => {
    const dialog = await openSheet(page, 'Редагувати профіль');
    const header = (await dialog.locator('.vd-dialog__header').boundingBox())!;
    await drag(page, header.x + 60, header.y + 10, 260, 12);
    await expect(dialog).toBeHidden();
    await expect(page.getByText('Профіль: закрито без дії')).toBeVisible();
  });

  test('a short slow drag snaps back', async ({ page }) => {
    const dialog = await openSheet(page, 'Редагувати профіль');
    const header = (await dialog.locator('.vd-dialog__header').boundingBox())!;
    await page.mouse.move(header.x + 60, header.y + 10);
    await page.mouse.down();
    await page.mouse.move(header.x + 60, header.y + 40, { steps: 6 });
    await page.waitForTimeout(300);
    await page.mouse.up();
    await page.waitForTimeout(500);
    await expect(dialog).toBeVisible();
    const box = (await dialog.boundingBox())!;
    expect(Math.round(box.y + box.height)).toBe(780);
  });

  test('non-dismissible sheets have no handle and cannot be swiped away', async ({ page }) => {
    const dialog = await openSheet(page, 'Видалити проєкт');
    const header = dialog.locator('.vd-dialog__header');
    const handle = await header.evaluate((h) => getComputedStyle(h, '::before').content);
    expect(handle).toBe('none');
    const box = (await header.boundingBox())!;
    await drag(page, box.x + 60, box.y + 10, 300, 12);
    await expect(dialog).toBeVisible();
  });
});
