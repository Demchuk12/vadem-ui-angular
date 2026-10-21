import { expect, test } from '@playwright/test';
import { openGallery } from './fixtures';

test.describe('radio + fieldset', () => {
  test('arrows move the choice inside the group; the group error shows after submit', async ({
    page,
  }) => {
    await openGallery(page, 'radio');
    const group = page.getByRole('group', { name: 'Тарифний план' });
    await page.getByRole('button', { name: 'Продовжити' }).click();
    await expect(group.getByText('Оберіть план, щоб продовжити')).toBeVisible();
    await expect(group).toHaveAttribute('aria-describedby', /vd-fieldset-error/);

    const free = group.getByRole('radio', { name: /Free/ });
    await free.focus();
    await page.keyboard.press('Space');
    await expect(free).toBeChecked();
    await page.keyboard.press('ArrowDown');
    await expect(group.getByRole('radio', { name: /Team/ })).toBeChecked();
    await expect(group.getByText('Оберіть план, щоб продовжити')).toBeHidden();
  });
});

test.describe('slider', () => {
  test('keyboard changes the value and the fill follows', async ({ page }) => {
    await openGallery(page, 'slider');
    const slider = page.getByRole('slider', { name: 'Прозорість фону' });
    await slider.focus();
    await page.keyboard.press('ArrowRight');
    await expect(slider).toHaveValue('61');
    await page.keyboard.press('End');
    await expect(slider).toHaveValue('100');
    await expect(slider).toHaveAttribute('style', /--vd-slider-fill: 100%/);
    await expect(slider).toHaveAttribute('aria-valuetext', '100 відсотків');
  });

  test('form writes update the fill without an input event', async ({ page }) => {
    await openGallery(page, 'slider');
    await page.getByRole('button', { name: 'Максимум' }).click();
    const budget = page.getByRole('slider', { name: 'Бюджет на місяць' });
    await expect(budget).toHaveValue('50000');
    await expect(budget).toHaveAttribute('style', /--vd-slider-fill: 100%/);
  });
});

test.describe('dropzone', () => {
  test('dropped files are checked, listed and written to the input', async ({ page }) => {
    await openGallery(page, 'dropzone');
    const zone = page.locator('label.vd-dropzone').first();
    const transfer = await page.evaluateHandle(() => {
      const dt = new DataTransfer();
      dt.items.add(new File(['png'], 'схема.png', { type: 'image/png' }));
      dt.items.add(new File(['exe'], 'setup.exe', { type: 'application/x-msdownload' }));
      dt.items.add(
        new File([new Uint8Array(3 * 1024 * 1024)], 'великий.pdf', { type: 'application/pdf' }),
      );
      return dt;
    });
    await zone.dispatchEvent('dragenter', { dataTransfer: transfer });
    await expect(zone).toHaveAttribute('data-dragover', '');
    await zone.dispatchEvent('drop', { dataTransfer: transfer });
    await expect(zone).not.toHaveAttribute('data-dragover');

    const files = page.getByRole('list', { name: 'Завантаження' });
    await expect(files.getByText('схема.png')).toBeVisible();
    await expect(page.getByText('setup.exe: непідтримуваний формат')).toBeVisible();
    await expect(page.getByText('великий.pdf: більше 2 МБ')).toBeVisible();
    const names = await zone
      .locator('input[type=file]')
      .evaluate((input: HTMLInputElement) => Array.from(input.files ?? []).map((f) => f.name));
    expect(names).toEqual(['схема.png']);
  });

  test('the hidden input is reachable with Tab and rings the zone', async ({ page }) => {
    await openGallery(page, 'dropzone');
    const zone = page.locator('label.vd-dropzone').first();
    const input = zone.locator('input[type=file]');
    await page.getByRole('link', { name: 'File upload', exact: true }).focus();
    // Tab from the nav into the page until the file input has focus.
    for (let i = 0; i < 20 && !(await input.evaluate((el) => el === document.activeElement)); i++) {
      await page.keyboard.press('Tab');
    }
    await expect(input).toBeFocused();
    expect(await zone.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid');
  });
});
