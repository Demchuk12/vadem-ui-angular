import { expect, test } from '@playwright/test';
import { openGallery } from './fixtures';

const addDays = (iso: string, days: number) => {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

test.describe('date picker', () => {
  test('an adjacent-month pointer click survives focus before activation', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-10-16T12:00:00Z'));
    await openGallery(page, 'calendar');
    const calendar = page.locator('vd-calendar:visible').first();
    await calendar.locator('[data-date="2026-11-01"]').click();
    await expect(calendar.locator('[data-date="2026-11-01"]')).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(calendar.locator('.vd-calendar__title')).toContainText('листопад');
    await page.setViewportSize({ width: 320, height: 900 });
    await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
    const previous = calendar.getByRole('button', { name: 'Попередній місяць', exact: true });
    await previous.focus();
    const ring = await previous.evaluate((el) => {
      const host = el.closest('vd-calendar')!.getBoundingClientRect();
      const button = el.getBoundingClientRect(),
        css = getComputedStyle(el);
      return {
        space: button.left - host.left,
        needed: parseFloat(css.outlineWidth) + parseFloat(css.outlineOffset),
      };
    });
    expect(ring.space).toBeGreaterThanOrEqual(ring.needed);
  });
  test('keyboard: open, move, choose; focus returns to the field', async ({ page }) => {
    await openGallery(page, 'calendar');
    const field = page.getByRole('textbox', { name: 'Дата доставки' });
    const open = page.getByRole('button', { name: 'Відкрити календар' }).first();
    await open.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Оберіть дату доставки' });
    await expect(dialog).toBeVisible();
    const focused = page.locator('td[role=gridcell]:focus');
    await expect(focused).toHaveCount(1);
    const start = (await focused.getAttribute('data-date'))!;
    // A week later is the same weekday, so it is available too.
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('td[role=gridcell]:focus')).toHaveAttribute(
      'data-date',
      addDays(start, 7),
    );
    await page.keyboard.press('Enter');
    await expect(dialog).toBeHidden();
    await expect(field).toBeFocused();
    const [y, m, d] = addDays(start, 7).split('-');
    await expect(field).toHaveValue(`${d}.${m}.${y}`);
    await expect(page.getByText(`value: ${addDays(start, 7)}`)).toBeVisible();
  });

  test('Escape closes the calendar without changing the value', async ({ page }) => {
    await openGallery(page, 'calendar');
    await page.getByRole('button', { name: 'Відкрити календар' }).first().click();
    const dialog = page.getByRole('dialog', { name: 'Оберіть дату доставки' });
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(page.getByText('value: null')).toBeVisible();
  });

  test('typed dates are parsed; unavailable ones show the field error', async ({ page }) => {
    await openGallery(page, 'calendar');
    const field = page.getByRole('textbox', { name: 'Дата доставки' });
    // A Saturday far enough ahead is inside min/max but disabled (weekends).
    const today = new Date();
    const sat = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + 14));
    sat.setUTCDate(sat.getUTCDate() + ((6 - sat.getUTCDay() + 7) % 7));
    const satText = `${sat.getUTCDate()}.${sat.getUTCMonth() + 1}.${sat.getUTCFullYear()}`;
    await field.fill(satText);
    await field.press('Tab');
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByText('Оберіть доступну робочу дату')).toBeVisible();

    const mon = new Date(sat);
    mon.setUTCDate(mon.getUTCDate() + 2);
    await field.fill(
      `${mon.getUTCDate()}.${mon.getUTCMonth() + 1}.${String(mon.getUTCFullYear()).slice(2)}`,
    );
    await field.press('Enter');
    await expect(field).not.toHaveAttribute('aria-invalid');
    await expect(page.getByText(`value: ${mon.toISOString().slice(0, 10)}`)).toBeVisible();
  });

  test('arrows are mirrored in an RTL calendar', async ({ page }) => {
    await openGallery(page, 'calendar');
    const rtl = page.locator('[dir=rtl] vd-calendar');
    const cell = rtl.locator('td[tabindex="0"]');
    const start = (await cell.getAttribute('data-date'))!;
    await cell.focus();
    await page.keyboard.press('ArrowLeft');
    await expect(rtl.locator('td[role=gridcell]:focus')).toHaveAttribute(
      'data-date',
      addDays(start, 1),
    );
  });
});
